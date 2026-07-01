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
    const [focusedField, setFocusedField] = useState<string | null>(null);
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

    const stagger = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } }
    };

    const fadeUp = {
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <>
        {/* Scoped keyframes */}
        <style jsx global>{`
            @keyframes auth-gradient-drift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
            @keyframes auth-pulse-ring {
                0% { transform: scale(0.95); opacity: 0.5; }
                50% { transform: scale(1.05); opacity: 0.2; }
                100% { transform: scale(0.95); opacity: 0.5; }
            }
            @keyframes auth-shine {
                0% { left: -80%; }
                100% { left: 130%; }
            }
        `}</style>

        <div className="min-h-[100dvh] flex relative bg-[var(--color-canvas)] selection:bg-[var(--color-gold)]/30 selection:text-[var(--color-ink)] overflow-hidden">
            
            {/* ═══════════════════════════════════════ */}
            {/* LEFT — Cinematic Editorial Image (Desktop) */}
            {/* ═══════════════════════════════════════ */}
            <div className="hidden lg:flex lg:w-[56%] relative overflow-hidden flex-shrink-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center scale-[1.03] transition-transform duration-[25s] hover:scale-100"
                    style={{ backgroundImage: `url('/images/login-portrait.jpg')` }}
                />
                {/* Layered vignette for depth */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-[var(--color-canvas)]/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* Desktop brand watermark — bottom-left */}
                <motion.div 
                    className="absolute bottom-10 left-10 z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.5 }}
                >
                    <Logo variant="full" size="default" theme="white" />
                </motion.div>
            </div>

            {/* ═══════════════════════════════════════ */}
            {/* RIGHT — Form Column                     */}
            {/* ═══════════════════════════════════════ */}
            <div className="w-full lg:w-[44%] flex flex-col min-h-[100dvh] relative z-10">
                
                {/* Mobile Background — Full bleed portrait */}
                <div className="absolute inset-0 lg:hidden z-0">
                    <div 
                        className="absolute inset-0 bg-cover bg-no-repeat"
                        style={{ 
                            backgroundImage: `url('/images/auth-mobile-bg.jpg')`, 
                            backgroundPosition: 'center 20%' 
                        }}
                    />
                    {/* Triple-layer gradient for readability + atmosphere */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
                </div>

                {/* ─── Mobile Logo (Top) ─── */}
                <motion.div 
                    className="lg:hidden relative z-20 pt-10 pb-4 px-7"
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                >
                    <div className="inline-flex items-center bg-white/[0.12] backdrop-blur-xl border border-white/[0.15] rounded-full px-5 py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
                        <Logo variant="full" size="small" theme="white" />
                    </div>
                </motion.div>

                {/* ─── Spacer to push form to bottom on mobile ─── */}
                <div className="flex-1 lg:hidden" />

                {/* ─── Form Area ─── */}
                <div className="relative z-10 w-full flex flex-col items-center lg:justify-center lg:flex-1 px-6 sm:px-8 lg:px-14 pb-10 lg:pb-0">
                    
                    <motion.div
                        className="w-full max-w-[400px]"
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Desktop Logo */}
                        <motion.div variants={fadeUp} className="hidden lg:block mb-14">
                            <Logo variant="text" size="large" theme="gold" />
                        </motion.div>

                        {/* ─── Header ─── */}
                        <motion.div variants={fadeUp} className="mb-10">
                            <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] uppercase text-[var(--color-gold)] lg:text-[var(--color-gold-dark)] mb-3">
                                Welcome Back
                            </p>
                            <h1 className="font-[family-name:var(--font-playfair)] text-[32px] sm:text-4xl lg:text-[42px] text-white lg:text-[var(--color-ink)] leading-[1.1] font-normal">
                                Sign In
                            </h1>
                            <div className="w-10 h-[2px] bg-gradient-to-r from-[var(--color-gold)] to-transparent mt-5 rounded-full" />
                        </motion.div>

                        {/* ─── Form ─── */}
                        <form onSubmit={handleSubmit} className="w-full">
                            
                            {/* Email */}
                            <motion.div variants={fadeUp} className="mb-5">
                                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50 lg:text-[var(--color-slate)] mb-2.5 font-[family-name:var(--font-cinzel)]">
                                    Email Address
                                </label>
                                <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                                    focusedField === 'email' 
                                        ? 'ring-2 ring-[var(--color-gold)]/40 shadow-[0_0_20px_rgba(226,178,39,0.08)]' 
                                        : ''
                                }`}>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full bg-white/[0.07] lg:bg-[var(--color-ink)]/[0.03] border border-white/10 lg:border-[var(--color-ink)]/10 rounded-xl px-4 py-3.5 text-[15px] text-white lg:text-[var(--color-ink)] placeholder:text-white/30 lg:placeholder:text-[var(--color-slate-light)] focus:outline-none focus:bg-white/[0.12] lg:focus:bg-white transition-all"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </motion.div>

                            {/* Password */}
                            <motion.div variants={fadeUp} className="mb-4">
                                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50 lg:text-[var(--color-slate)] mb-2.5 font-[family-name:var(--font-cinzel)]">
                                    Password
                                </label>
                                <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                                    focusedField === 'password' 
                                        ? 'ring-2 ring-[var(--color-gold)]/40 shadow-[0_0_20px_rgba(226,178,39,0.08)]' 
                                        : ''
                                }`}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full bg-white/[0.07] lg:bg-[var(--color-ink)]/[0.03] border border-white/10 lg:border-[var(--color-ink)]/10 rounded-xl px-4 py-3.5 pr-16 text-[15px] text-white lg:text-[var(--color-ink)] placeholder:text-white/30 lg:placeholder:text-[var(--color-slate-light)] focus:outline-none focus:bg-white/[0.12] lg:focus:bg-white transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.1em] uppercase text-white/40 lg:text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors font-medium"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Forgot Password — Clean single link */}
                            <motion.div variants={fadeUp} className="flex justify-end mb-7">
                                <button 
                                    type="button" 
                                    className="text-[11px] tracking-wide text-white/40 lg:text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </motion.div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="text-red-300 lg:text-red-600 text-[12px] bg-red-500/10 lg:bg-red-50 py-3 px-4 rounded-xl border border-red-500/20 lg:border-red-200 overflow-hidden"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button — Gold gradient with shine */}
                            <motion.div variants={fadeUp}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative overflow-hidden bg-gradient-to-r from-[var(--color-gold-dark)] via-[var(--color-gold)] to-[var(--color-gold-dark)] text-white py-4 text-[11px] tracking-[0.25em] uppercase rounded-xl transition-all duration-500 disabled:opacity-50 group hover:shadow-[0_8px_30px_rgba(226,178,39,0.3)] hover:scale-[1.01] active:scale-[0.99]"
                                    style={{ backgroundSize: '200% 100%', animation: 'auth-gradient-drift 6s ease infinite' }}
                                >
                                    {/* Animated shine sweep */}
                                    <div 
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{
                                            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
                                            animation: 'auth-shine 2s ease-in-out infinite',
                                        }}
                                    />
                                    <span className="relative z-10 flex items-center justify-center gap-2 font-medium">
                                        {loading ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Signing In...
                                            </>
                                        ) : (
                                            <>
                                                Sign In
                                                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </>
                                        )}
                                    </span>
                                </button>
                            </motion.div>
                        </form>

                        {/* ─── Divider ─── */}
                        <motion.div variants={fadeUp} className="relative flex items-center my-8">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 lg:via-[var(--color-ink)]/10 to-transparent" />
                            <span className="px-4 text-[9px] tracking-[0.2em] uppercase text-white/30 lg:text-[var(--color-slate)]">or</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 lg:via-[var(--color-ink)]/10 to-transparent" />
                        </motion.div>

                        {/* Google Button */}
                        <motion.div variants={fadeUp}>
                            <button
                                type="button"
                                disabled
                                className="w-full flex items-center justify-center gap-3 bg-white/[0.06] lg:bg-transparent border border-white/10 lg:border-[var(--color-ink)]/10 hover:border-[var(--color-gold)]/40 text-white/70 lg:text-[var(--color-ink)] transition-all py-3.5 text-[11px] tracking-[0.1em] uppercase rounded-xl cursor-not-allowed opacity-60"
                            >
                                <svg className="w-4 h-4 opacity-50" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google <span className="text-[8px] text-white/30 lg:text-[var(--color-slate-light)] lowercase ml-1">(coming soon)</span>
                            </button>
                        </motion.div>

                        {/* Sign Up Link */}
                        <motion.p variants={fadeUp} className="mt-8 mb-6 lg:mb-0 text-center lg:text-left text-[13px] text-white/50 lg:text-[var(--color-slate)]">
                            New here?{" "}
                            <Link 
                                href="/auth/register" 
                                className="text-[var(--color-gold)] lg:text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors font-medium"
                            >
                                Create an account
                            </Link>
                        </motion.p>
                    </motion.div>
                </div>
            </div>
        </div>
        </>
    );
}
