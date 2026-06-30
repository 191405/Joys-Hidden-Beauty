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

export default function SplitHero() {
    return (
        <section className="relative min-h-screen flex flex-col md:flex-row overflow-hidden">

            {/* ── Left Panel — Image ── */}
            <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-screen md:flex-1 overflow-hidden shrink-0 basis-auto md:basis-1/2">
                {/* Image */}
                <motion.div
                    className="absolute inset-0 bg-cover bg-center scale-105"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1400&q=85')`,
                    }}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1.03 }}
                    transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                />

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
                    <motion.div variants={ITEM} className="flex flex-col sm:flex-row gap-4">
                        <Link href="/booking" className="btn-gold">
                            Book an Appointment
                        </Link>
                        <Link href="/services" className="btn-outline">
                            Explore Services
                        </Link>
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
