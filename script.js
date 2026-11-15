/**
 * ============================================================
 * FISH TALES — script.js
 * Complete Single-Page Application Controller & Product Catalog
 * ============================================================
 */

(function () {
  'use strict';

  const WHATSAPP_NUMBER = '919654297430';
  const STORAGE_KEY = 'fishtales_cart';

  /* ── 1. Embedded Vector Visuals (Zero Asset Dependency) ─── */
  const ICONS = {
    aquarium: `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="aqGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#143022"/>
          <stop offset="70%" stop-color="#08140D"/>
          <stop offset="100%" stop-color="#050B08"/>
        </radialGradient>
        <linearGradient id="finGrad" x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stop-color="#D4A94D"/>
          <stop offset="40%" stop-color="#B8E64A"/>
          <stop offset="100%" stop-color="#22C55E"/>
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#aqGrad)"/>
      <path d="M-20 60 Q 100 30, 220 50 T 420 40" stroke="#B8E64A" stroke-width="1.2" opacity="0.2" fill="none"/>
      <path d="M50 300 Q 60 190, 100 130 Q 70 200, 80 300" fill="#1A3D2A" opacity="0.7"/>
      <path d="M330 300 Q 310 180, 290 120 Q 320 200, 340 300" fill="#22563A" opacity="0.6"/>
      <g transform="translate(180, 120)">
        <path d="M-20 8 C -80 -40, -100 30, -30 20 C -90 55, -60 90, -18 28 Z" fill="url(#finGrad)" opacity="0.85"/>
        <path d="M0 -4 C 15 -45, -20 -38, -15 -6 Z" fill="url(#finGrad)" opacity="0.7"/>
        <path d="M8 15 C 4 45, -8 38, 0 12 Z" fill="#D4A94D" opacity="0.8"/>
        <ellipse cx="8" cy="10" rx="36" ry="14" fill="#B8E64A"/>
        <circle cx="34" cy="7" r="2.8" fill="#050B08"/>
        <circle cx="35" cy="6" r="0.8" fill="#FFF"/>
      </g>
      <circle cx="170" cy="210" r="3" fill="#B8E64A" opacity="0.3"/>
      <circle cx="270" cy="90" r="2.5" fill="#B8E64A" opacity="0.25"/>
      <path d="M0 275 Q 150 260, 300 270 T 400 265 L 400 300 L 0 300 Z" fill="#0D1711"/>
    </svg>`,

    isopod: `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="isoGrad" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#182A1C"/>
          <stop offset="65%" stop-color="#0C170F"/>
          <stop offset="100%" stop-color="#050B08"/>
        </radialGradient>
        <linearGradient id="shellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#B8E64A"/>
          <stop offset="50%" stop-color="#D4A94D"/>
          <stop offset="100%" stop-color="#4E7037"/>
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#isoGrad)"/>
      <path d="M30 255 C 90 225, 170 285, 250 240 C 330 280, 370 230, 400 270 L 400 300 L 0 300 Z" fill="#0A120D"/>
      <g transform="translate(200, 140)">
        <path d="M48 -12 Q 72 -28, 80 -16" stroke="#D4A94D" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M48 -4 Q 76 -8, 84 8" stroke="#D4A94D" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M36 -14 C 52 -12, 52 12, 36 14 Z" fill="#B8E64A"/>
        <circle cx="44" cy="-6" r="1.6" fill="#050B08"/>
        <path d="M25 -20 C 36 -17, 36 17, 25 20 L 34 16 C 40 10, 40 -10, 34 -16 Z" fill="url(#shellGrad)"/>
        <path d="M14 -25 C 25 -22, 25 22, 14 25 L 22 20 C 28 14, 28 -14, 22 -20 Z" fill="#1E3120" stroke="#B8E64A" stroke-width="1.2"/>
        <path d="M3 -27 C 14 -25, 14 25, 3 27 L 11 23 C 17 17, 17 -17, 11 -23 Z" fill="url(#shellGrad)"/>
        <path d="M-8 -28 C 3 -27, 3 27, -8 28 L 0 25 C 6 17, 6 -17, 0 -25 Z" fill="#1E3120" stroke="#B8E64A" stroke-width="1.2"/>
        <path d="M-19 -26 C -8 -27, -8 27, -19 26 L -11 23 C -5 17, -5 -17, -11 -23 Z" fill="url(#shellGrad)"/>
        <path d="M-30 -22 C -19 -24, -19 24, -30 22 L -22 20 C -16 14, -16 -14, -22 -20 Z" fill="#1E3120" stroke="#B8E64A" stroke-width="1.2"/>
        <path d="M-44 0 C -44 -14, -30 -19, -30 -19 C -30 19, -44 14, -44 0 Z" fill="#D4A94D"/>
      </g>
      <circle cx="110" cy="120" r="2" fill="#B8E64A" opacity="0.3"/>
      <circle cx="310" cy="150" r="2.5" fill="#D4A94D" opacity="0.3"/>
    </svg>`,

    tarantula: `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="tarGrad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#1A1712"/>
          <stop offset="60%" stop-color="#0E120E"/>
          <stop offset="100%" stop-color="#050B08"/>
        </radialGradient>
        <linearGradient id="legGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3B82F6"/>
          <stop offset="50%" stop-color="#1D4ED8"/>
          <stop offset="100%" stop-color="#D4A94D"/>
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#tarGrad)"/>
      <path d="M80 30 L 320 270" stroke="#F5F7F2" stroke-width="0.6" opacity="0.12"/>
      <path d="M300 40 L 100 260" stroke="#F5F7F2" stroke-width="0.6" opacity="0.12"/>
      <g transform="translate(200, 150)">
        <path d="M-15 -12 Q -50 -50, -80 -40" stroke="url(#legGrad)" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <path d="M-18 -4 Q -65 -25, -95 -10" stroke="url(#legGrad)" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <path d="M-18 8 Q -70 20, -90 48" stroke="url(#legGrad)" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <path d="M-15 15 Q -55 55, -75 80" stroke="url(#legGrad)" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <path d="M15 -12 Q 50 -50, 80 -40" stroke="url(#legGrad)" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <path d="M18 -4 Q 65 -25, 95 -10" stroke="url(#legGrad)" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <path d="M18 8 Q 70 20, 90 48" stroke="url(#legGrad)" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <path d="M15 15 Q 55 55, 75 80" stroke="url(#legGrad)" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <ellipse cx="0" cy="-8" rx="18" ry="16" fill="#104030" stroke="#B8E64A" stroke-width="1.5"/>
        <ellipse cx="0" cy="26" rx="22" ry="28" fill="#D97706" stroke="#B45309" stroke-width="1.2"/>
        <circle cx="-3" cy="-16" r="1.4" fill="#B8E64A"/>
        <circle cx="3" cy="-16" r="1.4" fill="#B8E64A"/>
      </g>
    </svg>`,

    terrarium: `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="terGrad" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#163022"/>
          <stop offset="65%" stop-color="#0B1A11"/>
          <stop offset="100%" stop-color="#050B08"/>
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#terGrad)"/>
      <g transform="translate(100, 30)">
        <rect x="0" y="0" width="200" height="230" rx="6" fill="#0D1A12" stroke="#B8E64A" stroke-width="1.5" stroke-opacity="0.4"/>
        <rect x="2" y="205" width="196" height="22" fill="#1A1713"/>
        <rect x="2" y="165" width="196" height="40" fill="#141E15"/>
        <path d="M2 170 Q 50 150, 90 162 Q 150 145, 198 168 L 198 175 L 2 175 Z" fill="#22563A"/>
        <path d="M50 160 C 30 130, 45 95, 75 110 C 90 130, 65 160, 50 160 Z" fill="#15803D" stroke="#F43F5E" stroke-width="1.2"/>
        <path d="M120 162 C 135 115, 175 120, 165 150 C 150 162, 130 166, 120 162 Z" fill="#581C87" stroke="#D946EF" stroke-width="1"/>
      </g>
    </svg>`,

    isopodKit: `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#0A1810"/>
      <g transform="translate(120, 30)">
        <polygon points="80,10 5,50 155,50" fill="#102217" stroke="#B8E64A" stroke-width="1.5"/>
        <rect x="5" y="50" width="150" height="170" fill="#0D1C13" stroke="#B8E64A" stroke-width="1.5" stroke-opacity="0.7"/>
        <path d="M10 195 Q 40 160, 80 175 Q 120 155, 150 195 Z" fill="#166534"/>
        <path d="M45 175 C 25 145, 50 115, 65 130 C 75 145, 55 175, 45 175 Z" fill="#15803D" stroke="#FB7185" stroke-width="1"/>
        <ellipse cx="110" cy="188" rx="15" ry="9" fill="#78350F"/>
        <ellipse cx="85" cy="192" rx="4" ry="2" fill="#E2E8F0" stroke="#B8E64A" stroke-width="0.6"/>
      </g>
    </svg>`,

    aquariumKit: `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#08170F"/>
      <g transform="translate(100, 40)">
        <rect x="0" y="0" width="200" height="190" rx="6" fill="#0A1A12" stroke="#B8E64A" stroke-width="1.5"/>
        <rect x="3" y="15" width="194" height="170" fill="#0B2418" opacity="0.6"/>
        <path d="M30 185 Q 40 110, 60 60 Q 45 125, 50 185" fill="#22C55E" opacity="0.75"/>
        <path d="M160 185 Q 145 100, 130 50 Q 150 120, 165 185" fill="#16A34A" opacity="0.75"/>
        <g transform="translate(100, 95)">
          <path d="M-8 0 C -30 -20, -40 15, -12 8 Z" fill="#D4A94D" opacity="0.8"/>
          <ellipse cx="8" cy="4" rx="16" ry="7" fill="#B8E64A"/>
          <circle cx="18" cy="2" r="1.5" fill="#050B08"/>
        </g>
        <rect x="3" y="170" width="194" height="16" rx="2" fill="#C2A676" opacity="0.75"/>
      </g>
    </svg>`,

    glacierOffer: `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#0C1717"/>
      <g transform="translate(200, 125)">
        <circle cx="0" cy="0" r="70" fill="#38BDF8" opacity="0.08"/>
        <path d="M-40 0 C -40 -24, 40 -24, 40 0 C 40 24, -40 24, -40 0 Z" fill="#E0F2FE" stroke="#38BDF8" stroke-width="1.8"/>
        <path d="M-20 -20 L -20 20" stroke="#94A3B8" stroke-width="1.2"/>
        <path d="M0 -23 L 0 23" stroke="#94A3B8" stroke-width="1.2"/>
        <path d="M20 -20 L 20 20" stroke="#94A3B8" stroke-width="1.2"/>
        <circle cx="34" cy="-8" r="2" fill="#0369A1"/>
        <circle cx="34" cy="8" r="2" fill="#0369A1"/>
      </g>
    </svg>`
  };

  /* ── 2. Master Product Catalogue (All 30 Verified Products) ── */
  const PRODUCTS = [
    // --- 1. ISOPOD COLLECTION (Per Piece & Kit) ---
    {
      id: 'armadillidium-gestroi',
      name: 'Armadillidium Gestroi',
      scientificName: 'Armadillidium gestroi',
      category: 'isopods',
      categoryLabel: 'Isopods',
      price: 120,
      pricingUnit: 'piece',
      size: null,
      description: 'Striking Mediterranean pill bug known for its robust size, pronounced dorsal yellow markings, and efficient terrarium cleaning.',
      compliance: 'check-required',
      complianceNotice: 'Live isopod culture. Delivery requires postal transit verification under domestic transport guidelines.',
      visualKey: 'isopod',
      emoji: '🍂',
      featured: true
    },
    {
      id: 'cubaris-murina-orange',
      name: 'Cubaris Murina Orange',
      scientificName: 'Cubaris murina "Orange"',
      category: 'isopods',
      categoryLabel: 'Isopods',
      price: 60,
      pricingUnit: 'piece',
      size: null,
      description: 'Vibrant orange-toned morph of Cubaris murina. Highly active, loves humid tropical substrates, and reproduces reliably.',
      compliance: 'check-required',
      complianceNotice: 'Live isopod culture. Transit feasibility confirmed over WhatsApp before dispatch.',
      visualKey: 'isopod',
      emoji: '🍂',
      featured: true
    },
    {
      id: 'cubaris-murina-glacier',
      name: 'Cubaris Murina Glacier',
      scientificName: 'Cubaris murina "Glacier"',
      category: 'isopods',
      categoryLabel: 'Isopods',
      price: 70,
      pricingUnit: 'piece',
      size: null,
      description: 'Frosty, pearlescent isopod with an icy white shell and subtle dark eyes. Buy 10, Get 1 Free on colony orders.',
      compliance: 'check-required',
      complianceNotice: 'Live isopod culture. Transit feasibility confirmed over WhatsApp before dispatch.',
      visualKey: 'glacierOffer',
      emoji: '🍂',
      featured: true
    },
    {
      id: 'porcellionides-pruinosus-orange-pied',
      name: 'Porcellionides pruinosus Orange Pied',
      scientificName: 'Porcellionides pruinosus',
      category: 'isopods',
      categoryLabel: 'Isopods',
      price: 60,
      pricingUnit: 'piece',
      size: null,
      description: 'Energetic, fast-moving cleanup crew with mottled orange and white pied patterning. Outstanding decomposers for bioactive vivariums.',
      compliance: 'check-required',
      complianceNotice: 'Live isopod culture. Verified transit routing required before order processing.',
      visualKey: 'isopod',
      emoji: '🍂',
      featured: false
    },
    {
      id: 'cubaris-sp-cappuccino',
      name: 'Cubaris sp. Cappuccino',
      scientificName: 'Cubaris sp. "Cappuccino"',
      category: 'isopods',
      categoryLabel: 'Isopods',
      price: 600,
      pricingUnit: 'piece',
      size: null,
      description: 'Rare collector-grade isopod featuring rich creamy brown and espresso-toned banding with duck-bill rostral geometry.',
      compliance: 'check-required',
      complianceNotice: 'Rare live isopod specimen. Insulated express dispatch arranged after direct verification.',
      visualKey: 'isopod',
      emoji: '🍂',
      featured: true
    },
    {
      id: 'cubaris-sp-cherry-blossom',
      name: 'Cubaris sp. Cherry Blossom',
      scientificName: 'Cubaris sp. "Cherry Blossom"',
      category: 'isopods',
      categoryLabel: 'Isopods',
      price: 750,
      pricingUnit: 'piece',
      size: null,
      description: 'Exquisite luxury isopod with delicate petal-pink blush over porcelain white plates. A crown jewel of bioactive vivariums.',
      compliance: 'check-required',
      complianceNotice: 'Collector-grade specimen. Insulated express dispatch arranged after direct verification.',
      visualKey: 'isopod',
      emoji: '🍂',
      featured: true
    },
    {
      id: 'armadillidium-peraccae',
      name: 'Armadillidium Peraccae',
      scientificName: 'Armadillidium peraccae',
      category: 'isopods',
      categoryLabel: 'Isopods',
      price: 150,
      pricingUnit: 'piece',
      size: null,
      description: 'Textured Greek isopod with unique tuberculate bumps and slate-grey marbling. Tolerates moderate humidity gradients exceptionally well.',
      compliance: 'check-required',
      complianceNotice: 'Live isopod culture. Verified transit routing required before dispatch.',
      visualKey: 'isopod',
      emoji: '🍂',
      featured: false
    },
    {
      id: 'isopod-house-kit',
      name: 'Isopod House Kit',
      scientificName: 'Complete Bioactive Enclosure',
      category: 'isopods',
      categoryLabel: 'Isopods',
      price: 1545,
      pricingUnit: 'kit',
      size: '5" L × 5" D × 5" H + 2.5" roof',
      description: 'A turnkey bioactive isopod habitat complete with glass greenhouse enclosure, live plants, substrate, hides, food, and starter isopods.',
      kitIncludes: [
        'Fittonia albivenis (patterned nerve plant)',
        'Hemigraphis sp. Pink (purple waffle plant)',
        'Sheet Moss',
        'Isopod Substrate (bioactive blend)',
        'Lotus Pod (natural hide for isopods)',
        'Premium Isopod Food',
        'Isopod Culture – 6 Cubaris sp. "Glacier"'
      ],
      compliance: 'available',
      complianceNotice: 'Glass enclosure & flora packed with break-safe insulation; live culture dispatched upon destination check.',
      visualKey: 'isopodKit',
      emoji: '🏡',
      featured: true
    },

    // --- 2. TARANTULA COLLECTION (Sizes & Prices) ---
    {
      id: 'chilean-rose-hair',
      name: 'Chilean Rose Hair',
      scientificName: 'Grammostola rosea',
      category: 'tarantulas',
      categoryLabel: 'Tarantulas',
      price: 2199,
      pricingUnit: 'piece',
      size: '1–1.5 cm',
      description: 'Docile, hardy New World terrestrial tarantula with soft rose-pink hairs on its carapace. Highly regarded for calm temperament.',
      compliance: 'check-required',
      complianceNotice: 'Live invertebrate. Buyer must confirm local keeping eligibility and recipient transit availability.',
      visualKey: 'tarantula',
      emoji: '🕷️',
      featured: true
    },
    {
      id: 'brazilian-whiteknee',
      name: 'Brazilian Whiteknee',
      scientificName: 'Acanthoscurria geniculata',
      category: 'tarantulas',
      categoryLabel: 'Tarantulas',
      price: 2199,
      pricingUnit: 'piece',
      size: '1–1.5 cm',
      description: 'Striking black terrestrial species with contrasting brilliant white bands across every leg joint. Vigorous feeder with bold display habits.',
      compliance: 'check-required',
      complianceNotice: 'Live invertebrate. Buyer must confirm local keeping eligibility and recipient transit availability.',
      visualKey: 'tarantula',
      emoji: '🕷️',
      featured: false
    },
    {
      id: 'mexican-red-knee',
      name: 'Mexican Red Knee',
      scientificName: 'Brachypelma hamorii',
      category: 'tarantulas',
      categoryLabel: 'Tarantulas',
      price: 2399,
      pricingUnit: 'piece',
      size: '1–1.5 cm',
      description: 'World-famous iconic arachnid celebrated for vibrant flame-orange leg bands and long lifespans. Very calm and display-oriented.',
      compliance: 'check-required',
      complianceNotice: 'Live invertebrate. Buyer must confirm local keeping eligibility and recipient transit availability.',
      visualKey: 'tarantula',
      emoji: '🕷️',
      featured: true
    },
    {
      id: 'green-bottle-blue',
      name: 'Green Bottle Blue (GBB)',
      scientificName: 'Chromatopelma cyaneopubescens',
      category: 'tarantulas',
      categoryLabel: 'Tarantulas',
      price: 4799,
      pricingUnit: 'piece',
      size: '1–1.5 cm',
      description: 'Breath-taking coloration: metallic blue legs, emerald-green carapace, and bright pumpkin-orange abdomen. Heavy webber.',
      compliance: 'check-required',
      complianceNotice: 'Live invertebrate. Express temperature-monitored courier arranged following verification.',
      visualKey: 'tarantula',
      emoji: '🕷️',
      featured: true
    },
    {
      id: 'chaco-golden-knee',
      name: 'Chaco Golden Knee',
      scientificName: 'Grammostola pulchripes',
      category: 'tarantulas',
      categoryLabel: 'Tarantulas',
      price: 1999,
      pricingUnit: 'piece',
      size: '1–1.5 cm',
      description: 'Gentle giant with shimmering golden stripes running down each leg joint. Extremely docile, slow-moving, and easy to care for.',
      compliance: 'check-required',
      complianceNotice: 'Live invertebrate. Buyer must confirm local keeping eligibility and recipient transit availability.',
      visualKey: 'tarantula',
      emoji: '🕷️',
      featured: false
    },
    {
      id: 'salmon-pink',
      name: 'Salmon Pink',
      scientificName: 'Lasiodora parahybana',
      category: 'tarantulas',
      categoryLabel: 'Tarantulas',
      price: 3000,
      pricingUnit: 'piece',
      size: '1 inch',
      description: 'One of the largest tarantula species on Earth. Fast growing with dense salmon-pink hairs and impressive predatory drive.',
      compliance: 'check-required',
      complianceNotice: 'Live invertebrate. Buyer must confirm local keeping eligibility and recipient transit availability.',
      visualKey: 'tarantula',
      emoji: '🕷️',
      featured: true
    },

    // --- 3. AQUARIUM & FISH (Kit & 13 Guppy Pairs) ---
    {
      id: 'half-cube-aquarium-kit',
      name: 'Half Cube Aquarium Kit',
      scientificName: 'Complete Desktop Aquascape',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 999,
      pricingUnit: 'kit',
      size: 'Desktop Half Cube',
      description: 'A complete desktop planted aquarium kit designed for effortless elegance. Includes tank, live Betta, plants, and substrate.',
      kitIncludes: [
        'Half Cube Aquarium (crystal-clear glass)',
        '1 beautiful Betta Fish',
        'Live aquatic plants',
        'Premium sand substrate'
      ],
      compliance: 'check-required',
      complianceNotice: 'Live Betta fish and aquatic plants packed with breathable bags and oxygen; recipient location verified prior to shipment.',
      visualKey: 'aquariumKit',
      emoji: '🐠',
      featured: true
    },
    {
      id: 'guppy-red-lace',
      name: 'Red Lace Guppy',
      scientificName: 'Poecilia reticulata var. Red Lace',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 250,
      pricingUnit: 'pair',
      size: null,
      description: 'Exquisite filigree lace patterns across crimson fins. Show-quality strain bred for symmetry and vitality. Priced per pair.',
      compliance: 'check-required',
      complianceNotice: 'Live tropical fish. Transit feasibility confirmed over WhatsApp before dispatch.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: true
    },
    {
      id: 'guppy-gold-dumbo-ear',
      name: 'Gold Dumbo Ear Guppy',
      scientificName: 'Poecilia reticulata var. Gold Dumbo',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 280,
      pricingUnit: 'pair',
      size: null,
      description: 'Enlarged wing-like pectoral fins with lustrous metallic gold body scales. Graceful swimmers in planted setups. Priced per pair.',
      compliance: 'check-required',
      complianceNotice: 'Live tropical fish. Transit feasibility confirmed over WhatsApp before dispatch.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: false
    },
    {
      id: 'guppy-santacruz-dumbo-ear',
      name: 'Santacruz Dumbo Ear Guppy',
      scientificName: 'Poecilia reticulata var. Santacruz',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 250,
      pricingUnit: 'pair',
      size: null,
      description: 'Signature Santacruz contrast coloring paired with expanded dumbo ear pectorals. Peaceful community fish. Priced per pair.',
      compliance: 'check-required',
      complianceNotice: 'Live tropical fish. Transit feasibility confirmed over WhatsApp before dispatch.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: false
    },
    {
      id: 'guppy-platinum-dumbo-halfmoon',
      name: 'Platinum Dumbo Ear Halfmoon Guppy',
      scientificName: 'Poecilia reticulata var. Platinum Halfmoon',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 280,
      pricingUnit: 'pair',
      size: null,
      description: 'Pure platinum metallic shine with sweeping 180-degree halfmoon caudal fin and oversized dumbo ears. Priced per pair.',
      compliance: 'check-required',
      complianceNotice: 'Live tropical fish. Transit feasibility confirmed over WhatsApp before dispatch.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: true
    },
    {
      id: 'guppy-blue-dragon-dumbo-halfmoon',
      name: 'Blue Dragon Dumbo Ear Halfmoon Guppy',
      scientificName: 'Poecilia reticulata var. Blue Dragon',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 280,
      pricingUnit: 'pair',
      size: null,
      description: 'Iridescent blue dragon dragonscale pattern along body with deep navy halfmoon fins and dumbo pectorals. Priced per pair.',
      compliance: 'check-required',
      complianceNotice: 'Live tropical fish. Transit feasibility confirmed over WhatsApp before dispatch.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: true
    },
    {
      id: 'guppy-moscow-black-dumbo',
      name: 'Moscow Black Dumbo Ear Guppy',
      scientificName: 'Poecilia reticulata var. Moscow Black',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 250,
      pricingUnit: 'pair',
      size: null,
      description: 'Velvety midnight-black body and fins highlighted by majestic oversized dumbo ear pectorals. Priced per pair.',
      compliance: 'check-required',
      complianceNotice: 'Live tropical fish. Transit feasibility confirmed over WhatsApp before dispatch.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: false
    },
    {
      id: 'guppy-afr-big-dorsal',
      name: 'AFR Big Dorsal Guppy',
      scientificName: 'Poecilia reticulata var. Albino Full Red',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 300,
      pricingUnit: 'pair',
      size: null,
      description: 'Albino Full Red (AFR) show champion strain with immense elongated dorsal fin and ruby-red eyes. Priced per pair.',
      compliance: 'check-required',
      complianceNotice: 'Live tropical fish. Transit feasibility confirmed over WhatsApp before dispatch.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: true
    },
    {
      id: 'guppy-dark-knight-dragon-dumbo',
      name: 'Dark Knight Dragon Dumbo Ear Guppy',
      scientificName: 'Poecilia reticulata var. Dark Knight',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 280,
      pricingUnit: 'pair',
      size: null,
      description: 'Dark smoky armored scales with electric blue sheen and broad dumbo ears. Striking contrast against live green plants. Priced per pair.',
      compliance: 'check-required',
      complianceNotice: 'Live tropical fish. Transit feasibility confirmed over WhatsApp before dispatch.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: false
    },
    {
      id: 'guppy-red-platinum-koi-dumbo',
      name: 'Red Platinum Koi Dumbo Ear Guppy',
      scientificName: 'Poecilia reticulata var. Red Platinum Koi',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 280,
      pricingUnit: 'pair',
      size: null,
      description: 'Tri-color koi pattern featuring bright red cap, platinum mid-body, and wing-like white dumbo ears. Priced per pair.',
      compliance: 'check-required',
      complianceNotice: 'Live tropical fish. Transit feasibility confirmed over WhatsApp before dispatch.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: false
    },
    {
      id: 'guppy-magenta-red-tiger',
      name: 'Magenta Red Tiger Guppy',
      scientificName: 'Poecilia reticulata var. Red Tiger',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 250,
      pricingUnit: 'pair',
      size: null,
      description: 'Bold tiger-striped flanks overlaid with vivid magenta and vermilion highlights. Vigorous and playful. Priced per pair.',
      compliance: 'check-required',
      complianceNotice: 'Live tropical fish. Transit feasibility confirmed over WhatsApp before dispatch.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: false
    },
    {
      id: 'guppy-white-tuxido',
      name: 'White Tuxido Guppy',
      scientificName: 'Poecilia reticulata var. White Tuxedo',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 250,
      pricingUnit: 'pair',
      size: null,
      description: 'Classic formal coloration with deep midnight-black half-body and contrasting snowy white fins. Priced per pair.',
      compliance: 'check-required',
      complianceNotice: 'Live tropical fish. Transit feasibility confirmed over WhatsApp before dispatch.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: false
    },
    {
      id: 'guppy-silverado-red-dragon',
      name: 'Silverado Red Dragon Guppy',
      scientificName: 'Poecilia reticulata var. Silverado Red Dragon',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 280,
      pricingUnit: 'pair',
      size: null,
      description: 'Silver armor dorsal scales cascading into fire-red dragon tails. Premium show-class genetics. Priced per pair.',
      compliance: 'check-required',
      complianceNotice: 'Live tropical fish. Transit feasibility confirmed over WhatsApp before dispatch.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: false
    },
    {
      id: 'guppy-green-moscow',
      name: 'Green Moscow Guppy',
      scientificName: 'Poecilia reticulata var. Green Moscow',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 250,
      pricingUnit: 'pair',
      size: null,
      description: 'Deep forest green and emerald metallic sheen that shifts with lighting. Celebrated heritage Russian strain. Priced per pair.',
      compliance: 'check-required',
      complianceNotice: 'Live tropical fish. Transit feasibility confirmed over WhatsApp before dispatch.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: false
    },

    // --- 4. TERRARIUM & BIOACTIVE KITS ---
    {
      id: 'bioactive-terrarium-starter',
      name: 'Bioactive Terrarium Starter Kit',
      scientificName: 'Complete Habitat Enclosure',
      category: 'terrarium',
      categoryLabel: 'Terrarium Kits',
      price: 2499,
      pricingUnit: 'kit',
      size: 'Starter Enclosure',
      description: 'Complete turn-key bioactive terrarium kit with glass enclosure, bioactive drainage layer, live plants, and natural cork hides.',
      kitIncludes: [
        'Glass Terrarium Enclosure',
        'Bioactive Substrate & Drainage Mesh',
        'Hydroballs Drainage Layer',
        'Live Tropical Plants',
        'Natural Cork Bark Hide'
      ],
      compliance: 'available',
      complianceNotice: 'Glassware and dry vivarium components ship securely packaged across India.',
      visualKey: 'terrarium',
      emoji: '🌿',
      featured: true
    },
    {
      id: 'isopod-substrate-bag',
      name: 'Premium Isopod Substrate',
      scientificName: 'Bioactive Substrate Mix',
      category: 'terrarium',
      categoryLabel: 'Terrarium Kits',
      price: 299,
      pricingUnit: 'piece',
      size: '2 Litre Bag',
      description: 'Proprietary bioactive soil formulation enriched with decaying oak flakes, calcium, crushed leaf litter, and beneficial microflora.',
      compliance: 'available',
      complianceNotice: 'Ships standard courier across all postal codes in India.',
      visualKey: 'terrarium',
      emoji: '🪵',
      featured: false
    }
  ];

  /* ── 3. Cart State Management (localStorage) ────────────── */
  const CartManager = {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    },

    save(items) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (err) {
        console.warn('localStorage save failed:', err);
      }
      this.notify(items);
    },

    notify(items) {
      const count = this.calcCount(items);
      const total = this.calcTotal(items);
      document.querySelectorAll('#cartCount').forEach(el => {
        el.textContent = count;
      });
      renderCartDrawerItems(items, total);
    },

    calcTotal(items) {
      return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    calcCount(items) {
      return items.reduce((sum, item) => sum + item.quantity, 0);
    },

    add(product, qty = 1) {
      if (!product || !product.id) return;
      qty = Math.max(1, Math.floor(qty));
      const items = this.load();
      const idx = items.findIndex(i => String(i.id) === String(product.id));
      if (idx >= 0) {
        items[idx].quantity += qty;
      } else {
        items.push({
          id: String(product.id),
          name: product.name,
          price: Number(product.price),
          pricingUnit: product.pricingUnit || 'piece',
          size: product.size || null,
          categoryLabel: product.categoryLabel || '',
          visualKey: product.visualKey || 'aquarium',
          emoji: product.emoji || '🐟',
          quantity: qty
        });
      }
      this.save(items);
      showToast(`Added ${product.name} to cart!`, 'success');
    },

    addById(id, qty = 1) {
      const product = PRODUCTS.find(p => String(p.id) === String(id));
      if (!product) {
        console.warn('Product not found for id:', id);
        return;
      }
      this.add(product, qty);
    },

    update(id, qty) {
      qty = Math.floor(qty);
      if (qty <= 0) {
        this.remove(id);
        return;
      }
      const items = this.load();
      const idx = items.findIndex(i => String(i.id) === String(id));
      if (idx >= 0) {
        items[idx].quantity = qty;
        this.save(items);
      }
    },

    remove(id) {
      let items = this.load();
      items = items.filter(i => String(i.id) !== String(id));
      this.save(items);
      showToast('Item removed from cart', 'error');
    },

    clear() {
      this.save([]);
    },

    getItems() {
      return this.load();
    },

    getTotal() {
      return this.calcTotal(this.load());
    },

    getCount() {
      return this.calcCount(this.load());
    },

    formatPrice(amount) {
      return '₹' + Number(amount).toLocaleString('en-IN');
    },

    generateWhatsAppMessage() {
      const items = this.load();
      if (items.length === 0) return '';

      const lines = [
        'Hello Fish Tales!',
        '',
        'I would like to place an order:',
        ''
      ];

      items.forEach((item, index) => {
        let unitLabel = 'pcs';
        if (item.pricingUnit === 'pair') {
          unitLabel = 'pairs';
        } else if (item.pricingUnit === 'kit') {
          unitLabel = 'kit(s)';
        }
        const lineTotal = item.price * item.quantity;
        let line = `${index + 1}. ${item.name} – ${item.quantity} ${unitLabel} – ${this.formatPrice(lineTotal)}`;
        if (item.size) {
          line += ` (${item.size})`;
        }
        lines.push(line);
      });

      lines.push('');
      lines.push(`Subtotal: ${this.formatPrice(this.getTotal())}`);
      lines.push('');
      lines.push('Please confirm availability and delivery details.');

      return lines.join('\n');
    },

    getWhatsAppCheckoutURL() {
      const msg = this.generateWhatsAppMessage();
      if (!msg) return `https://wa.me/${WHATSAPP_NUMBER}`;
      return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    }
  };

  // Expose global convenience helpers
  window.PRODUCTS = PRODUCTS;
  window.CartManager = CartManager;
  window.addToCartById = (id, qty = 1) => CartManager.addById(id, qty);

  /* ── 4. Toast Notification Controller ────────────────────── */
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : 'ℹ'}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastOut 300ms forwards';
      setTimeout(() => toast.remove(), 320);
    }, 2800);
  }

  /* ── 5. Product Grid & Filter Controller ─────────────────── */
  let currentCategory = 'all';
  let currentSearch = '';
  let currentSort = 'default';

  function filterAndSortProducts() {
    let list = [...PRODUCTS];

    // Category filter
    if (currentCategory !== 'all') {
      list = list.filter(p => p.category === currentCategory);
    }

    // Search filter
    if (currentSearch.trim().length > 0) {
      const q = currentSearch.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.scientificName && p.scientificName.toLowerCase().includes(q)) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Sort order
    switch (currentSort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Featured first
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return list;
  }

  function renderProductGrid() {
    const grid = document.getElementById('productGrid');
    const countEl = document.getElementById('resultCount');
    if (!grid) return;

    const list = filterAndSortProducts();

    if (countEl) {
      countEl.innerHTML = `Showing <strong>${list.length}</strong> exotic specimen${list.length !== 1 ? 's' : ''}`;
    }

    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3 style="color: var(--text-primary); font-family: var(--font-heading); font-size: 1.4rem; margin-bottom: 0.5rem;">No Specimens Found</h3>
          <p style="font-size: 0.95rem;">Try adjusting your search query or switching category filters.</p>
          <button class="btn btn-outline btn-sm" style="margin-top: 1.25rem;" onclick="resetFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(product => {
      const unitLabel = product.pricingUnit === 'pair' ? 'Per Pair' : (product.pricingUnit === 'kit' ? 'Complete Kit' : 'Per Piece');
      const unitBadgeClass = product.pricingUnit === 'pair' ? 'badge-pair' : (product.pricingUnit === 'kit' ? 'badge-kit' : 'badge-piece');
      const sizeTag = product.size
        ? `<div class="product-card-size">Size: ${product.size}</div>`
        : '';
      const svgGraphic = ICONS[product.visualKey] || ICONS.aquarium;

      return `
        <article class="product-card" data-id="${product.id}">
          <div class="product-card-thumb" onclick="openProductModal('${product.id}')" title="View ${product.name} details">
            ${svgGraphic}
            <div class="product-badges-overlay">
              <span class="badge badge-stock">In Stock</span>
              <span class="badge ${unitBadgeClass}">${unitLabel}</span>
            </div>
            <button class="product-quick-view" aria-label="Quick view">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <div class="product-card-body">
            <div class="product-card-cat">${product.categoryLabel}</div>
            <h3 class="product-card-name" onclick="openProductModal('${product.id}')">${product.name}</h3>
            ${product.scientificName ? `<div class="product-card-scientific">${product.scientificName}</div>` : ''}
            ${sizeTag}
            <div class="product-card-footer">
              <div class="product-card-price-box">
                <span class="product-card-price">${CartManager.formatPrice(product.price)}</span>
                <span class="product-card-unit">${unitLabel}</span>
              </div>
              <button class="btn btn-primary btn-sm" onclick="CartManager.addById('${product.id}', 1)">
                Add to Cart
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  window.resetFilters = function () {
    currentCategory = 'all';
    currentSearch = '';
    currentSort = 'default';
    const searchInput = document.getElementById('catalogSearch');
    if (searchInput) searchInput.value = '';
    const sortSelect = document.getElementById('catalogSort');
    if (sortSelect) sortSelect.value = 'default';
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === 'all');
    });
    renderProductGrid();
  };

  /* ── 6. Product Detail Modal ─────────────────────────────── */
  window.openProductModal = function (productId) {
    const product = PRODUCTS.find(p => String(p.id) === String(productId));
    if (!product) return;

    const modalBackdrop = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    if (!modalBackdrop || !modalContent) return;

    const unitLabel = product.pricingUnit === 'pair' ? 'Per Pair' : (product.pricingUnit === 'kit' ? 'Complete Kit' : 'Per Piece');
    const svgGraphic = ICONS[product.visualKey] || ICONS.aquarium;

    const kitHTML = (product.kitIncludes && product.kitIncludes.length)
      ? `
        <div class="modal-kit-list">
          <strong>Kit Contents:</strong>
          <ul>
            ${product.kitIncludes.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `
      : '';

    const sizeHTML = product.size
      ? `<div class="modal-size-tag"><strong>Verified Size:</strong> <span>${product.size}</span></div>`
      : '';

    modalContent.innerHTML = `
      <div class="modal-layout">
        <div class="modal-visual-wrap">
          ${svgGraphic}
        </div>
        <div class="modal-info">
          <div class="modal-cat">${product.categoryLabel}</div>
          <h2 class="modal-title">${product.name}</h2>
          ${product.scientificName ? `<div class="modal-scientific">${product.scientificName}</div>` : ''}

          <div class="modal-price-row">
            <span class="modal-price">${CartManager.formatPrice(product.price)}</span>
            <span class="modal-price-unit">${unitLabel}</span>
            <span class="badge badge-stock" style="margin-left: 0.5rem;">In Stock</span>
          </div>

          ${sizeHTML}
          <p class="modal-desc">${product.description}</p>
          ${kitHTML}

          <div class="modal-compliance-notice">
            <strong style="color:var(--accent-secondary); display:block; margin-bottom:0.2rem;">⚖️ Compliance &amp; Shipping:</strong>
            ${product.complianceNotice}
          </div>

          <div class="modal-actions-row">
            <div class="modal-qty-stepper">
              <button class="modal-qty-btn" onclick="updateModalQty(-1)" aria-label="Decrease quantity">−</button>
              <span class="modal-qty-val" id="modalQty">1</span>
              <button class="modal-qty-btn" onclick="updateModalQty(1)" aria-label="Increase quantity">+</button>
            </div>
            <button class="btn btn-primary" id="modalAddBtn" onclick="addModalItemToCart('${product.id}')">
              Add to Cart
            </button>
            <button class="btn btn-whatsapp" onclick="directModalWhatsAppOrder('${product.id}')">
              WhatsApp Order
            </button>
          </div>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeProductModal = function () {
    const modalBackdrop = document.getElementById('productModal');
    if (modalBackdrop) modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  window.updateModalQty = function (delta) {
    const qtyEl = document.getElementById('modalQty');
    if (!qtyEl) return;
    let qty = parseInt(qtyEl.textContent, 10) + delta;
    if (qty < 1) qty = 1;
    qtyEl.textContent = qty;
  };

  window.addModalItemToCart = function (productId) {
    const qtyEl = document.getElementById('modalQty');
    const qty = qtyEl ? parseInt(qtyEl.textContent, 10) : 1;
    CartManager.addById(productId, qty);
    closeProductModal();
  };

  window.directModalWhatsAppOrder = function (productId) {
    const product = PRODUCTS.find(p => String(p.id) === String(productId));
    if (!product) return;
    const qtyEl = document.getElementById('modalQty');
    const qty = qtyEl ? parseInt(qtyEl.textContent, 10) : 1;
    const unit = product.pricingUnit === 'pair' ? 'pair(s)' : 'piece(s)';
    const total = CartManager.formatPrice(product.price * qty);

    const msg = [
      'Hello Fish Tales!',
      '',
      `I would like to order: ${product.name}`,
      `Quantity: ${qty} ${unit}`,
      `Price: ${CartManager.formatPrice(product.price)}`,
      `Total: ${total}`,
      product.size ? `Size: ${product.size}` : '',
      '',
      'Please confirm availability and delivery details.'
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  /* ── 7. Slide-out Cart Drawer Controller ─────────────────── */
  function renderCartDrawerItems(items, total) {
    const itemsWrap = document.getElementById('cartDrawerItems');
    const subtotalEl = document.getElementById('cartDrawerSubtotal');
    const checkoutBtn = document.getElementById('cartDrawerCheckoutBtn');
    if (!itemsWrap || !subtotalEl) return;

    subtotalEl.textContent = CartManager.formatPrice(total);

    if (checkoutBtn) {
      checkoutBtn.href = CartManager.getWhatsAppCheckoutURL();
    }

    if (items.length === 0) {
      itemsWrap.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">🛒</div>
          <h4 style="color:var(--text-primary); margin-bottom:0.5rem; font-family:var(--font-heading); font-size:1.25rem;">Your Cart is Empty</h4>
          <p style="font-size:0.88rem; line-height:1.6; margin-bottom:1.5rem;">Explore our curated selection of rare exotic pets, guppy pairs, and bioactive vivarium kits.</p>
          <button class="btn btn-primary btn-sm" onclick="closeCartDrawer(); scrollToSection('catalogue')">
            Start Exploring
          </button>
        </div>
      `;
      return;
    }

    itemsWrap.innerHTML = items.map(item => {
      const lineTotal = CartManager.formatPrice(item.price * item.quantity);
      const unitLabel = item.pricingUnit === 'pair' ? 'per pair' : (item.pricingUnit === 'kit' ? 'kit' : 'per piece');
      const svgThumb = ICONS[item.visualKey] || ICONS.aquarium;

      return `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-img">
            ${svgThumb}
          </div>
          <div class="cart-item-info">
            <span class="cart-item-title">${item.name}</span>
            <span class="cart-item-meta">${CartManager.formatPrice(item.price)} ${unitLabel}</span>
            ${item.size ? `<span class="cart-item-meta" style="color:var(--accent-secondary);">Size: ${item.size}</span>` : ''}
            <div class="cart-item-stepper">
              <button class="cart-step-btn" onclick="CartManager.update('${item.id}', ${item.quantity - 1})" aria-label="Decrease">−</button>
              <span class="cart-step-val">${item.quantity}</span>
              <button class="cart-step-btn" onclick="CartManager.update('${item.id}', ${item.quantity + 1})" aria-label="Increase">+</button>
            </div>
          </div>
          <div class="cart-item-right">
            <span class="cart-item-price">${lineTotal}</span>
            <span class="cart-item-remove" onclick="CartManager.remove('${item.id}')">Remove</span>
          </div>
        </div>
      `;
    }).join('');
  }

  window.openCartDrawer = function () {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartBackdrop');
    if (drawer && backdrop) {
      drawer.classList.add('active');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeCartDrawer = function () {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartBackdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  /* ── 8. Live Search Overlay ──────────────────────────────── */
  window.openSearchOverlay = function () {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchOverlayInput');
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 150);
        renderSearchOverlayResults('');
      }
    }
  };

  window.closeSearchOverlay = function () {
    const overlay = document.getElementById('searchOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  function renderSearchOverlayResults(query) {
    const resultsWrap = document.getElementById('searchOverlayResults');
    if (!resultsWrap) return;

    const q = query.toLowerCase().trim();
    if (!q) {
      resultsWrap.innerHTML = `
        <div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.95rem;">
          Type any species name, category (e.g. <em>isopod</em>, <em>tarantula</em>, <em>guppy</em>), or kit to preview.
        </div>
      `;
      return;
    }

    const matches = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.scientificName && p.scientificName.toLowerCase().includes(q)) ||
      p.categoryLabel.toLowerCase().includes(q)
    ).slice(0, 8);

    if (matches.length === 0) {
      resultsWrap.innerHTML = `
        <div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.95rem;">
          No exotic species matching "<strong>${query}</strong>".
        </div>
      `;
      return;
    }

    resultsWrap.innerHTML = matches.map(p => `
      <div class="search-result-row" onclick="closeSearchOverlay(); openProductModal('${p.id}')">
        <span style="font-size:1.75rem;">${p.emoji}</span>
        <div style="flex:1;">
          <div style="font-weight:600; font-size:1rem; color:var(--text-primary);">${p.name}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${p.categoryLabel} · ${p.pricingUnit === 'pair' ? 'Per Pair' : 'Per Piece'}</div>
        </div>
        <div style="font-family:var(--font-heading); font-weight:700; color:var(--accent-primary); font-size:1.15rem;">
          ${CartManager.formatPrice(p.price)}
        </div>
      </div>
    `).join('');
  }

  /* ── 9. Smooth Scrolling & Category Navigation Helper ────── */
  window.scrollToSection = function (sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
      const headerOffset = 76;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  window.filterCategoryAndScroll = function (categoryKey) {
    currentCategory = categoryKey;
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === categoryKey);
    });
    renderProductGrid();
    scrollToSection('catalogue');
  };

  /* ── 10. DOM Initialization ──────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial cart badge & items render
    const initialItems = CartManager.load();
    CartManager.notify(initialItems);

    // 2. Render initial product catalogue
    renderProductGrid();

    // 3. Header scroll effect
    const header = document.getElementById('siteHeader');
    window.addEventListener('scroll', () => {
      if (header) {
        if (window.scrollY > 20) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    }, { passive: true });

    // 4. Mobile hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('active');
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
      });

      navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
          hamburger.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // 5. Category tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.dataset.category;
        renderProductGrid();
      });
    });

    // 6. Catalogue search input
    const catalogSearch = document.getElementById('catalogSearch');
    if (catalogSearch) {
      let debounceTimer;
      catalogSearch.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          currentSearch = e.target.value;
          renderProductGrid();
        }, 180);
      });
    }

    // 7. Catalogue sort select
    const catalogSort = document.getElementById('catalogSort');
    if (catalogSort) {
      catalogSort.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderProductGrid();
      });
    }

    // 8. Live search overlay input
    const searchOverlayInput = document.getElementById('searchOverlayInput');
    if (searchOverlayInput) {
      searchOverlayInput.addEventListener('input', (e) => {
        renderSearchOverlayResults(e.target.value);
      });
    }

    // 9. Keyboard Esc to close overlays/modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCartDrawer();
        closeProductModal();
        closeSearchOverlay();
      }
    });

    // 10. WhatsApp Checkout button in cart drawer
    const checkoutBtn = document.getElementById('cartDrawerCheckoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', (e) => {
        if (CartManager.getCount() === 0) {
          e.preventDefault();
          showToast('Your cart is empty!', 'error');
        }
      });
    }
  });

})();
