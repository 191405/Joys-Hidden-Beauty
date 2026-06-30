"use client";

import SplitHero from "@/components/hero/SplitHero";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import Link from "next/link";
import { useState } from "react";

const TESTIMONIALS = [
  {
    quote: "The Velvet Serum transformed my skin. I've never felt so radiant.",
    author: "Amira K.",
    title: "Devoted Client",
  },
  {
    quote: "The Signature Facial was pure indulgence. An experience, not just a treatment.",
    author: "Sophia L.",
    title: "Bridal Package Client",
  },
  {
    quote: "Sacred Oud is unlike anything I've ever worn. Unforgettable.",
    author: "James R.",
    title: "Fragrance Connoisseur",
  },
];

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);

  return (
    <>
      {/* ══ Hero ══ */}
      <SplitHero />

      {/* ══ The Collection ══ */}
      <section className="section-gap bg-[var(--color-canvas)]">
        <div className="container-luxury">
          <RevealOnScroll>
            <div className="text-center">
              <p className="label-luxury mb-4">The Collection</p>
              <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl italic text-[var(--color-slate-light)] mb-8">
                Coming Soon
              </h2>
              <div className="divider-gold mx-auto mb-8" />
              <p className="text-[var(--color-slate)] text-base max-w-lg mx-auto leading-relaxed mb-10">
                We are meticulously crafting our debut line of quality essentials. 
                Experience our bespoke booking services while we perfect the collection.
              </p>
              <Link href="/waitlist" className="btn-gold">
                Join the Waitlist
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ══ Editorial Band ══ */}
      <section className="relative section-gap bg-[var(--color-blush)] overflow-hidden">
        {/* Background large numeral */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(12rem, 30vw, 28rem)",
            color: "var(--color-gold-muted)",
            fontStyle: "italic",
            lineHeight: 1,
          }}
        >
          JHB
        </div>

        <div className="container-editorial relative text-center">
          <RevealOnScroll>
            <p className="label-luxury mb-6">Our Philosophy</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl md:text-5xl italic leading-tight mb-8">
              &ldquo;Beauty is not about perfection.
              <br className="hidden sm:block" />{" "}
              It&apos;s about the art of being you.&rdquo;
            </h2>
            <div className="divider-gold mx-auto mb-8" />
            <p className="text-[var(--color-slate)] text-base max-w-lg mx-auto leading-relaxed">
              Every formula is a masterpiece. Every ingredient is chosen with intention.
              We don&apos;t follow trends — we set the standard.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ══ Services Preview ══ */}
      <section className="section-gap bg-[var(--color-canvas)]">
        <div className="container-luxury">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <RevealOnScroll>
              <div className="relative aspect-[4/5] overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center scale-105 hover:scale-100 transition-transform duration-700"
                  style={{
                    // User uploaded image
                    backgroundImage: `url('/images/home/gele-glam.jpg')`,
                  }}
                />
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2}>
              <div className="max-w-md">
                <p className="label-luxury mb-4">Bespoke Makeup Artistry</p>
                <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl mb-6">
                  Indulge in the
                  <br />
                  <span className="italic">Extraordinary</span>
                </h2>
                <div className="divider-gold" />
                <p className="text-[var(--color-slate)] leading-relaxed mb-4 mt-6 text-sm sm:text-[0.95rem] md:text-base">
                  From flawless Bridal packages to stunning Studio and Home Owambe glams, every makeup application and gele styling is tailored to highlight your unique beauty profile.
                </p>
                <ul className="space-y-3 mb-10">
                  {["Bridal Packages", "Studio Glamour", "Home Services", "Gele Styling"].map((svc) => (
                    <li key={svc} className="flex items-center gap-3 text-sm text-[var(--color-slate)]">
                      <span className="w-1.5 h-1.5 bg-[var(--color-gold)] rounded-full flex-shrink-0" />
                      {svc}
                    </li>
                  ))}
                </ul>
                <Link href="/booking" className="btn-gold">
                  Book Now
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ══ Testimonials ══ */}
      <section className="section-gap bg-[var(--color-ink)] text-[var(--color-canvas)]">
        <div className="container-luxury">
          <RevealOnScroll>
            <div className="text-center mb-16">
              <p className="label-luxury mb-4">The Inner Circle</p>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-[var(--color-canvas)]">
                Words of Radiance
              </h2>
            </div>
          </RevealOnScroll>

          {/* Desktop Grid / Mobile Horizontal Scroll */}
          <div className="flex gap-6 sm:gap-10 overflow-x-auto pb-6 no-scrollbar md:overflow-x-visible md:grid md:grid-cols-3 md:gap-12 md:pb-0 snap-x snap-mandatory md:snap-none pl-4 sm:pl-0 pr-4 sm:pr-0">
            {TESTIMONIALS.map((t, i) => (
              <RevealOnScroll key={i} delay={i * 0.15}>
                <div className="text-center flex-shrink-0 w-[80vw] md:w-auto snap-center">
                  <div className="text-[var(--color-gold)] text-4xl mb-4 font-[family-name:var(--font-playfair)]">&ldquo;</div>
                  <p className="font-[family-name:var(--font-playfair)] text-lg italic leading-relaxed mb-6 text-[rgba(255,252,249,0.85)]">
                    {t.quote}
                  </p>
                  <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.2em] uppercase text-[var(--color-gold)]">
                    {t.author}
                  </p>
                  <p className="text-xs text-[rgba(255,252,249,0.35)] mt-1 tracking-wide">{t.title}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Newsletter Strip ══ */}
      <section className="section-gap bg-[var(--color-blush)]">
        <div className="container-editorial text-center">
          <RevealOnScroll>
            <p className="label-luxury mb-4">Stay Connected</p>
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-3">
              Join the Inner Circle
            </h3>
            <p className="text-sm text-[var(--color-slate)] mb-10 max-w-sm mx-auto">
              Exclusive access to new collections, bespoke offers, and beauty insights.
            </p>

            {/* Floating label email input */}
            <div className="relative flex max-w-md mx-auto">
              <div className="relative flex-1">
                <input
                  type="email"
                  id="newsletter-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className="input-luxury w-full pt-5 pb-3 peer"
                  placeholder=" "
                />
                <label
                  htmlFor="newsletter-email"
                  className={`absolute left-5 transition-all duration-200 pointer-events-none text-[var(--color-slate)] ${emailFocused || email
                      ? "top-1.5 text-[10px] tracking-[0.1em] uppercase text-[var(--color-gold)]"
                      : "top-1/2 -translate-y-1/2 text-sm"
                    }`}
                >
                  Your email address
                </label>
              </div>
              <button className="px-7 py-4 bg-[var(--color-gold)] text-[var(--color-canvas)] font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.15em] uppercase hover:bg-[var(--color-gold-dark)] transition-colors duration-300 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
