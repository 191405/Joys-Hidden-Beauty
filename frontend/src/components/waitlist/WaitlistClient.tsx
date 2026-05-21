"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

export default function WaitlistClient() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const res = await fetch("http://localhost:8000/api/v1/waitlist/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email }),
            });

            if (!res.ok) {
                setStatus("error");
                return;
            }

            setStatus("success");
            setEmail("");
            setName("");
        } catch (error) {
            console.error("Waitlist error:", error);
            setStatus("error");
        }
    };

    return (
        <div className="pt-0 pb-0 min-h-screen bg-[var(--color-canvas)]">
            <div
                className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden"
            >
                {/* Background Element */}
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-mist)] to-[var(--color-canvas)] opacity-40" />

                <RevealOnScroll>
                    <div className="relative z-10 max-w-2xl mx-auto pt-20">
                        <p className="label-luxury mb-6">The Inner Circle</p>
                        <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl font-medium leading-tight text-[var(--color-ink)] mb-8">
                            Anticipate
                            <br />
                            <span className="italic text-[var(--color-gold)]">Excellence</span>
                        </h1>
                        <div className="divider-gold mx-auto mb-8" />
                        <p className="text-[var(--color-slate)] text-base max-w-lg mx-auto leading-relaxed mb-12">
                            We are meticulously crafting our debut line of quality beauty essentials.
                            Join the waitlist to receive exclusive early access, behind-the-scenes insights, and special previews.
                        </p>

                        {/* Waitlist Form */}
                        <div className="max-w-md mx-auto bg-white p-8 border border-[var(--color-mist)] shadow-sm">
                            {status === "success" ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-6"
                                >
                                    <div className="w-12 h-12 rounded-full border border-[var(--color-gold)] flex items-center justify-center mx-auto mb-4">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[var(--color-ink)] mb-2">
                                        Welcome to the Circle
                                    </h3>
                                    <p className="text-[var(--color-slate)] text-sm">
                                        You have successfully joined our waitlist. We will be in touch soon.
                                    </p>
                                    <button
                                        onClick={() => setStatus("idle")}
                                        className="mt-6 text-xs tracking-widest uppercase text-[var(--color-gold)] hover:text-[var(--color-ink)] transition-colors"
                                    >
                                        Return
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.form
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label htmlFor="name" className="block text-left text-xs uppercase tracking-widest text-[var(--color-slate)] mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-transparent border-b border-[var(--color-mist)] py-2 text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] transition-colors placeholder:opacity-40"
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-left text-xs uppercase tracking-widest text-[var(--color-slate)] mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-transparent border-b border-[var(--color-mist)] py-2 text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] transition-colors placeholder:opacity-40"
                                            placeholder="jane@example.com"
                                        />
                                    </div>

                                    {status === "error" && (
                                        <p className="text-red-500 text-xs text-left">
                                            An error occurred. Please try again.
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className="btn-gold w-full flex justify-center items-center h-12"
                                    >
                                        {status === "loading" ? (
                                            <div className="flex space-x-1">
                                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                                            </div>
                                        ) : (
                                            "Submit"
                                        )}
                                    </button>
                                </motion.form>
                            )}
                        </div>

                        <div className="mt-16">
                            <Link href="/" className="text-xs uppercase tracking-[0.2em] font-[family-name:var(--font-cinzel)] text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors">
                                Return to Home
                            </Link>
                        </div>
                    </div>
                </RevealOnScroll>
            </div>
        </div>
    );
}
