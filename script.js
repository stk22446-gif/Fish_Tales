/**
 * FISH TALES — Master JavaScript Engine
 * Production Ready | Vanilla JS (ES6+) | LocalStorage Persistence
 * WhatsApp Checkout Integration (+91 96542 97430)
 *
 * 4 Main Product Categories:
 * 1. Aquarium & Fish (14 items: 13 Guppy varieties + 1 Betta Fish)
 * 2. Isopods (7 varieties)
 * 3. Tarantulas (6 varieties with verified sizes)
 * 4. Combo Packs (3 confirmed kits & promotional bundles)
 * Total: 30 Verified Products
 */

(function () {
  'use strict';

  /* ── 1. Configuration & Constants ─────────────────────────── */
  const WHATSAPP_NUMBER = '919654297430';
  const STORAGE_KEY = 'fishtales_cart';

  /* ── 2. Vector Illustration Suite (Individual Product Art) ── */
  const ICONS = {
    // Guppy Generator
    guppy(id, name, colors) {
      const { body, finStart, finEnd, dumbo, extra, dorsal } = colors;
      return `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg_${id}" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stop-color="#12241A"/>
            <stop offset="70%" stop-color="#08140D"/>
            <stop offset="100%" stop-color="#050B08"/>
          </radialGradient>
          <linearGradient id="fin_${id}" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stop-color="${finStart}"/>
            <stop offset="100%" stop-color="${finEnd}"/>
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#bg_${id})"/>
        <!-- Background Aquatic Flora -->
        <path d="M-20 60 Q 100 30, 220 50 T 420 40" stroke="#B8E64A" stroke-width="1.2" opacity="0.15" fill="none"/>
        <path d="M50 300 Q 60 190, 90 140 Q 65 210, 75 300" fill="#1A3D2A" opacity="0.5"/>
        <path d="M335 300 Q 315 185, 295 130 Q 325 210, 345 300" fill="#22563A" opacity="0.5"/>
        <g transform="translate(180, 130)">
          <!-- Large Caudal Fin -->
          <path d="M-15 8 C -85 -60, -120 20, -25 18 C -100 65, -75 105, -12 28 Z" fill="url(#fin_${id})" opacity="0.95"/>
          ${extra || ''}
          <!-- Dorsal Fin -->
          <path d="M-2 -8 C ${dorsal || '15 -55, -25 -45, -18 -10'} Z" fill="url(#fin_${id})" opacity="0.9"/>
          <!-- Pectoral / Dumbo Ear -->
          <ellipse cx="14" cy="12" rx="14" ry="9" fill="${dumbo || '#B8E64A'}" opacity="0.85" transform="rotate(-15 14 12)"/>
          <!-- Body -->
          <ellipse cx="12" cy="10" rx="38" ry="14" fill="${body}"/>
          <!-- Eye -->
          <circle cx="38" cy="7" r="3" fill="#050B08"/>
          <circle cx="39" cy="6" r="1" fill="#FFF"/>
        </g>
        <circle cx="160" cy="210" r="3" fill="#B8E64A" opacity="0.3"/>
        <circle cx="280" cy="80" r="2.5" fill="#B8E64A" opacity="0.25"/>
        <text x="20" y="280" fill="#A6B2A8" font-size="10" font-weight="600" font-family="Inter, sans-serif" letter-spacing="1">${name.toUpperCase()}</text>
      </svg>`;
    },

    // Isopod Generator
    isopod(id, name, colors) {
      const { shell, spots, accent, texture } = colors;
      return `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg_${id}" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stop-color="#19281C"/>
            <stop offset="70%" stop-color="#0A140F"/>
            <stop offset="100%" stop-color="#050B08"/>
          </radialGradient>
        </defs>
        <rect width="400" height="300" fill="url(#bg_${id})"/>
        <ellipse cx="200" cy="245" rx="130" ry="24" fill="#0D1711" opacity="0.8"/>
        <!-- Segmented Shell -->
        <g transform="translate(200, 140)">
          <ellipse cx="0" cy="0" rx="54" ry="76" fill="${shell}"/>
          <!-- Dorsal Segment Lines -->
          <path d="M -42 -38 Q 0 -48 42 -38" stroke="${accent || '#B8E64A'}" stroke-width="2.5" fill="none"/>
          <path d="M -50 -18 Q 0 -28 50 -18" stroke="${accent || '#B8E64A'}" stroke-width="2.5" fill="none"/>
          <path d="M -54 2 Q 0 -8 54 2" stroke="${accent || '#B8E64A'}" stroke-width="2.5" fill="none"/>
          <path d="M -52 22 Q 0 12 52 22" stroke="${accent || '#B8E64A'}" stroke-width="2.5" fill="none"/>
          <path d="M -44 42 Q 0 32 44 42" stroke="${accent || '#B8E64A'}" stroke-width="2.5" fill="none"/>
          <path d="M -30 62 Q 0 52 30 62" stroke="${accent || '#B8E64A'}" stroke-width="2" fill="none"/>
          ${spots || ''}
          ${texture || ''}
          <!-- Eyes -->
          <circle cx="-14" cy="-66" r="3.5" fill="#D4A94D"/>
          <circle cx="14" cy="-66" r="3.5" fill="#D4A94D"/>
          <!-- Antennae -->
          <path d="M -14 -70 Q -35 -92 -48 -88" stroke="#D4A94D" stroke-width="2" fill="none"/>
          <path d="M 14 -70 Q 35 -92 48 -88" stroke="#D4A94D" stroke-width="2" fill="none"/>
        </g>
        <text x="20" y="280" fill="#A6B2A8" font-size="10" font-weight="600" font-family="Inter, sans-serif" letter-spacing="1">${name.toUpperCase()}</text>
      </svg>`;
    },

    // Tarantula Generator
    tarantula(id, name, colors) {
      const { body, leg, knee, carapace, abdomen } = colors;
      return `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg_${id}" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stop-color="#241B18"/>
            <stop offset="70%" stop-color="#0E0908"/>
            <stop offset="100%" stop-color="#050B08"/>
          </radialGradient>
        </defs>
        <rect width="400" height="300" fill="url(#bg_${id})"/>
        <ellipse cx="200" cy="240" rx="130" ry="22" fill="#000" opacity="0.6"/>
        <g transform="translate(200, 140)">
          <!-- Legs (left) -->
          <path d="M -15 -10 Q -60 -50 -100 -20" stroke="${leg}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
          <path d="M -20 0 Q -80 -25 -110 5" stroke="${leg}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
          <path d="M -20 12 Q -80 25 -105 45" stroke="${leg}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
          <path d="M -15 25 Q -65 65 -90 85" stroke="${leg}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
          <!-- Knee highlights (left) -->
          <circle cx="-55" cy="-28" r="4.5" fill="${knee}"/>
          <circle cx="-65" cy="-8" r="4.5" fill="${knee}"/>
          <circle cx="-62" cy="18" r="4.5" fill="${knee}"/>
          <circle cx="-50" cy="48" r="4.5" fill="${knee}"/>
          <!-- Legs (right) -->
          <path d="M 15 -10 Q 60 -50 100 -20" stroke="${leg}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
          <path d="M 20 0 Q 80 -25 110 5" stroke="${leg}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
          <path d="M 20 12 Q 80 25 105 45" stroke="${leg}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
          <path d="M 15 25 Q 65 65 90 85" stroke="${leg}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
          <!-- Knee highlights (right) -->
          <circle cx="55" cy="-28" r="4.5" fill="${knee}"/>
          <circle cx="65" cy="-8" r="4.5" fill="${knee}"/>
          <circle cx="62" cy="18" r="4.5" fill="${knee}"/>
          <circle cx="50" cy="48" r="4.5" fill="${knee}"/>
          <!-- Abdomen -->
          <ellipse cx="0" cy="28" rx="27" ry="35" fill="${abdomen || '#2E1B15'}" stroke="${knee}" stroke-width="1.5"/>
          <!-- Carapace -->
          <circle cx="0" cy="-8" r="22" fill="${carapace || '#3D291F'}" stroke="${knee}" stroke-width="2"/>
          <!-- Fangs -->
          <path d="M -5 -28 L -3 -36 L -1 -29" stroke="${knee}" stroke-width="2.2" fill="none"/>
          <path d="M 5 -28 L 3 -36 L 1 -29" stroke="${knee}" stroke-width="2.2" fill="none"/>
        </g>
        <text x="20" y="280" fill="#A6B2A8" font-size="10" font-weight="600" font-family="Inter, sans-serif" letter-spacing="1">${name.toUpperCase()}</text>
      </svg>`;
    },

    // Betta Fish Art
    betta: `<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bettaGrad" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#1A281E"/>
          <stop offset="70%" stop-color="#0A140F"/>
          <stop offset="100%" stop-color="#050B08"/>
        </radialGradient>
        <linearGradient id="bettaFinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E06C75"/>
          <stop offset="50%" stop-color="#D4A94D"/>
          <stop offset="100%" stop-color="#B8E64A"/>
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#bettaGrad)"/>
      <g transform="translate(190, 140)">
        <path d="M-20 0 C -95 -85, -125 15, -55 0 C -125 35, -95 95, -20 10 Z" fill="url(#bettaFinGrad)" opacity="0.95"/>
        <path d="M-10 -15 C 20 -70, -30 -60, -20 -10 Z" fill="url(#bettaFinGrad)" opacity="0.85"/>
        <path d="M-5 15 C 10 65, -15 60, -10 15 Z" fill="url(#bettaFinGrad)" opacity="0.85"/>
        <ellipse cx="15" cy="0" rx="38" ry="15" fill="#D4A94D"/>
        <path d="M8 5 C 15 25, 25 20, 18 5 Z" fill="#B8E64A" opacity="0.8"/>
        <circle cx="42" cy="-4" r="3" fill="#050B08"/>
        <circle cx="43" cy="-5" r="1" fill="#FFF"/>
      </g>
      <circle cx="280" cy="80" r="3" fill="#B8E64A" opacity="0.4"/>
      <circle cx="120" cy="220" r="2.5" fill="#B8E64A" opacity="0.3"/>
      <text x="20" y="280" fill="#A6B2A8" font-size="10" font-weight="600" font-family="Inter, sans-serif" letter-spacing="1">SHOW GRADE BETTA</text>
    </svg>`,

    // Combo Packs Art
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
      <text x="20" y="280" fill="#A6B2A8" font-size="10" font-weight="600" font-family="Inter, sans-serif" letter-spacing="1">ISOPOD HOUSE KIT</text>
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
        <g transform="translate(30, 0)">
          <path d="M -15 0 C -40 -30, -50 15, -20 5 Z" fill="#D4A94D" opacity="0.9"/>
          <ellipse cx="0" cy="0" rx="18" ry="8" fill="#F5F7F2"/>
          <circle cx="12" cy="-2" r="1.5" fill="#050B08"/>
        </g>
      </g>
      <text x="20" y="280" fill="#A6B2A8" font-size="10" font-weight="600" font-family="Inter, sans-serif" letter-spacing="1">HALF CUBE AQUARIUM</text>
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
      <text x="20" y="280" fill="#A6B2A8" font-size="10" font-weight="600" font-family="Inter, sans-serif" letter-spacing="1">GLACIER COLONY PACK</text>
    </svg>`
  };

  /* Helper to fetch correct SVG for any product */
  function getProductSVG(product) {
    if (product.id === 'show-grade-betta') return ICONS.betta;
    if (product.id === 'isopod-house-kit') return ICONS.isopodKit;
    if (product.id === 'half-cube-aquarium-kit') return ICONS.aquariumKit;
    if (product.id === 'glacier-colony-pack') return ICONS.glacierOffer;

    if (product.category === 'aquarium' && product.customColors) {
      return ICONS.guppy(product.id, product.name, product.customColors);
    }
    if (product.category === 'isopods' && product.customColors) {
      return ICONS.isopod(product.id, product.name, product.customColors);
    }
    if (product.category === 'tarantulas' && product.customColors) {
      return ICONS.tarantula(product.id, product.name, product.customColors);
    }

    return ICONS.betta;
  }

  /* ── 3. Master Product Catalogue (Exactly 30 Verified Items) ─ */
  const PRODUCTS = [
    // ══════════════════════════════════════════════════════════════
    // CATEGORY 1: AQUARIUM & FISH (14 Products: 13 Guppies + Betta)
    // ══════════════════════════════════════════════════════════════
    {
      id: 'guppy-red-lace',
      image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=600&q=80',
      name: 'Red Lace Guppy',
      scientificName: 'Poecilia reticulata var. Red Lace',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 250,
      pricingUnit: 'pair',
      size: 'Adult Pair (1 Male + 1 Female)',
      description: 'Intricate red lace-patterned caudal fin with iridescent body tones. Captive bred and peaceful in planted community tanks.',
      notice: 'Transit feasibility and delivery schedule confirmed on WhatsApp prior to order acceptance. Cash on Delivery is strictly unavailable.',
      emoji: '🐟',
      featured: true,
      customColors: {
        body: '#D4A94D',
        finStart: '#DC2626',
        finEnd: '#F87171',
        dumbo: '#F59E0B',
        extra: '<path d="M-15 8 Q -60 10 -85 -20" stroke="#FEE2E2" stroke-width="1.5" stroke-dasharray="2 2" fill="none"/>'
      }
    },
    {
      id: 'guppy-gold-dumbo-ear',
      image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80',
      name: 'Gold Dumbo Ear Guppy',
      scientificName: 'Poecilia reticulata var. Gold Dumbo Ear',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 280,
      pricingUnit: 'pair',
      size: 'Adult Pair',
      description: 'Lustrous golden body with enlarged, prominent "dumbo ear" pectoral fins creating a graceful flutter in planted tanks.',
      notice: 'Transit feasibility and delivery schedule confirmed on WhatsApp prior to order acceptance. Cash on Delivery is strictly unavailable.',
      emoji: '🐟',
      featured: false,
      customColors: {
        body: '#F59E0B',
        finStart: '#FBBF24',
        finEnd: '#FDE68A',
        dumbo: '#FCD34D'
      }
    },
    {
      id: 'guppy-santacruz-dumbo-ear',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
      name: 'Santacruz Dumbo Ear Guppy',
      scientificName: 'Poecilia reticulata var. Santacruz Dumbo',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 250,
      pricingUnit: 'pair',
      size: 'Adult Pair',
      description: 'Striking Santacruz lineage showcasing oversized dumbo ears, iridescent cobalt-blue coloration, and active schooling behavior.',
      notice: 'Transit feasibility and delivery schedule confirmed on WhatsApp prior to order acceptance. Cash on Delivery is strictly unavailable.',
      emoji: '🐟',
      featured: false,
      customColors: {
        body: '#2563EB',
        finStart: '#60A5FA',
        finEnd: '#93C5FD',
        dumbo: '#C084FC'
      }
    },
    {
      id: 'guppy-platinum-dumbo-halfmoon',
      image: 'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=600&q=80',
      name: 'Platinum Dumbo Ear Halfmoon Guppy',
      scientificName: 'Poecilia reticulata var. Platinum Dumbo Halfmoon',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 280,
      pricingUnit: 'pair',
      size: 'Adult Pair',
      description: 'Full 180-degree halfmoon caudal fin with gleaming platinum-white scales and grand dumbo pectoral ears.',
      notice: 'Transit feasibility and delivery schedule confirmed on WhatsApp prior to order acceptance. Cash on Delivery is strictly unavailable.',
      emoji: '🐟',
      featured: true,
      customColors: {
        body: '#E2E8F0',
        finStart: '#F8FAFC',
        finEnd: '#CBD5E1',
        dumbo: '#FFFFFF',
        dorsal: '25 -65, -35 -55, -20 -10'
      }
    },
    {
      id: 'guppy-blue-dragon-dumbo-halfmoon',
      image: 'https://images.unsplash.com/photo-1576806021992-d41a877d9c66?auto=format&fit=crop&w=600&q=80',
      name: 'Blue Dragon Dumbo Ear Halfmoon Guppy',
      scientificName: 'Poecilia reticulata var. Blue Dragon Dumbo',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 280,
      pricingUnit: 'pair',
      size: 'Adult Pair',
      description: 'Rich royal blue metallic dorsal and halfmoon tail paired with grand dumbo ear fins. Centerpiece display fish.',
      notice: 'Transit feasibility and delivery schedule confirmed on WhatsApp prior to order acceptance. Cash on Delivery is strictly unavailable.',
      emoji: '🐟',
      featured: true,
      customColors: {
        body: '#1E3A8A',
        finStart: '#2563EB',
        finEnd: '#06B6D4',
        dumbo: '#38BDF8',
        dorsal: '22 -62, -30 -50, -18 -10'
      }
    },
    {
      id: 'guppy-moscow-black-dumbo',
      image: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=600&q=80',
      name: 'Moscow Black Dumbo Ear Guppy',
      scientificName: 'Poecilia reticulata var. Moscow Black Dumbo',
      category: 'aquarium',
      categoryLabel: 'Aquarium & Fish',
      price: 250,
      pricingUnit: 'pair',
      size: 'Adult Pair',
      description: 'Deep velvet-black coloration spanning from snout to tail, contrasted by delicate fluttery dumbo pectoral fins.',
      notice: 'Transit feasibility and delivery schedule confirmed on WhatsApp prior to order acceptance. Cash on Delivery is strictly unavailable.',
      emoji: '🐟',
      featured: false,
      customColors: {
        body: '#0F172A',
        finStart: '#1E1B4B',
        finEnd: '#312E81',
        dumbo: '#4C1D95'
      }
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
      notice: 'Transit feasibility and delivery schedule confirmed on WhatsApp prior to order acceptance. Cash on Delivery is strictly unavailable.',
      emoji: '🐟',
      featured: true,
      customColors: {
        body: '#DC2626',
        finStart: '#EF4444',
        finEnd: '#F87171',
        dumbo: '#F87171',
        dorsal: '35 -75, -45 -65, -25 -10'
      }
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
      notice: 'Transit feasibility and delivery schedule confirmed on WhatsApp prior to order acceptance. Cash on Delivery is strictly unavailable.',
      emoji: '🐟',
      featured: false,
      customColors: {
        body: '#18181B',
        finStart: '#581C87',
        finEnd: '#7C3AED',
        dumbo: '#A855F7'
      }
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
      description: 'Classic red and platinum koi-styled color patterns with translucent big dumbo ears. Active and hardy.',
      notice: 'Transit feasibility and delivery schedule confirmed on WhatsApp prior to order acceptance. Cash on Delivery is strictly unavailable.',
      emoji: '🐟',
      featured: false,
      customColors: {
        body: '#F1F5F9',
        finStart: '#EA580C',
        finEnd: '#FB923C',
        dumbo: '#F8FAFC',
        extra: '<circle cx="35" cy="5" r="7" fill="#DC2626"/>'
      }
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
      notice: 'Transit feasibility and delivery schedule confirmed on WhatsApp prior to order acceptance. Cash on Delivery is strictly unavailable.',
      emoji: '🐟',
      featured: false,
      customColors: {
        body: '#BE185D',
        finStart: '#E11D48',
        finEnd: '#F43F5E',
        dumbo: '#FB7185',
        extra: '<path d="M5 0 L5 20 M15 -2 L15 22 M25 0 L25 20" stroke="#000" stroke-width="2"/>'
      }
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
      notice: 'Transit feasibility and delivery schedule confirmed on WhatsApp prior to order acceptance. Cash on Delivery is strictly unavailable.',
      emoji: '🐟',
      featured: false,
      customColors: {
        body: '#0F172A',
        finStart: '#F8FAFC',
        finEnd: '#E2E8F0',
        dumbo: '#FFFFFF'
      }
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
      notice: 'Transit feasibility and delivery schedule confirmed on WhatsApp prior to order acceptance. Cash on Delivery is strictly unavailable.',
      emoji: '🐟',
      featured: false,
      customColors: {
        body: '#94A3B8',
        finStart: '#EA580C',
        finEnd: '#DC2626',
        dumbo: '#CBD5E1'
      }
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
      description: 'Deep emerald-green metallic sheen covering head to tail. An all-time legendary strain for planted aquariums.',
      notice: 'Transit feasibility and delivery schedule confirmed on WhatsApp prior to order acceptance. Cash on Delivery is strictly unavailable.',
      emoji: '🐟',
      featured: false,
      customColors: {
        body: '#064E3B',
        finStart: '#059669',
        finEnd: '#10B981',
        dumbo: '#34D399'
      }
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
      description: 'Hand-selected healthy Betta splendens featuring vibrant color iridescence and large flowing fins. Centerpiece display specimen.',
      notice: 'Transit feasibility and delivery schedule confirmed on WhatsApp prior to order acceptance. Cash on Delivery is strictly unavailable.',
      emoji: '🐟',
      featured: true
    },

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 2: ISOPODS (7 Pure Strains, Pricing Per Piece)
    // ══════════════════════════════════════════════════════════════
    {
      id: 'armadillidium-gestroi',
      image: 'https://images.unsplash.com/photo-1598880940080-ff9a29891b85?auto=format&fit=crop&w=600&q=80',
      name: 'Armadillidium Gestroi',
      scientificName: 'Armadillidium gestroi',
      category: 'isopods',
      categoryLabel: 'Isopods',
      price: 120,
      pricingUnit: 'piece',
      size: null,
      description: 'Striking Mediterranean pill bug known for its large size, bright yellow spotted dorsal plates, and vigorous vivarium janitorial skills.',
      notice: 'Packed in ventilated containers with moisture control. Transit feasibility confirmed on WhatsApp. Cash on Delivery is unavailable.',
      emoji: '🍂',
      featured: true,
      customColors: {
        shell: '#1E293B',
        accent: '#F59E0B',
        spots: '<circle cx="-18" cy="-25" r="4" fill="#FCD34D"/><circle cx="18" cy="-25" r="4" fill="#FCD34D"/><circle cx="-22" cy="0" r="4" fill="#FCD34D"/><circle cx="22" cy="0" r="4" fill="#FCD34D"/><circle cx="-16" cy="25" r="4" fill="#FCD34D"/><circle cx="16" cy="25" r="4" fill="#FCD34D"/>'
      }
    },
    {
      id: 'cubaris-murina-orange',
      image: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=600&q=80',
      name: 'Cubaris Murina Orange',
      scientificName: 'Cubaris murina "Orange"',
      category: 'isopods',
      categoryLabel: 'Isopods',
      price: 60,
      pricingUnit: 'piece',
      size: null,
      description: 'Warm apricot-orange color morph. Hardy, highly active, and quick to establish a thriving custodial colony in humid vivariums.',
      notice: 'Packed in ventilated containers with moisture control. Transit feasibility confirmed on WhatsApp. Cash on Delivery is unavailable.',
      emoji: '🪵',
      featured: false,
      customColors: {
        shell: '#EA580C',
        accent: '#FED7AA'
      }
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
      notice: 'Promotional offer: Buy 10, get 1 extra free! Transit feasibility confirmed on WhatsApp. Cash on Delivery is unavailable.',
      emoji: '❄️',
      featured: true,
      customColors: {
        shell: '#F8FAFC',
        accent: '#94A3B8'
      }
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
      notice: 'Packed in ventilated containers with moisture control. Transit feasibility confirmed on WhatsApp. Cash on Delivery is unavailable.',
      emoji: '🍁',
      featured: false,
      customColors: {
        shell: '#FB923C',
        accent: '#FED7AA',
        spots: '<path d="M-15 -10 Q -5 -25 15 -15 Q 10 5 -15 -10 Z" fill="#FFF" opacity="0.85"/><circle cx="12" cy="20" r="8" fill="#FFF" opacity="0.85"/>'
      }
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
      notice: 'Priority dispatch. Transit feasibility confirmed on WhatsApp prior to order acceptance. Cash on Delivery is unavailable.',
      emoji: '☕',
      featured: true,
      customColors: {
        shell: '#3E2723',
        accent: '#D7CCC8',
        texture: '<ellipse cx="0" cy="0" rx="14" ry="60" fill="#EFEBE9"/>'
      }
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
      notice: 'Priority dispatch. Transit feasibility confirmed on WhatsApp prior to order acceptance. Cash on Delivery is unavailable.',
      emoji: '🌸',
      featured: true,
      customColors: {
        shell: '#FCE7F3',
        accent: '#F472B6',
        texture: '<ellipse cx="0" cy="0" rx="20" ry="65" fill="#FBCFE8" opacity="0.7"/>'
      }
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
      notice: 'Packed in ventilated containers with moisture control. Transit feasibility confirmed on WhatsApp. Cash on Delivery is unavailable.',
      emoji: '🪨',
      featured: false,
      customColors: {
        shell: '#475569',
        accent: '#94A3B8',
        texture: '<circle cx="-12" cy="-10" r="2" fill="#CBD5E1"/><circle cx="12" cy="-10" r="2" fill="#CBD5E1"/><circle cx="0" cy="15" r="2.5" fill="#CBD5E1"/>'
      }
    },

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 3: TARANTULAS (6 Species, Exact Sizes & Prices)
    // ══════════════════════════════════════════════════════════════
    {
      id: 'chilean-rose-hair',
      image: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=600&q=80',
      name: 'Chilean Rose Hair',
      scientificName: 'Grammostola rosea',
      category: 'tarantulas',
      categoryLabel: 'Tarantulas',
      price: 2199,
      pricingUnit: 'piece',
      size: '1–1.5 cm',
      description: 'Renowned for its calm, docile temperament and subtle pink carapace setae. The quintessential beginner New World tarantula.',
      notice: 'Captive-bred spiderling (1–1.5 cm). Packed in insulated, shock-absorbing vial. Cash on Delivery is unavailable.',
      emoji: '🕷️',
      featured: true,
      customColors: {
        body: '#3E2723',
        leg: '#5D4037',
        knee: '#F472B6',
        carapace: '#831843',
        abdomen: '#4A0E2E'
      }
    },
    {
      id: 'brazilian-whiteknee',
      image: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=600&q=80',
      name: 'Brazilian Whiteknee',
      scientificName: 'Acanthoscurria geniculata',
      category: 'tarantulas',
      categoryLabel: 'Tarantulas',
      price: 2199,
      pricingUnit: 'piece',
      size: '1–1.5 cm',
      description: 'Bold contrast of jet-black legs adorned with striking snow-white knee bands. Highly active with an enthusiastic feeding response.',
      notice: 'Captive-bred spiderling (1–1.5 cm). Transit feasibility confirmed on WhatsApp. Cash on Delivery is unavailable.',
      emoji: '🕷️',
      featured: true,
      customColors: {
        body: '#0F172A',
        leg: '#1E293B',
        knee: '#FFFFFF',
        carapace: '#334155',
        abdomen: '#0F172A'
      }
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
      notice: 'Captive-bred spiderling (1–1.5 cm). Transit feasibility confirmed on WhatsApp. Cash on Delivery is unavailable.',
      emoji: '🕷️',
      featured: true,
      customColors: {
        body: '#18181B',
        leg: '#27272A',
        knee: '#EA580C',
        carapace: '#451A03',
        abdomen: '#18181B'
      }
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
      notice: 'Captive-bred spiderling (1–1.5 cm). Transit feasibility confirmed on WhatsApp. Cash on Delivery is unavailable.',
      emoji: '🕷️',
      featured: true,
      customColors: {
        body: '#047857',
        leg: '#2563EB',
        knee: '#38BDF8',
        carapace: '#059669',
        abdomen: '#C2410C'
      }
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
      notice: 'Captive-bred spiderling (1–1.5 cm). Transit feasibility confirmed on WhatsApp. Cash on Delivery is unavailable.',
      emoji: '🕷️',
      featured: false,
      customColors: {
        body: '#292524',
        leg: '#44403C',
        knee: '#EAB308',
        carapace: '#78350F',
        abdomen: '#292524'
      }
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
      description: 'One of the largest tarantula species in the world. Fast-growing established spiderling with salmon-pink hairs.',
      notice: 'Established juvenile (1 inch). Padded ventilation capsule. Cash on Delivery is unavailable.',
      emoji: '🕷️',
      featured: true,
      customColors: {
        body: '#1C1917',
        leg: '#292524',
        knee: '#FB7185',
        carapace: '#44403C',
        abdomen: '#2E1065'
      }
    },

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 4: COMBO PACKS (3 Confirmed Bundles & Kits)
    // ══════════════════════════════════════════════════════════════
    {
      id: 'isopod-house-kit',
      image: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=600&q=80',
      name: 'Isopod House Kit',
      scientificName: 'Complete Bioactive Isopod Habitat',
      category: 'combos',
      secondaryCategory: 'isopods',
      categoryLabel: 'Combo Packs',
      price: 1545,
      pricingUnit: 'kit',
      size: '5" L × 5" D × 5" H (+ 2.5" roof)',
      description: 'Complete glass bioactive habitat setup. Includes glass isopod house, live plants, substrate blend, lotus pod hide, food, and a starter culture of 6 Cubaris Glacier isopods.',
      kitIncludes: [
        'Glass Isopod House (5" L × 5" D × 5" H + 2.5" roof height)',
        'Fittonia albivenis (Patterned nerve plant)',
        'Hemigraphis sp. Pink (Purple waffle plant)',
        'Sheet Moss layer',
        'Bioactive Isopod Substrate Blend',
        'Lotus Pod (natural hide for isopods)',
        'Premium Isopod Food',
        'Isopod Culture: 6 Cubaris sp. "Glacier"'
      ],
      notice: 'Glass habitat and live culture packed with high-grade shock-absorbent cushioning. Cash on Delivery is unavailable.',
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
      description: 'Desktop planted aquarium kit. Includes Half Cube aquarium, 1 healthy Betta fish, live aquatic plants, and premium sand substrate.',
      kitIncludes: [
        'Half Cube Aquarium',
        '1 beautiful Betta Fish',
        'Live aquatic plants',
        'Premium sand substrate'
      ],
      notice: 'Live Betta fish and aquatic plants packed in oxygenated bags with shock insulation. Cash on Delivery is unavailable.',
      emoji: '🫧',
      featured: true
    },
    {
      id: 'glacier-colony-pack',
      name: 'Glacier Isopods (Buy 10, Get 1 Free)',
      scientificName: 'Cubaris murina "Glacier" 10+1 Special',
      category: 'combos',
      secondaryCategory: 'isopods',
      categoryLabel: 'Combo Packs',
      price: 700,
      pricingUnit: 'kit',
      size: '11 specimens total',
      description: 'Promotional colony pack: Purchase 10 Cubaris Murina Glacier isopods and receive 1 bonus isopod free of charge (11 specimens total).',
      kitIncludes: [
        '10 Cubaris Murina Glacier Isopods',
        '1 Bonus Isopod (11 specimens total)',
        'Ventilated transport culture cup',
        'Starter food blend'
      ],
      notice: 'Promotional bundle. Transit feasibility confirmed on WhatsApp prior to dispatch. Cash on Delivery is unavailable.',
      emoji: '❄️',
      featured: true
    }
  ];

  /* ── 4. Cart State Management (localStorage) ────────────── */
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
      lines.push('Please confirm availability, delivery details and UPI payment info (Cash on Delivery is unavailable).');

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

  /* ── 5. Toast Notification Controller ────────────────────── */
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

  /* ── 6. Product Filtering, Search & Catalogue Rendering ──── */
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
      countEl.innerHTML = `Showing <strong>${list.length}</strong> product${list.length !== 1 ? 's' : ''}`;
    }

    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3 style="color: var(--text-main); font-family: var(--font-serif); font-size: 1.4rem; margin-bottom: 0.5rem;">No Products Found</h3>
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
      const svgGraphic = getProductSVG(product);

      return `
        <article class="product-card" data-id="${product.id}">
          <div class="product-card-thumb" onclick="openProductModal('${product.id}')" title="View ${product.name} details">
            <img src="${product.image}" alt="${product.name}" class="product-card-img" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div class="product-fallback-svg" style="display:none; width:100%; height:100%;">${svgGraphic}</div>
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

  /* ── 7. Product Detail Modal ─────────────────────────────── */
  window.openProductModal = function (productId) {
    const product = PRODUCTS.find(p => String(p.id) === String(productId));
    if (!product) return;

    const modalBackdrop = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    if (!modalBackdrop || !modalContent) return;

    const unitLabel = product.pricingUnit === 'pair' ? 'Per Pair' : (product.pricingUnit === 'kit' ? 'Complete Kit' : 'Per Piece');
    const svgGraphic = getProductSVG(product);

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
        <div class="modal-media-col">
          <img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
          <div style="display:none; width:100%; height:100%;">${svgGraphic}</div>
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
            <strong style="color:var(--color-amber); display:block; margin-bottom:0.2rem;">📦 Delivery &amp; Payment Notice:</strong>
            ${product.notice || 'Transit feasibility confirmed on WhatsApp before dispatch. Cash on Delivery is strictly unavailable.'}
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
      'Please confirm availability, delivery details and UPI payment info (Cash on Delivery is unavailable).'
    ].join('\n');

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  /* ── 8. Cart Drawer Controller ───────────────────────────── */
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
          <p style="font-size:0.88rem; line-height:1.6; margin-bottom:1.5rem; color:var(--text-muted);">Explore our curated selection of show guppy pairs, Betta fish, rare isopods, tarantulas, and combo kits.</p>
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
      const productObj = PRODUCTS.find(p => String(p.id) === String(item.id)) || item;
      const svgThumb = getProductSVG(productObj);

      return `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-thumb">
            <img src="${productObj.image || ''}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="display:none; width:100%; height:100%;">${svgThumb}</div>
          </div>
          <div class="cart-item-info">
            <span class="cart-item-title">${item.name}</span>
            <span class="cart-item-meta">${CartManager.formatPrice(item.price)} ${unitLabel}</span>
            ${item.size ? `<span class="cart-item-meta" style="color:var(--color-amber);">Size: ${item.size}</span>` : ''}
            <div class="cart-item-stepper">
              <button class="cart-step-btn" onclick="CartManager.update('${item.id}', ${item.quantity - 1})" aria-label="Decrease quantity">−</button>
              <span class="cart-step-val">${item.quantity}</span>
              <button class="cart-step-btn" onclick="CartManager.update('${item.id}', ${item.quantity + 1})" aria-label="Increase quantity">+</button>
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

  /* ── 9. Live Search Overlay ──────────────────────────────── */
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
          Type species name, strain or combo kit to search our 30 verified products.
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
          No matching products found for "<strong>${query}</strong>".
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

  /* ── 10. Smooth Scroll & Navigation Helpers ──────────────── */
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

  /* ── 11. DOM Initialization ──────────────────────────────── */
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
