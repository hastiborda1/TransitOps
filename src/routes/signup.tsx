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

const signupPasswordSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
    role: z.enum(["manager", "driver", "safety", "finance"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const signupOtpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Enter a valid email address"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  role: z.enum(["manager", "driver", "safety", "finance"]),
});

type SignupFormValues = {
  username: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
  role: "manager" | "driver" | "safety" | "finance";
};

function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const schema = isOtpMode ? signupOtpSchema : signupPasswordSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      otp: "",
      role: "driver",
    },
  });

  const watchRole = watch("role");

  const handleSendOtp = async () => {
    const email = getValues("email");
    if (!email || !z.string().email().safeParse(email).success) {
      toast.error("Please enter a valid email address first.");
      return;
    }

    setSendingOtp(true);
    try {
      await authService.sendOtp(email);
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
      if (isOtpMode) {
        // Verify code and log in
        const res = await authService.verifyOtp(values.email, values.otp || "", values.role);
        
        // Update user profile fields (username, role)
        await authService.register(values.username, values.email, "demo1234", values.role);
        
        login(values.role, values.email);
        toast.success("Account created successfully!");
        navigate({ to: "/dashboard" });
      } else {
        const res = await authService.register(values.username, values.email, values.password, values.role);
        login(res.role, res.email);
        toast.success("Account created successfully!");
        navigate({ to: "/dashboard" });
      }
    } catch (e: any) {
      toast.error(e.message || "Sign up failed. Please check details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Link
        to="/login"
        className="inline-flex items-center text-sm font-medium mb-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Link>

      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
          <Truck className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Account</h1>
        <p className="text-sm text-muted-foreground mt-1">Get started with TransitOps</p>
      </div>

      <section className="bg-card rounded-xl p-6 border shadow-sm w-full max-w-[440px] mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="flex rounded-lg bg-muted p-1 text-sm mb-4">
            <button
              type="button"
              className={cn("flex-1 py-1.5 rounded-md font-medium transition-all text-center", !isOtpMode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
              onClick={() => setIsOtpMode(false)}
            >
              Password
            </button>
            <button
              type="button"
              className={cn("flex-1 py-1.5 rounded-md font-medium transition-all text-center", isOtpMode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
              onClick={() => setIsOtpMode(true)}
            >
              OTP Code
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs uppercase tracking-wider text-muted-foreground">
              Username *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
              <Input id="username" placeholder="e.g. johndoe" {...register("username")} />
            </div>
            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
              Email Address *
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                <Input id="email" type="email" placeholder="e.g. john@company.com" {...register("email")} />
              </div>
              {isOtpMode && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={sendingOtp}
                  onClick={handleSendOtp}
                  className="shrink-0"
                >
                  {sendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
                </Button>
              )}
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-xs uppercase tracking-wider text-muted-foreground">
              Account Role *
            </Label>
            <Select value={watchRole} onValueChange={(v) => setValue("role", v as any)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Fleet Manager</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
                <SelectItem value="safety">Safety Officer</SelectItem>
                <SelectItem value="finance">Financial Analyst</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>

          {!isOtpMode ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Password *
                </Label>
                <PasswordInput id="password" {...register("password")} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Confirm Password *
                </Label>
                <PasswordInput id="confirmPassword" {...register("confirmPassword")} />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="otp" className="text-xs uppercase tracking-wider text-muted-foreground">
                Verification OTP Code *
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  className="pl-9 font-mono tracking-widest text-center text-lg"
                  placeholder="000000"
                  {...register("otp")}
                />
              </div>
              {errors.otp && <p className="text-xs text-destructive">{errors.otp.message}</p>}
            </div>
          )}

          <AuthButton label="Sign Up" loading={loading} />

          <div className="text-center text-sm pt-4">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </section>
    </AuthLayout>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
