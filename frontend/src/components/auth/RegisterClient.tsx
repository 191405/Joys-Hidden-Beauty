"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { apiFetch, setToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import Logo from "@/components/brand/Logo";

export default function RegisterClient() {
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const data = await apiFetch<{ access_token: string }>("/auth/register", {
                method: "POST",
                body: JSON.stringify({ email, password, first_name: firstName }),
            });
            setToken(data.access_token);
            router.push("/");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row relative bg-[var(--color-canvas)] selection:bg-[var(--color-gold)] selection:text-white overflow-y-auto lg:overflow-hidden">
            
            {/* Mobile/Tablet Image Header (Hidden on Desktop) */}
            <div className="w-full h-[45vh] lg:hidden relative overflow-hidden flex-shrink-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('/images/auth-mobile-bg.jpg')`, backgroundPosition: 'center 15%' }}
                />
                {/* Overlay that melts the photo into the warm white canvas */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--color-canvas)] to-transparent" />
            </div>

            {/* Left — Full Bleed Editorial Image (Desktop Only) */}
            <div className="hidden lg:block lg:w-[55%] relative overflow-hidden flex-shrink-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-[15s] hover:scale-100"
                    style={{ backgroundImage: `url('/images/login-portrait.jpg')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-1000 hover:opacity-80" />
            </div>

            {/* Right — Minimalist Canvas (Desktop) / Fluid Form (Mobile) */}
            <div className="w-full lg:w-[45%] flex items-center justify-center px-6 sm:px-12 md:px-20 py-10 lg:py-20 bg-[var(--color-canvas)] relative z-10 flex-grow">
                <motion.div
                    className="w-full max-w-sm"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants} className="flex justify-start mb-8">
                        <Logo variant="text" size="large" theme="gold" className="!tracking-[0.1em]" />
                    </motion.div>
                    
                    <motion.p variants={itemVariants} className="font-[family-name:var(--font-cinzel)] text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[var(--color-gold)] mb-3">
                        Join the Inner Circle
                    </motion.p>
                    
                    <motion.h1 variants={itemVariants} className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl mb-8 text-[var(--color-ink)] leading-tight">
                        Create Account
                    </motion.h1>

                    <form onSubmit={handleSubmit} className="space-y-8 mt-10">
                        {/* First Name - Floating Label */}
                        <motion.div variants={itemVariants} className="relative group">
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="peer w-full bg-transparent border-b border-[rgba(26,26,26,0.15)] py-2 text-sm md:text-base focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-none placeholder-transparent text-[var(--color-ink)]"
                                placeholder="First Name"
                                required
                            />
                            <label className="absolute left-0 -top-3.5 text-[9px] md:text-[10px] text-[var(--color-slate)] tracking-[0.15em] uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[var(--color-slate-light)] peer-focus:-top-3.5 peer-focus:text-[9px] md:peer-focus:text-[10px] peer-focus:tracking-[0.15em] peer-focus:text-[var(--color-gold)] cursor-text pointer-events-none">
                                First Name
                            </label>
                        </motion.div>

                        {/* Email - Floating Label */}
                        <motion.div variants={itemVariants} className="relative group">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="peer w-full bg-transparent border-b border-[rgba(26,26,26,0.15)] py-2 text-sm md:text-base focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-none placeholder-transparent text-[var(--color-ink)]"
                                placeholder="Email Address"
                                required
                            />
                            <label className="absolute left-0 -top-3.5 text-[9px] md:text-[10px] text-[var(--color-slate)] tracking-[0.15em] uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[var(--color-slate-light)] peer-focus:-top-3.5 peer-focus:text-[9px] md:peer-focus:text-[10px] peer-focus:tracking-[0.15em] peer-focus:text-[var(--color-gold)] cursor-text pointer-events-none">
                                Email Address
                            </label>
                        </motion.div>

                        {/* Password - Floating Label */}
                        <motion.div variants={itemVariants} className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="peer w-full bg-transparent border-b border-[rgba(26,26,26,0.15)] py-2 text-sm md:text-base pr-10 focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-none placeholder-transparent text-[var(--color-ink)]"
                                placeholder="Password"
                                required
                                minLength={6}
                            />
                            <label className="absolute left-0 -top-3.5 text-[9px] md:text-[10px] text-[var(--color-slate)] tracking-[0.15em] uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[var(--color-slate-light)] peer-focus:-top-3.5 peer-focus:text-[9px] md:peer-focus:text-[10px] peer-focus:tracking-[0.15em] peer-focus:text-[var(--color-gold)] cursor-text pointer-events-none">
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 top-2 text-[9px] tracking-[0.1em] uppercase text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </motion.div>

                        {/* Confirm Password - Floating Label */}
                        <motion.div variants={itemVariants} className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="peer w-full bg-transparent border-b border-[rgba(26,26,26,0.15)] py-2 text-sm md:text-base pr-10 focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-none placeholder-transparent text-[var(--color-ink)]"
                                placeholder="Confirm Password"
                                required
                                minLength={6}
                            />
                            <label className="absolute left-0 -top-3.5 text-[9px] md:text-[10px] text-[var(--color-slate)] tracking-[0.15em] uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[var(--color-slate-light)] peer-focus:-top-3.5 peer-focus:text-[9px] md:peer-focus:text-[10px] peer-focus:tracking-[0.15em] peer-focus:text-[var(--color-gold)] cursor-text pointer-events-none">
                                Confirm Password
                            </label>
                        </motion.div>

                        {/* Error Handling */}
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-red-500 text-xs bg-red-50 py-3 px-4 border-l-2 border-red-500 overflow-hidden"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit */}
                        <motion.div variants={itemVariants} className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--color-ink)] text-white py-4 text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-gold)] transition-all duration-500 disabled:opacity-50 group relative overflow-hidden"
                            >
                                <span className="relative z-10 transition-transform duration-500 group-hover:scale-105 inline-block">
                                    {loading ? "Creating account..." : "Create Account"}
                                </span>
                            </button>
                        </motion.div>
                    </form>

                    <motion.div variants={itemVariants} className="relative flex items-center justify-center mt-10 mb-8">
                        <div className="border-t border-[rgba(26,26,26,0.1)] w-full"></div>
                        <span className="bg-[var(--color-canvas)] px-4 text-[9px] tracking-widest uppercase text-[var(--color-slate)] absolute">Or</span>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <button
                            type="button"
                            disabled
                            className="w-full flex items-center justify-center gap-3 bg-transparent border border-[rgba(26,26,26,0.15)] text-[var(--color-ink)] hover:border-[var(--color-ink)] transition-colors py-[14px] text-xs tracking-wider uppercase cursor-not-allowed group"
                        >
                            <svg className="w-4 h-4 opacity-50 grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google <span className="text-[9px] text-[var(--color-slate-light)] lowercase">(coming soon)</span>
                        </button>
                    </motion.div>

                    <motion.p variants={itemVariants} className="text-center lg:text-left mt-10 text-xs text-[var(--color-slate)] tracking-wide">
                        Already a member?{" "}
                        <Link href="/auth/login" className="text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors ml-1 font-medium underline underline-offset-4 decoration-[rgba(0,0,0,0.1)] hover:decoration-[var(--color-gold)]">
                            Sign in
                        </Link>
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}
