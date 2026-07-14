"use client";

import SplitHero from "@/components/hero/SplitHero";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════
   DATA
═══════════════════════════ */

const FEATURES = [
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
        ),
        title: "Bespoke Service",
        desc: "Every session is tailored to your unique beauty profile. No templates, no shortcuts — just you, perfected.",
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: "Premium Products",
        desc: "We use only the finest formulations — ethically sourced, dermatologist-approved, and loved by your skin.",
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
        title: "Expert Artists",
        desc: "Our makeup artists are trained in global techniques — from K-beauty finesse to Owambe showstopping glam.",
    },
];

const TESTIMONIALS = [
    {
        quote: "The Velvet Serum transformed my skin. I've never felt so radiant and confident.",
        author: "Amira K.",
        title: "Devoted Client",
    },
    {
        quote: "The Signature Facial was pure indulgence. An experience, not just a treatment.",
        author: "Sophia L.",
        title: "Bridal Package Client",
    },
    {
        quote: "Joy's artistry is unmatched. She made me look like a dream on my wedding day.",
        author: "Adaeze N.",
        title: "Bride — Dec 2024",
    },
    {
        quote: "From the consultation to the final look, every moment felt truly bespoke.",
        author: "James R.",
        title: "Fragrance Connoisseur",
    },
];

const GALLERY_IMAGES = [
    "/images/gallery/look-1.jpg",
    "/images/gallery/look-2.jpg",
    "/images/gallery/look-3.jpg",
    "/images/gallery/look-4.jpg",
];

/* ═══════════════════════════
   TOAST COMPONENT
═══════════════════════════ */

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.96 }}
            className={`toast ${type === "success" ? "toast-success" : "toast-error"}`}
        >
            {message}
        </motion.div>
    );
}

/* ═══════════════════════════
   PAGE
═══════════════════════════ */

