"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
    };

    return (
        <>
        {/* Liquid glass animation styles */}
        <style jsx global>{`
            @keyframes shimmer-sweep {
                0% { transform: translateX(-100%) rotate(-15deg); }
                100% { transform: translateX(200%) rotate(-15deg); }
            }
            @keyframes border-glow {
                0%, 100% { opacity: 0.4; }
                50% { opacity: 0.8; }
            }
            @keyframes float-subtle {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-4px); }
            }
            .glass-card-liquid {
                position: relative;
                border-radius: 36px 12px 36px 12px;
            }
            .glass-card-liquid::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 36px 12px 36px 12px;
                padding: 1px;
                background: linear-gradient(
                    135deg,
                    rgba(196, 164, 105, 0.6),
                    rgba(255, 255, 255, 0.2),
                    rgba(196, 164, 105, 0.4),
                    rgba(255, 255, 255, 0.1)
                );
                -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
                animation: border-glow 4s ease-in-out infinite;
                pointer-events: none;
            }
            .glass-card-liquid::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 50%;
                height: 100%;
                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.08),
                    transparent
                );
                animation: shimmer-sweep 6s ease-in-out infinite;
                pointer-events: none;
                border-radius: 36px 12px 36px 12px;
            }
            .logo-glow {
                animation: float-subtle 5s ease-in-out infinite;
                filter: drop-shadow(0 0 20px rgba(196, 164, 105, 0.35))
                        drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
            }
        `}</style>

        <div className="min-h-screen flex relative bg-[var(--color-canvas)] selection:bg-[var(--color-gold)] selection:text-white overflow-x-hidden">
            
            {/* Left Column — Full Bleed Editorial Image (Desktop Only) */}
            <div className="hidden lg:block lg:w-[55%] relative overflow-hidden flex-shrink-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-[15s] hover:scale-100"
                    style={{ backgroundImage: `url('/images/login-portrait.jpg')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-1000 hover:opacity-80" />
            </div>

            {/* Right Column — Responsive Content Wrapper (Form & Mobile BG) */}
            <div className="w-full lg:w-[45%] flex flex-col justify-end lg:justify-center items-center min-h-screen relative z-10 py-8 lg:py-0">
                
                {/* Mobile Full-Screen Background Image (Hidden on Desktop) */}
                <div className="absolute inset-0 lg:hidden pointer-events-none z-0">
                    <div 
                        className="absolute inset-0 bg-cover"
                        style={{ 
                            backgroundImage: `url('/images/auth-mobile-bg.jpg')`, 
                            backgroundPosition: 'center 15%' 
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/30 to-black/75" />
                </div>

                {/* Floating Frosted Logo Pill (Mobile Only) */}
                <motion.div 
                    className="lg:hidden absolute top-8 left-6 z-20 logo-glow"
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                >
                    <div className="bg-black/35 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center justify-center">
                        <Logo variant="full" size="small" theme="white" />
                    </div>
                </motion.div>

                {/* Unified Glass Form Card */}
                <motion.div
                    className="relative z-10 mx-4 sm:mx-6 w-[calc(100%-2rem)] sm:w-[420px] lg:w-full lg:max-w-sm lg:mx-0 p-8 sm:p-10 lg:p-0 rounded-[36px] rounded-tr-[12px] rounded-bl-[12px] lg:rounded-none bg-gradient-to-br lg:bg-none from-white/90 to-white/95 lg:from-transparent lg:to-transparent backdrop-blur-3xl lg:backdrop-blur-none border border-white/20 lg:border-none shadow-[0_-15px_90px_rgba(0,0,0,0.2),0_6px_36px_rgba(0,0,0,0.12)] lg:shadow-none glass-card-liquid lg:before:hidden lg:after:hidden flex-shrink-0"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-full"
                    >
                        {/* Logo for Desktop Only */}
                        <motion.div variants={itemVariants} className="hidden lg:flex justify-start mb-10">
                            <Logo variant="text" size="large" theme="gold" className="!tracking-[0.1em]" />
                        </motion.div>

                        {/* Couture Card Accent Bar (Mobile Only) */}
                        <div className="lg:hidden w-12 h-[3.5px] bg-[var(--color-gold)] rounded-full mb-7 mx-auto opacity-80" />

                        {/* Title Header */}
                        <motion.p variants={itemVariants} className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.3em] uppercase text-[var(--color-gold)] text-center lg:text-left mb-3">
                            Welcome Back
                        </motion.p>
                        
                        <motion.h1 variants={itemVariants} className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl text-[var(--color-ink)] text-center lg:text-left leading-tight mb-8">
                            Sign In
                        </motion.h1>

                        {/* Single Form Instance */}
                        <form onSubmit={handleSubmit} className="space-y-8 mt-6">
                            {/* Email Input */}
                            <motion.div variants={itemVariants} className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-[rgba(26,26,26,0.12)] lg:border-[rgba(26,26,26,0.15)] py-3 text-sm lg:text-base focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-none placeholder-transparent text-[var(--color-ink)]"
                                    placeholder="Email Address"
                                    required
                                />
                                <label className="absolute left-0 -top-3.5 text-[9px] lg:text-[10px] text-[var(--color-slate)] tracking-[0.12em] lg:tracking-[0.15em] uppercase transition-all peer-placeholder-shown:text-[13.5px] lg:peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[var(--color-slate-light)] peer-focus:-top-3.5 peer-focus:text-[9px] lg:peer-focus:text-[10px] peer-focus:tracking-[0.12em] lg:peer-focus:tracking-[0.15em] peer-focus:text-[var(--color-gold)] cursor-text pointer-events-none">
                                    Email Address
                                </label>
                            </motion.div>

                            {/* Password Input */}
                            <motion.div variants={itemVariants} className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-[rgba(26,26,26,0.12)] lg:border-[rgba(26,26,26,0.15)] py-3 text-sm lg:text-base pr-12 focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-none placeholder-transparent text-[var(--color-ink)]"
                                    placeholder="Password"
                                    required
                                />
                                <label className="absolute left-0 -top-3.5 text-[9px] lg:text-[10px] text-[var(--color-slate)] tracking-[0.12em] lg:tracking-[0.15em] uppercase transition-all peer-placeholder-shown:text-[13.5px] lg:peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[var(--color-slate-light)] peer-focus:-top-3.5 peer-focus:text-[9px] lg:peer-focus:text-[10px] peer-focus:tracking-[0.12em] lg:peer-focus:tracking-[0.15em] peer-focus:text-[var(--color-gold)] cursor-text pointer-events-none">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-3 text-[9px] tracking-[0.08em] uppercase text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </motion.div>

                            {/* Forgot Password */}
                            <motion.div variants={itemVariants} className="flex justify-start pt-1">
                                <button type="button" className="text-[10px] tracking-[0.05em] text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors underline underline-offset-4 decoration-[rgba(0,0,0,0.1)] hover:decoration-[var(--color-gold)]">
                                    Forgot password?
                                </button>
                            </motion.div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-red-600 text-xs bg-red-50/80 py-3 px-4 border-l-2 border-red-400 rounded-r-lg overflow-hidden"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <motion.div variants={itemVariants} className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[var(--color-ink)] text-white py-4 text-[11px] lg:text-xs tracking-[0.2em] uppercase rounded-xl lg:rounded-none hover:bg-[var(--color-gold)] transition-all duration-500 disabled:opacity-50 group relative overflow-hidden"
                                >
                                    <span className="relative z-10 transition-transform duration-500 group-hover:scale-105 inline-block">
                                        {loading ? "Authenticating..." : "Sign In"}
                                    </span>
                                </button>
                            </motion.div>
                        </form>

                        {/* Divider */}
                        <motion.div variants={itemVariants} className="relative flex items-center justify-center mt-10 mb-8">
                            <div className="border-t border-[rgba(26,26,26,0.1)] w-full"></div>
                            <span className="bg-[#FAF8F5] lg:bg-[var(--color-canvas)] px-4 text-[9px] tracking-widest uppercase text-[var(--color-slate)] absolute">Or</span>
                        </motion.div>

                        {/* Google Button (Placeholder) */}
                        <motion.div variants={itemVariants}>
                            <button
                                type="button"
                                disabled
                                className="w-full flex items-center justify-center gap-3 bg-transparent border border-[rgba(26,26,26,0.12)] lg:border-[rgba(26,26,26,0.15)] text-[var(--color-ink)] transition-colors py-[14px] text-xs tracking-wider uppercase cursor-not-allowed rounded-xl lg:rounded-none group"
                            >
                                <svg className="w-4 h-4 opacity-40 grayscale" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google <span className="text-[9px] text-[var(--color-slate-light)] lowercase">(coming soon)</span>
                            </button>
                        </motion.div>

                        {/* Sign Up Link */}
                        <motion.p variants={itemVariants} className="mt-10 text-center lg:text-left text-xs text-[var(--color-slate)] tracking-wide">
                            New to Joy&apos;s Hidden Beauty?{" "}
                            <Link href="/auth/register" className="text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors ml-1 font-medium underline underline-offset-4 decoration-[rgba(0,0,0,0.1)] hover:decoration-[var(--color-gold)]">
                                Create an account
                            </Link>
                        </motion.p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
        </>
    );
}
