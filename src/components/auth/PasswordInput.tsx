import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  theme?: "default" | "dark";
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, theme = "default", ...props }, ref) => {
    const [showPw, setShowPw] = useState(false);
    const isDark = theme === "dark";

    return (
      <div className="relative">
        <Lock
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
            isDark ? "text-zinc-500" : "text-outline"
          )}
        />
        <Input
          type={showPw ? "text" : "password"}
          className={cn(
            "pl-9 pr-9",
            isDark && "bg-zinc-950 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100 placeholder:text-zinc-500",
            className
          )}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2",
            isDark ? "text-zinc-500 hover:text-zinc-300" : "text-outline hover:text-primary"
          )}
        >
          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
