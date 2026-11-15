# FISH TALES — Premium Exotic Pets & Bioactive E-Commerce

Fish Tales is a complete, production-ready, luxury e-commerce website built for an exotic pets, aquarium fish, and bioactive terrarium business based in India.

The entire website is engineered using **EXACTLY THREE MAIN FILES**:
1. `index.html` — Single-page architecture containing all sections, hero, catalogue, modal dialogs, and slide-out cart drawer.
2. `style.css` — Complete master styling, luxury dark green/black design tokens, responsive breakpoints, animations, and micro-interactions.
3. `script.js` — Complete Vanilla JavaScript engine containing the 30-product master catalogue, scalable SVG graphics, `localStorage` cart manager, real-time search/filters, product detail modal, and WhatsApp checkout builder.

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

## 🛠️ Technology Stack & Architecture

- **Strict Zero-Framework:** Pure HTML5, CSS3, and Vanilla JavaScript (ES6+). No React, Vue, Angular, or external libraries.
- **Single Page Architecture (SPA):** Smooth scrolling anchor navigation, interactive dynamic category filtering, instant live search overlay, product detail modal, and slide-out cart drawer.
- **Local Persistence:** Browser `localStorage` (`fishtales_cart`) ensures user selections remain saved across page refreshes.
- **WhatsApp Checkout Integration:** Direct order submission to official business number **`+91 96542 97430`** (`9654297430`) with clean order formatting and URL encoding.
- **Responsive Design:** Fluid layouts tested across 360px, 390px, 430px (iPhone / Android), tablets, and 4K desktop screens without horizontal overflow.

---

## 📦 Verified Master Product Inventory (30 Items)

### 1. Isopod Collection (Pricing per piece)
- **Armadillidium Gestroi** — ₹120 / piece
- **Cubaris Murina Orange** — ₹60 / piece
- **Cubaris Murina Glacier** — ₹70 / piece *(Promotional Deal: Buy 10, Get 1 Free)*
- **Porcellionides pruinosus Orange Pied** — ₹60 / piece
- **Cubaris sp. Cappuccino** — ₹600 / piece
- **Cubaris sp. Cherry Blossom** — ₹750 / piece
- **Armadillidium Peraccae** — ₹150 / piece

### 2. Isopod House Kit (Complete Bioactive Habitat)
- **Isopod House Kit** — ₹1,545
  - *Glass Enclosure:* 5" L × 5" D × 5" H + 2.5" roof height
  - *Includes:* Fittonia albivenis, Hemigraphis sp. Pink, Sheet Moss, Bioactive Substrate blend, Lotus Pod hide, Premium Isopod Food, 6 Cubaris "Glacier" isopods.

### 3. Tarantula Collection (Documented juvenile sizes)
- **Chilean Rose Hair** (*Grammostola rosea*) — ₹2,199 (1–1.5 cm)
- **Brazilian Whiteknee** (*Acanthoscurria geniculata*) — ₹2,199 (1–1.5 cm)
- **Mexican Red Knee** (*Brachypelma hamorii*) — ₹2,399 (1–1.5 cm)
- **Green Bottle Blue (GBB)** (*Chromatopelma cyaneopubescens*) — ₹4,799 (1–1.5 cm)
- **Chaco Golden Knee** (*Grammostola pulchripes*) — ₹1,999 (1–1.5 cm)
- **Salmon Pink** (*Lasiodora parahybana*) — ₹3,000 (1 inch)

### 4. Aquarium & Show Guppy Strains (Pricing strictly per pair)
- **Half Cube Aquarium Kit** — ₹999 *(Half Cube tank, 1 Betta Fish, live aquatic plants, sand substrate)*
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

### 5. Bioactive Terrarium Additions
- **Bioactive Terrarium Starter Kit** — ₹2,499
- **Premium Isopod Substrate Blend (2L)** — ₹299

---

## 💬 WhatsApp Checkout Specification

When a customer checks out from the cart drawer, the system constructs a formatted WhatsApp inquiry delivered to **`+91 96542 97430`**:

```text
Hello Fish Tales!

I would like to place an order:

1. Cubaris Murina Glacier – 5 pcs – ₹350
2. Armadillidium Gestroi – 2 pcs – ₹240

Subtotal: ₹590

Please confirm availability and delivery details.
```

- For per-piece products: calculates `price × quantity`.
- For per-pair guppies: calculates `price × quantity of pairs` (e.g. `2 pairs – ₹500`).
- Encoded safely via `encodeURIComponent` for all desktop and mobile WhatsApp clients.

---

## 🚀 Deployment Instructions (Vercel Ready)

The repository is structured to deploy out-of-the-box to Vercel, Netlify, or GitHub Pages.

### Deploy to Vercel via CLI:
```bash
npm install -g vercel
vercel
```

### Static Hosting:
Simply host `index.html`, `style.css`, and `script.js` directly on any web server or static CDN.
