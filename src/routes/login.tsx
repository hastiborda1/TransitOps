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
import { authService } from "@/services/api";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const user = authService.getCurrentUser();
    if (user) {
      if (user.role === "admin") throw redirect({ to: "/admin" });
      if (user.role === "fleet-manager") throw redirect({ to: "/dashboard" });
      if (user.role === "safety-officer") throw redirect({ to: "/safety" });
      if (user.role === "financial-analyst") throw redirect({ to: "/finance" });
      if (user.role === "driver") throw redirect({ to: "/driver" });
      throw redirect({ to: "/dashboard" });
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
    color: "bg-[#C59B27]/10 text-[#C59B27] border-[#C59B27]/20",
    activeColor: "bg-[#C59B27] text-white border-[#C59B27]",
    defaultUser: "manager@transitops.com",
    defaultPass: "demo1234",
  },
  {
    id: "safety",
    title: "Safety",
    icon: ShieldCheck,
    color: "bg-[#C59B27]/10 text-[#C59B27] border-[#C59B27]/20",
    activeColor: "bg-[#C59B27] text-white border-[#C59B27]",
    defaultUser: "safety@transitops.com",
    defaultPass: "demo1234",
  },
  {
    id: "finance",
    title: "Finance",
    icon: PieChart,
    color: "bg-[#C59B27]/10 text-[#C59B27] border-[#C59B27]/20",
    activeColor: "bg-[#C59B27] text-white border-[#C59B27]",
    defaultUser: "finance@transitops.com",
    defaultPass: "demo1234",
  },
  {
    id: "driver",
    title: "Driver",
    icon: User,
    color: "bg-[#C59B27]/10 text-[#C59B27] border-[#C59B27]/20",
    activeColor: "bg-[#C59B27] text-white border-[#C59B27]",
    defaultUser: "driver@transitops.com",
    defaultPass: "demo1234",
  },
];

function UnifiedLoginPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>("manager");
  const [loading, setLoading] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const { login } = useAuth();

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
      toast.success("OTP verification code sent to your email!");
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
        navigate({ to: "/dashboard" });
      } else {
        const res = await authService.login(values.identifier, values.password || "");
        login(res.role, res.email, res.username || res.name || res.email);
        toast.success(`Welcome, ${res.username || res.name || res.email}`);
        navigate({ to: "/dashboard" });
      }
    } catch (e: any) {
      toast.error(e.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center mb-6">
        <div className="w-11 h-11 bg-[#C59B27] rounded-[5px] flex items-center justify-center mb-3 shadow-lg">
          <Truck className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground font-serif">Welcome to TransitOps</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Please sign in to continue</p>
      </div>

      <section className="bg-card rounded-[5px] p-5 border shadow-sm w-full max-w-[440px] mx-auto space-y-4">
        {/* Horizontal Role Selector Row */}
        <div className="flex flex-row gap-1.5 justify-between w-full p-1 bg-muted rounded-[5px]">
          {rolesConfig.map((role) => {
            const isActive = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-1.5 px-1 rounded-[5px] transition-all text-center ${
                  isActive ? "bg-card text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`w-7 h-7 rounded-[5px] flex items-center justify-center ${isActive ? role.color : "text-muted-foreground"}`}>
                  <role.icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-[9px] uppercase tracking-wider">{role.title}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* OTP Mode Switcher */}
          <div className="flex rounded-[5px] bg-muted p-1 text-xs">
            <button
              type="button"
              className={`flex-1 py-1 rounded-[5px] font-medium transition-all text-center ${
                !isOtpMode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
              onClick={() => setIsOtpMode(false)}
            >
              Password
            </button>
            <button
              type="button"
              className={`flex-1 py-1 rounded-[5px] font-medium transition-all text-center ${
                isOtpMode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
              onClick={() => setIsOtpMode(true)}
            >
              OTP Code
            </button>
          </div>

          {/* Identifier Input */}
          <div className="space-y-1.5">
            <Label htmlFor="identifier" className="text-xs uppercase tracking-wider text-muted-foreground">
              Email or Username
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="identifier" type="text" className="pl-12" placeholder="Enter credentials" {...register("identifier")} />
              </div>
              {isOtpMode && (
                <Button type="button" variant="outline" disabled={sendingOtp} onClick={handleSendOtp} className="shrink-0 rounded-[5px]">
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
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <Link to="/forgot-password" className="text-xs font-semibold hover:underline text-primary">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <PasswordInput id="password" className="pl-12" {...register("password")} />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="otp" className="text-xs uppercase tracking-wider text-muted-foreground">
                Verification OTP Code
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  className="pl-12 font-mono tracking-widest text-center text-lg"
                  placeholder="000000"
                  {...register("otp")}
                />
              </div>
              {errors.otp && <p className="text-xs text-destructive">{errors.otp.message}</p>}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox id="remember" checked={!!watch("remember")} onCheckedChange={(c) => setValue("remember", !!c)} />
            <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-muted-foreground">
              Remember Me
            </Label>
          </div>

          <AuthButton label="Sign In" loading={loading} />

          <div className="text-center text-sm pt-4 border-t border-muted/50">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </div>
        </form>
      </section>

      <div className="mt-6 flex justify-center">
        <Link to="/admin/login">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-xs rounded-[5px]">
            <ShieldAlert className="w-4 h-4 mr-1.5" />
            Administrator Login
          </Button>
        </Link>
      </div>

      <footer className="mt-8 text-center space-y-2">
        <p className="text-xs text-muted-foreground">© 2026 TransitOps Systems. Digitizing transport logbooks under strict compliance.</p>
        <div className="flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wider">
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Security Policy</a>
        </div>
      </footer>
    </AuthLayout>
  );
}
