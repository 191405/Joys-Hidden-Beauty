"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

/**
 * ParallaxImage — Scroll-linked parallax effect.
 * Uses Framer Motion useScroll + useTransform, wraps next/image.
 */
interface ParallaxImageProps {
    src: string;
    alt: string;
    className?: string;
    speed?: number;
}

export default function ParallaxImage({
    src,
    alt,
    className = "",
    speed = 0.3,
}: ParallaxImageProps) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 100}px`, `${speed * 100}px`]);

    return (
        <div ref={ref} className={`relative overflow-hidden ${className}`}>
            <motion.div style={{ y }} className="relative w-full h-[120%] -top-[10%]">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={90}
                />
            </motion.div>
        </div>
    );
}
