import { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "@/components/shop/ShopClient";

export const metadata: Metadata = {
    title: "Shop | JOYSHIDDENBEAUTY",
    description: "Explore the professional makeup tools and essentials behind every flawless JOYSHIDDENBEAUTY look.",
};

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FFFCF9]" />}>
            <ShopClient />
        </Suspense>
    );
}

