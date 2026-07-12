import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, ShieldCheck, PieChart, User, ShieldAlert } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RoleCard } from "@/components/auth/RoleCard";
import { Button } from "@/components/ui/button";
<<<<<<< Updated upstream
=======
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authService } from "@/services/api";
>>>>>>> Stashed changes

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Select Role — TransitOps" },
      { name: "description", content: "Select your role to sign in." },
    ],
  }),
  component: LoginSelectionPage,
});

<<<<<<< Updated upstream
const roles = [
  {
    id: "fleet-manager",
    title: "Fleet Manager",
    description: "Manage vehicles, drivers, and dispatch trips.",
    icon: Truck,
    path: "/login/fleet-manager",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "safety-officer",
    title: "Safety Officer",
    description: "Review safety scores and compliance.",
    icon: ShieldCheck,
    path: "/login/safety-officer",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    id: "financial-analyst",
    title: "Financial Analyst",
    description: "Analyze expenses and ROI.",
    icon: PieChart,
    path: "/login/financial-analyst",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    id: "driver",
    title: "Driver",
    description: "View trips and log fuel.",
    icon: User,
    path: "/login/driver",
    color: "bg-orange-500/10 text-orange-500",
  },
];
=======
const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

function LoginPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "manager@transitops.com", password: "demo1234", remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await authService.login(values.email, values.password);
      setLoading(false);
      toast.success("Welcome back to TransitOps");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || "Invalid credentials");
    }
  };
>>>>>>> Stashed changes

function LoginSelectionPage() {
  return (
    <AuthLayout>
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
          <Truck className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome to TransitOps</h1>
        <p className="text-sm text-muted-foreground mt-1">Please select your role to sign in</p>
      </div>

      <section className="bg-card rounded-xl p-2 border shadow-sm flex flex-col gap-2">
        {roles.map((role) => (
          <RoleCard key={role.id} {...role} colorClass={role.color} />
        ))}
      </section>
      
      <div className="mt-8 flex justify-center">
        <Link to="/admin/login">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            <ShieldAlert className="w-4 h-4 mr-2" />
            Administrator Login
          </Button>
        </Link>
      </div>

      <footer className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">© 2026 TransitOps Logistics Systems. All rights reserved.</p>
      </footer>
    </AuthLayout>
  );
}
