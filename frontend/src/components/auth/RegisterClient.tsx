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
        onError: () => setError("Google login failed. Please try again."),
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
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
    };

    return (
        <div className="min-h-screen flex relative bg-[#FAF8F5] lg:bg-[var(--color-canvas)] selection:bg-[var(--color-gold)] selection:text-white overflow-hidden">
            
            {/* Left Column — Full Bleed Editorial Image (Desktop Only) */}
            <div className="hidden lg:block lg:w-[55%] relative overflow-hidden flex-shrink-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-[20s] hover:scale-100"
                    style={{ backgroundImage: `url('/images/login-portrait.jpg')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
            </div>

            {/* Right Column — Responsive Content Wrapper */}
            <div className="w-full lg:w-[45%] flex flex-col items-center justify-center min-h-screen relative z-10 px-4 sm:px-6 lg:px-12 py-12 overflow-y-auto">
                
                {/* Mobile Full-Screen Background Image (Hidden on Desktop) */}
                <div className="absolute inset-0 lg:hidden pointer-events-none z-0 fixed">
                    <div 
                        className="absolute inset-0 bg-cover"
                        style={{ 
                            backgroundImage: `url('/images/auth-mobile-bg.jpg')`, 
                            backgroundPosition: 'center 15%' 
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
                </div>

                {/* Floating Frosted Logo Pill (Mobile Only) */}
                <motion.div 
                    className="lg:hidden absolute top-8 left-6 z-20"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full shadow-lg flex items-center justify-center">
                        <Logo variant="full" size="small" theme="white" />
                    </div>
                </motion.div>

                {/* Clean, Elegant Form Card */}
                <motion.div
                    className="relative z-10 w-full max-w-[420px] bg-white/95 lg:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none border border-white/50 lg:border-none shadow-[0_8px_40px_rgba(0,0,0,0.12)] lg:shadow-none rounded-[32px] lg:rounded-none p-8 sm:p-10 lg:p-0 my-16 lg:my-0"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-full flex flex-col"
                    >
                        {/* Logo for Desktop Only */}
                        <motion.div variants={itemVariants} className="hidden lg:flex justify-start mb-10">
                            <Logo variant="text" size="large" theme="gold" className="!tracking-[0.1em]" />
                        </motion.div>

                        {/* Title Header */}
                        <motion.div variants={itemVariants} className="flex flex-col items-center lg:items-start space-y-3 mb-8">
                            <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.3em] uppercase text-[var(--color-gold)]">
                                Join the Waitlist
                            </p>
                            <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl text-[var(--color-ink)] leading-tight">
                                Create Account
                            </h1>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="flex flex-col space-y-5 w-full">
                            {/* Full Name Input */}
                            <motion.div variants={itemVariants} className="relative group w-full">
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="peer w-full bg-[#F5F5F5] lg:bg-white/50 border border-transparent lg:border-[rgba(0,0,0,0.05)] rounded-2xl px-5 py-3.5 text-[15px] focus:outline-none focus:bg-white focus:border-[var(--color-gold)] focus:ring-4 focus:ring-[var(--color-gold)]/10 transition-all text-[var(--color-ink)] placeholder-transparent"
                                    placeholder="Full Name"
                                    required
                                />
                                <label className="absolute left-5 top-3.5 text-[13px] text-[var(--color-slate)] transition-all pointer-events-none peer-placeholder-shown:text-[15px] peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:left-4 peer-focus:text-[11px] peer-focus:bg-white peer-focus:px-1.5 peer-focus:text-[var(--color-gold)] rounded-md">
                                    Full Name
                                </label>
                            </motion.div>

                            {/* Email Input */}
                            <motion.div variants={itemVariants} className="relative group w-full">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="peer w-full bg-[#F5F5F5] lg:bg-white/50 border border-transparent lg:border-[rgba(0,0,0,0.05)] rounded-2xl px-5 py-3.5 text-[15px] focus:outline-none focus:bg-white focus:border-[var(--color-gold)] focus:ring-4 focus:ring-[var(--color-gold)]/10 transition-all text-[var(--color-ink)] placeholder-transparent"
                                    placeholder="Email Address"
                                    required
                                />
                                <label className="absolute left-5 top-3.5 text-[13px] text-[var(--color-slate)] transition-all pointer-events-none peer-placeholder-shown:text-[15px] peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:left-4 peer-focus:text-[11px] peer-focus:bg-white peer-focus:px-1.5 peer-focus:text-[var(--color-gold)] rounded-md">
                                    Email Address
                                </label>
                            </motion.div>

                            {/* Password Input */}
                            <motion.div variants={itemVariants} className="relative group w-full">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="peer w-full bg-[#F5F5F5] lg:bg-white/50 border border-transparent lg:border-[rgba(0,0,0,0.05)] rounded-2xl px-5 py-3.5 pr-14 text-[15px] focus:outline-none focus:bg-white focus:border-[var(--color-gold)] focus:ring-4 focus:ring-[var(--color-gold)]/10 transition-all text-[var(--color-ink)] placeholder-transparent"
                                    placeholder="Password"
                                    required
                                />
                                <label className="absolute left-5 top-3.5 text-[13px] text-[var(--color-slate)] transition-all pointer-events-none peer-placeholder-shown:text-[15px] peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:left-4 peer-focus:text-[11px] peer-focus:bg-white peer-focus:px-1.5 peer-focus:text-[var(--color-gold)] rounded-md">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-[16px] text-[10px] tracking-wider uppercase text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </motion.div>

                            {/* Confirm Password Input */}
                            <motion.div variants={itemVariants} className="relative group w-full">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="peer w-full bg-[#F5F5F5] lg:bg-white/50 border border-transparent lg:border-[rgba(0,0,0,0.05)] rounded-2xl px-5 py-3.5 pr-14 text-[15px] focus:outline-none focus:bg-white focus:border-[var(--color-gold)] focus:ring-4 focus:ring-[var(--color-gold)]/10 transition-all text-[var(--color-ink)] placeholder-transparent"
                                    placeholder="Confirm Password"
                                    required
                                />
                                <label className="absolute left-5 top-3.5 text-[13px] text-[var(--color-slate)] transition-all pointer-events-none peer-placeholder-shown:text-[15px] peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:left-4 peer-focus:text-[11px] peer-focus:bg-white peer-focus:px-1.5 peer-focus:text-[var(--color-gold)] rounded-md">
                                    Confirm Password
                                </label>
                            </motion.div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-red-600 text-xs bg-red-50 py-3 px-4 rounded-xl border border-red-100 overflow-hidden"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <motion.div variants={itemVariants} className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#1A1A1A] hover:bg-[var(--color-gold)] hover:shadow-xl hover:shadow-[var(--color-gold)]/20 text-white py-[16px] text-[11px] tracking-[0.2em] uppercase rounded-2xl transition-all duration-300 disabled:opacity-50 relative overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2 transition-transform duration-300 group-hover:scale-105">
                                        {loading ? "Creating Account..." : "Create Account"}
                                        {!loading && (
                                            <svg className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        )}
                                    </span>
                                </button>
                            </motion.div>
                        </form>

                        {/* Divider */}
                        <motion.div variants={itemVariants} className="relative flex items-center justify-center mt-8 mb-6">
                            <div className="border-t border-[rgba(0,0,0,0.05)] w-full"></div>
                            <span className="bg-white/95 lg:bg-[var(--color-canvas)] px-4 text-[9px] tracking-widest uppercase text-[var(--color-slate)] absolute">Or</span>
                        </motion.div>

                        {/* Google Button */}
                        <motion.div variants={itemVariants}>
                            <button
                                type="button"
                                onClick={() => loginWithGoogle()}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-white/50 lg:bg-transparent border border-[rgba(0,0,0,0.08)] hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/5 text-[var(--color-ink)] transition-all py-3.5 text-[11px] tracking-wider uppercase rounded-2xl group"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </button>
                        </motion.div>

                        {/* Sign In Link */}
                        <motion.p variants={itemVariants} className="mt-8 text-center lg:text-left text-[13px] text-[var(--color-slate)]">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors ml-1 font-medium underline underline-offset-4 decoration-transparent hover:decoration-[var(--color-gold)]">
                                Sign In
                            </Link>
                        </motion.p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
