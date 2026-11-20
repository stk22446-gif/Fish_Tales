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
    combos: 'Combo Packs',
    cultures: 'Cultures'
  };

  function getProductPriceLabel(variant, category) {
    const u = (variant && variant.unit ? variant.unit.toLowerCase() : '');
    if (u.includes('pair')) return 'PRICE (PAIR):';
    if (u.includes('10 pcs') || u.includes('colony')) return 'PRICE (10 PCS):';
    if (u.includes('5 pcs') || u.includes('starter')) return 'PRICE (5 PCS):';
    if (u.includes('piece') || u.includes('pc')) return 'PRICE (PIECE):';
    if (u.includes('specimen')) return 'PRICE (SPECIMEN):';
    if (u.includes('kit') || category === 'combos') return 'PRICE (KIT):';
    if (u.includes('culture') || category === 'cultures') return 'PRICE (CULTURE):';
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

  function isBettaProduct(productOrItem) {
    if (!productOrItem) return false;
    const cat = String(productOrItem.category || '').toLowerCase();
    const subCat = String(productOrItem.subCategory || '').toLowerCase();
    const id = String(productOrItem.id || productOrItem.baseId || '').toLowerCase();
    const name = String(productOrItem.name || '').toLowerCase();

    // Avoid combo kits or tanks that mention betta
    if (cat === 'combos' || cat === 'combo' || subCat.includes('kit') || id.includes('kit') || name.includes('kit')) {
      return false;
    }

    if (subCat === 'betta') return true;
    if (id.includes('betta') || id.includes('samurai') || id.includes('crowntail')) return true;
    if (name.includes('betta')) return true;

    if (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS)) {
      const master = PRODUCTS.find(p => String(p.id) === id || String(p.id) === String(productOrItem.baseId));
      if (master && master.subCategory === 'betta') return true;
    }

    return false;
  }

  function getProductQuantityLabel(product) {
    if (!product) return 'Select Quantity';
    const subCat = (product.subCategory || '').toLowerCase();
    const id = (product.id || '').toLowerCase();
    const name = (product.name || '').toLowerCase();
    const pricingUnit = (product.unit || product.pricingUnit || '').toLowerCase();

    // Betta Fish is sold individually with Gender selection (Male/Female, unit: piece)
    if (isBettaProduct(product)) {
      return 'Select Quantity';
    }

    // Fish types using pairs: Guppy / Molly (or any product priced/sold per pair)
    if (subCat === 'guppy' || subCat === 'molly' ||
      id.includes('guppy') || id.includes('molly') ||
      name.includes('guppy') || name.includes('molly') ||
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
      'betta-avatar-stardust-plakat': 'Betta splendens (Shortfin Plakat)',
      'betta-rgg-ironman-halfmoon-plakat': 'Betta splendens (Halfmoon Plakat)',
      'betta-pure-white-crowntail': 'Betta splendens (Crowntail)',
      'molly-golden': 'Poecilia sphenops var. Golden',
      'molly-blue-eye-platinum-white-lyretail-balloon': 'Poecilia sphenops var. Balloon Lyretail',
      'molly-crystal-eye-zebra-lyretail-balloon': 'Poecilia sphenops var. Balloon Zebra',
      'molly-platinum-white-round-tail-balloon': 'Poecilia sphenops var. Balloon Round Tail',
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

    if (p.price === undefined || p.price === null || p.price === '') {
      p.price = null;
    } else {
      p.price = Number(p.price);
    }
    if (p.variants && Array.isArray(p.variants)) {
      p.variants.forEach(v => {
        if (!v.id) v.id = (v.name || '').toLowerCase();
        if (!v.label) v.label = v.name;
        if (!v.gender) v.gender = v.name;
        if (!v.unit) v.unit = p.unit || 'piece';
      });
      if ((p.price === null || p.price === undefined) && p.variants[0]) {
        p.price = Number(p.variants[0].price);
      }
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
    if (p.id === 'glacier-colony-pack') {
      p.packSize = '11 specimens (10 + 1 Free)';
      if (!p.size) p.size = p.packSize;
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
    if (!product) return { name: '', price: null, unit: 'piece', label: 'piece' };
    initProductVariantsAndSpecs(product);
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const selected = (typeof selectedVariants !== 'undefined' && selectedVariants[product.id] !== undefined)
        ? selectedVariants[product.id]
        : 0;
      let variant = null;
      if (typeof selected === 'string') {
        variant = product.variants.find(v => (v.name && v.name.toLowerCase() === selected.toLowerCase()) || (v.id && v.id.toLowerCase() === selected.toLowerCase()));
      } else if (typeof selected === 'number' && product.variants[selected]) {
        variant = product.variants[selected];
      }
      if (!variant) variant = product.variants[0];

      return {
        id: (variant.id || variant.name || '').toLowerCase(),
        name: `${product.name} (${variant.name})`,
        variantName: variant.name,
        gender: variant.gender || variant.name,
        price: Number(variant.price),
        unit: variant.unit || product.unit || product.pricingUnit || 'piece',
        label: variant.label || variant.name
      };
    }
    const hasPrice = product.price !== null && product.price !== undefined && !isNaN(product.price) && Number(product.price) > 0;
    return {
      name: product.name,
      price: hasPrice ? Number(product.price) : null,
      unit: product.unit || product.pricingUnit || 'piece',
      label: product.unit || product.pricingUnit || 'piece'
    };
  }

  /* ── 3. Master Product Catalogue (Standardized Schema) ───── */
  const PRODUCTS = [

    {
      id: "red-lace-guppy",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "Red Lace Guppy",
      subtitle: "Poecilia reticulata",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795120584/1d32a43e-2b75-4d81-84ce-695dcf14efae.png",
      images: [],
      video: "https://res.cloudinary.com/pv8lnpft/video/upload/v1795120621/WhatsApp_Video_2026-11-20_at_1.36.54_AM.mp4",
      description: "Striking red-orange lace-patterned caudal fin with intricate dark markings and a shimmering iridescent body. A beautiful fancy guppy for peaceful planted freshwater aquariums.",
      price: 249,
      unit: "pair",
      minQuantity: 1,
      size: "Adult Pair (1 Male + 1 Female)",

      overview: "The Red Lace Guppy (Poecilia reticulata) is a fancy freshwater livebearer admired for its vibrant red-orange coloration and distinctive lace-like tail pattern. Its peaceful temperament and active swimming behaviour make it suitable for compatible planted community aquariums.",

      careRequirements: {
        "Difficulty": "Beginner / Community",
        "Water Temperature": "22°C – 28°C",
        "Diet": "Omnivorous diet including quality micro-pellets, flakes, and live or frozen foods such as Daphnia and brine shrimp",
        "Lifespan": "Approximately 2 – 3 years",
        "pH Range": "6.8 – 7.8",
        "General Hardness (GH)": "Medium to hard (8 – 18 dGH)",
        "Temperament": "Peaceful and active community fish",
        "Social Behaviour": "Social fish that generally do well in groups of compatible guppies"
      },

      habitatSetup: {
        "Aquarium Size": "Approximately 40 litres (10 gallons) or larger; more space is recommended for groups",
        "Substrate": "Fine gravel or dark aquatic soil to highlight the fish's coloration",
        "Filtration": "Gentle sponge or suitable aquarium filtration",
        "Water Flow": "Low to moderate flow, suitable for fancy guppies with flowing fins",
        "Plants & Decor": "Java Moss, Hornwort and Anubias provide shelter and resting areas",
        "Swimming Space": "Maintain open swimming areas alongside planted sections",
        "Water Quality": "Maintain stable, clean and well-oxygenated water with zero ammonia and nitrite",
        "Tankmates": "Compatible with small, peaceful freshwater community fish; avoid aggressive and fin-nipping species",
        "Aquarium Cover": "A secure lid is recommended because guppies can jump"
      },

      didYouKnow: [
        "Guppies are popularly known as millionfish because of their prolific breeding ability.",
        "The Red Lace variety is admired for its intricate dark markings across its red-orange tail.",
        "Guppies are livebearers, meaning females give birth to free-swimming young rather than laying eggs.",
        "Male guppies are generally smaller and more colourful than females.",
        "Guppies are omnivores and benefit from a varied diet."
      ],

      featured: true
    }
    ,

    {
      id: "24k-guppy-gold-dumbo-ear",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "24K Gold Dumbo Ear Guppy",
      subtitle: "Poecilia reticulata",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795118986/a81d97a8-d9d9-4d9b-aa50-6a04b25e10cf.png",
      images: [],
      video: "",
      description: "Lustrous golden body coloration combined with enlarged, flowing Dumbo Ear pectoral fins. A graceful and eye-catching fancy guppy for planted freshwater aquariums.",
      price: 279,
      unit: "pair",
      minQuantity: 1,
      size: "Adult Pair (1 Male + 1 Female)",

      overview: "The Gold Dumbo Ear Guppy (Poecilia reticulata) is a selectively bred fancy guppy admired for its attractive golden coloration and oversized pectoral fins resembling elephant ears. Its peaceful temperament and active swimming behaviour make it suitable for compatible freshwater community aquariums.",

      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Water Temperature": "22°C – 28°C",
        "Diet": "Omnivorous diet including quality micro-pellets, flakes, and live or frozen foods such as Daphnia and brine shrimp",
        "Lifespan": "Approximately 2 – 3 years",
        "pH Range": "7.0 – 8.0",
        "Water Hardness": "Moderately hard to hard (8 – 15 dGH)",
        "Temperament": "Peaceful and active community fish",
        "Social Behaviour": "Social fish that generally do well in groups of compatible guppies"
      },

      habitatSetup: {
        "Aquarium Size": "Approximately 40 litres or larger; a 75-litre aquarium is preferable for a group",
        "Substrate": "Fine gravel or dark aquatic soil",
        "Filtration": "Gentle sponge filter or suitable aquarium filtration",
        "Water Flow": "Low to moderate flow to accommodate enlarged pectoral fins",
        "Plants & Decor": "Java Moss, Hornwort and Anubias provide shelter and resting areas",
        "Swimming Space": "Maintain open swimming areas alongside planted sections",
        "Water Quality": "Maintain stable, clean and well-oxygenated water with zero ammonia and nitrite",
        "Tankmates": "Compatible with small, peaceful freshwater fish; avoid aggressive and fin-nipping species",
        "Aquarium Cover": "Use a secure lid to prevent jumping"
      },

      didYouKnow: [
        "Dumbo Ear Guppies are named after their enlarged pectoral fins, which resemble elephant ears.",
        "The Dumbo Ear feature is a selectively bred trait of the common guppy.",
        "Guppies are livebearers, meaning females give birth to free-swimming young.",
        "Guppies are omnivores and benefit from a varied diet.",
        "Male guppies are generally smaller and more colourful than females."
      ],

      featured: false
    },

    {
      id: "santa-claus-dumbo-ear-guppy",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "Santa Claus Dumbo Ear Guppy ",
      subtitle: "Poecilia reticulata",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795120329/713b44ab-2a0d-4328-a4bb-f6c0ac05b14b.png",
      images: [],
      video: "https://res.cloudinary.com/pv8lnpft/video/upload/v1795120336/WhatsApp_Video_2026-11-20_at_1.46.03_AM.mp4",
      description: "Distinctive Dumbo Ear Guppy featuring enlarged, flowing pectoral fins, shimmering cobalt-blue coloration, and an elegant appearance in planted freshwater aquariums.",
      price: 249,
      unit: "pair",
      minQuantity: 1,
      size: "Adult Pair (1 Male + 1 Female)",

      overview: "The Santacruz Dumbo Ear Guppy (Poecilia reticulata) is a fancy guppy variety admired for its enlarged pectoral fins, iridescent blue coloration, and graceful swimming movements. Its peaceful temperament makes it suitable for compatible freshwater community aquariums.",

      careRequirements: {
        "Difficulty": "Beginner / Community",
        "Water Temperature": "22°C – 28°C",
        "Diet": "Omnivorous diet consisting of quality micro-pellets, flakes, and live or frozen foods such as Daphnia and brine shrimp",
        "Lifespan": "Approximately 2 – 3 years",
        "pH Range": "7.0 – 8.0",
        "Water Hardness": "Medium to hard (8 – 18 dGH)",
        "Temperament": "Peaceful and active community fish",
        "Social Behaviour": "Social fish that generally do well in groups of compatible guppies"
      },

      habitatSetup: {
        "Aquarium Size": "Approximately 40 litres or larger, with more space recommended for groups",
        "Substrate": "Fine gravel or dark aquatic soil",
        "Filtration": "Gentle sponge or suitable aquarium filtration",
        "Water Flow": "Low to moderate flow to accommodate flowing fins",
        "Plants & Decor": "Java Moss, Hornwort and Anubias provide shelter and resting areas",
        "Swimming Space": "Maintain open swimming areas alongside planted sections",
        "Water Quality": "Maintain stable, clean and well-oxygenated water with zero ammonia and nitrite",
        "Tankmates": "Compatible with small, peaceful freshwater community fish; avoid fin-nipping species"
      },

      didYouKnow: [
        "Guppies are commonly called millionfish because of their prolific breeding ability.",
        "Dumbo Ear Guppies are recognised by their enlarged pectoral fins, which resemble small ears.",
        "Guppies are livebearers, meaning females give birth to free-swimming young rather than laying eggs.",
        "Fancy guppy varieties have been developed through generations of selective breeding."
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
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795120049/c44e9c21-ca1e-4ad8-a5ca-9fbda2bbeefc.png",
      images: [],
      video: "",
      description: "Elegant platinum-white body coloration paired with enlarged Dumbo Ear pectoral fins and a broad, flowing halfmoon-shaped caudal fin.",
      price: 279,
      unit: "pair",
      minQuantity: 1,
      size: "Adult Pair (1 Male + 1 Female)",

      overview: "The Platinum Dumbo Ear Halfmoon Guppy (Poecilia reticulata) is a selectively bred fancy guppy admired for its shimmering platinum coloration, enlarged pectoral fins and impressive fan-shaped caudal fin. Its peaceful temperament makes it suitable for compatible freshwater community aquariums.",

      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Water Temperature": "22°C – 28°C",
        "Diet": "Omnivorous diet including quality micro-pellets, flakes, and live or frozen foods such as Daphnia and brine shrimp",
        "Lifespan": "Approximately 2 – 3 years",
        "pH Range": "7.0 – 8.0",
        "General Hardness (GH)": "Moderately hard to hard (8 – 18 dGH)",
        "Temperament": "Peaceful and active community fish",
        "Social Behaviour": "Social fish that generally do well in groups of compatible guppies"
      },

      habitatSetup: {
        "Aquarium Size": "Approximately 40 litres (10 gallons) or larger; a larger aquarium is preferable for groups",
        "Substrate": "Fine gravel or dark aquatic soil to highlight platinum coloration",
        "Filtration": "Gentle sponge filter or suitable aquarium filtration",
        "Water Flow": "Low to moderate flow to accommodate long, flowing fins",
        "Plants & Decor": "Java Moss, Hornwort and Anubias provide shelter and resting areas",
        "Swimming Space": "Maintain open swimming areas alongside planted sections",
        "Water Quality": "Maintain stable, clean and well-oxygenated water with zero ammonia and nitrite",
        "Tankmates": "Compatible with small, peaceful freshwater community fish; avoid aggressive and fin-nipping species",
        "Aquarium Cover": "A secure lid is recommended because guppies can jump"
      },

      didYouKnow: [
        "Halfmoon guppies are admired for their broad, fan-shaped caudal fins that can approach a 180-degree spread.",
        "Dumbo Ear Guppies have enlarged pectoral fins that resemble small ears.",
        "Guppies are livebearers, meaning females give birth to free-swimming young.",
        "Fancy guppy varieties have been developed through generations of selective breeding.",
        "Long flowing fins can make fancy guppies more vulnerable to fin-nipping tankmates."
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
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795120973/a8051b7a-057b-4647-b79c-76bf6fa1f2e6.png",
      images: ["https://res.cloudinary.com/pv8lnpft/image/upload/v1795120973/a8051b7a-057b-4647-b79c-76bf6fa1f2e6.png",
        "https://res.cloudinary.com/pv8lnpft/image/upload/v1795120985/0fcef0a3-f7ec-4595-bd2d-3309f61f32fa.png"
      ],
      video: "https://res.cloudinary.com/pv8lnpft/video/upload/v1795120900/WhatsApp_Video_2026-11-20_at_1.39.22_AM.mp4",
      description: "A striking fancy guppy featuring metallic blue dragon-scale patterns, oversized Dumbo Ear pectoral fins and a broad, flowing halfmoon-shaped tail.",
      price: 279,
      unit: "pair",
      minQuantity: 1,
      size: "Adult Pair (1 Male + 1 Female)",
      overview: "The Blue Dragon Dumbo Ear Halfmoon Guppy (Poecilia reticulata) is a selectively bred ornamental freshwater guppy admired for its shimmering blue metallic body, distinctive dragon-scale appearance, enlarged ear-like pectoral fins and impressive halfmoon tail. Its peaceful temperament makes it suitable for compatible freshwater community aquariums.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Water Temperature": "22°C – 28°C",
        "Diet": "Omnivorous diet including quality micro-pellets, flakes, and live or frozen foods such as Daphnia and brine shrimp",
        "Lifespan": "Approximately 2 – 3 years",
        "pH Range": "7.0 – 8.0",
        "General Hardness (GH)": "Moderately hard to hard (8 – 15 dGH)",
        "Temperament": "Peaceful and active community fish",
        "Social Behaviour": "Social fish that generally do well in groups of compatible guppies"
      },
      habitatSetup: {
        "Aquarium Size": "Approximately 40 litres (10 gallons) or larger; a larger aquarium is preferable for groups",
        "Substrate": "Fine gravel or dark aquatic soil to complement its metallic blue coloration",
        "Filtration": "Gentle sponge filter or suitable aquarium filtration",
        "Water Flow": "Low to moderate flow to accommodate enlarged pectoral fins and flowing tail",
        "Plants & Decor": "Java Moss, Hornwort and Anubias provide shelter and resting areas",
        "Swimming Space": "Maintain open swimming areas alongside planted sections",
        "Water Quality": "Use a fully cycled aquarium and maintain stable, clean water with zero ammonia and nitrite",
        "Tankmates": "Choose small, peaceful freshwater fish; avoid aggressive and fin-nipping species",
        "Aquarium Cover": "A secure lid is recommended because guppies can jump"
      },
      didYouKnow: [
        "Guppies are often called millionfish because they reproduce readily and produce live young.",
        "Dumbo Ear Guppies are named after their enlarged pectoral fins, which resemble elephant ears.",
        "Dragon guppy varieties are admired for their dense, metallic-looking scale patterns.",
        "Halfmoon guppies are prized for their broad, fan-shaped caudal fins.",
        "Female guppies give birth to free-swimming fry rather than laying eggs."
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
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795041020/dbfef8d3-2691-46eb-b482-9f2da25667ff.png",
      images: [],
      video: "",
      description: "An elegant fancy guppy featuring deep, velvety black coloration and distinctive enlarged Dumbo Ear pectoral fins that create a graceful swimming appearance.",
      price: 279,
      unit: "pair",
      minQuantity: 1,
      size: "Adult Pair (1 Male + 1 Female)",
      overview: "The Moscow Black Dumbo Ear Guppy (Poecilia reticulata) is a selectively bred ornamental freshwater guppy admired for its deep black coloration and enlarged, ear-like pectoral fins. Its peaceful temperament makes it suitable for compatible freshwater community aquariums.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Water Temperature": "22°C – 28°C",
        "Diet": "Omnivorous diet including quality micro-pellets, flakes, and live or frozen foods such as Daphnia and brine shrimp",
        "Lifespan": "Approximately 2 – 3 years",
        "pH Range": "7.0 – 8.0",
        "General Hardness (GH)": "Moderately hard to hard (8 – 15 dGH)",
        "Temperament": "Peaceful and active community fish",
        "Social Behaviour": "Social fish that generally do well in groups of compatible guppies"
      },
      habitatSetup: {
        "Aquarium Size": "Approximately 40 litres (10 gallons) or larger; a larger aquarium is preferable for groups",
        "Substrate": "Fine gravel or a lighter-coloured substrate can help the dark body coloration stand out",
        "Filtration": "Gentle sponge filter or suitable aquarium filtration",
        "Water Flow": "Low to moderate flow to accommodate enlarged pectoral fins",
        "Plants & Decor": "Java Moss, Hornwort and Anubias provide shelter and resting areas",
        "Swimming Space": "Maintain open swimming areas alongside planted sections",
        "Water Quality": "Use a fully cycled aquarium and maintain stable, clean water with zero ammonia and nitrite",
        "Tankmates": "Choose small, peaceful freshwater fish; avoid aggressive and fin-nipping species",
        "Aquarium Cover": "A secure lid is recommended because guppies can jump"
      },
      didYouKnow: [
        "Moscow guppies are selectively bred for their rich, solid body coloration.",
        "The Dumbo Ear trait refers to enlarged pectoral fins that resemble elephant ears.",
        "Guppies are livebearers, meaning females give birth to free-swimming young.",
        "Male Moscow guppies generally display stronger solid coloration than females.",
        "Fancy guppy varieties have been developed through generations of selective breeding."
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
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795041117/0b58d375-c049-443f-93c5-31bd17202aee.png",
      images: [],
      video: "",
      description: "A striking Albino Full Red (AFR) Guppy featuring rich, solid red coloration, a prominent oversized dorsal fin and flowing red tail.",
      price: 299,
      unit: "pair (Few Pair Left)",
      minQuantity: 1,
      size: "Adult Pair (1 Male + 1 Female)",
      overview: "The AFR Big Dorsal Guppy (Poecilia reticulata), short for Albino Full Red Big Dorsal, is a selectively bred ornamental freshwater guppy admired for its vivid red body and fins, distinctive albino pigmentation and enlarged, sail-like dorsal fin. Its peaceful temperament makes it suitable for compatible freshwater community aquariums.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Water Temperature": "22°C – 28°C",
        "Diet": "Omnivorous diet including quality micro-pellets, flakes, and live or frozen foods such as Daphnia and brine shrimp",
        "Lifespan": "Approximately 2 – 3 years",
        "pH Range": "7.0 – 8.0",
        "General Hardness (GH)": "Moderately hard to hard (8 – 15 dGH)",
        "Temperament": "Peaceful and active community fish",
        "Social Behaviour": "Social fish that generally do well in groups of compatible guppies"
      },
      habitatSetup: {
        "Aquarium Size": "Approximately 40 litres (10 gallons) or larger; a larger aquarium is preferable for groups",
        "Substrate": "Fine gravel or dark aquatic soil to complement its red coloration",
        "Filtration": "Gentle sponge filter or suitable aquarium filtration",
        "Water Flow": "Low to moderate flow to accommodate the enlarged dorsal and flowing tail",
        "Plants & Decor": "Java Moss, Hornwort and Anubias provide shelter and resting areas",
        "Lighting": "Moderate lighting with shaded areas is a sensible choice for albino fish",
        "Swimming Space": "Maintain open swimming areas alongside planted sections",
        "Water Quality": "Use a fully cycled aquarium and maintain stable, clean water with zero ammonia and nitrite",
        "Tankmates": "Choose small, peaceful freshwater fish; avoid aggressive and fin-nipping species",
        "Aquarium Cover": "A secure lid is recommended because guppies can jump"
      },
      didYouKnow: [
        "AFR stands for Albino Full Red, a guppy variety bred for its solid red coloration.",
        "Albino guppies lack much of their dark pigmentation and commonly have red or pinkish eyes.",
        "The Big Dorsal trait is prized for its enlarged, sail-like dorsal fin.",
        "Guppies are livebearers, meaning females give birth to free-swimming young.",
        "A varied omnivorous diet supports healthy growth and condition."
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
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795041233/5e956b3d-2f9a-4caa-a0a0-9b54fbb4cc5e.png",
      images: [],
      video: "",
      description: "A dramatic fancy guppy featuring a dark dragon-scale appearance with deep navy and violet undertones, complemented by distinctive enlarged Dumbo Ear pectoral fins.",
      price: 279,
      unit: "pair",
      minQuantity: 1,
      size: "Adult Pair (1 Male + 1 Female)",
      overview: "The Dark Knight Dragon Dumbo Ear Guppy (Poecilia reticulata) is a selectively bred ornamental freshwater guppy admired for its dark, metallic-looking dragon-scale appearance and enlarged, ear-like pectoral fins. Its peaceful temperament makes it suitable for compatible freshwater community aquariums.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Water Temperature": "22°C – 28°C",
        "Diet": "Omnivorous diet including quality micro-pellets, flakes, and live or frozen foods such as Daphnia and brine shrimp",
        "Lifespan": "Approximately 2 – 3 years",
        "pH Range": "7.0 – 8.0",
        "General Hardness (GH)": "Moderately hard to hard (8 – 15 dGH)",
        "Temperament": "Peaceful and active community fish",
        "Social Behaviour": "Social fish that generally do well in groups of compatible guppies"
      },
      habitatSetup: {
        "Aquarium Size": "Approximately 40 litres (10 gallons) or larger; a larger aquarium is preferable for groups",
        "Substrate": "Dark aquatic soil or fine gravel can complement its darker coloration",
        "Filtration": "Gentle sponge filter or suitable aquarium filtration",
        "Water Flow": "Low to moderate flow to accommodate enlarged pectoral fins",
        "Plants & Decor": "Java Moss, Hornwort and Anubias provide shelter and resting areas",
        "Swimming Space": "Maintain open swimming areas alongside planted sections",
        "Water Quality": "Use a fully cycled aquarium and maintain stable, clean water with zero ammonia and nitrite",
        "Tankmates": "Choose small, peaceful freshwater fish; avoid aggressive and fin-nipping species",
        "Aquarium Cover": "A secure lid is recommended because guppies can jump"
      },
      didYouKnow: [
        "Dumbo Ear Guppies are named after their enlarged pectoral fins, which resemble elephant ears.",
        "Dragon guppy varieties are admired for their distinctive metallic-looking scale patterns.",
        "Guppies are livebearers, meaning females give birth to free-swimming young.",
        "Fancy guppy varieties are developed through generations of selective breeding.",
        "Large flowing fins can make fancy guppies more vulnerable to fin-nipping tankmates."
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
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795120184/351224a6-652a-4cf6-951e-a7dd1ab3ab02.png",
      images: [],
      video: "",
      description: "An attractive fancy guppy featuring a shimmering platinum body, vibrant red and koi-style colour patches, and distinctive enlarged Dumbo Ear pectoral fins.",
      price: 279,
      unit: "pair",
      minQuantity: 1,
      size: "Adult Pair (1 Male + 1 Female)",
      overview: "The Red Platinum Koi Dumbo Ear Guppy (Poecilia reticulata) is a selectively bred ornamental freshwater guppy admired for its metallic platinum base colour, contrasting red and koi-style patches, and enlarged ear-like pectoral fins. Its peaceful temperament makes it suitable for compatible freshwater community aquariums.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Water Temperature": "22°C – 28°C",
        "Diet": "Omnivorous diet including quality micro-pellets, flakes, and live or frozen foods such as Daphnia and brine shrimp",
        "Lifespan": "Approximately 2 – 3 years",
        "pH Range": "7.0 – 8.0",
        "General Hardness (GH)": "Moderately hard to hard (8 – 15 dGH)",
        "Temperament": "Peaceful and active community fish",
        "Social Behaviour": "Social fish that generally do well in groups of compatible guppies"
      },
      habitatSetup: {
        "Aquarium Size": "Approximately 40 litres (10 gallons) or larger; a larger aquarium is preferable for groups",
        "Substrate": "Fine gravel or dark aquatic soil to complement its platinum and red coloration",
        "Filtration": "Gentle sponge filter or suitable aquarium filtration",
        "Water Flow": "Low to moderate flow to accommodate enlarged pectoral fins",
        "Plants & Decor": "Java Moss, Hornwort and Anubias provide shelter and resting areas",
        "Swimming Space": "Maintain open swimming areas alongside planted sections",
        "Water Quality": "Use a fully cycled aquarium and maintain stable, clean water with zero ammonia and nitrite",
        "Tankmates": "Choose small, peaceful freshwater fish; avoid aggressive and fin-nipping species",
        "Aquarium Cover": "A secure lid is recommended because guppies can jump"
      },
      didYouKnow: [
        "Koi guppies are admired for their contrasting patches of colour inspired by koi carp.",
        "Dumbo Ear Guppies have enlarged pectoral fins that resemble elephant ears.",
        "The platinum appearance comes from a metallic-looking body coloration.",
        "Guppies are livebearers, meaning females give birth to free-swimming young.",
        "Selective breeding produces a wide variety of guppy colours, patterns and fin shapes."
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
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795041721/36a59507-0fce-4013-bb37-a1ee990d9231.png",
      images: [],
      video: "",
      description: "A colourful fancy guppy featuring vibrant magenta-red body tones and distinctive tiger-like markings, creating a bold and eye-catching appearance.",
      price: 249,
      unit: "pair",
      minQuantity: 1,
      size: "Adult Pair (1 Male + 1 Female)",
      overview: "The Magenta Red Tiger Guppy (Poecilia reticulata) is an ornamental freshwater guppy admired for its rich magenta-red coloration and contrasting tiger-like body markings. Like other fancy guppies, it is a livebearing fish with a peaceful temperament, making it suitable for compatible freshwater community aquariums.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Water Temperature": "22°C – 28°C",
        "Diet": "Omnivorous diet including quality micro-pellets, flakes, and live or frozen foods such as Daphnia and brine shrimp",
        "Lifespan": "Approximately 2 – 3 years",
        "pH Range": "7.0 – 8.0",
        "General Hardness (GH)": "Moderately hard to hard (8 – 15 dGH)",
        "Temperament": "Peaceful and active community fish",
        "Social Behaviour": "Social fish that generally do well in groups of compatible guppies"
      },
      habitatSetup: {
        "Aquarium Size": "Approximately 40 litres (10 gallons) or larger; a larger aquarium is preferable for groups",
        "Substrate": "Fine gravel or dark aquatic soil to complement its vibrant coloration",
        "Filtration": "Gentle sponge filter or suitable aquarium filtration",
        "Water Flow": "Low to moderate flow",
        "Plants & Decor": "Java Moss, Hornwort and Anubias provide shelter and resting areas",
        "Swimming Space": "Maintain open swimming areas alongside planted sections",
        "Water Quality": "Use a fully cycled aquarium and maintain stable, clean water with zero ammonia and nitrite",
        "Tankmates": "Choose small, peaceful freshwater fish; avoid aggressive and fin-nipping species",
        "Aquarium Cover": "A secure lid is recommended because guppies can jump"
      },
      didYouKnow: [
        "Guppies are often called millionfish because they reproduce readily.",
        "Fancy guppies have been selectively bred into a wide range of colours and patterns.",
        "Tiger-like markings create a striped appearance that distinguishes this variety.",
        "Guppies are livebearers, meaning females give birth to free-swimming young.",
        "A varied omnivorous diet supports healthy growth and body condition."
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
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795041881/2fee6b82-750a-4955-bcb1-22151598f15d.png",
      images: [],
      video: "",
      description: "A striking two-tone fancy guppy featuring a light white or platinum front, a contrasting dark tuxedo-style rear body and elegant white flowing fins.",
      price: 249,
      unit: "pair",
      minQuantity: 1,
      size: "Adult Pair (1 Male + 1 Female)",
      overview: "The White Tuxido Guppy (Poecilia reticulata) is a selectively bred ornamental freshwater guppy admired for its distinctive tuxedo pattern, combining a light-coloured front with a dark rear body and white or platinum fins. Its peaceful temperament and active swimming behaviour make it suitable for compatible freshwater community aquariums.",
      careRequirements: {
        "Difficulty": "Beginner",
        "Water Temperature": "22°C – 28°C",
        "Diet": "Omnivorous diet including quality micro-pellets, flakes, and live or frozen foods such as Daphnia and baby brine shrimp",
        "Lifespan": "Approximately 2 – 3 years",
        "pH Range": "7.0 – 8.0",
        "General Hardness (GH)": "Moderately hard to hard (8 – 15 dGH)",
        "Temperament": "Peaceful and active community fish",
        "Social Behaviour": "Social fish that generally do well in groups of compatible guppies"
      },
      habitatSetup: {
        "Aquarium Size": "Approximately 40 litres (10 gallons) or larger; a larger aquarium is preferable for groups",
        "Substrate": "Dark gravel or aquatic soil can provide contrast against its light coloration",
        "Filtration": "Gentle sponge filter or suitable aquarium filtration",
        "Water Flow": "Low to moderate flow",
        "Plants & Decor": "Java Moss, Hornwort and Anubias provide shelter and resting areas",
        "Swimming Space": "Maintain open swimming areas alongside planted sections",
        "Water Quality": "Use a fully cycled aquarium and maintain stable, clean water with zero ammonia and nitrite",
        "Tankmates": "Choose small, peaceful freshwater fish; avoid aggressive and fin-nipping species",
        "Aquarium Cover": "A secure lid is recommended because guppies can jump"
      },
      didYouKnow: [
        "Tuxedo guppies are also commonly called Half Black guppies because of their contrasting dark rear body.",
        "White Tuxedo varieties combine the classic tuxedo pattern with pale or white fins.",
        "Guppies are livebearers, meaning females give birth to free-swimming young.",
        "Male guppies are generally smaller and more colourful than females.",
        "Guppies are omnivores and benefit from a varied diet."
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
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795042005/2c1b1c0a-4d08-4b6c-895b-61433aa33481.png",
      images: [],
      video: "",
      description: "A distinctive fancy guppy combining a shimmering silver or platinum-toned body with contrasting red dragon-style patterns across its flowing fins.",
      price: 279,
      unit: "pair",
      minQuantity: 1,
      size: "Adult Pair (1 Male + 1 Female)",
      overview: "The Silverado Red Dragon Guppy (Poecilia reticulata) is an ornamental freshwater guppy presented for its metallic silver body coloration and contrasting red dragon-style fin patterns. Its peaceful temperament makes it suitable for compatible freshwater community aquariums.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Water Temperature": "22°C – 28°C",
        "Diet": "Omnivorous diet including quality micro-pellets, flakes, and live or frozen foods such as Daphnia and brine shrimp",
        "Lifespan": "Approximately 2 – 3 years",
        "pH Range": "7.0 – 8.0",
        "General Hardness (GH)": "Moderately hard to hard (8 – 15 dGH)",
        "Temperament": "Peaceful and active community fish",
        "Social Behaviour": "Social fish that generally do well in groups of compatible guppies"
      },
      habitatSetup: {
        "Aquarium Size": "Approximately 40 litres (10 gallons) or larger; a larger aquarium is preferable for groups",
        "Substrate": "Dark aquatic soil or fine gravel can help highlight its metallic silver coloration",
        "Filtration": "Gentle sponge filter or suitable aquarium filtration",
        "Water Flow": "Low to moderate flow, especially if the fish has long flowing fins",
        "Plants & Decor": "Java Moss, Hornwort and Anubias provide shelter and resting areas",
        "Swimming Space": "Maintain open swimming areas alongside planted sections",
        "Water Quality": "Use a fully cycled aquarium and maintain stable, clean water with zero ammonia and nitrite",
        "Tankmates": "Choose small, peaceful freshwater fish; avoid aggressive and fin-nipping species",
        "Aquarium Cover": "A secure lid is recommended because guppies can jump"
      },
      didYouKnow: [
        "Silverado is a documented guppy colour strain associated with metallic silver coloration.",
        "The Silverado phenotype has been described as having silver iridophores that give the body its reflective appearance.",
        "Guppies are livebearers, meaning females give birth to free-swimming young.",
        "Fancy guppy varieties are developed through generations of selective breeding.",
        "A varied omnivorous diet supports healthy growth and body condition."
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
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795042216/687f7103-783a-477f-bb58-556898d5cac5.png",
      images: [],
      video: "",
      description: "A striking Moscow strain featuring rich metallic emerald-green to turquoise coloration extending across the body and flowing fins, creating a beautiful reflective sheen.",
      price: null,
      unit: "pair",
      minQuantity: 1,
      size: "Adult Pair (1 Male + 1 Female)",
      overview: "The Green Moscow Guppy (Poecilia reticulata) is a selectively bred ornamental freshwater guppy admired for its distinctive solid metallic green coloration. Its body and fins can display emerald, teal or turquoise tones depending on lighting and individual coloration. Its peaceful temperament makes it suitable for compatible freshwater community aquariums.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Water Temperature": "22°C – 28°C",
        "Diet": "Omnivorous diet including quality micro-pellets, flakes, and live or frozen foods such as Daphnia and brine shrimp",
        "Lifespan": "Approximately 2 – 3 years",
        "pH Range": "7.0 – 8.0",
        "General Hardness (GH)": "Moderately hard to hard (8 – 15 dGH)",
        "Temperament": "Peaceful and active community fish",
        "Social Behaviour": "Social fish that generally do well in groups of compatible guppies"
      },
      habitatSetup: {
        "Aquarium Size": "Approximately 40 litres (10 gallons) or larger; a larger aquarium is preferable for groups",
        "Substrate": "Dark aquatic soil or fine gravel can help highlight its metallic green coloration",
        "Filtration": "Gentle sponge filter or suitable aquarium filtration",
        "Water Flow": "Low to moderate flow",
        "Plants & Decor": "Java Moss, Hornwort and Anubias provide shelter and resting areas",
        "Swimming Space": "Maintain open swimming areas alongside planted sections",
        "Water Quality": "Use a fully cycled aquarium and maintain stable, clean water with zero ammonia and nitrite",
        "Tankmates": "Choose small, peaceful freshwater fish; avoid aggressive and fin-nipping species",
        "Aquarium Cover": "A secure lid is recommended because guppies can jump"
      },
      didYouKnow: [
        "Green Moscow is a colour variation of the Moscow guppy strain.",
        "Its green appearance is associated with yellow pigment cells interacting with the blue Moscow coloration.",
        "Metallic scales can reflect green, teal or turquoise depending on the viewing angle and lighting.",
        "Guppies are livebearers, meaning females give birth to free-swimming young.",
        "Male Moscow guppies generally display stronger and more uniform body coloration than females."
      ],
      featured: false
    },

    {
      id: "guppy-albino-white",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "guppy",
      name: "Albino White Guppy",
      subtitle: "Poecilia reticulata",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795040686/b9003b12-4cb1-47d2-bfd1-158d88df5155.png",
      images: [],
      video: "https://res.cloudinary.com/pv8lnpft/video/upload/v1795120066/WhatsApp_Video_2026-11-20_at_1.53.08_AM.mp4",
      description: "An elegant pure white albino strain featuring translucent pearl-white bodies, flowing snow-white fins, and striking ruby-red eyes that stand out vividly against dark substrates and lush aquarium plants.",
      price: 249,
      unit: "pair",
      minQuantity: 1,
      size: "Adult Pair (1 Male + 1 Female)",
      overview: "The Albino White Guppy (Poecilia reticulata) is a selectively bred ornamental freshwater guppy prized for its luminous, snow-white coloration and signature ruby-red eyes caused by the absence of dark melanin pigment. Its delicate, flowing caudal and dorsal fins create a graceful silhouette in planted aquariums. Peaceful and active, it thrives in well-maintained community setups.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Water Temperature": "22°C – 28°C",
        "Diet": "Omnivorous diet including high-quality micro-pellets, flakes, spirulina, and live or frozen foods such as Daphnia and baby brine shrimp",
        "Lifespan": "Approximately 2 – 3 years",
        "pH Range": "7.0 – 8.0",
        "General Hardness (GH)": "Moderately hard to hard (8 – 15 dGH)",
        "Temperament": "Peaceful and active community fish",
        "Social Behaviour": "Social fish that thrives in peaceful groups of compatible guppies"
      },
      habitatSetup: {
        "Aquarium Size": "Approximately 40 litres (10 gallons) or larger; a larger aquarium is preferable for groups",
        "Substrate": "Dark aquatic soil or black gravel creates strong visual contrast to highlight its pure white coloration",
        "Filtration": "Gentle sponge filter or low-flow aquarium filtration to protect flowing fins",
        "Water Flow": "Low to moderate flow",
        "Plants & Decor": "Java Moss, Hornwort, Anubias, and driftwood provide cover and resting areas",
        "Swimming Space": "Maintain open swimming areas alongside planted sections",
        "Water Quality": "Use a fully cycled aquarium and maintain stable, clean water with zero ammonia and nitrite",
        "Tankmates": "Choose small, peaceful freshwater fish; avoid aggressive or fin-nipping species",
        "Aquarium Cover": "A secure lid is recommended because guppies can jump"
      },
      didYouKnow: [
        "True Albino White Guppies lack melanin pigment, giving them their signature ruby-red eyes and luminous white scales.",
        "Because albino strains can be slightly more sensitive to bright aquarium lighting, floating plants help diffuse light and keep them comfortable.",
        "Dark aquarium backgrounds and substrates make their snow-white tails and fins appear even brighter.",
        "Guppies are livebearers, meaning females give birth to free-swimming fry.",
        "Males feature larger, more elaborate flowing delta or fan tails compared to the shorter, rounded fins of females."
      ],
      featured: false
    },

    {
      id: "black-samurai-plakat-betta",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "betta",
      name: "Black Samurai Plakat Betta",
      subtitle: "Betta splendens (Black Samurai Plakat Variety)",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795197330/03430d1a-c210-4fb3-8359-db7cc36874e7.png",
      images: [],
      video: "https://res.cloudinary.com/pv8lnpft/video/upload/v1795197472/WhatsApp_Video_2026-11-20_at_11.19.38_PM.mp4",
      description: "A striking Black Samurai Plakat Betta featuring a deep black body covered with shimmering metallic silver-white armour-like scales. Its compact body and short, powerful fins create a bold and distinctive appearance.",
      price: 499,
      unit: "piece",
      variants: [
        {
          name: "Male",
          price: 499
        },
        {
          name: "Female",
          price: 499
        }
      ],
      minQuantity: 1,
      size: "Adult (Approximately 5–7 cm including fins)",
      overview: "The Black Samurai Plakat Betta is a selectively bred variety of Betta splendens admired for its dramatic black and metallic silver-white coloration. Its characteristic Samurai pattern creates an armour-like appearance across the head and body, while the Plakat variety features shorter fins and a compact swimming profile. Individual fish may show natural variations in scale coverage, colour and pattern.",
      careRequirements: {
        "Difficulty": "Beginner with a properly equipped aquarium",
        "Water Temperature": "24°C – 28°C",
        "Diet": "Carnivorous; quality Betta pellets as the staple, supplemented with Daphnia, brine shrimp and bloodworms",
        "Lifespan": "Approximately 3 – 5 years with proper care",
        "pH Range": "6.5 – 7.5",
        "Temperament": "Territorial; adult males should be housed separately",
        "Social Behaviour": "Generally kept individually; carefully selected tankmates may be possible in a suitable aquarium"
      },
      habitatSetup: {
        "Aquarium Size": "At least 19 litres (5 gallons); around 38 litres (10 gallons) provides more stable conditions",
        "Heating": "Use an adjustable heater and thermometer to maintain stable warm water",
        "Filtration": "Gentle sponge filter or low-flow adjustable filtration",
        "Water Flow": "Low to moderate flow; avoid strong currents",
        "Substrate": "Smooth sand or fine gravel",
        "Plants & Decor": "Live plants such as Anubias and Java Fern, with smooth decorations and hiding spots",
        "Resting Areas": "Broad-leaf plants and resting spots near the water surface",
        "Water Quality": "Use a fully cycled aquarium and maintain zero ammonia and nitrite",
        "Aquarium Cover": "A secure lid is recommended because bettas can jump",
        "Tankmates": "Avoid housing adult males together; select community tankmates carefully"
      },
      didYouKnow: [
        "The Samurai pattern is known for its metallic, armour-like scale appearance.",
        "Plakat bettas have shorter fins than traditional long-finned varieties.",
        "The Black Samurai pattern can vary between individual fish.",
        "Bettas possess a specialised labyrinth organ that allows them to breathe atmospheric air.",
        "Male bettas are territorial and should not be housed together."
      ],
      featured: true
    },


    {
      id: "wild-mahachai-spade-tail",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "betta",
      name: "Wild (Mahachai Spade Tail)",
      subtitle: "Betta mahachaiensis",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795204570/069bbda9-f592-4b2e-b759-8d75772a12cd.png",
      images: [],
      video: "",
      description: "A stunning wild-type Betta featuring a dark brown-black body covered in brilliant metallic green and turquoise iridescence. Its distinctive spade-shaped tail and shimmering scale patterns create a beautiful natural appearance.",
      price: 1499,
      unit: "piece",
      minQuantity: 1,
      size: "Adult (Approximately 4 – 6 cm)",
      overview: "The Mahachai Betta (Betta mahachaiensis) is a wild Betta species native to the coastal region of Samut Sakhon, Thailand. It is recognised by its dark brown-to-black body, iridescent green-blue scale rows and characteristic markings on the gill covers. The Spade Tail form is a selectively bred aquarium variety with a distinctive pointed caudal-fin shape. This species naturally inhabits nipa palm swamps and brackish coastal waters.",
      careRequirements: {
        "Difficulty": "Intermediate",
        "Water Temperature": "22°C – 28°C",
        "Diet": "Carnivorous; offer Daphnia, Artemia, bloodworms and other small live or frozen invertebrates. Quality Betta pellets may also be accepted.",
        "Lifespan": "Approximately 3 – 5 years with proper care",
        "pH Range": "7.0 – 8.5 (documented care range; natural habitat measurements vary)",
        "Water Hardness": "Moderately hard to hard water; approximately 5 – 20 dGH",
        "Water Type": "Freshwater to slightly brackish conditions, depending on the fish's acclimation and source.",
        "Temperament": "Males can be territorial, particularly around breeding and nesting areas.",
        "Social Behaviour": "Best maintained as a species-focused setup. Carefully monitored male-female pairs may be kept in suitable conditions."
      },
      habitatSetup: {
        "Aquarium Size": "Approximately 40 – 45 litres or larger for a pair, with adequate floor space.",
        "Heating": "Use an adjustable heater and thermometer to maintain stable tropical temperatures.",
        "Filtration": "Gentle sponge filtration is recommended.",
        "Water Flow": "Low flow, with calm swimming areas.",
        "Substrate": "Fine sand or smooth aquarium gravel.",
        "Plants & Decor": "Dense live plants, floating vegetation, driftwood and natural hiding places.",
        "Leaf Litter": "Aquarium-safe dried leaves such as Indian Almond leaves can provide shelter and natural cover.",
        "Water Quality": "Use a fully cycled aquarium and maintain zero ammonia and nitrite.",
        "Aquarium Cover": "A secure lid is essential because Bettas are capable jumpers.",
        "Surface Access": "Keep the water surface accessible for atmospheric breathing and bubble-nest building.",
        "Acclimation": "Acclimate gradually to the aquarium's water parameters. Do not add salt without considering the fish's existing acclimation and source conditions."
      },
      didYouKnow: [
        "Betta mahachaiensis was scientifically described in 2012.",
        "It is native to coastal nipa palm swamps around Samut Sakhon, Thailand.",
        "Its metallic green-blue scale rows contrast beautifully against its dark body.",
        "Males build bubble nests, often using sheltered spaces near the water surface.",
        "It is the only Betta species known to be naturally restricted to brackish-water habitats.",
        "The Spade Tail form is a bred aquarium variety rather than a guaranteed natural feature of every wild specimen."
      ],
      featured: false
    },

    {
      id: "betta-avatar-stardust-plakat",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "betta",
      name: "Avatar Stardust",
      subtitle: "Betta splendens (Shortfin Plakat)",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795045676/7612bf26-e9d9-4217-891c-3fa2d710e805.png",
      images: [],
      video: "https://res.cloudinary.com/pv8lnpft/video/upload/v1795200735/WhatsApp_Video_2026-11-21_at_12.13.35_AM.mp4",
      description: "A spectacular short-finned Plakat Betta displaying a deep midnight-black base dusted with shimmering metallic blue and cyan scales reminiscent of a cosmic starfield. Active, vigorous, and agile.",
      price: 3499,
      unit: "piece",
      minQuantity: 1,
      size: "Adult (Male)",
      overview: "Avatar Stardust is a highly prized modern Betta splendens morph celebrated for its dark, velvety black body heavily speckled with luminous, star-like metallic cyan and electric blue scales. As a traditional Plakat variety, it possesses compact, muscular finnage that allows swift, unhindered swimming and superior stamina compared to heavy long-finned varieties. Each individual specimen displays a unique constellation of iridescence.",
      careRequirements: {
        "Difficulty": "Beginner with suitable heated nano setup",
        "Water Temperature": "25°C – 29°C (stable heater required)",
        "Diet": "Carnivorous; high-protein micro-pellets, frozen bloodworms, live daphnia and mosquito larvae",
        "Lifespan": "Approximately 3 – 5 years",
        "pH Range": "6.5 – 7.5",
        "General Hardness (GH)": "Soft to moderately hard (4 – 10 dGH)",
        "Temperament": "Territorial; adult males must be housed solitary",
        "Social Behaviour": "Solitary centerpiece; responds actively to keeper interaction"
      },
      habitatSetup: {
        "Aquarium Size": "Minimum 15 to 25 litres (4–6 gallons) for an individual adult",
        "Heating": "Reliable preset or adjustable aquarium heater to maintain tropical warmth",
        "Filtration": "Gentle sponge filter or baffled low-flow filter",
        "Water Flow": "Low flow; plakat bettas are agile swimmers but still prefer gentle currents",
        "Plants & Decor": "Live plants like Anubias, Java Fern, and resting hammocks near the surface",
        "Water Quality": "Fully cycled aquarium; maintain clean water with zero ammonia and nitrite",
        "Aquarium Cover": "Tight-fitting lid is essential as bettas are accomplished jumpers"
      },
      didYouKnow: [
        "Plakat (from the Thai word 'Plakad') refers to the short-finned, athletic fighting-type finnage closely related to wild bettas.",
        "The 'Avatar' morph is known for developing increasing metallic blue dusting as the fish matures.",
        "Bettas breathe atmospheric air directly using their labyrinth organ, requiring access to the water surface.",
        "Shortfin bettas are less prone to fin nipping and fin rot than long-finned counterparts due to their compact finnage."
      ],
      featured: true
    },

    {
      id: "betta-rgg-ironman-halfmoon-plakat",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "betta",
      name: "RGG Ironman — Halfmoon",
      subtitle: "Betta splendens (Halfmoon Plakat)",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795201198/ac0bfb02-53c6-4db6-a786-39f450ba6e42.png",
      images: [],
      video: "",
      description: "A bold Halfmoon Plakat (HMPK) Betta characterized by a dynamic red, gold, and metallic armored mask pattern reminiscent of the iconic Ironman color scheme, paired with a crisp 180-degree caudal spread.",
      price: 1249,
      unit: "piece",
      minQuantity: 1,
      size: "Adult (Male)",
      overview: "The RGG (Red Gold Green / Red Galaxy Gold) Ironman Halfmoon Plakat is an elite exhibition-grade Betta splendens strain. It blends bold red and metallic gold or copper scaling across its flanks with an armored head mask, echoing the famous superhero aesthetic. As a Halfmoon Plakat, it features short, stout rays with a wide D-shaped 180-degree tail flare, combining show-quality conformation with robust vitality.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Water Temperature": "25°C – 28°C",
        "Diet": "Strictly carnivorous; premium betta pellets, frozen brine shrimp, mysis, and daphnia",
        "Lifespan": "Approximately 3 – 5 years",
        "pH Range": "6.5 – 7.4",
        "General Hardness (GH)": "5 – 12 dGH",
        "Temperament": "Territorial and assertive; keep singly",
        "Social Behaviour": "Solitary male display fish; flaring exercises maintain fin tone"
      },
      habitatSetup: {
        "Aquarium Size": "Minimum 20 litres (5 gallons)",
        "Heating": "Submersible heater to maintain stable tropical temperatures",
        "Filtration": "Low-flow sponge filtration to protect finnage",
        "Water Flow": "Very gentle current",
        "Plants & Decor": "Broad-leafed plants such as Anubias barteri for surface resting",
        "Water Quality": "Mature cycled nitrogen cycle with weekly water refreshes",
        "Aquarium Cover": "Secure lid with slight air gap for labyrinth breathing"
      },
      didYouKnow: [
        "Halfmoon Plakat (HMPK) bettas have a caudal fin that expands to a full 180-degree semi-circle when flared.",
        "The Ironman coloration combines rich crimson base tones with metallic copper-gold iridophores.",
        "Brief daily flaring using a small mirror provides healthy exercise and keeps fin rays straight and supple.",
        "Bettas can recognize their human caretakers and often swim to the front of the tank during feeding times."
      ],
      featured: true
    },

    {
      id: "wild-imbellis-spade-tail",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "betta",
      name: "Wild (Imbellis Spade Tail)",
      subtitle: "Betta imbellis",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795203367/edd5ed84-a9b6-4476-819f-f6951cb021ee.png",
      images: [],
      video: "",
      description: "A fascinating wild-type Betta featuring an elegant spade-shaped tail, dark body and iridescent blue-green scale patterns. Its natural appearance and distinctive fin markings make it an attractive addition to specialised freshwater aquariums.",
      price: 1499,
      unit: "piece",
      minQuantity: 1,
      size: "Adult (Approximately 4 – 6 cm)",
      overview: "Betta imbellis, commonly known as the Crescent Betta or Peaceful Betta, is a wild Betta species native to parts of Southeast Asia, including Thailand and Malaysia. It is recognised for its dark body, iridescent blue-green markings and characteristic reddish crescent along the tail edge. The Spade Tail designation describes the fin shape offered in this trade variety. It is a bubble-nesting labyrinth fish that prefers calm, warm and densely planted freshwater environments.",
      careRequirements: {
        "Difficulty": "Intermediate",
        "Water Temperature": "24°C – 28°C",
        "Diet": "Carnivorous; offer quality Betta pellets along with Daphnia, Artemia, mosquito larvae and other suitable live or frozen foods.",
        "Lifespan": "Approximately 3 – 5 years with proper care",
        "pH Range": "5.0 – 7.5",
        "Water Hardness": "Soft to moderately hard water; approximately 1 – 10 dGH",
        "Temperament": "Generally less aggressive than domesticated Betta splendens, but males can still be territorial.",
        "Social Behaviour": "Can be maintained individually. Pair or group keeping requires a suitably spacious, densely planted aquarium and careful monitoring."
      },
      habitatSetup: {
        "Aquarium Size": "Approximately 40 litres or larger for a pair; provide more space for groups.",
        "Heating": "Use an adjustable aquarium heater and thermometer to maintain stable tropical temperatures.",
        "Filtration": "Gentle sponge filtration is recommended.",
        "Water Flow": "Low flow, as this species prefers calm water.",
        "Substrate": "Fine sand or smooth aquarium gravel.",
        "Plants & Decor": "Use dense live plants, floating plants, driftwood and natural hiding places.",
        "Leaf Litter": "Indian Almond leaves and other aquarium-safe botanicals can provide natural cover.",
        "Water Quality": "Maintain a fully cycled aquarium with zero ammonia and nitrite and stable water conditions.",
        "Aquarium Cover": "A secure lid is essential because wild Bettas are capable jumpers.",
        "Surface Access": "Keep the water surface accessible for atmospheric breathing and bubble-nest building."
      },
      didYouKnow: [
        "Betta imbellis is commonly known as the Crescent Betta or Peaceful Betta.",
        "Its reddish crescent-shaped tail marking is one of its characteristic features.",
        "It is a bubble-nesting species, with males guarding the nest.",
        "It possesses a specialised labyrinth organ that allows it to breathe atmospheric air.",
        "Despite its common name, males can still show territorial behaviour.",
        "It naturally inhabits slow-moving and vegetation-rich freshwater environments."
      ],
      featured: false
    },

    {
      id: "nemo-galaxy-rosetail-betta",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "betta",
      name: "Nemo Galaxy Rosetail",
      subtitle: "Betta splendens (Nemo Galaxy Rosetail Variety)",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795204834/aaf5eff5-1e9d-4980-bfc2-09285e81a989.jpg",
      images: [],
      video: "https://res.cloudinary.com/pv8lnpft/video/upload/v1795204862/WhatsApp_Video_2026-11-21_at_1.27.35_AM.mp4",
      description: "A spectacular ornamental Betta featuring vibrant Nemo-inspired orange, red and yellow colour patches, shimmering metallic Galaxy scales and luxurious Rosetail finnage. Its heavily branched, flowing tail creates an elegant rose-petal appearance.",
      price: 799,
      unit: "piece",
      minQuantity: 1,
      variants: [
        {
          name: "Male",
          price: 799
        },
        {
          name: "Female",
          price: 499
        }
      ],
      size: "Adult (Approximately 5 – 7 cm including fins)",
      overview: "The Nemo Galaxy Rosetail Betta is a selectively bred variety of Betta splendens that combines a bright Nemo-style multicolour pattern with reflective Galaxy scales and elaborate Rosetail fins. Nemo patterns commonly feature orange, red and yellow tones, while Galaxy markings add metallic or iridescent scale coverage. The Rosetail finnage is characterised by extensive branching of the tail rays, creating overlapping, ruffled edges resembling rose petals. Individual colour patterns and fin development can vary between fish.",
      careRequirements: {
        "Difficulty": "Intermediate",
        "Water Temperature": "24°C – 28°C",
        "Diet": "Carnivorous; quality Betta pellets as the staple, supplemented with Daphnia, brine shrimp and occasional bloodworms.",
        "Lifespan": "Approximately 3 – 5 years with proper care",
        "pH Range": "6.5 – 7.5",
        "Water Hardness": "Soft to moderately hard water",
        "Temperament": "Territorial; adult males should be housed separately.",
        "Social Behaviour": "Generally kept individually. Avoid fin-nipping tankmates.",
        "Fin Care": "Heavy Rosetail finnage requires gentle water flow, clean water and smooth aquarium decor."
      },
      habitatSetup: {
        "Aquarium Size": "At least 19 litres (5 gallons); approximately 38 litres (10 gallons) provides more stable conditions.",
        "Heating": "Use an adjustable heater and thermometer to maintain stable tropical temperatures.",
        "Filtration": "Gentle sponge filter or low-flow adjustable filtration.",
        "Water Flow": "Very gentle flow to prevent excessive effort when swimming.",
        "Substrate": "Smooth sand or fine aquarium gravel.",
        "Plants & Decor": "Live plants such as Anubias and Java Fern, with smooth decorations and hiding places.",
        "Resting Areas": "Broad-leaf plants and resting spots near the water surface.",
        "Water Quality": "Use a fully cycled aquarium. Maintain zero ammonia and nitrite and keep nitrate controlled.",
        "Aquarium Cover": "A secure lid is recommended because Bettas can jump.",
        "Fin Protection": "Avoid sharp ornaments, rough surfaces and strong filter intakes that may damage delicate fins."
      },
      didYouKnow: [
        "Nemo is a trade description commonly associated with bright orange, red and yellow Betta colour patterns.",
        "Galaxy refers to reflective metallic or iridescent scale markings.",
        "Rosetail Bettas have heavily branched tail rays that create a ruffled, rose-petal appearance.",
        "Rosetail is a fin variation related to Halfmoon finnage.",
        "Excessively heavy finnage can make swimming difficult, so good fin balance and mobility are important.",
        "Marble-influenced colour patterns may change as the fish grows."
      ],
      featured: false
    },

    {
      id: "nemo-candy-crowntail-betta",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "betta",
      name: "Nemo Candy Crowntail",
      subtitle: "Betta splendens (Nemo Candy Crowntail Variety)",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795205516/0b1883d3-b7d0-479d-80d3-dff2a8f32a7b.jpg",
      images: [],
      video: "https://res.cloudinary.com/pv8lnpft/video/upload/v1795205655/WhatsApp_Video_2026-11-21_at_1.40.43_AM.mp4",
      description: "A vibrant ornamental Betta featuring a colourful Nemo-inspired combination of orange, red and yellow patterns with distinctive crown-like fins. Its extended fin rays and reduced webbing create a dramatic spiky appearance.",
      price: 1399,
      unit: "piece",
      minQuantity: 1,
      size: "Adult (Approximately 5 – 7 cm including fins)",
      overview: "The Nemo Candy Crowntail Betta is a selectively bred variety of Betta splendens combining a bright multicolour Nemo or Candy pattern with distinctive Crowntail finnage. Its colour pattern may feature orange, red, yellow, white and other contrasting shades. The Crowntail characteristic comes from extended fin rays that project beyond the reduced webbing, creating a crown-like silhouette. Individual fish can vary in colour distribution, pattern and fin development.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Water Temperature": "24°C – 28°C",
        "Diet": "Carnivorous; quality Betta pellets as the staple, supplemented with Daphnia, brine shrimp and occasional bloodworms.",
        "Lifespan": "Approximately 3 – 5 years with proper care",
        "pH Range": "6.5 – 7.5",
        "Water Hardness": "Soft to moderately hard water",
        "Temperament": "Territorial; adult males should be housed separately.",
        "Social Behaviour": "Generally kept individually. Avoid aggressive and fin-nipping tankmates.",
        "Fin Care": "Extended fin rays require clean water, gentle flow and smooth aquarium decor."
      },
      habitatSetup: {
        "Aquarium Size": "At least 19 litres (5 gallons); approximately 38 litres (10 gallons) provides more stable conditions.",
        "Heating": "Use an adjustable heater and thermometer to maintain stable tropical temperatures.",
        "Filtration": "Gentle sponge filter or low-flow adjustable filtration.",
        "Water Flow": "Gentle current to avoid stressing the extended fins.",
        "Substrate": "Smooth sand or fine aquarium gravel.",
        "Plants & Decor": "Live plants such as Anubias and Java Fern, with smooth decorations and hiding places.",
        "Resting Areas": "Broad-leaf plants and resting spots near the water surface.",
        "Water Quality": "Use a fully cycled aquarium and maintain zero ammonia and nitrite.",
        "Aquarium Cover": "A secure lid is recommended because Bettas can jump.",
        "Fin Protection": "Avoid sharp ornaments, rough surfaces and strong filter intakes."
      },
      didYouKnow: [
        "Nemo is a hobby colour-pattern name commonly associated with orange, red and yellow Betta markings.",
        "Candy patterns can contain several contrasting colours and vary between individual fish.",
        "Crowntail fins have extended rays with reduced webbing between them.",
        "The Crowntail is a fin type, while Nemo Candy describes the colour pattern.",
        "Bettas can breathe atmospheric air using a specialised labyrinth organ."
      ],
      featured: false
    },


    {
      id: "nemo-candy-plakat-betta",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "betta",
      name: "Nemo Candy PK Betta",
      subtitle: "Betta splendens (Nemo Candy Plakat)",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795206037/052793c6-ce31-4065-9e29-7625704f4ef0.jpg",
      images: [],
      video: "https://res.cloudinary.com/pv8lnpft/video/upload/v1795206053/WhatsApp_Video_2026-11-21_at_1.47.37_AM.mp4",
      description:
        "Nemo Candy Plakat Betta is a colourful short-finned Betta splendens variety. It displays attractive combinations of orange, red, yellow, white and sometimes blue or dark patches. Each fish has its own unique colour distribution and pattern.",
      price: 699,
      unit: "piece",
      minQuantity: 1,
      variants: [
        { name: "Male", price: 699 },
        { name: "Female", price: 499 }
      ],
      size: "Standard",
      overview:
        "Nemo Candy describes the colour and pattern, while Plakat (PK) describes the short-fin form. Plakat Bettas have compact fins and an active swimming style. Individual colours and markings may vary.",
      careRequirements: {
        temperature: "25–28°C",
        pH: "6.5–7.5",
        diet: "High-quality Betta pellets, frozen or live foods such as brine shrimp and bloodworms",
        temperament: "Territorial; keep males separately",
        careLevel: "Beginner to Intermediate"
      },
      habitatSetup: {
        tankSize: "At least 19 litres recommended",
        filtration: "Gentle filtration",
        heating: "Stable tropical temperature with a heater",
        plants: "Live plants and hiding spaces",
        water: "Clean, conditioned and properly cycled water"
      },
      didYouKnow: [
        "Nemo Candy is a trade colour-pattern name, not a separate Betta species.",
        "PK stands for Plakat, which means short-finned.",
        "Every Nemo Candy Betta can have a unique colour pattern.",
        "Male and female fish may differ in body shape and fin appearance."
      ],
      featured: false
    },

    {
      id: "hmpk-nemo-candy-dumbo-ear-betta",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "betta",
      name: "HMPK Nemo Candy Dumbo Ear Betta",
      subtitle: "Betta splendens (Halfmoon Plakat Nemo Candy Dumbo Ear)",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795206236/a3bcd590-8f9e-4842-a9bc-cf831d7ca836.png",
      images: ["https://res.cloudinary.com/pv8lnpft/image/upload/v1795206236/a3bcd590-8f9e-4842-a9bc-cf831d7ca836.png",
        "https://res.cloudinary.com/pv8lnpft/image/upload/v1795206452/288d567e-7898-47ca-bdaf-7d94a02d6ea6.jpg"
      ],
      video: "https://res.cloudinary.com/pv8lnpft/video/upload/v1795206288/WhatsApp_Video_2026-11-21_at_1.49.35_AM.mp4",
      description:
        "The HMPK Nemo Candy Dumbo Ear Betta is a colourful ornamental Betta splendens variety featuring a Nemo Candy-inspired multicolour pattern, compact Plakat fins and enlarged pectoral fins known as Dumbo Ears. Its colours may include vibrant orange, red, yellow, white and other contrasting shades.",
      price: 1399,
      unit: "piece",
      minQuantity: 1,
      variants: [
        { name: "Male", price: 1399 },
        { name: "Female", price: 799 }
      ],
      size: "Standard",
      overview:
        "HMPK stands for Halfmoon Plakat, combining a short-finned Plakat body with a broad Halfmoon-style tail. Dumbo Ear refers to the enlarged pectoral fins, while Nemo Candy describes the colour pattern. Each fish has its own unique markings and colour distribution.",
      careRequirements: {
        temperature: "25–28°C",
        pH: "6.5–7.5",
        diet: "High-quality Betta pellets, frozen or live foods such as brine shrimp and bloodworms",
        temperament: "Territorial; males should be housed separately",
        careLevel: "Beginner to Intermediate"
      },
      habitatSetup: {
        tankSize: "At least 19 litres recommended",
        filtration: "Gentle filtration with low water flow",
        heating: "Stable tropical temperature with a heater",
        plants: "Live plants and resting or hiding spaces",
        water: "Clean, conditioned and properly cycled water"
      },
      didYouKnow: [
        "HMPK combines Halfmoon-style tail shape with short Plakat fins.",
        "Dumbo Ears are enlarged pectoral fins that resemble elephant ears.",
        "Nemo Candy refers to the colour pattern, not a separate Betta species.",
        "Male and female Bettas can differ in fin development and appearance."
      ],
      featured: false
    },

    {
      id: "hmpk-dumbo-ear-betta",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "betta",
      name: "HMPK Dumbo Ear Betta",
      subtitle: "Betta splendens (Halfmoon Plakat Dumbo Ear)",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795205212/aafcd56e-d0af-4f67-9db5-e211af8d4762.jpg",
      images: ["https://res.cloudinary.com/pv8lnpft/image/upload/v1795205212/aafcd56e-d0af-4f67-9db5-e211af8d4762.jpg",
        "https://res.cloudinary.com/pv8lnpft/image/upload/v1795205229/2f8d0fd0-e9c0-4c4c-8a3c-f681a4f867f9.jpg"
      ],
      video: "https://res.cloudinary.com/pv8lnpft/video/upload/v1795205390/WhatsApp_Video_2026-11-21_at_1.34.23_AM.mp4",
      description: "A distinctive Betta variety combining the compact, short-finned Halfmoon Plakat body with oversized Dumbo Ear pectoral fins. Its broad, wing-like side fins and wide halfmoon-shaped tail create an impressive swimming display.",
      price: 499,
      unit: "piece",
      minQuantity: 1,
      size: "Adult (Approximately 5 – 7 cm including fins)",
      overview: "The HMPK Dumbo Ear Betta is a selectively bred variety of Betta splendens combining two distinctive finnage traits. HMPK (Halfmoon Plakat) describes its short-finned body and broad tail that can spread towards a halfmoon shape, while Dumbo Ear refers to its enlarged pectoral fins resembling elephant ears. The combination creates a compact, muscular-looking fish with unusually prominent side fins. Colour and pattern can vary between individual specimens.",
      careRequirements: {
        "Difficulty": "Intermediate",
        "Water Temperature": "25°C – 28°C",
        "Diet": "Carnivorous; quality Betta pellets as the staple, supplemented with Daphnia, brine shrimp and occasional bloodworms.",
        "Lifespan": "Approximately 3 – 5 years with proper care",
        "pH Range": "6.5 – 7.5",
        "Water Hardness": "Soft to moderately hard water",
        "Temperament": "Territorial; adult males should be housed separately.",
        "Social Behaviour": "Generally kept individually. Avoid aggressive or fin-nipping tankmates.",
        "Fin Care": "Large pectoral fins need clean water, gentle flow and smooth aquarium decor."
      },
      habitatSetup: {
        "Aquarium Size": "At least 19 litres (5 gallons); approximately 38 litres (10 gallons) provides more stable conditions.",
        "Heating": "Use an adjustable heater and thermometer to maintain stable tropical temperatures.",
        "Filtration": "Gentle sponge filter or low-flow adjustable filtration.",
        "Water Flow": "Very gentle current to make swimming easier for the enlarged pectoral fins.",
        "Substrate": "Smooth sand or fine aquarium gravel.",
        "Plants & Decor": "Live plants such as Anubias and Java Fern, with smooth decorations and hiding places.",
        "Resting Areas": "Broad-leaf plants and resting spots near the water surface.",
        "Water Quality": "Use a fully cycled aquarium and maintain zero ammonia and nitrite.",
        "Aquarium Cover": "A secure lid is recommended because Bettas can jump.",
        "Fin Protection": "Avoid sharp ornaments, rough surfaces and strong filter intakes."
      },
      didYouKnow: [
        "HMPK stands for Halfmoon Plakat, a short-finned Betta form with a broad halfmoon-style tail.",
        "Dumbo Ear refers to enlarged pectoral fins, not the tail shape.",
        "The enlarged pectoral fins are also called Elephant Ears or Big Ears.",
        "Dumbo fins can occur with different tail types, including Plakat and Halfmoon.",
        "Both male and female Bettas can display the Dumbo Ear trait."
      ],
      featured: false
    },

    {
      id: "crowntail-betta",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "betta",
      name: "Crowntail Betta Fish",
      subtitle: "Betta splendens (Crowntail Variety)",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795206769/4f6b058e-3c7d-4883-a514-359525e6e4ce.jpg",
      images: ["https://res.cloudinary.com/pv8lnpft/image/upload/v1795206769/4f6b058e-3c7d-4883-a514-359525e6e4ce.jpg",
        "https://res.cloudinary.com/pv8lnpft/image/upload/v1795207232/71e6bbe6-231b-445f-b965-d2c5ef088b1b.jpg"
      ],
      video: "https://res.cloudinary.com/pv8lnpft/video/upload/v1795206920/WhatsApp_Video_2026-11-21_at_2.00.26_AM.mp4",
      description:
        "Crowntail Betta is a beautiful ornamental freshwater fish known for its distinctive spiky tail and fins. Its fin rays extend beyond the webbing, creating an elegant crown-like appearance. Available in different colours and patterns, every fish has its own unique look.",
      price: 299,
      unit: "piece",
      minQuantity: 1,
      variants: [
        { name: "Male", price: 299 },
        { name: "Female", price: 199 }
      ],
      size: "Standard",
      overview:
        "Crowntail is a fin type of Betta splendens, recognised by its reduced fin webbing and extended rays. Males generally display more prominent finnage, while females may have shorter or less elaborate fins.",
      careRequirements: {
        temperature: "25–28°C",
        pH: "6.5–7.5",
        diet: "High-quality Betta pellets, frozen or live foods such as brine shrimp",
        temperament: "Territorial; males should be housed separately",
        careLevel: "Beginner to Intermediate"
      },
      habitatSetup: {
        tankSize: "At least 19 litres recommended",
        filtration: "Gentle filtration with low water flow",
        heating: "Stable tropical temperature with a heater",
        plants: "Live plants and hiding spaces",
        water: "Clean, conditioned and properly cycled water"
      },
      didYouKnow: [
        "Crowntail Bettas are named after their crown-like fin appearance.",
        "Their extended fin rays create a spiky appearance.",
        "Crowntail describes the fin type, not the fish's colour.",
        "Male and female Crowntails can have noticeably different finnage."
      ],
      featured: false
    },

    {
      id: "wild-alien-spade-tail",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "betta",
      name: "Wild (Alien Spade Tail)",
      subtitle: "Betta splendens-complex hybrid (Alien Line)",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795203897/fbb7a513-6b29-4280-83ae-12ed675c8a74.png",
      images: [],
      video: "https://res.cloudinary.com/pv8lnpft/video/upload/v1795203625/WhatsApp_Video_2026-11-21_at_1.09.46_AM.mp4",
      description: "A striking wild-type Alien Betta featuring metallic iridescent scales, a dark base colour and a distinctive spade-shaped tail. Its compact body and shimmering blue-green or turquoise patterns create a unique exotic appearance.",
      price: 1499,
      unit: "piece",
      minQuantity: 1,
      size: "Adult (Approximately 5 – 7 cm)",
      overview: "The Alien Spade Tail Betta is a selectively bred hybrid line associated with the Betta splendens complex and wild-type Betta varieties. It is admired for its metallic blue, green or turquoise iridescence, dark facial markings and wild-style appearance. The Spade Tail form has a caudal fin that narrows towards a central pointed tip, resembling a playing-card spade. Exact hybrid ancestry and colour patterns can vary between breeder lines.",
      careRequirements: {
        "Difficulty": "Intermediate",
        "Water Temperature": "24°C – 28°C",
        "Diet": "Carnivorous; quality Betta pellets supplemented with Daphnia, brine shrimp and suitable frozen or live foods.",
        "Lifespan": "Approximately 3 – 5 years with proper care",
        "pH Range": "6.0 – 7.5",
        "Water Hardness": "Soft to moderately hard water",
        "Temperament": "Territorial; males may show aggression towards other males.",
        "Social Behaviour": "Individual housing is recommended, especially for males. Do not assume that hybrid Alien Bettas can safely live together."
      },
      habitatSetup: {
        "Aquarium Size": "At least 19 litres (5 gallons); approximately 38 litres (10 gallons) provides more stable conditions.",
        "Heating": "Use an adjustable heater and thermometer to maintain stable tropical temperatures.",
        "Filtration": "Gentle sponge filter or low-flow filtration.",
        "Water Flow": "Low flow with calm swimming areas.",
        "Substrate": "Smooth sand or fine aquarium gravel.",
        "Plants & Decor": "Live plants such as Anubias and Java Fern, with driftwood and smooth hiding places.",
        "Resting Areas": "Broad-leaf plants and resting spots near the water surface.",
        "Water Quality": "Use a fully cycled aquarium and maintain zero ammonia and nitrite.",
        "Aquarium Cover": "A secure lid is recommended because Bettas can jump.",
        "Surface Access": "Keep the water surface accessible for atmospheric breathing."
      },
      didYouKnow: [
        "Alien Betta is a trade name for selectively bred hybrid lines, not a separate scientific species.",
        "Its metallic scales can reflect blue, green and turquoise shades under different lighting.",
        "The Spade Tail has a pointed caudal-fin tip resembling a playing-card spade.",
        "Alien Betta lines may have different wild-type ancestry depending on the breeder.",
        "Like other labyrinth fish, Bettas can breathe atmospheric air at the water surface."
      ],
      featured: false
    },

    {
      id: "betta-pure-white-crowntail",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "betta",
      name: "Pure White Crowntail",
      subtitle: "Betta splendens (Crowntail Variety)",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795045998/369a3fb6-c574-4ecf-bc1c-b87da89625f6.png",
      images: ["https://res.cloudinary.com/pv8lnpft/image/upload/v1795046274/97f5519b-fdff-4084-ad58-3c455882a9ea.png",
        "https://res.cloudinary.com/pv8lnpft/image/upload/v1795045998/369a3fb6-c574-4ecf-bc1c-b87da89625f6.png"
      ],
      video: "https://res.cloudinary.com/pv8lnpft/video/upload/v1795046116/7f93b8d6edaec52538e950e60ad77415.mp4",
      description: "An ethereal show-grade Betta splendens featuring pristine, solid snow-white pigmentation and dramatic crowntail finnage with deeply extended, crown-like webbing reduction along each ray.",
      price: 499,
      unit: "piece",
      variants: [
        {
          name: "Male",
          price: 499
        },
        {
          name: "Female",
          price: 499
        }
      ],
      minQuantity: 1,
      size: "Adult (Approximately 5 – 7 cm including fin rays)",
      overview: "The Pure White Crowntail Betta is a breathtaking specimen known for its angelic, opaque white coloration free of dark spotting or red wash. Its hallmark feature is the crowntail finnage, where the webbing between the fin rays is reduced by 33% to 50%, leaving slender, needle-like spike extensions that resemble an ornate royal crown. The delicate fins require clean, gentle water conditions to prevent ray curling and maintain pristine structural integrity.",
      careRequirements: {
        "Difficulty": "Intermediate (clean, gentle water essential for delicate fin rays)",
        "Water Temperature": "25°C – 28°C",
        "Diet": "Carnivorous; small floating betta pellets, frozen bloodworms, and vitamin-enriched daphnia",
        "Lifespan": "Approximately 3 – 5 years",
        "pH Range": "6.5 – 7.2 (mildly acidic to neutral)",
        "General Hardness (GH)": "Soft to moderately soft water (4 – 8 dGH helps prevent ray curling)",
        "Temperament": "Territorial solitary fish",
        "Social Behaviour": "Must be housed individually; avoid tankmates that nip fins"
      },
      habitatSetup: {
        "Aquarium Size": "Minimum 20 to 30 litres (5–8 gallons)",
        "Filtration": "Ultra-gentle air-driven sponge filter; avoid strong intake suction",
        "Water Flow": "Minimal current to protect delicate crown rays",
        "Substrate": "Smooth fine sand or soft bare-bottom setup",
        "Plants & Decor": "Silk or live plants only (Java Moss, floating Salvinia); avoid sharp decor",
        "Water Quality": "Pristine water quality with regular testing; Indian Almond leaf extract recommended",
        "Aquarium Cover": "Secure cover with warm, humid surface air layer"
      },
      didYouKnow: [
        "The Crowntail fin mutation was first developed in Indonesia in the late 1990s and is designated as 'CT' in show standards.",
        "A pure opaque white betta requires absence of melanin (black pigment), erythrin (red pigment), and xanthic (yellow pigment).",
        "Tannins from Catappa (Indian almond) leaves naturally protect the delicate fin rays from bacterial issues.",
        "Crowntail rays can be single-ray, double-ray (DR), or cross-ray (CR) depending on genetics."
      ],
      featured: true
    },


    {
      id: "platinum-white-blue-eyes-round-tail-balloon-molly",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "molly",
      name: "Platinum White Blue Eyes Round Tail Balloon Molly",
      subtitle: "Poecilia sphenops (Balloon Molly Variety)",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795207614/8e498d59-99c0-4542-8610-2f7825d089ee.jpg",
      images: [],
      video: "",
      description:
        "A stunning Platinum White Balloon Molly featuring a pearly white body, beautiful blue eyes and a distinctive rounded balloon-shaped body. Its elegant round tail and translucent white fins give it a unique appearance, making it an attractive addition to a peaceful community aquarium.",
      price: 1999,
      unit: "pair",
      minQuantity: 1,
      size: "Standard",
      overview:
        "This ornamental Molly variety is recognised by its platinum-white colouration, blue eyes, compact balloon-shaped body and rounded tail. Individual fish may show slight variations in body shape and colour intensity.",
      careRequirements: {
        temperature: "24–28°C",
        pH: "7.0–8.2",
        diet: "Omnivorous; quality flakes, pellets and vegetable-based foods",
        temperament: "Peaceful; suitable for compatible community aquariums",
        careLevel: "Easy"
      },
      habitatSetup: {
        tankSize: "60 litres or larger",
        filtration: "Good filtration with gentle water movement",
        heating: "Stable tropical temperature",
        plants: "Live plants and open swimming space",
        water: "Clean, conditioned water with regular maintenance"
      },
      didYouKnow: [
        "Balloon Mollies are selectively bred for their rounded body shape.",
        "Platinum White colouration gives the fish a pearly appearance.",
        "Blue eyes create a striking contrast against the white body.",
        "Mollies are livebearers, meaning females give birth to live young."
      ],
      featured: false
    },

    {
      id: "molly-blue-eye-platinum-white-lyretail-balloon",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "molly",
      name: "Blue Eye Platinum White Lyre Tail Balloon Molly",
      subtitle: "Poecilia sphenops var. Balloon Lyretail",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795046446/7a27a05d-48ca-4c2b-93aa-5363f080666f.png",
      images: [],
      video: "",
      description: "An exceptional Balloon Molly variety featuring a compact, rounded body profile, shimmering platinum-white scales, elegant lyretail caudal extensions, and distinctive blue-tinted eyes. Peaceful, active, and well suited for planted community aquariums.",
      price: 2999,
      unit: "pair",
      minQuantity: 1,
      size: "Adult Pair (Subject to supplier stock availability)",
      overview: "The Blue Eye Platinum White Lyre Tail Balloon Molly is a selectively bred ornamental livebearer distinguished by its shortened arched vertebral structure, creating a charming rounded silhouette paired with elongated lyretail fin extensions. Its bright platinum body exhibits a soft iridescence accented by striking blue eyes. Like all mollies, they thrive in stable, hard, mineral-rich water conditions and actively graze on surface biofilm and algae.",
      careRequirements: {
        "Difficulty": "Beginner with suitable water conditions",
        "Water Temperature": "24°C – 28°C",
        "Diet": "Omnivorous; quality vegetable-rich flakes, spirulina pellets, and supplemental live or frozen daphnia and brine shrimp",
        "Lifespan": "Approximately 3 – 5 years",
        "pH Range": "7.2 – 8.2",
        "General Hardness (GH)": "Moderately hard to hard water (15 – 25 dGH)",
        "Temperament": "Peaceful and active livebearer",
        "Social Behaviour": "Social community fish; thrives in pairs or small groups"
      },
      habitatSetup: {
        "Aquarium Size": "Minimum 60 litres (15 gallons) for a pair",
        "Substrate": "Smooth fine gravel or inert sand",
        "Filtration": "Gentle biological filtration with moderate water circulation",
        "Water Flow": "Low to moderate flow to accommodate the compact balloon body",
        "Plants & Decor": "Live plants such as Java Fern, Anubias, and Vallisneria with open swimming channels",
        "Water Quality": "Stable, mature cycled water; maintain zero ammonia and nitrite",
        "Aquarium Cover": "A secure lid is recommended because mollies can jump"
      },
      didYouKnow: [
        "The lyretail trait features elongated outer rays on the top and bottom of the caudal fin, creating an elegant fork shape.",
        "Balloon mollies have a naturally shortened vertebral column developed through selective breeding.",
        "Their distinctive blue eye coloration creates an exquisite aesthetic contrast against the pure platinum white scales.",
        "Mollies are livebearers, with females giving birth to fully formed, free-swimming fry."
      ],
      featured: true
    },

    {
      id: "molly-crystal-eye-zebra-lyretail-balloon",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "molly",
      name: "Crystal Eye Zebra Lyre Tail Balloon Molly",
      subtitle: "Poecilia sphenops var. Balloon Zebra",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795046636/418d60ce-0db9-423f-a621-014345060b07.png",
      images: [],
      video: "",
      description: "A rare and captivating Balloon Molly displaying dramatic dark zebra banding across a light body, flowing lyretail finnage, and reflective crystal-clear eyes. An eye-catching, charismatic livebearer for dedicated community setups.",
      price: 3499,
      unit: "pair",
      minQuantity: 1,
      size: "Adult Pair (Subject to supplier stock availability)",
      overview: "The Crystal Eye Zebra Lyre Tail Balloon Molly is a rare ornamental livebearer strain celebrated for its eye-catching monochrome zebra banding over an arched, spherical body shape. The flowing lyretail adds grace and movement to its compact frame, while the reflective crystal eyes distinguish this strain from traditional balloon mollies. Best maintained in hard, alkaline freshwater with stable parameters.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Water Temperature": "24°C – 28°C",
        "Diet": "Omnivorous; high-vegetable flake foods, spirulina pellets, and live or frozen daphnia and brine shrimp",
        "Lifespan": "Approximately 3 – 5 years",
        "pH Range": "7.2 – 8.2",
        "General Hardness (GH)": "Hard water preferred (15 – 25 dGH)",
        "Temperament": "Peaceful, curious, and social",
        "Social Behaviour": "Peaceful schooling livebearer; best kept in pairs or small colonies"
      },
      habitatSetup: {
        "Aquarium Size": "Minimum 60 litres (15 gallons)",
        "Substrate": "Dark sand or smooth gravel to accent zebra patterns",
        "Filtration": "Efficient biological filtration without excessive turbulent currents",
        "Water Flow": "Moderate flow with plenty of calm resting zones",
        "Plants & Decor": "Planted layout with natural driftwood and hardy plants",
        "Water Quality": "Fully cycled aquarium with zero ammonia and nitrite",
        "Aquarium Cover": "Secure hood or cover glass is recommended"
      },
      didYouKnow: [
        "The zebra pattern is produced by selective melanin expression, forming bold vertical striping along the flanks.",
        "The crystal eye characteristic gives the iris a clear, jewel-like reflective sheen under aquarium illumination.",
        "The lyretail fin extensions continue to elongate and refine as the fish matures into full adulthood.",
        "Mollies naturally graze on surface biofilm and algae throughout the day, assisting in aquarium cleanliness."
      ],
      featured: true
    },

    {
      id: "molly-platinum-white-round-tail-balloon",
      category: "aquarium",
      categoryName: "Aquarium & Fish",
      subCategory: "molly",
      name: "Platinum White Round Tail Balloon Molly",
      subtitle: "Poecilia sphenops var. Balloon Round Tail",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795046900/8e9e2b1f-6309-4443-8325-63cd1edbe15a.png",
      images: [],
      video: "",
      description: "A charming Balloon Molly featuring glistening porcelain-white platinum coloration and a smooth, classic rounded caudal fin. Compact, playful, and gentle, swimming gracefully in peaceful community aquariums.",
      price: 1999,
      unit: "pair",
      minQuantity: 1,
      size: "Adult Pair (Subject to supplier stock availability)",
      overview: "The Platinum White Round Tail Balloon Molly features a bright, solid platinum sheen across its deep, rounded body. Unlike lyretail strains, this variety sports a traditional symmetrical rounded caudal fin that gives it a clean, classic profile and stable swimming agility. They are hardy, friendly livebearers that appreciate well-oxygenated, mineral-rich aquariums with gentle water flow.",
      careRequirements: {
        "Difficulty": "Beginner Friendly",
        "Water Temperature": "23°C – 28°C",
        "Diet": "Omnivorous; spirulina flakes, plant-based pellets, algae wafers, and occasional protein treats",
        "Lifespan": "Approximately 3 – 5 years",
        "pH Range": "7.0 – 8.2",
        "General Hardness (GH)": "Moderately hard to hard water (12 – 25 dGH)",
        "Temperament": "Peaceful and friendly community fish",
        "Social Behaviour": "Social livebearer; enjoys the company of other peaceful mollies"
      },
      habitatSetup: {
        "Aquarium Size": "Minimum 50 to 60 litres (13–15 gallons)",
        "Substrate": "Inert sand or smooth river gravel",
        "Filtration": "Standard sponge or canister filter with gentle surface agitation",
        "Water Flow": "Low to moderate flow",
        "Plants & Decor": "Planted areas with Vallisneria, Cryptocoryne, and floating cover",
        "Water Quality": "Mature cycled aquarium with regular partial water changes",
        "Aquarium Cover": "Keep aquarium covered to prevent jumping"
      },
      didYouKnow: [
        "The round tail (or fan tail) is the traditional ancestral tail morphology of the species, providing balanced propulsion.",
        "The platinum white iridescence is produced by guanine crystals in the dermal iridophore cells of the scales.",
        "Balloon mollies have a naturally compacted abdominal cavity, so smaller, frequent feedings are ideal.",
        "Female mollies can store viable sperm for several months and produce successive broods."
      ],
      featured: true
    },

    {
      id: "shrimp-crystal-red",
      category: "aquarium",
      categoryName: "Shrimps",
      subCategory: "shrimp",
      name: "Crystal Red Shrimp",
      subtitle: "Caridina cf. cantonensis var. Crystal Red",
      image: "https://upload.wikimedia.org/wikipedia/commons/4/47/Caridina-cf-cantonensis-crystal-red.jpg",
      images: [],
      video: "",
      description: "Prized high-grade dwarf freshwater shrimp displaying vivid red and bright white bands. Gentle algae grazer ideal for nano planted tanks.",
      price: 149,
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

    // ISOPODS 

    {
      id: "armadillidium-gestroi",
      category: "isopods",
      categoryName: "Isopods",
      subCategory: "isopods",
      name: "Armadillidium Gestroi",
      subtitle: "Armadillidium gestroi",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795042536/ce83f0db-68a5-4fed-b112-bbbeceba3beb.png",
      images: [],
      video: "",
      description: "An attractive Mediterranean pill isopod recognised by its dark brown to grey body and vivid yellow dorsal spots. A fascinating species for bioactive enclosures and dedicated isopod colonies.",
      price: 119,
      unit: "piece",
      minQuantity: 5,
      size: "Adult Size (Approximately 1.8 – 2.3 cm)",
      overview: "Armadillidium gestroi, commonly known as Gestroi's Pill Isopod or the Yellow-Spotted Isopod, is a terrestrial crustacean native to the Mediterranean region. Its rounded body features distinctive yellow spots against a darker shell. It is popular among isopod keepers for its appearance and ability to roll into a protective ball when disturbed.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Temperature": "18°C – 25°C",
        "Humidity": "Maintain a moisture gradient with one-third of the enclosure kept damp and the remaining area relatively drier",
        "Diet": "Primarily decaying hardwood leaves and rotten wood; supplement with vegetables, occasional protein foods and a constant calcium source",
        "Lifespan": "Approximately 1.5 – 3 years",
        "Handling": "Best observed rather than handled frequently; avoid dropping or excessive disturbance"
      },
      habitatSetup: {
        "Enclosure": "Well-ventilated plastic, acrylic or glass enclosure with a secure lid",
        "Substrate": "Approximately 6 – 8 cm of pesticide-free organic soil, leaf mould and decomposed hardwood",
        "Moisture Gradient": "Keep one section moist with sphagnum moss while allowing the opposite side to remain comparatively dry",
        "Leaf Litter": "Provide a generous layer of pesticide-free dried oak, beech or other suitable deciduous leaves",
        "Hiding Places": "Cork bark flats, decaying hardwood pieces and natural hides",
        "Calcium Source": "Keep cuttlebone, crushed limestone or another suitable calcium source available at all times",
        "Ventilation": "Provide cross-ventilation to prevent stagnant air and excessive condensation",
        "Watering": "Add water to the moist section as needed; avoid soaking the entire substrate"
      },
      didYouKnow: [
        "Isopods are terrestrial crustaceans, not insects, and are related to crabs and shrimp.",
        "Armadillidium species can roll into a tight ball when disturbed, a behaviour known as conglobation.",
        "Armadillidium gestroi has a dark body with distinctive vivid yellow dorsal spots.",
        "Isopods help break down decaying leaves and wood, returning nutrients to the substrate.",
        "Females carry developing young in a specialised brood pouch called a marsupium."
      ],
      featured: true
    },

    {
      id: "cubaris-murina-orange",
      category: "isopods",
      categoryName: "Isopods",
      subCategory: "isopods",
      name: "Cubaris Murina Orange",
      subtitle: "Cubaris murina 'Orange'",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795042768/cf1d3a85-c6be-49d1-ac5b-9341c4208743.png",
      images: [],
      video: "",
      description: "An attractive orange colour form of the hardy Cubaris murina, admired for its warm orange tones, active behaviour and suitability for humid bioactive enclosures.",
      price: 50,
      unit: "piece",
      minQuantity: 5,
      size: "Adult Size (Approximately 0.8 – 1.2 cm)",
      overview: "Cubaris murina 'Orange' is an orange-coloured hobby variety of the terrestrial isopod Cubaris murina, commonly known as the Little Sea Isopod. It is a compact, rounded species that feeds on decaying organic matter and can roll into a protective ball when disturbed. Its adaptable nature and relatively straightforward care make it a popular choice for beginner isopod colonies and bioactive enclosures.",
      careRequirements: {
        "Difficulty": "Beginner",
        "Temperature": "21°C – 27°C",
        "Humidity": "Maintain a moist refuge and a less-wet area with good ventilation; approximately 60% – 80% relative humidity can be used as a general guide",
        "Diet": "Primarily dried leaf litter and decaying hardwood; supplement with vegetables, occasional protein foods and a constant calcium source",
        "Lifespan": "Approximately 1.5 – 2 years",
        "Handling": "Avoid frequent handling; move specimens gently using a leaf or small spoon"
      },
      habitatSetup: {
        "Enclosure": "Ventilated plastic, acrylic or glass enclosure with a secure lid",
        "Substrate": "At least 6 cm of pesticide-free organic soil, leaf mould and decomposed hardwood",
        "Moisture Gradient": "Keep approximately one-third of the substrate consistently moist, with the opposite side comparatively drier",
        "Leaf Litter": "Provide a generous layer of pesticide-free dried oak, beech or other suitable deciduous leaves",
        "Hiding Places": "Cork bark flats, decaying hardwood and damp sphagnum moss",
        "Calcium Source": "Keep cuttlebone, crushed limestone or another suitable calcium source available at all times",
        "Ventilation": "Provide gentle cross-ventilation to prevent stagnant air and excessive condensation",
        "Watering": "Moisten one section of the substrate as needed; avoid soaking the entire enclosure"
      },
      didYouKnow: [
        "Cubaris murina is commonly known as the Little Sea Isopod, despite being fully terrestrial.",
        "It can roll into a protective ball when disturbed, a behaviour known as conglobation.",
        "Cubaris murina colour forms include Orange, Papaya and Glacier.",
        "Isopods are terrestrial crustaceans, not insects, and are related to crabs and shrimp.",
        "They help recycle nutrients by feeding on decaying leaves and other organic matter."
      ],
      featured: false
    },

    {
      id: "cubaris-murina-glacier",
      category: "isopods",
      categoryName: "Isopods",
      subCategory: "isopods",
      name: "Cubaris Murina Glacier",
      subtitle: "Cubaris murina 'Glacier'",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795043058/4d63ce84-0bbf-4471-91ee-5e345c25d66f.png",
      images: [],
      video: "",
      description: "A beautiful pale-white colour morph of Cubaris murina, admired for its frosty appearance, compact rounded body and suitability for humid bioactive enclosures.",
      price: 69,
      unit: "piece",
      minQuantity: 5,
      size: "Adult Size (Approximately 0.8 – 1.2 cm)",
      overview: "Cubaris murina 'Glacier', commonly known as the Glacier Isopod, is a pale or white hobby colour morph of the terrestrial Little Sea Isopod. Its rounded body and light coloration make it an attractive addition to dedicated isopod colonies and bioactive terrariums. Like other Cubaris murina, it feeds primarily on decaying leaves and hardwood and benefits from a stable, moisture-controlled enclosure.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Temperature": "21°C – 27°C",
        "Humidity": "Maintain a consistently damp refuge with access to a less-moist area; approximately 70% – 85% relative humidity can be used as a monitoring guide",
        "Diet": "Primarily dried hardwood leaf litter and decaying wood; supplement with vegetables, occasional protein foods and a constant calcium source",
        "Lifespan": "Approximately 1 – 2.5 years",
        "Handling": "Avoid frequent handling; observe the colony and move specimens gently when necessary"
      },
      habitatSetup: {
        "Enclosure": "Secure, well-ventilated plastic, acrylic or glass enclosure with fine mesh to prevent juvenile escapes",
        "Substrate": "At least 6 cm of pesticide-free organic soil, leaf mould and decomposed hardwood",
        "Moisture Gradient": "Keep roughly one-third of the substrate consistently moist, with the opposite side comparatively less damp",
        "Leaf Litter": "Provide a generous layer of pesticide-free dried oak, beech or other suitable deciduous leaves",
        "Hiding Places": "Cork bark flats, decaying hardwood and damp sphagnum moss",
        "Calcium Source": "Keep cuttlebone, crushed limestone or another suitable calcium source available at all times",
        "Ventilation": "Provide gentle cross-ventilation while retaining moisture in the damp refuge",
        "Watering": "Add water to the moist section as needed; avoid waterlogging the entire substrate",
        "Placement": "Keep away from direct sunlight and excessive heat"
      },
      didYouKnow: [
        "Glacier is a pale or white hobby morph of Cubaris murina, not a separate species.",
        "Cubaris murina is commonly called the Little Sea Isopod, although it lives entirely on land.",
        "Like other pill isopods, it can roll into a protective ball when disturbed.",
        "Females carry developing young in a specialised brood pouch called a marsupium.",
        "These isopods help recycle nutrients by breaking down decaying leaves and hardwood."
      ],
      featured: true
    },

    {
      id: "porcellionides-pruinosus-orange-pied",
      category: "isopods",
      categoryName: "Isopods",
      subCategory: "isopods",
      name: "Porcellionides pruinosus Orange Pied",
      subtitle: "Porcellionides pruinosus 'Orange Pied'",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795043219/0a58d8eb-e990-411e-a0a4-d402fb216407.png",
      images: [],
      video: "",
      description: "A fast-moving and attractive orange colour morph featuring contrasting pied patches and a subtle powdery appearance. An active detritivore suited to well-maintained bioactive enclosures.",
      price: 69,
      unit: "piece",
      minQuantity: 5,
      size: "Adult Size (Approximately 1 – 1.5 cm)",
      overview: "Porcellionides pruinosus 'Orange Pied' is a selectively maintained colour variety of the widespread terrestrial isopod Porcellionides pruinosus, commonly known as the Powder Isopod. Its orange coloration combined with contrasting pied markings makes it popular among isopod enthusiasts. It is an active, adaptable species that feeds on decaying organic matter and can serve as a useful clean-up crew in suitable bioactive enclosures.",
      careRequirements: {
        "Difficulty": "Beginner",
        "Temperature": "20°C – 27°C",
        "Humidity": "Approximately 50% – 80% relative humidity as a general guide; maintain a moist refuge and a comparatively dry area",
        "Diet": "Dried leaf litter and decaying hardwood as the staple, supplemented with vegetables, occasional protein foods and a constant calcium source",
        "Lifespan": "Approximately 1 – 3 years",
        "Activity": "Very active and fast-moving",
        "Handling": "Small and delicate; avoid frequent handling and move specimens gently when necessary"
      },
      habitatSetup: {
        "Enclosure": "Well-ventilated plastic, acrylic or glass enclosure with a secure lid",
        "Substrate": "Approximately 5 – 8 cm of pesticide-free organic soil, leaf mould and decomposed hardwood",
        "Moisture Gradient": "Keep one-third of the substrate moist while allowing the remaining area to stay comparatively drier",
        "Leaf Litter": "Provide a generous layer of pesticide-free dried oak, beech or other suitable deciduous leaves",
        "Hiding Places": "Cork bark flats, decaying hardwood and leaf litter",
        "Calcium Source": "Keep cuttlebone, crushed limestone or another suitable calcium source available at all times",
        "Ventilation": "Provide cross-ventilation to prevent stagnant air and excessive condensation",
        "Watering": "Moisten the damp section as needed; avoid waterlogging the substrate",
        "Placement": "Keep away from direct sunlight and excessive heat"
      },
      didYouKnow: [
        "Porcellionides pruinosus is commonly known as the Powder Isopod.",
        "Orange Pied is a colour form with contrasting patches, sometimes also marketed as Orange Dalmatian.",
        "This species is known for its quick movement and relatively fast colony growth.",
        "Unlike Armadillidium pill isopods, Porcellionides pruinosus cannot roll into a tight ball.",
        "Isopods are terrestrial crustaceans, not insects, and help recycle nutrients by breaking down decaying organic matter."
      ],
      featured: false
    },

    {
      id: "cubaris-sp-cappuccino",
      category: "isopods",
      categoryName: "Isopods",
      subCategory: "isopods",
      name: "Cubaris sp. Cappuccino",
      subtitle: "Cubaris sp. 'Cappuccino'",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795043475/b7e76bba-0873-4600-9643-c9809f8c2eaa.png",
      images: [],
      video: "",
      description: "A premium collector isopod admired for its beautiful coffee-brown and creamy beige marbled coloration. A distinctive tropical species suited to carefully maintained, humid isopod enclosures.",
      price: 599,
      unit: "piece",
      minQuantity: 5,
      size: "Adult Size (Approximately 15 – 22 mm)",
      overview: "Cubaris sp. 'Cappuccino' is a popular tropical hobby isopod recognised for its rounded body and attractive coffee-and-cream colour pattern. The name Cappuccino is a hobby trade name rather than a formally established scientific species name. It is generally slower to establish and reproduce than many beginner-friendly isopods, making it better suited to keepers who can maintain stable warmth, moisture and ventilation.",
      careRequirements: {
        "Difficulty": "Intermediate",
        "Temperature": "21°C – 26°C",
        "Humidity": "Approximately 70% – 80%; maintain a moist refuge and a comparatively drier area",
        "Diet": "Dried leaf litter and decaying hardwood as the staple; supplement with vegetables, occasional protein foods and a constant calcium source",
        "Lifespan": "Approximately 2 – 3 years; captive-keeping estimate",
        "Activity": "Often most active during the evening and night",
        "Handling": "Avoid frequent handling and unnecessary disturbance, especially while establishing a colony"
      },
      habitatSetup: {
        "Enclosure": "Secure, well-ventilated plastic, acrylic or glass enclosure that retains moisture",
        "Substrate": "At least 6 – 8 cm of moisture-retentive organic substrate containing decomposed hardwood and leaf mould",
        "Moisture Gradient": "Maintain one consistently moist section with sphagnum moss and another comparatively drier section",
        "Leaf Litter": "Provide a generous layer of pesticide-free dried oak, beech or other suitable deciduous leaves",
        "Hiding Places": "Cork bark flats, decaying hardwood and natural hides",
        "Calcium Source": "Keep cuttlebone, crushed limestone or another suitable calcium source available at all times",
        "Protein Supplement": "Offer small amounts of suitable protein food occasionally",
        "Ventilation": "Provide gentle cross-ventilation to prevent stagnant air, mould and excessive condensation",
        "Watering": "Moisten the damp section as needed; never allow the entire substrate to become waterlogged",
        "Placement": "Keep away from direct sunlight and excessive heat"
      },
      didYouKnow: [
        "The Cappuccino name comes from its coffee-brown and creamy beige colour pattern.",
        "Cubaris sp. 'Cappuccino' is a hobby trade name, not a formally described species name.",
        "This variety is generally considered a slower breeder than common beginner isopods.",
        "Isopods are terrestrial crustaceans, not insects, and are related to crabs and shrimp.",
        "They help recycle nutrients by feeding on decaying leaves and wood."
      ],
      featured: true
    },

    {
      id: "cubaris-sp-cherry-blossom",
      category: "isopods",
      categoryName: "Isopods",
      subCategory: "isopods",
      name: "Cubaris sp. Cherry Blossom",
      subtitle: "Cubaris sp. Cherry Blossom",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795043605/d4ba12eb-677e-4cc1-b9d0-21d4ef917c9a.png",
      images: [],
      video: "",
      description: "Exquisite pastel pink and creamy white hues mimicking delicate sakura blossoms. A prized gem among luxury isopod enthusiasts.",
      price: 749,
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
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795043801/c805b15e-80ee-4c64-9091-a39ef7488807.png",
      images: [],
      video: "",
      description: "A distinctive pill isopod recognised by its rugged, granular slate-grey to bluish-grey shell. An active and hardy species that makes an interesting addition to bioactive enclosures and dedicated isopod colonies.",
      price: 149,
      unit: "piece",
      minQuantity: 5,
      size: "Adult Size (Approximately 1.5 – 2.1 cm)",
      overview: "Armadillidium peraccae, commonly known as Peracca's Pill Woodlouse, is a terrestrial crustacean native to parts of southeastern Europe. Its robust, textured body and ability to roll into a protective ball make it an interesting species for isopod enthusiasts. It feeds on decaying leaves and hardwood and does well in an enclosure with a clear moisture gradient and good ventilation.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Temperature": "19°C – 24°C",
        "Humidity": "Maintain a damp refuge with a comparatively dry, ventilated side; approximately 50% – 75% ambient relative humidity as a guide",
        "Diet": "Dried deciduous leaf litter and soft decaying hardwood as the staple; supplement with vegetables, occasional protein foods and a constant calcium source",
        "Lifespan": "Approximately 2 – 3 years",
        "Activity": "Often more active during the evening and night",
        "Handling": "Avoid frequent handling; observe the colony and move specimens gently when necessary"
      },
      habitatSetup: {
        "Enclosure": "Secure, well-ventilated plastic, acrylic or glass enclosure",
        "Substrate": "Approximately 6 – 8 cm of pesticide-free organic topsoil, decomposed leaf litter and soft rotten hardwood",
        "Moisture Gradient": "Keep roughly one-third of the substrate damp while allowing the opposite side to remain comparatively dry",
        "Leaf Litter": "Provide a generous layer of pesticide-free dried oak, beech or other suitable deciduous leaves",
        "Hiding Places": "Cork bark flats, decaying hardwood and a small amount of sphagnum moss at the damp end",
        "Calcium Source": "Keep cuttlebone, limestone or clean crushed eggshell available at all times",
        "Ventilation": "Provide fine cross-ventilation on at least two sides while retaining moisture in the damp refuge",
        "Watering": "Add water to the damp corner when needed instead of spraying the entire enclosure",
        "Placement": "Keep away from direct sunlight and excessive heat"
      },
      didYouKnow: [
        "Armadillidium peraccae is commonly called Peracca's Pill Woodlouse.",
        "Its granular, rugged shell gives it a distinctive bumpy appearance.",
        "Like other Armadillidium species, it can roll into a protective ball when disturbed.",
        "It is a terrestrial crustacean, not an insect, and is related to crabs and shrimp.",
        "It helps recycle nutrients by feeding on decaying leaves and rotten wood."
      ],
      featured: false
    },


    // TARANTULAS

    {
      id: "chilean-rose-hair",
      category: "tarantulas",
      categoryName: "Tarantulas",
      subCategory: "tarantulas",
      name: "Chilean Rose Hair",
      subtitle: "Grammostola rosea",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795044064/590cb229-29c5-47db-aa6a-3a9507467cfd.png",
      images: [],
      video: "",
      description: "A hardy, slow-growing New World terrestrial tarantula known for its subtle rose-coloured hairs and adaptable nature. A popular species among tarantula keepers, though individual temperament and feeding behaviour can vary.",
      price: 2199,
      unit: "specimen",
      minQuantity: 1,
      size: "Current Size: 1 – 1.5 cm (Spiderling)",
      overview: "The Chilean Rose Hair (Grammostola rosea) is a terrestrial tarantula native to Chile and surrounding regions of South America. It is known for its slow growth, relatively dry habitat preferences and ability to go through extended periods without eating. It spends much of its time near a sheltered retreat and is best kept in a secure, low-height enclosure with suitable substrate and access to fresh water.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Temperature": "20°C – 26°C",
        "Humidity": "Generally dry conditions with good ventilation. Avoid keeping the substrate constantly wet; provide access to fresh water and a slightly moist area when needed.",
        "Diet": "Appropriately sized pinhead crickets and small roach nymphs. Feed prey smaller than the spider and remove uneaten feeders.",
        "Lifespan": "Approximately 15 – 25 years for females and 4 – 8 years for males; individual lifespan varies.",
        "Temperament": "Usually slow-moving, but individual behaviour varies. May flick urticating hairs or become defensive when disturbed.",
        "Activity": "Primarily terrestrial; may spend long periods inside its hide or retreat.",
        "Handling": "Avoid routine handling. Observe the specimen and use a catch cup for necessary transfers."
      },
      habitatSetup: {
        "Enclosure": "Small, secure and well-ventilated terrestrial sling enclosure. Upgrade the enclosure as the tarantula grows.",
        "Substrate": "Use pesticide-free coco fibre, unfertilised topsoil or a suitable tarantula substrate. Provide enough depth for a small retreat while keeping the enclosure low.",
        "Moisture": "Keep most of the substrate dry to lightly dry. A small area can be slightly moist when needed, but avoid waterlogged conditions.",
        "Hides & Decor": "Provide a small cork bark piece or another stable hide. Keep decorations minimal and secure.",
        "Water": "Provide a tiny, shallow water dish when the sling's size allows safe access. Keep fresh water available.",
        "Ventilation": "Provide adequate ventilation to prevent stagnant, overly humid conditions.",
        "Safety": "Keep the distance between the substrate and enclosure lid low to reduce injury risk from falls.",
        "Placement": "Keep away from direct sunlight, heat sources and sudden temperature changes."
      },
      didYouKnow: [
        "Grammostola rosea is native to Chile and is adapted to relatively dry environments.",
        "This species is known for slow growth and can sometimes refuse food for extended periods.",
        "Like many New World tarantulas, it has urticating hairs on its abdomen that it can use as a defence.",
        "Tarantulas shed their outer exoskeleton during moulting as they grow.",
        "A tarantula lying on its back may be moulting. Avoid disturbing it during this process."
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
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795044166/ff33845c-f511-47f7-8301-08e24fb6f6bb.png",
      images: [],
      video: "",
      description: "A large and impressive New World terrestrial tarantula recognised by its jet-black legs with striking white knee bands. Known for its fast growth, strong feeding response and bold behaviour, making it an eye-catching species for experienced display enthusiasts.",
      price: 2199,
      unit: "specimen",
      minQuantity: 1,
      size: "Current Size: 1 – 1.5 cm (Spiderling)",
      overview: "The Brazilian Whiteknee (Acanthoscurria geniculata) is a large terrestrial tarantula native to Brazil. Its distinctive white bands against a dark body make it easily recognisable. This species is known for growing relatively quickly and often displaying an enthusiastic feeding response. It requires a secure terrestrial enclosure with deep substrate, a suitable hide, good ventilation and access to fresh water. Although popular among hobbyists, it can be defensive and is best kept as a display animal.",
      careRequirements: {
        "Difficulty": "Intermediate",
        "Temperature": "22°C – 27°C",
        "Humidity": "Moderate humidity with a moisture gradient. Keep the substrate slightly moist in one area while allowing the surface to dry; avoid waterlogged conditions.",
        "Diet": "Pinhead crickets and small roach nymphs for spiderlings. Offer appropriately sized crickets, roaches and other suitable feeder insects as it grows.",
        "Lifespan": "Females may live approximately 15 – 20 years; males commonly live around 3 – 5 years. Individual lifespan varies.",
        "Temperament": "Bold and sometimes defensive. May flick urticating hairs or display threat behaviour when disturbed.",
        "Activity": "Terrestrial species with a strong feeding response; may spend time digging or using a sheltered retreat.",
        "Growth Rate": "Relatively fast-growing compared with many commonly kept terrestrial tarantulas.",
        "Handling": "Avoid handling. This species is best maintained as a display animal."
      },
      habitatSetup: {
        "Enclosure": "Start with a small, escape-proof and well-ventilated sling enclosure. Upgrade to a spacious, low terrestrial enclosure as the tarantula grows.",
        "Substrate": "Use pesticide-free coco fibre, unfertilised topsoil or a suitable soil blend. Provide enough depth for digging; larger specimens benefit from approximately 8 – 10 cm or more.",
        "Moisture": "Maintain a moisture gradient. Keep one lower corner slightly moist while allowing the surface to dry. Never keep the substrate waterlogged.",
        "Hides & Decor": "Provide a stable cork bark hide and simple, secure decor. Avoid heavy or sharp objects that could fall.",
        "Water": "Provide a shallow water dish when the sling is large enough to access it safely. Keep fresh water available for larger specimens.",
        "Ventilation": "Provide good cross-ventilation while ensuring openings are too small for the spiderling to escape.",
        "Safety": "Keep the enclosure low with limited climbing height to reduce the risk of dangerous falls.",
        "Placement": "Keep away from direct sunlight, excessive heat and sudden temperature changes."
      },
      didYouKnow: [
        "Acanthoscurria geniculata is native to Brazil.",
        "Its bright white knee bands create a striking contrast against its dark legs.",
        "It is known for a strong feeding response and relatively fast growth.",
        "Like other New World tarantulas, it has urticating hairs that can be flicked as a defence.",
        "Despite its impressive size, it is a terrestrial species that benefits from floor space rather than a tall enclosure."
      ],
      featured: true
    }
    ,

    {
      id: "mexican-red-knee",
      category: "tarantulas",
      categoryName: "Tarantulas",
      subCategory: "tarantulas",
      name: "Mexican Red Knee",
      subtitle: "Brachypelma hamorii",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795044349/4ac69e35-83fe-40e6-b6a0-f2381af908ae.png",
      images: ["https://res.cloudinary.com/pv8lnpft/image/upload/v1795044488/d2532931-1fb1-4985-a6b4-8203b52a053d.png",
        "https://res.cloudinary.com/pv8lnpft/image/upload/v1795044349/4ac69e35-83fe-40e6-b6a0-f2381af908ae.png"
      ],
      video: "",
      description: "A striking New World terrestrial tarantula recognised by its deep black body and vivid orange-red markings on its leg joints. A popular, slow-growing display species known for its distinctive appearance and long lifespan.",
      price: 2399,
      unit: "specimen",
      minQuantity: 1,
      size: "Current Size: 1 – 1.5 cm (Spiderling)",
      overview: "The Mexican Red Knee (Brachypelma hamorii) is a terrestrial tarantula native to Mexico. Its contrasting black body and bright orange-red knee markings make it one of the most recognisable tarantulas in the hobby. It is generally slow-growing and adapted to relatively dry habitats. Provide a secure enclosure with suitable substrate, a stable hide, good ventilation and constant access to fresh water.",
      careRequirements: {
        "Difficulty": "Beginner",
        "Temperature": "20°C – 26°C",
        "Humidity": "Mostly dry conditions with good ventilation. Keep a small area of substrate slightly moist when needed and always provide fresh water.",
        "Diet": "Small pinhead crickets and appropriately sized roach nymphs for spiderlings. Increase prey size as the tarantula grows and remove uneaten feeders.",
        "Lifespan": "Females may live approximately 15 – 25+ years; males commonly live around 5 – 8 years. Individual lifespan varies.",
        "Temperament": "Generally slow-moving, but temperament varies. May flick urticating hairs or become defensive when disturbed.",
        "Activity": "Primarily terrestrial and often more active during the evening or night.",
        "Handling": "Avoid routine handling. Observe as a display animal and use a catch cup for necessary transfers."
      },
      habitatSetup: {
        "Enclosure": "Small, escape-proof and well-ventilated terrestrial sling enclosure. Upgrade as the tarantula grows.",
        "Substrate": "Use pesticide-free coco fibre, unfertilised soil or a suitable terrestrial substrate. Provide enough depth for a sling to retreat or burrow.",
        "Moisture": "Keep most of the substrate dry to lightly dry. A small lower corner can remain slightly moist; avoid waterlogged substrate.",
        "Hides & Decor": "Provide a small, stable cork bark hide or another suitable retreat.",
        "Water": "Provide a tiny, shallow water dish when the sling is large enough to use it safely. Keep fresh water available.",
        "Ventilation": "Provide good cross-ventilation to prevent stagnant air and excessive moisture.",
        "Safety": "Keep the enclosure relatively low, with limited open space above the substrate to reduce fall injuries.",
        "Placement": "Keep away from direct sunlight, heat sources and sudden temperature changes."
      },
      didYouKnow: [
        "Brachypelma hamorii is native to Mexico.",
        "Its bright orange-red knee markings contrast with its dark body.",
        "It is a slow-growing species and may sometimes refuse food for extended periods.",
        "Like other New World tarantulas, it has urticating hairs on its abdomen for defence.",
        "Females can live for decades, making this a long-term pet commitment."
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
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795044690/ba8bfd6e-7eca-4941-aef7-85e45f93de4f.png",
      images: ["https://res.cloudinary.com/pv8lnpft/image/upload/v1795044957/1fb3fed2-0a67-46bc-9310-1572f5ffb1dd.png",
        "https://res.cloudinary.com/pv8lnpft/image/upload/v1795044690/ba8bfd6e-7eca-4941-aef7-85e45f93de4f.png"
      ],
      video: "",
      description: "A spectacular New World tarantula featuring electric-blue legs, a metallic green carapace and a vibrant orange abdomen. Famous for its elaborate webbing, active behaviour and striking three-colour appearance.",
      price: 4799,
      unit: "specimen",
      minQuantity: 1,
      size: "Current Size: 1 – 1.5 cm (Spiderling)",
      overview: "The Green Bottle Blue (Chromatopelma cyaneopubescens) is a terrestrial tarantula native to Venezuela's Paraguaná Peninsula. It is admired for its vivid blue legs, metallic green carapace and orange abdomen. This species is a prolific webber and often creates extensive silk tunnels and retreats throughout its enclosure. It prefers a well-ventilated, mostly dry setup with suitable anchor points, a secure hide and constant access to fresh water.",
      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Temperature": "20°C – 26°C",
        "Humidity": "Mostly dry conditions with strong ventilation. Avoid keeping the substrate constantly wet; provide fresh water at all times. Small slings may benefit from a slightly moist area.",
        "Diet": "Pinhead crickets and small roach nymphs for spiderlings. Larger specimens can be offered appropriately sized crickets, roaches and locusts.",
        "Lifespan": "Females may live approximately 12 – 14 years or longer; males commonly live around 3 – 4 years. Individual lifespan varies.",
        "Temperament": "Fast-moving and often skittish. May flick urticating hairs when disturbed; avoid unnecessary interaction.",
        "Activity": "Terrestrial species that may use elevated structures and retreats for extensive web construction.",
        "Growth Rate": "Moderate to relatively fast, depending on feeding, temperature and individual development.",
        "Webbing": "Prolific webber that can cover much of its enclosure with silk tunnels and web retreats.",
        "Handling": "Avoid handling. Best maintained as a display species."
      },
      habitatSetup: {
        "Enclosure": "Use a small, secure and well-ventilated sling enclosure initially. Upgrade to a spacious terrestrial enclosure with good floor area as the tarantula grows.",
        "Substrate": "Use well-draining, pesticide-free coco fibre or suitable soil-based substrate. Provide enough depth for a stable retreat while keeping the enclosure's open fall height low.",
        "Moisture": "Keep the substrate mostly dry. For very small slings, a small slightly moist area can be provided without making the enclosure wet.",
        "Hides & Web Anchors": "Provide cork bark, angled bark pieces, branches and other secure anchor points for web construction.",
        "Water": "Provide a shallow water dish when the sling is large enough to access it safely. Keep clean, fresh water available.",
        "Ventilation": "Provide strong cross-ventilation to prevent stagnant air and excessive moisture.",
        "Safety": "Use a tightly secured lid with escape-proof ventilation openings. Keep the enclosure's fall height limited.",
        "Maintenance": "Avoid repeatedly disturbing or removing established webbing. Remove uneaten prey and clean visible waste when necessary.",
        "Placement": "Keep away from direct sunlight, excessive heat and sudden temperature changes."
      },
      didYouKnow: [
        "Chromatopelma cyaneopubescens is native to Venezuela's Paraguaná Peninsula.",
        "Its three distinctive colours include metallic green on the carapace, blue legs and an orange abdomen.",
        "It is one of the hobby's well-known prolific webbers, creating extensive silk tunnels and retreats.",
        "A settled specimen may cover much of its enclosure with webbing.",
        "Like other New World tarantulas, it has urticating hairs that can be used as a defence.",
        "It is the only currently recognised living species in the genus Chromatopelma."
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
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795045219/3807384c-d2b9-4717-af85-3a035c670124.png",
      images: [],
      video: "",
      description: "A beautiful New World terrestrial tarantula recognised by its golden-yellow knee markings against a dark body. Known for its impressive adult size, generally calm nature and suitability for beginner keepers.",
      price: 1999,
      unit: "specimen",
      minQuantity: 1,
      size: "Current Size: 1 – 1.5 cm (Spiderling)",
      overview: "The Chaco Golden Knee (Grammostola pulchripes) is a terrestrial tarantula native to Paraguay and Argentina. It is admired for its golden leg markings, substantial adult size and generally manageable temperament. Young specimens may dig and create shallow retreats, while older individuals often use established hides. It thrives in a secure, well-ventilated enclosure with firm substrate, a suitable hide and access to fresh water.",
      careRequirements: {
        "Difficulty": "Beginner",
        "Temperature": "20°C – 26°C",
        "Humidity": "Mostly dry to moderately dry conditions. Maintain good ventilation and provide fresh water. A small lower corner can be slightly moist when needed, especially for young spiderlings.",
        "Diet": "Pinhead crickets and small roach nymphs for spiderlings. Offer appropriately sized crickets and roaches as the tarantula grows.",
        "Lifespan": "Females may live approximately 15 – 25 years; males generally have a much shorter lifespan, often around 3 – 5 years after maturity.",
        "Temperament": "Generally calm and slow-moving, but individual behaviour varies. May flick urticating hairs or become defensive when disturbed.",
        "Activity": "Primarily terrestrial. Younger specimens may burrow, while adults often settle into a sheltered retreat.",
        "Growth Rate": "Slow to moderate.",
        "Handling": "Avoid routine handling. Best maintained as a display animal."
      },
      habitatSetup: {
        "Enclosure": "Use a small, secure terrestrial sling enclosure initially. Upgrade to a spacious, low-height enclosure as the tarantula grows.",
        "Substrate": "Use pesticide-free coco fibre, compacted unfertilised topsoil or a suitable soil blend. Provide diggable substrate for young specimens.",
        "Moisture": "Keep the surface mostly dry. A small lower corner can be slightly moist when required, without making the enclosure waterlogged.",
        "Hides & Decor": "Provide a stable cork bark hide or similar retreat. Keep decorations secure and avoid hard objects that could cause injury.",
        "Water": "Provide a shallow water dish when the sling is large enough to access it safely. Keep fresh water available for larger specimens.",
        "Ventilation": "Provide good ventilation to prevent stagnant air and excessive moisture.",
        "Safety": "Fill a substantial portion of the enclosure with substrate and keep the open fall height low, particularly for heavier juveniles and adults.",
        "Placement": "Keep away from direct sunlight, excessive heat and sudden temperature changes."
      },
      didYouKnow: [
        "Grammostola pulchripes is native to Paraguay and Argentina.",
        "Its golden-yellow knee markings make it easily recognisable.",
        "Young specimens may dig their own retreats, while adults often use established hides.",
        "It is a terrestrial tarantula, so floor space is more important than climbing height.",
        "Females can live for decades, making this species a long-term pet commitment."
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
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795045425/9d739bc4-2e90-4751-920c-5e8897c1de5a.png",
      images: [],
      video: "",
      description: "One of the largest commonly kept tarantula species, recognised by its dark body covered with distinctive salmon-pink hairs. Famous for its rapid growth, impressive adult size and strong feeding response.",
      price: 2999,
      unit: "specimen",
      minQuantity: 1,
      size: "Current Size: Approximately 1 inch (Spiderling)",
      overview: "The Brazilian Salmon Pink Birdeater (Lasiodora parahybana) is a large terrestrial New World tarantula native to northeastern Brazil. It is admired for its salmon-coloured hairs, impressive adult size and fast growth. This species is often an enthusiastic feeder, but can be skittish and defensive. Its enclosure should prioritise floor space, deep stable substrate, a secure hide, good ventilation and constant access to fresh water.",
      careRequirements: {
        "Difficulty": "Intermediate",
        "Temperature": "22°C – 27°C",
        "Humidity": "Moderate humidity with a moisture gradient. Keep the surface from becoming constantly wet while allowing some moisture in the lower substrate. Provide fresh water at all times.",
        "Diet": "Small crickets and appropriately sized roach nymphs for spiderlings. Larger specimens can eat crickets, roaches and other suitable feeder insects.",
        "Lifespan": "Females may live approximately 10 – 20 years; males commonly live around 3 – 6 years. Individual lifespan varies.",
        "Temperament": "Often food-responsive and skittish. May move quickly, flick urticating hairs or become defensive when disturbed.",
        "Adult Size": "Approximately 20 – 28 cm leg span, depending on the individual.",
        "Growth Rate": "Fast-growing compared with many commonly kept tarantulas.",
        "Activity": "Primarily terrestrial; may use hides and shallow retreats.",
        "Handling": "Avoid handling. Its size, speed and urticating hairs make it unsuitable for routine handling."
      },
      habitatSetup: {
        "Enclosure": "Start with a small, secure and well-ventilated sling enclosure. Upgrade progressively as the tarantula grows; adults require a spacious horizontal enclosure.",
        "Substrate": "Use pesticide-free coco fibre, unfertilised topsoil or a suitable soil blend that holds its shape. Provide approximately 8 – 12 cm or more for larger juveniles and adults, adjusted to enclosure size.",
        "Moisture": "Maintain a moisture gradient with some moisture in the lower substrate while allowing the surface to dry. Avoid waterlogged or stagnant conditions.",
        "Hides & Decor": "Provide a stable cork bark hide and simple ground-level decor. Avoid heavy or unstable objects that could fall.",
        "Water": "Provide a shallow, stable water dish when the sling is large enough to access it safely. Keep fresh water available.",
        "Ventilation": "Provide adequate cross-ventilation to prevent stagnant air and excessive moisture.",
        "Safety": "Prioritise floor space and keep the distance between the substrate and lid low. Large, heavy tarantulas can be seriously injured by falls.",
        "Placement": "Keep away from direct sunlight, excessive heat and sudden temperature changes."
      },
      didYouKnow: [
        "Lasiodora parahybana is native to northeastern Brazil.",
        "It is commonly called the Brazilian Salmon Pink Birdeater.",
        "Its salmon-pink body hairs give the species its distinctive name.",
        "It is a fast-growing species and can reach an impressive adult leg span.",
        "Its strong feeding response makes it an enthusiastic predator of suitable feeder insects.",
        "Like other New World tarantulas, it has urticating hairs that can cause skin and eye irritation."
      ],
      featured: true
    },

    {
      id: "isopod-house-kit",
      category: "combo",
      categoryName: "Combo Packs",
      subCategory: "isopod-kit",
      name: "Isopod House Kit",
      subtitle: "Complete Bioactive Glass Vivarium Kit",

      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795035343/2d45afc1-280f-4a4a-a53c-c8a6774d90b2.png",
      images: [],
      video: "",

      description: "A complete bioactive isopod habitat kit featuring a glass house, live plants, sheet moss, bioactive substrate, natural hiding space, premium food and a starter culture of 6 Cubaris sp. Glacier isopods.",

      price: 1545,
      unit: "kit",
      minQuantity: 1,

      specs: {
        "care": "Beginner / Bioactive",
        "temp": "Ambient Room Temperature",
        "diet": "Premium Isopod Food included in the kit",
        "habitat": "Glass Isopod House (5″×5″×5″)",
        "size": "Complete Starter Kit (6 Isopods)"
      },

      overview: "The Isopod House Kit is a complete starter habitat designed for keeping and observing Cubaris sp. Glacier isopods in a planted bioactive enclosure. It combines a glass isopod house, live botanical elements, substrate, natural decor, food and a starter culture in one package.",

      careRequirements: {
        "Setup Type": "Complete Bioactive Setup",
        "Temperature": "Ambient Room Temperature",
        "Diet": "Premium Isopod Food included in the kit",
        "Livestock Included": "6 Cubaris sp. Glacier"
      },

      habitatSetup: {
        "Enclosure": "Glass Isopod House",
        "Dimensions": "5 inches L × 5 inches D × 5 inches H + 2.5 inches roof height",
        "Live Plant 1": "Fittonia albivenis (Patterned Nerve Plant)",
        "Live Plant 2": "Hemigraphis sp. Pink (Purple Waffle Plant)",
        "Ground Cover": "Sheet Moss",
        "Substrate": "Bioactive Isopod Substrate Blend",
        "Hiding Place": "Lotus Pod (Natural Hide)",
        "Food": "Premium Isopod Food",
        "Starter Culture": "6 Cubaris sp. Glacier"
      },

      didYouKnow: [],

      featured: true
    },
    {
      id: "half-cube-aquarium-kit",
      category: "combo",
      categoryName: "Combo Packs",
      subCategory: "aquarium-kit",
      name: "Half Cube Aquarium Kit",
      subtitle: "Complete Planted Betta Aquarium Kit",

      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1794949703/6a075120-0425-4e4f-bbc0-86de19ce4d3a.png",
      images: [],
      video: "",

      description: "A beginner-friendly aquarium kit featuring a half cube glass aquarium, one beautiful Betta fish, live aquatic plants and premium sand substrate. A complete combination to bring a natural aquatic environment into your home.",

      price: 999,
      unit: "kit",
      minQuantity: 1,

      specs: {
        "care": "Beginner Friendly",
        "temp": "24°C – 28°C",
        "diet": "Betta Pellets & live foods",
        "habitat": "Half Cube Glass Aquarium",
        "size": "Complete Betta Aquarium Kit"
      },

      overview: "The Half Cube Aquarium Kit is a complete aquarium package designed for hobbyists who want to start their aquarium journey. It includes a half cube aquarium, one Betta fish, live aquatic plants and premium sand substrate.",


      careRequirements: {
        "Livestock Included": "1 Betta Fish",
        "Aquatic Plants": "Live Aquatic Plants",
        "Substrate": "Premium Sand Substrate",
        "Setup Type": "Planted Freshwater Aquarium",
        "Experience Level": "Beginner Friendly"
      },

      habitatSetup: {
        "Aquarium": "Half Cube Glass Aquarium",
        "Fish": "1 Beautiful Betta Fish",
        "Plants": "Live Aquatic Plants",
        "Substrate": "Premium Sand Substrate",
        "Aquascape": "Natural planted aquarium setup"
      },

      didYouKnow: [
        "Betta fish are known for their vibrant colours and flowing fins.",
        "Live aquatic plants can provide natural cover and enrichment for aquarium fish.",
        "A properly maintained planted aquarium can become a beautiful miniature aquatic ecosystem."
      ],

      featured: true
    },

    {
      id: "glacier-colony-pack",
      category: "combo",
      categoryName: "Combo Packs",
      subCategory: "isopod-kit",
      name: "Glacier Colony Pack",
      subtitle: "Cubaris Murina Glacier – Buy 10 Get 1 Free",

      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795036241/154502ad-b5bb-43ba-b232-38ed49c89ad6.png",
      images: [],
      video: "",

      description: "Start your own Cubaris Murina Glacier colony with this special pack. Get 10 Glacier Isopods and receive 1 additional specimen free. A total of 11 beautiful white isopods for your bioactive enclosure or dedicated isopod culture.",

      price: 699,
      unit: "kit",
      minQuantity: 1,

      specs: {
        "Difficulty": "Beginner to Intermediate",
        "Temperature": "20°C–26°C",
        "Diet": "Decaying hardwood leaves, leaf litter and decomposed organic matter",
        "Housing": "Suitable ventilated terrestrial isopod enclosure",
        "Pack Size": "11 specimens (10 + 1 Free)"
      },

      overview: "Glacier Colony Pack is a special value pack containing 10 Cubaris Murina Glacier isopods plus 1 additional specimen free. It is suitable for hobbyists looking to start or expand their isopod colony.",

      careRequirements: {
        "Difficulty": "Beginner to Intermediate",
        "Temperature": "20°C–26°C",
        "Humidity": "Maintain a moist refuge with access to a drier area.",
        "Moisture": "Maintain a moisture gradient and avoid waterlogging.",
        "Diet": "Decaying hardwood leaves, leaf litter and decomposed organic matter.",
        "Supplementary Food": "Small portions of vegetables, fish flakes or shrimp pellets.",
        "Calcium": "Keep cuttlebone or another suitable calcium source available.",
        "Ventilation": "Moderate to good ventilation.",
        "Lighting": "Normal ambient light; avoid direct sunlight.",
        "Housing": "Suitable ventilated terrestrial isopod enclosure."
      },

      habitatSetup: {
        "Enclosure": "Secure, well-ventilated plastic tub or bioactive terrarium.",
        "Substrate": "Organic soil mixed with decomposed hardwood and leaf litter.",
        "Substrate Depth": "Approximately 5–8 cm.",
        "Moisture Gradient": "Keep one side moist and the opposite side comparatively drier.",
        "Moisture Retention": "Use damp sphagnum moss in the moist section.",
        "Leaf Litter": "Provide pesticide-free hardwood leaves.",
        "Hiding Places": "Cork bark and decaying hardwood pieces.",
        "Food Source": "Maintain decaying leaf litter as the staple food source.",
        "Calcium Source": "Provide cuttlebone or another suitable calcium supplement.",
        "Ventilation": "Maintain airflow while preventing the enclosure from drying out."
      },

      didYouKnow: [
        "Cubaris murina is commonly known as the Little Sea Isopod.",
        "The Glacier morph is recognised for its distinctive pale white appearance.",
        "Isopods are terrestrial crustaceans, not insects.",
        "Isopods help break down decaying leaves and organic matter.",
        "Female isopods carry developing young in a specialised brood pouch called a marsupium.",
        "Cubaris murina can roll into a protective ball when disturbed."
      ],

      featured: true
    }

  ];

  /* ── 3b. Specialized Living Cultures Catalogue ────────────── */
  const LIVE_CULTURES = [
    {
      id: "culture-microworm",
      category: "cultures",
      categoryName: "Cultures",
      subCategory: "microworm",
      name: "Microworm Starter Culture",
      subtitle: "Panagrellus redivivus",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795047635/de7db151-2b1d-4458-a5d3-27698510d07a.png",
      images: ["live_food_cultures_category.jpg"],
      video: "",
      description: "Active, prolific starter culture of Panagrellus redivivus nematodes. Perfect for nano fish, bettas, and newborn fry. Simple oatmeal maintenance with zero foul odor.",
      price: 149,
      unit: "Culture",
      minQuantity: 1,
      specs: {
        "Organism": "Panagrellus redivivus (Free-living nematode)",
        "Culture Medium": "Sterilized oatmeal with active yeast starter",
        "Size": "0.5 – 2.0 mm micro-swimmers",
        "Temperature": "20°C – 28°C ambient room temperature",
        "Suitability": "Betta fry, Guppy fry, Nano tetras, Killifish"
      },
      overview: "Microworms are an essential live food source for raising healthy, fast-growing ornamental fish fry. Extremely nutritious and simple to maintain indefinitely.",
      careRequirements: "Maintain on moist oatmeal bed with a pinch of dry yeast. Subculture every 2 to 3 weeks for continuous harvest.",
      habitatSetup: "Ventilated plastic container at ambient room temperature away from direct sunlight.",
      didYouKnow: "Microworms remain alive and active in aquarium water for up to 12 hours, giving shy fry plenty of time to hunt naturally.",
      featured: true
    },
    {
      id: "culture-vinegar-eel",
      category: "cultures",
      categoryName: "Cultures",
      subCategory: "vinegar-eel",
      name: "Vinegar Eel Live Culture",
      subtitle: "Turbatrix aceti",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795047047/f35faca0-8733-49d7-9f7c-a5aa8945f004.png",
      images: [],
      video: "",
      description: "Resilient live culture of Turbatrix aceti. Unlike microworms that sink, vinegar eels swim continuously throughout the water column, ideal for surface-feeding fry.",
      price: 179,
      unit: "Culture",
      minQuantity: 1,
      specs: {
        "Organism": "Turbatrix aceti",
        "Culture Medium": "Organic apple cider vinegar and sliced apple",
        "Size": "1.0 – 2.0 mm free swimmers",
        "Temperature": "18°C – 28°C",
        "Suitability": "Betta fry, Rainbowfish fry, Gouramis"
      },
      overview: "Vinegar eels are virtually uncrashable cultures that require minimal maintenance. They can survive in freshwater for days without fouling water quality.",
      careRequirements: "Keep in a 50/50 mix of raw apple cider vinegar and dechlorinated water with apple slices.",
      habitatSetup: "Glass bottle or jar with breathable cotton plug at room temperature.",
      didYouKnow: "Vinegar eels can survive in low pH environments and will swim continuously for over 24 hours in aquarium water.",
      featured: true
    },
    {
      id: "culture-moina",
      category: "cultures",
      categoryName: "Cultures",
      subCategory: "moina",
      name: "Moina Macrocopa Live Culture",
      subtitle: "Moina macrocopa",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795047331/7eb2eca5-8404-489c-82ed-05328e660b43.png",
      images: [],
      video: "",
      description: "High-density freshwater micro-crustacean starter culture. Smaller and softer-shelled than standard Daphnia magna, making them easier for small fish to digest.",
      price: 199,
      unit: "Culture",
      minQuantity: 1,
      specs: {
        "Organism": "Moina macrocopa (Water Flea)",
        "Culture Medium": "Aged green water or spirulina yeast suspension",
        "Size": "0.5 – 1.5 mm",
        "Temperature": "22°C – 30°C",
        "Suitability": "Show guppies, Adult Bettas, Killifish, Small cichlids"
      },
      overview: "Moina are the gold standard for conditioning breeding pairs of show guppies and bettas, promoting intense coloration and natural predatory behavior.",
      careRequirements: "Feed lightly with green water or yeast suspension. Provide gentle aeration and moderate light.",
      habitatSetup: "Clean freshwater tank or bucket with gentle sponge aeration.",
      didYouKnow: "Moina reproduce both sexually and asexually, allowing populations to double within 48 to 72 hours under optimal feeding.",
      featured: true
    },
    {
      id: "culture-grindal-worm",
      category: "cultures",
      categoryName: "Cultures",
      subCategory: "grindal-worm",
      name: "Grindal Worm Starter Culture",
      subtitle: "Enchytraeus buchholzi",
      image: "https://res.cloudinary.com/pv8lnpft/image/upload/v1795047563/52fa6208-04b9-442e-ab8d-9722f9eb1f05.png",
      images: [],
      video: "",
      description: "Dense starter culture of Enchytraeus buchholzi on damp organic peat/coco fiber substrate. Exceptionally rich in protein and lipids for conditioning breeders.",
      price: 219,
      unit: "Culture",
      minQuantity: 1,
      specs: {
        "Organism": "Enchytraeus buchholzi",
        "Culture Medium": "Damp organic coco coir / sponge media",
        "Size": "5 – 10 mm",
        "Temperature": "20°C – 24°C cool ambient",
        "Suitability": "Adult guppies, Bettas, Dwarf cichlids, Newts"
      },
      overview: "Grindal worms bridge the gap between microscopic fry food and large earthworms. Ideal for conditioning finicky show fish.",
      careRequirements: "Feed high-protein baby cereal or crushed dog kibble under a glass harvesting plate. Keep substrate evenly damp.",
      habitatSetup: "Shallow plastic container with ventilation holes and moist coco coir.",
      didYouKnow: "Grindal worms were named after Mrs. Morten Grindal of Sweden, who first cultivated them as fish food in the 1950s.",
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

    getItems() {
      return this.load();
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

    getTotal() {
      return this.calcTotal(this.load());
    },

    calcCount(items) {
      return items.reduce((sum, item) => sum + item.quantity, 0);
    },

    add(product, qty = 1, variant = null) {
      if (!product || !product.id) return;
      initProductVariantsAndSpecs(product);

      const isBetta = isBettaProduct(product);

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

      let cartId = String(product.id);
      let displayName = product.name;
      let activePrice = Number(product.price || 0);
      let activeUnit = isIsopodProduct(product) ? 'pieces' : (product.unit || product.pricingUnit || 'piece');
      let itemGender = null;
      let itemVariantName = null;

      if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
        let chosenVariant = null;
        if (typeof variant === 'string') {
          chosenVariant = product.variants.find(v => (v.name && v.name.toLowerCase() === variant.toLowerCase()) || (v.id && v.id.toLowerCase() === variant.toLowerCase()));
        } else if (variant && (variant.name || variant.gender || variant.id)) {
          const vKey = String(variant.name || variant.gender || variant.id).toLowerCase();
          chosenVariant = product.variants.find(v => (v.name && v.name.toLowerCase() === vKey) || (v.id && v.id.toLowerCase() === vKey));
        } else if (typeof selectedVariants !== 'undefined' && selectedVariants[product.id]) {
          const sel = String(selectedVariants[product.id]).toLowerCase();
          chosenVariant = product.variants.find(v => (v.name && v.name.toLowerCase() === sel) || (v.id && v.id.toLowerCase() === sel));
        }
        if (!chosenVariant) {
          chosenVariant = product.variants[0];
        }

        const vName = chosenVariant.name;
        itemGender = vName;
        itemVariantName = vName;
        cartId = `${product.id}__${vName.toLowerCase()}`;
        displayName = `${product.name} (${vName})`;
        activePrice = Number(chosenVariant.price);
        activeUnit = chosenVariant.unit || product.unit || 'piece';
      }

      const items = this.load();
      const idx = items.findIndex(i => String(i.id) === cartId);
      if (idx >= 0) {
        items[idx].quantity += qty;
      } else {
        items.push({
          id: cartId,
          baseId: String(product.id),
          name: displayName,
          gender: itemGender,
          variantName: itemVariantName,
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

    addById(id, qty = null, variant = null) {
      const product = PRODUCTS.find(p => String(p.id) === String(id)) ||
        (typeof LIVE_CULTURES !== 'undefined' && LIVE_CULTURES.find(p => String(p.id) === String(id)));
      if (!product) {
        console.warn('Product not found for id:', id);
        return;
      }
      initProductVariantsAndSpecs(product);
      if (qty === null || qty === undefined || isNaN(qty)) {
        qty = product.minQuantity || (isIsopodProduct(product) ? 5 : 1);
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
      if (num === null || num === undefined || num === '' || isNaN(num)) {
        return 'Price on Request';
      }
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
        const hasPrice = item.price !== null && item.price !== undefined && Number(item.price) > 0;
        const itemTotal = hasPrice ? this.formatPrice(item.price * item.quantity) : 'Price on Request';
        let qtyLabel;
        if (item.id === 'glacier-colony-pack' || item.baseId === 'glacier-colony-pack') {
          qtyLabel = `${item.quantity} Kit (${item.quantity * 11} specimens: ${item.quantity * 10} + ${item.quantity} Free)`;
        } else if (item.pricingUnit === 'pair') {
          qtyLabel = item.quantity === 1 ? '1 pair' : `${item.quantity} pairs`;
        } else if (item.pricingUnit === 'kit') {
          qtyLabel = item.quantity === 1 ? '1 kit' : `${item.quantity} kits`;
        } else {
          qtyLabel = `${item.quantity} pcs`;
        }
        lines.push(`${index + 1}. ${item.name} – ${qtyLabel} – ${itemTotal}`);
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
  window.CATEGORY_NAMES = CATEGORY_NAMES;
  window.getCurrentPageCategory = getCurrentPageCategory;
  window.CartManager = CartManager;
  window.addToCartById = (id, qty = 1, variant = null) => CartManager.addById(id, qty, variant);
  window.renderProductGrid = renderProductGrid;
  window.initProductVariantsAndSpecs = initProductVariantsAndSpecs;
  window.getProductSelectedVariant = getProductSelectedVariant;
  window.isIsopodProduct = isIsopodProduct;
  window.isBettaProduct = isBettaProduct;
  window.getProductQuantityLabel = getProductQuantityLabel;
  window.selectedVariants = selectedVariants;

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

  function filterAquariumCategory(filterKey, shouldScroll = true) {
    currentAquariumFilter = filterKey || 'all';

    // When resetting to 'all', clear active search so all 17 aquarium products are displayed
    if (currentAquariumFilter === 'all') {
      currentSearch = '';
      const searchInput = document.getElementById('catalogSearch');
      if (searchInput) searchInput.value = '';
    }

    document.querySelectorAll('.filter-tab, .filter-pill').forEach(pill => {
      const pillFilter = pill.dataset.filter || pill.dataset.category;
      pill.classList.toggle('active', pillFilter === currentAquariumFilter);
    });
    renderProductGrid();

    // Scroll smoothly to the actual product listing section on the Aquarium & Fish page
    if (shouldScroll) {
      const targetSection = document.getElementById('catalogue') || document.getElementById('productGrid');
      if (targetSection && typeof targetSection.getBoundingClientRect === 'function') {
        const headerHeight = 74;
        const targetPos = targetSection.getBoundingClientRect().top + (window.pageYOffset || window.scrollY || 0) - headerHeight;
        if (typeof window.scrollTo === 'function') {
          window.scrollTo({
            top: Math.max(0, targetPos),
            behavior: 'smooth'
          });
        }
      }
    }
  }
  window.filterAquariumCategory = filterAquariumCategory;

  function getCurrentPageCategory() {
    const bodyCat = document.body && document.body.dataset && document.body.dataset.pageCategory;
    const mainEl = document.querySelector('main');
    const mainCat = mainEl && mainEl.dataset && mainEl.dataset.pageCategory;
    const pageCat = bodyCat || mainCat;
    if (pageCat && pageCat !== 'home' && pageCat !== 'all') {
      return pageCat;
    }
    const path = (window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : '';
    const href = (window.location && window.location.href) ? window.location.href.toLowerCase() : '';
    if (path.includes('aquarium') || href.includes('aquarium')) return 'aquarium';
    if (path.includes('isopod') || href.includes('isopod')) return 'isopods';
    if (path.includes('tarantula') || href.includes('tarantula')) return 'tarantulas';
    if (path.includes('combo') || href.includes('combo')) return 'combos';
    if (path.includes('culture') || href.includes('culture')) return 'cultures';

    // Reliable fallback based on category hero classes or filter markup
    if (document.querySelector('.category-hero-aquarium') || document.querySelector('.filter-pills-row[aria-label*="Aquarium"]')) {
      return 'aquarium';
    }
    if (document.querySelector('.category-hero-isopods')) return 'isopods';
    if (document.querySelector('.category-hero-tarantulas')) return 'tarantulas';
    if (document.querySelector('.category-hero-combos')) return 'combos';
    if (document.querySelector('.category-hero-cultures')) return 'cultures';

    return 'all';
  }
  let currentSearch = '';
  let currentSort = 'default';

  window.onCardVariantChange = function () { };
  window.onModalVariantChange = function () { };

  function getAllProducts() {
    const list = [...PRODUCTS];
    if (typeof LIVE_CULTURES !== 'undefined' && Array.isArray(LIVE_CULTURES)) {
      LIVE_CULTURES.forEach(c => {
        if (!list.some(p => String(p.id) === String(c.id))) {
          list.push(c);
        }
      });
    }
    return list;
  }
  window.getAllProducts = getAllProducts;

  window.addCardVariantToCart = function (productId) {
    const product = PRODUCTS.find(p => String(p.id) === String(productId)) ||
      (typeof LIVE_CULTURES !== 'undefined' && LIVE_CULTURES.find(p => String(p.id) === String(productId)));
    if (!product) {
      console.warn('Product not found for id:', productId);
      return;
    }
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      CartManager.add(product, 1, product.variants[0].name);
      return;
    }
    CartManager.addById(productId);
  };

  function renderProductGrid() {
    const grid = document.getElementById('productGrid');
    const countEl = document.getElementById('resultCount');
    if (!grid) return;

    const pageCategory = getCurrentPageCategory();
    const isAquariumPage = pageCategory === 'aquarium';

    const allProductsPool = getAllProducts();
    // Ensure all products have variants and specs initialized
    allProductsPool.forEach(p => initProductVariantsAndSpecs(p));

    let list = [...allProductsPool];
    let totalInCategory = allProductsPool.length;

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
      // Dedicated category pages (isopods, tarantulas, combo packs, cultures)
      if (pageCategory === 'cultures') {
        list = list.filter(p => p.category === 'cultures');
        totalInCategory = list.length;
      } else {
        list = list.filter(p => p.category === pageCategory || ((pageCategory === 'combos' || pageCategory === 'combo') && (p.category === 'combo' || p.category === 'combos')));
        totalInCategory = list.length;
      }
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
      } else if (currentCategory === 'cultures' || currentCategory === 'culture') {
        list = list.filter(p => p.category === 'cultures');
        totalInCategory = list.length;
      } else if (currentCategory !== 'all') {
        list = list.filter(p => p.category === currentCategory);
        totalInCategory = list.length;
      } else {
        // All Products: includes Aquarium & Fish, Isopods, Tarantulas, Combo Packs, and Cultures
        totalInCategory = allProductsPool.length;
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
      } else if (pageCategory !== 'all') {
        indicatorEl.textContent = CATEGORY_NAMES[pageCategory] || CATEGORY_NAMES[currentCategory] || 'All Products';
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
      const hasPrice = activeVariant.price !== null && activeVariant.price !== undefined && Number(activeVariant.price) > 0;
      const displayPrice = hasPrice ? CartManager.formatPrice(activeVariant.price) : 'Price on Request';
      const displayUnit = hasPrice ? ('/ ' + activeVariant.unit) : '';

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

  window.renderCartDrawerItems = renderCartDrawerItems;

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
      // If filtering aquarium subcategories or all on the Aquarium & Fish page, stay on this page
      if (categoryKey === 'all' || (typeof AQUARIUM_FILTER_NAMES !== 'undefined' && AQUARIUM_FILTER_NAMES[categoryKey]) || ['aquarium', 'betta', 'guppy', 'molly', 'shrimps', 'combos'].includes(categoryKey)) {
        filterAquariumCategory(categoryKey);
        return;
      }
      // If navigating to a different category altogether
      const targetMap = {
        isopods: 'isopods.html',
        tarantulas: 'tarantulas.html',
        combos: 'combo-packs.html',
        combo: 'combo-packs.html',
        cultures: 'culture.html',
        culture: 'culture.html'
      };
      if (targetMap[categoryKey]) {
        window.location.href = targetMap[categoryKey];
        return;
      }
    }

    const targetMap = {
      aquarium: 'aquarium-fish.html',
      isopods: 'isopods.html',
      tarantulas: 'tarantulas.html',
      combos: 'combo-packs.html',
      combo: 'combo-packs.html',
      cultures: 'culture.html',
      culture: 'culture.html'
    };

    const isMatch = (pageCat === categoryKey) ||
      ((pageCat === 'combos' || pageCat === 'combo') && (categoryKey === 'combos' || categoryKey === 'combo')) ||
      ((pageCat === 'cultures' || pageCat === 'culture') && (categoryKey === 'cultures' || categoryKey === 'culture'));

    if (pageCat !== 'all' && !isMatch) {
      if (categoryKey === 'all') {
        window.location.href = 'index.html#catalogue';
      } else if (targetMap[categoryKey]) {
        window.location.href = targetMap[categoryKey];
      }
      return;
    }

    currentCategory = categoryKey;
    if (categoryKey === 'all') {
      currentAquariumFilter = 'all';
      currentSearch = '';
      currentSort = 'default';
      const searchInput = document.getElementById('catalogSearch');
      if (searchInput) searchInput.value = '';
      const sortSelect = document.getElementById('catalogSort');
      if (sortSelect) sortSelect.value = 'default';
    }
    document.querySelectorAll('.filter-tab, .filter-pill').forEach(tab => {
      const val = tab.dataset.category || tab.dataset.filter;
      const active = (val === categoryKey) ||
        ((val === 'combos' || val === 'combo') && (categoryKey === 'combos' || categoryKey === 'combo')) ||
        ((val === 'cultures' || val === 'culture') && (categoryKey === 'cultures' || categoryKey === 'culture'));
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

    const product = PRODUCTS.find(p => String(p.id) === String(productId)) ||
      (typeof LIVE_CULTURES !== 'undefined' && LIVE_CULTURES.find(p => String(p.id) === String(productId)));
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
    const product = PRODUCTS.find(p => String(p.id) === String(productId)) ||
      (typeof LIVE_CULTURES !== 'undefined' && LIVE_CULTURES.find(p => String(p.id) === String(productId)));
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

  /* ── 7a-2. Universal Product Video Renderer ──────────────── */
  function renderProductVideo(videoUrl, posterUrl = '', productName = 'Specimen') {
    if (!videoUrl || typeof videoUrl !== 'string') return '';
    const cleanUrl = videoUrl.trim();
    if (!cleanUrl || cleanUrl === 'null' || cleanUrl === 'undefined') return '';

    // Validate standard web video URLs (http/https, relative, Cloudinary, mp4/webm/ogg/mov/etc)
    const isUrl = /^https?:\/\//i.test(cleanUrl) || /^\//.test(cleanUrl) || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(cleanUrl);
    if (!isUrl) return '';

    // Determine poster (only if valid, non-empty, and not a placeholder or video URL itself)
    let validPoster = '';
    if (posterUrl && typeof posterUrl === 'string') {
      const trimmedPoster = posterUrl.trim();
      if (trimmedPoster && trimmedPoster !== PLACEHOLDER_IMG && !/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmedPoster)) {
        validPoster = trimmedPoster;
      }
    }

    const posterAttr = validPoster ? ` poster="${escapeSearchHTML(validPoster)}"` : '';
    const safeName = escapeSearchHTML(productName || 'Specimen');

    // Detect MIME type based on extension
    let mimeType = 'video/mp4';
    if (/\.webm(\?.*)?$/i.test(cleanUrl)) mimeType = 'video/webm';
    else if (/\.ogg(\?.*)?$/i.test(cleanUrl)) mimeType = 'video/ogg';

    return `
      <section class="pdp-video-container" id="pdpVideoContainer" aria-label="${safeName} Specimen Video">
        <div class="pdp-video-header">
          <span class="pdp-video-badge">
            <svg class="pdp-video-badge-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Specimen Live Video
          </span>
          <span class="pdp-video-sub">Live morphology &amp; swimming footage</span>
        </div>
        <div class="pdp-video-wrapper">
          <video class="pdp-video-player"
                 id="pdpProductVideo"
                 controls
                 playsinline
                 preload="metadata"${posterAttr}
                 aria-label="${safeName} live video footage"
                 onerror="window.handleProductVideoError && window.handleProductVideoError(this)">
            <source src="${escapeSearchHTML(cleanUrl)}" type="${mimeType}">
            <p class="pdp-video-fallback">Your browser does not support HTML5 video. <a href="${escapeSearchHTML(cleanUrl)}" target="_blank" rel="noopener noreferrer" class="pdp-video-fallback-link">Watch or download video</a>.</p>
          </video>
          <div class="pdp-video-error-fallback" id="pdpVideoErrorFallback" style="display:none;" role="alert">
            <span style="font-size: 1.75rem;">📹</span>
            <p style="margin: 0; font-weight: 500;">Live specimen video stream could not be loaded.</p>
            <a href="${escapeSearchHTML(cleanUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="color:#FFFFFF; border-color:#FFFFFF;">Open Video Stream Directly</a>
          </div>
        </div>
      </section>
    `;
  }
  window.renderProductVideo = renderProductVideo;

  window.handleProductVideoError = function (videoEl) {
    if (!videoEl) return;
    const fallback = document.getElementById('pdpVideoErrorFallback');
    if (fallback) {
      fallback.style.display = 'flex';
    }
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

    const allCatalog = typeof getAllProducts === 'function' ? getAllProducts() : [...PRODUCTS];
    let product = allCatalog.find(p => String(p.id).toLowerCase() === String(requestedId).toLowerCase());
    if (!product) {
      product = allCatalog[0] || PRODUCTS[0];
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
    } else if (catLower === 'cultures' || catLower === 'culture') {
      collectionUrl = 'culture.html';
      collectionName = 'Live Food Cultures';
    }

    const activeVariant = getProductSelectedVariant(product);
    const hasPrice = activeVariant && activeVariant.price !== null && activeVariant.price !== undefined && Number(activeVariant.price) > 0;
    const unitPrice = hasPrice ? Number(activeVariant.price) : 0;
    const isIsopod = isIsopodProduct(product);
    const hasVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0;
    if (hasVariants && !selectedVariants[product.id]) {
      selectedVariants[product.id] = product.variants[0].name;
    }
    const currentSelectedGender = hasVariants ? (selectedVariants[product.id] || product.variants[0].name) : null;
    const defaultQty = isIsopod ? 5 : 1;
    const minQty = defaultQty;
    const displayPrice = hasPrice ? CartManager.formatPrice(unitPrice) : 'Price on Request';
    const displayUnit = hasPrice ? (isIsopod ? '/ piece' : ('/ ' + (activeVariant ? activeVariant.unit : (product.pricingUnit || 'piece')))) : '';
    const qtyLabel = isIsopod ? 'Select Quantity (pieces)' : getProductQuantityLabel(product);

    // Images gallery
    const mainImg = product.image || PLACEHOLDER_IMG;
    const galleryImages = (product.images && Array.isArray(product.images) && product.images.length > 0)
      ? product.images
      : [mainImg];

    // Universal Video HTML rendering (reads video property dynamically for every product)
    const videoHtml = renderProductVideo(product.video, product.image, product.name);

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

            <!-- Universal Video Player (Renders conditionally if product.video exists) -->
            ${videoHtml}
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

            <!-- Gender / Variant Selection (rendered directly from product.variants) -->
            ${hasVariants ? `
            <div class="pdp-gender-section" id="pdpGenderSection">
              <div class="pdp-gender-header">
                <label class="pdp-gender-label">Select Gender <span class="required">*</span></label>
                <span class="pdp-gender-hint">Required before adding to cart</span>
              </div>
              <div class="pdp-gender-options" role="radiogroup" aria-label="Select Gender">
                ${product.variants.map((v, vIdx) => {
      const isMale = (v.name || '').toLowerCase() === 'male';
      const isSelected = (currentSelectedGender && currentSelectedGender.toLowerCase() === (v.name || '').toLowerCase()) || (!currentSelectedGender && vIdx === 0);
      const symbolClass = isMale ? 'male' : 'female';
      const symbolChar = isMale ? '♂' : '♀';
      return `
                <button type="button" class="pdp-gender-btn ${isSelected ? 'active' : ''}" data-gender="${v.name}" data-variant-index="${vIdx}" role="radio" aria-checked="${isSelected ? 'true' : 'false'}">
                  <div class="pdp-gender-btn-main">
                    <span class="pdp-gender-symbol ${symbolClass}">${symbolChar}</span>
                    <span>${v.name}</span>
                  </div>
                  <span class="pdp-gender-price">${CartManager.formatPrice(v.price)}</span>
                </button>
                  `;
    }).join('')}
              </div>
            </div>
            ` : ''}

            <!-- Quantity Selector & Dynamic Total -->
            <div class="pdp-qty-section">
              <div class="pdp-qty-header">
                <span class="pdp-qty-label">${qtyLabel}</span>
                <div class="pdp-qty-total-wrap">
                  <span class="pdp-qty-total-label">Subtotal:</span>
                  <span class="pdp-qty-total" id="pdpQtyTotal">${hasPrice ? CartManager.formatPrice(unitPrice * minQty) : 'Price on Request'}</span>
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
      const relHasPrice = relVar && relVar.price !== null && relVar.price !== undefined && Number(relVar.price) > 0;
      const relPrice = relHasPrice ? CartManager.formatPrice(relVar.price) : 'Price on Request';
      const relUnit = relHasPrice ? (isIsopodProduct(rel) ? '/ piece' : ('/ ' + relVar.unit)) : '';
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

    // Video Player Error Handling Listener
    const videoEl = document.getElementById('pdpProductVideo');
    if (videoEl) {
      videoEl.addEventListener('error', function () {
        const fallback = document.getElementById('pdpVideoErrorFallback');
        if (fallback) fallback.style.display = 'flex';
      }, true);
    }

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
      if (qtyTotalEl) qtyTotalEl.textContent = hasPrice ? CartManager.formatPrice(unitPrice * currentQty) : 'Price on Request';
    }

    if (minusBtn) minusBtn.addEventListener('click', () => updatePdpQuantity(-1));
    if (plusBtn) plusBtn.addEventListener('click', () => updatePdpQuantity(1));

    // 2b. Gender / Variant Selection Event Handlers
    if (hasVariants) {
      const genderBtns = document.querySelectorAll('.pdp-gender-btn');
      genderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const chosenGender = btn.dataset.gender || (product.variants[0] && product.variants[0].name);
          selectedVariants[product.id] = chosenGender;
          genderBtns.forEach(b => {
            const isActive = (b.dataset.gender === chosenGender);
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-checked', isActive ? 'true' : 'false');
          });
        });
      });
    }

    // 3. Add to Cart Button
    const addCartBtn = document.getElementById('pdpAddToCartBtn');
    if (addCartBtn) {
      addCartBtn.addEventListener('click', () => {
        if (hasVariants) {
          const chosenGender = selectedVariants[product.id] || (product.variants[0] && product.variants[0].name);
          CartManager.add(product, currentQty, chosenGender);
        } else {
          CartManager.addById(product.id, currentQty);
        }
      });
    }

    // 4. Direct WhatsApp Inquiry
    const directWaBtn = document.getElementById('pdpDirectWhatsAppBtn');
    if (directWaBtn) {
      directWaBtn.addEventListener('click', () => {
        const totalStr = hasPrice ? CartManager.formatPrice(unitPrice * currentQty) : 'Price on Request';
        const chosenGender = hasVariants ? (selectedVariants[product.id] || (product.variants[0] && product.variants[0].name)) : null;
        const msg = [
          'Hello Fish Tales!',
          '',
          `I would like to order/enquire about:`,
          `• Product: ${product.name}` + (chosenGender ? ` (${chosenGender})` : ''),
          chosenGender ? `• Gender: ${chosenGender}` : null,
          `• Scientific Name: ${scientificName}`,
          `• Quantity: ${currentQty} ${hasVariants ? 'pcs' : (isIsopod ? 'pieces' : (activeVariant ? activeVariant.unit : 'unit'))}`,
          `• Total Value: ${totalStr}`,
          '',
          'Please confirm livestock availability, shipping schedule and payment info (Prepaid only, COD unavailable).'
        ].filter(Boolean).join('\n');
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
      const hasItemPrice = item.price !== null && item.price !== undefined && Number(item.price) > 0;
      const lineTotal = hasItemPrice ? CartManager.formatPrice(item.price * item.quantity) : 'Price on Request';
      const unitLabel = hasItemPrice ? (item.pricingUnit === 'pair' ? 'per pair' : (item.pricingUnit === 'kit' ? 'kit' : (isIsopod ? 'per piece' : 'per piece'))) : '';
      const metaPriceStr = hasItemPrice ? `${CartManager.formatPrice(item.price)} ${unitLabel}` : 'Price on Request';
      const productObj = PRODUCTS.find(p => String(p.id) === String(item.id) || String(p.id) === String(item.baseId)) || item;
      return `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-thumb">
            <img src="${productObj.image || PLACEHOLDER_IMG}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}';">
          </div>
          <div class="cart-item-info">
            <span class="cart-item-title">${item.name}</span>
            <span class="cart-item-meta">${metaPriceStr}</span>
            ${item.gender ? `<span class="cart-item-meta" style="color:var(--color-primary, #1b4332); font-weight:600; font-size:0.75rem;">Gender: ${item.gender}</span>` : ''}
            ${(String(item.id) === 'glacier-colony-pack' || String(item.baseId) === 'glacier-colony-pack') ? `<span class="cart-item-meta" style="color:var(--color-primary); font-size:0.75rem; font-weight:600;">Pack: ${item.quantity} Kit (${item.quantity * 11} specimens: ${item.quantity * 10} + ${item.quantity} Free)</span>` : (item.size ? `<span class="cart-item-meta" style="color:var(--color-amber);">Size: ${item.size}</span>` : '')}
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

  window.renderCartDrawerItems = renderCartDrawerItems;

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
    isCompleted: false,
    lastSubmittedWaUrl: '',
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

  function getOwnerProductQuantityUnit(item) {
    // Find master product from catalog for reliable category/unit mapping
    const product = (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS))
      ? PRODUCTS.find(p => String(p.id) === String(item.id) || String(p.id) === String(item.baseId))
      : null;

    const rawUnit = String(
      (product && product.unit) ||
      item.unit ||
      (product && product.pricingUnit) ||
      item.pricingUnit ||
      ''
    ).toLowerCase();

    const category = String(
      (product && product.category) ||
      item.category ||
      item.categoryLabel ||
      ''
    ).toLowerCase();

    const subCategory = String(
      (product && product.subCategory) ||
      item.subCategory ||
      ''
    ).toLowerCase();

    // Special Colony Pack handling
    if (String(item.id) === 'glacier-colony-pack' || String(item.baseId) === 'glacier-colony-pack') {
      return 'Kit (11 specimens: 10 + 1 Free)';
    }

    // 1. Pair-based fish (Guppies, Mollies, or products sold per pair)
    if (rawUnit.includes('pair') || subCategory === 'guppy' || subCategory === 'molly') {
      return 'Pair';
    }

    // 2. Combo products / kits
    if (category === 'combo' || category === 'combos' || rawUnit.includes('kit') || subCategory.includes('kit')) {
      return 'Kit';
    }

    // 2b. Live food cultures
    if (category === 'cultures' || category === 'culture' || rawUnit.includes('culture')) {
      return 'Culture';
    }

    // 3. Tarantulas (specimen unit)
    if (category === 'tarantulas' || category === 'tarantula' || subCategory === 'tarantulas' || rawUnit.includes('specimen')) {
      return 'Specimen';
    }

    // 4. Isopods (piece count) & other individual livestock (Bettas, Shrimps, etc.)
    return 'Pcs';
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
      const unit = getOwnerProductQuantityUnit(item);
      const hasItemPrice = item.price !== null && item.price !== undefined && Number(item.price) > 0;
      const lineTotalFormatted = hasItemPrice
        ? CartManager.formatPrice(Number(item.price) * Number(item.quantity || 1))
        : 'Price on Request';

      const genderStr = item.gender || (variantName === 'Male' || variantName === 'Female' ? variantName : '');
      const itemTitle = genderStr ? `${prodName} (${genderStr})` : prodName;

      lines.push(`${itemTitle} × ${item.quantity} ${unit} — ${lineTotalFormatted}`);
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

  window.getOwnerProductQuantityUnit = getOwnerProductQuantityUnit;
  window.buildWhatsAppOrderMessage = buildWhatsAppOrderMessage;

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
      const hasPrice = item.price !== null && item.price !== undefined && Number(item.price) > 0;
      const lineTotal = hasPrice ? CartManager.formatPrice(item.price * item.quantity) : 'Price on Request';
      const unitPrice = hasPrice ? CartManager.formatPrice(item.price) : 'Price on Request';
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
      const hasPrice = item.price !== null && item.price !== undefined && Number(item.price) > 0;
      const lineTotal = hasPrice ? CartManager.formatPrice(item.price * item.quantity) : 'Price on Request';
      const unitPrice = hasPrice ? CartManager.formatPrice(item.price) : 'Price on Request';

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
            ✓ Order Placed &amp; WhatsApp Opened!
          </div>
          <div style="font-size:0.825rem; color:var(--text-muted); max-width:440px;">
            Your order reference <code>${checkoutState.orderId}</code> has been prepared and sent to WhatsApp. Your cart has been automatically cleared.
          </div>
          <div style="display:flex; gap:0.75rem; flex-wrap:wrap; justify-content:center; margin-top:0.25rem;">
            <button type="button" class="btn btn-primary btn-sm" onclick="closeCheckoutModal();">
              Done &amp; Close
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="window.reopenWhatsAppOrder();">
              Re-open WhatsApp
            </button>
          </div>
        </div>
      </div>
    `;
  };

  window.reopenWhatsAppOrder = function () {
    if (checkoutState.lastSubmittedWaUrl) {
      window.open(checkoutState.lastSubmittedWaUrl, '_blank');
    }
  };

  window.proceedToWhatsApp = function () {
    if (checkoutState.isSubmitting) return;

    if (checkoutState.isCompleted && checkoutState.lastSubmittedWaUrl) {
      window.open(checkoutState.lastSubmittedWaUrl, '_blank');
      return;
    }

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
      items: items.map(item => ({ ...item })),
      subtotal: CartManager.getTotal(),
      customer: { ...checkoutState.customer }
    };

    const message = buildWhatsAppOrderMessage(orderDetails);
    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/919654297430?text=${encoded}`;
    checkoutState.lastSubmittedWaUrl = waUrl;

    try {
      window.open(waUrl, '_blank');
    } catch (err) {
      console.error('Failed to open WhatsApp window:', err);
      checkoutState.isSubmitting = false;
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/>
          </svg>
          Continue to WhatsApp &rarr;
        `;
      }
      showToast('Could not open WhatsApp. Please check your browser settings and try again.', 'error');
      return;
    }

    // Automatically clear cart after successful order placement
    checkoutState.isCompleted = true;
    CartManager.clear();
    showToast('Order placed successfully! Your cart has been cleared.', 'success');

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

  window.renderCartDrawerItems = renderCartDrawerItems;

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
      } else if (targetKey === 'cultures' && (text.includes('culture') || href.includes('culture.html') || href.includes('cultures.html'))) {
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
    } else if (page.includes('culture')) {
      window.setActiveNavKey('cultures');
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
      const pageCat = getCurrentPageCategory();
      if (pageCat === 'all' || pageCat === 'home') {
        window.setActiveNavKey('home');
      } else {
        window.setActiveNavKey(pageCat);
      }
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
    if (categoryKey === 'all') {
      currentAquariumFilter = 'all';
      currentSearch = '';
      currentSort = 'default';
      const searchInput = document.getElementById('catalogSearch');
      if (searchInput) searchInput.value = '';
      const sortSelect = document.getElementById('catalogSort');
      if (sortSelect) sortSelect.value = 'default';
    }
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
      tab.addEventListener('click', (e) => {
        const key = tab.dataset.filter || tab.dataset.category;
        const pageCat = getCurrentPageCategory();
        if (pageCat === 'aquarium') {
          // If inline onclick exists on this tab, avoid calling it twice
          if (tab.getAttribute('onclick') && tab.getAttribute('onclick').includes('filterAquariumCategory')) {
            return;
          }
          filterAquariumCategory(key);
        } else {
          if (tab.getAttribute('onclick') && tab.getAttribute('onclick').includes('filterByCategory')) {
            return;
          }
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
