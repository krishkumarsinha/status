"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Heart, 
  LayoutDashboard, 
  Smile, 
  Target, 
  ClipboardCheck, 
  Wallet, 
  BookOpen, 
  User 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dash", href: "/", icon: LayoutDashboard },
  { name: "Metrics", href: "/metrics", icon: ClipboardCheck },
  { name: "Habits", href: "/habits", icon: Target },
  { name: "Health", href: "/health", icon: Heart },
  { name: "Finances", href: "/finances", icon: Wallet },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Account", href: "/account", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/90 backdrop-blur-xl pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
      <nav className="flex items-center justify-around px-1 h-14 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[48px] h-full space-y-0.5 transition-colors shrink-0",
                isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-full transition-all duration-200",
                  isActive ? "bg-primary/10" : "transparent"
                )}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <span className="text-[9px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
