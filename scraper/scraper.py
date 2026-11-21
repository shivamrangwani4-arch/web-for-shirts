#!/usr/bin/env python3
"""
T-Shirt Deals Scraper for Top Pakistani Clothing Brands.
Fetches product title, brand, current price, original price, discount %, image, and product URL.
"""

import json
import os
import sys
import time
import ssl
import urllib.request
from datetime import datetime

# SSL context that works on all environments
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
}

# Stores configuration
STORES = [
    {
        "brand": "ELO (Export Leftovers)",
        "base_url": "https://exportleftovers.com",
        "tag": "Budget Champion",
        "badge_color": "#16a34a",
        "collections": [
            "mens-tee",
            "mens-basic-tee-shirt",
            "mens-printed-tee-shirt-copy",
            "mens-polos"
        ]
    },
    {
        "brand": "Outfitters",
        "base_url": "https://outfitters.com.pk",
        "tag": "Trending Style",
        "badge_color": "#ea580c",
        "collections": [
            "men-t-shirts",
            "men-polos"
        ]
    },
    {
        "brand": "Cougar",
        "base_url": "https://www.cougar.com.pk",
        "tag": "Casual Wear",
        "badge_color": "#2563eb",
        "collections": [
            "men-t-shirts",
            "men-polos"
        ]
    },
    {
        "brand": "Breakout",
        "base_url": "https://breakout.com.pk",
        "tag": "Urban Casual",
        "badge_color": "#9333ea",
        "collections": [
            "men-tees",
            "men-polo"
        ]
    },
    {
        "brand": "Cambridge",
        "base_url": "https://thecambridgeshop.com",
        "tag": "Premium Classic",
        "badge_color": "#0d9488",
        "collections": [
            "tees",
            "polo-shirts"
        ]
    }
]

def fetch_json(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15, context=CTX) as resp:
        return json.loads(resp.read().decode("utf-8"))

def scrape_store(store):
    brand = store["brand"]
    base_url = store["base_url"]
    tag = store["tag"]
    badge_color = store["badge_color"]
    items = []
    seen_ids = set()

    print(f"[*] Scraping {brand}...")

    for col in store["collections"]:
        url = f"{base_url}/collections/{col}/products.json?limit=250"
        try:
            data = fetch_json(url)
            products = data.get("products", [])
            print(f"    - Collection '{col}': found {len(products)} products")

            for p in products:
                pid = p.get("id")
                if pid in seen_ids:
                    continue

                variants = p.get("variants", [])
                if not variants:
                    continue

                # Available check
                is_available = any(v.get("available", True) for v in variants)
                if not is_available:
                    continue

                first_variant = variants[0]
                price_str = first_variant.get("price")
                compare_str = first_variant.get("compare_at_price")

                try:
                    price = float(price_str) if price_str else None
                except ValueError:
                    price = None

                try:
                    original_price = float(compare_str) if compare_str else None
                except ValueError:
                    original_price = None

                if price is None or price <= 0:
                    continue

                discount_percent = 0
                if original_price and original_price > price:
                    discount_percent = round(((original_price - price) / original_price) * 100)
                else:
                    original_price = price

                # Image
                images = p.get("images", [])
                image_url = images[0].get("src") if images else ""

                # Handle & URL
                handle = p.get("handle", "")
                product_url = f"{base_url}/products/{handle}" if handle else base_url

                # Category classification (Tee, Polo, Graphic, Basic)
                title = p.get("title", "").strip()
                title_lower = title.lower()

                category = "T-Shirt"
                if "polo" in title_lower:
                    category = "Polo"
                elif "graphic" in title_lower or "printed" in title_lower:
                    category = "Graphic Tee"
                elif "tank" in title_lower or "sleeveless" in title_lower:
                    category = "Tank Top"
                elif "long sleeve" in title_lower:
                    category = "Full Sleeve"
                elif "basic" in title_lower:
                    category = "Basic Tee"

                seen_ids.add(pid)
                items.append({
                    "id": f"{brand[:3].lower()}-{pid}",
                    "brand": brand,
                    "brand_tag": tag,
                    "brand_color": badge_color,
                    "title": title,
                    "category": category,
                    "price": int(round(price)),
                    "original_price": int(round(original_price)),
                    "discount_percent": discount_percent,
                    "image": image_url,
                    "url": product_url,
                    "available": True,
                    "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M")
                })
        except Exception as e:
            print(f"    [!] Error scraping collection '{col}' on {brand}: {e}")

        time.sleep(0.5)

    print(f"[+] Total valid t-shirts for {brand}: {len(items)}")
    return items

def main():
    print("=" * 60)
    print("Pakistani Brands T-Shirt Aggregator Scraper")
    print("Started at:", datetime.now().isoformat())
    print("=" * 60)

    all_products = []
    for store in STORES:
        store_items = scrape_store(store)
        all_products.extend(store_items)

    # Sort all products by price ascending by default (sasti pehle)
    all_products.sort(key=lambda x: x["price"])

    output_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "products.json")

    metadata = {
        "last_updated": datetime.now().strftime("%d %b %Y, %I:%M %p PKT"),
        "total_count": len(all_products),
        "brands_count": len(STORES),
        "min_price": all_products[0]["price"] if all_products else 0,
        "max_price": all_products[-1]["price"] if all_products else 0,
        "products": all_products
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print("=" * 60)
    print(f"Successfully scraped {len(all_products)} T-shirts!")
    if all_products:
        print(f"Price Range: Rs. {metadata['min_price']} - Rs. {metadata['max_price']}")
        print(f"Saved to: {output_path}")
    print("=" * 60)

if __name__ == "__main__":
    main()
