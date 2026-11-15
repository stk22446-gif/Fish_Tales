/**
 * FISH TALES — Master JavaScript Engine
 * Production Ready | Vanilla JS (ES6+) | LocalStorage Persistence
 * WhatsApp Checkout Integration (+91 96542 97430)
 *
 * 4 Main Product Categories:
 * 1. Aquarium & Fish
 * 2. Isopods
 * 3. Tarantulas
 * 4. Combo Packs
 */

(function () {
  'use strict';

  /* ── 1. Configuration & Constants ─────────────────────────── */
  const WHATSAPP_NUMBER = '919654297430';
  const STORAGE_KEY = 'fishtales_cart';

  // High-Resolution Cinematic SVG Illustrations for Instant Zero-Latency Rendering
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

    betta: `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bettaGrad" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#1A281E"/>
          <stop offset="70%" stop-color="#0A140F"/>
          <stop offset="100%" stop-color="#050B08"/>
        </radialGradient>
        <linearGradient id="bettaFin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E06C75"/>
          <stop offset="40%" stop-color="#D4A94D"/>
          <stop offset="100%" stop-color="#B8E64A"/>
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#bettaGrad)"/>
      <!-- Grand Betta Halfmoon Tail Fins -->
      <g transform="translate(190, 140)">
        <path d="M-20 0 C -90 -80, -120 10, -50 0 C -120 30, -90 90, -20 10 Z" fill="url(#bettaFin)" opacity="0.9"/>
        <path d="M-10 -15 C 20 -70, -30 -60, -20 -10 Z" fill="url(#bettaFin)" opacity="0.85"/>
        <path d="M-5 15 C 10 65, -15 60, -10 15 Z" fill="url(#bettaFin)" opacity="0.85"/>
        <!-- Body -->
        <ellipse cx="15" cy="0" rx="38" ry="15" fill="#D4A94D"/>
        <!-- Pectoral Flare -->
        <path d="M8 5 C 15 25, 25 20, 18 5 Z" fill="#B8E64A" opacity="0.8"/>
        <circle cx="42" cy="-4" r="3" fill="#050B08"/>
        <circle cx="43" cy="-5" r="1" fill="#FFF"/>
      </g>
      <circle cx="280" cy="80" r="3" fill="#B8E64A" opacity="0.4"/>
      <circle cx="120" cy="220" r="2.5" fill="#B8E64A" opacity="0.3"/>
    </svg>`,

    isopod: `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="isoGrad" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#182A1C"/>
          <stop offset="70%" stop-color="#0A150D"/>
          <stop offset="100%" stop-color="#050B08"/>
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#isoGrad)"/>
      <ellipse cx="200" cy="245" rx="140" ry="25" fill="#0D1711" opacity="0.8"/>
      <!-- Isopod Segmented Shell -->
      <g transform="translate(200, 140)">
        <ellipse cx="0" cy="0" rx="55" ry="78" fill="#1A3324"/>
        <path d="M -42 -40 Q 0 -50 42 -40" stroke="#B8E64A" stroke-width="3" fill="none"/>
        <path d="M -50 -20 Q 0 -30 50 -20" stroke="#B8E64A" stroke-width="3" fill="none"/>
        <path d="M -54 0 Q 0 -10 54 0" stroke="#B8E64A" stroke-width="3" fill="none"/>
        <path d="M -52 20 Q 0 10 52 20" stroke="#B8E64A" stroke-width="3" fill="none"/>
        <path d="M -44 40 Q 0 30 44 40" stroke="#B8E64A" stroke-width="3" fill="none"/>
        <path d="M -30 60 Q 0 50 30 60" stroke="#B8E64A" stroke-width="2.5" fill="none"/>
        <circle cx="-15" cy="-68" r="4" fill="#D4A94D"/>
        <circle cx="15" cy="-68" r="4" fill="#D4A94D"/>
        <!-- Antennae -->
        <path d="M -15 -72 Q -35 -95 -50 -90" stroke="#D4A94D" stroke-width="2" fill="none"/>
        <path d="M 15 -72 Q 35 -95 50 -90" stroke="#D4A94D" stroke-width="2" fill="none"/>
      </g>
    </svg>`,

    tarantula: `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="tGrad" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#241B18"/>
          <stop offset="70%" stop-color="#0E0908"/>
          <stop offset="100%" stop-color="#050B08"/>
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#tGrad)"/>
      <ellipse cx="200" cy="240" rx="130" ry="22" fill="#000" opacity="0.6"/>
      <!-- Spider anatomy -->
      <g transform="translate(200, 140)">
        <!-- Legs (left) -->
        <path d="M -15 -10 Q -60 -50 -100 -20" stroke="#D4A94D" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <path d="M -20 0 Q -80 -25 -110 5" stroke="#B8E64A" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <path d="M -20 12 Q -80 25 -105 45" stroke="#D4A94D" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <path d="M -15 25 Q -65 65 -90 85" stroke="#B8E64A" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <!-- Legs (right) -->
        <path d="M 15 -10 Q 60 -50 100 -20" stroke="#D4A94D" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <path d="M 20 0 Q 80 -25 110 5" stroke="#B8E64A" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <path d="M 20 12 Q 80 25 105 45" stroke="#D4A94D" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <path d="M 15 25 Q 65 65 90 85" stroke="#B8E64A" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <!-- Abdomen & Carapace -->
        <ellipse cx="0" cy="28" rx="28" ry="36" fill="#2E1B15" stroke="#D4A94D" stroke-width="2"/>
        <circle cx="0" cy="-8" r="22" fill="#3D291F" stroke="#B8E64A" stroke-width="2"/>
        <!-- Chelicerae / Fangs -->
        <path d="M -6 -28 L -4 -38 L -1 -30" stroke="#D4A94D" stroke-width="2.5" fill="none"/>
        <path d="M 6 -28 L 4 -38 L 1 -30" stroke="#D4A94D" stroke-width="2.5" fill="none"/>
      </g>
    </svg>`,

    combo: `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="comboGrad" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#1B281B"/>
          <stop offset="70%" stop-color="#0D1A10"/>
          <stop offset="100%" stop-color="#050B08"/>
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#comboGrad)"/>
      <g transform="translate(200, 145)">
        <!-- Gift / Bundle Base Box -->
        <rect x="-65" y="-35" width="130" height="90" rx="8" fill="#13241A" stroke="#B8E64A" stroke-width="2.5"/>
        <path d="M -72 -42 L 72 -42 L 65 -25 L -65 -25 Z" fill="#1A3324" stroke="#D4A94D" stroke-width="2"/>
        <!-- Ribbon Bands -->
        <line x1="0" y1="-42" x2="0" y2="55" stroke="#D4A94D" stroke-width="4"/>
        <line x1="-65" y1="10" x2="65" y2="10" stroke="#D4A94D" stroke-width="3"/>
        <!-- Big Bioactive Ribbon Bow -->
        <path d="M 0 -42 C -30 -75 -40 -45 0 -42 Z" fill="#B8E64A" opacity="0.9"/>
        <path d="M 0 -42 C 30 -75 40 -45 0 -42 Z" fill="#B8E64A" opacity="0.9"/>
        <circle cx="0" cy="-42" r="7" fill="#D4A94D"/>
      </g>
      <!-- Sparkle Orbs -->
      <circle cx="120" cy="80" r="3" fill="#B8E64A" opacity="0.5"/>
      <circle cx="280" cy="70" r="4" fill="#D4A94D" opacity="0.5"/>
      <circle cx="310" cy="210" r="3" fill="#B8E64A" opacity="0.4"/>
    </svg>`,

    isopodKit: `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="kitGrad" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#1B2B1F"/>
          <stop offset="70%" stop-color="#0A160E"/>
          <stop offset="100%" stop-color="#050B08"/>
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#kitGrad)"/>
      <g transform="translate(200, 140)">
        <path d="M -70 40 L 0 -20 L 70 40 L 70 120 L -70 120 Z" fill="#12251A" stroke="#B8E64A" stroke-width="2.5"/>
        <path d="M 0 -20 L 0 120" stroke="#B8E64A" stroke-width="1.2" stroke-dasharray="3,3"/>
        <path d="M -25 120 Q -5 60 5 45 Q 15 65 25 120" stroke="#D4A94D" stroke-width="2.5" fill="none"/>
        <text x="0" y="90" fill="#B8E64A" font-size="12" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">5"x5"x5" GLASS</text>
      </g>
    </svg>`,

    aquariumKit: `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="halfCubeGrad" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#102528"/>
          <stop offset="70%" stop-color="#08151A"/>
          <stop offset="100%" stop-color="#050B08"/>
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#halfCubeGrad)"/>
      <g transform="translate(200, 145)">
        <rect x="-85" y="-55" width="170" height="120" rx="6" fill="#0C2025" stroke="#38BDF8" stroke-width="2.5"/>
        <path d="M -60 65 Q -40 10 -25 65" stroke="#B8E64A" stroke-width="2.5" fill="none"/>
        <path d="M -30 65 Q -10 20 0 65" stroke="#22C55E" stroke-width="2.5" fill="none"/>
        <!-- Swimming Betta Silhouette -->
        <g transform="translate(30, 0)">
          <path d="M -15 0 C -40 -30, -50 15, -20 5 Z" fill="#D4A94D" opacity="0.9"/>
          <ellipse cx="0" cy="0" rx="18" ry="8" fill="#F5F7F2"/>
          <circle cx="12" cy="-2" r="1.5" fill="#050B08"/>
        </g>
      </g>
    </svg>`,

    glacierOffer: `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glacierGrad" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#242114"/>
          <stop offset="70%" stop-color="#121008"/>
          <stop offset="100%" stop-color="#050B08"/>
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#glacierGrad)"/>
      <circle cx="200" cy="140" r="75" fill="#D4A94D" opacity="0.15"/>
      <g transform="translate(200, 130)">
        <ellipse cx="-30" cy="-10" rx="22" ry="14" fill="#F5F7F2" opacity="0.85"/>
        <ellipse cx="30" cy="-5" rx="20" ry="13" fill="#F5F7F2" opacity="0.85"/>
        <ellipse cx="0" cy="30" rx="26" ry="16" fill="#B8E64A" opacity="0.9"/>
        <text x="0" y="-45" fill="#D4A94D" font-size="14" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">10 + 1 FREE DEAL</text>
      </g>
    </svg>`
  };

  /* ── 2. Master Product Catalogue (32 Verified Items) ───────── */
  const PRODUCTS = [
    // ══════════════════════════════════════════════════════════════
    // CATEGORY 1: AQUARIUM & FISH (13 Guppies + Betta Fish)
    // ══════════════════════════════════════════════════════════════
    {
      id: 'guppy-red-lace',
      name: 'Red Lace Guppy',
      scientificName: 'Poecilia reticulata var. Red Lace',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 250,
      pricingUnit: 'pair',
      size: 'Adult Pair (Male + Female)',
      description: 'Intricate red lace-patterned caudal fin with iridescent body tones. Captive bred and conditioned for freshwater community tanks.',
      compliance: 'available',
      complianceNotice: 'Pure oxygen-infused live fish transport packaging. Delivered safely across India.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: true
    },
    {
      id: 'guppy-gold-dumbo-ear',
      name: 'Gold Dumbo Ear Guppy',
      scientificName: 'Poecilia reticulata var. Gold Dumbo Ear',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 280,
      pricingUnit: 'pair',
      size: 'Adult Pair',
      description: 'Lustrous golden body with enlarged, prominent "dumbo ear" pectoral fins creating a graceful flutter in planted tanks.',
      compliance: 'available',
      complianceNotice: 'Carefully acclimated show strain. Healthy live arrival guaranteed with unboxing video.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: false
    },
    {
      id: 'guppy-santacruz-dumbo-ear',
      name: 'Santacruz Dumbo Ear Guppy',
      scientificName: 'Poecilia reticulata var. Santacruz Dumbo',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 250,
      pricingUnit: 'pair',
      size: 'Adult Pair',
      description: 'Striking Santacruz lineage showcasing oversized dumbo ears, vivid coloration, and calm schooling behavior.',
      compliance: 'available',
      complianceNotice: 'Ships Monday through Wednesday in insulated temperature-regulated containers.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: false
    },
    {
      id: 'guppy-platinum-dumbo-halfmoon',
      name: 'Platinum Dumbo Ear Halfmoon Guppy',
      scientificName: 'Poecilia reticulata var. Platinum Dumbo Halfmoon',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 280,
      pricingUnit: 'pair',
      size: 'Adult Pair',
      description: 'Full 180-degree halfmoon caudal fin with gleaming platinum-white scales and grand dumbo pectoral ears.',
      compliance: 'available',
      complianceNotice: 'Pure oxygen pack with thermal insulation. Pre-shipment video shared on WhatsApp.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: true
    },
    {
      id: 'guppy-blue-dragon-dumbo-halfmoon',
      name: 'Blue Dragon Dumbo Ear Halfmoon Guppy',
      scientificName: 'Poecilia reticulata var. Blue Dragon Dumbo',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 280,
      pricingUnit: 'pair',
      size: 'Adult Pair',
      description: 'Rich royal blue metallic dorsal and halfmoon tail paired with grand dumbo ear fins. Stunning centerpiece display fish.',
      compliance: 'available',
      complianceNotice: 'Guaranteed healthy live arrival when verified within 2 hours of delivery.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: true
    },
    {
      id: 'guppy-moscow-black-dumbo',
      name: 'Moscow Black Dumbo Ear Guppy',
      scientificName: 'Poecilia reticulata var. Moscow Black Dumbo',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 250,
      pricingUnit: 'pair',
      size: 'Adult Pair',
      description: 'Deep velvet-black coloration spanning from snout to tail, contrasted by delicate fluttery dumbo pectoral fins.',
      compliance: 'available',
      complianceNotice: 'Carefully quarantined stock from disease-free lines.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: false
    },
    {
      id: 'guppy-afr-big-dorsal',
      name: 'AFR Big Dorsal Guppy',
      scientificName: 'Poecilia reticulata var. Albino Full Red Big Dorsal',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 300,
      pricingUnit: 'pair',
      size: 'Adult Pair',
      description: 'Prized Albino Full Red (AFR) genetics with an extravagant, sail-like big dorsal fin and ruby-red eyes.',
      compliance: 'available',
      complianceNotice: 'Top show grade stock. Packaged in breathable thermal shipping boxes.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: true
    },
    {
      id: 'guppy-dark-knight-dragon-dumbo',
      name: 'Dark Knight Dragon Dumbo Ear Guppy',
      scientificName: 'Poecilia reticulata var. Dark Knight Dragon',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 280,
      pricingUnit: 'pair',
      size: 'Adult Pair',
      description: 'Dark dramatic dragon scales with violet and navy undertones, complemented by fluttering dumbo ears.',
      compliance: 'available',
      complianceNotice: 'Insulated packaging with hot/cold packs suited to seasonal route conditions.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: false
    },
    {
      id: 'guppy-red-platinum-koi-dumbo',
      name: 'Red Platinum Koi Dumbo Ear Guppy',
      scientificName: 'Poecilia reticulata var. Red Platinum Koi Dumbo',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 280,
      pricingUnit: 'pair',
      size: 'Adult Pair',
      description: 'Classic red and platinum koi-styled color patterns with translucent big dumbo ears. Active and very hardy.',
      compliance: 'available',
      complianceNotice: 'Stock verified over WhatsApp before dispatch.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: false
    },
    {
      id: 'guppy-magenta-red-tiger',
      name: 'Magenta Red Tiger Guppy',
      scientificName: 'Poecilia reticulata var. Magenta Red Tiger',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 250,
      pricingUnit: 'pair',
      size: 'Adult Pair',
      description: 'Bold tiger bar stripes over vibrant magenta-red body. Energetic swimmer that thrives in planted aquascapes.',
      compliance: 'available',
      complianceNotice: 'All live specimens shipped with transit insurance & guarantee.',
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
      size: 'Adult Pair',
      description: 'Crisp white caudal fin contrasted with a deep midnight tuxedo torso. Highly prolific and peaceful.',
      compliance: 'available',
      complianceNotice: 'Carefully packaged with oxygenated water and stress-reducing conditioner.',
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
      size: 'Adult Pair',
      description: 'Silvery metallic chest transitioning into a fierce red dragon-patterned tail fin. Stunning light-reflective sheen.',
      compliance: 'available',
      complianceNotice: 'Tested water chemistry acclimation guide included with every shipment.',
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
      size: 'Adult Pair',
      description: 'Deep emerald-green metallic sheen covering head to tail. An all-time legendary strain for discerning planted tank keepers.',
      compliance: 'available',
      complianceNotice: 'Direct doorstep delivery via fast courier.',
      visualKey: 'aquarium',
      emoji: '🐟',
      featured: false
    },
    {
      id: 'show-grade-betta',
      name: 'Show Grade Betta Fish',
      scientificName: 'Betta splendens (Halfmoon / Plakat)',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 350,
      pricingUnit: 'piece',
      size: 'Adult (5–6 cm)',
      description: 'Exquisite hand-selected show Betta featuring vibrant color iridescence, grand flowing fins, and robust active health. Ideal centerpiece specimen.',
      compliance: 'available',
      complianceNotice: 'Shipped in specialized double-layer breathable fish bags with pure medical oxygen.',
      visualKey: 'betta',
      emoji: '🐟',
      featured: true
    },

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 2: ISOPODS (7 Pure Strains, Per Piece)
    // ══════════════════════════════════════════════════════════════
    {
      id: 'armadillidium-gestroi',
      name: 'Armadillidium Gestroi',
      scientificName: 'Armadillidium gestroi',
      category: 'isopods',
      categoryLabel: 'Isopods',
      price: 120,
      pricingUnit: 'piece',
      size: null,
      description: 'Striking Mediterranean pill bug known for its large size, bright yellow spotted dorsal plates, and vigorous vivarium janitorial skills.',
      compliance: 'available',
      complianceNotice: 'Captive-bred live culture. Packed with moist sphagnum moss and breathable enclosure.',
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
      description: 'Warm apricot-orange color morph. Hardy, highly active, and quick to establish a thriving custodial colony in humid vivariums.',
      compliance: 'available',
      complianceNotice: 'Captive bred non-native invertebrate. Ships safely in ventilated micro-containers.',
      visualKey: 'isopod',
      emoji: '🪵',
      featured: false
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
      description: 'Pristine white porcelain appearance with subtle translucent undertones. Excellent bioactive cleanup crew.',
      compliance: 'available',
      complianceNotice: 'Promotional offer: Buy 10, get 1 extra free! Dispatched with thermal heat/ice insulation.',
      visualKey: 'isopod',
      emoji: '❄️',
      featured: true
    },
    {
      id: 'porcellionides-pruinosus-orange-pied',
      name: 'Porcellionides pruinosus Orange Pied',
      scientificName: 'Porcellionides pruinosus "Orange Pied"',
      category: 'isopods',
      categoryLabel: 'Isopods',
      price: 60,
      pricingUnit: 'piece',
      size: null,
      description: 'Fast-moving, velvety powder-orange isopod with distinctive white pied patches. Superb detritivore for tropical enclosures.',
      compliance: 'available',
      complianceNotice: 'Prolific bioactive crew. Arrives in secure moisture-retaining deli cup.',
      visualKey: 'isopod',
      emoji: '🍁',
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
      description: 'Ultra-rare collector isopod exhibiting warm espresso-brown skirts and a creamy dorsal stripe reminiscent of a barista cappuccino.',
      compliance: 'available',
      complianceNotice: 'Premium collector lineage. Verified over WhatsApp before expedited transit.',
      visualKey: 'isopod',
      emoji: '☕',
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
      description: 'Exquisite pastel pink and creamy white hues mimicking delicate sakura blossoms. A prized gem among luxury isopod enthusiasts.',
      compliance: 'available',
      complianceNotice: 'Priority express dispatch with custom insulated chamber.',
      visualKey: 'isopod',
      emoji: '🌸',
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
      description: 'Fascinating textured, bumpy slate-grey shell with high drought tolerance. Extremely resilient and fascinating to observe.',
      compliance: 'available',
      complianceNotice: 'Healthy live arrival guaranteed across all serviceable Indian pincodes.',
      visualKey: 'isopod',
      emoji: '🪨',
      featured: false
    },

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 3: TARANTULAS (6 Species, Exact Sizes & Prices)
    // ══════════════════════════════════════════════════════════════
    {
      id: 'chilean-rose-hair',
      name: 'Chilean Rose Hair',
      scientificName: 'Grammostola rosea',
      category: 'tarantulas',
      categoryLabel: 'Tarantulas',
      price: 2199,
      pricingUnit: 'piece',
      size: '1–1.5 cm',
      description: 'Renowned for its calm, docile temperament and subtle pink carapace setae. The quintessential beginner New World tarantula.',
      compliance: 'available',
      complianceNotice: 'Captive-bred spiderling (1–1.5 cm). Packed in insulated, shock-absorbing vial with moisture control.',
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
      description: 'Bold contrast of jet-black legs adorned with striking snow-white knee bands. Highly active with an enthusiastic feeding response.',
      compliance: 'available',
      complianceNotice: 'Captive-bred juvenile. Temperature-safe express transit verified prior to dispatch.',
      visualKey: 'tarantula',
      emoji: '🕷️',
      featured: true
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
      description: 'World-famous display species showcasing fiery orange-red leg joints and deep black velvety body. Very docile and long-lived.',
      compliance: 'available',
      complianceNotice: 'Ethically captive-bred spiderling. Shipped safely across India with unboxing video protection.',
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
      description: 'Spectacular electric blue legs, metallic emerald-green carapace, and vibrant tiger-striped abdomen. Prolific heavy webber.',
      compliance: 'available',
      complianceNotice: 'Shipped in premium padded vial with rapid express courier.',
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
      description: 'Gentle giant famous for golden-yellow striped knee markings and calm demeanor. Highly recommended for enthusiastic beginners.',
      compliance: 'available',
      complianceNotice: 'Live arrival guarantee when unboxing video is shared within 2 hours of delivery.',
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
      description: 'One of the largest tarantula species on Earth. Fast-growing spiderling with salmon-pink hairs and unmatched voracious appetite.',
      compliance: 'available',
      complianceNotice: '1-inch established spiderling. Securely packed in padded ventilation capsule.',
      visualKey: 'tarantula',
      emoji: '🕷️',
      featured: true
    },

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 4: COMBO PACKS (Complete Kits & Confirmed Bundles)
    // ══════════════════════════════════════════════════════════════
    {
      id: 'isopod-house-kit',
      name: 'Isopod House Kit',
      scientificName: 'Complete Bioactive Isopod Habitat',
      category: 'combos',
      secondaryCategory: 'isopods',
      categoryLabel: 'Combo Packs',
      price: 1545,
      pricingUnit: 'kit',
      size: '5" L × 5" D × 5" H (+ 2.5" roof)',
      description: 'All-in-one glass bioactive habitat kit. Comes complete with living tropical plants, organic substrate blend, natural lotus pod hide, nutrient food, and a starter culture of 6 Cubaris "Glacier" isopods.',
      kitIncludes: [
        'Glass Isopod House (5" L × 5" D × 5" H + 2.5" roof height)',
        'Fittonia albivenis (Patterned nerve plant)',
        'Hemigraphis sp. Pink (Purple waffle plant)',
        'Natural Sheet Moss layer',
        'Bioactive Isopod Substrate Blend',
        'Lotus Pod (natural botanical hide)',
        'Premium Isopod Food (calcium + protein pellets)',
        'Isopod Culture: 6 Cubaris sp. "Glacier"'
      ],
      compliance: 'available',
      complianceNotice: 'Complete glass habitat and live culture packed with high-grade shock-absorbent cushioning.',
      visualKey: 'isopodKit',
      emoji: '🏡',
      featured: true
    },
    {
      id: 'half-cube-aquarium-kit',
      name: 'Half Cube Aquarium Kit',
      scientificName: 'Desktop Betta Aquascape Bundle',
      category: 'combos',
      secondaryCategory: 'aquarium',
      categoryLabel: 'Combo Packs',
      price: 999,
      pricingUnit: 'kit',
      size: 'Desktop Half Cube',
      description: 'A complete desktop planted aquarium kit designed for effortless elegance. Includes glass half-cube tank, 1 healthy Betta fish, live aquatic plants, and premium washed sand substrate.',
      kitIncludes: [
        'Half Cube Glass Desktop Aquarium',
        '1 beautiful Show Betta Fish',
        'Live aquatic plants for water purification',
        'Premium washed sand substrate'
      ],
      compliance: 'available',
      complianceNotice: 'Live Betta fish and aquatic plants packed in oxygenated breathable bags with shock insulation.',
      visualKey: 'aquariumKit',
      emoji: '🫧',
      featured: true
    },
    {
      id: 'glacier-colony-pack',
      name: 'Glacier Isopods (10 + 1 Free Colony Pack)',
      scientificName: 'Cubaris murina "Glacier" 10+1 Special',
      category: 'combos',
      secondaryCategory: 'isopods',
      categoryLabel: 'Combo Packs',
      price: 700,
      pricingUnit: 'kit',
      size: '11 specimens total',
      description: 'Exclusive colony expansion deal: Purchase 10 Cubaris Murina Glacier isopods and receive 1 additional specimen completely free of charge. Great for bioactive vivarium seed colonies.',
      kitIncludes: [
        '10 Cubaris Murina Glacier Isopods',
        '1 Bonus Isopod (11 total)',
        'Breathable starter transport culture deli cup',
        'Starter nutritional calcium pellets'
      ],
      compliance: 'available',
      complianceNotice: 'Ships safely in climate-controlled insulated transit containers.',
      visualKey: 'glacierOffer',
      emoji: '❄️',
      featured: true
    },
    {
      id: 'bioactive-terrarium-starter',
      name: 'Bioactive Terrarium Starter Kit',
      scientificName: 'Full Vivarium Bio-Foundation Pack',
      category: 'combos',
      categoryLabel: 'Combo Packs',
      price: 2499,
      pricingUnit: 'kit',
      size: 'Complete Setup Pack',
      description: 'Everything required to establish a self-sustaining bioactive vivarium base: drainage hydro-balls, mesh divider barrier, premium ABG soil blend, magnolia leaf litter, and a starter springtail culture.',
      kitIncludes: [
        'Hydro-ball drainage substrate (2L)',
        'Custom-cut separation mesh barrier',
        'Tropical ABG bioactive substrate blend (3L)',
        'Sanitized botanical leaf litter pack',
        'Active springtail seeded culture'
      ],
      compliance: 'available',
      complianceNotice: 'Ships standard courier across all postal codes in India.',
      visualKey: 'combo',
      emoji: '🌿',
      featured: false
    },
    {
      id: 'isopod-care-combo',
      name: 'Isopod Habitat & Care Bundle',
      scientificName: 'Substrate & Botanical Nutrition Bundle',
      category: 'combos',
      categoryLabel: 'Combo Packs',
      price: 450,
      pricingUnit: 'kit',
      size: 'Multi-Item Care Pack',
      description: 'Essential bioactive sustenance package including 2L proprietary isopod substrate blend, natural dried lotus pod hide, and high-calcium protein pellet food.',
      kitIncludes: [
        '2 Litres Bioactive Isopod Substrate Blend',
        'Natural Dried Lotus Pod Hide',
        '100g High-Protein & Calcium Pellet Food'
      ],
      compliance: 'available',
      complianceNotice: 'Standard shipping across India via expedited courier.',
      visualKey: 'combo',
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
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
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
      showToast('Item removed from cart', 'info');
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

    formatPrice(num) {
      return '₹' + Number(num).toLocaleString('en-IN');
    },

    /**
     * Exact WhatsApp Order Summary Generator (Section 10 Requirement)
     */
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
        const itemTotal = item.price * item.quantity;
        let qtyLabel;
        if (item.pricingUnit === 'pair') {
          qtyLabel = item.quantity === 1 ? '1 pair' : `${item.quantity} pairs`;
        } else if (item.pricingUnit === 'kit') {
          qtyLabel = item.quantity === 1 ? '1 kit' : `${item.quantity} kits`;
        } else {
          qtyLabel = `${item.quantity} pcs`;
        }
        lines.push(`${index + 1}. ${item.name} – ${qtyLabel} – ${this.formatPrice(itemTotal)}`);
      });

      const subtotal = this.calcTotal(items);
      lines.push('');
      lines.push(`Subtotal: ${this.formatPrice(subtotal)}`);
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
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  /* ── 5. Product Filtering, Search & Catalogue Rendering ──── */
  let currentCategory = 'all';
  let currentSearch = '';
  let currentSort = 'default';

  function filterAndSortProducts() {
    let list = [...PRODUCTS];

    // Category filter (supports primary and secondary category cross-listing)
    if (currentCategory !== 'all') {
      list = list.filter(p => p.category === currentCategory || p.secondaryCategory === currentCategory);
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
      case 'price-low':
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'name':
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Featured items first
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
            <button class="product-quick-view" aria-label="Quick view" onclick="openProductModal('${product.id}')">
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
            <strong style="color:var(--color-amber); display:block; margin-bottom:0.2rem;">⚖️ Compliance &amp; Shipping:</strong>
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

    let qtyLabel;
    if (product.pricingUnit === 'pair') {
      qtyLabel = qty === 1 ? '1 pair' : `${qty} pairs`;
    } else if (product.pricingUnit === 'kit') {
      qtyLabel = qty === 1 ? '1 kit' : `${qty} kits`;
    } else {
      qtyLabel = `${qty} pcs`;
    }

    const total = CartManager.formatPrice(product.price * qty);
    const msg = [
      'Hello Fish Tales!',
      '',
      'I would like to place an order:',
      '',
      `1. ${product.name} – ${qtyLabel} – ${total}`,
      '',
      `Subtotal: ${total}`,
      '',
      'Please confirm availability and delivery details.'
    ].join('\n');

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  /* ── 7. Cart Drawer Controller ───────────────────────────── */
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
          <h4 style="color:var(--text-main); margin-bottom:0.5rem; font-family:var(--font-serif); font-size:1.25rem;">Your Cart is Empty</h4>
          <p style="font-size:0.88rem; line-height:1.6; margin-bottom:1.5rem; color:var(--text-muted);">Explore our curated selection of show guppy pairs, rare isopods, tarantulas, and complete combo kits.</p>
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
            ${item.size ? `<span class="cart-item-meta" style="color:var(--color-amber);">Size: ${item.size}</span>` : ''}
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
        <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.95rem;">
          Type to search our live stock of 32 exotic species, guppies, isopods &amp; combo kits.
        </div>
      `;
      return;
    }

    const matches = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.scientificName && p.scientificName.toLowerCase().includes(q)) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      resultsWrap.innerHTML = `
        <div style="padding: 2.5rem 1rem; text-align: center; color: var(--text-muted);">
          No matching species or kits found for "<strong>${query}</strong>".
        </div>
      `;
      return;
    }

    resultsWrap.innerHTML = matches.map(p => {
      const unitLabel = p.pricingUnit === 'pair' ? 'per pair' : (p.pricingUnit === 'kit' ? 'kit' : 'per piece');
      return `
        <div class="search-result-row" onclick="closeSearchOverlay(); openProductModal('${p.id}')">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <span style="font-size:1.5rem;">${p.emoji}</span>
            <div>
              <div style="color:var(--text-main); font-weight:600; font-size:0.95rem;">${p.name}</div>
              <div style="color:var(--text-muted); font-size:0.8rem;">${p.categoryLabel} ${p.scientificName ? '• ' + p.scientificName : ''}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="color:var(--color-accent); font-weight:700;">${CartManager.formatPrice(p.price)}</div>
            <div style="color:var(--text-muted); font-size:0.75rem;">${unitLabel}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ── 9. Smooth Scroll & Navigation Helpers ───────────────── */
  window.scrollToSection = function (elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const headerHeight = 74;
    const pos = el.getBoundingClientRect().top + window.pageYOffset - headerHeight;
    window.scrollTo({
      top: pos,
      behavior: 'smooth'
    });
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

    // 5. Category tabs click listeners
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
