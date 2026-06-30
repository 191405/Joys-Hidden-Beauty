import os
from PIL import Image

def extract_emblem():
    img_path = r"c:\Users\HP\Downloads\Joys Hidden Beauty\frontend\public\logo-original.jpg"
    out_dir = r"c:\Users\HP\Downloads\Joys Hidden Beauty\frontend\public"
    
    if not os.path.exists(img_path):
        print(f"Error: Original logo not found at {img_path}")
        return
        
    print(f"Loading original logo from {img_path}...")
    img = Image.open(img_path).convert("RGBA")
    w, h = img.size
    
    # Rectangular crop to capture the full width of the JHB monogram
    # while keeping the bottom above the text.
    left = int(w * 0.28)
    right = int(w * 0.72)
    top = int(h * 0.18)
    bottom = int(h * 0.52)
    
    print(f"Cropping emblem at bounds: left={left}, top={top}, right={right}, bottom={bottom}...")
    cropped = img.crop((left, top, right, bottom))
    
    # Process pixels for transparency and anti-aliasing
    pixels = cropped.load()
    width, height = cropped.size
    
    # Create blank images for transparent Gold, Black, and White emblems
    gold_emblem = Image.new("RGBA", (width, height))
    black_emblem = Image.new("RGBA", (width, height))
    white_emblem = Image.new("RGBA", (width, height))
    
    gold_pixels = gold_emblem.load()
    black_pixels = black_emblem.load()
    white_pixels = white_emblem.load()
    
    print("Processing pixels and applying color key thresholding...")
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Gold colors have higher Red and Green, and lower Blue.
            diff = r - b
            
            # Anti-aliasing edge blending:
            t_low = 18
            t_high = 32
            
            if diff <= t_low:
                alpha = 0
            elif diff >= t_high:
                alpha = 255
            else:
                # Linear interpolation for anti-aliasing
                alpha = int(255 * (diff - t_low) / (t_high - t_low))
                
            if alpha > 0:
                # 1. Gold: Preserve the original rich metallic colors
                gold_pixels[x, y] = (r, g, b, alpha)
                # 2. Black: Pure black with smooth transparency
                black_pixels[x, y] = (0, 0, 0, alpha)
                # 3. White: Pure white with smooth transparency
                white_pixels[x, y] = (255, 255, 255, alpha)
            else:
                gold_pixels[x, y] = (0, 0, 0, 0)
                black_pixels[x, y] = (0, 0, 0, 0)
                white_pixels[x, y] = (0, 0, 0, 0)
                
    # Save the processed transparent assets
    gold_path = os.path.join(out_dir, "emblem-gold.png")
    black_path = os.path.join(out_dir, "emblem-black.png")
    white_path = os.path.join(out_dir, "emblem-white.png")
    
    print(f"Saving transparent Gold emblem to {gold_path}...")
    gold_emblem.save(gold_path, "PNG")
    
    print(f"Saving transparent Black emblem to {black_path}...")
    black_emblem.save(black_path, "PNG")
    
    print(f"Saving transparent White emblem to {white_path}...")
    white_emblem.save(white_path, "PNG")
    
    print("Emblem extraction completed successfully!")

if __name__ == "__main__":
    extract_emblem()
