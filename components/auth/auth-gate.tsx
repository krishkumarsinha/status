"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { Activity } from "lucide-react";

export function AuthGate() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-sm">
        <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl rounded-lg overflow-hidden">
          <CardHeader className="text-center pt-8 pb-4 space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-1">
              <Activity className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Self Tracker</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Sign in to access your personal dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/60 rounded-md mb-6">
                <TabsTrigger 
                  value="login" 
                  className="rounded-lg text-xs font-medium py-2 transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="rounded-lg text-xs font-medium py-2 transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="focus-visible:outline-none">
                <LoginForm />
              </TabsContent>

              <TabsContent value="register" className="focus-visible:outline-none">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
