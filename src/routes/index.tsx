import { createFileRoute, redirect } from "@tanstack/react-router";
import { AUTH_KEY } from "@/lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      try {
        const data = localStorage.getItem(AUTH_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          const role = parsed?.role;
          if (role === "admin") throw redirect({ to: "/admin" });
          if (role === "fleet-manager") throw redirect({ to: "/dashboard" });
          if (role === "safety-officer") throw redirect({ to: "/safety" });
          if (role === "financial-analyst") throw redirect({ to: "/finance" });
          if (role === "driver") throw redirect({ to: "/driver" });
        }
      } catch (e) {
        // Ignored
      }
    }
    throw redirect({ to: "/login" });
  },
import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, Navigation, ShieldCheck, DollarSign, ArrowRight, Phone, Database } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TransitOps — Smart Transport Operations Platform" },
      { name: "description", content: "Move beyond spreadsheets. Centralize fleet registry, driver compliance, automated trip dispatching, maintenance logs, and financial intelligence." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F4F3EE] text-[#2E2C26] font-sans selection:bg-[#C59B27]/30 relative overflow-hidden">
      {/* Background Soft Ambient Light Spheres */}
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] bg-[#C59B27]/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-[#7E7B72]/10 rounded-full blur-[200px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1E1C18] text-[#F5F5F3] border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-[5px] bg-[#C59B27]">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black uppercase tracking-wider text-[#F5F5F3]">TransitOps</span>
              <span className="block text-[8px] uppercase tracking-widest text-[#C59B27] font-bold">Smart Logistics Hub</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-widest text-[#D1CFC7]">
            <a href="#problem" className="hover:text-[#C59B27] transition-all">Overview</a>
            <a href="#roles" className="hover:text-[#C59B27] transition-all">Roles</a>
            <a href="#features" className="hover:text-[#C59B27] transition-all">Modules</a>
          </nav>

          <div className="flex items-center gap-6">
            <Link to="/login">
              <button className="bg-[#C59B27] hover:bg-[#b08920] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-[5px] transition-all duration-300">
                Client Portal
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-[#1E1C18] text-[#F5F5F3] min-h-[650px] flex items-center border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.jpg" 
            alt="TransitOps Hero Telemetry" 
            className="w-full h-full object-cover object-center scale-100 filter brightness-[0.25] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E1C18] via-[#1E1C18]/90 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-24 grid lg:grid-cols-12 gap-16 items-center w-full">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 bg-[#C59B27]/10 border border-[#C59B27]/20 px-4 py-2 rounded-[5px] text-[10px] font-bold uppercase tracking-widest text-[#C59B27]">
              End-to-End Fleet Integration
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] text-[#F5F5F3]">
              Ditch Spreadsheets. <br />
              <span className="text-[#C59B27]">Centralize Operations.</span>
            </h1>
            <p className="text-sm md:text-base text-[#D1CFC7] max-w-xl font-normal leading-relaxed">
              Logistics organizations still rely on manual logbooks, leading to scheduling conflicts and missed maintenance. TransitOps integrates vehicles, compliance checks, dispatch rules, and expense auditing on a single screen.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link to="/login">
                <button className="bg-[#C59B27] hover:bg-[#b08920] text-white font-extrabold uppercase tracking-widest text-xs px-8 py-4.5 rounded-[5px] transition-all duration-300 hover:translate-x-1 flex items-center gap-3">
                  Enter System Portal <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <a href="/UI_RULEBOOK.html" target="_blank">
                <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold uppercase tracking-widest text-xs px-8 py-4.5 rounded-[5px] transition-all">
                  Design Specifications
                </button>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            {/* Transparent Glassmorphic Widget - Soft Rounded 5px */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[5px] p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#C59B27]">Telemetry Sync Status</span>
                <span className="inline-flex items-center h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-[5px] border border-white/5">
                  <span className="text-xs text-gray-300 font-medium">Compliance Violations</span>
                  <span className="text-sm font-extrabold text-emerald-400">0 Alerts</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-[5px] border border-white/5">
                  <span className="text-xs text-gray-300 font-medium">Utilization Percentage</span>
                  <span className="text-sm font-extrabold text-[#C59B27]">98.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target User Roles Section - Behance/Staggered Style */}
      <section id="roles" className="bg-[#1E1C18] text-[#F5F5F3] py-32 border-b border-[#2D2D2D]/60 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#C59B27 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 items-center min-h-[600px]">
            {/* Center Section Title */}
            <div className="lg:col-span-4 space-y-6 lg:pr-8">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#C59B27] block">System Architecture</span>
              <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight leading-none text-[#F5F5F3]">
                Four Integrated <br />Target Roles
              </h2>
              <div className="w-16 h-1 bg-[#C59B27]" />
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                Each target user group interacts with a tailored subset of resources to maintain operational safety, expense control, and dispatch velocity.
              </p>
            </div>

            {/* Staggered Non-Linear Cards Layout */}
            <div className="lg:col-span-8 relative min-h-[580px] grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-12 pt-8">
              
              {/* Fleet Manager Card (Top-Left Position) */}
              <div className="relative group md:translate-y-[-15px] md:-translate-x-2">
                <div className="bg-[#FAF9F5] text-[#2E2C26] p-8 rounded-[5px] shadow-xl border border-white/10 min-h-[220px] flex flex-col justify-end pt-12 relative">
                  <div className="absolute -top-6 left-6 bg-[#32302A] text-white px-5 py-2.5 rounded-[5px] text-xs font-black uppercase tracking-wider border border-white/10 shadow-lg group-hover:border-[#C59B27] transition-colors">
                    Fleet Manager
                  </div>
                  <p className="text-xs text-[#7E7B72] leading-relaxed">
                    Oversees asset registry updates, active maintenance pipelines, and operational availability status checks.
                  </p>
                </div>
              </div>

              {/* Driver Card (Top-Right Position) */}
              <div className="relative group md:translate-y-[45px] md:translate-x-4">
                <div className="bg-[#FAF9F5] text-[#2E2C26] p-8 rounded-[5px] shadow-xl border border-white/10 min-h-[220px] flex flex-col justify-end pt-12 relative">
                  <div className="absolute -top-6 left-6 bg-[#32302A] text-white px-5 py-2.5 rounded-[5px] text-xs font-black uppercase tracking-wider border border-white/10 shadow-lg group-hover:border-[#C59B27] transition-colors">
                    Active Driver
                  </div>
                  <p className="text-xs text-[#7E7B72] leading-relaxed">
                    Logs active delivery progression coordinates, enters final odometer readings, and tracks fuel consumption metrics.
                  </p>
                </div>
              </div>

              {/* Safety Officer Card (Bottom-Left Position) */}
              <div className="relative group md:translate-y-[-30px] md:-translate-x-6">
                <div className="bg-[#FAF9F5] text-[#2E2C26] p-8 rounded-[5px] shadow-xl border border-white/10 min-h-[220px] flex flex-col justify-end pt-12 relative">
                  <div className="absolute -top-6 left-6 bg-[#32302A] text-white px-5 py-2.5 rounded-[5px] text-xs font-black uppercase tracking-wider border border-white/10 shadow-lg group-hover:border-[#C59B27] transition-colors">
                    Safety Officer
                  </div>
                  <p className="text-xs text-[#7E7B72] leading-relaxed">
                    Tracks license expiry alerts, evaluates operator safety scores, and restricts dispatch to suspended drivers.
                  </p>
                </div>
              </div>

              {/* Financial Analyst Card (Bottom-Right Position) */}
              <div className="relative group md:translate-y-[30px] md:translate-x-2">
                <div className="bg-[#FAF9F5] text-[#2E2C26] p-8 rounded-[5px] shadow-xl border border-white/10 min-h-[220px] flex flex-col justify-end pt-12 relative">
                  <div className="absolute -top-6 left-6 bg-[#32302A] text-white px-5 py-2.5 rounded-[5px] text-xs font-black uppercase tracking-wider border border-white/10 shadow-lg group-hover:border-[#C59B27] transition-colors">
                    Financial Analyst
                  </div>
                  <p className="text-xs text-[#7E7B72] leading-relaxed">
                    Reviews toll costs, logs liter/fuel purchases, and aggregates total operational parameters to compute vehicle ROI.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Functional Modules Section - 5px Rounded Grid */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-32 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-6">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#C59B27] block">Functional Modules</span>
            <h2 className="text-4xl font-extrabold uppercase tracking-tight leading-tight text-[#2E2C26]">Robust Fleet <br />Business Logic</h2>
            <div className="w-16 h-1 bg-[#C59B27]" />
            <p className="text-xs text-[#7E7B72] leading-relaxed">
              TransitOps enforces strict domain rules to guarantee safe operations: preventing double-booking of busy drivers and automatically transitioning status categories.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-10">
            <div className="grid sm:grid-cols-2 gap-8">
              {/* Card 01 */}
              <div className="bg-white border border-[#D1CFC7] p-8 rounded-[5px] flex flex-col justify-between hover:border-[#C59B27] transition-all duration-300 min-h-[260px]">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-[#EBE9E1] rounded-[5px] text-[#C59B27]">{<Navigation className="h-5 w-5" />}</div>
                    <span className="text-[10px] font-extrabold text-[#C59B27]/60 font-mono tracking-widest">01 / DISPATCH</span>
                  </div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#1F1F1F]">Trip Registry Validation</h3>
                  <p className="text-xs text-[#7E7B72] leading-relaxed">
                    Prevent scheduling vehicles if they exceed maximum load capacity limits. Block dispatched status transfers if selected operators are set to 'On Trip'.
                  </p>
                </div>
              </div>

              {/* Card 02 */}
              <div className="bg-[#1E1C18] border border-[#2D2D2D] p-8 rounded-[5px] flex flex-col justify-between hover:border-[#C59B27] transition-all duration-300 min-h-[260px] text-[#F5F5F3]">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-white/5 rounded-[5px] text-[#C59B27]">{<ShieldCheck className="h-5 w-5" />}</div>
                    <span className="text-[10px] font-extrabold text-[#C59B27]/60 font-mono tracking-widest">02 / LICENSING</span>
                  </div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#F5F5F3]">Compliance Audits</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Enforces blocks on drivers carrying expired driving credentials or marked as suspended. Prompts users when driver licenses approach expiry limits.
                  </p>
                </div>
              </div>

              {/* Card 03 */}
              <div className="bg-[#1E1C18] border border-[#2D2D2D] p-8 rounded-[5px] flex flex-col justify-between hover:border-[#C59B27] transition-all duration-300 min-h-[260px] text-[#F5F5F3]">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-white/5 rounded-[5px] text-[#C59B27]">{<Database className="h-5 w-5" />}</div>
                    <span className="text-[10px] font-extrabold text-[#C59B27]/60 font-mono tracking-widest">03 / LIFECYCLE</span>
                  </div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#F5F5F3]">Automated Workflows</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Adding vehicles to repair logs automatically locks their status category to 'In Shop', instantly filtering them out from any driver-side selection pool.
                  </p>
                </div>
              </div>

              {/* Card 04 */}
              <div className="bg-white border border-[#D1CFC7] p-8 rounded-[5px] flex flex-col justify-between hover:border-[#C59B27] transition-all duration-300 min-h-[260px]">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-[#EBE9E1] rounded-[5px] text-[#C59B27]">{<DollarSign className="h-5 w-5" />}</div>
                    <span className="text-[10px] font-extrabold text-[#C59B27]/60 font-mono tracking-widest">04 / LEDGER</span>
                  </div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#1F1F1F]">Operating Cost Calculus</h3>
                  <p className="text-xs text-[#7E7B72] leading-relaxed">
                    Aggregates fuel logging input (liters, cost per liter) and maintenance records to calculate total operational costs and vehicle return-on-investment parameters.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1E1C18] text-[#F5F5F3] border-t border-white/5 py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C59B27]/5 rounded-full blur-[180px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-8 space-y-8">
          <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight leading-none">Ready to Standardize Fleet Logistics?</h2>
          <p className="text-[#D1CFC7] max-w-md mx-auto text-xs leading-relaxed tracking-wider">
            Move beyond manual ledger tracking. Establish secure RBAC credentials, coordinate trips, and retrieve reports automatically.
          </p>
          <div className="pt-2">
            <Link to="/login">
              <button className="bg-[#C59B27] hover:bg-[#b08920] text-white font-extrabold uppercase tracking-widest text-xs px-12 py-5 rounded-[5px] transition-all duration-300 hover:translate-x-1 flex items-center gap-3 mx-auto">
                Access System Portal <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#12110E] text-[#7E7B72] border-t border-white/5 py-10 text-xs text-center relative z-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p>© 2026 TransitOps Systems. Digitizing transport logbooks under strict compliance.</p>
          <div className="flex gap-8 uppercase tracking-widest font-bold text-[10px]">
            <a href="/UI_RULEBOOK.html" target="_blank" className="hover:text-[#C59B27] transition-colors">UI System Guide</a>
            <a href="#" className="hover:text-[#C59B27] transition-colors">Security Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
