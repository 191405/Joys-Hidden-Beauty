"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

const INQUIRY_TYPES = [
    "General Inquiry",
    "Order Assistance",
    "Bespoke Booking",
    "Press & Media"
];

export default function ContactClient() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [inquiryType, setInquiryType] = useState(INQUIRY_TYPES[0]);
    const [message, setMessage] = useState("");
    
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            await apiFetch("/contact/", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    email,
                    inquiry_type: inquiryType,
                    message
                })
            });
            setStatus("success");
            setName("");
            setEmail("");
            setMessage("");
            setInquiryType(INQUIRY_TYPES[0]);
        } catch (err: any) {
            setStatus("error");
            setErrorMessage(err.message || "Failed to send inquiry.");
        }
    };

    return (
        <div className="min-h-[90vh] bg-[var(--color-ink)] flex items-center justify-center px-6 py-24 relative overflow-hidden">
            {/* Atmospheric Background */}
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=1600&q=80')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,10,10,0.9)] via-[rgba(10,10,10,0.7)] to-[rgba(10,10,10,0.4)] pointer-events-none" />

            <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                
                {/* Left Side: Typography & Info */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <p className="label-luxury mb-6 text-[var(--color-gold)]">The Concierge</p>
                    <h1 className="font-[family-name:var(--font-playfair)] text-5xl lg:text-7xl text-[var(--color-canvas)] leading-tight mb-8">
                        At Your
                        <br />
                        <span className="italic text-gold-shimmer">Service</span>
                    </h1>
                    <div className="divider-gold mb-8" />
                    <p className="text-[rgba(255,252,249,0.7)] text-lg leading-relaxed max-w-md mb-12">
                        Whether you seek bespoke beauty advice, order assistance, or press inquiries, our Concierge team is dedicated to providing an unparalleled experience.
                    </p>

                    <div className="space-y-6">
                        <div>
                            <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.2em] text-[var(--color-gold)] uppercase mb-2">Direct Channel</p>
                            <p className="text-[var(--color-canvas)] text-sm tracking-wide">concierge@joyshiddenbeauty.com</p>
                        </div>
                        <div>
                            <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.2em] text-[var(--color-gold)] uppercase mb-2">Atelier Hours</p>
                            <p className="text-[var(--color-canvas)] text-sm tracking-wide">Monday - Friday, 9:00 AM - 6:00 PM EST</p>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Form */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="backdrop-blur-md bg-white/5 border border-white/10 p-8 lg:p-12 relative overflow-hidden shadow-2xl"
                >
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[var(--color-gold)] opacity-30 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[var(--color-gold)] opacity-30 pointer-events-none" />

                    <h2 className="font-[family-name:var(--font-cinzel)] text-xl tracking-[0.2em] text-[var(--color-canvas)] mb-8 uppercase text-center">
                        Submit Inquiry
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-[family-name:var(--font-cinzel)] tracking-[0.2em] text-[rgba(255,252,249,0.6)] uppercase mb-2">Full Name</label>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-transparent border-b border-[rgba(255,252,249,0.2)] pb-3 text-[var(--color-canvas)] text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                                placeholder="Your elegant name"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-[family-name:var(--font-cinzel)] tracking-[0.2em] text-[rgba(255,252,249,0.6)] uppercase mb-2">Email Address</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-b border-[rgba(255,252,249,0.2)] pb-3 text-[var(--color-canvas)] text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-[family-name:var(--font-cinzel)] tracking-[0.2em] text-[rgba(255,252,249,0.6)] uppercase mb-2">Inquiry Type</label>
                            <div className="relative">
                                <select 
                                    value={inquiryType}
                                    onChange={(e) => setInquiryType(e.target.value)}
                                    className="w-full bg-transparent border-b border-[rgba(255,252,249,0.2)] pb-3 text-[var(--color-canvas)] text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors appearance-none cursor-pointer"
                                >
                                    {INQUIRY_TYPES.map(t => (
                                        <option key={t} value={t} className="bg-[#121212] text-[var(--color-canvas)]">{t}</option>
                                    ))}
                                </select>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-gold)] text-xs">▼</div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-[family-name:var(--font-cinzel)] tracking-[0.2em] text-[rgba(255,252,249,0.6)] uppercase mb-2">Your Message</label>
                            <textarea 
                                required
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-transparent border border-[rgba(255,252,249,0.2)] p-4 text-[var(--color-canvas)] text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none"
                                placeholder="How may we assist you today?"
                            />
                        </div>

                        <AnimatePresence>
                            {status === "error" && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-red-400 text-sm mt-4 tracking-wide"
                                >
                                    {errorMessage}
                                </motion.div>
                            )}
                            {status === "success" && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-[var(--color-gold)] text-sm mt-4 text-center tracking-wide"
                                >
                                    Your inquiry has been gracefully received.
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button 
                            type="submit"
                            disabled={status === "loading" || status === "success"}
                            className="w-full py-4 mt-6 bg-[var(--color-gold)] text-black font-[family-name:var(--font-cinzel)] text-[11px] tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === "loading" ? "Transmitting..." : status === "success" ? "Received" : "Send Inquiry"}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
