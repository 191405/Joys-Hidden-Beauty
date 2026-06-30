"use client";

import { motion } from "framer-motion";
import Logo from "@/components/brand/Logo";

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-md">
            <div className="relative flex flex-col items-center">
                {/* Gold circular rotating track */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: "linear",
                    }}
                    className="absolute w-28 h-28 border border-dashed border-[var(--color-gold-muted)] border-t-[var(--color-gold)] rounded-full"
                />

                {/* Pulsing Monogram Emblem */}
                <motion.div
                    animate={{
                        scale: [0.95, 1.05, 0.95],
                        opacity: [0.75, 1, 0.75]
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut"
                    }}
                    className="w-24 h-24 flex items-center justify-center"
                >
                    <Logo variant="emblem" size="large" theme="dark" />
                </motion.div>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="font-[family-name:var(--font-cinzel)] text-[9px] tracking-[0.35em] text-[#FFFCF9]/70 uppercase mt-8 select-none"
                >
                    Loading
                </motion.p>
            </div>
        </div>
    );
}
