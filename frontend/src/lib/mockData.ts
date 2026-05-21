export interface Product {
    id: number;
    name: string;
    slug: string;
    category: string;
    price: number;
    description: string;
    ingredients: string[];
    tags: string[];
    image_url: string;
    images: string[];
}

export const PRODUCT_DATA: Record<number, Product> = {
    5: { id: 5, name: "Luminous Silk Foundation", slug: "luminous-silk-foundation", category: "Tools", price: 225, description: "Weightless, buildable coverage that mimics the look of naturally perfect skin.", ingredients: ["Silicone Elastomer", "Micro Pigments", "Vitamin E", "Hyaluronic Acid", "SPF 15"], tags: ["coverage", "foundation", "universal"], image_url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800", images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800", "https://images.unsplash.com/photo-1599733589046-10c7e543fa87?w=800"] },
    6: { id: 6, name: "Noir Velvet Lip Stain", slug: "noir-velvet-lip-stain", category: "Tools", price: 48, description: "A long-wear matte lip stain in editorial shades. Feels like nothing, lasts like quality.", ingredients: ["Beeswax", "Castor Oil", "Iron Oxides", "Vitamin E", "Shea Butter"], tags: ["lips", "matte", "long-wear"], image_url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800", images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800"] },
    8: { id: 8, name: "Crystal Gua Sha Set", slug: "crystal-gua-sha-set", category: "Tools", price: 78, description: "Rose quartz and jade gua sha stones, hand-carved for facial sculpting.", ingredients: ["Rose Quartz", "Jade"], tags: ["tools", "facial", "sculpting"], image_url: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800", images: ["https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800", "https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=800"] },
};