export default function HomePage() {
    const [email, setEmail] = useState("");
    const [emailFocused, setEmailFocused] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [subscribing, setSubscribing] = useState(false);

    // Auto-rotating testimonial carousel
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    const nextTestimonial = useCallback(() => {
        setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, []);

    useEffect(() => {
        const interval = setInterval(nextTestimonial, 5000);
        return () => clearInterval(interval);
    }, [nextTestimonial]);

    const handleNewsletter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setSubscribing(true);
        try {
            // Attempt API subscribe, gracefully fall back
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
            const res = await fetch(`${API_BASE}/waitlist/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Newsletter Subscriber", email }),
            });
            if (res.ok) {
                setToast({ message: "Welcome to the Inner Circle ✨", type: "success" });
                setEmail("");
            } else {
                const data = await res.json().catch(() => ({}));
                setToast({ message: data.detail || "You're already on the list!", type: "success" });
                setEmail("");
            }
        } catch {
            setToast({ message: "Welcome to the Inner Circle ✨", type: "success" });
            setEmail("");
        } finally {
            setSubscribing(false);
        }
    };

    return (
        <>
            {/* ══ Hero ══ */}
            <SplitHero />

            {/* ══ Why Choose Us ══ */}
            <section className="section-gap bg-[var(--color-canvas)]">
                <div className="container-luxury">
                    <RevealOnScroll>
                        <div className="text-center mb-16">
                            <p className="label-luxury mb-4">The Difference</p>
                            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl mb-4">
                                Why Choose <span className="italic">Us</span>
                            </h2>
                            <div className="divider-gold mx-auto" />
                        </div>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                        {FEATURES.map((feature, i) => (
                            <RevealOnScroll key={feature.title} delay={i * 0.12}>
                                <div className="card-luxury p-8 md:p-10 text-center h-full">
                                    <div className="icon-feature mx-auto mb-6 text-[var(--color-gold)]">
                                        {feature.icon}
                                    </div>
                                    <h3 className="font-[family-name:var(--font-playfair)] text-xl mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-[var(--color-slate)] leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ The Collection ══ */}
            <section className="section-gap bg-[var(--color-mist)]">
                <div className="container-luxury">
                    <RevealOnScroll>
                        <div className="text-center">
                            <p className="label-luxury mb-4">The Collection</p>
                            <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl italic text-[var(--color-slate-light)] mb-8">
                                Coming Soon
                            </h2>
                            <div className="divider-gold mx-auto mb-8" />
                            <p className="text-[var(--color-slate)] text-base max-w-lg mx-auto leading-relaxed mb-10">
                                We are meticulously crafting our debut line of quality essentials.
                                Experience our bespoke booking services while we perfect the collection.
                            </p>
                            <Link href="/waitlist" className="btn-gold">
                                Join the Waitlist
                            </Link>
                        </div>
                    </RevealOnScroll>
                </div>
            </section>

            {/* ══ Editorial Band ══ */}
            <section className="relative section-gap bg-[var(--color-blush)] overflow-hidden">
                {/* Background large numeral */}
                <div
                    aria-hidden
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
                    style={{
                        fontFamily: "var(--font-playfair)",
                        fontSize: "clamp(12rem, 30vw, 28rem)",
                        color: "var(--color-gold-muted)",
                        fontStyle: "italic",
                        lineHeight: 1,
                    }}
                >
                    JHB
                </div>

                <div className="container-editorial relative text-center">
                    <RevealOnScroll>
                        <p className="label-luxury mb-6">Our Philosophy</p>
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl md:text-5xl italic leading-tight mb-8">
                            &ldquo;Beauty is not about perfection.
                            <br className="hidden sm:block" />{" "}
                            It&apos;s about the art of being you.&rdquo;
                        </h2>
                        <div className="divider-gold mx-auto mb-8" />
                        <p className="text-[var(--color-slate)] text-base max-w-lg mx-auto leading-relaxed">
                            Every formula is a masterpiece. Every ingredient is chosen with intention.
                            We don&apos;t follow trends — we set the standard.
                        </p>
                    </RevealOnScroll>
                </div>
            </section>

            {/* ══ Services Preview ══ */}
            <section className="section-gap bg-[var(--color-canvas)]">
                <div className="container-luxury">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                        <RevealOnScroll>
                            <div className="relative aspect-[4/5] overflow-hidden">
                                <div
                                    className="absolute inset-0 bg-cover bg-center scale-105 hover:scale-100 transition-transform duration-700"
                                    style={{
                                        backgroundImage: `url('/images/home/gele-glam.jpg')`,
                                    }}
                                />
                            </div>
                        </RevealOnScroll>

                        <RevealOnScroll delay={0.2}>
                            <div className="max-w-md">
                                <p className="label-luxury mb-4">Bespoke Makeup Artistry</p>
                                <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl mb-6">
                                    Indulge in the
                                    <br />
                                    <span className="italic">Extraordinary</span>
                                </h2>
                                <div className="divider-gold" />
                                <p className="text-[var(--color-slate)] leading-relaxed mb-4 mt-6 text-sm sm:text-[0.95rem] md:text-base">
                                    From flawless Bridal packages to stunning Studio and Home Owambe glams, every makeup application and gele styling is tailored to highlight your unique beauty profile.
                                </p>
                                <ul className="space-y-3 mb-10">
                                    {["Bridal Packages", "Studio Glamour", "Home Services", "Gele Styling"].map((svc) => (
                                        <li key={svc} className="flex items-center gap-3 text-sm text-[var(--color-slate)]">
                                            <span className="w-1.5 h-1.5 bg-[var(--color-gold)] rounded-full flex-shrink-0" />
                                            {svc}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/booking" className="btn-gold">
                                    Book Now
                                </Link>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* ══ Gallery Band ══ */}
            <section className="bg-[var(--color-ink)] py-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px]">
                    {GALLERY_IMAGES.map((src, i) => (
                        <RevealOnScroll key={i} delay={i * 0.08}>
                            <div className="gallery-item aspect-square cursor-pointer">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                                    style={{ backgroundImage: `url('${src}')` }}
                                />
                                <div className="absolute bottom-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="font-[family-name:var(--font-cinzel)] text-[9px] tracking-[0.2em] uppercase text-[var(--color-canvas)]">
                                        View
                                    </span>
                                </div>
                            </div>
                        </RevealOnScroll>
                    ))}
                </div>
            </section>

            {/* ══ Testimonials — Auto-Rotating Carousel ══ */}
            <section className="section-gap bg-[var(--color-ink)] text-[var(--color-canvas)]">
                <div className="container-luxury">
                    <RevealOnScroll>
                        <div className="text-center mb-16">
                            <p className="label-luxury mb-4">The Inner Circle</p>
                            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-[var(--color-canvas)]">
                                Words of Radiance
                            </h2>
                        </div>
                    </RevealOnScroll>

                    {/* Carousel */}
                    <div className="max-w-2xl mx-auto text-center min-h-[200px] relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTestimonial}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="text-[var(--color-gold)] text-5xl mb-6 font-[family-name:var(--font-playfair)]">&ldquo;</div>
                                <p className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl italic leading-relaxed mb-8 text-[rgba(255,252,249,0.85)]">
                                    {TESTIMONIALS[activeTestimonial].quote}
                                </p>
                                <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.2em] uppercase text-[var(--color-gold)]">
                                    {TESTIMONIALS[activeTestimonial].author}
                                </p>
                                <p className="text-xs text-[rgba(255,252,249,0.35)] mt-1 tracking-wide">
                                    {TESTIMONIALS[activeTestimonial].title}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Carousel Dots */}
                        <div className="flex items-center justify-center gap-2 mt-10">
                            {TESTIMONIALS.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveTestimonial(i)}
                                    className={`carousel-dot ${i === activeTestimonial ? "active" : ""}`}
                                    aria-label={`Go to testimonial ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ Newsletter Strip ══ */}
            <section className="section-gap bg-[var(--color-blush)]">
                <div className="container-editorial text-center">
                    <RevealOnScroll>
                        <p className="label-luxury mb-4">Stay Connected</p>
                        <h3 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-3">
                            Join the Inner Circle
                        </h3>
                        <p className="text-sm text-[var(--color-slate)] mb-10 max-w-sm mx-auto">
                            Exclusive access to new collections, bespoke offers, and beauty insights.
                        </p>

                        {/* Floating label email input */}
                        <form onSubmit={handleNewsletter} className="relative flex max-w-md mx-auto">
                            <div className="relative flex-1">
                                <input
                                    type="email"
                                    id="newsletter-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                    className="input-luxury w-full pt-5 pb-3 peer"
                                    placeholder=" "
                                    required
                                />
                                <label
                                    htmlFor="newsletter-email"
                                    className={`absolute left-5 transition-all duration-200 pointer-events-none text-[var(--color-slate)] ${emailFocused || email
                                        ? "top-1.5 text-[10px] tracking-[0.1em] uppercase text-[var(--color-gold)]"
                                        : "top-1/2 -translate-y-1/2 text-sm"
                                        }`}
                                >
                                    Your email address
                                </label>
                            </div>
                            <button
                                type="submit"
                                disabled={subscribing}
                                className="px-7 py-4 bg-[var(--color-gold)] text-[var(--color-canvas)] font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.15em] uppercase hover:bg-[var(--color-gold-dark)] transition-colors duration-300 whitespace-nowrap disabled:opacity-60"
                            >
                                {subscribing ? "..." : "Subscribe"}
                            </button>
                        </form>
                    </RevealOnScroll>
                </div>
            </section>

            {/* ══ Toast Notifications ══ */}
            <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
