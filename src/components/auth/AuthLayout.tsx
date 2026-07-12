import { ReactNode } from "react";
import { Truck, Linkedin, Mail, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface AuthLayoutProps {
  children: ReactNode;
  heading?: string;
  subheading?: string;
  steps?: { number: number; text: string; active: boolean }[];
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F0E0C] text-[#F5F5F3] font-sans selection:bg-[#C59B27]/30">
      {/* Main split content area using cols grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        
        {/* Left Side: Image of highway (wider: 7 cols out of 12) */}
        <div className="relative w-full lg:col-span-7 min-h-[300px] lg:min-h-0 flex flex-col justify-between p-8 lg:p-12">
          {/* Background Highway Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('/highway_logistics_bg.jpg')` }}
          />
          {/* Dark Overlay for readability and premium look */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0C] via-[#0F0E0C]/40 to-[#0F0E0C]/75 pointer-events-none" />

          {/* Logo / Header */}
          <Link to="/" className="relative z-10 flex items-center gap-3 w-fit">
            <div className="grid h-10 w-10 place-items-center rounded-[5px] bg-[#C59B27] shadow-lg">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black uppercase tracking-wider text-[#F5F5F3] font-serif">TransitOps</span>
              <span className="block text-[8px] uppercase tracking-widest text-[#C59B27] font-bold">Smart Logistics Hub</span>
            </div>
          </Link>

          {/* Small subtle "welcome" message at the bottom of the image */}
          <div className="relative z-10 mt-auto pt-16">
            <p className="text-[10px] uppercase tracking-widest text-[#C59B27] font-extrabold mb-1">Transit & Logistics platform</p>
            <h2 className="text-3xl lg:text-4xl font-serif font-black uppercase tracking-tight text-white leading-tight">
              WELCOME TO THE HUB.
            </h2>
          </div>
        </div>

        {/* Right Side: Form (narrower: 5 cols out of 12) */}
        <div className="lg:col-span-5 flex flex-col justify-center items-center px-6 py-12 lg:p-12 relative bg-[#0F0E0C] border-t lg:border-t-0 lg:border-l border-white/5">
          <div className="absolute top-[20%] right-[-10%] w-[300px] h-[300px] bg-[#C59B27]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="w-full max-w-[400px] relative z-10">
            {children}
          </div>
        </div>
      </div>

      {/* Global Footer (Consistent) */}
      <footer className="bg-[#12110E] text-[#7E7B72] border-t border-white/5 py-14 text-xs relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10 text-left">
            {/* About Us */}
            <div className="space-y-3">
              <h4 className="text-[#F5F5F3] font-serif font-bold uppercase tracking-widest text-sm">About Us</h4>
              <p className="text-[#7E7B72] leading-relaxed text-xs">
                TransitOps is a smart transport operations platform designed to replace manual logbooks with a centralized, role-based digital system for fleet management, driver compliance, trip dispatching, and financial intelligence.
              </p>
            </div>
            {/* Contact Us */}
            <div className="space-y-3">
              <h4 className="text-[#F5F5F3] font-serif font-bold uppercase tracking-widest text-sm">Contact Us</h4>
              <div className="space-y-2">
                <a href="tel:+919876543210" className="flex items-center gap-2 text-[#7E7B72] hover:text-[#C59B27] transition-colors">
                  <Phone className="h-3.5 w-3.5" /> +91 98765 43210
                </a>
                <a href="mailto:contact@transitops.in" className="flex items-center gap-2 text-[#7E7B72] hover:text-[#C59B27] transition-colors">
                  <Mail className="h-3.5 w-3.5" /> contact@transitops.in
                </a>
              </div>
            </div>
            {/* Connect */}
            <div className="space-y-3">
              <h4 className="text-[#F5F5F3] font-serif font-bold uppercase tracking-widest text-sm">Connect</h4>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#7E7B72] hover:text-[#C59B27] transition-colors">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 text-center text-[10px] uppercase tracking-widest text-[#7E7B72]">
            © 2026 TransitOps Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
