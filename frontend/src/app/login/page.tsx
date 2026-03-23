"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";
import Link from "next/link";
<<<<<<< Updated upstream
import { ShieldCheck, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"user" | "admin">("user");
=======
import { ShieldCheck, LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
>>>>>>> Stashed changes
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
<<<<<<< Updated upstream
=======
    setError("");
<<<<<<< Updated upstream
=======

    // Test Admin Bypass for Demo
    if (email === "test-admin" && password === "test-admin") {
      localStorage.setItem("sentra-role", "admin");
      localStorage.setItem("is-demo", "true");
      router.push("/dashboard/admin");
      return;
    }
    localStorage.removeItem("is-demo");
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
>>>>>>> Stashed changes

    // Test Admin Bypass for Demo
    if (email === "test-admin" && password === "test-admin") {
      localStorage.setItem("sentra-role", "admin");
      localStorage.setItem("is-demo", "true");
      router.push("/dashboard/admin");
      return;
    }
    localStorage.removeItem("is-demo");
>>>>>>> Stashed changes
    
    // TODO(AUTH): Replace mockup timeout with real authentication API request (NextAuth signIn)
    localStorage.setItem("sentra-role", role);
    setTimeout(() => {
      router.push(role === "admin" ? "/dashboard/admin" : "/dashboard/user");
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-md p-8 rounded-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan to-accent-purple" />
        
        <div className="flex flex-col items-center mb-8">
          <Logo className="mb-6 scale-110" />
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your Sentra platform</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address / Username</label>
            <input
              type="text"
<<<<<<< Updated upstream
<<<<<<< Updated upstream
              readOnly
              value={role === "admin" ? "admin@sentra.ai" : "user@sentra.ai"}
              className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
=======
=======
>>>>>>> Stashed changes
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
              placeholder="you@example.com / test-admin"
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
<<<<<<< Updated upstream
            <input
              type="password"
              readOnly
              value="••••••••••••"
              className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-3 text-sm focus:outline-none"
            />
=======
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
>>>>>>> Stashed changes
          </div>

          <div className="flex bg-background/50 p-1 rounded-lg border border-border/50">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`flex-1 py-2 text-sm font-medium leading-none rounded-md transition-all ${
                role === "user" ? "bg-card text-foreground shadow-sm border border-border/50" : "text-muted-foreground"
              }`}
            >
              User Role
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex-1 py-2 text-sm font-medium leading-none rounded-md transition-all ${
                role === "admin" ? "bg-card text-foreground shadow-sm border border-border/50" : "text-muted-foreground"
              }`}
            >
              Admin Role
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-neon bg-foreground text-background font-semibold py-3 rounded-lg flex justify-center items-center gap-2 mt-4"
          >
            {loading ? (
              <span className="animate-spin w-5 h-5 border-2 border-background border-t-transparent rounded-full" />
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-border/50 pt-6">
          <Link
            href="/extension"
            target="_blank"
            className="text-sm text-muted-foreground hover:text-accent-cyan transition-colors inline-flex items-center gap-2"
          >
            <ShieldCheck size={16} />
            View Browser Extension Preview →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
