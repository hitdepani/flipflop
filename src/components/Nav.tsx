"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Cpu, GitMerge, LayoutGrid, Activity } from "lucide-react";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const links = [
    { href: "/", label: "Home", icon: <LayoutGrid className="w-5 h-5" /> },
    { href: "/logic-gates", label: "Logic Gates", icon: <Cpu className="w-5 h-5" /> },
    { href: "/flip-flops", label: "Flip-Flops", icon: <GitMerge className="w-5 h-5" /> },
    { href: "/circuit-builder", label: "Circuit Builder", icon: <Activity className="w-5 h-5" /> },
    { href: "/timing-diagrams", label: "Timing Diagrams", icon: <Activity className="w-5 h-5" /> },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0b0f14]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[#0b0f14]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">FlipLogic</span>
          </Link>
          
          <button 
            onClick={toggleSidebar}
            className="p-2 text-[#cbd5e1] hover:text-white transition-colors rounded-md hover:bg-white/5"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Content */}
      <div 
        className={`fixed top-0 right-0 h-full w-[300px] bg-[#131821] border-l border-white/5 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <span className="text-sm font-semibold text-[#cbd5e1] uppercase tracking-wider">Navigation</span>
          <button 
            onClick={toggleSidebar}
            className="p-1 text-[#cbd5e1] hover:text-white transition-colors rounded-md hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={toggleSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-white/10 text-white font-medium" 
                    : "text-[#cbd5e1] hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
