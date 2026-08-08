"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, 
  Heart, 
  LayoutDashboard, 
  Settings, 
  Smile, 
  Target, 
  Moon, 
  Sun,
  ClipboardCheck,
  Wallet,
  BookOpen,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const mainNavItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Daily Metrics", href: "/metrics", icon: ClipboardCheck },
  { name: "Habits", href: "/habits", icon: Target },
  { name: "Health", href: "/health", icon: Heart },
  { name: "Mood", href: "/mood", icon: Smile },
  { name: "Finances", href: "/finances", icon: Wallet },
  { name: "Journal", href: "/journal", icon: BookOpen },
];

const secondaryNavItems = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Account", href: "/account", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-72 border-r bg-sidebar/50 backdrop-blur-xl transition-all duration-300 z-30">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border/50">
        <div className="bg-primary/20 p-2 rounded-md text-primary animate-float">
          <Activity className="h-6 w-6" />
        </div>
        <span className="font-semibold text-lg tracking-tight">Self Tracker</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-4 mb-2">
          Tracking
        </div>
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group hover:translate-x-1",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-4 mb-2">
          Preferences
        </div>
        {secondaryNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )
          ) : (
            <div className="h-5 w-5" />
          )}
          {mounted ? (theme === "dark" ? "Light Mode" : "Dark Mode") : "Toggle Theme"}
        </Button>
      </div>
    </aside>
  );
}
