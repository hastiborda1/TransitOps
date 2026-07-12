import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface AuthButtonProps extends ComponentProps<typeof Button> {
  loading?: boolean;
  label: string;
}

export function AuthButton({ loading, label, className, ...props }: AuthButtonProps) {
  return (
    <Button
      type="submit"
      size="lg"
      className={cn("w-full shadow-md", className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {label} <ArrowRight className="h-4 w-4 ml-2" />
        </>
      )}
    </Button>
  );
}
