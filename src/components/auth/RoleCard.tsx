import { Link } from "@tanstack/react-router";
import { ChevronRight, LucideIcon } from "lucide-react";

interface RoleCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  colorClass: string;
}

export function RoleCard({ title, description, icon: Icon, path, colorClass }: RoleCardProps) {
  return (
    <Link
      to={path}
      className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
