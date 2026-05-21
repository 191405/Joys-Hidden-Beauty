"use client";

import { useState, useEffect } from "react";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

interface Service {
    id: number;
    name: string;
    description: string;
    duration_minutes: number;
    price: number;
    category: string;
}

const CATEGORIES = ["All", "Bridal", "Studio", "Home"];

const PLACEHOLDER_SERVICES: Service[] = [
    { id: 1, name: "Casual makeup", description: "In-studio everyday soft glam.", duration_minutes: 45, price: 17000, category: "studio" },
    { id: 2, name: "Engagement/Introduction glams", description: "Makeup and gele inclusive.", duration_minutes: 90, price: 50000, category: "bridal" },
    { id: 3, name: "Owanbe glam", description: "Home service Owambe full glam within Ibadan.", duration_minutes: 120, price: 30000, category: "home" },
];

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await apiFetch<Service[]>("/booking/services");
                setServices(data.length > 0 ? data : PLACEHOLDER_SERVICES);
            } catch {
                setServices(PLACEHOLDER_SERVICES);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = activeCategory === "All"
        ? services
        : services.filter((s) => s.category === activeCategory);

    return (
        <div className="pt-0 pb-0">

            {/* ══ Atmospheric Hero ══ */}
            <div className="relative min-h-[55vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-[var(--color-ink)]">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-25"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1400&q=85')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-canvas)]" />

                <RevealOnScroll>
                    <div className="relative z-10 mt-24">
                        <p className="label-luxury mb-4">Bespoke Beauty</p>
                        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl text-[var(--color-canvas)] mb-6">
                            Our Services
                        </h1>
                        <div className="divider-gold mx-auto mb-6" />
                        <p className="text-[rgba(255,252,249,0.6)] max-w-md mx-auto text-base leading-relaxed">
                            Every treatment is a ritual. Every session is tailored to you.
                        </p>
                    </div>
                </RevealOnScroll>
            </div>

            {/* ══ Category Filters ══ */}
            <div className="bg-[var(--color-canvas)] border-b border-[rgba(26,26,26,0.06)] sticky top-[60px] md:top-16 z-30">
                <div className="container-luxury">
                    <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`relative py-5 px-6 font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.2em] uppercase whitespace-nowrap transition-colors duration-300 flex-shrink-0 ${activeCategory === cat
                                        ? "text-[var(--color-gold)]"
                                        : "text-[var(--color-slate)] hover:text-[var(--color-ink)]"
                                    }`}
                            >
                                {cat}
                                {activeCategory === cat && (
                                    <motion.div
                                        layoutId="service-tab-indicator"
                                        className="absolute bottom-0 left-0 right-0 h-[1px] bg-[var(--color-gold)]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══ Service List ══ */}
            <div className="section-gap bg-[var(--color-canvas)]">
                <div className="container-editorial">
                    {loading ? (
                        // Skeleton
                        <div className="space-y-12">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="py-10 border-b border-[rgba(26,26,26,0.06)]">
                                    <div className="skeleton h-3 w-24 mb-4 rounded" />
                                    <div className="skeleton h-7 w-2/3 mb-4 rounded" />
                                    <div className="skeleton h-4 w-full mb-2 rounded" />
                                    <div className="skeleton h-4 w-4/5 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            <LayoutGroup>
                                {filtered.map((service, i) => (
                                <motion.div
                                    key={service.id}
                                    layout
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                    className={`py-10 md:py-12 cursor-pointer group transition-colors ${i !== filtered.length - 1 ? "border-b border-[rgba(26,26,26,0.07)]" : ""
                                        }`}
                                    onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                        {/* Left */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="label-luxury">{service.category}</span>
                                                <span className="text-[var(--color-slate)] text-xs">·</span>
                                                <span className="text-xs text-[var(--color-slate)]">{service.duration_minutes} min</span>
                                            </div>
                                            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-3 group-hover:text-[var(--color-gold)] transition-colors duration-300">
                                                {service.name}
                                            </h2>
                                            <p className="text-[var(--color-slate)] text-sm leading-relaxed max-w-lg">
                                                {service.description}
                                            </p>

                                            {/* Expanded detail */}
                                            <AnimatePresence>
                                                {expandedId === service.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-5 pt-5 border-t border-[rgba(26,26,26,0.06)]">
                                                            <ul className="space-y-2">
                                                                {["Personalized consultation", "Premium product use only", "Complimentary aftercare guide"].map((point) => (
                                                                    <li key={point} className="flex items-center gap-3 text-sm text-[var(--color-slate)]">
                                                                        <span className="w-1 h-1 rounded-full bg-[var(--color-gold)] flex-shrink-0" />
                                                                        {point}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Right — Price & CTA */}
                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:min-w-[160px]">
                                            <p className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl">
                                                ₦{service.price.toLocaleString()}
                                            </p>
                                            <Link
                                                href="/booking"
                                                onClick={(e) => e.stopPropagation()}
                                                className="btn-gold text-[10px] py-3 px-6"
                                            >
                                                Book Now
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            </LayoutGroup>
                        </AnimatePresence>
                    )}

                    {!loading && filtered.length === 0 && (
                        <div className="text-center py-20 text-[var(--color-slate)]">
                            No services in this category yet.
                        </div>
                    )}
                </div>

                {/* Bottom CTA */}
                {!loading && (
                    <RevealOnScroll>
                        <div className="container-editorial text-center mt-20">
                            <p className="text-[var(--color-slate)] text-sm mb-6">
                                Can&apos;t find what you&apos;re looking for? We offer custom consultations tailored to your unique needs.
                            </p>
                            <Link href="/booking" className="btn-outline">
                                Schedule a Consultation
                            </Link>
                        </div>
                    </RevealOnScroll>
                )}
            </div>
        </div>
    );
}
