# FISH TALES — Aquatic & Exotic Life E-Commerce

Fish Tales is a complete, production-ready, nature-inspired e-commerce website built for an exotic pets, aquarium fish, and bioactive terrarium business based in India.

The entire website is engineered using **EXACTLY THREE MAIN FILES**:
1. `index.html` — Single-page architecture featuring the official mascot emblem, cinematic nature hero, 4 main categories, catalogue toolbar, product modal, contact desk, and slide-out cart drawer.
2. `style.css` — Complete master styling, botanical color tokens based on the official business logo, natural cream & white surfaces, responsive breakpoints, and mobile optimizations.
3. `script.js` — Complete Vanilla JavaScript engine containing the 30-product master catalogue, photographic and fallback illustration suites, `localStorage` cart manager, real-time search/filters, product detail modal, and WhatsApp checkout builder.

---

## 🌿 Official Brand Identity & Palette

Visual identity built directly around the official Fish Tales circular mascot emblem:
- **Official Logo:** `https://res.cloudinary.com/pv8lnpft/image/upload/v1794776392/40e097e2-b06a-4e06-add4-0ffa7c8e154d.png`
- **Primary Forest Green:** `#174B32` (Outer emblem ring, primary buttons, brand titles)
- **Deep Green:** `#103823` (Headings, footer background, primary typography)
- **Light Mint:** `#DCEBCB` (Subtle backgrounds, badges, emblem inner field)
- **Natural Cream:** `#F8F6E9` (Warm organic body background)
- **Leaf Green:** `#75A65A` (Borders, kickers, active navigation indicators)
- **Warm Orange Accent:** `#E89B35` (Price tags, badges, sale alerts, cart counter)
- **Pure White:** `#FFFFFF` (Card containers, content surfaces, clean highlights)

---

## 📦 Verified Product Catalogue (30 Items)

The business catalogue is strictly organized into **FOUR MAIN PRODUCT CATEGORIES**:

### 1. Aquarium & Fish (14 Products)
- 13 Show Guppy Varieties (Priced strictly per **pair**):
  - Red Lace Guppy — ₹250 / pair
  - Gold Dumbo Ear Guppy — ₹280 / pair
  - Santacruz Dumbo Ear Guppy — ₹250 / pair
  - Platinum Dumbo Ear Halfmoon Guppy — ₹280 / pair
  - Blue Dragon Dumbo Ear Halfmoon Guppy — ₹280 / pair
  - Moscow Black Dumbo Ear Guppy — ₹250 / pair
  - AFR Big Dorsal Guppy — ₹300 / pair
  - Dark Knight Dragon Dumbo Ear Guppy — ₹280 / pair
  - Red Platinum Koi Dumbo Ear Guppy — ₹280 / pair
  - Magenta Red Tiger Guppy — ₹250 / pair
  - White Tuxido Guppy — ₹250 / pair
  - Silverado Red Dragon Guppy — ₹280 / pair
  - Green Moscow Guppy — ₹250 / pair
- Show Grade Betta Fish — ₹350 / piece (Adult 5–6 cm)
- *Half Cube Aquarium Kit cross-listed for desktop aquascaping.*

### 2. Isopods (7 Pure Bioactive Species)
Priced strictly per individual **piece**:
- Armadillidium Gestroi — ₹120 / pc
- Cubaris Murina Orange — ₹60 / pc
- Cubaris Murina Glacier — ₹70 / pc
- Porcellionides pruinosus Orange Pied — ₹60 / pc
- Cubaris sp. Cappuccino — ₹600 / pc
- Cubaris sp. Cherry Blossom — ₹750 / pc
- Armadillidium Peraccae — ₹150 / pc

### 3. Tarantulas (6 Documented Species)
Captive-bred spiderlings with documented sizes:
- Chilean Rose Hair (*Grammostola rosea*) — 1–1.5 cm — ₹2,199
- Brazilian Whiteknee (*Acanthoscurria geniculata*) — 1–1.5 cm — ₹2,199
- Mexican Red Knee (*Brachypelma hamorii*) — 1–1.5 cm — ₹2,399
- Green Bottle Blue (*Chromatopelma cyaneopubescens*) — 1–1.5 cm — ₹4,799
- Chaco Golden Knee (*Grammostola pulchripes*) — 1–1.5 cm — ₹1,999
- Salmon Pink (*Lasiodora parahybana*) — 1 inch — ₹3,000

### 4. Combo Packs (3 Confirmed Bundles)
- **Isopod House Kit — ₹1,545**: Glass Isopod House (5" L × 5" D × 5" H + 2.5" roof), live plants (*Fittonia albivenis*, *Hemigraphis sp. Pink*, Sheet Moss), bioactive substrate blend, lotus pod hide, premium food, and 6 *Cubaris sp. "Glacier"* isopods.
- **Half Cube Aquarium Kit — ₹999**: High-clarity desktop rimless glass aquarium kit.
- **Glacier Colony Pack — ₹700**: 11 *Cubaris murina "Glacier"* specimens total.

