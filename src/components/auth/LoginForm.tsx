import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { Mail, ArrowLeft, LucideIcon, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "./PasswordInput";
import { AuthButton } from "./AuthButton";
import { useAuth, UserRole } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { authService } from "@/services/api";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or Employee ID is required"),
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

interface LoginFormProps {
  role: UserRole;
  title: string;
  icon: LucideIcon;
  redirectUrl: string;
  defaultIdentifier: string;
  identifierType?: "email" | "employee_id";
  theme?: "default" | "dark";
  colorClass?: string;
  buttonClass?: string;
  isAdmin?: boolean;
}

export function LoginForm({
  role,
  title,
  icon: Icon,
  redirectUrl,
  defaultIdentifier,
  theme = "default",
  colorClass = "bg-primary",
  buttonClass,
  isAdmin = false,
}: LoginFormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const isDark = theme === "dark";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: defaultIdentifier, password: isAdmin ? "" : "demo1234", otp: "", remember: true },
  });

  const watchEmail = watch("identifier");

  // Google Login Integration
  useEffect(() => {
    const btnContainer = document.getElementById("google-signin-btn");
    if (!btnContainer) return;

    const initializeGoogle = () => {
      if (window.google && btnContainer) {
        window.google.accounts.id.initialize({
          client_id: "901970136857-g9taqknvcb75apssmtt91ftqoluoterh.apps.googleusercontent.com",
          callback: handleGoogleLogin,
        });
        window.google.accounts.id.renderButton(
          btnContainer,
          { theme: isDark ? "dark" : "outline", size: "large", width: 380 }
        );
      }
    };

    if (window.google) {
      initializeGoogle();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [isDark]);

  const handleGoogleLogin = async (response: any) => {
    setLoading(true);
    try {
      const res = await authService.googleLogin(response.credential, role || "manager");
      login(res.role, res.email);
      toast.success(`Welcome back, ${res.name}`);
      navigate({ to: redirectUrl });
    } catch (e: any) {
      toast.error(e.message || "Google Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const email = watchEmail;
    if (!email || !z.string().email().safeParse(email).success) {
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
      if (!values.password || values.password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isOtpMode) {
        const res = await authService.verifyOtp(values.identifier, values.otp || "", role || "driver");
        login(res.role, res.email);
        toast.success(`Welcome, ${res.username || res.name}`);
        navigate({ to: redirectUrl });
      } else {
        const res = await authService.login(values.identifier, values.password || "");
        login(res.role, res.email);
        toast.success(`Welcome, ${res.username || res.name}`);
        navigate({ to: redirectUrl });
      }
    } catch (e: any) {
      toast.error(e.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const InputIcon = Mail;
  const identifierLabel = isAdmin ? "Admin ID" : "Email Address";

  return (
    <>
      <Link
        to="/login"
        className={cn(
          "inline-flex items-center text-sm font-medium mb-6 transition-colors",
          isDark ? "text-zinc-400 hover:text-zinc-100" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> {isAdmin ? "Back to Role Selection" : "Back"}
      </Link>
      
      <div className="flex flex-col items-center mb-8">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg",
            isDark ? "bg-zinc-900 border border-zinc-800" : colorClass
          )}
        >
          <Icon className={cn("h-7 w-7", isDark ? "text-zinc-400" : "text-white")} />
        </div>
        <h1 className={cn("text-2xl font-bold tracking-tight", isDark ? "text-white font-mono" : "text-foreground")}>
          {title}
        </h1>
        <p className={cn("text-sm mt-1", isDark ? "text-zinc-500 font-mono uppercase tracking-widest" : "text-muted-foreground")}>
          {isAdmin ? "Restricted Access" : "TransitOps Sign In"}
        </p>
      </div>

      <section
        className={cn(
          "rounded-xl p-6 border shadow-sm w-full max-w-[440px] mx-auto",
          isDark ? "bg-zinc-900/50 border-zinc-800 backdrop-blur-sm" : "bg-card"
        )}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* OTP Mode Switcher */}
          {!isAdmin && (
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
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="identifier"
              className={cn(
                "text-xs uppercase tracking-wider",
                isDark ? "text-zinc-500 font-mono" : "text-muted-foreground"
              )}
            >
              {identifierLabel}
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <InputIcon
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                    isDark ? "text-zinc-500" : "text-outline"
                  )}
                />
                <Input
                  id="identifier"
                  type="email"
                  className={cn(
                    "pl-9",
                    isDark && "bg-zinc-950 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  )}
                  placeholder="Enter email"
                  {...register("identifier")}
                />
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
            {errors.identifier && (
              <p className={cn("text-xs", isDark ? "text-red-400 font-mono" : "text-destructive")}>
                {errors.identifier.message}
              </p>
            )}
          </div>

          {!isOtpMode ? (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label
                  htmlFor="password"
                  className={cn(
                    "text-xs uppercase tracking-wider",
                    isDark ? "text-zinc-500 font-mono" : "text-muted-foreground"
                  )}
                >
                  {isAdmin ? "Passkey" : "Password"}
                </Label>
                <Link
                  to="/forgot-password"
                  className={cn(
                    "text-xs font-semibold hover:underline",
                    isDark ? "text-zinc-400" : "text-primary"
                  )}
                >
                  Forgot Password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                theme={theme}
                {...register("password")}
              />
              {errors.password && (
                <p className={cn("text-xs", isDark ? "text-red-400 font-mono" : "text-destructive")}>
                  {errors.password.message}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label
                htmlFor="otp"
                className={cn(
                  "text-xs uppercase tracking-wider",
                  isDark ? "text-zinc-500 font-mono" : "text-muted-foreground"
                )}
              >
                Verification OTP Code
              </Label>
              <div className="relative">
                <KeyRound
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                    isDark ? "text-zinc-500" : "text-outline"
                  )}
                />
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  className={cn(
                    "pl-9 font-mono tracking-widest text-center text-lg",
                    isDark && "bg-zinc-950 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  )}
                  placeholder="000000"
                  {...register("otp")}
                />
              </div>
              {errors.otp && (
                <p className={cn("text-xs", isDark ? "text-red-400 font-mono" : "text-destructive")}>
                  {errors.otp.message}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={!!watch("remember")}
              onCheckedChange={(c) => setValue("remember", !!c)}
              className={isDark ? "border-zinc-700 data-[state=checked]:bg-zinc-100 data-[state=checked]:text-zinc-900" : ""}
            />
            <Label
              htmlFor="remember"
              className={cn(
                "text-sm font-normal cursor-pointer",
                isDark ? "text-zinc-400" : "text-muted-foreground"
              )}
            >
              Remember Me
            </Label>
          </div>

          <AuthButton
            label="Sign In"
            loading={loading}
            className={cn(
              isDark && "bg-zinc-100 text-zinc-900 hover:bg-white font-semibold shadow-lg shadow-zinc-100/10",
              buttonClass
            )}
          />

          {!isAdmin && (
            <>
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted-foreground/20"></div>
                </div>
                <span className="relative px-3 text-xs uppercase bg-card text-muted-foreground">Or</span>
              </div>

              {/* Google login container */}
              <div className="flex justify-center w-full min-h-[44px]">
                <div id="google-signin-btn" className="w-full"></div>
              </div>

              <div className="text-center text-sm pt-4">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/signup" className="font-semibold text-primary hover:underline">
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </form>
      </section>
    </>
  );
}
