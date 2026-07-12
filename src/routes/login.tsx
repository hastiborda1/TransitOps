import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Truck, ShieldCheck, PieChart, User, Mail, KeyRound, Loader2, ShieldAlert, Lock } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/lib/auth";
import { authService } from "@/services/api";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const user = authService.getCurrentUser();
    if (user) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Sign In — TransitOps" },
      { name: "description", content: "Sign in to your TransitOps account." },
    ],
  }),
  component: UnifiedLoginPage,
});

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or Username is required"),
  password: z.string().optional(),
  otp: z.string().optional(),
  remember: z.boolean().optional(),
});

type FormValues = {
  identifier: string;
  password?: string;
  otp?: string;
  remember?: boolean;
};

const rolesConfig = [
  {
    id: "manager",
    title: "Manager",
    icon: Truck,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    activeColor: "bg-blue-500 text-white border-blue-500",
    defaultUser: "manager@transitops.com",
    defaultPass: "demo1234",
  },
  {
    id: "safety",
    title: "Safety",
    icon: ShieldCheck,
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    activeColor: "bg-emerald-500 text-white border-emerald-500",
    defaultUser: "safety@transitops.com",
    defaultPass: "demo1234",
  },
  {
    id: "finance",
    title: "Finance",
    icon: PieChart,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    activeColor: "bg-purple-500 text-white border-purple-500",
    defaultUser: "finance@transitops.com",
    defaultPass: "demo1234",
  },
  {
    id: "driver",
    title: "Driver",
    icon: User,
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    activeColor: "bg-orange-500 text-white border-orange-500",
    defaultUser: "driver@transitops.com",
    defaultPass: "demo1234",
  },
];

function UnifiedLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>("manager");
  const [loading, setLoading] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);


  const activeRoleConfig = rolesConfig.find((r) => r.id === selectedRole) || rolesConfig[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>(({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: activeRoleConfig.defaultUser,
      password: activeRoleConfig.defaultPass,
      otp: "",
      remember: true,
    },
  }) as any);

  // Automatically update input fields when role changes
  useEffect(() => {
    setValue("identifier", activeRoleConfig.defaultUser);
    setValue("password", activeRoleConfig.defaultPass);
  }, [selectedRole, setValue, activeRoleConfig]);

  const watchEmail = watch("identifier");

  const handleSendOtp = async () => {
    const email = watchEmail;
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address first.");
      return;
    }

    setSendingOtp(true);
    try {
      await authService.sendOtp(email);
      toast.success("OTP verification code sent! Enter 123456 to bypass.");
    } catch (e: any) {
      toast.error(e.message || "Failed to send OTP code");
    } finally {
      setSendingOtp(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (isOtpMode) {
      if (!values.identifier || !values.identifier.includes("@")) {
        toast.error("A valid email address is required to sign in with OTP.");
        return;
      }
      if (!values.otp || values.otp.length !== 6) {
        toast.error("Verification code must be exactly 6 digits.");
        return;
      }
    } else {
      if (!values.password || values.password.length < 4) {
        toast.error("Password must be at least 4 characters.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isOtpMode) {
        const res = await authService.verifyOtp(values.identifier, values.otp || "", selectedRole);
        login(res.role, res.email, res.username || res.name || res.email);
        toast.success(`Welcome, ${res.username || res.name || res.email}`);
        
        const targetUrl = 
          res.role === "admin" ? "/admin" :
          res.role === "fleet-manager" ? "/dashboard" :
          res.role === "safety-officer" ? "/safety-driver" :
          res.role === "financial-analyst" ? "/financial-analyst" :
          res.role === "driver" ? "/driver" : "/dashboard";
          
        navigate({ to: targetUrl });
      } else {
        const res = await authService.login(values.identifier, values.password || "");
        login(res.role, res.email, res.username || res.name || res.email);
        toast.success(`Welcome, ${res.username || res.name || res.email}`);
        
        const targetUrl = 
          res.role === "admin" ? "/admin" :
          res.role === "fleet-manager" ? "/dashboard" :
          res.role === "safety-officer" ? "/safety-driver" :
          res.role === "financial-analyst" ? "/financial-analyst" :
          res.role === "driver" ? "/driver" : "/dashboard";
          
        navigate({ to: targetUrl });
      }
    } catch (e: any) {
      toast.error(e.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, text: "Select Role", active: true },
    { number: 2, text: "Authenticate", active: true },
    { number: 3, text: "Access Hub", active: false }
  ];

  return (
    <AuthLayout
      heading="Welcome Back to the Hub"
      subheading="Centralize your fleet logs, driver compliance checks, and automated trip schedules."
      steps={steps}
    >
      <div className="flex flex-col items-center mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white font-serif">Sign In Account</h1>
        <p className="text-xs text-[#7E7B72] mt-1">Please enter your credentials to authenticate</p>
      </div>

      <section className="bg-[#12110E] rounded-[5px] p-6 border border-white/5 shadow-2xl w-full mx-auto space-y-4">
        {/* Horizontal Role Selector Row */}
        <div className="flex flex-row gap-1.5 justify-between w-full p-1 bg-white/5 rounded-[5px]">
          {rolesConfig.map((role) => {
            const isActive = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-1.5 px-1 rounded-[5px] transition-all text-center ${
                  isActive ? "bg-white/10 text-white shadow-sm font-semibold" : "text-[#7E7B72] hover:text-[#F5F5F3]"
                }`}
              >
                <div className={`w-7 h-7 rounded-[5px] flex items-center justify-center ${isActive ? "text-[#C59B27]" : "text-[#7E7B72]"}`}>
                  <role.icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-[9px] uppercase tracking-wider">{role.title}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* OTP Mode Switcher */}
          <div className="flex rounded-[5px] bg-white/5 p-1 text-xs">
            <button
              type="button"
              className={`flex-1 py-1 rounded-[5px] font-medium transition-all text-center ${
                !isOtpMode ? "bg-white/10 text-white shadow-sm" : "text-[#7E7B72]"
              }`}
              onClick={() => setIsOtpMode(false)}
            >
              Password
            </button>
            <button
              type="button"
              className={`flex-1 py-1 rounded-[5px] font-medium transition-all text-center ${
                isOtpMode ? "bg-white/10 text-white shadow-sm" : "text-[#7E7B72]"
              }`}
              onClick={() => setIsOtpMode(true)}
            >
              OTP Code
            </button>
          </div>

          {/* Identifier Input */}
          <div className="space-y-1.5">
            <Label htmlFor="identifier" className="text-xs uppercase tracking-wider text-[#7E7B72]">
              Email or Username
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7E7B72]" />
                <Input id="identifier" type="text" className="pl-12 bg-white/5 border-white/10 text-white focus-visible:bg-[#12110E]" placeholder="Enter credentials" {...register("identifier")} />
              </div>
              {isOtpMode && (
                <Button type="button" variant="outline" disabled={sendingOtp} onClick={handleSendOtp} className="shrink-0 rounded-[5px] bg-white/5 border-white/10 text-white hover:bg-white/10">
                  {sendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
                </Button>
              )}
            </div>
            {errors.identifier && <p className="text-xs text-destructive">{errors.identifier.message}</p>}
          </div>

          {/* Password or OTP Input */}
          {!isOtpMode ? (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-[#7E7B72]">
                  Password
                </Label>
                <Link to="/forgot-password" className="text-xs font-semibold hover:underline text-[#C59B27]">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7E7B72]" />
                <PasswordInput id="password" className="pl-12 bg-white/5 border-white/10 text-white" {...register("password")} />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="otp" className="text-xs uppercase tracking-wider text-[#7E7B72]">
                Verification OTP Code
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
          )}

          <div className="flex items-center gap-2">
            <Checkbox id="remember" className="border-white/20 data-[state=checked]:bg-[#C59B27]" checked={!!watch("remember")} onCheckedChange={(c) => setValue("remember", !!c)} />
            <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-[#7E7B72]">
              Remember Me
            </Label>
          </div>

          <AuthButton label="Sign In" loading={loading} />

          <div className="text-center text-sm pt-4 border-t border-white/5">
            <span className="text-[#7E7B72]">Don't have an account? </span>
            <Link to="/signup" className="font-semibold text-[#C59B27] hover:underline">
              Sign Up
            </Link>
          </div>
        </form>
      </section>

      <div className="mt-6 flex justify-center">
        <Link to="/admin/login">
          <Button variant="ghost" className="text-[#7E7B72] hover:text-[#F5F5F3] hover:bg-white/5 text-xs rounded-[5px]">
            <ShieldAlert className="w-4 h-4 mr-1.5" />
            Administrator Login
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
