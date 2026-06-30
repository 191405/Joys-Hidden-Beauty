"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { apiFetch, setToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import Logo from "@/components/brand/Logo";

export default function LoginClient() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await apiFetch<{ access_token: string }>("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });
            setToken(data.access_token);
            router.push("/");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setError("");
                setLoading(true);
                const data = await apiFetch<{ access_token: string }>("/auth/google", {
                    method: "POST",
                    body: JSON.stringify({ token: tokenResponse.access_token }),
                });
                setToken(data.access_token);
                router.push("/");
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Google authentication failed.");
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError("Google authentication failed. Please try again.")
    });



    return (
        <div className="min-h-screen flex bg-[var(--color-canvas)]">
            {/* Left — Editorial Image */}
            <div
                className="hidden lg:block lg:w-1/2 relative overflow-hidden"
            >
                <div 
                    className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-[10s] hover:scale-100"
                    style={{
                        backgroundImage: `url('/images/login-portrait.jpg')`,
                    }}
                />
                <div className="absolute inset-0 bg-black/10 transition-opacity duration-1000 hover:opacity-0" />
            </div>

            {/* Right — Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 md:px-16 lg:px-24 py-20 pt-28 md:pt-20">
                <motion.div
                    className="w-full max-w-md bg-white/50 backdrop-blur-md p-8 md:p-10 border border-[rgba(26,26,26,0.05)] shadow-[0_8px_40px_rgba(0,0,0,0.02)]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="flex justify-center mb-6">
                        <Logo variant="text" size="small" theme="gold" />
                    </div>
                    <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.3em] uppercase text-[var(--color-gold)] mb-4 text-center">
                        Welcome Back
                    </p>
                    <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl mb-4 text-center">
                        Sign In
                    </h1>
                    <div className="divider-gold mx-auto mb-8" />

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Email */}
                        <div className="relative group">
                            <label className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-slate)] mb-2 block transition-colors group-focus-within:text-[var(--color-gold)]">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-b border-[rgba(26,26,26,0.15)] pb-2 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-none placeholder:text-[var(--color-slate-light)]"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="relative group">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-slate)] block transition-colors group-focus-within:text-[var(--color-gold)]">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-[9px] tracking-[0.1em] uppercase text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent border-b border-[rgba(26,26,26,0.15)] pb-2 text-sm pr-10 focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-none placeholder:text-[var(--color-slate-light)]"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-end mt-2">
                            <button type="button" className="text-[10px] tracking-[0.05em] text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors">
                                Forgot password?
                            </button>
                        </div>

                        {/* Error Handling */}
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-red-500 text-xs text-center bg-red-50 py-2 px-3 border border-red-100 overflow-hidden"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gold w-full justify-center disabled:opacity-50 mt-4 relative overflow-hidden group"
                        >
                            <span className="relative z-10 transition-transform duration-500 group-hover:scale-105">
                                {loading ? "Authenticating..." : "Sign In"}
                            </span>
                        </button>
                    </form>

                    <div className="relative flex items-center justify-center mt-8 mb-6">
                        <div className="border-t border-[rgba(26,26,26,0.1)] w-full"></div>
                        <span className="bg-white/50 px-4 text-[10px] tracking-widest uppercase text-[var(--color-slate)] absolute">Or</span>
                    </div>

                    <button
                        type="button"
                        disabled
                        className="w-full flex items-center justify-center gap-3 bg-gray-50 border border-[rgba(26,26,26,0.05)] text-[var(--color-slate-light)] py-[14px] text-xs tracking-wider uppercase cursor-not-allowed shadow-none"
                    >
                        <svg className="w-4 h-4 opacity-30 grayscale" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google <span className="text-[9px] text-[var(--color-slate-light)] lowercase">(coming soon)</span>
                    </button>

                    <p className="text-center mt-10 text-xs text-[var(--color-slate)] tracking-wide">
                        New to Joy&apos;s Hidden Beauty?{" "}
                        <Link href="/auth/register" className="text-[var(--color-gold)] hover:text-[var(--color-ink)] transition-colors ml-1 font-medium">
                            Create an account
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
