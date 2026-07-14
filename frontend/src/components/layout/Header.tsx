"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import VelvetDrawer from "@/components/ui/VelvetDrawer";
import { getToken } from "@/lib/api";
import Logo from "@/components/brand/Logo";

const NAV_LINKS = [
    { href: "/shop", label: "Shop" },
    { href: "/services", label: "Services" },
    { href: "/booking", label: "Book" },
    { href: "/about", label: "About" },
];

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const pathname = usePathname();

    // Recheck auth state whenever pathname changes (login/logout)
    useEffect(() => {
        try {
            const token = getToken();
            setIsLoggedIn(!!token);
            if (token) {
                const payload = JSON.parse(atob(token.split(".")[1]));
                setIsAdmin(payload.role === "admin");
            } else {
                setIsAdmin(false);
            }
        } catch {
            setIsAdmin(false);
            setIsLoggedIn(false);
        }
    }, [pathname]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const isActive = (href: string) => pathname === href;

    if (pathname?.startsWith("/auth")) {
        return null;
    }

    return (
        <>
            <motion.header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled
                        ? "bg-[#0a0a0a]/92 backdrop-blur-2xl border-b border-white/8 py-3 shadow-[0_4px_40px_rgba(0,0,0,0.3)]"
                        : "bg-gradient-to-b from-black/75 to-transparent py-5 md:py-7"
                    }`}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="max-w-[1600px] mx-auto px-5 md:px-8 relative flex items-center justify-between md:grid md:grid-cols-12">

                    {/* ── LEFT: Hamburger + Desktop Nav Left ── */}
                    <div className="flex items-center md:col-span-4 justify-start z-20 gap-3">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMenuOpen(true)}
                            className="md:hidden p-2 -ml-2 text-[#FFFCF9] hover:text-[var(--color-gold)] transition-colors"
                            aria-label="Open menu"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                <line x1="0" y1="7" x2="24" y2="7" />
                                <line x1="4" y1="17" x2="24" y2="17" />
                            </svg>
                        </button>

                        {/* Desktop nav — left half */}
                        <nav className="hidden md:flex items-center gap-10 lg:gap-12">
                            {NAV_LINKS.slice(0, 2).map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="relative group text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-cinzel)] text-[#FFFCF9]/90 hover:text-[var(--color-gold)] transition-colors duration-300"
                                >
                                    {link.label}
                                    <span
                                        className={`absolute -bottom-2 left-0 h-[1px] bg-[var(--color-gold)] transition-all duration-500 ease-out ${isActive(link.href) ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                                            }`}
                                    />
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* ── CENTER: Logo ── */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0 md:col-span-4 flex justify-center z-10 pointer-events-none md:pointer-events-auto">
                        <Link href="/" className="pointer-events-auto focus:outline-none flex items-center justify-center" aria-label="Joys Hidden Beauty Home">
                            <motion.div
                                className="flex flex-col items-center"
                                animate={{
                                    y: scrolled ? 0 : 2,
                                }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <Logo 
                                    variant="text" 
                                    size={scrolled ? "small" : "default"} 
                                    theme={scrolled ? "gold" : "white"}
                                    className="transition-all duration-500"
                                />
                            </motion.div>
                        </Link>
                    </div>

                    {/* ── RIGHT: Desktop Nav Right + Icons ── */}
                    <div className="flex items-center md:col-span-4 justify-end gap-4 sm:gap-8 lg:gap-10 z-20">
                        {/* Desktop nav — right half */}
                        <nav className="hidden md:flex items-center gap-10 lg:gap-12">
                            {NAV_LINKS.slice(2).map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="relative group text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-cinzel)] text-[#FFFCF9]/90 hover:text-[var(--color-gold)] transition-colors duration-300"
                                >
                                    {link.label}
                                    <span
                                        className={`absolute -bottom-2 left-0 h-[1px] bg-[var(--color-gold)] transition-all duration-500 ease-out ${isActive(link.href) ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                                            }`}
                                    />
                                </Link>
                            ))}
                        </nav>

                        {/* Admin link (visible only for admins) */}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="hidden md:block relative group text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-cinzel)] text-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors duration-300"
                            >
                                Admin
                            </Link>
                        )}


                        {/* Account icon — links to /account when logged in, /auth/login when not */}
                        <Link
                            href={isLoggedIn ? "/account" : "/auth/login"}
                            aria-label="Account"
                            className="text-[#FFFCF9] hover:text-[var(--color-gold)] transition-colors duration-300"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </Link>

                        {/* Bag icon */}
                        <button
                            onClick={() => setCartOpen(true)}
                            aria-label="Open cart"
                            className="relative group text-[#FFFCF9] hover:text-[var(--color-gold)] transition-colors duration-300"
                        >
                            {/* Dot indicator */}
                            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[var(--color-gold)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* ══ Mobile Menu Drawer ══ */}
            <VelvetDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
                <nav className="flex flex-col mt-6">
                    {NAV_LINKS.map((link, i) => (
                        <motion.div
                            key={link.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={menuOpen ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <Link
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center justify-between py-5 border-b border-[rgba(26,26,26,0.06)] font-[family-name:var(--font-cinzel)] text-sm tracking-[0.25em] uppercase transition-colors ${isActive(link.href)
                                        ? "text-[var(--color-gold)]"
                                        : "text-[var(--color-ink)] hover:text-[var(--color-gold)]"
                                    }`}
                            >
                                {link.label}
                                {isActive(link.href) && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
                                )}
                            </Link>
                        </motion.div>
                    ))}
                    {/* Admin link in mobile drawer */}
                    {isAdmin && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={menuOpen ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: NAV_LINKS.length * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <Link
                                href="/admin"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 py-5 border-b border-[rgba(26,26,26,0.06)] font-[family-name:var(--font-cinzel)] text-sm tracking-[0.25em] uppercase text-[var(--color-gold)] hover:text-[var(--color-ink)] transition-colors"
                            >
                                ◈ Admin
                            </Link>
                        </motion.div>
                    )}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={menuOpen ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: (NAV_LINKS.length + 1) * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Link
                            href={isLoggedIn ? "/account" : "/auth/login"}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 py-5 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.25em] uppercase text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            {isLoggedIn ? "Account" : "Sign In"}
                        </Link>
                    </motion.div>
                </nav>
            </VelvetDrawer>

            {/* ══ Cart Drawer ══ */}
            <VelvetDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} title="Your Bag">
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-12 h-12 rounded-full border border-[rgba(26,26,26,0.1)] flex items-center justify-center mb-4">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                    </div>
                    <p className="text-[var(--color-slate)] text-sm mb-6">Your bag is empty</p>
                    <Link
                        href="/shop"
                        onClick={() => setCartOpen(false)}
                        className="btn-gold text-xs"
                    >
                        Explore Collections
                    </Link>
                </div>
            </VelvetDrawer>
        </>
    );
}
