"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/brand/Logo";

const FOOTER_LINKS = {
    "The House": [
        { href: "/about", label: "Our Story" },
        { href: "/services", label: "Services" },
        { href: "/booking", label: "Book Appointment" },
    ],
    "Collections": [
        { href: "/shop", label: "Makeup / Tools" },
    ],
    "Client Care": [
        { href: "/auth/login", label: "My Account" },
        { href: "/contact", label: "Contact Us" },
    ],
};

const SOCIAL = [
    {
        label: "Instagram",
        href: "https://www.instagram.com/joyshiddenbeauty",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" strokeWidth="0" />
            </svg>
        ),
    },
    {
        label: "TikTok",
        href: "https://www.tiktok.com/@joyshiddenbeauty",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" />
            </svg>
        ),
    },
    {
        label: "WhatsApp",
        href: "https://wa.me/234",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
        ),
    },
];

export default function Footer() {
    const pathname = usePathname();

    if (pathname?.startsWith("/auth")) {
        return null;
    }

    return (
        <footer className="bg-[var(--color-ink)] text-[var(--color-canvas)]">
            {/* Gold top accent */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-40" />

            <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-20">
                {/* ── Top Grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-block focus:outline-none">
                            <Logo variant="full" size="default" theme="dark" />
                        </Link>

                        <p className="mt-6 text-sm text-[rgba(255,252,249,0.55)] max-w-sm leading-relaxed">
                            Where luxury meets artistry. Every product is curated, every service is bespoke,
                            every moment is designed to reveal your hidden beauty.
                        </p>

                        {/* Newsletter */}
                        <div className="mt-8">
                            <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.2em] uppercase mb-4 text-[rgba(255,252,249,0.7)]">
                                Join the Inner Circle
                            </p>
                            <div className="flex">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="flex-1 min-w-0 px-4 py-3 bg-transparent input-luxury-dark text-sm"
                                    style={{ borderRight: "none" }}
                                />
                                <button className="px-5 py-3 bg-[var(--color-gold)] text-[var(--color-ink)] font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.15em] uppercase whitespace-nowrap hover:bg-[var(--color-gold-dark)] transition-colors duration-300">
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Link Columns */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:col-span-3">
                        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
                            <div key={title}>
                                <h4 className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.25em] uppercase mb-6 text-[var(--color-gold)]">
                                    {title}
                                </h4>
                                <ul className="space-y-3.5">
                                    {links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-[rgba(255,252,249,0.55)] hover:text-[var(--color-gold)] transition-colors duration-300 leading-relaxed"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Bottom Bar ── */}
                <div className="border-t border-[rgba(255,252,249,0.08)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[rgba(255,252,249,0.35)] tracking-[0.05em]">
                        © {new Date().getFullYear()} JOYSHIDDENBEAUTY. All rights reserved.
                    </p>

                    {/* Social Icons */}
                    <div className="flex items-center gap-5">
                        {SOCIAL.map((s) => (
                            <a
                                key={s.label}
                                href={s.href}
                                aria-label={s.label}
                                className="text-[rgba(255,252,249,0.4)] hover:text-[var(--color-gold)] transition-colors duration-300"
                            >
                                {s.icon}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
