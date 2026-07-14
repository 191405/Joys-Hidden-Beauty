"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const STAGGER = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
};

const ITEM = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
    },
};

const LINE_GROW = {
    hidden: { scaleX: 0 },
    show: {
        scaleX: 1,
        transition: { duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
};

/** Sparkle particles for the text panel */
function Sparkles() {
    const particles = [
        { top: "12%", left: "85%", delay: 0, size: 3 },
        { top: "28%", left: "92%", delay: 1.2, size: 2 },
        { top: "65%", left: "88%", delay: 0.6, size: 4 },
        { top: "80%", left: "78%", delay: 1.8, size: 2 },
        { top: "45%", left: "95%", delay: 2.4, size: 3 },
    ];

    return (
        <>
            {particles.map((p, i) => (
                <span
                    key={i}
                    className="sparkle hidden lg:block"
                    style={{
                        top: p.top,
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        animationDelay: `${p.delay}s`,
                    }}
                />
            ))}
        </>
    );
}

export default function SplitHero() {
    return (
        <section className="relative min-h-screen flex flex-col md:flex-row overflow-hidden">

            {/* ── Left Panel — Image ── */}
            <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-screen md:flex-1 overflow-hidden shrink-0 basis-auto md:basis-1/2">
                {/* Image */}
                <motion.div
                    className="absolute inset-0 bg-cover bg-center scale-105"
                    style={{
                        backgroundImage: `url('/images/hero.jpg')`,
                    }}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1.03 }}
                    transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Grain texture overlay */}
                <div className="grain-overlay absolute inset-0 pointer-events-none" />

                {/* Scrim — right fade for desktop */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[rgba(255,252,249,0.08)]
                                              md:to-[rgba(255,252,249,0.18)]" />
                {/* Scrim — bottom fade for mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-canvas)] via-transparent to-transparent md:from-transparent" />
            </div>

            {/* ── Right Panel — Editorial Copy ── */}
            <div className="w-full md:flex-1 flex items-center justify-center
                            bg-[var(--color-canvas)] px-6 sm:px-12 md:px-12 lg:px-20 xl:px-24
                            py-16 md:py-0 relative shrink-0 basis-auto md:basis-1/2">

                {/* Sparkle particles */}
                <Sparkles />

                <motion.div
                    className="max-w-lg w-full"
                    variants={STAGGER}
                    initial="hidden"
                    animate="show"
                >
                    {/* Overline */}
                    <motion.p
                        variants={ITEM}
                        className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em]
                                   uppercase text-[var(--color-gold)] mb-6"
                    >
                        Quality Beauty Redefined
                    </motion.p>

                    {/* Heading */}
                    <motion.h1
                        variants={ITEM}
                        className="font-[family-name:var(--font-playfair)]
                                   text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem]
                                   font-medium leading-[1.05] tracking-tight mb-6"
                    >
                        Discover the
                        <br />
                        <span className="italic text-gold-shimmer">Hidden</span>
                    </motion.h1>

                    {/* Gold Rule */}
                    <motion.div
                        variants={LINE_GROW}
                        className="origin-left h-[1px] w-16 bg-gradient-to-r from-[var(--color-gold-dark)] to-[var(--color-gold-light)] mb-6"
                    />

                    {/* Body */}
                    <motion.p
                        variants={ITEM}
                        className="text-[var(--color-slate)] text-sm sm:text-base md:text-[0.95rem] lg:text-base leading-relaxed mb-8 sm:mb-10 max-w-md"
                    >
                        Where artistry meets science. Our curated collection of quality beauty essentials
                        is designed to reveal the extraordinary in you.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={ITEM} className="flex flex-col sm:flex-row gap-4 mb-10">
                        <Link href="/booking" className="btn-gold">
                            Book an Appointment
                        </Link>
                        <Link href="/services" className="btn-outline">
                            Explore Services
                        </Link>
                    </motion.div>

                    {/* Social Proof Badge */}
                    <motion.div
                        variants={ITEM}
                        className="flex items-center gap-4"
                    >
                        {/* Overlapping avatars */}
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 rounded-full border-2 border-[var(--color-canvas)] bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold-dark)]"
                                    style={{ zIndex: 5 - i }}
                                />
                            ))}
                        </div>
                        <div>
                            <div className="flex items-center gap-1 mb-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <svg key={i} className="w-3 h-3 text-[var(--color-gold)]" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-[10px] text-[var(--color-slate)] tracking-wide">
                                Trusted by <span className="font-semibold text-[var(--color-ink)]">200+</span> happy clients
                            </p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* ── Scroll Indicator ── */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8, duration: 0.6 }}
                >
                    <span className="font-[family-name:var(--font-cinzel)] text-[9px] tracking-[0.3em] uppercase text-[var(--color-slate)]">
                        Scroll
                    </span>
                    <div className="w-[1px] h-10 bg-[var(--color-gold)] origin-top animate-scroll-down" />
                </motion.div>
            </div>
        </section>
    );
}
