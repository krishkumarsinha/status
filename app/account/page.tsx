"use client";

import { useState, useEffect } from "react";
import { useHabitStore } from "@/lib/stores/habit-store";
import { useHealthStore } from "@/lib/stores/health-store";
import { useMoodStore } from "@/lib/stores/mood-store";
import { useFinanceStore } from "@/lib/stores/finance-store";
import { useJournalStore } from "@/lib/stores/journal-store";
import { useAuth } from "@/components/auth/auth-provider";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { saveUserProfileCloud, getUserProfileCloud } from "@/lib/firebase/firestore-service";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  User, 
  Trash2, 
  Target, 
  Heart, 
  Smile, 
  Wallet, 
  BookOpen, 
  ShieldCheck,
  Sparkles,
  Zap,
  Star,
  Crown,
  Laptop,
  Palette,
  Leaf,
  Globe,
  LogOut,
  LogIn,
  UserPlus
} from "lucide-react";

const AVATAR_ICONS = [
  { id: "zap", icon: Zap, label: "Zap" },
  { id: "target", icon: Target, label: "Target" },
  { id: "star", icon: Star, label: "Star" },
  { id: "sparkles", icon: Sparkles, label: "Sparkles" },
  { id: "user", icon: User, label: "User" },
  { id: "crown", icon: Crown, label: "Crown" },
  { id: "laptop", icon: Laptop, label: "Laptop" },
  { id: "palette", icon: Palette, label: "Palette" },
  { id: "leaf", icon: Leaf, label: "Leaf" },
  { id: "globe", icon: Globe, label: "Globe" },
];

export default function AccountPage() {
  const [mounted, setMounted] = useState(false);
  const [displayName, setDisplayName] = useState("Track Enthusiast");
  const [avatar, setAvatar] = useState("zap");
  const [isClearOpen, setIsClearOpen] = useState(false);

  const { user, isFirebaseActive, signOutUser } = useAuth();

  const habits = useHabitStore((state) => state.habits);
  const healthEntries = useHealthStore((state) => state.entries);
  const moodEntries = useMoodStore((state) => state.entries);
  const transactions = useFinanceStore((state) => state.transactions);
  const journalEntries = useJournalStore((state) => state.entries);

  useEffect(() => {
    setMounted(true);

    if (user) {
      if (user.displayName) setDisplayName(user.displayName);
      getUserProfileCloud(user.uid).then((p) => {
        if (p?.displayName) setDisplayName(p.displayName);
        if (p?.avatarEmoji) setAvatar(p.avatarEmoji);
      });
    }
  }, [user]);

  if (!mounted) return null;

  const saveProfile = async (name: string, emoji: string) => {
    setDisplayName(name);
    setAvatar(emoji);

    if (user && isFirebaseActive) {
      await saveUserProfileCloud(user.uid, {
        displayName: name,
        avatarEmoji: emoji,
        joinedDate: user.metadata.creationTime || new Date().toISOString(),
      });
    }
  };

  const handleClearData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account & Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your cloud authentication session, profile settings, and lifetime tracking stats.
        </p>
      </div>

      {/* Cloud Authentication Section */}
      <Card className="border-primary/20 bg-card/60 backdrop-blur-xs">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> Firebase Cloud Authentication
          </CardTitle>
          <CardDescription>
            {user
              ? "Your data is automatically synced to your cloud account in real-time."
              : "Sign in or create an account to securely access your data across devices."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {user ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    {user.email || user.displayName || "Personnel Account"}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">UID: {user.uid}</p>
              </div>

              <Button variant="outline" size="sm" onClick={() => signOutUser()} className="gap-2 text-destructive hover:text-destructive">
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="gap-2">
                  <LogIn className="w-4 h-4" /> Log In
                </TabsTrigger>
                <TabsTrigger value="register" className="gap-2">
                  <UserPlus className="w-4 h-4" /> Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm />
              </TabsContent>

              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Profile Settings
          </CardTitle>
          <CardDescription>Customize your display name and avatar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="p-5 bg-primary/10 text-primary rounded-3xl border border-primary/20 shadow-inner flex items-center justify-center">
              {(() => {
                const item = AVATAR_ICONS.find((a) => a.id === avatar) || AVATAR_ICONS[0];
                const IconComp = item.icon;
                return <IconComp className="w-10 h-10" />;
              })()}
            </div>

            <div className="space-y-4 flex-1 w-full">
              <div className="space-y-1.5">
                <Label htmlFor="display-name" className="text-xs">Display Name</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => saveProfile(e.target.value, avatar)}
                  className="max-w-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Select Avatar Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = avatar === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => saveProfile(displayName, item.id)}
                        className={`p-2.5 rounded-xl transition-all border ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                            : "bg-muted/50 hover:bg-muted text-muted-foreground border-border/50"
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Lifetime Tracking Stats</CardTitle>
          <CardDescription>Overview of all records stored in your Firestore cloud account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-1">
              <Target className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
              <div className="text-2xl font-bold">{habits.length}</div>
              <p className="text-xs text-muted-foreground">Habits</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-1">
              <Heart className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
              <div className="text-2xl font-bold">{healthEntries.length}</div>
              <p className="text-xs text-muted-foreground">Health Logs</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-1">
              <Smile className="w-5 h-5 mx-auto text-amber-500 mb-1" />
              <div className="text-2xl font-bold">{moodEntries.length}</div>
              <p className="text-xs text-muted-foreground">Mood Logs</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-1">
              <Wallet className="w-5 h-5 mx-auto text-purple-500 mb-1" />
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">Transactions</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-1">
              <BookOpen className="w-5 h-5 mx-auto text-rose-500 mb-1" />
              <div className="text-2xl font-bold">{journalEntries.length}</div>
              <p className="text-xs text-muted-foreground">Journal Entries</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Reset */}
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-destructive flex items-center gap-2">
            <Trash2 className="w-5 h-5" /> Danger Zone
          </CardTitle>
          <CardDescription>Reset local session state and sign out.</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isClearOpen} onOpenChange={setIsClearOpen}>
            <DialogTrigger render={<Button variant="destructive" className="gap-2" />}>
              <Trash2 className="w-4 h-4" /> Reset Session
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset local session state?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground py-2">
                This will reset local temporary state and sign out. Your Firestore cloud records remain safe in your Firebase account.
              </p>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsClearOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleClearData}>
                  Reset Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
