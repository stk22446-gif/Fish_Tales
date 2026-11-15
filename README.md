# FISH TALES — Premium Exotic Pets & Bioactive E-Commerce

Fish Tales is a complete, production-ready, luxury e-commerce website built for an exotic pets, aquarium fish, and bioactive terrarium business based in India.

The entire website is engineered using **EXACTLY THREE MAIN FILES**:
1. `index.html` — Single-page architecture containing hero, 4 main categories, catalogue, modal dialogs, contact desk, and slide-out cart drawer.
2. `style.css` — Complete master styling, luxury dark green/black design tokens, responsive breakpoints, animations, and mobile optimizations.
3. `script.js` — Complete Vanilla JavaScript engine containing the 30-product master catalogue, individual SVG illustrations, `localStorage` cart manager, real-time search/filters, product detail modal, and WhatsApp checkout builder.

---

## 🌿 Brand Identity & Design System

- **Main Background:** `#050B08` (Dark aquatic black)
- **Secondary Background:** `#0D1711` (Deep bio-moss green)
- **Primary Accent:** `#B8E64A` (Luminous bioactive green)
- **Secondary Accent:** `#D4A94D` (Luxury warm amber gold)
- **Text Primary:** `#F5F7F2` (Off-white high contrast)
- **Muted Text:** `#A6B2A8` (Soft nature grey)
- **Typography:** *Playfair Display* (luxury serif headlines) & *Inter* (clean modern sans-serif body)

---

## 🧭 Navigation Structure

Exact 7-link responsive navigation:
1. **Home** (`#hero`)
2. **Aquarium & Fish** (`filterCategoryAndScroll('aquarium')`)
3. **Isopods** (`filterCategoryAndScroll('isopods')`)
4. **Tarantulas** (`filterCategoryAndScroll('tarantulas')`)
5. **Combo Packs** (`filterCategoryAndScroll('combos')`)
6. **About Us** (`#about`)
7. **Contact** (`#contact`)

---

## ⚠️ Important Payment Notice
**Cash on Delivery (COD) is strictly unavailable** for live animals and living habitats. All orders are confirmed and prepaid via UPI / Bank Transfer directly upon WhatsApp confirmation.

---

## 📦 The 4 Main Product Categories (30 Verified Products)

### 1. AQUARIUM & FISH (14 Products: 13 Guppies + Betta Fish)
- **Show Grade Betta Fish** — ₹350 / piece (Adult 5–6 cm)
- **Red Lace Guppy** — ₹250 / pair
- **Gold Dumbo Ear Guppy** — ₹280 / pair
- **Santacruz Dumbo Ear Guppy** — ₹250 / pair
- **Platinum Dumbo Ear Halfmoon Guppy** — ₹280 / pair
- **Blue Dragon Dumbo Ear Halfmoon Guppy** — ₹280 / pair
- **Moscow Black Dumbo Ear Guppy** — ₹250 / pair
- **AFR Big Dorsal Guppy** — ₹300 / pair
- **Dark Knight Dragon Dumbo Ear Guppy** — ₹280 / pair
- **Red Platinum Koi Dumbo Ear Guppy** — ₹280 / pair
- **Magenta Red Tiger Guppy** — ₹250 / pair
- **White Tuxido Guppy** — ₹250 / pair
- **Silverado Red Dragon Guppy** — ₹280 / pair
- **Green Moscow Guppy** — ₹250 / pair

*(Note: Half Cube Aquarium Kit is cross-listed and accessible under both Aquarium & Fish and Combo Packs).*

### 2. ISOPODS (7 Pure Strains, Pricing strictly per piece)
- **Armadillidium Gestroi** — ₹120 / piece
- **Cubaris Murina Orange** — ₹60 / piece
- **Cubaris Murina Glacier** — ₹70 / piece
- **Porcellionides pruinosus Orange Pied** — ₹60 / piece
- **Cubaris sp. Cappuccino** — ₹600 / piece
- **Cubaris sp. Cherry Blossom** — ₹750 / piece
- **Armadillidium Peraccae** — ₹150 / piece

### 3. TARANTULAS (6 Species, Exact Documented Sizes & Prices)
- **Chilean Rose Hair** (*Grammostola rosea*) — ₹2,199 (1–1.5 cm)
- **Brazilian Whiteknee** (*Acanthoscurria geniculata*) — ₹2,199 (1–1.5 cm)
- **Mexican Red Knee** (*Brachypelma hamorii*) — ₹2,399 (1–1.5 cm)
- **Green Bottle Blue (GBB)** (*Chromatopelma cyaneopubescens*) — ₹4,799 (1–1.5 cm)
- **Chaco Golden Knee** (*Grammostola pulchripes*) — ₹1,999 (1–1.5 cm)
- **Salmon Pink** (*Lasiodora parahybana*) — ₹3,000 (1 inch)

### 4. COMBO PACKS (3 Confirmed Bundles & Kits)
- **Isopod House Kit** — ₹1,545
  - *Glass Enclosure:* 5" L × 5" D × 5" H + 2.5" roof height
  - *Includes:* Fittonia albivenis, Hemigraphis sp. Pink, Sheet Moss, Bioactive Substrate blend, Lotus Pod hide, Premium Isopod Food, 6 Cubaris "Glacier" isopods.
- **Half Cube Aquarium Kit** — ₹999
  - *Includes:* Half Cube glass aquarium, 1 healthy Betta fish, live aquatic plants, sand substrate.
- **Glacier Isopods Colony Pack (10 + 1 Free)** — ₹700 (11 specimens total)

---

## 💬 WhatsApp Checkout Specification

Delivered directly to official business number **`+91 96542 97430`**:

```text
Hello Fish Tales!

I would like to place an order:

1. Cubaris Murina Glacier – 5 pcs – ₹350
2. Armadillidium Gestroi – 2 pcs – ₹240
3. Red Lace Guppy – 2 pairs – ₹500
4. Isopod House Kit – 1 kit – ₹1,545

Subtotal: ₹2,635

Please confirm availability, delivery details and UPI payment info (Cash on Delivery is unavailable).
```

- For per-piece products: calculates `price × quantity`.
- For per-pair guppies: calculates `price × quantity of pairs`.
- For combo kits: calculates `price × quantity of kits`.
- Encoded safely via `encodeURIComponent` for all desktop and mobile WhatsApp clients.

---

## 🚀 Deployment Instructions (Vercel Ready)

```bash
vercel
```
