import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Truck, Mail, KeyRound, ArrowLeft, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { authService } from "@/services/api";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — TransitOps" },
      { name: "description", content: "Reset your TransitOps account password." },
    ],
  }),
  component: ForgotPasswordPage,
});

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const resetSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    otp: z.string().length(6, "OTP code must be exactly 6 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ForgotFormValues = {
  email: string;
};

type ResetFormValues = {
  email: string;
  otp: string;
  password?: string;
  confirmPassword?: string;
};

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: errorsForgot },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: errorsReset },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "", otp: "", password: "", confirmPassword: "" },
  });

  const onForgotSubmit = async (values: ForgotFormValues) => {
    setLoading(true);
    try {
      await authService.forgotPassword(values.email);
      setSubmittedEmail(values.email);
      toast.success("Verification code sent to your email!");
      setStep(2);
    } catch (e: any) {
      toast.error(e.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (values: ResetFormValues) => {
    setLoading(true);
    try {
      await authService.resetPassword(values.email, values.otp, values.password);
      toast.success("Password reset successfully! Please log in.");
      navigate({ to: "/login" });
    } catch (e: any) {
      toast.error(e.message || "Invalid code or failed to reset password.");
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {step === 1 ? "Forgot Password" : "Reset Password"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {step === 1 ? "Get a verification code to reset" : "Enter verification code and choose new password"}
        </p>
      </div>

      <section className="bg-card rounded-xl p-6 border shadow-sm w-full max-w-[440px] mx-auto">
        {step === 1 ? (
          <form onSubmit={handleSubmitForgot(onForgotSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                <Input id="email" type="email" placeholder="e.g. john@company.com" {...registerForgot("email")} />
              </div>
              {errorsForgot.email && <p className="text-xs text-destructive">{errorsForgot.email.message}</p>}
            </div>

            <AuthButton label="Send Reset Code" loading={loading} />
          </form>
        ) : (
          <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="resetEmail" className="text-xs uppercase tracking-wider text-muted-foreground">
                Confirm Email *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="Confirm email address"
                  defaultValue={submittedEmail}
                  {...registerReset("email")}
                />
              </div>
              {errorsReset.email && <p className="text-xs text-destructive">{errorsReset.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="otp" className="text-xs uppercase tracking-wider text-muted-foreground">
                Verification Reset Code *
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  className="pl-9 font-mono tracking-widest text-center text-lg"
                  placeholder="000000"
                  {...registerReset("otp")}
                />
              </div>
              {errorsReset.otp && <p className="text-xs text-destructive">{errorsReset.otp.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                New Password *
              </Label>
              <PasswordInput id="password" {...registerReset("password")} />
              {errorsReset.password && <p className="text-xs text-destructive">{errorsReset.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider text-muted-foreground">
                Confirm Password *
              </Label>
              <PasswordInput id="confirmPassword" {...registerReset("confirmPassword")} />
              {errorsReset.confirmPassword && (
                <p className="text-xs text-destructive">{errorsReset.confirmPassword.message}</p>
              )}
            </div>

            <AuthButton label="Reset Password" loading={loading} />
          </form>
        )}
      </section>
    </AuthLayout>
  );
}
