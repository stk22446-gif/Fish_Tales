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

  /* ── 2. Clean Neutral Placeholder (No Vector Animal Art) ────── */
  const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23F8F6E9'/%3E%3Crect x='130' y='80' width='140' height='100' rx='8' fill='%23FFFFFF' stroke='%23DCEBCB' stroke-width='2'/%3E%3Ccircle cx='165' cy='115' r='10' fill='%23DCEBCB'/%3E%3Cpath d='M135 165 l35 -25 l30 20 l35 -25 l25 20' stroke='%2375A65A' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ctext x='200' y='215' font-family='sans-serif' font-size='12' font-weight='600' fill='%23174B32' text-anchor='middle' letter-spacing='0.08em'%3EFISH TALES%3C/text%3E%3Ctext x='200' y='235' font-family='sans-serif' font-size='10' fill='%2375A65A' text-anchor='middle'%3EPhoto Reference%3C/text%3E%3C/svg%3E";

  // Selected variant state tracker: productId -> variantIndex
  const selectedVariants = {};

  const CATEGORY_NAMES = {
    all: 'All Products',
    aquarium: 'Aquarium & Fish',
    isopods: 'Isopods',
    tarantulas: 'Tarantulas',
    combos: 'Combo Packs'
  };

  function getProductPriceLabel(variant, category) {
    const u = (variant && variant.unit ? variant.unit.toLowerCase() : '');
    if (u.includes('pair')) return 'PRICE (PAIR):';
    if (u.includes('10 pcs') || u.includes('colony')) return 'PRICE (10 PCS):';
    if (u.includes('5 pcs') || u.includes('starter')) return 'PRICE (5 PCS):';
    if (u.includes('piece') || u.includes('pc')) return 'PRICE (PIECE):';
    if (u.includes('specimen')) return 'PRICE (SPECIMEN):';
    if (u.includes('kit') || category === 'combos') return 'PRICE (KIT):';
    return 'PRICE:';
  }

  function initProductVariantsAndSpecs(p) {
    if (!p) return;
    // Backward-compatibility aliases for legacy templates and test suites
    if (!p.categoryLabel) p.categoryLabel = p.categoryName || '';
    if (!p.scientificName) p.scientificName = p.subtitle || '';
    if (p.price === undefined && p.variants && p.variants.length > 0) {
      p.price = p.variants[0].price;
    }
    if (!p.pricingUnit && p.variants && p.variants.length > 0) {
      p.pricingUnit = (p.variants[0].label || 'item').toLowerCase();
    }
    if (p.specs && p.specs.size && !p.size) {
      p.size = p.specs.size;
    }
    if (p.specs && p.specs.kitIncludes && !p.kitIncludes) {
      p.kitIncludes = p.specs.kitIncludes;
    }
    if (p.variants) {
      p.variants.forEach(v => {
        if (!v.unit) v.unit = (v.label || 'item').toLowerCase();
      });
    }
  }

  function getProductSelectedVariant(product) {
    initProductVariantsAndSpecs(product);
    const idx = selectedVariants[product.id] || 0;
    return product.variants[idx] || product.variants[0];
  }

  /* ── 3. Master Product Catalogue (Exactly 30 Verified Items) ─ */
  const PRODUCTS = [
    // AQUARIUM & FISH
    {
      id: "guppy-red-lace",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      name: "Red Lace Guppy",
      subtitle: "Poecilia reticulata var. Red Lace",
      image: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Cobra_Guppy_%28Poecilia_reticulata%29.JPG",
      images: [],
      video: "",
      description: "Intricate red lace-patterned caudal fin with iridescent body tones. Captive bred and peaceful in planted community tanks.",
      specs: {
        "care": "Beginner / Community",
        "temp": "22°C – 28°C",
        "diet": "Micro-pellets & live/frozen daphnia",
        "habitat": "Planted freshwater aquarium",
        "size": "Adult Pair (1 Male + 1 Female)"
      },
      variants: [
        {
                "name": "1 Pair (Adult Pair)",
                "price": 250,
                "label": "Pair"
        },
        {
                "name": "2 Pairs (Colony Pack)",
                "price": 500,
                "label": "2 Pairs"
        }
      ],
      featured: true
    },
    {
      id: "guppy-gold-dumbo-ear",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      name: "Gold Dumbo Ear Guppy",
      subtitle: "Poecilia reticulata var. Gold Dumbo Ear",
      image: "https://upload.wikimedia.org/wikipedia/commons/7/78/Poecilia_retic_090519-8688_kdBdk.jpg",
      images: [],
      video: "",
      description: "Lustrous golden body with enlarged, prominent \"dumbo ear\" pectoral fins creating a graceful flutter in planted tanks.",
      specs: {
        "care": "Beginner / Community",
        "temp": "22°C – 28°C",
        "diet": "Micro-pellets & live/frozen daphnia",
        "habitat": "Planted freshwater aquarium",
        "size": "Adult Pair"
      },
      variants: [
        {
                "name": "1 Pair (Adult Pair)",
                "price": 280,
                "label": "Pair"
        },
        {
                "name": "2 Pairs (Colony Pack)",
                "price": 560,
                "label": "2 Pairs"
        }
      ],
      featured: false
    },
    {
      id: "guppy-santacruz-dumbo-ear",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      name: "Santacruz Dumbo Ear Guppy",
      subtitle: "Poecilia reticulata var. Santacruz Dumbo",
      image: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Poecilia_reticulata_%28male%29.JPG",
      images: [],
      video: "",
      description: "Striking Santacruz lineage showcasing oversized dumbo ears, iridescent cobalt-blue coloration, and active schooling behavior.",
      specs: {
        "care": "Beginner / Community",
        "temp": "22°C – 28°C",
        "diet": "Micro-pellets & live/frozen daphnia",
        "habitat": "Planted freshwater aquarium",
        "size": "Adult Pair"
      },
      variants: [
        {
                "name": "1 Pair (Adult Pair)",
                "price": 250,
                "label": "Pair"
        },
        {
                "name": "2 Pairs (Colony Pack)",
                "price": 500,
                "label": "2 Pairs"
        }
      ],
      featured: false
    },
    {
      id: "guppy-platinum-dumbo-halfmoon",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      name: "Platinum Dumbo Ear Halfmoon Guppy",
      subtitle: "Poecilia reticulata var. Platinum Dumbo Halfmoon",
      image: "https://upload.wikimedia.org/wikipedia/commons/a/af/Poecilia_reticulata_01.jpg",
      images: [],
      video: "",
      description: "Full 180-degree halfmoon caudal fin with gleaming platinum-white scales and grand dumbo pectoral ears.",
      specs: {
        "care": "Beginner / Community",
        "temp": "22°C – 28°C",
        "diet": "Micro-pellets & live/frozen daphnia",
        "habitat": "Planted freshwater aquarium",
        "size": "Adult Pair"
      },
      variants: [
        {
                "name": "1 Pair (Adult Pair)",
                "price": 280,
                "label": "Pair"
        },
        {
                "name": "2 Pairs (Colony Pack)",
                "price": 560,
                "label": "2 Pairs"
        }
      ],
      featured: true
    },
    {
      id: "guppy-blue-dragon-dumbo-halfmoon",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      name: "Blue Dragon Dumbo Ear Halfmoon Guppy",
      subtitle: "Poecilia reticulata var. Blue Dragon Dumbo",
      image: "https://images.unsplash.com/photo-1520989244660-118e51ae94bc?auto=format&fit=crop&w=600&q=80",
      images: [],
      video: "",
      description: "Rich royal blue metallic dorsal and halfmoon tail paired with grand dumbo ear fins. Centerpiece display fish.",
      specs: {
        "care": "Beginner / Community",
        "temp": "22°C – 28°C",
        "diet": "Micro-pellets & live/frozen daphnia",
        "habitat": "Planted freshwater aquarium",
        "size": "Adult Pair"
      },
      variants: [
        {
                "name": "1 Pair (Adult Pair)",
                "price": 280,
                "label": "Pair"
        },
        {
                "name": "2 Pairs (Colony Pack)",
                "price": 560,
                "label": "2 Pairs"
        }
      ],
      featured: true
    },
    {
      id: "guppy-moscow-black-dumbo",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      name: "Moscow Black Dumbo Ear Guppy",
      subtitle: "Poecilia reticulata var. Moscow Black Dumbo",
      image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=600&q=80",
      images: [],
      video: "",
      description: "Deep velvet-black coloration spanning from snout to tail, contrasted by delicate fluttery dumbo pectoral fins.",
      specs: {
        "care": "Beginner / Community",
        "temp": "22°C – 28°C",
        "diet": "Micro-pellets & live/frozen daphnia",
        "habitat": "Planted freshwater aquarium",
        "size": "Adult Pair"
      },
      variants: [
        {
                "name": "1 Pair (Adult Pair)",
                "price": 250,
                "label": "Pair"
        },
        {
                "name": "2 Pairs (Colony Pack)",
                "price": 500,
                "label": "2 Pairs"
        }
      ],
      featured: false
    },
    {
      id: "guppy-afr-big-dorsal",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      name: "AFR Big Dorsal Guppy",
      subtitle: "Poecilia reticulata var. Albino Full Red Big Dorsal",
      image: "https://images.unsplash.com/photo-1548262323-694280fdc967?auto=format&fit=crop&w=600&q=80",
      images: [],
      video: "",
      description: "Prized Albino Full Red (AFR) genetics with an extravagant, sail-like big dorsal fin and ruby-red eyes.",
      specs: {
        "care": "Beginner / Community",
        "temp": "22°C – 28°C",
        "diet": "Micro-pellets & live/frozen daphnia",
        "habitat": "Planted freshwater aquarium",
        "size": "Adult Pair"
      },
      variants: [
        {
                "name": "1 Pair (Adult Pair)",
                "price": 300,
                "label": "Pair"
        },
        {
                "name": "2 Pairs (Colony Pack)",
                "price": 600,
                "label": "2 Pairs"
        }
      ],
      featured: true
    },
    {
      id: "guppy-dark-knight-dragon-dumbo",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      name: "Dark Knight Dragon Dumbo Ear Guppy",
      subtitle: "Poecilia reticulata var. Dark Knight Dragon",
      image: "https://images.unsplash.com/photo-1553986187-9cb16fa33483?auto=format&fit=crop&w=600&q=80",
      images: [],
      video: "",
      description: "Dark dramatic dragon scales with violet and navy undertones, complemented by fluttering dumbo ears.",
      specs: {
        "care": "Beginner / Community",
        "temp": "22°C – 28°C",
        "diet": "Micro-pellets & live/frozen daphnia",
        "habitat": "Planted freshwater aquarium",
        "size": "Adult Pair"
      },
      variants: [
        {
                "name": "1 Pair (Adult Pair)",
                "price": 280,
                "label": "Pair"
        },
        {
                "name": "2 Pairs (Colony Pack)",
                "price": 560,
                "label": "2 Pairs"
        }
      ],
      featured: false
    },
    {
      id: "guppy-red-platinum-koi-dumbo",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      name: "Red Platinum Koi Dumbo Ear Guppy",
      subtitle: "Poecilia reticulata var. Red Platinum Koi Dumbo",
      image: "https://images.unsplash.com/photo-1500909001949-1fc0780d81c9?auto=format&fit=crop&w=600&q=80",
      images: [],
      video: "",
      description: "Classic red and platinum koi-styled color patterns with translucent big dumbo ears. Active and hardy.",
      specs: {
        "care": "Beginner / Community",
        "temp": "22°C – 28°C",
        "diet": "Micro-pellets & live/frozen daphnia",
        "habitat": "Planted freshwater aquarium",
        "size": "Adult Pair"
      },
      variants: [
        {
                "name": "1 Pair (Adult Pair)",
                "price": 280,
                "label": "Pair"
        },
        {
                "name": "2 Pairs (Colony Pack)",
                "price": 560,
                "label": "2 Pairs"
        }
      ],
      featured: false
    },
    {
      id: "guppy-magenta-red-tiger",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      name: "Magenta Red Tiger Guppy",
      subtitle: "Poecilia reticulata var. Magenta Red Tiger",
      image: "https://images.unsplash.com/photo-1538719501547-bc023056a8b6?auto=format&fit=crop&w=600&q=80",
      images: [],
      video: "",
      description: "Bold tiger bar stripes over vibrant magenta-red body. Energetic swimmer that thrives in planted aquascapes.",
      specs: {
        "care": "Beginner / Community",
        "temp": "22°C – 28°C",
        "diet": "Micro-pellets & live/frozen daphnia",
        "habitat": "Planted freshwater aquarium",
        "size": "Adult Pair"
      },
      variants: [
        {
                "name": "1 Pair (Adult Pair)",
                "price": 250,
                "label": "Pair"
        },
        {
                "name": "2 Pairs (Colony Pack)",
                "price": 500,
                "label": "2 Pairs"
        }
      ],
      featured: false
    },
    {
      id: "guppy-white-tuxido",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      name: "White Tuxido Guppy",
      subtitle: "Poecilia reticulata var. White Tuxedo",
      image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80",
      images: [],
      video: "",
      description: "Crisp white caudal fin contrasted with a deep midnight tuxedo torso. Highly prolific and peaceful.",
      specs: {
        "care": "Beginner / Community",
        "temp": "22°C – 28°C",
        "diet": "Micro-pellets & live/frozen daphnia",
        "habitat": "Planted freshwater aquarium",
        "size": "Adult Pair"
      },
      variants: [
        {
                "name": "1 Pair (Adult Pair)",
                "price": 250,
                "label": "Pair"
        },
        {
                "name": "2 Pairs (Colony Pack)",
                "price": 500,
                "label": "2 Pairs"
        }
      ],
      featured: false
    },
    {
      id: "guppy-silverado-red-dragon",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      name: "Silverado Red Dragon Guppy",
      subtitle: "Poecilia reticulata var. Silverado Red Dragon",
      image: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Guppy_-_Poecilia_reticulata.jpg",
      images: [],
      video: "",
      description: "Silvery metallic chest transitioning into a fierce red dragon-patterned tail fin. Stunning light-reflective sheen.",
      specs: {
        "care": "Beginner / Community",
        "temp": "22°C – 28°C",
        "diet": "Micro-pellets & live/frozen daphnia",
        "habitat": "Planted freshwater aquarium",
        "size": "Adult Pair"
      },
      variants: [
        {
                "name": "1 Pair (Adult Pair)",
                "price": 280,
                "label": "Pair"
        },
        {
                "name": "2 Pairs (Colony Pack)",
                "price": 560,
                "label": "2 Pairs"
        }
      ],
      featured: false
    },
    {
      id: "guppy-green-moscow",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      name: "Green Moscow Guppy",
      subtitle: "Poecilia reticulata var. Green Moscow",
      image: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Poecilia_reticulata_-_Guppy%2C_male%2C_cobra-green_morph.jpg",
      images: [],
      video: "",
      description: "Deep emerald-green metallic sheen covering head to tail. An all-time legendary strain for planted aquariums.",
      specs: {
        "care": "Beginner / Community",
        "temp": "22°C – 28°C",
        "diet": "Micro-pellets & live/frozen daphnia",
        "habitat": "Planted freshwater aquarium",
        "size": "Adult Pair"
      },
      variants: [
        {
                "name": "1 Pair (Adult Pair)",
                "price": 250,
                "label": "Pair"
        },
        {
                "name": "2 Pairs (Colony Pack)",
                "price": 500,
                "label": "2 Pairs"
        }
      ],
      featured: false
    },
    {
      id: "show-grade-betta",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      name: "Show Grade Betta Fish",
      subtitle: "Betta splendens (Halfmoon / Plakat)",
      image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Betta-splendens-male.jpg",
      images: [],
      video: "",
      description: "Hand-selected healthy Betta splendens featuring vibrant color iridescence and large flowing fins. Centerpiece display specimen.",
      specs: {
        "care": "Beginner / Community",
        "temp": "22°C – 28°C",
        "diet": "Micro-pellets & live/frozen daphnia",
        "habitat": "Planted freshwater aquarium",
        "size": "Adult (5–6 cm)"
      },
      variants: [
        {
                "name": "1 Specimen (Male 5–6 cm)",
                "price": 350,
                "label": "Piece"
        },
        {
                "name": "2 Specimens (Select Males)",
                "price": 700,
                "label": "2 pcs"
        }
      ],
      featured: true
    },

    // ISOPODS
    {
      id: "armadillidium-gestroi",
      category: "isopods",
      categoryName: "Isopods",
      name: "Armadillidium Gestroi",
      subtitle: "Armadillidium gestroi",
      image: "https://upload.wikimedia.org/wikipedia/commons/9/95/Armadillidium_vulgare.jpg",
      images: [],
      video: "",
      description: "Striking Mediterranean pill bug known for its large size, bright yellow spotted dorsal plates, and vigorous vivarium janitorial skills.",
      specs: {
        "care": "Bioactive Cleaners",
        "temp": "20°C – 26°C",
        "diet": "Leaf litter, decaying wood, calcium",
        "habitat": "Bioactive vivarium / enclosure"
      },
      variants: [
        {
                "name": "Single (1 pc)",
                "price": 120,
                "label": "Piece"
        },
        {
                "name": "Starter Culture (5 pcs)",
                "price": 600,
                "label": "5 pcs"
        },
        {
                "name": "Colony Culture (10 pcs)",
                "price": 1200,
                "label": "10 pcs"
        }
      ],
      featured: true
    },
    {
      id: "cubaris-murina-orange",
      category: "isopods",
      categoryName: "Isopods",
      name: "Cubaris Murina Orange",
      subtitle: "Cubaris murina \"Orange\"",
      image: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Cubaris_murinaflorida.jpg",
      images: [],
      video: "",
      description: "Warm apricot-orange color morph. Hardy, highly active, and quick to establish a thriving custodial colony in humid vivariums.",
      specs: {
        "care": "Bioactive Cleaners",
        "temp": "20°C – 26°C",
        "diet": "Leaf litter, decaying wood, calcium",
        "habitat": "Bioactive vivarium / enclosure"
      },
      variants: [
        {
                "name": "Single (1 pc)",
                "price": 60,
                "label": "Piece"
        },
        {
                "name": "Starter Culture (5 pcs)",
                "price": 300,
                "label": "5 pcs"
        },
        {
                "name": "Colony Culture (10 pcs)",
                "price": 600,
                "label": "10 pcs"
        }
      ],
      featured: false
    },
    {
      id: "cubaris-murina-glacier",
      category: "isopods",
      categoryName: "Isopods",
      name: "Cubaris Murina Glacier",
      subtitle: "Cubaris murina \"Glacier\"",
      image: "https://upload.wikimedia.org/wikipedia/commons/8/87/Cubaris_murinafloridatop.jpg",
      images: [],
      video: "",
      description: "Pristine white porcelain appearance with subtle translucent undertones. Excellent bioactive cleanup crew.",
      specs: {
        "care": "Bioactive Cleaners",
        "temp": "20°C – 26°C",
        "diet": "Leaf litter, decaying wood, calcium",
        "habitat": "Bioactive vivarium / enclosure"
      },
      variants: [
        {
                "name": "Single (1 pc)",
                "price": 70,
                "label": "Piece"
        },
        {
                "name": "Starter Culture (5 pcs)",
                "price": 350,
                "label": "5 pcs"
        },
        {
                "name": "Colony Culture (10 pcs)",
                "price": 700,
                "label": "10 pcs"
        }
      ],
      featured: true
    },
    {
      id: "porcellionides-pruinosus-orange-pied",
      category: "isopods",
      categoryName: "Isopods",
      name: "Porcellionides pruinosus Orange Pied",
      subtitle: "Porcellionides pruinosus \"Orange Pied\"",
      image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Porcellionides_pruinosus_P1380341a.jpg",
      images: [],
      video: "",
      description: "Fast-moving, velvety powder-orange isopod with distinctive white pied patches. Superb detritivore for tropical enclosures.",
      specs: {
        "care": "Bioactive Cleaners",
        "temp": "20°C – 26°C",
        "diet": "Leaf litter, decaying wood, calcium",
        "habitat": "Bioactive vivarium / enclosure"
      },
      variants: [
        {
                "name": "Single (1 pc)",
                "price": 60,
                "label": "Piece"
        },
        {
                "name": "Starter Culture (5 pcs)",
                "price": 300,
                "label": "5 pcs"
        },
        {
                "name": "Colony Culture (10 pcs)",
                "price": 600,
                "label": "10 pcs"
        }
      ],
      featured: false
    },
    {
      id: "cubaris-sp-cappuccino",
      category: "isopods",
      categoryName: "Isopods",
      name: "Cubaris sp. Cappuccino",
      subtitle: "Cubaris sp. \"Cappuccino\"",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/18/Cubaris_nigroflava_172816253.jpg",
      images: [],
      video: "",
      description: "Ultra-rare collector isopod exhibiting warm espresso-brown skirts and a creamy dorsal stripe reminiscent of a barista cappuccino.",
      specs: {
        "care": "Bioactive Cleaners",
        "temp": "20°C – 26°C",
        "diet": "Leaf litter, decaying wood, calcium",
        "habitat": "Bioactive vivarium / enclosure"
      },
      variants: [
        {
                "name": "Single (1 pc)",
                "price": 600,
                "label": "Piece"
        },
        {
                "name": "Starter Culture (5 pcs)",
                "price": 3000,
                "label": "5 pcs"
        },
        {
                "name": "Colony Culture (10 pcs)",
                "price": 6000,
                "label": "10 pcs"
        }
      ],
      featured: true
    },
    {
      id: "cubaris-sp-cherry-blossom",
      category: "isopods",
      categoryName: "Isopods",
      name: "Cubaris sp. Cherry Blossom",
      subtitle: "Cubaris sp. \"Cherry Blossom\"",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/16/Cubaris_marmorata_171397510.jpg",
      images: [],
      video: "",
      description: "Exquisite pastel pink and creamy white hues mimicking delicate sakura blossoms. A prized gem among luxury isopod enthusiasts.",
      specs: {
        "care": "Bioactive Cleaners",
        "temp": "20°C – 26°C",
        "diet": "Leaf litter, decaying wood, calcium",
        "habitat": "Bioactive vivarium / enclosure"
      },
      variants: [
        {
                "name": "Single (1 pc)",
                "price": 750,
                "label": "Piece"
        },
        {
                "name": "Starter Culture (5 pcs)",
                "price": 3750,
                "label": "5 pcs"
        },
        {
                "name": "Colony Culture (10 pcs)",
                "price": 7500,
                "label": "10 pcs"
        }
      ],
      featured: true
    },
    {
      id: "armadillidium-peraccae",
      category: "isopods",
      categoryName: "Isopods",
      name: "Armadillidium Peraccae",
      subtitle: "Armadillidium peraccae",
      image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Armadillidium_vulgare_001.jpg",
      images: [],
      video: "",
      description: "Fascinating textured, bumpy slate-grey shell with high drought tolerance. Extremely resilient and fascinating to observe.",
      specs: {
        "care": "Bioactive Cleaners",
        "temp": "20°C – 26°C",
        "diet": "Leaf litter, decaying wood, calcium",
        "habitat": "Bioactive vivarium / enclosure"
      },
      variants: [
        {
                "name": "Single (1 pc)",
                "price": 150,
                "label": "Piece"
        },
        {
                "name": "Starter Culture (5 pcs)",
                "price": 750,
                "label": "5 pcs"
        },
        {
                "name": "Colony Culture (10 pcs)",
                "price": 1500,
                "label": "10 pcs"
        }
      ],
      featured: false
    },

    // TARANTULAS
    {
      id: "chilean-rose-hair",
      category: "tarantulas",
      categoryName: "Tarantulas",
      name: "Chilean Rose Hair",
      subtitle: "Grammostola rosea",
      image: "https://upload.wikimedia.org/wikipedia/commons/2/22/Grammostola_rosea_adult_weiblich.jpg",
      images: [],
      video: "",
      description: "Renowned for its calm, docile temperament and subtle pink carapace setae. The quintessential beginner New World tarantula.",
      specs: {
        "care": "Low Maintenance",
        "temp": "23°C – 28°C",
        "diet": "Pinhead crickets & roach nymphs",
        "habitat": "Ventilated sling vial / enclosure",
        "size": "1–1.5 cm"
      },
      variants: [
        {
                "name": "1 Specimen (1–1.5 cm)",
                "price": 2199,
                "label": "Specimen"
        },
        {
                "name": "Pair of Slings (2 specimens)",
                "price": 4398,
                "label": "2 specimens"
        }
      ],
      featured: true
    },
    {
      id: "brazilian-whiteknee",
      category: "tarantulas",
      categoryName: "Tarantulas",
      name: "Brazilian Whiteknee",
      subtitle: "Acanthoscurria geniculata",
      image: "https://upload.wikimedia.org/wikipedia/commons/6/60/Acanthoscurria_geniculata%2C_female.jpg",
      images: [],
      video: "",
      description: "Bold contrast of jet-black legs adorned with striking snow-white knee bands. Highly active with an enthusiastic feeding response.",
      specs: {
        "care": "Low Maintenance",
        "temp": "23°C – 28°C",
        "diet": "Pinhead crickets & roach nymphs",
        "habitat": "Ventilated sling vial / enclosure",
        "size": "1–1.5 cm"
      },
      variants: [
        {
                "name": "1 Specimen (1–1.5 cm)",
                "price": 2199,
                "label": "Specimen"
        },
        {
                "name": "Pair of Slings (2 specimens)",
                "price": 4398,
                "label": "2 specimens"
        }
      ],
      featured: true
    },
    {
      id: "mexican-red-knee",
      category: "tarantulas",
      categoryName: "Tarantulas",
      name: "Mexican Red Knee",
      subtitle: "Brachypelma hamorii",
      image: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Brachypelma_edit.jpg",
      images: [],
      video: "",
      description: "World-famous display species showcasing fiery orange-red leg joints and deep black velvety body. Very docile and long-lived.",
      specs: {
        "care": "Low Maintenance",
        "temp": "23°C – 28°C",
        "diet": "Pinhead crickets & roach nymphs",
        "habitat": "Ventilated sling vial / enclosure",
        "size": "1–1.5 cm"
      },
      variants: [
        {
                "name": "1 Specimen (1–1.5 cm)",
                "price": 2399,
                "label": "Specimen"
        },
        {
                "name": "Pair of Slings (2 specimens)",
                "price": 4798,
                "label": "2 specimens"
        }
      ],
      featured: true
    },
    {
      id: "green-bottle-blue",
      category: "tarantulas",
      categoryName: "Tarantulas",
      name: "Green Bottle Blue (GBB)",
      subtitle: "Chromatopelma cyaneopubescens",
      image: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Chromatopelma_cyaneopubescens.jpg",
      images: [],
      video: "",
      description: "Spectacular electric blue legs, metallic emerald-green carapace, and vibrant tiger-striped abdomen. Prolific heavy webber.",
      specs: {
        "care": "Low Maintenance",
        "temp": "23°C – 28°C",
        "diet": "Pinhead crickets & roach nymphs",
        "habitat": "Ventilated sling vial / enclosure",
        "size": "1–1.5 cm"
      },
      variants: [
        {
                "name": "1 Specimen (1–1.5 cm)",
                "price": 4799,
                "label": "Specimen"
        },
        {
                "name": "Pair of Slings (2 specimens)",
                "price": 9598,
                "label": "2 specimens"
        }
      ],
      featured: true
    },
    {
      id: "chaco-golden-knee",
      category: "tarantulas",
      categoryName: "Tarantulas",
      name: "Chaco Golden Knee",
      subtitle: "Grammostola pulchripes",
      image: "https://upload.wikimedia.org/wikipedia/commons/6/64/Grammostola_pulchripes_top_view.jpg",
      images: [],
      video: "",
      description: "Gentle giant famous for golden-yellow striped knee markings and calm demeanor. Highly recommended for enthusiastic beginners.",
      specs: {
        "care": "Low Maintenance",
        "temp": "23°C – 28°C",
        "diet": "Pinhead crickets & roach nymphs",
        "habitat": "Ventilated sling vial / enclosure",
        "size": "1–1.5 cm"
      },
      variants: [
        {
                "name": "1 Specimen (1–1.5 cm)",
                "price": 1999,
                "label": "Specimen"
        },
        {
                "name": "Pair of Slings (2 specimens)",
                "price": 3998,
                "label": "2 specimens"
        }
      ],
      featured: false
    },
    {
      id: "salmon-pink",
      category: "tarantulas",
      categoryName: "Tarantulas",
      name: "Salmon Pink",
      subtitle: "Lasiodora parahybana",
      image: "https://upload.wikimedia.org/wikipedia/commons/8/89/Brazilian_Salmon_Pink_Birdeater.jpg",
      images: [],
      video: "",
      description: "One of the largest tarantula species in the world. Fast-growing established spiderling with salmon-pink hairs.",
      specs: {
        "care": "Low Maintenance",
        "temp": "23°C – 28°C",
        "diet": "Pinhead crickets & roach nymphs",
        "habitat": "Ventilated sling vial / enclosure",
        "size": "1 inch"
      },
      variants: [
        {
                "name": "1 Specimen (1 inch)",
                "price": 3000,
                "label": "Specimen"
        },
        {
                "name": "Pair of Slings (2 specimens)",
                "price": 6000,
                "label": "2 specimens"
        }
      ],
      featured: true
    },

    // COMBO PACKS
    {
      id: "isopod-house-kit",
      category: "combos",
      categoryName: "Combo Packs",
      name: "Isopod House Kit",
      subtitle: "Complete Bioactive Isopod Habitat",
      image: "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=800&q=80",
      images: [],
      video: "",
      description: "Complete glass bioactive habitat setup. Includes glass isopod house, live plants, substrate blend, lotus pod hide, food, and a starter culture of 6 Cubaris Glacier isopods.",
      specs: {
        "care": "Complete Bioactive Setup",
        "temp": "Ambient Room Temp",
        "diet": "Included in starter pack",
        "habitat": "High-clarity glass enclosure",
        "kitIncludes": [
                "Glass Isopod House (5\" L × 5\" D × 5\" H + 2.5\" roof height)",
                "Fittonia albivenis (Patterned nerve plant)",
                "Hemigraphis sp. Pink (Purple waffle plant)",
                "Sheet Moss layer",
                "Bioactive Isopod Substrate Blend",
                "Lotus Pod (natural hide for isopods)",
                "Premium Isopod Food",
                "Isopod Culture: 6 Cubaris sp. \"Glacier\""
        ]
      },
      variants: [
        {
                "name": "Complete Kit",
                "price": 1545,
                "label": "Kit"
        }
      ],
      featured: true
    },
    {
      id: "half-cube-aquarium-kit",
      category: "combos",
      categoryName: "Combo Packs",
      name: "Half Cube Aquarium Kit",
      subtitle: "Desktop Betta Aquascape Bundle",
      image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=800&q=80",
      images: [],
      video: "",
      description: "Desktop planted aquarium kit. Includes Half Cube aquarium, 1 healthy Betta fish, live aquatic plants, and premium sand substrate.",
      specs: {
        "care": "Complete Bioactive Setup",
        "temp": "Ambient Room Temp",
        "diet": "Included in starter pack",
        "habitat": "High-clarity glass enclosure",
        "kitIncludes": [
                "Half Cube Aquarium",
                "1 beautiful Betta Fish",
                "Live aquatic plants",
                "Premium sand substrate"
        ]
      },
      variants: [
        {
                "name": "Complete Kit",
                "price": 999,
                "label": "Kit"
        }
      ],
      featured: true
    },
    {
      id: "glacier-colony-pack",
      category: "combos",
      categoryName: "Combo Packs",
      name: "Glacier Isopods (Buy 10, Get 1 Free)",
      subtitle: "Cubaris murina \"Glacier\" 10+1 Special",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/16/Cubaris_tarangensis_190481013.jpg",
      images: [],
      video: "",
      description: "Promotional colony pack: Purchase 10 Cubaris Murina Glacier isopods and receive 1 bonus isopod free of charge (11 specimens total).",
      specs: {
        "care": "Complete Bioactive Setup",
        "temp": "Ambient Room Temp",
        "diet": "Included in starter pack",
        "habitat": "High-clarity glass enclosure",
        "kitIncludes": [
                "10 Cubaris Murina Glacier Isopods",
                "1 Bonus Isopod (11 specimens total)",
                "Ventilated transport culture cup",
                "Starter food blend"
        ]
      },
      variants: [
        {
                "name": "10 + 1 Free Deal (11 specimens)",
                "price": 700,
                "label": "11 Pieces"
        }
      ],
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

    add(product, qty = 1, variant = null) {
      if (!product || !product.id) return;
      initProductVariantsAndSpecs(product);
      qty = Math.max(1, Math.floor(qty));
      const activeVariant = variant || getProductSelectedVariant(product);
      const isBaseOption = !activeVariant || activeVariant.name === '1 Pair (Adult Pair)' || activeVariant.name === 'Single (1 pc)' || activeVariant.name === 'Complete Kit';
      const variantKey = isBaseOption ? String(product.id) : String(product.id) + '__var_' + encodeURIComponent(activeVariant.name);
      const displayName = isBaseOption ? product.name : product.name + ' (' + activeVariant.name + ')';
      const activePrice = activeVariant ? activeVariant.price : product.price;
      const activeUnit = activeVariant ? activeVariant.unit : product.pricingUnit;

      const items = this.load();
      const idx = items.findIndex(i => String(i.id) === variantKey);
      if (idx >= 0) {
        items[idx].quantity += qty;
      } else {
        items.push({
          id: variantKey,
          baseId: String(product.id),
          name: displayName,
          price: Number(activePrice),
          pricingUnit: activeUnit,
          size: product.size || null,
          categoryLabel: (product.categoryName || product.categoryLabel) || '',
          image: product.image || PLACEHOLDER_IMG,
          quantity: qty
        });
      }
      this.save(items);
      showToast(`Added ${displayName} to cart!`, 'success');
    },

    addById(id, qty = 1, variantIndex = null) {
      const product = PRODUCTS.find(p => String(p.id) === String(id));
      if (!product) {
        console.warn('Product not found for id:', id);
        return;
      }
      initProductVariantsAndSpecs(product);
      let variant = null;
      if (variantIndex !== null && product.variants && product.variants[variantIndex]) {
        variant = product.variants[variantIndex];
      } else {
        variant = getProductSelectedVariant(product);
      }
      this.add(product, qty, variant);
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

  window.onCardVariantChange = function (productId, variantIndex) {
    selectedVariants[productId] = Number(variantIndex);
    const product = PRODUCTS.find(p => String(p.id) === String(productId));
    if (!product) return;
    initProductVariantsAndSpecs(product);
    const variant = product.variants[Number(variantIndex)] || product.variants[0];

    const priceEl = document.getElementById('cardPrice_' + productId);
    const unitEl = document.getElementById('cardUnit_' + productId);
    const varPriceEl = document.getElementById('cardVarPrice_' + productId);
    const labelEl = document.getElementById('cardPriceLabel_' + productId);

    if (priceEl) priceEl.textContent = CartManager.formatPrice(variant.price);
    if (unitEl) unitEl.textContent = '/ ' + variant.unit;
    if (varPriceEl) varPriceEl.textContent = CartManager.formatPrice(variant.price);
    if (labelEl) labelEl.textContent = getProductPriceLabel(variant, product.category);

    // Sync with modal if currently open for this product
    const modalSelect = document.getElementById('modalVariantSelect');
    if (modalSelect) {
      modalSelect.value = variantIndex;
      const modalPriceEl = document.getElementById('modalPrice');
      const modalVariantPriceEl = document.getElementById('modalVariantPrice');
      const modalUnitEl = document.getElementById('modalUnit');
      if (modalPriceEl) modalPriceEl.textContent = CartManager.formatPrice(variant.price);
      if (modalVariantPriceEl) modalVariantPriceEl.textContent = CartManager.formatPrice(variant.price);
      if (modalUnitEl) modalUnitEl.textContent = '/ ' + variant.unit;
    }
  };

  window.onModalVariantChange = function (productId, variantIndex) {
    selectedVariants[productId] = Number(variantIndex);
    const product = PRODUCTS.find(p => String(p.id) === String(productId));
    if (!product) return;
    initProductVariantsAndSpecs(product);
    const variant = product.variants[Number(variantIndex)] || product.variants[0];

    const modalPriceEl = document.getElementById('modalPrice');
    const modalVariantPriceEl = document.getElementById('modalVariantPrice');
    const modalUnitEl = document.getElementById('modalUnit');
    if (modalPriceEl) modalPriceEl.textContent = CartManager.formatPrice(variant.price);
    if (modalVariantPriceEl) modalVariantPriceEl.textContent = CartManager.formatPrice(variant.price);
    if (modalUnitEl) modalUnitEl.textContent = '/ ' + variant.unit;

    // Sync corresponding product card if visible
    const cardSelect = document.getElementById('cardVar_' + productId);
    if (cardSelect) cardSelect.value = variantIndex;
    const priceEl = document.getElementById('cardPrice_' + productId);
    const unitEl = document.getElementById('cardUnit_' + productId);
    const varPriceEl = document.getElementById('cardVarPrice_' + productId);
    const labelEl = document.getElementById('cardPriceLabel_' + productId);
    if (priceEl) priceEl.textContent = CartManager.formatPrice(variant.price);
    if (unitEl) unitEl.textContent = '/ ' + variant.unit;
    if (varPriceEl) varPriceEl.textContent = CartManager.formatPrice(variant.price);
    if (labelEl) labelEl.textContent = getProductPriceLabel(variant, product.category);
  };

  window.addCardVariantToCart = function (productId) {
    CartManager.addById(productId, 1);
  };

  function renderProductGrid() {
    const grid = document.getElementById('productGrid');
    const countEl = document.getElementById('resultCount');
    if (!grid) return;

    let list = [...PRODUCTS];

    // Ensure all products have variants and specs initialized
    list.forEach(p => initProductVariantsAndSpecs(p));

    // 1. Filter by category
    if (currentCategory !== 'all') {
      list = list.filter(p => p.category === currentCategory);
    }

    // 2. Filter by search query
    if (currentSearch.trim()) {
      const q = currentSearch.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.scientificName && p.scientificName.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // 3. Sort list (Featured, Price Low to High, Price High to Low, Name)
    if (currentSort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Update Showing X of Y products counter
    if (countEl) {
      countEl.innerHTML = `Showing <strong>${list.length}</strong> of <strong>${PRODUCTS.length}</strong> products`;
    }

    const indicatorEl = document.getElementById('activeCategoryIndicator');
    if (indicatorEl) {
      indicatorEl.textContent = CATEGORY_NAMES[currentCategory] || 'All Products';
    }

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="catalogue-empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3 class="empty-state-title">No Products Found</h3>
          <p class="empty-state-desc">We couldn't find any living specimens matching "${currentSearch}". Try refining your search or resetting category filters.</p>
          <button class="btn btn-outline btn-sm" onclick="resetFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(product => {
      initProductVariantsAndSpecs(product);
      const activeVariant = getProductSelectedVariant(product);
      const activeVariantIdx = selectedVariants[product.id] || 0;
      const displayPrice = CartManager.formatPrice(activeVariant.price);
      const displayUnit = '/ ' + activeVariant.unit;
      const priceLabel = getProductPriceLabel(activeVariant, product.category);
      const hasMultipleVariants = product.variants && product.variants.length > 1;

      const variantSelectorHTML = hasMultipleVariants
        ? `
          <div class="card-variant-box">
            <div class="card-variant-hdr">
              <span class="variant-hdr-text">CHOOSE VARIANT:</span>
              <span class="variant-hdr-price" id="cardVarPrice_${product.id}">${displayPrice}</span>
            </div>
            <div class="card-variant-select-wrap">
              <select id="cardVar_${product.id}" class="card-variant-select" onchange="onCardVariantChange('${product.id}', this.value)" title="Choose variant">
                ${product.variants.map((v, i) => `
                  <option value="${i}" ${i === activeVariantIdx ? 'selected' : ''}>${v.name}</option>
                `).join('')}
              </select>
            </div>
          </div>
        `
        : '';

      return `
        <article class="product-card" data-id="${product.id}">
          <!-- SECTION A – PRODUCT IMAGE -->
          <div class="product-card-thumb" onclick="openProductModal('${product.id}')" title="View ${product.name} details">
            <img src="${product.image || PLACEHOLDER_IMG}" alt="${product.name}" class="product-card-img" loading="lazy" onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}';">
          </div>

          <!-- SECTION B, C, D, E – CARD BODY -->
          <div class="product-card-body">
            <!-- Small category label -->
            <div class="product-card-cat">${(product.categoryName || product.categoryLabel)}</div>

            <!-- Product name with consistent typography (2 lines clamped) -->
            <h3 class="product-card-name" onclick="openProductModal('${product.id}')" title="${product.name}">${product.name}</h3>

            <!-- Scientific name or short description (2 lines clamped) -->
            <div class="product-card-sub" title="${product.scientificName || product.description}">${product.scientificName || product.description}</div>

            <!-- SECTION C – VARIANT SELECTOR (Only rendered when product has variants) -->
            ${variantSelectorHTML}

            <!-- SECTION D & E – FOOTER PINNED TO BOTTOM -->
            <div class="product-card-footer">
              <div class="card-divider"></div>
              <div class="product-card-pricing-row product-card-pricing">
                <span class="card-price-label" id="cardPriceLabel_${product.id}">${priceLabel}</span>
                <div class="card-price-display">
                  <span class="product-card-price" id="cardPrice_${product.id}">${displayPrice}</span>
                  <span class="product-card-unit" id="cardUnit_${product.id}">${displayUnit}</span>
                </div>
              </div>

              <!-- SECTION E – ACTION BUTTONS -->
              <div class="product-card-actions">
                <button class="btn btn-outline card-btn-view" onclick="openProductModal('${product.id}')">
                  View Details
                </button>
                <button class="btn btn-primary card-btn-add" onclick="addCardVariantToCart('${product.id}')">
                  Add to Cart
                </button>
              </div>
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
    document.querySelectorAll('.filter-tab, .filter-pill').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === 'all');
    });
    renderProductGrid();
  };

  window.filterByCategory = function (categoryKey) {
    currentCategory = categoryKey;
    document.querySelectorAll('.filter-tab, .filter-pill').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === categoryKey);
    });
    renderProductGrid();
  };

  window.handleCatalogSearch = function (query) {
    currentSearch = query;
    renderProductGrid();
  };

  window.handleCatalogSort = function (sortValue) {
    currentSort = sortValue;
    renderProductGrid();
  };

  /* ── 7. Product Detail Modal ─────────────────────────────── */
  window.openProductModal = function (productId) {
    const product = PRODUCTS.find(p => String(p.id) === String(productId));
    if (!product) return;
    initProductVariantsAndSpecs(product);

    const modalBackdrop = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    if (!modalBackdrop || !modalContent) return;

    const activeVariant = getProductSelectedVariant(product);
    const activeVariantIdx = selectedVariants[product.id] || 0;
    const displayPrice = CartManager.formatPrice(activeVariant.price);
    const displayUnit = '/ ' + activeVariant.unit;

    const kitHTML = (product.kitIncludes && product.kitIncludes.length)
      ? `
        <div class="modal-kit-list">
          <strong class="modal-kit-heading">Included in Kit:</strong>
          <ul>
            ${product.kitIncludes.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `
      : '';

    const specs = product.specs || {};

    modalContent.innerHTML = `
      <div class="modal-layout">
        <!-- LEFT COLUMN: ~50% width, large photograph, object-fit: contain, theme-matched background, no black empty space -->
        <div class="modal-media-col">
          <div class="modal-image-container">
            <img src="${product.image || PLACEHOLDER_IMG}" alt="${product.name}" class="modal-product-img" onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}';">
          </div>
        </div>

        <!-- RIGHT COLUMN: ~50% width, exact reference layout -->
        <div class="modal-info-col">
          <!-- Category label at top -->
          <div class="modal-cat-tag">${(product.categoryName || product.categoryLabel).toUpperCase()}</div>

          <!-- Product name in prominent typography -->
          <h2 class="modal-title">${product.name}</h2>

          <!-- Scientific name below product name -->
          <div class="modal-subtitle">${product.scientificName ? product.scientificName + (product.size ? ' • ' + product.size : '') : (product.size || 'Verified Healthy Specimen')}</div>

          <!-- Large clearly visible price -->
          <div class="modal-price-box">
            <span class="modal-price" id="modalPrice">${displayPrice}</span>
            <span class="modal-price-unit" id="modalUnit">${displayUnit}</span>
          </div>

          <!-- Product description -->
          <p class="modal-desc">${product.description}</p>

          <!-- Variant selector with selected price (SELECT VARIANT header row + dropdown) -->
          <div class="modal-variant-section">
            <div class="modal-variant-header">
              <span class="variant-hdr-label">SELECT VARIANT:</span>
              <span class="variant-hdr-price" id="modalVariantPrice">${displayPrice}</span>
            </div>
            <div class="modal-variant-dropdown-wrap">
              <select id="modalVariantSelect" class="modal-variant-dropdown" onchange="onModalVariantChange('${product.id}', this.value)" title="Choose variant">
                ${product.variants.map((v, idx) => `
                  <option value="${idx}" ${idx === activeVariantIdx ? 'selected' : ''}>${v.name} (${CartManager.formatPrice(v.price)})</option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- Product specifications in a clean bordered section -->
          <div class="modal-specs-card">
            <div class="spec-entry">
              <span class="spec-k">Care Level:</span>
              <span class="spec-v">${specs.care || 'Moderate'}</span>
            </div>
            <div class="spec-entry">
              <span class="spec-k">Water Temp:</span>
              <span class="spec-v">${specs.temp || '22°C – 28°C'}</span>
            </div>
            <div class="spec-entry">
              <span class="spec-k">Diet:</span>
              <span class="spec-v">${specs.diet || 'Micro-pellets & live/frozen foods'}</span>
            </div>
            <div class="spec-entry">
              <span class="spec-k">Specimen Size:</span>
              <span class="spec-v">${product.size || 'Adult Pair / Verified Mature'}</span>
            </div>
          </div>

          ${kitHTML}

          <!-- 3. Bottom Action Buttons: Two large horizontal buttons, equal width, comfortable height, aligned at bottom -->
          <div class="modal-bottom-actions">
            <button class="btn btn-primary modal-action-btn" onclick="addModalCurrentToCart('${product.id}')">
              Add to Cart →
            </button>
            <button class="btn btn-whatsapp-modal modal-action-btn" onclick="directModalWhatsAppEnquire('${product.id}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.16C10.57 20.16 9.12 19.76 7.85 19.01L7.55 18.83L4.44 19.65L5.27 16.62L5.07 16.31C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.05 3.68C14.25 3.68 16.31 4.54 17.87 6.1C19.42 7.66 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.16 12.05 20.16Z"/>
              </svg>
              <span>WhatsApp Enquire</span>
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

  window.handleModalBackdropClick = function (e) {
    if (e.target && e.target.id === 'productModal') {
      window.closeProductModal();
    }
  };

  window.updateModalQty = function (delta) {
    const qtyEl = document.getElementById('modalQty');
    if (!qtyEl) return;
    let current = parseInt(qtyEl.textContent, 10);
    if (isNaN(current)) current = 1;
    let qty = current + delta;
    if (qty < 1) qty = 1;
    qtyEl.textContent = qty;
  };

  window.addModalCurrentToCart = function (productId) {
    const qtyEl = document.getElementById('modalQty');
    const parsed = qtyEl ? parseInt(qtyEl.textContent, 10) : 1;
    const qty = isNaN(parsed) ? 1 : Math.max(1, parsed);
    CartManager.addById(productId, qty);
    if (typeof window.closeProductModal === 'function') window.closeProductModal();
  };

  window.directModalWhatsAppEnquire = function (productId) {
    const product = PRODUCTS.find(p => String(p.id) === String(productId));
    if (!product) return;
    initProductVariantsAndSpecs(product);
    const activeVariant = getProductSelectedVariant(product);
    const qtyEl = document.getElementById('modalQty');
    const parsed = qtyEl ? parseInt(qtyEl.textContent, 10) : 1;
    const qty = isNaN(parsed) ? 1 : Math.max(1, parsed);

    const total = CartManager.formatPrice(activeVariant.price * qty);
    const msg = [
      'Hello Fish Tales!',
      '',
      `I would like to enquire about:`,
      `• ${product.name} (${activeVariant.name})`,
      `• Quantity: ${qty}`,
      `• Total Value: ${total}`,
      '',
      'Please confirm specimen availability, shipping schedule and payment info (Cash on Delivery is unavailable).'
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
      return `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-thumb">
            <img src="${productObj.image || PLACEHOLDER_IMG}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}';">
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

  window.toggleCartDrawer = function () {
    const drawer = document.getElementById('cartDrawer');
    if (drawer && drawer.classList.contains('active')) {
      window.closeCartDrawer();
    } else {
      window.openCartDrawer();
    }
  };

  window.toggleCartDrawer = function () {
    const drawer = document.getElementById('cartDrawer');
    if (drawer && drawer.classList.contains('active')) {
      window.closeCartDrawer();
    } else {
      window.openCartDrawer();
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
      (p.categoryName || p.categoryLabel).toLowerCase().includes(q) ||
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
              <div style="color:var(--text-muted); font-size:0.8rem;">${(p.categoryName || p.categoryLabel)} ${p.scientificName ? '• ' + p.scientificName : ''}</div>
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

  
  /* ── Mobile Menu Handlers ────────────────────────────────── */
  window.toggleMobileMenu = function () {
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburger');
    if (!navMenu) return;
    const isOpen = navMenu.classList.toggle('active');
    if (hamburger) {
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.innerHTML = isOpen
        ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
        : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    }
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  window.closeMobileMenu = function () {
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburger');
    if (navMenu && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      if (hamburger) {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      }
      document.body.style.overflow = '';
    }
  };

  /* ── 10. Smooth Scroll & Navigation Helpers ──────────────── */
  window.scrollToSection = function (elementId) {
    if (typeof window.closeMobileMenu === "function") window.closeMobileMenu();
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
    if (typeof window.closeMobileMenu === "function") window.closeMobileMenu();
    currentCategory = categoryKey;
    document.querySelectorAll('.filter-tab, .filter-pill').forEach(tab => {
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

    // 4. Mobile resize listener to reset overflow
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        if (typeof window.closeMobileMenu === "function") window.closeMobileMenu();
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
    document.querySelectorAll('.filter-tab, .filter-pill').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab, .filter-pill').forEach(t => t.classList.remove('active'));
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
        if (typeof window.closeCartDrawer === 'function') window.closeCartDrawer();
        if (typeof window.closeProductModal === 'function') window.closeProductModal();
        if (typeof window.closeSearchOverlay === 'function') window.closeSearchOverlay();
        if (typeof window.closeMobileMenu === 'function') window.closeMobileMenu();
      }
    });

    // Auto close mobile menu on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && typeof window.closeMobileMenu === 'function') {
        window.closeMobileMenu();
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
