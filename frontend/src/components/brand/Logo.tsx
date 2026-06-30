"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * JOYSHIDDENBEAUTY — Premium Brand Logo Component
 * Renders the isolated, transparent, background-free monogram emblem.
 * Supports:
 * - "emblem" (Standalone transparent gold, black, or white monogram seal)
 * - "full" (Horizontal or vertical transparent emblem + luxury HTML typography)
 * - "text" (Pure typographic serif brand name fallback)
 */
export default function Logo({
    color = "currentColor",
    size = "default",
    variant = "full",
    theme = "gold",
    className = ""
}: {
    color?: string;
    size?: "small" | "default" | "large";
    variant?: "emblem" | "full" | "text";
    theme?: "gold" | "black" | "white" | "dark" | "light";
    className?: string;
}) {
    // Determine emblem asset based on theme
    let emblemSrc = "/emblem-gold.png";
    let joysTextColor = "text-[var(--color-gold-dark)]";
    let beautyTextColor = "text-[var(--color-slate)]";

    if (theme === "black" || theme === "light") {
        emblemSrc = "/emblem-black.png";
        joysTextColor = "text-[var(--color-ink)]";
        beautyTextColor = "text-[var(--color-slate)]";
    } else if (theme === "white") {
        emblemSrc = "/emblem-white.png";
        joysTextColor = "text-[#FFFCF9]";
        beautyTextColor = "text-[#FFFCF9]/70";
    } else if (theme === "dark") {
        // Luxury dark theme: Gold emblem with crisp white/gold text
        emblemSrc = "/emblem-gold.png";
        joysTextColor = "text-[var(--color-gold-light)]";
        beautyTextColor = "text-[#FFFCF9]/80";
    }

    // Determine emblem pixel dimensions based on aspect ratio (approx 1.3 width to height)
    const emblemDimensions = 
        size === "small" ? { w: 47, h: 36 } : 
        size === "large" ? { w: 104, h: 80 } : 
        { w: 68, h: 52 };

    // --- Variant: "text" (Typographic luxury serif fallback) ---
    if (variant === "text") {
        const fontSize = size === "small" ? "text-xs sm:text-sm md:text-base" : size === "large" ? "text-xl sm:text-2xl md:text-3xl" : "text-[11px] sm:text-sm md:text-lg";
        return (
            <span
                className={`${fontSize} font-[family-name:var(--font-cinzel)] tracking-[0.1em] sm:tracking-[0.15em] font-medium leading-none uppercase whitespace-nowrap transition-all duration-500 ${className}`}
                style={{ color: theme === "white" ? "#FFFCF9" : theme === "black" ? "#0A0A0A" : color }}
            >
                Joys Hidden Beauty
            </span>
        );
    }

    // --- Variant: "emblem" (Standalone transparent gold monogram seal) ---
    if (variant === "emblem") {
        return (
            <motion.div
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`relative inline-flex items-center justify-center select-none pointer-events-none md:pointer-events-auto ${className}`}
            >
                <Image
                    src={emblemSrc}
                    alt="JHB Emblem"
                    width={emblemDimensions.w}
                    height={emblemDimensions.h}
                    className="object-contain pointer-events-none select-none filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                    priority
                />
            </motion.div>
        );
    }

    // --- Variant: "full" (Horizontal & Vertical brand cards incorporating the emblem and elegant HTML text) ---
    if (size === "small") {
        return (
            <motion.div
                whileHover={{ y: -1.5 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`relative inline-flex items-center gap-3 select-none ${className}`}
            >
                <div className="flex-shrink-0">
                    <Image
                        src={emblemSrc}
                        alt="JHB Emblem"
                        width={47}
                        height={36}
                        className="object-contain pointer-events-none select-none filter drop-shadow-[0_1px_4px_rgba(0,0,0,0.03)]"
                        priority
                    />
                </div>
                <div className="flex flex-col text-left select-none pr-1">
                    <span className={`text-[11px] tracking-[0.25em] font-[family-name:var(--font-cinzel)] font-semibold leading-tight uppercase ${joysTextColor}`}>Joys</span>
                    <span className={`text-[7px] tracking-[0.18em] font-[family-name:var(--font-cinzel)] leading-none uppercase ${beautyTextColor}`}>Hidden Beauty</span>
                </div>
            </motion.div>
        );
    }

    if (size === "large") {
        return (
            <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
            >
                <div className="flex-shrink-0">
                    <Image
                        src={emblemSrc}
                        alt="JHB Emblem"
                        width={104}
                        height={80}
                        className="object-contain pointer-events-none select-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                        priority
                    />
                </div>
                <div className="flex flex-col items-center mt-3.5 text-center select-none">
                    <span className={`text-xl tracking-[0.3em] font-[family-name:var(--font-cinzel)] font-semibold uppercase ${joysTextColor}`}>Joys</span>
                    <span className={`text-[9px] tracking-[0.25em] font-[family-name:var(--font-cinzel)] uppercase mt-1.5 ${beautyTextColor}`}>Hidden Beauty</span>
                </div>
            </motion.div>
        );
    }

    // Default "full" size
    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`relative inline-flex items-center gap-3.5 select-none ${className}`}
        >
            <div className="flex-shrink-0">
                <Image
                    src={emblemSrc}
                    alt="JHB Emblem"
                    width={68}
                    height={52}
                    className="object-contain pointer-events-none select-none filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                    priority
                />
            </div>
            <div className="flex flex-col text-left select-none pr-1">
                <span className={`text-[13px] tracking-[0.25em] font-[family-name:var(--font-cinzel)] font-semibold leading-tight uppercase ${joysTextColor}`}>Joys</span>
                <span className={`text-[8.5px] tracking-[0.18em] font-[family-name:var(--font-cinzel)] leading-none uppercase ${beautyTextColor}`}>Hidden Beauty</span>
            </div>
        </motion.div>
    );
}

