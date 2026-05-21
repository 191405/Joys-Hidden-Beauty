"use client";

import { motion, AnimatePresence } from "framer-motion";

/**
 * VelvetDrawer — Luxury slide-out drawer.
 * Slow eased animation, heavy backdrop dim (0.7 opacity).
 * Used for shopping cart and mobile menu.
 */
interface VelvetDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function VelvetDrawer({ isOpen, onClose, title, children }: VelvetDrawerProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop — heavy dim */}
                    <motion.div
                        className="fixed inset-0 z-[60] bg-[rgba(26,26,26,0.7)]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        onClick={onClose}
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md bg-[var(--color-canvas)] shadow-2xl"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="h-full flex flex-col p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-[family-name:var(--font-cinzel)] text-sm tracking-[0.2em] uppercase">
                                    {title}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:opacity-60 transition-opacity"
                                    aria-label="Close drawer"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="divider-gold" />

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