---

## ⚡ Key Features

- **Official Mascot Logo:** Directly integrated in sticky navigation and deep green footer.
- **Nature-Inspired Aesthetic:** Botanical layout using official forest green, light mint, natural cream, and warm orange palette.
- **Realistic Photography:** High-resolution photography for all 30 products with inline SVG fallback.
- **Zero Framework Overhead:** Pure HTML5, CSS3, and Vanilla JavaScript with fast loading and zero build step.
- **Persistent Cart:** Fully functional cart persisted in `localStorage` (`fishtales_cart`).
- **Direct WhatsApp Checkout:** Prefills formatted order messages directing to **+91 96542 97430** (`9654297430`).
- **Clear Policy Transparency:** Cash on Delivery (COD) strictly unavailable notice displayed across announcement bar, hero, catalogue, modal, drawer, and WhatsApp messages.
- **Deployment Ready:** Ready for zero-config Vercel deployment with included `vercel.json`.

- **Reference-Inspired Catalogue Header & Toolbar:** Centered editorial introduction with rounded eyebrow badge, single-row pill filters with filled forest green active state, and a full-width horizontal toolbar featuring live product counts, active category indicator badge, pill search input, and custom sort select.

- **Unified Product Card Layout System:** Built around 5 consistent sections:
  1. *Section A (Product Image):* Fixed 4:3 aspect ratio, object-fit: cover, 12px rounded top corners, zero distortion.
  2. *Section B (Product Info):* Uppercase category label, 2-line clamped product title, 2-line clamped scientific/strain description.
  3. *Section C (Variant Selector):* Clean box with "CHOOSE VARIANT:" header row and price indicator, rendered only for multi-variant products.
  4. *Section D (Price Divider & Row):* Subtle hairline separator, dynamic unit badge (e.g. `PRICE (PAIR):`, `PRICE (SPECIMEN):`, `PRICE (PIECE):`, `PRICE (KIT):`), large bold selling price.
  5. *Section E (Action Buttons):* Equal-width `View Details` and `Add to Cart` buttons anchored to the bottom baseline via `margin-top: auto` across 4-column (desktop), 3-column (medium), 2-column (tablet/mobile), and 1-column (<360px mobile).

- **Standardized Product Database Schema:** Every item in `PRODUCTS` follows a uniform, easily editable 12-property object structure:
  ```javascript
  {
    id: "guppy-red-lace",
    category: "aquarium",
    categoryName: "Aquarium & Fish",
    name: "Red Lace Guppy",
    subtitle: "Poecilia reticulata var. Red Lace",
    image: "https://...",
    images: [],
    video: "",
    description: "...",
    specs: { care: "...", temp: "...", diet: "...", habitat: "..." },
    variants: [
      { name: "1 Pair (Adult Pair)", price: 250, label: "Pair" },
      { name: "2 Pairs (Colony Pack)", price: 500, label: "2 Pairs" }
    ],
    featured: true
  }
  ```
  Organized with clear category sections: `// AQUARIUM & FISH`, `// ISOPODS`, `// TARANTULAS`, `// COMBO PACKS`.

## Multi-Page Dedicated Category Architecture

The catalogue is organized across 5 dedicated HTML pages sharing one `style.css` and one `script.js`:

1. **Home (`index.html`):** Brand hero, living realms category cards (fully clickable native anchor cards linking directly to dedicated category pages with hover lift and image zoom), curated bundle offers, featured living collection, and full brand story.
2. **Aquarium & Fish (`aquarium-fish.html`):** All 14 verified aquatic specimens (13 show guppy breeding pairs + Show Grade Betta fish).
3. **Bioactive Isopods (`isopods.html`):** All 7 rare isopod varieties (*Armadillidium* and *Cubaris*) with individual piece and culture pricing.
4. **Exotic Tarantulas (`tarantulas.html`):** All 6 captive-bred New World / Old World tarantula varieties with verified sling/juvenile specimen sizes.
5. **Curated Combo Packs (`combo-packs.html`):** Complete turnkey habitat setups (Isopod House Kit ₹1,545, Half Cube Aquarium Kit ₹999, Glacier Colony Pack ₹700).

All pages share the exact same website header (dark forest green COD notice bar with leaf icon, sticky header with official circular mascot logo, 7 center navigation links with active page highlighting, live search trigger, and persistent cart drawer with dynamic item counter), unified `fishtales_cart` in `localStorage`, product detail modal, live search overlay, complete 2-step customer checkout system (with delivery validation, unique `FT-YYYYMMDD-XXXX` Order IDs, shipping fee transparency "To be confirmed", and structured WhatsApp order messaging), direct WhatsApp checkout (+91 96542 97430), and official contact email (`fishtales.exotic@gmail.com`).
