"use client";

import { useState } from "react";
import { useAuth } from "./auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signUpWithEmail } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name || "Track Enthusiast");
      setSuccess("Account created successfully!");
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register account.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <Label htmlFor="minimal-reg-name" className="text-xs font-semibold text-muted-foreground">
          Full Name
        </Label>
        <div className="relative">
          <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            id="minimal-reg-name"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="pl-10 h-10 bg-background/60 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all rounded-xl text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="minimal-reg-email" className="text-xs font-semibold text-muted-foreground">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            id="minimal-reg-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10 h-10 bg-background/60 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all rounded-xl text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="minimal-reg-password" className="text-xs font-semibold text-muted-foreground">
          Password
        </Label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            id="minimal-reg-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-10 h-10 bg-background/60 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all rounded-xl text-sm"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={loading} 
        className="w-full h-10 rounded-xl text-sm font-semibold shadow-xs hover:shadow-md active:scale-[0.98] transition-all duration-300 gap-2 mt-2"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        ) : (
          <>
            Create Account <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" /> {success}
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-destructive" /> {error}
        </div>
      )}
    </form>
  );
}
