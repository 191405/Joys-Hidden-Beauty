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
            transition: { staggerChildren: 0.08, delayChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
    };

    const cardSlideUp = {
        hidden: { opacity: 0, y: 60 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { duration: 0.8, ease: "easeOut" as const, delay: 0.1 } 
        }
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
            }
            .glass-card-liquid::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 1.5rem;
                padding: 1px;
                background: linear-gradient(
                    135deg,
                    rgba(196, 164, 105, 0.5),
                    rgba(255, 255, 255, 0.1),
                    rgba(196, 164, 105, 0.3),
                    rgba(255, 255, 255, 0.05)
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
                border-radius: 1.5rem;
            }
            .logo-glow {
                animation: float-subtle 5s ease-in-out infinite;
                filter: drop-shadow(0 0 20px rgba(196, 164, 105, 0.35))
                        drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
            }
        `}</style>
        <div className="min-h-screen relative selection:bg-[var(--color-gold)] selection:text-white">
            
            {/* ═══════════════════════════════════════════ */}
            {/* MOBILE / TABLET — Full viewport background  */}
            {/* ═══════════════════════════════════════════ */}
            <div className="lg:hidden min-h-screen relative flex flex-col">
                {/* Full-screen background image */}
                <div className="absolute inset-0">
                    <div 
                        className="absolute inset-0 bg-cover"
                        style={{ 
                            backgroundImage: `url('/images/auth-mobile-bg.jpg')`, 
                            backgroundPosition: 'center 15%' 
                        }}
                    />
                    {/* Cinematic gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/70" />
                </div>

                {/* Top branding — luxurious floating logo over the image */}
                <motion.div 
                    className="relative z-10 pt-10 sm:pt-14 px-6 sm:px-8 logo-glow"
                    initial={{ opacity: 0, y: -30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" as const }}
                >
                    <Logo variant="full" size="small" theme="white" />
                </motion.div>

                {/* Spacer — pushes form card to the bottom */}
                <div className="flex-grow min-h-[15vh]" />

                {/* Bottom floating liquid glass card */}
                <motion.div
                    className="relative z-10 mx-3 sm:mx-6 mb-5 rounded-3xl glass-card-liquid"
                    style={{ 
                        background: 'linear-gradient(165deg, rgba(255,253,250,0.88) 0%, rgba(255,250,245,0.95) 50%, rgba(255,253,250,0.90) 100%)',
                        backdropFilter: 'blur(50px) saturate(1.6)',
                        WebkitBackdropFilter: 'blur(50px) saturate(1.6)',
                        boxShadow: '0 -12px 80px rgba(0,0,0,0.18), 0 4px 30px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.6), inset 0 -1px 1px rgba(0,0,0,0.02)'
                    }}
                    variants={cardSlideUp}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="relative z-10 px-6 sm:px-9 pt-7 pb-7">
                        {/* Decorative gold accent bar */}
                        <div className="w-10 h-[3px] bg-[var(--color-gold)] rounded-full mb-6 mx-auto" />
                        
                        <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl text-[var(--color-ink)] leading-tight text-center mb-1">
                            Create Account
                        </h1>
                        <p className="font-[family-name:var(--font-cinzel)] text-[9px] tracking-[0.25em] uppercase text-[var(--color-gold)] text-center mb-8">
                            Join the inner circle
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* First Name */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-[rgba(26,26,26,0.12)] py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-none placeholder-transparent text-[var(--color-ink)]"
                                    placeholder="First Name"
                                    required
                                />
                                <label className="absolute left-0 -top-3 text-[9px] text-[var(--color-slate)] tracking-[0.12em] uppercase transition-all peer-placeholder-shown:text-[13px] peer-placeholder-shown:top-2.5 peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[var(--color-slate-light)] peer-focus:-top-3 peer-focus:text-[9px] peer-focus:tracking-[0.12em] peer-focus:text-[var(--color-gold)] cursor-text pointer-events-none">
                                    First Name
                                </label>
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-[rgba(26,26,26,0.12)] py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-none placeholder-transparent text-[var(--color-ink)]"
                                    placeholder="Email Address"
                                    required
                                />
                                <label className="absolute left-0 -top-3 text-[9px] text-[var(--color-slate)] tracking-[0.12em] uppercase transition-all peer-placeholder-shown:text-[13px] peer-placeholder-shown:top-2.5 peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[var(--color-slate-light)] peer-focus:-top-3 peer-focus:text-[9px] peer-focus:tracking-[0.12em] peer-focus:text-[var(--color-gold)] cursor-text pointer-events-none">
                                    Email Address
                                </label>
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-[rgba(26,26,26,0.12)] py-2.5 text-sm pr-12 focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-none placeholder-transparent text-[var(--color-ink)]"
                                    placeholder="Password"
                                    required
                                    minLength={6}
                                />
                                <label className="absolute left-0 -top-3 text-[9px] text-[var(--color-slate)] tracking-[0.12em] uppercase transition-all peer-placeholder-shown:text-[13px] peer-placeholder-shown:top-2.5 peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[var(--color-slate-light)] peer-focus:-top-3 peer-focus:text-[9px] peer-focus:tracking-[0.12em] peer-focus:text-[var(--color-gold)] cursor-text pointer-events-none">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-2.5 text-[9px] tracking-[0.08em] uppercase text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            {/* Confirm Password */}
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-[rgba(26,26,26,0.12)] py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-none placeholder-transparent text-[var(--color-ink)]"
                                    placeholder="Confirm Password"
                                    required
                                    minLength={6}
                                />
                                <label className="absolute left-0 -top-3 text-[9px] text-[var(--color-slate)] tracking-[0.12em] uppercase transition-all peer-placeholder-shown:text-[13px] peer-placeholder-shown:top-2.5 peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[var(--color-slate-light)] peer-focus:-top-3 peer-focus:text-[9px] peer-focus:tracking-[0.12em] peer-focus:text-[var(--color-gold)] cursor-text pointer-events-none">
                                    Confirm Password
                                </label>
                            </div>

                            {/* Error */}
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

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--color-ink)] text-white py-4 text-[11px] tracking-[0.2em] uppercase rounded-xl hover:bg-[var(--color-gold)] transition-all duration-500 disabled:opacity-50 group relative overflow-hidden"
                            >
                                <span className="relative z-10 transition-transform duration-500 group-hover:scale-105 inline-block">
                                    {loading ? "Creating account..." : "Create Account"}
                                </span>
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative flex items-center justify-center mt-6 mb-5">
                            <div className="border-t border-[rgba(26,26,26,0.08)] w-full" />
                            <span className="bg-[rgba(255,253,250,0.92)] px-3 text-[9px] tracking-widest uppercase text-[var(--color-slate-light)] absolute">Or</span>
                        </div>

                        {/* Google */}
                        <button
                            type="button"
                            disabled
                            className="w-full flex items-center justify-center gap-3 bg-transparent border border-[rgba(26,26,26,0.1)] text-[var(--color-ink)] transition-colors py-3.5 text-[11px] tracking-wider uppercase cursor-not-allowed rounded-xl"
                        >
                            <svg className="w-4 h-4 opacity-40" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google <span className="text-[8px] text-[var(--color-slate-light)] lowercase ml-1">(coming soon)</span>
                        </button>

                        {/* Sign in link */}
                        <p className="text-center mt-6 text-[11px] text-[var(--color-slate)] tracking-wide">
                            Already a member?{" "}
                            <Link href="/auth/login" className="text-[var(--color-gold)] hover:text-[var(--color-ink)] transition-colors font-medium underline underline-offset-4 decoration-[var(--color-gold)]/30 hover:decoration-[var(--color-gold)]">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* DESKTOP — Editorial split-screen             */}
            {/* ═══════════════════════════════════════════ */}
            <div className="hidden lg:flex min-h-screen">
                {/* Left — Full Bleed Editorial Image */}
                <div className="w-[55%] relative overflow-hidden">
                    <div 
                        className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-[15s] hover:scale-100"
                        style={{ backgroundImage: `url('/images/login-portrait.jpg')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-1000 hover:opacity-80" />
                </div>

                {/* Right — Clean Minimalist Canvas */}
                <div className="w-[45%] flex items-center justify-center px-12 xl:px-20 bg-[var(--color-canvas)]">
                    <motion.div
                        className="w-full max-w-sm"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants} className="flex justify-start mb-10">
                            <Logo variant="text" size="large" theme="gold" className="!tracking-[0.1em]" />
                        </motion.div>
                        
                        <motion.p variants={itemVariants} className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.3em] uppercase text-[var(--color-gold)] mb-3">
                            Join the Inner Circle
                        </motion.p>
                        
                        <motion.h1 variants={itemVariants} className="font-[family-name:var(--font-playfair)] text-5xl mb-10 text-[var(--color-ink)] leading-tight">
                            Create Account
                        </motion.h1>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <motion.div variants={itemVariants} className="relative group">
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-[rgba(26,26,26,0.15)] py-2 text-base focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-none placeholder-transparent text-[var(--color-ink)]"
                                    placeholder="First Name"
                                    required
                                />
                                <label className="absolute left-0 -top-3.5 text-[10px] text-[var(--color-slate)] tracking-[0.15em] uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[var(--color-slate-light)] peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:tracking-[0.15em] peer-focus:text-[var(--color-gold)] cursor-text pointer-events-none">
                                    First Name
                                </label>
                            </motion.div>

                            <motion.div variants={itemVariants} className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-[rgba(26,26,26,0.15)] py-2 text-base focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-none placeholder-transparent text-[var(--color-ink)]"
                                    placeholder="Email Address"
                                    required
                                />
                                <label className="absolute left-0 -top-3.5 text-[10px] text-[var(--color-slate)] tracking-[0.15em] uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[var(--color-slate-light)] peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:tracking-[0.15em] peer-focus:text-[var(--color-gold)] cursor-text pointer-events-none">
                                    Email Address
                                </label>
                            </motion.div>

                            <motion.div variants={itemVariants} className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-[rgba(26,26,26,0.15)] py-2 text-base pr-10 focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-none placeholder-transparent text-[var(--color-ink)]"
                                    placeholder="Password"
                                    required
                                    minLength={6}
                                />
                                <label className="absolute left-0 -top-3.5 text-[10px] text-[var(--color-slate)] tracking-[0.15em] uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[var(--color-slate-light)] peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:tracking-[0.15em] peer-focus:text-[var(--color-gold)] cursor-text pointer-events-none">
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

                            <motion.div variants={itemVariants} className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-[rgba(26,26,26,0.15)] py-2 text-base focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-none placeholder-transparent text-[var(--color-ink)]"
                                    placeholder="Confirm Password"
                                    required
                                    minLength={6}
                                />
                                <label className="absolute left-0 -top-3.5 text-[10px] text-[var(--color-slate)] tracking-[0.15em] uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[var(--color-slate-light)] peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:tracking-[0.15em] peer-focus:text-[var(--color-gold)] cursor-text pointer-events-none">
                                    Confirm Password
                                </label>
                            </motion.div>

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

                        <motion.p variants={itemVariants} className="mt-10 text-xs text-[var(--color-slate)] tracking-wide">
                            Already a member?{" "}
                            <Link href="/auth/login" className="text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors ml-1 font-medium underline underline-offset-4 decoration-[rgba(0,0,0,0.1)] hover:decoration-[var(--color-gold)]">
                                Sign in
                            </Link>
                        </motion.p>
                    </motion.div>
                </div>
            </div>
        </div>
        </>
    );
}
