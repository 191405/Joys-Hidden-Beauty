"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { Product } from "@/lib/mockData";

export default function ProductDetailClient({ product }: { product: Product }) {
    const [selectedImage, setSelectedImage] = useState(0);

    return (
        <div className="pt-32 pb-20">
            <div className="max-w-[1400px] mx-auto px-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-[var(--color-slate)] mb-10">
                    <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/shop" className="hover:text-[var(--color-ink)] transition-colors">Shop</Link>
                    <span>/</span>
                    <span className="text-[var(--color-ink)]">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Image Gallery */}
                    <RevealOnScroll>
                        <div>
                            <motion.div
                                className="relative aspect-square overflow-hidden bg-[var(--color-mist)] mb-4"
                                key={selectedImage}
                                initial={{ opacity: 0.5 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Image
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            </motion.div>

                            {product.images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto flex-nowrap pb-2 no-scrollbar">
                                    {product.images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImage(i)}
                                            className={`relative w-20 h-20 overflow-hidden border-2 transition-all ${selectedImage === i ? "border-[var(--color-gold)]" : "border-transparent"
                                                }`}
                                        >
                                            <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </RevealOnScroll>

                    {/* Product Info */}
                    <RevealOnScroll delay={0.2}>
                        <div className="max-w-lg">
                            <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.3em] uppercase text-[var(--color-gold)] mb-3">
                                {product.category}
                            </p>
                            <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl mb-4">
                                {product.name}
                            </h1>
                            <p className="text-xl mb-6">${product.price.toFixed(2)}</p>
                            <div className="divider-gold" />
                            <p className="text-[var(--color-slate)] leading-relaxed mt-6 mb-8">
                                {product.description}
                            </p>

                            {/* Add to Bag */}
                            <button className="btn-gold w-full justify-center mb-4">
                                Add to Bag
                            </button>
                            <button className="btn-outline w-full justify-center">
                                Add to Wishlist
                            </button>

                            {/* Ingredients */}
                            <div className="mt-12">
                                <h3 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] uppercase mb-4">
                                    Key Ingredients
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.ingredients.map((ing) => (
                                        <span
                                            key={ing}
                                            className="px-3 py-1.5 text-xs bg-[var(--color-blush)] text-[var(--color-ink)]"
                                        >
                                            {ing}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="mt-8">
                                <h3 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] uppercase mb-4">
                                    Benefits
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1.5 text-xs border border-[rgba(212,175,55,0.3)] text-[var(--color-slate)]"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </RevealOnScroll>
                </div>
            </div>
        </div>
    );
}
