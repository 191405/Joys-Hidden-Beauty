import RevealOnScroll from "@/components/ui/RevealOnScroll";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Story & Philosophy | JOYSHIDDENBEAUTY",
    description: "Discover the origins of our quality beauty house. Where artistry meets science, and every product is a masterpiece.",
};

const VALUES = [
    {
        num: "01",
        title: "Artistry First",
        desc: "Every formula is composed, not manufactured. We approach beauty the way a sculptor approaches marble — with reverence, precision, and vision.",
    },
    {
        num: "02",
        title: "Radical Transparency",
        desc: "Every ingredient is listed, every source is traceable. We believe quality and honesty are not mutually exclusive — they are inseparable.",
    },
    {
        num: "03",
        title: "Bespoke Always",
        desc: "No two skins are the same. Our services are tailored to your unique profile because cookie-cutter beauty is not beauty at all.",
    },
];

export default function AboutPage() {
    return (
        <div className="pt-0 pb-0">

            {/* ══ Atmospheric Hero ══ */}
            <div
                className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
                style={{ background: "var(--color-ink)" }}
            >
                {/* Background image — iOS-safe (no fixed attachment) */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url('/images/about-hero.jpg')` }}
                />
                {/* Gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-b from-[rgba(26,26,26,0.2)] via-transparent to-[var(--color-ink)]" />

                <RevealOnScroll>
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <p className="label-luxury mb-6">Our Story</p>
                        <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-7xl font-medium leading-tight text-[var(--color-canvas)] mb-8">
                            The Art of Being
                            <br />
                            <span className="italic text-gold-shimmer">Beautiful</span>
                        </h1>
                        <div className="divider-gold mx-auto mb-8" />
                        <p className="text-[rgba(255,252,249,0.65)] text-base max-w-lg mx-auto leading-relaxed">
                            A beauty house built on reverence for artistry, science, and the extraordinary within every person.
                        </p>
                    </div>
                </RevealOnScroll>

                {/* Scroll indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2">
                    <span className="font-[family-name:var(--font-cinzel)] text-[9px] tracking-[0.3em] uppercase text-[rgba(255,252,249,0.4)]">Scroll</span>
                    <div className="w-[1px] h-8 bg-[var(--color-gold)] opacity-60 animate-scroll-down" />
                </div>
            </div>

            {/* ══ Founder Story — iOS-Safe Parallax ══ */}
            <section>
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[85vh]">
                    {/* Image — scale effect on hover instead of fixed attachment */}
                    <div className="relative h-[50vh] lg:h-auto overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[2s] hover:scale-100"
                            style={{ backgroundImage: `url('/images/about-hero.jpg')` }}
                        />
                    </div>

                    <div className="flex items-center justify-center px-8 md:px-16 lg:px-24 py-20 bg-[var(--color-canvas)]">
                        <RevealOnScroll>
                            <div className="max-w-md">
                                <p className="label-luxury mb-4">The Beginning</p>
                                <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl mb-6">
                                    Every great story begins
                                    <br />
                                    <span className="italic">with a vision</span>
                                </h2>
                                <div className="divider-gold" />
                                <p className="text-[var(--color-slate)] leading-relaxed mt-6 mb-4">
                                    JOYSHIDDENBEAUTY was born from a simple belief: that true beauty is not about
                                    conforming to a standard, but about revealing what&apos;s already extraordinary
                                    within you.
                                </p>
                                <p className="text-[var(--color-slate)] leading-relaxed">
                                    Founded with a passion for artistry and science, we set out to create a beauty
                                    house that treats every product as a masterpiece and every client as a muse.
                                </p>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* ══ Values — Numbered Pillars ══ */}
            <section className="section-gap bg-[var(--color-blush)]">
                <div className="container-luxury">
                    <RevealOnScroll>
                        <div className="text-center mb-16 md:mb-20">
                            <p className="label-luxury mb-4">Our Pillars</p>
                            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl">
                                What We Stand For
                            </h2>
                        </div>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
                        {VALUES.map((v, i) => (
                            <RevealOnScroll key={v.num} delay={i * 0.15}>
                                <div>
                                    <p
                                        className="font-[family-name:var(--font-playfair)] italic mb-4 leading-none"
                                        style={{
                                            fontSize: "clamp(3rem, 6vw, 5rem)",
                                            color: "rgba(212,175,55,0.2)",
                                        }}
                                    >
                                        {v.num}
                                    </p>
                                    <div className="w-8 h-[1px] bg-[var(--color-gold)] mb-5" />
                                    <h3 className="font-[family-name:var(--font-playfair)] text-xl mb-4">
                                        {v.title}
                                    </h3>
                                    <p className="text-sm text-[var(--color-slate)] leading-relaxed">
                                        {v.desc}
                                    </p>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ Ingredient Philosophy — iOS-Safe ══ */}
            <section>
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[85vh]">
                    <div className="flex items-center justify-center px-8 md:px-16 lg:px-24 py-20 bg-[var(--color-canvas)] order-2 lg:order-1">
                        <RevealOnScroll>
                            <div className="max-w-md">
                                <p className="label-luxury mb-4">The Ingredients</p>
                                <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl mb-6">
                                    Nature perfected
                                    <br />
                                    <span className="italic">by science</span>
                                </h2>
                                <div className="divider-gold" />
                                <p className="text-[var(--color-slate)] leading-relaxed mt-6 mb-4">
                                    We source the rarest botanicals — Damask roses from Bulgaria, oud from Cambodia,
                                    24K gold from ethical refineries. Every ingredient earns its place.
                                </p>
                                <p className="text-[var(--color-slate)] leading-relaxed">
                                    Our formulations are created by cosmetic chemists who believe in the marriage
                                    of nature and innovation. No filler. No compromise.
                                </p>
                            </div>
                        </RevealOnScroll>
                    </div>

                    <div className="relative h-[50vh] lg:h-auto overflow-hidden order-1 lg:order-2">
                        <div
                            className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[2s] hover:scale-100"
                            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&q=85')` }}
                        />
                    </div>
                </div>
            </section>

            {/* ══ CTA ══ */}
            <section className="section-gap bg-[var(--color-ink)] text-[var(--color-canvas)] text-center">
                <div className="container-editorial">
                    <RevealOnScroll>
                        <p className="label-luxury mb-6">Begin Your Journey</p>
                        <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl mb-10 text-[var(--color-canvas)]">
                            Ready to discover the hidden?
                        </h2>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/shop" className="btn-gold">
                                Explore Collections
                            </Link>
                            <Link
                                href="/booking"
                                className="btn-outline border-[rgba(255,252,249,0.35)] text-[var(--color-canvas)] hover:bg-[var(--color-canvas)] hover:text-[var(--color-ink)]"
                            >
                                Book a Session
                            </Link>
                        </div>
                    </RevealOnScroll>
                </div>
            </section>
        </div>
    );
}
