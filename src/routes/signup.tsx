import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Truck, Mail, User, KeyRound, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { AuthButton } from "@/components/auth/AuthButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { authService } from "@/services/api";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — TransitOps" },
      { name: "description", content: "Create your TransitOps account." },
    ],
  }),
  component: SignupPage,
});

const signupSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Enter a valid email address"),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
    role: z.enum(["manager", "driver", "safety", "finance"]),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      otp: "",
      role: "driver",
      password: "",
      confirmPassword: "",
    },
  });

  const watchRole = watch("role");
  const watchEmail = watch("email");

  const handleSendOtp = async () => {
    const email = getValues("email");
    if (!email || !z.string().email().safeParse(email).success) {
      toast.error("Please enter a valid email address first.");
      return;
    }

    setSendingOtp(true);
    try {
      await authService.sendOtp(email);
      setOtpSent(true);
      toast.success("OTP verification code sent to your email!");
    } catch (e: any) {
      toast.error(e.message || "Failed to send OTP code");
    } finally {
      setSendingOtp(false);
    }
  };

  const onSubmit = async (values: SignupFormValues) => {
    setLoading(true);
    try {
      // 1. Verify OTP first
      await authService.verifyOtp(values.email, values.otp, values.role);
      
      // 2. Complete registration
      const res = await authService.register(values.username, values.email, values.password, values.role);
      
      login(res.role, res.email, res.username || res.email);
      toast.success("Account created successfully!");
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e.message || "Sign up failed. Please check details or verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, text: "Sign Up Account", active: true },
    { number: 2, text: "Set Up Workspace", active: false },
    { number: 3, text: "Set Up Profile", active: false }
  ];

  return (
    <AuthLayout
      heading="Get Started with Us"
      subheading="Complete these easy steps to register your account and centralize your logistics workflow."
      steps={steps}
    >
      <div className="flex flex-col items-center mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white font-serif">Sign Up Account</h1>
        <p className="text-xs text-[#7E7B72] mt-1">Enter your personal data to create your account.</p>
      </div>

      <section className="bg-[#12110E] rounded-[5px] p-6 border border-white/5 shadow-2xl w-full mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs uppercase tracking-wider text-[#7E7B72]">
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7E7B72]" />
              <Input id="username" className="pl-12 bg-white/5 border-white/10 text-white focus-visible:bg-[#12110E]" placeholder="e.g. johndoe" {...register("username")} />
            </div>
            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
          </div>

          {/* Email Address & Send OTP Button */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider text-[#7E7B72]">
              Email Address
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7E7B72]" />
                <Input id="email" type="email" className="pl-12 bg-white/5 border-white/10 text-white focus-visible:bg-[#12110E]" placeholder="e.g. john@company.com" {...register("email")} />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={sendingOtp || !watchEmail}
                onClick={handleSendOtp}
                className="shrink-0 bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
              >
                {sendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : otpSent ? "Resend" : "Send OTP"}
              </Button>
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          {/* Verification Code */}
          <div className="space-y-1.5">
            <Label htmlFor="otp" className="text-xs uppercase tracking-wider text-[#7E7B72]">
              Email Verification Code (OTP)
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7E7B72]" />
              <Input
                id="otp"
                type="text"
                maxLength={6}
                className="pl-12 font-mono tracking-widest text-center text-lg bg-white/5 border-white/10 text-white focus-visible:bg-[#12110E]"
                placeholder="000000"
                {...register("otp")}
              />
            </div>
            {errors.otp && <p className="text-xs text-destructive">{errors.otp.message}</p>}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-xs uppercase tracking-wider text-[#7E7B72]">
              Account Role
            </Label>
            <Select value={watchRole} onValueChange={(v) => setValue("role", v as any)}>
              <SelectTrigger id="role" className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent className="bg-[#12110E] border-white/10 text-white">
                <SelectItem value="manager">Fleet Manager</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
                <SelectItem value="safety">Safety Officer</SelectItem>
                <SelectItem value="finance">Financial Analyst</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs uppercase tracking-wider text-[#7E7B72]">
              Password
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7E7B72] z-10" />
              <PasswordInput id="password" className="pl-12 bg-white/5 border-white/10 text-white" {...register("password")} />
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider text-[#7E7B72]">
              Confirm Password
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7E7B72] z-10" />
              <PasswordInput id="confirmPassword" className="pl-12 bg-white/5 border-white/10 text-white" {...register("confirmPassword")} />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <AuthButton label="Sign Up" loading={loading} />

          <div className="text-center text-sm pt-3 border-t border-white/5">
            <span className="text-[#7E7B72]">Already have an account? </span>
            <Link to="/login" className="font-semibold text-[#C59B27] hover:underline">
              Log in
            </Link>
          </div>
        </form>
      </section>
    </AuthLayout>
  );
}
