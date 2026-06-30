"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Product {
    id: number;
    name: string;
    slug: string;
    category: string;
    price: number;
    description: string;
    image_url: string;
    tags: string[];
}

// All subcategories from the seed data, in display order
const ALL_SUBCATEGORIES = [
    { key: "skin prep",     label: "Skin Prep" },
    { key: "skin work",     label: "Skin Work" },
    { key: "brows",         label: "Brows" },
    { key: "eyes",          label: "Eyes" },
    { key: "lips",          label: "Lips" },
    { key: "final touches", label: "Final Touches" },
];

// Footer uses ?category=makeup or ?category=tools — both map to ALL products
const FILTER_TABS = ["All", "Skin Prep", "Skin Work", "Brows", "Eyes", "Lips", "Final Touches"];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ─── Component ───────────────────────────────────────────────────────────────
export default function ShopClient() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All");
    const [error, setError] = useState(false);

    // Derive initial tab from URL param (?category=tools → "All" since all are tools)
    useEffect(() => {
        const cat = searchParams.get("category");
        if (cat) setActiveTab("All"); // Both 'tools' and 'makeup' show everything
    }, [searchParams]);

    // Fetch all products once
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`${API_BASE}/catalog/products`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setProducts(data.products ?? []);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // Filter by active subcategory tab
    const filtered = activeTab === "All"
        ? products
        : products.filter(p => p.category.toLowerCase() === activeTab.toLowerCase());

    // Group products by subcategory for "All" view
    const groupedByCategory = ALL_SUBCATEGORIES.map(sub => ({
        ...sub,
        items: products.filter(p => p.category === sub.key),
    })).filter(g => g.items.length > 0);

    return (
        <div className="min-h-screen bg-[var(--color-canvas)] grain-overlay">

            {/* ── Page Hero ── */}
            <div className="relative h-[38vh] min-h-[260px] flex items-end overflow-hidden bg-[var(--color-ink)]">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: "url(https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1400)",
                        backgroundSize: "cover",
                        backgroundPosition: "center 30%",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/60 to-transparent" />
                <div className="relative z-10 max-w-[1400px] mx-auto w-full px-6 md:px-10 pb-10 md:pb-14">
                    <RevealOnScroll>
                        <p className="label-luxury mb-3 text-[var(--color-gold)]">The Collection</p>
                        <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FFFCF9] leading-tight break-words">
                            Artistry <span className="italic text-gold-shimmer">Essentials</span>
                        </h1>
                    </RevealOnScroll>
                </div>
            </div>

            {/* ── Category Filter Tabs ── */}
            <div className="sticky top-[60px] z-30 bg-[var(--color-canvas)]/95 backdrop-blur-xl border-b border-[rgba(0,0,0,0.06)]">
                <div className="max-w-[1400px] mx-auto px-4 md:px-10 overflow-x-auto no-scrollbar">
                    <div className="flex gap-2 md:gap-3 py-3 min-w-max">
                        {FILTER_TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full text-xs tracking-[0.12em] font-[family-name:var(--font-cinzel)] uppercase transition-all duration-300 whitespace-nowrap ${
                                    activeTab === tab
                                        ? "bg-[var(--color-ink)] text-[var(--color-gold)] shadow-sm"
                                        : "text-[var(--color-slate)] hover:text-[var(--color-ink)]"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-10 md:py-16">

                {loading && (
                    <div className="flex justify-center items-center py-24">
                        <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {error && !loading && (
                    <div className="text-center py-24">
                        <p className="text-[var(--color-slate)] mb-4">Could not load products. Please try again.</p>
                        <button onClick={fetchProducts} className="btn-gold text-xs">
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <AnimatePresence mode="wait">
                        {activeTab === "All" ? (
                            /* Grouped view */
                            <motion.div
                                key="all"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.35 }}
                                className="space-y-16"
                            >
                                {groupedByCategory.map(group => (
                                    <section key={group.key}>
                                        {/* Section header */}
                                        <div className="flex items-center gap-4 mb-6">
                                            <h2 className="font-[family-name:var(--font-cinzel)] text-[11px] tracking-[0.25em] uppercase text-[var(--color-gold)]">
                                                {group.label}
                                            </h2>
                                            <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-gold)]/30 to-transparent" />
                                        </div>
                                        <ProductGrid products={group.items} />
                                    </section>
                                ))}
                            </motion.div>
                        ) : (
                            /* Filtered single-category view */
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.35 }}
                            >
                                {filtered.length === 0 ? (
                                    <div className="text-center py-24">
                                        <p className="font-[family-name:var(--font-playfair)] text-2xl italic text-[var(--color-slate)] mb-3">Coming Soon</p>
                                        <p className="text-sm text-[var(--color-slate)]/60">This category is being curated.</p>
                                    </div>
                                ) : (
                                    <ProductGrid products={filtered} />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

// ─── Product Grid ─────────────────────────────────────────────────────────────
function ProductGrid({ products }: { products: Product[] }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
            {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
            ))}
        </div>
    );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, index }: { product: Product; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.04 }}
            className="group"
        >
            <div className="relative overflow-hidden rounded-sm bg-[var(--color-blush)] aspect-square mb-3">
                <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[var(--color-ink)]/0 group-hover:bg-[var(--color-ink)]/30 transition-all duration-500 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.2em] uppercase text-white border border-white/60 px-3 py-2">
                        View Details
                    </span>
                </div>
                {/* Coming Soon badge when price is 0 */}
                {product.price === 0 && (
                    <div className="absolute top-2 left-2 bg-[var(--color-ink)]/80 text-[var(--color-gold)] text-[9px] font-[family-name:var(--font-cinzel)] tracking-[0.15em] uppercase px-2 py-1 rounded-sm">
                        Coming Soon
                    </div>
                )}
            </div>

            <div className="px-0.5">
                <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.15em] uppercase text-[var(--color-slate)] mb-1">
                    {product.category}
                </p>
                <h3 className="text-sm font-medium text-[var(--color-ink)] leading-snug mb-1 line-clamp-2">
                    {product.name}
                </h3>
                <p className="text-xs text-[var(--color-slate)]">
                    {product.price === 0 ? "Price TBD" : `₦${product.price.toLocaleString()}`}
                </p>
            </div>
        </motion.div>
    );
}
