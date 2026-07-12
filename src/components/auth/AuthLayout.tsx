import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  theme?: "default" | "dark";
}

export function AuthLayout({ children, theme = "default" }: AuthLayoutProps) {
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        isDark
          ? "bg-zinc-950 text-zinc-50"
          : "bg-[radial-gradient(at_0%_0%,color-mix(in_oklch,var(--primary)_18%,transparent)_0,transparent_50%),radial-gradient(at_100%_100%,color-mix(in_oklch,var(--secondary-container)_35%,transparent)_0,transparent_50%)] bg-background"
      }`}
    >
      <main className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </main>
    </div>
  );
}
