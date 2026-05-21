"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * RevealOnScroll — Framer Motion wrapper.
 * Fade-up + subtle scale on viewport entry.
 */
interface RevealProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

export default function RevealOnScroll({ children, delay = 0, className = "" }: RevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{
                duration: 0.8,
                delay,
                ease: [0.16, 1, 0.3, 1],
            }}
            style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
