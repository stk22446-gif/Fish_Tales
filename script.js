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
  const CONTACT_EMAIL = 'fishtales.exotic@gmail.com';
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

  function isIsopodProduct(productOrItem) {
    if (!productOrItem) return false;
    const cat = String(productOrItem.category || '').toLowerCase();
    const subCat = String(productOrItem.subCategory || '').toLowerCase();
    const catLabel = String(productOrItem.categoryLabel || productOrItem.categoryName || '').toLowerCase();
    const id = String(productOrItem.id || productOrItem.baseId || '').toLowerCase();

    // Check if category identifier is explicitly 'isopods'
    if (cat === 'isopods' || subCat === 'isopods' || catLabel === 'isopods') {
      return true;
    }

    // Match against master PRODUCTS catalogue by ID
    const master = PRODUCTS.find(p => String(p.id) === id || String(p.id) === String(productOrItem.baseId));
    if (master && (master.category === 'isopods' || master.subCategory === 'isopods')) {
      return true;
    }

    return false;
  }

  function getProductQuantityLabel(product) {
    if (!product) return 'Select Quantity';
    const subCat = (product.subCategory || '').toLowerCase();
    const id = (product.id || '').toLowerCase();
    const name = (product.name || '').toLowerCase();
    const pricingUnit = (product.unit || product.pricingUnit || '').toLowerCase();

    // Fish types using pairs: Guppy / Molly / Betta (or any product priced/sold per pair)
    if (subCat === 'guppy' || subCat === 'molly' || subCat === 'betta' ||
      id.includes('guppy') || id.includes('molly') || id.includes('betta') ||
      name.includes('guppy') || name.includes('molly') || name.includes('betta') ||
      pricingUnit.includes('pair')) {
      return 'Select Pair';
    }
    // All other products: Shrimps, Isopods, Tarantulas, Aquariums and Combo Kits
    return 'Select Quantity';
  }

  function initProductVariantsAndSpecs(p) {
    if (!p) return;
    // Backward-compatibility aliases for legacy templates and test suites
    if (!p.categoryLabel) p.categoryLabel = p.categoryName || '';

    const SPECIES_SCIENTIFIC_NAMES = {
      'guppy-red-lace': 'Poecilia reticulata',
      'guppy-gold-dumbo-ear': 'Poecilia reticulata',
      'guppy-santacruz-dumbo-ear': 'Poecilia reticulata',
      'guppy-platinum-dumbo-halfmoon': 'Poecilia reticulata',
      'guppy-blue-dragon-dumbo-halfmoon': 'Poecilia reticulata',
      'guppy-moscow-black-dumbo': 'Poecilia reticulata',
      'guppy-afr-big-dorsal': 'Poecilia reticulata',
      'guppy-dark-knight-dragon-dumbo': 'Poecilia reticulata',
      'guppy-red-platinum-koi-dumbo': 'Poecilia reticulata',
      'guppy-magenta-red-tiger': 'Poecilia reticulata',
      'guppy-white-tuxido': 'Poecilia reticulata',
      'guppy-silverado-red-dragon': 'Poecilia reticulata',
      'guppy-green-moscow': 'Poecilia reticulata',
      'show-grade-betta': 'Betta splendens',
      'molly-golden': 'Poecilia sphenops var. Golden',
      'shrimp-crystal-red': 'Caridina cf. cantonensis var. Crystal Red',
      'armadillidium-gestroi': 'Armadillidium gestroi',
      'cubaris-murina-orange': 'Cubaris murina var. Orange',
      'cubaris-murina-glacier': 'Cubaris murina var. Glacier',
      'porcellionides-pruinosus-orange-pied': 'Porcellionides pruinosus var. Orange Pied',
      'cubaris-sp-cappuccino': 'Cubaris sp. Cappuccino',
      'cubaris-sp-cherry-blossom': 'Cubaris sp. Cherry Blossom',
      'armadillidium-peraccae': 'Armadillidium peraccae',
      'chilean-rose-hair': 'Grammostola rosea',
      'brazilian-whiteknee': 'Acanthoscurria geniculata',
      'mexican-red-knee': 'Brachypelma hamorii',
      'green-bottle-blue': 'Chromatopelma cyaneopubescens',
      'chaco-golden-knee': 'Grammostola pulchripes',
      'salmon-pink': 'Lasiodora parahybana',
      'isopod-house-kit': 'Bioactive Glass Vivarium Kit',
      'half-cube-aquarium-kit': 'Nano Desktop Aquascape System',
      'glacier-colony-pack': 'Cubaris murina var. Glacier'
    };

    if (!p.scientificName || p.scientificName === '') {
      p.scientificName = SPECIES_SCIENTIFIC_NAMES[p.id] || p.subtitle || '';
    }
    if (!p.subtitle || p.subtitle === '') {
      p.subtitle = p.scientificName;
    }

    if (p.price === undefined || p.price === null) {
      p.price = 0;
    } else {
      p.price = Number(p.price);
    }
    if (!p.unit) {
      p.unit = p.pricingUnit || (isIsopodProduct(p) ? 'piece' : 'pair');
    }
    if (!p.pricingUnit) {
      p.pricingUnit = p.unit;
    }
    if (p.minQuantity === undefined || p.minQuantity === null) {
      p.minQuantity = isIsopodProduct(p) ? 5 : 1;
    }
    if (p.specs && p.specs.size && !p.size) {
      p.size = p.specs.size;
    }
    if (p.specs && p.specs.kitIncludes && !p.kitIncludes) {
      p.kitIncludes = p.specs.kitIncludes;
    }
    if (!p.subCategory) {
      const id = (p.id || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      if (id.includes('guppy') || name.includes('guppy')) p.subCategory = 'guppy';
      else if (id.includes('betta') || name.includes('betta')) p.subCategory = 'betta';
      else if (id.includes('aquarium') || name.includes('aquarium') || id.includes('tank') || name.includes('tank')) p.subCategory = 'aquarium';
      else if (id.includes('molly') || name.includes('molly')) p.subCategory = 'molly';
      else if (id.includes('shrimp') || name.includes('shrimp')) p.subCategory = 'shrimp';
    }

    // Extended product information sections (Overview, Care Requirements, Habitat Setup, Did You Know)
    const isFish = p.category === 'aquarium';
    const isIsopod = p.category === 'isopods';
    const isTarantula = p.category === 'tarantulas';
    const isCombo = p.category === 'combo';
    const specs = p.specs || {};

    if (p.overview === undefined) {
      if (isFish) {
        if (p.subCategory === 'guppy') {
          p.overview = `The ${p.name} (${p.subtitle || 'Poecilia reticulata'}) is an exquisite livebearing freshwater fish prized for its vibrant coloration, intricate tail patterns, and peaceful demeanor in planted aquariums.`;
        } else if (p.subCategory === 'betta') {
          p.overview = `The ${p.name} is a majestic labyrinth fish displaying symmetrical finnage, vibrant iridescence, and intelligent personality. Each specimen is selected for health, vitality, and show-standard conformation.`;
        } else if (p.subCategory === 'molly') {
          p.overview = `The ${p.name} (${p.subtitle || 'Poecilia sphenops'}) is an active, gregarious livebearer with radiant golden coloration. Renowned for grazing natural algae and thriving in planted community biotopes.`;
        } else if (p.subCategory === 'shrimps') {
          p.overview = `The ${p.name} (${p.subtitle || 'Caridina cf. cantonensis'}) is a premier dwarf freshwater invertebrate exhibiting striking opaque white and vivid red color banding. Exceptional algae grazer for planted aquascapes.`;
        } else {
          p.overview = `The ${p.name} is a healthy, active specimen carefully conditioned for planted aquariums and community biotopes.`;
        }
      } else if (isIsopod) {
        p.overview = `${p.name} (${p.subtitle || 'Bioactive Isopod'}) is a prized terrestrial crustacean ideal as a clean-up crew (CUC) in bioactive terrariums or as a fascinating display colony.`;
      } else if (isTarantula) {
        p.overview = `The ${p.name} (${p.subtitle || 'Theraphosidae'}) is a captivating New World tarantula renowned among exotic hobbyists for its striking appearance and low maintenance requirements.`;
      } else if (isCombo) {
        p.overview = `The ${p.name} is an all-inclusive, curated complete biological setup designed by Fish Tales specialists. Includes premium glass enclosure, substrate, live specimens, and balanced essentials.`;
      } else {
        p.overview = p.description || '';
      }
    }

    if (p.careRequirements === undefined) {
      if (isFish) {
        if (p.subCategory === 'guppy') {
          p.careRequirements = {
            'Difficulty': 'Beginner / Community',
            'Water Temp': specs.temp || '22°C – 28°C',
            'Diet': specs.diet || 'Micro-pellets, spirulina flakes & live daphnia',
            'Lifespan': '2 – 3 years',
            'pH Range': '6.8 – 7.8',
            'Hardness': 'Medium to hard (8–12 dGH)'
          };
        } else if (p.subCategory === 'betta') {
          p.careRequirements = {
            'Difficulty': 'Beginner / Community',
            'Water Temp': specs.temp || '24°C – 28°C',
            'Diet': specs.diet || 'High-protein betta micro-pellets & live/frozen bloodworms',
            'Lifespan': '3 – 5 years',
            'pH Range': '6.5 – 7.5',
            'Handling': 'Do not house adult males together'
          };
        } else if (p.subCategory === 'molly') {
          p.careRequirements = {
            'Difficulty': 'Beginner / Community',
            'Water Temp': specs.temp || '22°C – 28°C',
            'Diet': specs.diet || 'Flakes, micro-pellets & vegetable matter',
            'Lifespan': '3 – 5 years',
            'pH Range': '7.0 – 8.2',
            'Hardness': 'Hard water preferred (10–25 dGH)'
          };
        } else if (p.subCategory === 'shrimps') {
          p.careRequirements = {
            'Difficulty': 'Intermediate / Peaceful',
            'Water Temp': specs.temp || '21°C – 25°C',
            'Diet': specs.diet || 'Biofilm, specialized shrimp pellets & blanched vegetables',
            'Lifespan': '1.5 – 2 years',
            'pH Range': '6.2 – 6.8',
            'TDS / GH': 'TDS 110–140 ppm, GH 4–6'
          };
        } else {
          p.careRequirements = {
            'Difficulty': specs.care || 'Beginner',
            'Water Temp': specs.temp || '22°C – 28°C',
            'Diet': specs.diet || 'Micro-pellets & flakes'
          };
        }
      } else if (isIsopod) {
        p.careRequirements = {
          'Difficulty': 'Beginner to Intermediate',
          'Temperature': specs.temp || '20°C – 26°C',
          'Humidity': '60% – 80% (moisture gradient required)',
          'Diet': specs.diet || 'Decaying leaf litter, rotting hardwood, calcium (cuttlebone) & supplemental protein',
          'Lifespan': '2 – 3 years',
          'Handling': 'Delicate live specimens; observe without excessive handling'
        };
      } else if (isTarantula) {
        p.careRequirements = {
          'Difficulty': specs.care || 'Low Maintenance',
          'Temperature': specs.temp || '23°C – 28°C',
          'Humidity': '55% – 70% with access to a shallow water dish',
          'Diet': specs.diet || 'Pre-killed or appropriately sized live pinhead crickets & roach nymphs',
          'Lifespan': '15 – 25 years (females), 4 – 6 years (males)',
          'Temperament': 'New World terrestrial species; observe as display exotic'
        };
      } else if (isCombo) {
        p.careRequirements = {
          'Setup Difficulty': 'Beginner Friendly / Turnkey Kit',
          'Operating Temp': specs.temp || 'Ambient Room Temp (20°C – 28°C)',
          'Maintenance': 'Weekly misting or feeding as specified in care guidelines',
          'Included Components': specs.kitIncludes ? specs.kitIncludes.join(', ') : 'All essential setup hardware and live specimens'
        };
      } else {
        p.careRequirements = {};
      }
    }

    if (p.habitatSetup === undefined) {
      if (isFish) {
        if (p.subCategory === 'guppy') {
          p.habitatSetup = {
            'Aquarium Size': 'Minimum 10 gallons for active pairs or colonies',
            'Substrate': 'Fine gravel or dark aquatic soil to highlight iridescent coloration',
            'Filtration & Flow': 'Gentle sponge or internal filter to protect delicate flowing fins',
            'Plants & Decor': 'Dense live plants like Java Moss, Hornwort, and Anubias for shelter'
          };
        } else if (p.subCategory === 'betta') {
          p.habitatSetup = {
            'Aquarium Size': '5 to 10 gallons nano tank (avoid tiny unheated bowls)',
            'Filtration & Flow': 'Low-flow filtration as heavy currents tire flowing fins',
            'Substrate': 'Smooth dark sand or planted substrate',
            'Plants & Decor': 'Broad-leaf live plants like Anubias providing rest spots near the surface'
          };
        } else if (p.subCategory === 'molly') {
          p.habitatSetup = {
            'Aquarium Size': '15–20 gallons or larger for active swimming pairs',
            'Substrate': 'Aquatic soil or planted substrate supporting robust plant growth',
            'Filtration & Flow': 'Moderate biological filtration with clean water maintenance',
            'Plants & Decor': 'Ample swimming room combined with background stems (Vallisneria, Amazon Swords)'
          };
        } else if (p.subCategory === 'shrimps') {
          p.habitatSetup = {
            'Aquarium Size': '5 to 10 gallons mature planted nano tank',
            'Filtration & Flow': 'Sponge filtration only to prevent shrimplets from being drawn into impellers',
            'Substrate': 'Active buffering substrate maintaining slightly acidic pH',
            'Plants & Decor': 'Cholla wood, Indian almond leaves, and dense mosses (Java, Christmas, Phoenix)'
          };
        } else {
          p.habitatSetup = {
            'Aquarium Size': '10+ gallons planted tank',
            'Substrate': 'Aquatic gravel or planted soil',
            'Filtration & Flow': 'Gentle biological filtration'
          };
        }
      } else if (isIsopod) {
        p.habitatSetup = {
          'Enclosure': 'Ventilated acrylic, glass, or plastic container with moisture retention',
          'Substrate': 'Damp organic bioactive soil blend enriched with worm castings and crushed leaf litter',
          'Moisture Gradient': 'One moist corner with damp sphagnum moss and one drier ventilating side',
          'Hiding Places': 'Cork bark flats, decaying wood chunks, and natural lotus pods'
        };
      } else if (isTarantula) {
        p.habitatSetup = {
          'Enclosure': 'Ventilated sling vial or acrylic terrestrial terrarium with secure locking lid',
          'Substrate': '3–4 inches of dry to slightly damp coco fiber or peat blend for burrowing',
          'Hides & Decor': 'Curved cork bark hide and small shallow water dish (for specimens over 2 cm)',
          'Ventilation': 'Cross-ventilation holes to prevent stagnant humidity while retaining comfort'
        };
      } else if (isCombo) {
        p.habitatSetup = {
          'Enclosure Construction': 'High-clarity precision glass with optimal ventilation and biological balance',
          'Placement': 'Place on a sturdy, level surface away from direct harsh sunlight or extreme drafts',
          'Lighting': 'Gentle ambient room light or nano LED fixture supporting live botanical growth'
        };
      } else {
        p.habitatSetup = {};
      }
    }

    if (p.didYouKnow === undefined) {
      if (isFish) {
        if (p.subCategory === 'guppy') {
          p.didYouKnow = [
            'Guppies are renowned as "millionfish" due to their prolific breeding and astounding color diversity.',
            'Selective breeding over decades has produced distinctive fancy strains like Dumbo ear pectoral flutters and lace caudal patterns.'
          ];
        } else if (p.subCategory === 'betta') {
          p.didYouKnow = [
            'Bettas possess a specialized labyrinth organ enabling them to breathe atmospheric air directly from the water surface.',
            'Each betta has a unique interactive personality and quickly learns to recognize its keeper during feeding time.'
          ];
        } else if (p.subCategory === 'molly') {
          p.didYouKnow = [
            'Mollies perform natural cleanup duty in planted aquariums by gently grazing surface biofilm and hair algae.',
            'They are highly adaptable euryhaline fish that thrive in freshwater, hard water, and even light brackish setups.'
          ];
        } else if (p.subCategory === 'shrimps') {
          p.didYouKnow = [
            'Crystal Red Shrimps originate from a rare red mutation of wild Bee Shrimp discovered in Japan in the 1990s.',
            'They molt their exoskeleton as they grow, during which they hide in mosses until their new shell hardens.'
          ];
        } else {
          p.didYouKnow = [
            'All Fish Tales aquatic specimens are fully quarantined and conditioned before dispatch.'
          ];
        }
      } else if (isIsopod) {
        p.didYouKnow = [
          'Isopods are terrestrial crustaceans—not insects—and breathe using specialized pleopodal lungs requiring moisture.',
          'They form the vital backbone of bioactive setups by breaking down mold, waste, and shed organic material.'
        ];
      } else if (isTarantula) {
        p.didYouKnow = [
          'New World tarantulas possess urticating hairs on their abdomen used as a passive defense mechanism against predators in nature.',
          'Slings molt regularly as they grow, shedding their entire outer exoskeleton and emerging with renewed vibrant coloration.'
        ];
      } else if (isCombo) {
        p.didYouKnow = [
          'Bioactive closed-loop habitats create self-sustaining micro-ecosystems where plants, micro-fauna, and custodial cleaners thrive harmoniously.',
          'All kit components are hand-selected, cleaned, and balanced by Fish Tales biologists for immediate plug-and-play enjoyment.'
        ];
      } else {
        p.didYouKnow = [];
      }
    }
  }

  function getProductSelectedVariant(product) {
    if (!product) return { name: '', price: 0, unit: 'piece', label: 'piece' };
    initProductVariantsAndSpecs(product);
    return {
      name: product.name,
      price: Number(product.price || 0),
      unit: product.unit || product.pricingUnit || 'piece',
      label: product.unit || product.pricingUnit || 'piece'
    };
  }

  /* ── 3. Master Product Catalogue (Standardized Schema) ───── */
  const PRODUCTS = [
    {
      id: "guppy-red-lace",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "Red Lace Guppy",
      subtitle: "Poecilia reticulata",
      image: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Cobra_Guppy_%28Poecilia_reticulata%29.JPG",
      images: [],
      video: "",
      description: "Intricate red lace-patterned caudal fin with iridescent body tones. Captive bred and peaceful in planted community tanks.",
      price: 250,
      unit: "pair",
      minQuantity: 1,
      specs: {
      "care": "Beginner / Community",
      "temp": "22°C – 28°C",
      "diet": "Micro-pellets & live/frozen daphnia",
      "habitat": "Planted freshwater aquarium",
      "size": "Adult Pair (1 Male + 1 Female)"
},
      overview: "The Red Lace Guppy (Poecilia reticulata) is an exquisite livebearing freshwater fish prized for its vibrant coloration, intricate tail patterns, and peaceful demeanor in planted aquariums.",
      careRequirements: {
      "Difficulty": "Beginner / Community",
      "Water Temp": "22°C – 28°C",
      "Diet": "Micro-pellets & live/frozen daphnia",
      "Lifespan": "2 – 3 years",
      "pH Range": "6.8 – 7.8",
      "Hardness": "Medium to hard (8–12 dGH)"
},
      habitatSetup: {
      "Aquarium Size": "Minimum 10 gallons for active pairs or colonies",
      "Substrate": "Fine gravel or dark aquatic soil to highlight iridescent coloration",
      "Filtration & Flow": "Gentle sponge or internal filter to protect delicate flowing fins",
      "Plants & Decor": "Dense live plants like Java Moss, Hornwort, and Anubias for shelter"
},
      didYouKnow: [
      "Guppies are renowned as \"millionfish\" due to their prolific breeding and astounding color diversity.",
      "Selective breeding over decades has produced distinctive fancy strains like Dumbo ear pectoral flutters and lace caudal patterns."
],
      featured: true
    },
    {
      id: "guppy-gold-dumbo-ear",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "Gold Dumbo Ear Guppy",
      subtitle: "Poecilia reticulata",
      image: "https://upload.wikimedia.org/wikipedia/commons/7/78/Poecilia_retic_090519-8688_kdBdk.jpg",
      images: [],
      video: "",
      description: "Lustrous golden body with enlarged, prominent \"dumbo ear\" pectoral fins creating a graceful flutter in planted tanks.",
      price: 280,
      unit: "pair",
      minQuantity: 1,
      specs: {
      "care": "Beginner / Community",
      "temp": "22°C – 28°C",
      "diet": "Micro-pellets & live/frozen daphnia",
      "habitat": "Planted freshwater aquarium",
      "size": "Adult Pair"
},
      overview: "The Gold Dumbo Ear Guppy (Poecilia reticulata) is an exquisite livebearing freshwater fish prized for its vibrant coloration, intricate tail patterns, and peaceful demeanor in planted aquariums.",
      careRequirements: {
      "Difficulty": "Beginner / Community",
      "Water Temp": "22°C – 28°C",
      "Diet": "Micro-pellets & live/frozen daphnia",
      "Lifespan": "2 – 3 years",
      "pH Range": "6.8 – 7.8",
      "Hardness": "Medium to hard (8–12 dGH)"
},
      habitatSetup: {
      "Aquarium Size": "Minimum 10 gallons for active pairs or colonies",
      "Substrate": "Fine gravel or dark aquatic soil to highlight iridescent coloration",
      "Filtration & Flow": "Gentle sponge or internal filter to protect delicate flowing fins",
      "Plants & Decor": "Dense live plants like Java Moss, Hornwort, and Anubias for shelter"
},
      didYouKnow: [
      "Guppies are renowned as \"millionfish\" due to their prolific breeding and astounding color diversity.",
      "Selective breeding over decades has produced distinctive fancy strains like Dumbo ear pectoral flutters and lace caudal patterns."
],
      featured: false
    },
    {
      id: "guppy-santacruz-dumbo-ear",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "Santacruz Dumbo Ear Guppy",
      subtitle: "Poecilia reticulata",
      image: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Poecilia_reticulata_%28male%29.JPG",
      images: [],
      video: "",
      description: "Striking Santacruz lineage showcasing oversized dumbo ears, iridescent cobalt-blue coloration, and active schooling behavior.",
      price: 250,
      unit: "pair",
      minQuantity: 1,
      specs: {
      "care": "Beginner / Community",
      "temp": "22°C – 28°C",
      "diet": "Micro-pellets & live/frozen daphnia",
      "habitat": "Planted freshwater aquarium",
      "size": "Adult Pair"
},
      overview: "The Santacruz Dumbo Ear Guppy (Poecilia reticulata) is an exquisite livebearing freshwater fish prized for its vibrant coloration, intricate tail patterns, and peaceful demeanor in planted aquariums.",
      careRequirements: {
      "Difficulty": "Beginner / Community",
      "Water Temp": "22°C – 28°C",
      "Diet": "Micro-pellets & live/frozen daphnia",
      "Lifespan": "2 – 3 years",
      "pH Range": "6.8 – 7.8",
      "Hardness": "Medium to hard (8–12 dGH)"
},
      habitatSetup: {
      "Aquarium Size": "Minimum 10 gallons for active pairs or colonies",
      "Substrate": "Fine gravel or dark aquatic soil to highlight iridescent coloration",
      "Filtration & Flow": "Gentle sponge or internal filter to protect delicate flowing fins",
      "Plants & Decor": "Dense live plants like Java Moss, Hornwort, and Anubias for shelter"
},
      didYouKnow: [
      "Guppies are renowned as \"millionfish\" due to their prolific breeding and astounding color diversity.",
      "Selective breeding over decades has produced distinctive fancy strains like Dumbo ear pectoral flutters and lace caudal patterns."
],
      featured: false
    },
    {
      id: "guppy-platinum-dumbo-halfmoon",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "Platinum Dumbo Ear Halfmoon Guppy",
      subtitle: "Poecilia reticulata",
      image: "https://upload.wikimedia.org/wikipedia/commons/a/af/Poecilia_reticulata_01.jpg",
      images: [],
      video: "",
      description: "Full 180-degree halfmoon caudal fin with gleaming platinum-white scales and grand dumbo pectoral ears.",
      price: 280,
      unit: "pair",
      minQuantity: 1,
      specs: {
      "care": "Beginner / Community",
      "temp": "22°C – 28°C",
      "diet": "Micro-pellets & live/frozen daphnia",
      "habitat": "Planted freshwater aquarium",
      "size": "Adult Pair"
},
      overview: "The Platinum Dumbo Ear Halfmoon Guppy (Poecilia reticulata) is an exquisite livebearing freshwater fish prized for its vibrant coloration, intricate tail patterns, and peaceful demeanor in planted aquariums.",
      careRequirements: {
      "Difficulty": "Beginner / Community",
      "Water Temp": "22°C – 28°C",
      "Diet": "Micro-pellets & live/frozen daphnia",
      "Lifespan": "2 – 3 years",
      "pH Range": "6.8 – 7.8",
      "Hardness": "Medium to hard (8–12 dGH)"
},
      habitatSetup: {
      "Aquarium Size": "Minimum 10 gallons for active pairs or colonies",
      "Substrate": "Fine gravel or dark aquatic soil to highlight iridescent coloration",
      "Filtration & Flow": "Gentle sponge or internal filter to protect delicate flowing fins",
      "Plants & Decor": "Dense live plants like Java Moss, Hornwort, and Anubias for shelter"
},
      didYouKnow: [
      "Guppies are renowned as \"millionfish\" due to their prolific breeding and astounding color diversity.",
      "Selective breeding over decades has produced distinctive fancy strains like Dumbo ear pectoral flutters and lace caudal patterns."
],
      featured: true
    },
    {
      id: "guppy-blue-dragon-dumbo-halfmoon",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "Blue Dragon Dumbo Ear Halfmoon Guppy",
      subtitle: "Poecilia reticulata",
      image: "https://images.unsplash.com/photo-1520989244660-118e51ae94bc?auto=format&fit=crop&w=600&q=80",
      images: [],
      video: "",
      description: "Rich royal blue metallic dorsal and halfmoon tail paired with grand dumbo ear fins. Centerpiece display fish.",
      price: 280,
      unit: "pair",
      minQuantity: 1,
      specs: {
      "care": "Beginner / Community",
      "temp": "22°C – 28°C",
      "diet": "Micro-pellets & live/frozen daphnia",
      "habitat": "Planted freshwater aquarium",
      "size": "Adult Pair"
},
      overview: "The Blue Dragon Dumbo Ear Halfmoon Guppy (Poecilia reticulata) is an exquisite livebearing freshwater fish prized for its vibrant coloration, intricate tail patterns, and peaceful demeanor in planted aquariums.",
      careRequirements: {
      "Difficulty": "Beginner / Community",
      "Water Temp": "22°C – 28°C",
      "Diet": "Micro-pellets & live/frozen daphnia",
      "Lifespan": "2 – 3 years",
      "pH Range": "6.8 – 7.8",
      "Hardness": "Medium to hard (8–12 dGH)"
},
      habitatSetup: {
      "Aquarium Size": "Minimum 10 gallons for active pairs or colonies",
      "Substrate": "Fine gravel or dark aquatic soil to highlight iridescent coloration",
      "Filtration & Flow": "Gentle sponge or internal filter to protect delicate flowing fins",
      "Plants & Decor": "Dense live plants like Java Moss, Hornwort, and Anubias for shelter"
},
      didYouKnow: [
      "Guppies are renowned as \"millionfish\" due to their prolific breeding and astounding color diversity.",
      "Selective breeding over decades has produced distinctive fancy strains like Dumbo ear pectoral flutters and lace caudal patterns."
],
      featured: true
    },
    {
      id: "guppy-moscow-black-dumbo",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "Moscow Black Dumbo Ear Guppy",
      subtitle: "Poecilia reticulata",
      image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=600&q=80",
      images: [],
      video: "",
      description: "Deep velvet-black coloration spanning from snout to tail, contrasted by delicate fluttery dumbo pectoral fins.",
      price: 250,
      unit: "pair",
      minQuantity: 1,
      specs: {
      "care": "Beginner / Community",
      "temp": "22°C – 28°C",
      "diet": "Micro-pellets & live/frozen daphnia",
      "habitat": "Planted freshwater aquarium",
      "size": "Adult Pair"
},
      overview: "The Moscow Black Dumbo Ear Guppy (Poecilia reticulata) is an exquisite livebearing freshwater fish prized for its vibrant coloration, intricate tail patterns, and peaceful demeanor in planted aquariums.",
      careRequirements: {
      "Difficulty": "Beginner / Community",
      "Water Temp": "22°C – 28°C",
      "Diet": "Micro-pellets & live/frozen daphnia",
      "Lifespan": "2 – 3 years",
      "pH Range": "6.8 – 7.8",
      "Hardness": "Medium to hard (8–12 dGH)"
},
      habitatSetup: {
      "Aquarium Size": "Minimum 10 gallons for active pairs or colonies",
      "Substrate": "Fine gravel or dark aquatic soil to highlight iridescent coloration",
      "Filtration & Flow": "Gentle sponge or internal filter to protect delicate flowing fins",
      "Plants & Decor": "Dense live plants like Java Moss, Hornwort, and Anubias for shelter"
},
      didYouKnow: [
      "Guppies are renowned as \"millionfish\" due to their prolific breeding and astounding color diversity.",
      "Selective breeding over decades has produced distinctive fancy strains like Dumbo ear pectoral flutters and lace caudal patterns."
],
      featured: false
    },
    {
      id: "guppy-afr-big-dorsal",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "AFR Big Dorsal Guppy",
      subtitle: "Poecilia reticulata",
      image: "https://images.unsplash.com/photo-1548262323-694280fdc967?auto=format&fit=crop&w=600&q=80",
      images: [],
      video: "",
      description: "Prized Albino Full Red (AFR) genetics with an extravagant, sail-like big dorsal fin and ruby-red eyes.",
      price: 300,
      unit: "pair",
      minQuantity: 1,
      specs: {
      "care": "Beginner / Community",
      "temp": "22°C – 28°C",
      "diet": "Micro-pellets & live/frozen daphnia",
      "habitat": "Planted freshwater aquarium",
      "size": "Adult Pair"
},
      overview: "The AFR Big Dorsal Guppy (Poecilia reticulata) is an exquisite livebearing freshwater fish prized for its vibrant coloration, intricate tail patterns, and peaceful demeanor in planted aquariums.",
      careRequirements: {
      "Difficulty": "Beginner / Community",
      "Water Temp": "22°C – 28°C",
      "Diet": "Micro-pellets & live/frozen daphnia",
      "Lifespan": "2 – 3 years",
      "pH Range": "6.8 – 7.8",
      "Hardness": "Medium to hard (8–12 dGH)"
},
      habitatSetup: {
      "Aquarium Size": "Minimum 10 gallons for active pairs or colonies",
      "Substrate": "Fine gravel or dark aquatic soil to highlight iridescent coloration",
      "Filtration & Flow": "Gentle sponge or internal filter to protect delicate flowing fins",
      "Plants & Decor": "Dense live plants like Java Moss, Hornwort, and Anubias for shelter"
},
      didYouKnow: [
      "Guppies are renowned as \"millionfish\" due to their prolific breeding and astounding color diversity.",
      "Selective breeding over decades has produced distinctive fancy strains like Dumbo ear pectoral flutters and lace caudal patterns."
],
      featured: true
    },
    {
      id: "guppy-dark-knight-dragon-dumbo",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "Dark Knight Dragon Dumbo Ear Guppy",
      subtitle: "Poecilia reticulata",
      image: "https://images.unsplash.com/photo-1553986187-9cb16fa33483?auto=format&fit=crop&w=600&q=80",
      images: [],
      video: "",
      description: "Dark dramatic dragon scales with violet and navy undertones, complemented by fluttering dumbo ears.",
      price: 280,
      unit: "pair",
      minQuantity: 1,
      specs: {
      "care": "Beginner / Community",
      "temp": "22°C – 28°C",
      "diet": "Micro-pellets & live/frozen daphnia",
      "habitat": "Planted freshwater aquarium",
      "size": "Adult Pair"
},
      overview: "The Dark Knight Dragon Dumbo Ear Guppy (Poecilia reticulata) is an exquisite livebearing freshwater fish prized for its vibrant coloration, intricate tail patterns, and peaceful demeanor in planted aquariums.",
      careRequirements: {
      "Difficulty": "Beginner / Community",
      "Water Temp": "22°C – 28°C",
      "Diet": "Micro-pellets & live/frozen daphnia",
      "Lifespan": "2 – 3 years",
      "pH Range": "6.8 – 7.8",
      "Hardness": "Medium to hard (8–12 dGH)"
},
      habitatSetup: {
      "Aquarium Size": "Minimum 10 gallons for active pairs or colonies",
      "Substrate": "Fine gravel or dark aquatic soil to highlight iridescent coloration",
      "Filtration & Flow": "Gentle sponge or internal filter to protect delicate flowing fins",
      "Plants & Decor": "Dense live plants like Java Moss, Hornwort, and Anubias for shelter"
},
      didYouKnow: [
      "Guppies are renowned as \"millionfish\" due to their prolific breeding and astounding color diversity.",
      "Selective breeding over decades has produced distinctive fancy strains like Dumbo ear pectoral flutters and lace caudal patterns."
],
      featured: false
    },
    {
      id: "guppy-red-platinum-koi-dumbo",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "Red Platinum Koi Dumbo Ear Guppy",
      subtitle: "Poecilia reticulata",
      image: "https://images.unsplash.com/photo-1500909001949-1fc0780d81c9?auto=format&fit=crop&w=600&q=80",
      images: [],
      video: "",
      description: "Classic red and platinum koi-styled color patterns with translucent big dumbo ears. Active and hardy.",
      price: 280,
      unit: "pair",
      minQuantity: 1,
      specs: {
      "care": "Beginner / Community",
      "temp": "22°C – 28°C",
      "diet": "Micro-pellets & live/frozen daphnia",
      "habitat": "Planted freshwater aquarium",
      "size": "Adult Pair"
},
      overview: "The Red Platinum Koi Dumbo Ear Guppy (Poecilia reticulata) is an exquisite livebearing freshwater fish prized for its vibrant coloration, intricate tail patterns, and peaceful demeanor in planted aquariums.",
      careRequirements: {
      "Difficulty": "Beginner / Community",
      "Water Temp": "22°C – 28°C",
      "Diet": "Micro-pellets & live/frozen daphnia",
      "Lifespan": "2 – 3 years",
      "pH Range": "6.8 – 7.8",
      "Hardness": "Medium to hard (8–12 dGH)"
},
      habitatSetup: {
      "Aquarium Size": "Minimum 10 gallons for active pairs or colonies",
      "Substrate": "Fine gravel or dark aquatic soil to highlight iridescent coloration",
      "Filtration & Flow": "Gentle sponge or internal filter to protect delicate flowing fins",
      "Plants & Decor": "Dense live plants like Java Moss, Hornwort, and Anubias for shelter"
},
      didYouKnow: [
      "Guppies are renowned as \"millionfish\" due to their prolific breeding and astounding color diversity.",
      "Selective breeding over decades has produced distinctive fancy strains like Dumbo ear pectoral flutters and lace caudal patterns."
],
      featured: false
    },
    {
      id: "guppy-magenta-red-tiger",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "Magenta Red Tiger Guppy",
      subtitle: "Poecilia reticulata",
      image: "https://images.unsplash.com/photo-1538719501547-bc023056a8b6?auto=format&fit=crop&w=600&q=80",
      images: [],
      video: "",
      description: "Bold tiger bar stripes over vibrant magenta-red body. Energetic swimmer that thrives in planted aquascapes.",
      price: 250,
      unit: "pair",
      minQuantity: 1,
      specs: {
      "care": "Beginner / Community",
      "temp": "22°C – 28°C",
      "diet": "Micro-pellets & live/frozen daphnia",
      "habitat": "Planted freshwater aquarium",
      "size": "Adult Pair"
},
      overview: "The Magenta Red Tiger Guppy (Poecilia reticulata) is an exquisite livebearing freshwater fish prized for its vibrant coloration, intricate tail patterns, and peaceful demeanor in planted aquariums.",
      careRequirements: {
      "Difficulty": "Beginner / Community",
      "Water Temp": "22°C – 28°C",
      "Diet": "Micro-pellets & live/frozen daphnia",
      "Lifespan": "2 – 3 years",
      "pH Range": "6.8 – 7.8",
      "Hardness": "Medium to hard (8–12 dGH)"
},
      habitatSetup: {
      "Aquarium Size": "Minimum 10 gallons for active pairs or colonies",
      "Substrate": "Fine gravel or dark aquatic soil to highlight iridescent coloration",
      "Filtration & Flow": "Gentle sponge or internal filter to protect delicate flowing fins",
      "Plants & Decor": "Dense live plants like Java Moss, Hornwort, and Anubias for shelter"
},
      didYouKnow: [
      "Guppies are renowned as \"millionfish\" due to their prolific breeding and astounding color diversity.",
      "Selective breeding over decades has produced distinctive fancy strains like Dumbo ear pectoral flutters and lace caudal patterns."
],
      featured: false
    },
    {
      id: "guppy-white-tuxido",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "White Tuxido Guppy",
      subtitle: "Poecilia reticulata",
      image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80",
      images: [],
      video: "",
      description: "Crisp white caudal fin contrasted with a deep midnight tuxedo torso. Highly prolific and peaceful.",
      price: 250,
      unit: "pair",
      minQuantity: 1,
      specs: {
      "care": "Beginner / Community",
      "temp": "22°C – 28°C",
      "diet": "Micro-pellets & live/frozen daphnia",
      "habitat": "Planted freshwater aquarium",
      "size": "Adult Pair"
},
      overview: "The White Tuxido Guppy (Poecilia reticulata) is an exquisite livebearing freshwater fish prized for its vibrant coloration, intricate tail patterns, and peaceful demeanor in planted aquariums.",
      careRequirements: {
      "Difficulty": "Beginner / Community",
      "Water Temp": "22°C – 28°C",
      "Diet": "Micro-pellets & live/frozen daphnia",
      "Lifespan": "2 – 3 years",
      "pH Range": "6.8 – 7.8",
      "Hardness": "Medium to hard (8–12 dGH)"
},
      habitatSetup: {
      "Aquarium Size": "Minimum 10 gallons for active pairs or colonies",
      "Substrate": "Fine gravel or dark aquatic soil to highlight iridescent coloration",
      "Filtration & Flow": "Gentle sponge or internal filter to protect delicate flowing fins",
      "Plants & Decor": "Dense live plants like Java Moss, Hornwort, and Anubias for shelter"
},
      didYouKnow: [
      "Guppies are renowned as \"millionfish\" due to their prolific breeding and astounding color diversity.",
      "Selective breeding over decades has produced distinctive fancy strains like Dumbo ear pectoral flutters and lace caudal patterns."
],
      featured: false
    },
    {
      id: "guppy-silverado-red-dragon",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "Silverado Red Dragon Guppy",
      subtitle: "Poecilia reticulata",
      image: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Guppy_-_Poecilia_reticulata.jpg",
      images: [],
      video: "",
      description: "Silvery metallic chest transitioning into a fierce red dragon-patterned tail fin. Stunning light-reflective sheen.",
      price: 280,
      unit: "pair",
      minQuantity: 1,
      specs: {
      "care": "Beginner / Community",
      "temp": "22°C – 28°C",
      "diet": "Micro-pellets & live/frozen daphnia",
      "habitat": "Planted freshwater aquarium",
      "size": "Adult Pair"
},
      overview: "The Silverado Red Dragon Guppy (Poecilia reticulata) is an exquisite livebearing freshwater fish prized for its vibrant coloration, intricate tail patterns, and peaceful demeanor in planted aquariums.",
      careRequirements: {
      "Difficulty": "Beginner / Community",
      "Water Temp": "22°C – 28°C",
      "Diet": "Micro-pellets & live/frozen daphnia",
      "Lifespan": "2 – 3 years",
      "pH Range": "6.8 – 7.8",
      "Hardness": "Medium to hard (8–12 dGH)"
},
      habitatSetup: {
      "Aquarium Size": "Minimum 10 gallons for active pairs or colonies",
      "Substrate": "Fine gravel or dark aquatic soil to highlight iridescent coloration",
      "Filtration & Flow": "Gentle sponge or internal filter to protect delicate flowing fins",
      "Plants & Decor": "Dense live plants like Java Moss, Hornwort, and Anubias for shelter"
},
      didYouKnow: [
      "Guppies are renowned as \"millionfish\" due to their prolific breeding and astounding color diversity.",
      "Selective breeding over decades has produced distinctive fancy strains like Dumbo ear pectoral flutters and lace caudal patterns."
],
      featured: false
    },
    {
      id: "guppy-green-moscow",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "Green Moscow Guppy",
      subtitle: "Poecilia reticulata",
      image: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Poecilia_reticulata_-_Guppy%2C_male%2C_cobra-green_morph.jpg",
      images: [],
      video: "",
      description: "Deep emerald-green metallic sheen covering head to tail. An all-time legendary strain for planted aquariums.",
      price: 250,
      unit: "pair",
      minQuantity: 1,
      specs: {
      "care": "Beginner / Community",
      "temp": "22°C – 28°C",
      "diet": "Micro-pellets & live/frozen daphnia",
      "habitat": "Planted freshwater aquarium",
      "size": "Adult Pair"
},
      overview: "The Green Moscow Guppy (Poecilia reticulata) is an exquisite livebearing freshwater fish prized for its vibrant coloration, intricate tail patterns, and peaceful demeanor in planted aquariums.",
      careRequirements: {
      "Difficulty": "Beginner / Community",
      "Water Temp": "22°C – 28°C",
      "Diet": "Micro-pellets & live/frozen daphnia",
      "Lifespan": "2 – 3 years",
      "pH Range": "6.8 – 7.8",
      "Hardness": "Medium to hard (8–12 dGH)"
},
      habitatSetup: {
      "Aquarium Size": "Minimum 10 gallons for active pairs or colonies",
      "Substrate": "Fine gravel or dark aquatic soil to highlight iridescent coloration",
      "Filtration & Flow": "Gentle sponge or internal filter to protect delicate flowing fins",
      "Plants & Decor": "Dense live plants like Java Moss, Hornwort, and Anubias for shelter"
},
      didYouKnow: [
      "Guppies are renowned as \"millionfish\" due to their prolific breeding and astounding color diversity.",
      "Selective breeding over decades has produced distinctive fancy strains like Dumbo ear pectoral flutters and lace caudal patterns."
],
      featured: false
    },
    {
      id: "show-grade-betta",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "betta",
      name: "Show Grade Betta Fish",
      subtitle: "Betta splendens",
      image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Betta-splendens-male.jpg",
      images: [],
      video: "",
      description: "Hand-selected healthy Betta splendens featuring vibrant color iridescence and large flowing fins. Centerpiece display specimen.",
      price: 350,
      unit: "piece",
      minQuantity: 1,
      specs: {
      "care": "Beginner / Community",
      "temp": "22°C – 28°C",
      "diet": "Micro-pellets & live/frozen daphnia",
      "habitat": "Planted freshwater aquarium",
      "size": "Adult (5–6 cm)"
},
      overview: "The Show Grade Betta Fish is a majestic labyrinth fish displaying symmetrical finnage, vibrant iridescence, and intelligent personality. Each specimen is selected for health, vitality, and show-standard conformation.",
      careRequirements: {
      "Difficulty": "Beginner / Community",
      "Water Temp": "22°C – 28°C",
      "Diet": "Micro-pellets & live/frozen daphnia",
      "Lifespan": "3 – 5 years",
      "pH Range": "6.5 – 7.5",
      "Handling": "Do not house adult males together"
},
      habitatSetup: {
      "Aquarium Size": "5 to 10 gallons nano tank (avoid tiny unheated bowls)",
      "Filtration & Flow": "Low-flow filtration as heavy currents tire flowing fins",
      "Substrate": "Smooth dark sand or planted substrate",
      "Plants & Decor": "Broad-leaf live plants like Anubias providing rest spots near the surface"
},
      didYouKnow: [
      "Bettas possess a specialized labyrinth organ enabling them to breathe atmospheric air directly from the water surface.",
      "Each betta has a unique interactive personality and quickly learns to recognize its keeper during feeding time."
],
      featured: true
    },
    {
      id: "molly-golden",
      category: "aquarium",
      categoryName: "Molly Fish",
      subCategory: "molly",
      name: "Golden Molly",
      subtitle: "Poecilia sphenops var. Golden",
      image: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Gold_Molly_1.jpg",
      images: [],
      video: "",
      description: "Active and peaceful livebearer showcasing lustrous golden coloration. Thrives in planted community aquariums and grazes on natural biofilm.",
      price: 180,
      unit: "pair",
      minQuantity: 1,
      specs: {
      "care": "Beginner / Community",
      "temp": "22°C – 28°C",
      "diet": "Flakes, micro-pellets & vegetable matter",
      "habitat": "Planted freshwater aquarium",
      "size": "Adult Pair"
},
      overview: "The Golden Molly (Poecilia sphenops var. Golden) is an active, gregarious livebearer with radiant golden coloration. Renowned for grazing natural algae and thriving in planted community biotopes.",
      careRequirements: {
      "Difficulty": "Beginner / Community",
      "Water Temp": "22°C – 28°C",
      "Diet": "Flakes, micro-pellets & vegetable matter",
      "Lifespan": "3 – 5 years",
      "pH Range": "7.0 – 8.2",
      "Hardness": "Hard water preferred (10–25 dGH)"
},
      habitatSetup: {
      "Aquarium Size": "15–20 gallons or larger for active swimming pairs",
      "Substrate": "Aquatic soil or planted substrate supporting robust plant growth",
      "Filtration & Flow": "Moderate biological filtration with clean water maintenance",
      "Plants & Decor": "Ample swimming room combined with background stems (Vallisneria, Amazon Swords)"
},
      didYouKnow: [
      "Mollies perform natural cleanup duty in planted aquariums by gently grazing surface biofilm and hair algae.",
      "They are highly adaptable euryhaline fish that thrive in freshwater, hard water, and even light brackish setups."
],
      featured: true
    },
    {
      id: "shrimp-crystal-red",
      category: "aquarium",
      categoryName: "Shrimps",
      subCategory: "shrimps",
      name: "Crystal Red Shrimp",
      subtitle: "Caridina cf. cantonensis var. Crystal Red",
      image: "https://upload.wikimedia.org/wikipedia/commons/4/47/Caridina-cf-cantonensis-crystal-red.jpg",
      images: [],
      video: "",
      description: "Prized high-grade dwarf freshwater shrimp displaying vivid red and bright white bands. Gentle algae grazer ideal for nano planted tanks.",
      price: 150,
      unit: "piece",
      minQuantity: 1,
      specs: {
      "care": "Intermediate / Peaceful",
      "temp": "21°C – 25°C",
      "diet": "Biofilm, specialized shrimp pellets & blanched vegetables",
      "habitat": "Planted freshwater nano tank",
      "size": "Adult (2–2.5 cm)"
},
      overview: "The Crystal Red Shrimp (Caridina cf. cantonensis var. Crystal Red) is a premier dwarf freshwater invertebrate exhibiting striking opaque white and vivid red color banding. Exceptional algae grazer for planted aquascapes.",
      careRequirements: {
      "Difficulty": "Intermediate / Peaceful",
      "Water Temp": "21°C – 25°C",
      "Diet": "Biofilm, specialized shrimp pellets & blanched vegetables",
      "Lifespan": "1.5 – 2 years",
      "pH Range": "6.2 – 6.8",
      "TDS / GH": "TDS 110–140 ppm, GH 4–6"
},
      habitatSetup: {
      "Aquarium Size": "5 to 10 gallons mature planted nano tank",
      "Filtration & Flow": "Sponge filtration only to prevent shrimplets from being drawn into impellers",
      "Substrate": "Active buffering substrate maintaining slightly acidic pH",
      "Plants & Decor": "Cholla wood, Indian almond leaves, and dense mosses (Java, Christmas, Phoenix)"
},
      didYouKnow: [
      "Crystal Red Shrimps originate from a rare red mutation of wild Bee Shrimp discovered in Japan in the 1990s.",
      "They molt their exoskeleton as they grow, during which they hide in mosses until their new shell hardens."
],
      featured: true
    },
    {
      id: "armadillidium-gestroi",
      category: "isopods",
      categoryName: "Isopods",
      subCategory: "isopods",
      name: "Armadillidium Gestroi",
      subtitle: "Armadillidium gestroi",
      image: "https://upload.wikimedia.org/wikipedia/commons/9/95/Armadillidium_vulgare.jpg",
      images: [],
      video: "",
      description: "Striking Mediterranean pill bug known for its large size, bright yellow spotted dorsal plates, and vigorous vivarium janitorial skills.",
      price: 120,
      unit: "piece",
      minQuantity: 5,
      specs: {
      "care": "Bioactive Cleaners",
      "temp": "20°C – 26°C",
      "diet": "Leaf litter, decaying wood, calcium",
      "habitat": "Bioactive vivarium / enclosure"
},
      overview: "Armadillidium Gestroi (Armadillidium gestroi) is a prized terrestrial crustacean ideal as a clean-up crew (CUC) in bioactive terrariums or as a fascinating display colony.",
      careRequirements: {
      "Difficulty": "Beginner to Intermediate",
      "Temperature": "20°C – 26°C",
      "Humidity": "60% – 80% (moisture gradient required)",
      "Diet": "Leaf litter, decaying wood, calcium",
      "Lifespan": "2 – 3 years",
      "Handling": "Delicate live specimens; observe without excessive handling"
},
      habitatSetup: {
      "Enclosure": "Ventilated acrylic, glass, or plastic container with moisture retention",
      "Substrate": "Damp organic bioactive soil blend enriched with worm castings and crushed leaf litter",
      "Moisture Gradient": "One moist corner with damp sphagnum moss and one drier ventilating side",
      "Hiding Places": "Cork bark flats, decaying wood chunks, and natural lotus pods"
},
      didYouKnow: [
      "Isopods are terrestrial crustaceans—not insects—and breathe using specialized pleopodal lungs requiring moisture.",
      "They form the vital backbone of bioactive setups by breaking down mold, waste, and shed organic material."
],
      featured: true
    },
    {
      id: "cubaris-murina-orange",
      category: "isopods",
      categoryName: "Isopods",
      subCategory: "isopods",
      name: "Cubaris Murina Orange",
      subtitle: "Cubaris murina var. Orange",
      image: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Cubaris_murinaflorida.jpg",
      images: [],
      video: "",
      description: "Warm apricot-orange color morph. Hardy, highly active, and quick to establish a thriving custodial colony in humid vivariums.",
      price: 60,
      unit: "piece",
      minQuantity: 5,
      specs: {
      "care": "Bioactive Cleaners",
      "temp": "20°C – 26°C",
      "diet": "Leaf litter, decaying wood, calcium",
      "habitat": "Bioactive vivarium / enclosure"
},
      overview: "Cubaris Murina Orange (Cubaris murina var. Orange) is a prized terrestrial crustacean ideal as a clean-up crew (CUC) in bioactive terrariums or as a fascinating display colony.",
      careRequirements: {
      "Difficulty": "Beginner to Intermediate",
      "Temperature": "20°C – 26°C",
      "Humidity": "60% – 80% (moisture gradient required)",
      "Diet": "Leaf litter, decaying wood, calcium",
      "Lifespan": "2 – 3 years",
      "Handling": "Delicate live specimens; observe without excessive handling"
},
      habitatSetup: {
      "Enclosure": "Ventilated acrylic, glass, or plastic container with moisture retention",
      "Substrate": "Damp organic bioactive soil blend enriched with worm castings and crushed leaf litter",
      "Moisture Gradient": "One moist corner with damp sphagnum moss and one drier ventilating side",
      "Hiding Places": "Cork bark flats, decaying wood chunks, and natural lotus pods"
},
      didYouKnow: [
      "Isopods are terrestrial crustaceans—not insects—and breathe using specialized pleopodal lungs requiring moisture.",
      "They form the vital backbone of bioactive setups by breaking down mold, waste, and shed organic material."
],
      featured: false
    },
    {
      id: "cubaris-murina-glacier",
      category: "isopods",
      categoryName: "Isopods",
      subCategory: "isopods",
      name: "Cubaris Murina Glacier",
      subtitle: "Cubaris murina var. Glacier",
      image: "https://upload.wikimedia.org/wikipedia/commons/8/87/Cubaris_murinafloridatop.jpg",
      images: [],
      video: "",
      description: "Pristine white porcelain appearance with subtle translucent undertones. Excellent bioactive cleanup crew.",
      price: 70,
      unit: "piece",
      minQuantity: 5,
      specs: {
      "care": "Bioactive Cleaners",
      "temp": "20°C – 26°C",
      "diet": "Leaf litter, decaying wood, calcium",
      "habitat": "Bioactive vivarium / enclosure"
},
      overview: "Cubaris Murina Glacier (Cubaris murina var. Glacier) is a prized terrestrial crustacean ideal as a clean-up crew (CUC) in bioactive terrariums or as a fascinating display colony.",
      careRequirements: {
      "Difficulty": "Beginner to Intermediate",
      "Temperature": "20°C – 26°C",
      "Humidity": "60% – 80% (moisture gradient required)",
      "Diet": "Leaf litter, decaying wood, calcium",
      "Lifespan": "2 – 3 years",
      "Handling": "Delicate live specimens; observe without excessive handling"
},
      habitatSetup: {
      "Enclosure": "Ventilated acrylic, glass, or plastic container with moisture retention",
      "Substrate": "Damp organic bioactive soil blend enriched with worm castings and crushed leaf litter",
      "Moisture Gradient": "One moist corner with damp sphagnum moss and one drier ventilating side",
      "Hiding Places": "Cork bark flats, decaying wood chunks, and natural lotus pods"
},
      didYouKnow: [
      "Isopods are terrestrial crustaceans—not insects—and breathe using specialized pleopodal lungs requiring moisture.",
      "They form the vital backbone of bioactive setups by breaking down mold, waste, and shed organic material."
],
      featured: true
    },
    {
      id: "porcellionides-pruinosus-orange-pied",
      category: "isopods",
      categoryName: "Isopods",
      subCategory: "isopods",
      name: "Porcellionides pruinosus Orange Pied",
      subtitle: "Porcellionides pruinosus var. Orange Pied",
      image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Porcellionides_pruinosus_P1380341a.jpg",
      images: [],
      video: "",
      description: "Fast-moving, velvety powder-orange isopod with distinctive white pied patches. Superb detritivore for tropical enclosures.",
      price: 60,
      unit: "piece",
      minQuantity: 5,
      specs: {
      "care": "Bioactive Cleaners",
      "temp": "20°C – 26°C",
      "diet": "Leaf litter, decaying wood, calcium",
      "habitat": "Bioactive vivarium / enclosure"
},
      overview: "Porcellionides pruinosus Orange Pied (Porcellionides pruinosus var. Orange Pied) is a prized terrestrial crustacean ideal as a clean-up crew (CUC) in bioactive terrariums or as a fascinating display colony.",
      careRequirements: {
      "Difficulty": "Beginner to Intermediate",
      "Temperature": "20°C – 26°C",
      "Humidity": "60% – 80% (moisture gradient required)",
      "Diet": "Leaf litter, decaying wood, calcium",
      "Lifespan": "2 – 3 years",
      "Handling": "Delicate live specimens; observe without excessive handling"
},
      habitatSetup: {
      "Enclosure": "Ventilated acrylic, glass, or plastic container with moisture retention",
      "Substrate": "Damp organic bioactive soil blend enriched with worm castings and crushed leaf litter",
      "Moisture Gradient": "One moist corner with damp sphagnum moss and one drier ventilating side",
      "Hiding Places": "Cork bark flats, decaying wood chunks, and natural lotus pods"
},
      didYouKnow: [
      "Isopods are terrestrial crustaceans—not insects—and breathe using specialized pleopodal lungs requiring moisture.",
      "They form the vital backbone of bioactive setups by breaking down mold, waste, and shed organic material."
],
      featured: false
    },
    {
      id: "cubaris-sp-cappuccino",
      category: "isopods",
      categoryName: "Isopods",
      subCategory: "isopods",
      name: "Cubaris sp. Cappuccino",
      subtitle: "",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/18/Cubaris_nigroflava_172816253.jpg",
      images: [],
      video: "",
      description: "Ultra-rare collector isopod exhibiting warm espresso-brown skirts and a creamy dorsal stripe reminiscent of a barista cappuccino.",
      price: 600,
      unit: "piece",
      minQuantity: 5,
      specs: {
      "care": "Bioactive Cleaners",
      "temp": "20°C – 26°C",
      "diet": "Leaf litter, decaying wood, calcium",
      "habitat": "Bioactive vivarium / enclosure"
},
      overview: "",
      careRequirements: {},
      habitatSetup: "",
      didYouKnow: [],
      featured: true
    },
    {
      id: "cubaris-sp-cherry-blossom",
      category: "isopods",
      categoryName: "Isopods",
      subCategory: "isopods",
      name: "Cubaris sp. Cherry Blossom",
      subtitle: "Cubaris sp. Cherry Blossom",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/16/Cubaris_marmorata_171397510.jpg",
      images: [],
      video: "",
      description: "Exquisite pastel pink and creamy white hues mimicking delicate sakura blossoms. A prized gem among luxury isopod enthusiasts.",
      price: 750,
      unit: "piece",
      minQuantity: 5,
      specs: {
      "care": "Bioactive Cleaners",
      "temp": "20°C – 26°C",
      "diet": "Leaf litter, decaying wood, calcium",
      "habitat": "Bioactive vivarium / enclosure"
},
      overview: "Cubaris sp. Cherry Blossom (Cubaris sp. Cherry Blossom) is a prized terrestrial crustacean ideal as a clean-up crew (CUC) in bioactive terrariums or as a fascinating display colony.",
      careRequirements: {
      "Difficulty": "Beginner to Intermediate",
      "Temperature": "20°C – 26°C",
      "Humidity": "60% – 80% (moisture gradient required)",
      "Diet": "Leaf litter, decaying wood, calcium",
      "Lifespan": "2 – 3 years",
      "Handling": "Delicate live specimens; observe without excessive handling"
},
      habitatSetup: {
      "Enclosure": "Ventilated acrylic, glass, or plastic container with moisture retention",
      "Substrate": "Damp organic bioactive soil blend enriched with worm castings and crushed leaf litter",
      "Moisture Gradient": "One moist corner with damp sphagnum moss and one drier ventilating side",
      "Hiding Places": "Cork bark flats, decaying wood chunks, and natural lotus pods"
},
      didYouKnow: [
      "Isopods are terrestrial crustaceans—not insects—and breathe using specialized pleopodal lungs requiring moisture.",
      "They form the vital backbone of bioactive setups by breaking down mold, waste, and shed organic material."
],
      featured: true
    },
    {
      id: "armadillidium-peraccae",
      category: "isopods",
      categoryName: "Isopods",
      subCategory: "isopods",
      name: "Armadillidium Peraccae",
      subtitle: "Armadillidium peraccae",
      image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Armadillidium_vulgare_001.jpg",
      images: [],
      video: "",
      description: "Fascinating textured, bumpy slate-grey shell with high drought tolerance. Extremely resilient and fascinating to observe.",
      price: 150,
      unit: "piece",
      minQuantity: 5,
      specs: {
      "care": "Bioactive Cleaners",
      "temp": "20°C – 26°C",
      "diet": "Leaf litter, decaying wood, calcium",
      "habitat": "Bioactive vivarium / enclosure"
},
      overview: "Armadillidium Peraccae (Armadillidium peraccae) is a prized terrestrial crustacean ideal as a clean-up crew (CUC) in bioactive terrariums or as a fascinating display colony.",
      careRequirements: {
      "Difficulty": "Beginner to Intermediate",
      "Temperature": "20°C – 26°C",
      "Humidity": "60% – 80% (moisture gradient required)",
      "Diet": "Leaf litter, decaying wood, calcium",
      "Lifespan": "2 – 3 years",
      "Handling": "Delicate live specimens; observe without excessive handling"
},
      habitatSetup: {
      "Enclosure": "Ventilated acrylic, glass, or plastic container with moisture retention",
      "Substrate": "Damp organic bioactive soil blend enriched with worm castings and crushed leaf litter",
      "Moisture Gradient": "One moist corner with damp sphagnum moss and one drier ventilating side",
      "Hiding Places": "Cork bark flats, decaying wood chunks, and natural lotus pods"
},
      didYouKnow: [
      "Isopods are terrestrial crustaceans—not insects—and breathe using specialized pleopodal lungs requiring moisture.",
      "They form the vital backbone of bioactive setups by breaking down mold, waste, and shed organic material."
],
      featured: false
    },
    {
      id: "chilean-rose-hair",
      category: "tarantulas",
      categoryName: "Tarantulas",
      subCategory: "tarantulas",
      name: "Chilean Rose Hair",
      subtitle: "Grammostola rosea",
      image: "https://upload.wikimedia.org/wikipedia/commons/2/22/Grammostola_rosea_adult_weiblich.jpg",
      images: [],
      video: "",
      description: "Renowned for its calm, docile temperament and subtle pink carapace setae. The quintessential beginner New World tarantula.",
      price: 2199,
      unit: "specimen",
      minQuantity: 1,
      specs: {
      "care": "Low Maintenance",
      "temp": "23°C – 28°C",
      "diet": "Pinhead crickets & roach nymphs",
      "habitat": "Ventilated sling vial / enclosure",
      "size": "1–1.5 cm"
},
      overview: "The Chilean Rose Hair (Grammostola rosea) is a captivating New World tarantula renowned among exotic hobbyists for its striking appearance and low maintenance requirements.",
      careRequirements: {
      "Difficulty": "Low Maintenance",
      "Temperature": "23°C – 28°C",
      "Humidity": "55% – 70% with access to a shallow water dish",
      "Diet": "Pinhead crickets & roach nymphs",
      "Lifespan": "15 – 25 years (females), 4 – 6 years (males)",
      "Temperament": "New World terrestrial species; observe as display exotic"
},
      habitatSetup: {
      "Enclosure": "Ventilated sling vial or acrylic terrestrial terrarium with secure locking lid",
      "Substrate": "3–4 inches of dry to slightly damp coco fiber or peat blend for burrowing",
      "Hides & Decor": "Curved cork bark hide and small shallow water dish (for specimens over 2 cm)",
      "Ventilation": "Cross-ventilation holes to prevent stagnant humidity while retaining comfort"
},
      didYouKnow: [
      "New World tarantulas possess urticating hairs on their abdomen used as a passive defense mechanism against predators in nature.",
      "Slings molt regularly as they grow, shedding their entire outer exoskeleton and emerging with renewed vibrant coloration."
],
      featured: true
    },
    {
      id: "brazilian-whiteknee",
      category: "tarantulas",
      categoryName: "Tarantulas",
      subCategory: "tarantulas",
      name: "Brazilian Whiteknee",
      subtitle: "Acanthoscurria geniculata",
      image: "https://upload.wikimedia.org/wikipedia/commons/6/60/Acanthoscurria_geniculata%2C_female.jpg",
      images: [],
      video: "",
      description: "Bold contrast of jet-black legs adorned with striking snow-white knee bands. Highly active with an enthusiastic feeding response.",
      price: 2199,
      unit: "specimen",
      minQuantity: 1,
      specs: {
      "care": "Low Maintenance",
      "temp": "23°C – 28°C",
      "diet": "Pinhead crickets & roach nymphs",
      "habitat": "Ventilated sling vial / enclosure",
      "size": "1–1.5 cm"
},
      overview: "The Brazilian Whiteknee (Acanthoscurria geniculata) is a captivating New World tarantula renowned among exotic hobbyists for its striking appearance and low maintenance requirements.",
      careRequirements: {
      "Difficulty": "Low Maintenance",
      "Temperature": "23°C – 28°C",
      "Humidity": "55% – 70% with access to a shallow water dish",
      "Diet": "Pinhead crickets & roach nymphs",
      "Lifespan": "15 – 25 years (females), 4 – 6 years (males)",
      "Temperament": "New World terrestrial species; observe as display exotic"
},
      habitatSetup: {
      "Enclosure": "Ventilated sling vial or acrylic terrestrial terrarium with secure locking lid",
      "Substrate": "3–4 inches of dry to slightly damp coco fiber or peat blend for burrowing",
      "Hides & Decor": "Curved cork bark hide and small shallow water dish (for specimens over 2 cm)",
      "Ventilation": "Cross-ventilation holes to prevent stagnant humidity while retaining comfort"
},
      didYouKnow: [
      "New World tarantulas possess urticating hairs on their abdomen used as a passive defense mechanism against predators in nature.",
      "Slings molt regularly as they grow, shedding their entire outer exoskeleton and emerging with renewed vibrant coloration."
],
      featured: true
    },
    {
      id: "mexican-red-knee",
      category: "tarantulas",
      categoryName: "Tarantulas",
      subCategory: "tarantulas",
      name: "Mexican Red Knee",
      subtitle: "Brachypelma hamorii",
      image: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Brachypelma_edit.jpg",
      images: [],
      video: "",
      description: "World-famous display species showcasing fiery orange-red leg joints and deep black velvety body. Very docile and long-lived.",
      price: 2399,
      unit: "specimen",
      minQuantity: 1,
      specs: {
      "care": "Low Maintenance",
      "temp": "23°C – 28°C",
      "diet": "Pinhead crickets & roach nymphs",
      "habitat": "Ventilated sling vial / enclosure",
      "size": "1–1.5 cm"
},
      overview: "The Mexican Red Knee (Brachypelma hamorii) is a captivating New World tarantula renowned among exotic hobbyists for its striking appearance and low maintenance requirements.",
      careRequirements: {
      "Difficulty": "Low Maintenance",
      "Temperature": "23°C – 28°C",
      "Humidity": "55% – 70% with access to a shallow water dish",
      "Diet": "Pinhead crickets & roach nymphs",
      "Lifespan": "15 – 25 years (females), 4 – 6 years (males)",
      "Temperament": "New World terrestrial species; observe as display exotic"
},
      habitatSetup: {
      "Enclosure": "Ventilated sling vial or acrylic terrestrial terrarium with secure locking lid",
      "Substrate": "3–4 inches of dry to slightly damp coco fiber or peat blend for burrowing",
      "Hides & Decor": "Curved cork bark hide and small shallow water dish (for specimens over 2 cm)",
      "Ventilation": "Cross-ventilation holes to prevent stagnant humidity while retaining comfort"
},
      didYouKnow: [
      "New World tarantulas possess urticating hairs on their abdomen used as a passive defense mechanism against predators in nature.",
      "Slings molt regularly as they grow, shedding their entire outer exoskeleton and emerging with renewed vibrant coloration."
],
      featured: true
    },
    {
      id: "green-bottle-blue",
      category: "tarantulas",
      categoryName: "Tarantulas",
      subCategory: "tarantulas",
      name: "Green Bottle Blue (GBB)",
      subtitle: "Chromatopelma cyaneopubescens",
      image: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Chromatopelma_cyaneopubescens.jpg",
      images: [],
      video: "",
      description: "Spectacular electric blue legs, metallic emerald-green carapace, and vibrant tiger-striped abdomen. Prolific heavy webber.",
      price: 4799,
      unit: "specimen",
      minQuantity: 1,
      specs: {
      "care": "Low Maintenance",
      "temp": "23°C – 28°C",
      "diet": "Pinhead crickets & roach nymphs",
      "habitat": "Ventilated sling vial / enclosure",
      "size": "1–1.5 cm"
},
      overview: "The Green Bottle Blue (GBB) (Chromatopelma cyaneopubescens) is a captivating New World tarantula renowned among exotic hobbyists for its striking appearance and low maintenance requirements.",
      careRequirements: {
      "Difficulty": "Low Maintenance",
      "Temperature": "23°C – 28°C",
      "Humidity": "55% – 70% with access to a shallow water dish",
      "Diet": "Pinhead crickets & roach nymphs",
      "Lifespan": "15 – 25 years (females), 4 – 6 years (males)",
      "Temperament": "New World terrestrial species; observe as display exotic"
},
      habitatSetup: {
      "Enclosure": "Ventilated sling vial or acrylic terrestrial terrarium with secure locking lid",
      "Substrate": "3–4 inches of dry to slightly damp coco fiber or peat blend for burrowing",
      "Hides & Decor": "Curved cork bark hide and small shallow water dish (for specimens over 2 cm)",
      "Ventilation": "Cross-ventilation holes to prevent stagnant humidity while retaining comfort"
},
      didYouKnow: [
      "New World tarantulas possess urticating hairs on their abdomen used as a passive defense mechanism against predators in nature.",
      "Slings molt regularly as they grow, shedding their entire outer exoskeleton and emerging with renewed vibrant coloration."
],
      featured: true
    },
    {
      id: "chaco-golden-knee",
      category: "tarantulas",
      categoryName: "Tarantulas",
      subCategory: "tarantulas",
      name: "Chaco Golden Knee",
      subtitle: "Grammostola pulchripes",
      image: "https://upload.wikimedia.org/wikipedia/commons/6/64/Grammostola_pulchripes_top_view.jpg",
      images: [],
      video: "",
      description: "Gentle giant famous for golden-yellow striped knee markings and calm demeanor. Highly recommended for enthusiastic beginners.",
      price: 1999,
      unit: "specimen",
      minQuantity: 1,
      specs: {
      "care": "Low Maintenance",
      "temp": "23°C – 28°C",
      "diet": "Pinhead crickets & roach nymphs",
      "habitat": "Ventilated sling vial / enclosure",
      "size": "1–1.5 cm"
},
      overview: "The Chaco Golden Knee (Grammostola pulchripes) is a captivating New World tarantula renowned among exotic hobbyists for its striking appearance and low maintenance requirements.",
      careRequirements: {
      "Difficulty": "Low Maintenance",
      "Temperature": "23°C – 28°C",
      "Humidity": "55% – 70% with access to a shallow water dish",
      "Diet": "Pinhead crickets & roach nymphs",
      "Lifespan": "15 – 25 years (females), 4 – 6 years (males)",
      "Temperament": "New World terrestrial species; observe as display exotic"
},
      habitatSetup: {
      "Enclosure": "Ventilated sling vial or acrylic terrestrial terrarium with secure locking lid",
      "Substrate": "3–4 inches of dry to slightly damp coco fiber or peat blend for burrowing",
      "Hides & Decor": "Curved cork bark hide and small shallow water dish (for specimens over 2 cm)",
      "Ventilation": "Cross-ventilation holes to prevent stagnant humidity while retaining comfort"
},
      didYouKnow: [
      "New World tarantulas possess urticating hairs on their abdomen used as a passive defense mechanism against predators in nature.",
      "Slings molt regularly as they grow, shedding their entire outer exoskeleton and emerging with renewed vibrant coloration."
],
      featured: false
    },
    {
      id: "salmon-pink",
      category: "tarantulas",
      categoryName: "Tarantulas",
      subCategory: "tarantulas",
      name: "Salmon Pink",
      subtitle: "Lasiodora parahybana",
      image: "https://upload.wikimedia.org/wikipedia/commons/8/89/Brazilian_Salmon_Pink_Birdeater.jpg",
      images: [],
      video: "",
      description: "One of the largest tarantula species in the world. Fast-growing established spiderling with salmon-pink hairs.",
      price: 3000,
      unit: "specimen",
      minQuantity: 1,
      specs: {
      "care": "Low Maintenance",
      "temp": "23°C – 28°C",
      "diet": "Pinhead crickets & roach nymphs",
      "habitat": "Ventilated sling vial / enclosure",
      "size": "1 inch"
},
      overview: "The Salmon Pink (Lasiodora parahybana) is a captivating New World tarantula renowned among exotic hobbyists for its striking appearance and low maintenance requirements.",
      careRequirements: {
      "Difficulty": "Low Maintenance",
      "Temperature": "23°C – 28°C",
      "Humidity": "55% – 70% with access to a shallow water dish",
      "Diet": "Pinhead crickets & roach nymphs",
      "Lifespan": "15 – 25 years (females), 4 – 6 years (males)",
      "Temperament": "New World terrestrial species; observe as display exotic"
},
      habitatSetup: {
      "Enclosure": "Ventilated sling vial or acrylic terrestrial terrarium with secure locking lid",
      "Substrate": "3–4 inches of dry to slightly damp coco fiber or peat blend for burrowing",
      "Hides & Decor": "Curved cork bark hide and small shallow water dish (for specimens over 2 cm)",
      "Ventilation": "Cross-ventilation holes to prevent stagnant humidity while retaining comfort"
},
      didYouKnow: [
      "New World tarantulas possess urticating hairs on their abdomen used as a passive defense mechanism against predators in nature.",
      "Slings molt regularly as they grow, shedding their entire outer exoskeleton and emerging with renewed vibrant coloration."
],
      featured: true
    },
    {
      id: "isopod-house-kit",
      category: "combo",
      categoryName: "Combo Packs",
      subCategory: "isopod-kit",
      name: "Isopod House Kit",
      subtitle: "Bioactive Glass Vivarium Kit",
      image: "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=800&q=80",
      images: [],
      video: "",
      description: "Complete glass bioactive habitat setup. Includes glass isopod house, live plants, substrate blend, lotus pod hide, food, and a starter culture of 6 Cubaris Glacier isopods.",
      price: 1545,
      unit: "kit",
      minQuantity: 1,
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
      overview: "The Isopod House Kit is an all-inclusive, curated complete biological setup designed by Fish Tales specialists. Includes premium glass enclosure, substrate, live specimens, and balanced essentials.",
      careRequirements: {
      "Setup Difficulty": "Beginner Friendly / Turnkey Kit",
      "Operating Temp": "Ambient Room Temp",
      "Maintenance": "Weekly misting or feeding as specified in care guidelines",
      "Included Components": "Glass Isopod House (5\" L × 5\" D × 5\" H + 2.5\" roof height), Fittonia albivenis (Patterned nerve plant), Hemigraphis sp. Pink (Purple waffle plant), Sheet Moss layer, Bioactive Isopod Substrate Blend, Lotus Pod (natural hide for isopods), Premium Isopod Food, Isopod Culture: 6 Cubaris sp. \"Glacier\""
},
      habitatSetup: {
      "Enclosure Construction": "High-clarity precision glass with optimal ventilation and biological balance",
      "Placement": "Place on a sturdy, level surface away from direct harsh sunlight or extreme drafts",
      "Lighting": "Gentle ambient room light or nano LED fixture supporting live botanical growth"
},
      didYouKnow: [
      "Bioactive closed-loop habitats create self-sustaining micro-ecosystems where plants, micro-fauna, and custodial cleaners thrive harmoniously.",
      "All kit components are hand-selected, cleaned, and balanced by Fish Tales biologists for immediate plug-and-play enjoyment."
],
      featured: true
    },
    {
      id: "half-cube-aquarium-kit",
      category: "combo",
      categoryName: "Combo Packs",
      subCategory: "aquarium-kit",
      name: "Half Cube Aquarium Kit",
      subtitle: "Nano Desktop Aquascape System",
      image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=800&q=80",
      images: [],
      video: "",
      description: "Desktop planted aquarium kit. Includes Half Cube aquarium, 1 healthy Betta fish, live aquatic plants, and premium sand substrate.",
      price: 999,
      unit: "kit",
      minQuantity: 1,
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
      overview: "The Half Cube Aquarium Kit is an all-inclusive, curated complete biological setup designed by Fish Tales specialists. Includes premium glass enclosure, substrate, live specimens, and balanced essentials.",
      careRequirements: {
      "Setup Difficulty": "Beginner Friendly / Turnkey Kit",
      "Operating Temp": "Ambient Room Temp",
      "Maintenance": "Weekly misting or feeding as specified in care guidelines",
      "Included Components": "Half Cube Aquarium, 1 beautiful Betta Fish, Live aquatic plants, Premium sand substrate"
},
      habitatSetup: {
      "Enclosure Construction": "High-clarity precision glass with optimal ventilation and biological balance",
      "Placement": "Place on a sturdy, level surface away from direct harsh sunlight or extreme drafts",
      "Lighting": "Gentle ambient room light or nano LED fixture supporting live botanical growth"
},
      didYouKnow: [
      "Bioactive closed-loop habitats create self-sustaining micro-ecosystems where plants, micro-fauna, and custodial cleaners thrive harmoniously.",
      "All kit components are hand-selected, cleaned, and balanced by Fish Tales biologists for immediate plug-and-play enjoyment."
],
      featured: true
    },
    {
      id: "glacier-colony-pack",
      category: "combo",
      categoryName: "Combo Packs",
      subCategory: "isopod-kit",
      name: "Glacier Colony Pack",
      subtitle: "Cubaris murina var. Glacier",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/16/Cubaris_tarangensis_190481013.jpg",
      images: [],
      video: "",
      description: "Promotional colony pack: Purchase 10 Cubaris Murina Glacier isopods and receive 1 bonus isopod free of charge (11 specimens total).",
      price: 700,
      unit: "11 pieces",
      minQuantity: 1,
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
      overview: "The Glacier Colony Pack is an all-inclusive, curated complete biological setup designed by Fish Tales specialists. Includes premium glass enclosure, substrate, live specimens, and balanced essentials.",
      careRequirements: {
      "Setup Difficulty": "Beginner Friendly / Turnkey Kit",
      "Operating Temp": "Ambient Room Temp",
      "Maintenance": "Weekly misting or feeding as specified in care guidelines",
      "Included Components": "10 Cubaris Murina Glacier Isopods, 1 Bonus Isopod (11 specimens total), Ventilated transport culture cup, Starter food blend"
},
      habitatSetup: {
      "Enclosure Construction": "High-clarity precision glass with optimal ventilation and biological balance",
      "Placement": "Place on a sturdy, level surface away from direct harsh sunlight or extreme drafts",
      "Lighting": "Gentle ambient room light or nano LED fixture supporting live botanical growth"
},
      didYouKnow: [
      "Bioactive closed-loop habitats create self-sustaining micro-ecosystems where plants, micro-fauna, and custodial cleaners thrive harmoniously.",
      "All kit components are hand-selected, cleaned, and balanced by Fish Tales biologists for immediate plug-and-play enjoyment."
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

    add(product, qty = 1) {
      if (!product || !product.id) return;
      initProductVariantsAndSpecs(product);

      // Special Minimum Order Quantity rule ONLY for Isopods (min: 5 pieces)
      const minQty = product.minQuantity || (isIsopodProduct(product) ? 5 : 1);
      if (qty < minQty) {
        qty = minQty;
        if (isIsopodProduct(product)) {
          showToast('Minimum order for Isopods is 5 pieces.', 'info');
        }
      } else {
        qty = Math.floor(qty);
      }

      const cartId = String(product.id);
      const displayName = product.name;
      const activePrice = Number(product.price || 0);
      const activeUnit = isIsopodProduct(product) ? 'pieces' : (product.unit || product.pricingUnit || 'piece');

      const items = this.load();
      const idx = items.findIndex(i => String(i.id) === cartId || String(i.baseId) === cartId);
      if (idx >= 0) {
        items[idx].quantity += qty;
      } else {
        items.push({
          id: cartId,
          baseId: cartId,
          name: displayName,
          price: activePrice,
          pricingUnit: activeUnit,
          unit: activeUnit,
          size: product.size || null,
          categoryLabel: (product.categoryName || product.categoryLabel) || '',
          image: product.image || PLACEHOLDER_IMG,
          quantity: qty
        });
      }
      this.save(items);
      showToast(`Added ${displayName} to cart!`, 'success');
    },

    addById(id, qty = null) {
      const product = PRODUCTS.find(p => String(p.id) === String(id));
      if (!product) {
        console.warn('Product not found for id:', id);
        return;
      }
      initProductVariantsAndSpecs(product);
      if (qty === null || qty === undefined || isNaN(qty)) {
        qty = product.minQuantity || (isIsopodProduct(product) ? 5 : 1);
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
        const item = items[idx];
        const isIsopod = isIsopodProduct(item);
        if (isIsopod && qty < 5) {
          qty = 5;
          showToast('Minimum order for Isopods is 5 pieces.', 'info');
        }
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
  window.CONTACT_EMAIL = CONTACT_EMAIL;
  window.PRODUCTS = PRODUCTS;
  window.CartManager = CartManager;
  window.addToCartById = (id, qty = 1) => CartManager.addById(id, qty);
  window.renderProductGrid = renderProductGrid;
  window.initProductVariantsAndSpecs = initProductVariantsAndSpecs;
  window.getProductSelectedVariant = getProductSelectedVariant;
  window.isIsopodProduct = isIsopodProduct;
  window.getProductQuantityLabel = getProductQuantityLabel;

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
  let currentAquariumFilter = 'all';

  const AQUARIUM_FILTER_NAMES = {
    all: 'All Products',
    aquarium: 'Aquarium',
    betta: 'Betta Fish',
    guppy: 'Guppy',
    molly: 'Molly',
    shrimps: 'Shrimps',
    combos: 'Combo Packs'
  };

  function isAquariumProduct(p) {
    if (!p) return false;
    initProductVariantsAndSpecs(p);
    return p.category === 'aquarium' || p.subCategory === 'aquarium-kit' || p.subCategory === 'aquarium';
  }

  function matchesAquariumSubFilter(p, filterKey) {
    if (!p) return false;
    initProductVariantsAndSpecs(p);
    if (!isAquariumProduct(p)) return false;

    switch (filterKey) {
      case 'all':
        return true;
      case 'aquarium':
        return p.subCategory === 'aquarium' || p.subCategory === 'aquarium-kit';
      case 'betta':
        return p.subCategory === 'betta';
      case 'guppy':
        return p.subCategory === 'guppy';
      case 'molly':
        return p.subCategory === 'molly';
      case 'shrimps':
      case 'shrimp':
        return p.subCategory === 'shrimps' || p.subCategory === 'shrimp';
      case 'combos':
      case 'combo':
        return (p.category === 'combo' || p.category === 'combos' || p.subCategory === 'aquarium-kit') && isAquariumProduct(p);
      default:
        return true;
    }
  }

  window.filterAquariumCategory = function (filterKey) {
    currentAquariumFilter = filterKey || 'all';
    document.querySelectorAll('.filter-tab, .filter-pill').forEach(pill => {
      const pillFilter = pill.dataset.filter || pill.dataset.category;
      pill.classList.toggle('active', pillFilter === currentAquariumFilter);
    });
    renderProductGrid();
  };

  function getCurrentPageCategory() {
    const pageCat = (document.body && document.body.dataset && document.body.dataset.pageCategory) ||
      (document.querySelector('main') && document.querySelector('main').dataset && document.querySelector('main').dataset.pageCategory);
    if (pageCat && pageCat !== 'home' && pageCat !== 'all') {
      return pageCat;
    }
    const path = (window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : '';
    if (path.includes('aquarium-fish')) return 'aquarium';
    if (path.includes('isopods')) return 'isopods';
    if (path.includes('tarantulas')) return 'tarantulas';
    if (path.includes('combo-packs')) return 'combos';
    return 'all';
  }
  let currentSearch = '';
  let currentSort = 'default';

  window.onCardVariantChange = function () {};
  window.onModalVariantChange = function () {};

  window.addCardVariantToCart = function (productId) {
    CartManager.addById(productId);
  };

  function renderProductGrid() {
    const grid = document.getElementById('productGrid');
    const countEl = document.getElementById('resultCount');
    if (!grid) return;

    const pageCategory = getCurrentPageCategory();
    const isAquariumPage = pageCategory === 'aquarium';

    let list = [...PRODUCTS];

    // Ensure all products have variants and specs initialized
    list.forEach(p => initProductVariantsAndSpecs(p));

    let totalInCategory = PRODUCTS.length;

    // 1. Filter by category & subcategory
    if (isAquariumPage) {
      // Base pool for Aquarium & Fish page includes all aquarium/fish items & cross-listed kits
      const aquariumPool = list.filter(p => isAquariumProduct(p));
      totalInCategory = aquariumPool.length;

      if (currentAquariumFilter && currentAquariumFilter !== 'all') {
        list = aquariumPool.filter(p => matchesAquariumSubFilter(p, currentAquariumFilter));
      } else {
        list = aquariumPool;
      }
    } else if (pageCategory !== 'all') {
      // Dedicated category pages (isopods, tarantulas, combo packs)
      list = list.filter(p => p.category === pageCategory || ((pageCategory === 'combos' || pageCategory === 'combo') && (p.category === 'combo' || p.category === 'combos')));
      totalInCategory = list.length;
    } else {
      // Home page (index.html)
      if (currentCategory === 'aquarium') {
        list = list.filter(p => isAquariumProduct(p));
        totalInCategory = list.length;
      } else if (currentCategory === 'isopods') {
        list = list.filter(p => p.category === 'isopods');
        totalInCategory = list.length;
      } else if (currentCategory === 'tarantulas') {
        list = list.filter(p => p.category === 'tarantulas');
        totalInCategory = list.length;
      } else if (currentCategory === 'combos' || currentCategory === 'combo') {
        list = list.filter(p => p.category === 'combo' || p.category === 'combos');
        totalInCategory = list.length;
      } else if (currentCategory !== 'all') {
        list = list.filter(p => p.category === currentCategory);
        totalInCategory = list.length;
      } else {
        totalInCategory = PRODUCTS.length;
      }
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
      countEl.innerHTML = `Showing <strong>${list.length}</strong> of <strong>${totalInCategory}</strong> products`;
    }

    const indicatorEl = document.getElementById('activeCategoryIndicator');
    if (indicatorEl) {
      if (isAquariumPage) {
        indicatorEl.textContent = AQUARIUM_FILTER_NAMES[currentAquariumFilter] || 'All Products';
      } else {
        indicatorEl.textContent = CATEGORY_NAMES[currentCategory] || 'All Products';
      }
    }

    if (list.length === 0) {
      const filterLabel = isAquariumPage ? (AQUARIUM_FILTER_NAMES[currentAquariumFilter] || currentAquariumFilter) : '';
      const emptyMsg = currentSearch.trim()
        ? `We couldn't find any living specimens matching "${currentSearch}". Try refining your search or resetting category filters.`
        : (isAquariumPage && filterLabel)
          ? `We currently have no specimens available in "${filterLabel}". Explore our other aquarium collections or check back soon.`
          : `We couldn't find any living specimens matching your selection. Try resetting category filters.`;
      grid.innerHTML = `
        <div class="catalogue-empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3 class="empty-state-title">No Products Found</h3>
          <p class="empty-state-desc">${emptyMsg}</p>
          <button class="btn btn-outline btn-sm" onclick="resetFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(product => {
      initProductVariantsAndSpecs(product);
      const activeVariant = getProductSelectedVariant(product);
      const displayPrice = CartManager.formatPrice(activeVariant.price);
      const displayUnit = '/ ' + activeVariant.unit;

      return `
        <article class="product-card" data-id="${product.id}">
          <!-- 1. Product image -->
          <div class="product-card-thumb" onclick="navigateToProduct('${product.id}')" title="View ${product.name} details">
            <img src="${product.image || PLACEHOLDER_IMG}" alt="${product.name}" class="product-card-img" loading="lazy" onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}';">
          </div>

          <!-- Card Body -->
          <div class="product-card-body">
            <!-- 2. Product category label -->
            <div class="product-card-cat">${(product.categoryName || product.categoryLabel)}</div>

            <!-- 3. Product name -->
            <h3 class="product-card-name" onclick="navigateToProduct('${product.id}')" title="${product.name}">${product.name}</h3>

            <!-- 4. Product subtitle or short description -->
            <div class="product-card-sub" title="${product.scientificName || product.description}">${product.scientificName || product.description}</div>

            <!-- Footer area pinned to bottom -->
            <div class="product-card-footer">
              <!-- 5. Divider line -->
              <div class="card-divider"></div>

              <!-- 6. Price -->
              <div class="product-card-pricing">
                <span class="product-card-price" id="cardPrice_${product.id}">${displayPrice}</span>
                <span class="product-card-unit" id="cardUnit_${product.id}">${displayUnit}</span>
              </div>

              <!-- 7 & 8. Action buttons (Full-width stacked: 7. View Details, 8. Add to Cart) -->
              <div class="product-card-actions">
                <button type="button" class="btn card-btn-view" onclick="navigateToProduct('${product.id}')">
                  View Details
                </button>
                <button type="button" class="btn card-btn-add" onclick="addCardVariantToCart('${product.id}')">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0;">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <span>Add to Cart</span>
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
    currentAquariumFilter = 'all';
    currentSearch = '';
    currentSort = 'default';
    const searchInput = document.getElementById('catalogSearch');
    if (searchInput) searchInput.value = '';
    const sortSelect = document.getElementById('catalogSort');
    if (sortSelect) sortSelect.value = 'default';
    document.querySelectorAll('.filter-tab, .filter-pill').forEach(tab => {
      const val = tab.dataset.filter || tab.dataset.category;
      tab.classList.toggle('active', val === 'all');
    });
    renderProductGrid();
  };

  window.filterByCategory = function (categoryKey) {
    const pageCat = getCurrentPageCategory();
    if (pageCat === 'aquarium') {
      filterAquariumCategory(categoryKey);
      return;
    }

    const targetMap = {
      aquarium: 'aquarium-fish.html',
      isopods: 'isopods.html',
      tarantulas: 'tarantulas.html',
      combos: 'combo-packs.html',
      combo: 'combo-packs.html'
    };

    const isMatch = (pageCat === categoryKey) ||
      ((pageCat === 'combos' || pageCat === 'combo') && (categoryKey === 'combos' || categoryKey === 'combo'));

    if (pageCat !== 'all' && !isMatch) {
      if (categoryKey === 'all') {
        window.location.href = 'index.html#catalogue';
      } else if (targetMap[categoryKey]) {
        window.location.href = targetMap[categoryKey];
      }
      return;
    }

    currentCategory = categoryKey;
    document.querySelectorAll('.filter-tab, .filter-pill').forEach(tab => {
      const val = tab.dataset.category || tab.dataset.filter;
      const active = (val === categoryKey) ||
        ((val === 'combos' || val === 'combo') && (categoryKey === 'combos' || categoryKey === 'combo'));
      tab.classList.toggle('active', active);
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

  /* ── 7. Product Detail Navigation & Modal ─────────────────── */
  window.navigateToProduct = function (productId) {
    if (typeof window !== 'undefined' && window.location && typeof window.location.href === 'string') {
      window.location.href = 'product.html?id=' + encodeURIComponent(productId);
    } else if (typeof window.openProductModal === 'function') {
      window.openProductModal(productId);
    }
  };

  window.openProductModal = function (productId) {
    // In live browser environment, navigate directly to dedicated full-page product detail page
    if (typeof window !== 'undefined' && window.location && typeof window.location.href === 'string' && window.location.pathname) {
      const currentId = new URLSearchParams(window.location.search).get('id');
      if (window.location.pathname.endsWith('product.html') && currentId === String(productId)) {
        return;
      }
      window.location.href = 'product.html?id=' + encodeURIComponent(productId);
      return;
    }

    const product = PRODUCTS.find(p => String(p.id) === String(productId));
    if (!product) return;
    initProductVariantsAndSpecs(product);

    const modalBackdrop = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    if (!modalBackdrop || !modalContent) return;

    const activeVariant = getProductSelectedVariant(product);
    const activeVariantIdx = selectedVariants[product.id] || 0;
    const isIsopod = isIsopodProduct(product);
    const defaultQty = isIsopod ? 5 : 1;
    const unitPrice = (activeVariant && activeVariant.price !== undefined) ? Number(activeVariant.price) : Number(product.price || 0);
    const displayPrice = CartManager.formatPrice(unitPrice);
    const displayTotalPrice = CartManager.formatPrice(unitPrice * defaultQty);
    const displayUnit = isIsopod ? '/ piece' : ('/ ' + activeVariant.unit);

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

    const care = product.careRequirements || {};
    const careLevel = care.Difficulty || care.difficulty || care['Setup Difficulty'] || 'Moderate';
    const tempVal = care['Water Temp'] || care.Temperature || care['Operating Temp'] || '22°C – 28°C';
    const dietVal = care.Diet || care.diet || 'Micro-pellets & live/frozen foods';
    const sizeVal = product.size || (isIsopod ? 'Colony Specimen' : (product.unit === 'pair' ? 'Adult Pair' : 'Standard Specimen'));

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

          <!-- Quantity selector with unit label & dynamic total price (Replaces legacy dropdown) -->
          <div class="modal-qty-section">
            <div class="modal-qty-header">
              <span class="modal-qty-label">${getProductQuantityLabel(product)}</span>
              <span class="modal-qty-total-price" id="modalQtyTotal">${displayTotalPrice}</span>
            </div>
            <div class="modal-qty-selector">
              <button type="button" class="modal-qty-btn" onclick="updateModalQty(-1, '${product.id}')" aria-label="Decrease quantity">−</button>
              <span class="modal-qty-value" id="modalQty">${defaultQty}</span>
              <button type="button" class="modal-qty-btn" onclick="updateModalQty(1, '${product.id}')" aria-label="Increase quantity">+</button>
            </div>
          </div>

          <!-- Product specifications in a clean bordered section -->
          <div class="modal-specs-card">
            <div class="spec-entry">
              <span class="spec-k">Care Level:</span>
              <span class="spec-v">${careLevel}</span>
            </div>
            <div class="spec-entry">
              <span class="spec-k">Water Temp:</span>
              <span class="spec-v">${tempVal}</span>
            </div>
            <div class="spec-entry">
              <span class="spec-k">Diet:</span>
              <span class="spec-v">${dietVal}</span>
            </div>
            <div class="spec-entry">
              <span class="spec-k">Specimen Size:</span>
              <span class="spec-v">${sizeVal}</span>
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

  window.updateModalQty = function (delta, productId) {
    const qtyEl = document.getElementById('modalQty');
    if (!qtyEl) return;
    const product = productId ? PRODUCTS.find(p => String(p.id) === String(productId)) : null;
    const isIsopod = product ? isIsopodProduct(product) : false;
    const minQty = isIsopod ? 5 : 1;

    let current = parseInt(qtyEl.textContent, 10);
    if (isNaN(current)) current = minQty;
    let qty = current + delta;
    if (qty < minQty) {
      qty = minQty;
      if (isIsopod) {
        showToast('Minimum order for Isopods is 5 pieces.', 'info');
      }
    }
    qtyEl.textContent = qty;

    // Dynamically calculate and update total price
    if (product) {
      initProductVariantsAndSpecs(product);
      const variant = getProductSelectedVariant(product);
      const unitPrice = (variant && variant.price !== undefined) ? Number(variant.price) : Number(product.price || 0);
      const total = unitPrice * qty;
      const totalEl = document.getElementById('modalQtyTotal');
      if (totalEl) {
        totalEl.textContent = CartManager.formatPrice(total);
      }
    }
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

  /* ── 7b. Full-Page Product Detail Page (PDP) System ──────── */
  window.renderProductDetailPage = function () {
    const mainContainer = document.getElementById('pdpMain');
    if (!mainContainer) return;

    let requestedId = '';
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      requestedId = urlParams.get('id') || urlParams.get('product') || '';
    }

    let product = PRODUCTS.find(p => String(p.id).toLowerCase() === String(requestedId).toLowerCase());
    if (!product) {
      product = PRODUCTS[0];
    }
    initProductVariantsAndSpecs(product);

    // Update Page Title
    if (typeof document !== 'undefined' && document.title !== undefined) {
      document.title = `${product.name} — Fish Tales | Aquatic & Exotic Life`;
    }

    // Category & Collection Breadcrumbs
    let collectionUrl = 'index.html';
    let collectionName = 'Living Catalogue';
    const catLower = (product.category || '').toLowerCase();
    if (catLower === 'fish' || catLower === 'aquarium') {
      collectionUrl = 'aquarium-fish.html';
      collectionName = 'Aquarium & Fish';
    } else if (catLower === 'isopods') {
      collectionUrl = 'isopods.html';
      collectionName = 'Bioactive Isopods';
    } else if (catLower === 'tarantulas') {
      collectionUrl = 'tarantulas.html';
      collectionName = 'Exotic Tarantulas';
    } else if (catLower === 'combos' || catLower === 'combo') {
      collectionUrl = 'combo-packs.html';
      collectionName = 'Combo Packs';
    }

    const activeVariant = getProductSelectedVariant(product);
    const unitPrice = (activeVariant && activeVariant.price !== undefined) ? Number(activeVariant.price) : Number(product.price || 0);
    const isIsopod = isIsopodProduct(product);
    const defaultQty = isIsopod ? 5 : 1;
    const minQty = defaultQty;
    const displayPrice = CartManager.formatPrice(unitPrice);
    const displayUnit = isIsopod ? '/ piece' : ('/ ' + (activeVariant ? activeVariant.unit : (product.pricingUnit || 'piece')));
    const qtyLabel = isIsopod ? 'Select Quantity (pieces)' : getProductQuantityLabel(product);

    // Images gallery
    const mainImg = product.image || PLACEHOLDER_IMG;
    const galleryImages = (product.images && Array.isArray(product.images) && product.images.length > 0)
      ? product.images
      : [mainImg];

    // Scientific name & difficulty
    const scientificName = product.scientificName || product.subtitle || product.name;
    const difficulty = (product.careRequirements && (product.careRequirements.Difficulty || product.careRequirements.difficulty || product.careRequirements['Setup Difficulty']))
      || (product.specs && (product.specs['Care Level'] || product.specs.care))
      || 'Beginner Friendly';

    // Related products (3-4 items)
    let related = PRODUCTS.filter(p => String(p.id) !== String(product.id) && (p.subCategory === product.subCategory || p.category === product.category));
    if (related.length < 3) {
      const others = PRODUCTS.filter(p => String(p.id) !== String(product.id) && !related.includes(p));
      related = related.concat(others);
    }
    const relatedProducts = related.slice(0, 4);

    // Helper functions for dynamic PDP labels and icons
    function formatFieldLabel(key) {
      if (!key) return '';
      if (/[A-Z]/.test(key) && (/\s/.test(key) || /\//.test(key))) {
        return key.trim();
      }
      const map = {
        care: 'Care Level / Role',
        temp: 'Temperature Range',
        diet: 'Dietary Needs',
        habitat: 'Habitat Environment',
        size: 'Specimen Size',
        kitIncludes: 'Kit Inclusions',
        difficulty: 'Difficulty',
        temperature: 'Temperature',
        humidity: 'Humidity',
        lifespan: 'Lifespan',
        handling: 'Handling Guide',
        temperament: 'Temperament',
        waterParameters: 'Water Parameters',
        filtration: 'Filtration & Flow',
        substrate: 'Substrate',
        lighting: 'Lighting Requirements',
        plantsAndDecor: 'Plants & Decor',
        hidesAndShelters: 'Hides & Shelters'
      };
      if (map[key]) return map[key];
      const abbrevs = { tds: 'TDS', gh: 'GH', ph: 'pH', cuc: 'CUC' };
      if (abbrevs[key.toLowerCase()]) return abbrevs[key.toLowerCase()];
      return String(key)
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .trim()
        .replace(/\b\w/g, c => c.toUpperCase());
    }

    function getFieldIcon(label) {
      const l = String(label).toLowerCase();
      if (l.includes('temp') || l.includes('heat')) return '🌡️';
      if (l.includes('humid') || l.includes('moist') || l.includes('water') || l.includes('ph') || l.includes('tds') || l.includes('hardness')) return '💧';
      if (l.includes('diet') || l.includes('feed') || l.includes('food')) return '🍃';
      if (l.includes('diff') || l.includes('level') || l.includes('care')) return '⭐';
      if (l.includes('life') || l.includes('age') || l.includes('span')) return '⏳';
      if (l.includes('handl') || l.includes('touch')) return '🧤';
      if (l.includes('param')) return '🧪';
      if (l.includes('temper') || l.includes('behav')) return '🐾';
      if (l.includes('enclos') || l.includes('tank') || l.includes('aquarium') || l.includes('house') || l.includes('cage') || l.includes('setup') || l.includes('habitat') || l.includes('size')) return '🏡';
      if (l.includes('substr') || l.includes('soil') || l.includes('sand') || l.includes('wood')) return '🪵';
      if (l.includes('plant') || l.includes('decor') || l.includes('flora')) return '🌿';
      if (l.includes('hide') || l.includes('shelter') || l.includes('cave')) return '🛖';
      if (l.includes('vent') || l.includes('flow') || l.includes('filter')) return '🔄';
      if (l.includes('light')) return '💡';
      if (l.includes('place') || l.includes('location')) return '📍';
      if (l.includes('maint')) return '🛠️';
      if (l.includes('comp') || l.includes('kit') || l.includes('include')) return '📦';
      return '✨';
    }

    // Dynamic Overview text & relevant specifications from specs
    const overviewText = (product.overview && String(product.overview).trim().length > 0)
      ? String(product.overview).trim()
      : (product.description || '');

    const overviewItems = [];
    if (scientificName) {
      overviewItems.push({
        label: 'Scientific Name',
        value: `<em>${scientificName}</em>`
      });
    }
    if (product.size && String(product.size).trim().length > 0) {
      overviewItems.push({
        label: 'Specimen Size',
        value: String(product.size).trim()
      });
    }
    if (product.categoryName || product.categoryLabel) {
      overviewItems.push({
        label: 'Category',
        value: product.categoryName || product.categoryLabel
      });
    }
    if (difficulty) {
      overviewItems.push({
        label: 'Experience Level',
        value: difficulty
      });
    }

    // Dynamic Care Requirements: loop over every key-value pair
    const careCards = [];
    const careReqSource = product.careRequirements;
    if (careReqSource && typeof careReqSource === 'object' && !Array.isArray(careReqSource)) {
      Object.entries(careReqSource).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          const valStr = Array.isArray(val) ? val.join(', ') : String(val).trim();
          if (valStr.length > 0) {
            careCards.push({
              label: formatFieldLabel(key),
              value: valStr,
              icon: getFieldIcon(key)
            });
          }
        }
      });
    } else if (typeof careReqSource === 'string' && careReqSource.trim().length > 0) {
      careCards.push({
        label: 'Care Guide',
        value: careReqSource.trim(),
        icon: '💧'
      });
    }

    // Fallback if careRequirements was empty but specs has info
    if (careCards.length === 0 && product.specs) {
      if (product.specs.temp) {
        careCards.push({ label: 'Water Temp', value: String(product.specs.temp).trim(), icon: '🌡️' });
      }
      if (product.specs.diet) {
        careCards.push({ label: 'Diet', value: String(product.specs.diet).trim(), icon: '🍃' });
      }
      if (product.specs.care) {
        careCards.push({ label: 'Care Level', value: String(product.specs.care).trim(), icon: '⭐' });
      }
    }

    // Dynamic Habitat Setup: loop over every key-value pair
    const habitatCards = [];
    const habitatSource = product.habitatSetup;
    if (habitatSource && typeof habitatSource === 'object' && !Array.isArray(habitatSource)) {
      Object.entries(habitatSource).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          const valStr = Array.isArray(val) ? val.join(', ') : String(val).trim();
          if (valStr.length > 0) {
            habitatCards.push({
              label: formatFieldLabel(key),
              value: valStr,
              icon: getFieldIcon(key)
            });
          }
        }
      });
    } else if (typeof habitatSource === 'string' && habitatSource.trim().length > 0) {
      habitatCards.push({
        label: 'Habitat Setup',
        value: habitatSource.trim(),
        icon: '🏡'
      });
    }

    // Fallback if habitatSetup was empty but specs has habitat
    if (habitatCards.length === 0 && product.specs && product.specs.habitat) {
      habitatCards.push({
        label: 'Habitat Setup',
        value: String(product.specs.habitat).trim(),
        icon: '🏡'
      });
    }

    // Dynamic Did You Know: loop over all items in didYouKnow array
    let dykFacts = [];
    if (product.didYouKnow && Array.isArray(product.didYouKnow) && product.didYouKnow.length > 0) {
      dykFacts = product.didYouKnow.filter(f => f && String(f).trim().length > 0).map(f => String(f).trim());
    } else if (typeof product.didYouKnow === 'string' && product.didYouKnow.trim().length > 0) {
      dykFacts = [product.didYouKnow.trim()];
    }

    if (dykFacts.length === 0) {
      if (isIsopod) {
        dykFacts = [
          'Bioactive custodial cleaners that break down organic waste, decaying wood, and mold in bioactive vivaria.',
          'Display stunning aesthetic contrast with warm espresso-brown skirts and a creamy dorsal stripe.',
          'Thrives in moderate-humidity vivaria with nutrient-rich leaf litter, rotting hardwood, and calcium.'
        ];
      } else {
        dykFacts = [
          'Ethically captive-bred and quarantined by Fish Tales biological specialists.',
          'Shipped in temperature-regulated, thermal-insulated live-specimen transit packaging.'
        ];
      }
    }

    // If kitIncludes exists (Combo kits)
    let kitSectionHtml = '';
    if (product.kitIncludes && product.kitIncludes.length > 0) {
      kitSectionHtml = `
        <div class="pdp-kit-box">
          <h4 class="pdp-kit-title">Included in Complete Kit:</h4>
          <ul class="pdp-kit-list">
            ${product.kitIncludes.map(item => `<li><span class="pdp-kit-bullet">✓</span> ${item}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Min Order Notice
    const minOrderNoticeHtml = isIsopod
      ? `<div class="pdp-min-notice" role="alert">
          <span class="pdp-min-icon">🌿</span>
          <span class="pdp-min-text"><strong>Minimum order for Isopods is 5 pieces</strong> (ensures healthy bioactive colony establishment &amp; acclimation).</span>
        </div>`
      : '';

    // Render HTML into pdpMain
    mainContainer.innerHTML = `
      <div class="container pdp-container">
        <!-- 1. Breadcrumbs (Top position on mobile and desktop) -->
        <nav class="pdp-breadcrumbs" aria-label="Breadcrumb">
          <a href="index.html" class="pdp-crumb-link">Home</a>
          <span class="pdp-crumb-sep">/</span>
          <a href="${collectionUrl}" class="pdp-crumb-link">${collectionName}</a>
          <span class="pdp-crumb-sep">/</span>
          <span class="pdp-crumb-cat">${product.categoryName || product.categoryLabel}</span>
          <span class="pdp-crumb-sep">/</span>
          <span class="pdp-crumb-current" aria-current="page">${product.name}</span>
        </nav>

        <!-- Two Column Main Layout -->
        <div class="pdp-grid">
          <!-- LEFT COLUMN: Gallery -->
          <div class="pdp-gallery-col">
            <div class="pdp-main-image-wrap">
              <img id="pdpMainImg" src="${galleryImages[0]}" alt="${product.name}" class="pdp-main-img" onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}';">
              ${galleryImages.length > 1 ? `
                <button type="button" class="pdp-nav-arrow pdp-arrow-prev" id="pdpGalleryPrev" aria-label="Previous image">‹</button>
                <button type="button" class="pdp-nav-arrow pdp-arrow-next" id="pdpGalleryNext" aria-label="Next image">›</button>
              ` : ''}
            </div>

            <!-- Thumbnails Row -->
            <div class="pdp-thumbnails" id="pdpThumbnails" role="tablist" aria-label="Product image gallery">
              ${galleryImages.map((img, idx) => `
                <button type="button" class="pdp-thumb-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}" aria-label="Thumbnail ${idx + 1}">
                  <img src="${img}" alt="${product.name} view ${idx + 1}" class="pdp-thumb-img" onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}';">
                </button>
              `).join('')}
            </div>
          </div>

          <!-- RIGHT COLUMN: Details & Purchase -->
          <div class="pdp-info-col">
            <!-- Scientific Name / Genus -->
            <div class="pdp-scientific-name">${scientificName}</div>

            <!-- Product Title -->
            <h1 class="pdp-title">${product.name}</h1>

            <!-- Difficulty Badge & Stock Status Row -->
            <div class="pdp-badges-row">
              <span class="pdp-difficulty-badge">🌱 ${difficulty}</span>
              <span class="pdp-stock-badge">✓ In Stock • Ready for Live Transit</span>
            </div>

            <!-- Price & Unit -->
            <div class="pdp-price-box">
              <span class="pdp-price" id="pdpUnitPrice">${displayPrice}</span>
              <span class="pdp-price-unit" id="pdpPriceUnit">${displayUnit}</span>
            </div>

            <!-- Short Description -->
            <p class="pdp-description">${product.description}</p>

            ${kitSectionHtml}

            <!-- Minimum Order Notice (if applicable) -->
            ${minOrderNoticeHtml}

            <!-- Quantity Selector & Dynamic Total -->
            <div class="pdp-qty-section">
              <div class="pdp-qty-header">
                <span class="pdp-qty-label">${qtyLabel}</span>
                <div class="pdp-qty-total-wrap">
                  <span class="pdp-qty-total-label">Subtotal:</span>
                  <span class="pdp-qty-total" id="pdpQtyTotal">${CartManager.formatPrice(unitPrice * minQty)}</span>
                </div>
              </div>
              <div class="pdp-qty-selector">
                <button type="button" class="pdp-qty-btn" id="pdpQtyMinus" aria-label="Decrease quantity">−</button>
                <span class="pdp-qty-value" id="pdpQty">${minQty}</span>
                <button type="button" class="pdp-qty-btn" id="pdpQtyPlus" aria-label="Increase quantity">+</button>
              </div>
            </div>

            <!-- Action Buttons: Add to Cart & Direct WhatsApp -->
            <div class="pdp-action-buttons">
              <button type="button" class="btn btn-primary pdp-btn-cart" id="pdpAddToCartBtn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>Add to Cart</span>
              </button>
              <button type="button" class="btn btn-whatsapp pdp-btn-whatsapp" id="pdpDirectWhatsAppBtn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
                </svg>
                <span>Order via WhatsApp</span>
              </button>
            </div>

            <!-- Guarantee Badges -->
            <div class="pdp-guarantee-pills">
              <span class="pdp-pill">🛡️ Live Arrival Guarantee</span>
              <span class="pdp-pill">📦 Thermal Insulated Transit</span>
              <span class="pdp-pill">🌿 Pure Bloodline</span>
            </div>
          </div>
        </div>

        <!-- 4 Clearly Separated Information Sections -->
        <section class="pdp-info-sections" aria-label="Detailed Product Information">
          <!-- Section A: OVERVIEW -->
          ${(overviewText || overviewItems.length > 0) ? `
          <article class="pdp-section-card" id="pdpSectionOverview">
            <div class="pdp-section-header">
              <span class="pdp-section-icon">📖</span>
              <h2 class="pdp-section-title">Overview</h2>
            </div>
            <div class="pdp-section-body">
              ${overviewText ? `<p class="pdp-overview-text">${overviewText}</p>` : ''}
              ${overviewItems.length > 0 ? `
              <div class="pdp-overview-grid">
                ${overviewItems.map(item => `
                  <div class="pdp-spec-item">
                    <span class="pdp-spec-label">${item.label}</span>
                    <span class="pdp-spec-value">${item.value}</span>
                  </div>
                `).join('')}
              </div>` : ''}
            </div>
          </article>` : ''}

          <!-- Section B: CARE REQUIREMENTS -->
          ${careCards.length > 0 ? `
          <article class="pdp-section-card" id="pdpSectionCare">
            <div class="pdp-section-header">
              <span class="pdp-section-icon">💧</span>
              <h2 class="pdp-section-title">Care Requirements</h2>
            </div>
            <div class="pdp-section-body">
              <div class="pdp-cards-grid">
                ${careCards.map(c => `
                  <div class="pdp-stat-card">
                    <span class="pdp-stat-icon">${c.icon}</span>
                    <span class="pdp-stat-label">${c.label}</span>
                    <span class="pdp-stat-value">${c.value}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </article>` : ''}

          <!-- Section C: HABITAT SETUP -->
          ${habitatCards.length > 0 ? `
          <article class="pdp-section-card" id="pdpSectionHabitat">
            <div class="pdp-section-header">
              <span class="pdp-section-icon">🏡</span>
              <h2 class="pdp-section-title">Habitat Setup</h2>
            </div>
            <div class="pdp-section-body">
              <div class="pdp-cards-grid">
                ${habitatCards.map(c => `
                  <div class="pdp-stat-card">
                    <span class="pdp-stat-icon">${c.icon}</span>
                    <span class="pdp-stat-label">${c.label}</span>
                    <span class="pdp-stat-value">${c.value}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </article>` : ''}

          <!-- Section D: DID YOU KNOW? -->
          ${dykFacts.length > 0 ? `
          <article class="pdp-section-card pdp-facts-card" id="pdpSectionFacts">
            <div class="pdp-section-header">
              <span class="pdp-section-icon">💡</span>
              <h2 class="pdp-section-title">Did You Know?</h2>
            </div>
            <div class="pdp-section-body">
              <ul class="pdp-facts-list">
                ${dykFacts.map(fact => `
                  <li class="pdp-fact-item">
                    <span class="pdp-fact-bullet">✨</span>
                    <span class="pdp-fact-text">${fact}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </article>` : ''}
        </section>

        <!-- Related Products Section: YOU MAY ALSO LIKE -->
        <section class="pdp-related-section" aria-label="Related Products">
          <div class="pdp-related-header">
            <h2 class="pdp-related-title">YOU MAY ALSO LIKE</h2>
            <p class="pdp-related-sub">Carefully curated companion species and setups from the Fish Tales collection</p>
          </div>
          <div class="pdp-related-grid">
            ${relatedProducts.map(rel => {
      initProductVariantsAndSpecs(rel);
      const relVar = getProductSelectedVariant(rel);
      const relPrice = CartManager.formatPrice(relVar.price);
      const relUnit = isIsopodProduct(rel) ? '/ piece' : ('/ ' + relVar.unit);
      return `
                <article class="product-card pdp-related-card" data-id="${rel.id}">
                  <div class="product-card-thumb" onclick="navigateToProduct('${rel.id}')" title="View ${rel.name}">
                    <img src="${rel.image || PLACEHOLDER_IMG}" alt="${rel.name}" class="product-card-img" loading="lazy" onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}';">
                  </div>
                  <div class="product-card-body">
                    <div class="product-card-cat">${rel.categoryName || rel.categoryLabel}</div>
                    <h3 class="product-card-name" onclick="navigateToProduct('${rel.id}')" title="${rel.name}">${rel.name}</h3>
                    <div class="product-card-sub" title="${rel.scientificName || rel.description}">${rel.scientificName || rel.description}</div>
                    <div class="product-card-footer">
                      <div class="card-divider"></div>
                      <div class="product-card-pricing">
                        <span class="product-card-price">${relPrice}</span>
                        <span class="product-card-unit">${relUnit}</span>
                      </div>
                      <div class="product-card-actions">
                        <button type="button" class="btn card-btn-view" onclick="navigateToProduct('${rel.id}')">
                          View Details
                        </button>
                        <button type="button" class="btn card-btn-add" onclick="addCardVariantToCart('${rel.id}')">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0;">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                            <path d="M3 6h18" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              `;
    }).join('')}
          </div>
        </section>
      </div>
    `;

    // Interactive PDP Event Handlers:
    // 1. Gallery Image Switching
    let currentImgIdx = 0;
    const mainImgEl = document.getElementById('pdpMainImg');
    const thumbBtns = document.querySelectorAll('.pdp-thumb-btn');

    function selectGalleryImage(idx) {
      if (idx < 0) idx = galleryImages.length - 1;
      if (idx >= galleryImages.length) idx = 0;
      currentImgIdx = idx;
      if (mainImgEl) mainImgEl.src = galleryImages[currentImgIdx];
      thumbBtns.forEach((b, i) => {
        if (i === currentImgIdx) b.classList.add('active');
        else b.classList.remove('active');
      });
    }

    thumbBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        if (!isNaN(idx)) selectGalleryImage(idx);
      });
    });

    const prevBtn = document.getElementById('pdpGalleryPrev');
    const nextBtn = document.getElementById('pdpGalleryNext');
    if (prevBtn) prevBtn.addEventListener('click', () => selectGalleryImage(currentImgIdx - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => selectGalleryImage(currentImgIdx + 1));

    // 2. Quantity Stepper Controls
    let currentQty = minQty;
    const qtyValEl = document.getElementById('pdpQty');
    const qtyTotalEl = document.getElementById('pdpQtyTotal');
    const minusBtn = document.getElementById('pdpQtyMinus');
    const plusBtn = document.getElementById('pdpQtyPlus');

    function updatePdpQuantity(delta) {
      let next = currentQty + delta;
      if (isIsopod) {
        if (next < 5) {
          next = 5;
          showToast('Minimum order quantity for Isopods is 5 pieces.', 'info');
        }
      } else {
        if (next < 1) next = 1;
      }
      currentQty = next;
      if (qtyValEl) qtyValEl.textContent = currentQty;
      if (qtyTotalEl) qtyTotalEl.textContent = CartManager.formatPrice(unitPrice * currentQty);
    }

    if (minusBtn) minusBtn.addEventListener('click', () => updatePdpQuantity(-1));
    if (plusBtn) plusBtn.addEventListener('click', () => updatePdpQuantity(1));

    // 3. Add to Cart Button
    const addCartBtn = document.getElementById('pdpAddToCartBtn');
    if (addCartBtn) {
      addCartBtn.addEventListener('click', () => {
        CartManager.addById(product.id, currentQty);
      });
    }

    // 4. Direct WhatsApp Inquiry
    const directWaBtn = document.getElementById('pdpDirectWhatsAppBtn');
    if (directWaBtn) {
      directWaBtn.addEventListener('click', () => {
        const totalStr = CartManager.formatPrice(unitPrice * currentQty);
        const msg = [
          'Hello Fish Tales!',
          '',
          `I would like to order/enquire about:`,
          `• Product: ${product.name}`,
          `• Scientific Name: ${scientificName}`,
          `• Quantity: ${currentQty} ${isIsopod ? 'pieces' : (activeVariant ? activeVariant.unit : 'unit')}`,
          `• Total Value: ${totalStr}`,
          '',
          'Please confirm livestock availability, shipping schedule and payment info (Prepaid only, COD unavailable).'
        ].join('\n');
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
      });
    }
  };

  /* ── 8. Cart Drawer Controller ───────────────────────────── */
  function renderCartDrawerItems(items, total) {
    const itemsWrap = document.getElementById('cartDrawerItems');
    const subtotalEl = document.getElementById('cartDrawerSubtotal');
    const checkoutBtn = document.getElementById('cartDrawerCheckoutBtn');
    if (!itemsWrap || !subtotalEl) return;

    subtotalEl.textContent = CartManager.formatPrice(total);

    if (checkoutBtn) {
      checkoutBtn.onclick = function (e) {
        if (e) e.preventDefault();
        window.openCheckoutModal();
      };
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
      const isIsopod = isIsopodProduct(item);
      const lineTotal = CartManager.formatPrice(item.price * item.quantity);
      const unitLabel = item.pricingUnit === 'pair' ? 'per pair' : (item.pricingUnit === 'kit' ? 'kit' : (isIsopod ? 'per piece' : 'per piece'));
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
            ${isIsopod ? `<span class="cart-item-min-notice">Minimum order: 5 pieces</span>` : ''}
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

  /* ── 8b. Customer Checkout & WhatsApp Order Engine ─────────── */
  const checkoutState = {
    step: 1,
    orderId: '',
    orderDate: '',
    orderTime: '',
    isSubmitting: false,
    customer: {
      fullName: '',
      mobile: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    }
  };

  function generateOrderId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    let seq = 1;
    try {
      const stored = localStorage.getItem('fishtales_order_seq');
      if (stored) {
        seq = parseInt(stored, 10) + 1;
      }
      localStorage.setItem('fishtales_order_seq', String(seq));
    } catch {
      seq = Math.floor(1 + Math.random() * 999);
    }
    const seqStr = String(seq).padStart(3, '0');
    return `FT-${dateStr}-${seqStr}`;
  }

  function formatOrderDateTime(d = new Date()) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const dateStr = `${day}/${month}/${year}`;

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;

    return { date: dateStr, time: timeStr };
  }

  function getProductAndVariantDisplay(item) {
    let prodName = item.name;
    let variantName = '';

    const match = item.name.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      prodName = match[1].trim();
      variantName = match[2].trim();
    } else {
      if (item.pricingUnit === 'pair') {
        variantName = '1 Pair (Adult Pair)';
      } else if (item.pricingUnit === 'kit') {
        variantName = 'Complete Kit';
      } else if (item.size) {
        variantName = `Single (${item.size})`;
      } else {
        variantName = 'Single (1 pc)';
      }
    }

    return { prodName, variantName };
  }

  function buildWhatsAppOrderMessage(orderDetails) {
    const { orderId, date, time, items, subtotal, customer } = orderDetails;
    const divider = '━━━━━━━━━━━━━━━━━━━━';
    const lines = [
      '🐠 FISH TALES',
      '🛍️ *NEW ORDER RECEIVED*',
      divider,
      '📋 *ORDER INFORMATION*',
      `🆔 Order ID: ${orderId}`,
      `📅 Date: ${date}` + (time ? ` (${time})` : ''),
      divider,
      '📦 *PRODUCT DETAILS*'
    ];

    items.forEach((item) => {
      const { prodName, variantName } = getProductAndVariantDisplay(item);
      const unitPriceFormatted = CartManager.formatPrice(item.price);
      const lineTotalFormatted = CartManager.formatPrice(item.price * item.quantity);

      lines.push(`${prodName} × ${item.quantity}`);
      lines.push(`Variant: ${variantName}`);
      lines.push(`Unit Price: ${unitPriceFormatted}`);
    });

    lines.push(divider);
    lines.push('💳 *ORDER SUMMARY*');
    lines.push(`Product Subtotal: ${CartManager.formatPrice(subtotal)}`);
    lines.push('Shipping: To be confirmed (Live transit fee)');
    lines.push(`Final Total: ${CartManager.formatPrice(subtotal)} (Shipping confirmation pending)`);
    lines.push(divider);
    lines.push('📍 *DELIVERY INFORMATION*');
    lines.push(`👤 Customer Name: ${customer.fullName}`);
    lines.push(`📞 Phone: +91 ${customer.mobile}`);
    lines.push(`✉️ Email: ${customer.email && customer.email.trim() ? customer.email.trim() : 'Not provided'}`);
    lines.push(`🏠 Address: ${customer.address}`);
    lines.push(`📍 City: ${customer.city}`);
    lines.push(`🗺️ State: ${customer.state}`);
    lines.push(`📮 Pincode: ${customer.pincode}`);
    lines.push(divider);
    lines.push('⚠️ *PAYMENT INSTRUCTIONS & POLICY*');
    lines.push('*• Cash on Delivery (COD) is strictly unavailable* for live livestock & bioactive habitats.');
    lines.push('• Orders are prepaid via *UPI / Bank Transfer* after order & shipping confirmation.');
    lines.push(divider);
    lines.push('👋 Hello Fish Tales!');
    lines.push("I'd like to confirm my order. Please verify product availability, confirmed shipping charges, and send payment instructions before dispatch.");

    return lines.join('\n');
  }

  function loadSavedCustomer() {
    try {
      const raw = localStorage.getItem('fishtales_customer');
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === 'object') {
          Object.assign(checkoutState.customer, saved);
        }
      }
    } catch { }
  }

  function saveCustomerToStorage(customer) {
    try {
      localStorage.setItem('fishtales_customer', JSON.stringify(customer));
    } catch { }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  window.openCheckoutModal = function () {
    const items = CartManager.load();
    if (items.length === 0) {
      showToast('Your cart is empty! Add items to continue.', 'error');
      return;
    }

    if (typeof window.closeCartDrawer === 'function') {
      window.closeCartDrawer();
    }

    loadSavedCustomer();
    checkoutState.orderId = generateOrderId();
    const dt = formatOrderDateTime();
    checkoutState.orderDate = dt.date;
    checkoutState.orderTime = dt.time;
    checkoutState.step = 1;
    checkoutState.isSubmitting = false;

    window.renderCheckoutStep1();

    const modal = document.getElementById('checkoutModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeCheckoutModal = function () {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  window.handleCheckoutModalBackdropClick = function (e) {
    if (e.target && e.target.id === 'checkoutModal') {
      window.closeCheckoutModal();
    }
  };

  window.renderCheckoutStep1 = function () {
    checkoutState.step = 1;
    const content = document.getElementById('checkoutContent');
    if (!content) return;

    const items = CartManager.load();
    const subtotal = CartManager.getTotal();
    const c = checkoutState.customer;

    const itemsHtml = items.map(item => {
      const { prodName, variantName } = getProductAndVariantDisplay(item);
      const lineTotal = CartManager.formatPrice(item.price * item.quantity);
      const unitPrice = CartManager.formatPrice(item.price);
      const img = item.image || PLACEHOLDER_IMG;

      return `
        <div class="checkout-item-row">
          <div class="checkout-item-thumb">
            <img src="${img}" alt="${prodName}" onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}';">
          </div>
          <div class="checkout-item-info">
            <div class="checkout-item-name" title="${prodName}">${prodName}</div>
            <div class="checkout-item-variant">${variantName}</div>
            <div class="checkout-item-submeta">Qty: ${item.quantity} &times; ${unitPrice}</div>
          </div>
          <div class="checkout-item-price">${lineTotal}</div>
        </div>
      `;
    }).join('');

    content.innerHTML = `
      <div class="checkout-header">
        <div class="checkout-title-wrap">
          <h2 id="checkoutModalTitle">Customer Checkout</h2>
          <div class="checkout-subtitle">Enter your delivery address to prepare your official order.</div>
        </div>
        <div class="checkout-steps-badge">
          <span class="checkout-step-pill active">1. Delivery Info</span>
          <span style="color:var(--text-dim);">&rarr;</span>
          <span class="checkout-step-pill">2. Review &amp; WhatsApp</span>
        </div>
      </div>

      <div class="checkout-grid">
        <!-- Left: Delivery Form -->
        <div class="checkout-form-container">
          <div class="checkout-form-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            Recipient &amp; Delivery Address
          </div>

          <form id="checkoutForm" onsubmit="event.preventDefault(); window.validateAndProceedToReview();" novalidate>
            <div class="checkout-form-row">
              <div class="checkout-form-group">
                <label class="checkout-label" for="checkoutFullName">Full Name <span class="required-star">*</span></label>
                <input type="text" id="checkoutFullName" class="checkout-input" placeholder="e.g. Rahul Sharma" value="${escapeHtml(c.fullName)}" required autocomplete="name" oninput="clearFieldError('fullName')">
                <div class="checkout-field-error" id="err-fullName">Please enter your full name</div>
              </div>

              <div class="checkout-form-group">
                <label class="checkout-label" for="checkoutMobile">WhatsApp Mobile Number <span class="required-star">*</span></label>
                <div class="checkout-phone-wrap">
                  <span class="checkout-phone-prefix">+91</span>
                  <input type="tel" id="checkoutMobile" class="checkout-input" placeholder="10-digit number" value="${escapeHtml(c.mobile)}" maxlength="14" required autocomplete="tel" oninput="clearFieldError('mobile')">
                </div>
                <div class="checkout-field-error" id="err-mobile">Please enter a valid 10-digit Indian mobile number</div>
              </div>
            </div>

            <div class="checkout-form-group">
              <label class="checkout-label" for="checkoutEmail">Email Address <span style="font-weight:400; color:var(--text-muted);">(Optional)</span></label>
              <input type="email" id="checkoutEmail" class="checkout-input" placeholder="e.g. name@example.com" value="${escapeHtml(c.email)}" autocomplete="email" oninput="clearFieldError('email')">
              <div class="checkout-field-error" id="err-email">Please enter a valid email address or leave blank</div>
            </div>

            <div class="checkout-form-group">
              <label class="checkout-label" for="checkoutAddress">Complete Delivery Address <span class="required-star">*</span></label>
              <textarea id="checkoutAddress" class="checkout-textarea" placeholder="Flat / House No., Building Name, Street, Landmark" required autocomplete="street-address" oninput="clearFieldError('address')">${escapeHtml(c.address)}</textarea>
              <div class="checkout-field-error" id="err-address">Please enter your complete delivery address</div>
            </div>

            <div class="checkout-form-row">
              <div class="checkout-form-group">
                <label class="checkout-label" for="checkoutCity">City <span class="required-star">*</span></label>
                <input type="text" id="checkoutCity" class="checkout-input" placeholder="e.g. Bengaluru" value="${escapeHtml(c.city)}" required autocomplete="address-level2" oninput="clearFieldError('city')">
                <div class="checkout-field-error" id="err-city">Please enter your city</div>
              </div>

              <div class="checkout-form-group">
                <label class="checkout-label" for="checkoutState">State <span class="required-star">*</span></label>
                <input type="text" id="checkoutState" class="checkout-input" placeholder="e.g. Karnataka" value="${escapeHtml(c.state)}" required autocomplete="address-level1" oninput="clearFieldError('state')">
                <div class="checkout-field-error" id="err-state">Please enter your state</div>
              </div>
            </div>

            <div class="checkout-form-group" style="max-width: 240px;">
              <label class="checkout-label" for="checkoutPincode">Postal Pincode <span class="required-star">*</span></label>
              <input type="text" id="checkoutPincode" class="checkout-input" placeholder="6 digits (e.g. 560001)" value="${escapeHtml(c.pincode)}" maxlength="6" required autocomplete="postal-code" oninput="clearFieldError('pincode')">
              <div class="checkout-field-error" id="err-pincode">Please enter a valid 6-digit postal pincode</div>
            </div>

            <div class="checkout-actions-row">
              <button type="button" class="btn btn-outline" onclick="closeCheckoutModal(); openCartDrawer();">
                &larr; Back to Cart
              </button>
              <button type="submit" class="btn btn-primary">
                Review Order &rarr;
              </button>
            </div>
          </form>
        </div>

        <!-- Right: Order Summary Box -->
        <div class="checkout-summary-box">
          <div class="checkout-summary-title">
            <span>Order Summary (${CartManager.getCount()} items)</span>
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">Live Cart</span>
          </div>

          <div class="checkout-items-list">
            ${itemsHtml}
          </div>

          <div class="checkout-cost-breakdown">
            <div class="checkout-cost-row">
              <span>Product Subtotal</span>
              <span style="font-weight:600;">${CartManager.formatPrice(subtotal)}</span>
            </div>
            <div class="checkout-cost-row">
              <span>Shipping Charges</span>
              <span class="badge-tbc">To be confirmed</span>
            </div>
            <div class="checkout-cost-row">
              <span>Discount</span>
              <span style="color:var(--text-muted); font-weight:600;">₹0</span>
            </div>
            <div class="checkout-cost-row total">
              <span>Final Total</span>
              <span style="color:var(--color-primary-dark); font-weight:700; text-align:right;">
                ${CartManager.formatPrice(subtotal)}
                <span style="font-size:0.75rem; font-weight:500; color:var(--text-muted); display:block;">(Shipping confirmation pending)</span>
              </span>
            </div>
          </div>

          <div class="checkout-cod-banner">
            ⚠️ <strong>Payment Notice:</strong> Cash on Delivery (COD) is strictly unavailable for live livestock and bioactive habitats. Prepaid orders only via UPI/Bank Transfer after WhatsApp confirmation.
          </div>
        </div>
      </div>
    `;
  };

  window.clearFieldError = function (fieldKey) {
    const errEl = document.getElementById(`err-${fieldKey}`);
    const inputEl = document.getElementById(
      fieldKey === 'fullName' ? 'checkoutFullName' :
        fieldKey === 'mobile' ? 'checkoutMobile' :
          fieldKey === 'email' ? 'checkoutEmail' :
            fieldKey === 'address' ? 'checkoutAddress' :
              fieldKey === 'city' ? 'checkoutCity' :
                fieldKey === 'state' ? 'checkoutState' :
                  'checkoutPincode'
    );
    if (errEl) errEl.classList.remove('show');
    if (inputEl) inputEl.classList.remove('is-invalid');
  };

  window.validateAndProceedToReview = function () {
    const nameInput = document.getElementById('checkoutFullName');
    const mobileInput = document.getElementById('checkoutMobile');
    const emailInput = document.getElementById('checkoutEmail');
    const addressInput = document.getElementById('checkoutAddress');
    const cityInput = document.getElementById('checkoutCity');
    const stateInput = document.getElementById('checkoutState');
    const pincodeInput = document.getElementById('checkoutPincode');

    if (!nameInput || !mobileInput || !addressInput || !cityInput || !stateInput || !pincodeInput) {
      return;
    }

    const fullName = nameInput.value.trim();
    let rawMobile = mobileInput.value.trim().replace(/[\s\-\(\)]/g, '');
    if (rawMobile.startsWith('+91')) rawMobile = rawMobile.substring(3);
    else if (rawMobile.startsWith('91') && rawMobile.length === 12) rawMobile = rawMobile.substring(2);
    else if (rawMobile.startsWith('0') && rawMobile.length === 11) rawMobile = rawMobile.substring(1);

    const email = emailInput ? emailInput.value.trim() : '';
    const address = addressInput.value.trim();
    const city = cityInput.value.trim();
    const state = stateInput.value.trim();
    const pincode = pincodeInput.value.trim();

    let isValid = true;
    let firstInvalidInput = null;

    function markError(fieldKey, inputEl) {
      isValid = false;
      const errEl = document.getElementById(`err-${fieldKey}`);
      if (errEl) errEl.classList.add('show');
      if (inputEl) inputEl.classList.add('is-invalid');
      if (!firstInvalidInput && inputEl) firstInvalidInput = inputEl;
    }

    // 1. Name validation
    if (!fullName || fullName.length < 2) {
      markError('fullName', nameInput);
    } else {
      window.clearFieldError('fullName');
    }

    // 2. Mobile validation: 10 digits starting with 6-9
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(rawMobile)) {
      markError('mobile', mobileInput);
    } else {
      window.clearFieldError('mobile');
    }

    // 3. Email validation (only if provided)
    if (email && email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        markError('email', emailInput);
      } else {
        window.clearFieldError('email');
      }
    } else {
      window.clearFieldError('email');
    }

    // 4. Address validation
    if (!address || address.length < 5) {
      markError('address', addressInput);
    } else {
      window.clearFieldError('address');
    }

    // 5. City validation
    if (!city || city.length < 2) {
      markError('city', cityInput);
    } else {
      window.clearFieldError('city');
    }

    // 6. State validation
    if (!state || state.length < 2) {
      markError('state', stateInput);
    } else {
      window.clearFieldError('state');
    }

    // 7. Pincode validation: exactly 6 digits
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pincode)) {
      markError('pincode', pincodeInput);
    } else {
      window.clearFieldError('pincode');
    }

    if (!isValid) {
      if (firstInvalidInput) firstInvalidInput.focus();
      showToast('Please check and correct highlighted fields', 'error');
      return;
    }

    // Save customer details
    checkoutState.customer = {
      fullName,
      mobile: rawMobile,
      email,
      address,
      city,
      state,
      pincode
    };
    saveCustomerToStorage(checkoutState.customer);

    window.renderCheckoutStep2();
  };

  window.renderCheckoutStep2 = function () {
    checkoutState.step = 2;
    const content = document.getElementById('checkoutContent');
    if (!content) return;

    const items = CartManager.load();
    const subtotal = CartManager.getTotal();
    const c = checkoutState.customer;

    const itemsSummaryHtml = items.map(item => {
      const { prodName, variantName } = getProductAndVariantDisplay(item);
      const lineTotal = CartManager.formatPrice(item.price * item.quantity);
      const unitPrice = CartManager.formatPrice(item.price);

      return `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem; font-size:0.85rem;">
          <div>
            <strong>${escapeHtml(prodName)}</strong>
            <div style="font-size:0.775rem; color:var(--text-muted);">${escapeHtml(variantName)} &bull; Qty: ${item.quantity} &times; ${unitPrice}</div>
          </div>
          <div style="font-weight:700; color:var(--color-primary-dark); margin-left:0.75rem;">${lineTotal}</div>
        </div>
      `;
    }).join('');

    content.innerHTML = `
      <div class="checkout-header">
        <div class="checkout-title-wrap">
          <h2 id="checkoutModalTitle">Review Your Order</h2>
          <div class="checkout-subtitle">Verify your delivery details before connecting to WhatsApp.</div>
        </div>
        <div class="checkout-steps-badge">
          <span class="checkout-step-pill" onclick="window.renderCheckoutStep1()" style="cursor:pointer;" title="Click to edit delivery info">1. Delivery Info</span>
          <span style="color:var(--text-dim);">&rarr;</span>
          <span class="checkout-step-pill active">2. Review &amp; WhatsApp</span>
        </div>
      </div>

      <div class="checkout-review-wrap">
        <!-- Order ID & Timestamp Banner -->
        <div class="checkout-order-badge-row">
          <div>
            <div class="checkout-order-ref-label">Order Reference ID</div>
            <div class="checkout-order-ref-num">${checkoutState.orderId}</div>
          </div>
          <div class="checkout-order-timestamp text-right">
            <div><strong>Date:</strong> ${checkoutState.orderDate}</div>
            <div><strong>Time:</strong> ${checkoutState.orderTime}</div>
          </div>
        </div>

        <div class="checkout-review-cards-grid">
          <!-- Card 1: Customer & Delivery Info -->
          <div class="checkout-review-card">
            <h4>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Delivery Destination
            </h4>
            <div class="checkout-review-item-line"><strong>Name:</strong> ${escapeHtml(c.fullName)}</div>
            <div class="checkout-review-item-line"><strong>Mobile:</strong> +91 ${escapeHtml(c.mobile)}</div>
            <div class="checkout-review-item-line"><strong>Email:</strong> ${c.email ? escapeHtml(c.email) : '<em>Not provided</em>'}</div>
            <div class="checkout-review-item-line" style="margin-top:0.4rem;"><strong>Address:</strong><br>${escapeHtml(c.address)}</div>
            <div class="checkout-review-item-line">${escapeHtml(c.city)}, ${escapeHtml(c.state)} – <strong>${escapeHtml(c.pincode)}</strong></div>
          </div>

          <!-- Card 2: Items & Payment Breakdown -->
          <div class="checkout-review-card">
            <h4>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/></svg>
              Selected Items (${CartManager.getCount()})
            </h4>
            <div style="max-height:160px; overflow-y:auto; margin-bottom:0.75rem; padding-right:0.35rem;">
              ${itemsSummaryHtml}
            </div>
            <div style="border-top:1px solid var(--border-subtle); padding-top:0.6rem; font-size:0.85rem; display:flex; flex-direction:column; gap:0.35rem;">
              <div style="display:flex; justify-content:space-between;">
                <span>Subtotal:</span>
                <strong>${CartManager.formatPrice(subtotal)}</strong>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>Shipping:</span>
                <span class="badge-tbc">To be confirmed</span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Discount:</span>
                <strong>₹0</strong>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:1.05rem; font-weight:700; color:var(--color-primary-dark); border-top:1px solid var(--border-leaf); padding-top:0.45rem; margin-top:0.25rem;">
                <span>TOTAL:</span>
                <span style="text-align:right;">
                  ${CartManager.formatPrice(subtotal)}
                  <small style="font-size:0.75rem; font-weight:500; color:var(--text-muted); display:block;">(Shipping confirmation pending)</small>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="checkout-callout-box">
          ⚠️ <strong>Payment Notice:</strong> Cash on Delivery (COD) is strictly unavailable for live livestock and bioactive habitats. Prepaid orders only via UPI/Bank Transfer after WhatsApp confirmation.
        </div>

        <div class="checkout-actions-row">
          <button type="button" class="btn btn-outline" onclick="window.renderCheckoutStep1();">
            &larr; Edit Details
          </button>
          <button type="button" id="btnContinueWhatsApp" class="btn-whatsapp-order" onclick="window.proceedToWhatsApp();">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/>
            </svg>
            Continue to WhatsApp &rarr;
          </button>
        </div>

        <div id="checkoutPostActions" style="display:none;" class="checkout-post-actions">
          <div style="font-weight:700; color:var(--color-primary-dark); font-size:0.95rem;">
            ✓ WhatsApp Chat Opened in New Tab!
          </div>
          <div style="font-size:0.825rem; color:var(--text-muted); max-width:440px;">
            Your order reference <code>${checkoutState.orderId}</code> is ready to send. Your cart is preserved safely in case you need to return.
          </div>
          <div style="display:flex; gap:0.75rem; flex-wrap:wrap; justify-content:center; margin-top:0.25rem;">
            <button type="button" class="btn btn-outline btn-sm" onclick="closeCheckoutModal();">
              Keep Cart Saved &amp; Close
            </button>
            <button type="button" class="btn btn-primary btn-sm" onclick="CartManager.clear(); closeCheckoutModal(); showToast('Cart cleared. Thank you for ordering with Fish Tales!', 'success');">
              Order Confirmed? Clear Cart
            </button>
          </div>
        </div>
      </div>
    `;
  };

  window.proceedToWhatsApp = function () {
    if (checkoutState.isSubmitting) return;

    const items = CartManager.load();
    if (items.length === 0) {
      showToast('Your cart is empty!', 'error');
      return;
    }

    checkoutState.isSubmitting = true;
    const btn = document.getElementById('btnContinueWhatsApp');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        Connecting to WhatsApp...
      `;
    }

    const orderDetails = {
      orderId: checkoutState.orderId,
      date: checkoutState.orderDate,
      time: checkoutState.orderTime,
      items: items,
      subtotal: CartManager.getTotal(),
      customer: checkoutState.customer
    };

    const message = buildWhatsAppOrderMessage(orderDetails);
    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/919654297430?text=${encoded}`;

    window.open(waUrl, '_blank');

    setTimeout(() => {
      checkoutState.isSubmitting = false;
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/>
          </svg>
          Re-open on WhatsApp &rarr;
        `;
      }
      const postActions = document.getElementById('checkoutPostActions');
      if (postActions) {
        postActions.style.display = 'flex';
      }
    }, 1000);
  };

  /* ── 9. Live Search Overlay ──────────────────────────────── */
  function escapeSearchHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.openSearchOverlay = function () {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchOverlayInput');
    const clearBtn = document.getElementById('searchOverlayClear');
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (input) {
        input.value = '';
        if (clearBtn) clearBtn.classList.remove('visible');
        setTimeout(() => input.focus(), 120);
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

  window.clearSearchOverlayInput = function () {
    const input = document.getElementById('searchOverlayInput');
    const clearBtn = document.getElementById('searchOverlayClear');
    if (input) {
      input.value = '';
      input.focus();
    }
    if (clearBtn) {
      clearBtn.classList.remove('visible');
    }
    renderSearchOverlayResults('');
  };

  window.handleOverlaySearch = function (query) {
    const clearBtn = document.getElementById('searchOverlayClear');
    if (clearBtn) {
      if (query && query.trim().length > 0) {
        clearBtn.classList.add('visible');
      } else {
        clearBtn.classList.remove('visible');
      }
    }
    renderSearchOverlayResults(query);
  };

  function renderSearchOverlayResults(query) {
    const resultsWrap = document.getElementById('searchOverlayResults');
    if (!resultsWrap) return;

    const rawQ = (query || '').trim();
    if (!rawQ) {
      resultsWrap.innerHTML = `
        <div class="search-overlay-empty" style="display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
          <svg class="search-empty-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" style="display:block; margin-left:auto; margin-right:auto; align-self:center; margin-bottom:0.85rem; color:var(--color-leaf);">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <div class="search-empty-title" style="font-weight:600; color:var(--color-primary-dark); font-size:1.05rem; margin-bottom:0.35rem; text-align:center;">Search Fish Tales Living Catalogue</div>
          <div class="search-empty-desc" style="font-size:0.875rem; color:var(--text-muted); max-width:380px; margin:0 auto; line-height:1.45; text-align:center;">
            Type species name, strain or category — Betta, Guppy, Molly, Shrimps, Isopods, Tarantulas, or Living Aquariums.
          </div>
        </div>
      `;
      return;
    }

    const q = rawQ.toLowerCase();
    const queryTokens = q.split(/\s+/).filter(Boolean);

    const matches = PRODUCTS.filter(p => {
      initProductVariantsAndSpecs(p);

      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const catName = (p.categoryName || p.categoryLabel || '').toLowerCase();
      const subCat = (p.subCategory || '').toLowerCase();
      const subtitle = (p.subtitle || '').toLowerCase();
      const sciName = (p.scientificName || p.subtitle || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const id = (p.id || '').toLowerCase();

      // Combined searchable text corpus
      const corpus = `${name} ${cat} ${catName} ${subCat} ${subtitle} ${sciName} ${desc} ${id}`;

      // Every word in query should match (supporting plural/singular variations)
      return queryTokens.every(token => {
        if (corpus.includes(token)) return true;
        if (token.endsWith('s') && token.length > 3 && corpus.includes(token.slice(0, -1))) return true;
        if (!token.endsWith('s') && corpus.includes(token + 's')) return true;
        return false;
      });
    });

    if (matches.length === 0) {
      resultsWrap.innerHTML = `
        <div class="search-overlay-no-results" style="display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
          <div class="search-empty-icon" style="font-size:2rem; margin-bottom:0.5rem; display:block; margin-left:auto; margin-right:auto; align-self:center; text-align:center;">🔍</div>
          <div class="search-empty-title" style="font-weight:700; font-size:1.05rem; color:var(--color-primary-dark); margin-bottom:0.35rem; text-align:center;">
            No products found for "${escapeSearchHTML(rawQ)}"
          </div>
          <div class="search-empty-desc" style="font-size:0.875rem; color:var(--text-muted); max-width:360px; margin:0 auto; line-height:1.45; text-align:center;">
            We couldn't find any matching species, strains, or kits. Try checking your spelling or searching for a category like "Betta", "Guppy", "Molly", "Shrimp", "Isopod", or "Tarantula".
          </div>
        </div>
      `;
      return;
    }

    resultsWrap.innerHTML = matches.map(p => {
      const activeVariant = getProductSelectedVariant(p);
      const displayPrice = CartManager.formatPrice(activeVariant.price || p.price || 0);
      const unitLabel = activeVariant.unit ? ('/ ' + activeVariant.unit) : (p.pricingUnit ? ('/ ' + p.pricingUnit) : '');
      const thumbImg = p.image || PLACEHOLDER_IMG;
      const categoryMeta = p.categoryName || p.categoryLabel || 'Livestock';
      const subMeta = p.subCategory ? ` • ${p.subCategory.toUpperCase()}` : '';

      return `
        <div class="search-result-row" onclick="closeSearchOverlay(); navigateToProduct('${p.id}')" role="button" tabindex="0" title="View details for ${escapeSearchHTML(p.name)}">
          <div class="search-result-left">
            <img src="${thumbImg}" alt="${escapeSearchHTML(p.name)}" class="search-result-thumb" loading="lazy" onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}';">
            <div class="search-result-info">
              <div class="search-result-name">${escapeSearchHTML(p.name)}</div>
              <div class="search-result-meta">${escapeSearchHTML(categoryMeta)}${escapeSearchHTML(subMeta)}</div>
            </div>
          </div>
          <div class="search-result-right">
            <div class="search-result-price">${displayPrice}</div>
            <div class="search-result-unit">${escapeSearchHTML(unitLabel)}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  window.renderSearchOverlayResults = renderSearchOverlayResults;


  /* ── Mobile Menu Handlers ────────────────────────────────── */
  window.toggleMobileMenu = function (e) {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburger');
    const backdrop = document.getElementById('mobileNavBackdrop');
    if (!navMenu) return;

    const isOpen = navMenu.classList.toggle('active');

    if (hamburger) {
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      // Fallback for single-SVG markups
      const closeIcon = hamburger.querySelector('.icon-close');
      const burgerIcon = hamburger.querySelector('.icon-hamburger');
      if (!closeIcon || !burgerIcon) {
        hamburger.innerHTML = isOpen
          ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
          : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      }
    }

    if (backdrop) {
      backdrop.classList.toggle('active', isOpen);
    }
    document.body.classList.toggle('mobile-nav-open', isOpen);
    return isOpen;
  };

  window.closeMobileMenu = function () {
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburger');
    const backdrop = document.getElementById('mobileNavBackdrop');
    if (!navMenu) return;

    navMenu.classList.remove('active');

    if (hamburger) {
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      const closeIcon = hamburger.querySelector('.icon-close');
      const burgerIcon = hamburger.querySelector('.icon-hamburger');
      if (!closeIcon || !burgerIcon) {
        hamburger.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      }
    }

    if (backdrop) {
      backdrop.classList.remove('active');
    }
    document.body.classList.remove('mobile-nav-open');
  };

  window.initMobileMenu = function () {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (!hamburger || !navMenu) return;

    if (hamburger.dataset.menuInitialized === 'true') return;
    hamburger.dataset.menuInitialized = 'true';

    // Remove inline onclick to guarantee only this single listener handles clicks
    hamburger.removeAttribute('onclick');

    // Single dedicated click handler for hamburger
    hamburger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.toggleMobileMenu(e);
    });

    // Tapping on the backdrop closes the menu
    const backdrop = document.getElementById('mobileNavBackdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        e.preventDefault();
        window.closeMobileMenu();
      });
    }

    // Tapping any navigation link closes the menu
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        window.closeMobileMenu();
      });
    });

    // Tapping anywhere outside of navMenu and hamburger closes the menu
    document.addEventListener('click', (e) => {
      const nm = document.getElementById('navMenu');
      if (!nm || !nm.classList.contains('active')) return;
      if (e.target && (e.target.closest('#hamburger') || e.target.closest('#navMenu'))) {
        return;
      }
      window.closeMobileMenu();
    });
  };

  /* ── 10. Smooth Scroll & Navigation Helpers ──────────────── */
  window.setActiveNavKey = function (targetKey) {
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');
    if (!navLinks || navLinks.length === 0) return;

    navLinks.forEach(link => {
      const text = (link.textContent || '').trim().toLowerCase();
      const href = (link.getAttribute('href') || '').toLowerCase();

      let isMatch = false;
      if (targetKey === 'home' && text === 'home') {
        isMatch = true;
      } else if (targetKey === 'aquarium' && (text.includes('aquarium') || href.includes('aquarium-fish.html'))) {
        isMatch = true;
      } else if (targetKey === 'isopods' && (text === 'isopods' || href.includes('isopods.html'))) {
        isMatch = true;
      } else if (targetKey === 'tarantulas' && (text === 'tarantulas' || href.includes('tarantulas.html'))) {
        isMatch = true;
      } else if (targetKey === 'combos' && (text.includes('combo') || href.includes('combo-packs.html'))) {
        isMatch = true;
      } else if (targetKey === 'about' && (text.includes('about') || href.endsWith('#about'))) {
        isMatch = true;
      } else if (targetKey === 'contact' && (text.includes('contact') || href.endsWith('#contact'))) {
        isMatch = true;
      }

      if (isMatch) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  window.updateActiveNavLink = function () {
    let rawPath = window.location.pathname.toLowerCase().replace(/\\/g, '/');
    let page = rawPath.split('/').pop();
    if (!page || page === '') {
      page = 'index.html';
    }

    if (page.includes('aquarium-fish')) {
      window.setActiveNavKey('aquarium');
    } else if (page.includes('isopods')) {
      window.setActiveNavKey('isopods');
    } else if (page.includes('tarantulas')) {
      window.setActiveNavKey('tarantulas');
    } else if (page.includes('combo-packs')) {
      window.setActiveNavKey('combos');
    } else {
      // index.html / root
      const hash = (window.location.hash || '').toLowerCase();
      if (hash === '#about') {
        window.setActiveNavKey('about');
      } else if (hash === '#contact') {
        window.setActiveNavKey('contact');
      } else {
        window.setActiveNavKey('home');
      }
    }
  };

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

    if (elementId === 'about') {
      window.setActiveNavKey('about');
    } else if (elementId === 'contact') {
      window.setActiveNavKey('contact');
    } else if (elementId === 'hero' || elementId === 'catalogue' || elementId === 'categories') {
      window.setActiveNavKey('home');
    }
  };

  window.filterCategoryAndScroll = function (categoryKey) {
    if (typeof window.closeMobileMenu === "function") window.closeMobileMenu();
    const targetMap = {
      aquarium: 'aquarium-fish.html',
      isopods: 'isopods.html',
      tarantulas: 'tarantulas.html',
      combos: 'combo-packs.html'
    };

    const pageCat = getCurrentPageCategory();
    if (pageCat === categoryKey) {
      scrollToSection('catalogue');
      return;
    }

    if (targetMap[categoryKey]) {
      window.location.href = targetMap[categoryKey];
      return;
    }

    currentCategory = categoryKey;
    document.querySelectorAll('.filter-tab, .filter-pill').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === categoryKey);
    });
    renderProductGrid();
    scrollToSection('catalogue');
  };

  /* ── 10b. Promotional Auto-Slider ────────────────────────── */
  function initPromoSlider() {
    const container = document.getElementById('promoSliderContainer');
    const track = document.getElementById('promoSliderTrack');
    if (!container || !track) return;

    // Prevent duplicate initialization across DOMContentLoaded and readyState hooks
    if (container.dataset.sliderInitialized === 'true') return;
    container.dataset.sliderInitialized = 'true';

    const slides = container.querySelectorAll('.promo-slide');
    const dots = container.querySelectorAll('.promo-dot');
    if (slides.length <= 1) return;

    let currentIndex = 0;
    let autoplayTimer = null;
    let isHovered = false;
    const AUTOPLAY_INTERVAL = 3000;

    function goToSlide(index) {
      if (index < 0) {
        index = slides.length - 1;
      } else if (index >= slides.length) {
        index = 0;
      }
      currentIndex = index;

      slides.forEach((slide, i) => {
        const isActive = i === currentIndex;
        slide.classList.toggle('active', isActive);
        slide.setAttribute('aria-hidden', !isActive);
      });

      dots.forEach((dot, i) => {
        const isActive = i === currentIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    function stopAutoplay() {
      if (autoplayTimer !== null) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function startAutoplay() {
      stopAutoplay();
      if (document.hidden) return;
      if (isHovered) return;

      autoplayTimer = setInterval(() => {
        nextSlide();
      }, AUTOPLAY_INTERVAL);
    }

    // Clickable navigation dots: manual navigation restarts autoplay cycle
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const targetIdx = parseInt(dot.dataset.slide, 10);
        if (!isNaN(targetIdx) && targetIdx !== currentIndex) {
          goToSlide(targetIdx);
        }
        // Resume autoplay if not currently hovered (e.g. touch or keyboard navigation)
        if (!isHovered) {
          startAutoplay();
        }
      });
    });

    // Pause autoplay on desktop hover and resume when hover ends
    container.addEventListener('mouseenter', (e) => {
      if (e && e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
      isHovered = true;
      stopAutoplay();
    });

    container.addEventListener('mouseleave', () => {
      isHovered = false;
      startAutoplay();
    });

    // Window focus/blur safety handlers to prevent stuck hover states
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('blur', () => {
        isHovered = false;
        stopAutoplay();
      });

      window.addEventListener('focus', () => {
        isHovered = false;
        if (!document.hidden) {
          startAutoplay();
        }
      });
    }

    // Mobile Swipe Gestures
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const SWIPE_THRESHOLD = 40;

    track.addEventListener('touchstart', (e) => {
      isHovered = false; // Touch interactions must never engage hover state
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchEndX = touchStartX;
        touchEndY = touchStartY;
      }
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length === 1) {
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
      }
    }, { passive: true });

    track.addEventListener('touchend', () => {
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > SWIPE_THRESHOLD) {
        if (diffX < 0) {
          // Swipe left -> Next slide
          nextSlide();
        } else {
          // Swipe right -> Prev slide
          prevSlide();
        }
        startAutoplay(); // Reset autoplay timer on swipe
      }
    }, { passive: true });

    // Page visibility change handling to prevent timer queuing
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        isHovered = false;
        startAutoplay();
      }
    });

    // Start initial autoplay
    startAutoplay();
  }

  window.initPromoSlider = initPromoSlider;

  /* ── 11. DOM Initialization ──────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial cart badge & items render
    const initialItems = CartManager.load();
    CartManager.notify(initialItems);

    // 2. Sync category with dedicated page if applicable
    const initialPageCat = getCurrentPageCategory();
    if (initialPageCat !== 'all') {
      currentCategory = initialPageCat;
    }

    // Render initial product catalogue
    renderProductGrid();

    // 2a. Render Full Product Detail Page if #pdpMain exists
    if (document.getElementById('pdpMain')) {
      renderProductDetailPage();
    }
    window.addEventListener('popstate', () => {
      if (document.getElementById('pdpMain')) {
        renderProductDetailPage();
      }
    });

    // 2b. Initialize Promotional Auto-Slider if present
    initPromoSlider();

    // 2b. Automatically apply EXACTLY ONE active class based on current page
    window.updateActiveNavLink();
    window.addEventListener('hashchange', () => {
      window.updateActiveNavLink();
    });

    // 3. Header scroll effect and index.html section scroll spy
    const header = document.getElementById('siteHeader');
    const aboutSection = document.getElementById('about');
    const contactSection = document.getElementById('contact');

    window.addEventListener('scroll', () => {
      if (header) {
        if (window.scrollY > 20) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }

      // On index.html only: dynamically update active nav when scrolling into About or Contact
      if (aboutSection && contactSection) {
        const scrollPos = window.scrollY + 120;
        const contactTop = contactSection.offsetTop;
        const aboutTop = aboutSection.offsetTop;

        if (scrollPos >= contactTop) {
          window.setActiveNavKey('contact');
        } else if (scrollPos >= aboutTop) {
          window.setActiveNavKey('about');
        } else {
          window.setActiveNavKey('home');
        }
      }
    }, { passive: true });

    // 4. Mobile resize listener to reset overflow
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        if (typeof window.closeMobileMenu === "function") window.closeMobileMenu();
      }
    }, { passive: true });

    // 4. Mobile hamburger menu setup
    window.initMobileMenu();

    // 5. Category tabs click listeners
    document.querySelectorAll('.filter-tab, .filter-pill').forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.filter || tab.dataset.category;
        const pageCat = getCurrentPageCategory();
        if (pageCat === 'aquarium') {
          filterAquariumCategory(key);
        } else {
          filterByCategory(key);
        }
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

    // 8. Live search overlay input & backdrop click
    const searchOverlayInput = document.getElementById('searchOverlayInput');
    const searchOverlayClear = document.getElementById('searchOverlayClear');
    if (searchOverlayInput) {
      searchOverlayInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (searchOverlayClear) {
          if (val && val.trim().length > 0) {
            searchOverlayClear.classList.add('visible');
          } else {
            searchOverlayClear.classList.remove('visible');
          }
        }
        renderSearchOverlayResults(val);
      });
    }

    const searchOverlayEl = document.getElementById('searchOverlay');
    if (searchOverlayEl) {
      searchOverlayEl.addEventListener('click', (e) => {
        if (e.target === searchOverlayEl) {
          window.closeSearchOverlay();
        }
      });
    }

    // 9. Keyboard Esc to close overlays/modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (typeof window.closeCartDrawer === 'function') window.closeCartDrawer();
        if (typeof window.closeProductModal === 'function') window.closeProductModal();
        if (typeof window.closeCheckoutModal === 'function') window.closeCheckoutModal();
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

    // 10. Proceed to Checkout button in cart drawer
    const checkoutBtn = document.getElementById('cartDrawerCheckoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (CartManager.getCount() === 0) {
          showToast('Your cart is empty! Add items to continue.', 'error');
          return;
        }
        window.openCheckoutModal();
      });
    }
  });

  // Self-initialize if DOM is already ready
  if (document.readyState !== 'loading') {
    if (typeof window.initMobileMenu === 'function') {
      window.initMobileMenu();
    }
    if (typeof window.initPromoSlider === 'function') {
      window.initPromoSlider();
    }
  }

})();
