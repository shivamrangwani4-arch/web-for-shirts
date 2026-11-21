# 👕 T-Shirts.pk — Pakistan's Smart T-Shirt Price Comparison & Deals Finder

> **Problem Solved**: Pakistan mein sasti aur behtareen quality ki t-shirts dhoondne ke liye logon ko 10 mukhtalif brand websites (Outfitters, ELO, Cougar, Breakout, wagheera) par jana parta tha aur prices compare karni parti thin. Yeh platform tamam brands ki t-shirts ko aik hi jagah ikattha karta hai taake user sab se sasti shirts (starting as low as Rs. 399!) aik click par dhoond sakein.

---

## ✨ Features

- 💸 **Sab Se Sasti Pehle (Price: Low to High)**: Automatically sorted by lowest price first.
- 🏷️ **Multi-Brand Catalog**:
  - **ELO (Export Leftovers)** — High quality surplus & basic tees from Rs. 399 - 1499.
  - **Outfitters** — Trending high-street fashion & graphic tees.
  - **Cougar** — Casual wear & polos.
  - **Breakout** — Urban street style.
  - **Cambridge** — Premium classic tees & pique polos.
- 🔍 **Instant Live Search**: Search by style, color, or keyword (e.g. *Polo, Oversized, Graphic, Basic, Black*).
- 🏷️ **Filters**: Filter by Brand, Price (Under Rs. 1,500 / 2,500 / 3,500), and On-Sale items only.
- 🛒 **Direct Purchase Link**: Click "Buy from Brand" to go straight to the official product page.
- 📲 **WhatsApp Share**: Single-click deal share button for friends.
- ⚡ **Auto-Updated Daily with GitHub Actions**: No manual entry needed! GitHub Actions automatically runs the scraper on schedule and pushes new products into the site.

---

## 🚀 Live Demo & Deployment on GitHub Pages

1. Go to your repository on GitHub: `https://github.com/shivamrangwani4-arch/web-for-shirts`
2. Go to **Settings** -> **Pages**.
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` / folder: `/(root)`
   - Click **Save**.
4. Within 1-2 minutes, your website will be live at:
   `https://shivamrangwani4-arch.github.io/web-for-shirts/`

---

## 🤖 GitHub Actions Workflow

The automated scraper is located in `.github/workflows/scrape.yml`.
- Runs automatically everyday at **04:00 UTC (09:00 AM Pakistan Standard Time)**.
- Can also be triggered manually anytime:
  1. Go to the **Actions** tab on your GitHub repository.
  2. Click **Auto-Scrape & Update T-Shirts** on the left.
  3. Click **Run workflow**.

---

## 💻 Local Development

1. **Clone repository**:
   ```bash
   git clone https://github.com/shivamrangwani4-arch/web-for-shirts.git
   cd web-for-shirts
   ```

2. **Run Scraper**:
   ```bash
   python scraper/scraper.py
   ```
   This will fetch all latest products and update `data/products.json`.

3. **Preview Website**:
   Open `index.html` in any web browser, or start a local server:
   ```bash
   python -m http.server 8000
   ```
   Open `http://localhost:8000` in your browser.
