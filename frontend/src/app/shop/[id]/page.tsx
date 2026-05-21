import Link from "next/link";
import { Metadata } from "next";
import { PRODUCT_DATA } from "@/lib/mockData";
import ProductDetailClient from "@/components/shop/ProductDetailClient";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const product = PRODUCT_DATA[parseInt(params.id)];

    if (!product) {
        return {
            title: "Product Not Found | JOYSHIDDENBEAUTY",
        };
    }

    return {
        title: `${product.name} | JOYSHIDDENBEAUTY`,
        description: product.description,
        openGraph: {
            title: `${product.name} | JOYSHIDDENBEAUTY`,
            description: product.description,
            images: [product.image_url],
        },
    };
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const productId = parseInt(params.id);
    const product = PRODUCT_DATA[productId];

    if (!product) {
        return (
            <div className="pt-40 pb-20 text-center">
                <h1 className="font-[family-name:var(--font-playfair)] text-3xl mb-4">Product Not Found</h1>
                <Link href="/shop" className="btn-outline">Back to Shop</Link>
            </div>
        );
    }

    return <ProductDetailClient product={product} />;
}
