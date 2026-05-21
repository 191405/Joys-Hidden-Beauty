"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface SmartMirrorCardProps {
    id: number;
    name: string;
    slug: string;
    price: number;
    category: string;
    imageUrl: string;
    textureUrl: string;
}

export default function SmartMirrorCard({
    id,
    name,
    slug,
    price,
    category,
    imageUrl,
    textureUrl,
}: SmartMirrorCardProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <Link href={`/shop/${id}`} className="group block">
            <div
                className="relative cursor-pointer"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* ── Image Container ── */}
                <div className="relative aspect-[3/4] overflow-hidden mb-5 bg-[var(--color-mist)]">

                    {/* Gold border — inside image */}
                    <motion.div
                        className="absolute inset-0 z-10 pointer-events-none border border-[var(--color-gold)]"
                        animate={{ opacity: hovered ? 0.7 : 0 }}
                        transition={{ duration: 0.4 }}
                    />

                    {/* Main Product Image */}
                    <motion.div
                        className="absolute inset-0"
                        animate={{ opacity: hovered ? 0 : 1 }}
                        transition={{ duration: 0.65, ease: "easeInOut" }}
                    >
                        <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    </motion.div>

                    {/* Texture/Swatch — revealed on hover, scales slightly for cinema feel */}
                    <motion.div
                        className="absolute inset-0"
                        animate={{
                            opacity: hovered ? 1 : 0,
                            scale: hovered ? 1.04 : 1,
                        }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Image
                            src={textureUrl || imageUrl}
                            alt={`${name} texture`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    </motion.div>

                    {/* ── Quick View Overlay ── */}
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 py-3.5 bg-[rgba(10,10,10,0.75)] backdrop-blur-sm"
                        animate={{ y: hovered ? 0 : "100%" }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="w-4 h-[1px] bg-[var(--color-gold)]" />
                        <span className="font-[family-name:var(--font-cinzel)] text-[9px] tracking-[0.3em] uppercase text-[var(--color-canvas)]">
                            View
                        </span>
                        <span className="w-4 h-[1px] bg-[var(--color-gold)]" />
                    </motion.div>
                </div>

                {/* ── Product Info ── */}
                <div className="space-y-1.5 px-1">
                    <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.15em] uppercase text-[var(--color-slate)]">
                        {category}
                    </p>
                    <h3 className="font-[family-name:var(--font-playfair)] text-base font-medium leading-snug group-hover:text-[var(--color-gold)] transition-colors duration-300">
                        {name}
                    </h3>
                    <p className="text-sm text-[var(--color-ink)] font-light tracking-wide">
                        ${price.toFixed(2)}
                    </p>
                </div>
            </div>
        </Link>
    );
}
