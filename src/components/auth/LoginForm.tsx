import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { Mail, ArrowLeft, LucideIcon, User } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "./PasswordInput";
import { AuthButton } from "./AuthButton";
import { useAuth, UserRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

const emailSchema = z.object({
  identifier: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
  remember: z.boolean().optional(),
});

const empIdSchema = z.object({
  identifier: z.string().min(3, "Enter a valid Employee ID"),
  password: z.string().min(6, "Minimum 6 characters"),
  remember: z.boolean().optional(),
});

const adminSchema = z.object({
  identifier: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters required for admin"),
  remember: z.boolean().optional(),
});

type FormValues = {
  identifier: string;
  password: string;
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
  identifierType = "email",
  theme = "default",
  colorClass = "bg-primary",
  buttonClass,
  isAdmin = false,
}: LoginFormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const isDark = theme === "dark";

  const schema = isAdmin ? adminSchema : identifierType === "email" ? emailSchema : empIdSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: defaultIdentifier, password: isAdmin ? "" : "demo1234", remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    
    // Mock login logic mapping to the requested role
    login(role, values.identifier);
    toast.success(`Welcome, ${title}`);
    navigate({ to: redirectUrl });
  };

  const InputIcon = identifierType === "email" ? Mail : User;
  const identifierLabel = identifierType === "email" ? (isAdmin ? "Admin ID" : "Email Address") : "Employee ID";

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
          "rounded-xl p-6 border shadow-sm",
          isDark ? "bg-zinc-900/50 border-zinc-800 backdrop-blur-sm" : "bg-card"
        )}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="relative">
              <InputIcon
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                  isDark ? "text-zinc-500" : "text-outline"
                )}
              />
              <Input
                id="identifier"
                type={identifierType === "email" ? "email" : "text"}
                className={cn(
                  "pl-9",
                  isDark && "bg-zinc-950 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                )}
                placeholder={defaultIdentifier || (identifierType === "email" ? "Enter email" : "Enter ID")}
                {...register("identifier")}
              />
            </div>
            {errors.identifier && (
              <p className={cn("text-xs", isDark ? "text-red-400 font-mono" : "text-destructive")}>
                {errors.identifier.message}
              </p>
            )}
          </div>

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
              <a
                href="#"
                className={cn(
                  "text-xs font-semibold hover:underline",
                  isDark ? "text-zinc-400" : "text-primary"
                )}
              >
                Forgot Password
              </a>
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
        </form>
      </section>
    </>
  );
}
