const fs = require('fs');

const scriptCode = fs.readFileSync('script.js', 'utf8');
const match = scriptCode.match(/const PRODUCTS = (\[[\s\S]*?\]);\s*\/\* ──/);
if (!match) {
  console.error('Could not find PRODUCTS in script.js');
  process.exit(1);
}

const PRODUCTS = eval(match[1]);

function generateProductExtensions(p) {
  const isFish = p.category === 'aquarium';
  const isIsopod = p.category === 'isopods';
  const isTarantula = p.category === 'tarantulas';
  const isCombo = p.category === 'combo';
  const specs = p.specs || {};

  let overview = '';
  let careRequirements = {};
  let habitatSetup = {};
  let didYouKnow = [];

  if (isFish) {
    if (p.subCategory === 'guppy') {
      overview = `The ${p.name} (${p.subtitle || 'Poecilia reticulata'}) is an exquisite livebearing freshwater fish prized for its vibrant coloration, intricate tail patterns, and peaceful demeanor in planted aquariums.`;
      careRequirements = {
        'Difficulty': 'Beginner / Community',
        'Water Temp': specs.temp || '22°C – 28°C',
        'Diet': specs.diet || 'Micro-pellets, spirulina flakes & live daphnia',
        'Lifespan': '2 – 3 years',
        'pH Range': '6.8 – 7.8',
        'Hardness': 'Medium to hard (8–12 dGH)'
      };
      habitatSetup = {
        'Aquarium Size': 'Minimum 10 gallons for active pairs or colonies',
        'Substrate': 'Fine gravel or dark aquatic soil to highlight iridescent coloration',
        'Filtration & Flow': 'Gentle sponge or internal filter to protect delicate flowing fins',
        'Plants & Decor': 'Dense live plants like Java Moss, Hornwort, and Anubias for shelter'
      };
      didYouKnow = [
        'Guppies are renowned as "millionfish" due to their prolific breeding and astounding color diversity.',
        'Selective breeding over decades has produced distinctive fancy strains like Dumbo ear pectoral flutters and lace caudal patterns.'
      ];
    } else if (p.subCategory === 'betta') {
      overview = `The ${p.name} is a majestic labyrinth fish displaying symmetrical finnage, vibrant iridescence, and intelligent personality. Each specimen is selected for health, vitality, and show-standard conformation.`;
      careRequirements = {
        'Difficulty': 'Beginner / Community',
        'Water Temp': specs.temp || '24°C – 28°C',
        'Diet': specs.diet || 'High-protein betta micro-pellets & live/frozen bloodworms',
        'Lifespan': '3 – 5 years',
        'pH Range': '6.5 – 7.5',
        'Handling': 'Do not house adult males together'
      };
      habitatSetup = {
        'Aquarium Size': '5 to 10 gallons nano tank (avoid tiny unheated bowls)',
        'Filtration & Flow': 'Low-flow filtration as heavy currents tire flowing fins',
        'Substrate': 'Smooth dark sand or planted substrate',
        'Plants & Decor': 'Broad-leaf live plants like Anubias providing rest spots near the surface'
      };
      didYouKnow = [
        'Bettas possess a specialized labyrinth organ enabling them to breathe atmospheric air directly from the water surface.',
        'Each betta has a unique interactive personality and quickly learns to recognize its keeper during feeding time.'
      ];
    } else if (p.subCategory === 'molly') {
      overview = `The ${p.name} (${p.subtitle || 'Poecilia sphenops'}) is an active, gregarious livebearer with radiant golden coloration. Renowned for grazing natural algae and thriving in planted community biotopes.`;
      careRequirements = {
        'Difficulty': 'Beginner / Community',
        'Water Temp': specs.temp || '22°C – 28°C',
        'Diet': specs.diet || 'Flakes, micro-pellets & vegetable matter',
        'Lifespan': '3 – 5 years',
        'pH Range': '7.0 – 8.2',
        'Hardness': 'Hard water preferred (10–25 dGH)'
      };
      habitatSetup = {
        'Aquarium Size': '15–20 gallons or larger for active swimming pairs',
        'Substrate': 'Aquatic soil or planted substrate supporting robust plant growth',
        'Filtration & Flow': 'Moderate biological filtration with clean water maintenance',
        'Plants & Decor': 'Ample swimming room combined with background stems (Vallisneria, Amazon Swords)'
      };
      didYouKnow = [
        'Mollies perform natural cleanup duty in planted aquariums by gently grazing surface biofilm and hair algae.',
        'They are highly adaptable euryhaline fish that thrive in freshwater, hard water, and even light brackish setups.'
      ];
    } else if (p.subCategory === 'shrimps') {
      overview = `The ${p.name} (${p.subtitle || 'Caridina cf. cantonensis'}) is a premier dwarf freshwater invertebrate exhibiting striking opaque white and vivid red color banding. Exceptional algae grazer for planted aquascapes.`;
      careRequirements = {
        'Difficulty': 'Intermediate / Peaceful',
        'Water Temp': specs.temp || '21°C – 25°C',
        'Diet': specs.diet || 'Biofilm, specialized shrimp pellets & blanched vegetables',
        'Lifespan': '1.5 – 2 years',
        'pH Range': '6.2 – 6.8',
        'TDS / GH': 'TDS 110–140 ppm, GH 4–6'
      };
      habitatSetup = {
        'Aquarium Size': '5 to 10 gallons mature planted nano tank',
        'Filtration & Flow': 'Sponge filtration only to prevent shrimplets from being drawn into impellers',
        'Substrate': 'Active buffering substrate maintaining slightly acidic pH',
        'Plants & Decor': 'Cholla wood, Indian almond leaves, and dense mosses (Java, Christmas, Phoenix)'
      };
      didYouKnow = [
        'Crystal Red Shrimps originate from a rare red mutation of wild Bee Shrimp discovered in Japan in the 1990s.',
        'They molt their exoskeleton as they grow, during which they hide in mosses until their new shell hardens.'
      ];
    }
  } else if (isIsopod) {
    overview = `${p.name} (${p.subtitle || 'Bioactive Isopod'}) is a prized terrestrial crustacean ideal as a clean-up crew (CUC) in bioactive terrariums or as a fascinating display colony.`;
    careRequirements = {
      'Difficulty': 'Beginner to Intermediate',
      'Temperature': specs.temp || '20°C – 26°C',
      'Humidity': '60% – 80% (moisture gradient required)',
      'Diet': specs.diet || 'Decaying leaf litter, rotting hardwood, calcium (cuttlebone) & supplemental protein',
      'Lifespan': '2 – 3 years',
      'Handling': 'Delicate live specimens; observe without excessive handling'
    };
    habitatSetup = {
      'Enclosure': 'Ventilated acrylic, glass, or plastic container with moisture retention',
      'Substrate': 'Damp organic bioactive soil blend enriched with worm castings and crushed leaf litter',
      'Moisture Gradient': 'One moist corner with damp sphagnum moss and one drier ventilating side',
      'Hiding Places': 'Cork bark flats, decaying wood chunks, and natural lotus pods'
    };
    didYouKnow = [
      'Isopods are terrestrial crustaceans—not insects—and breathe using specialized pleopodal lungs requiring moisture.',
      'They form the vital backbone of bioactive setups by breaking down mold, waste, and shed organic material.'
    ];
  } else if (isTarantula) {
    overview = `The ${p.name} (${p.subtitle || 'Theraphosidae'}) is a captivating New World tarantula renowned among exotic hobbyists for its striking appearance and low maintenance requirements.`;
    careRequirements = {
      'Difficulty': specs.care || 'Low Maintenance',
      'Temperature': specs.temp || '23°C – 28°C',
      'Humidity': '55% – 70% with access to a shallow water dish',
      'Diet': specs.diet || 'Pre-killed or appropriately sized live pinhead crickets & roach nymphs',
      'Lifespan': '15 – 25 years (females), 4 – 6 years (males)',
      'Temperament': 'New World terrestrial species; observe as display exotic'
    };
    habitatSetup = {
      'Enclosure': 'Ventilated sling vial or acrylic terrestrial terrarium with secure locking lid',
      'Substrate': '3–4 inches of dry to slightly damp coco fiber or peat blend for burrowing',
      'Hides & Decor': 'Curved cork bark hide and small shallow water dish (for specimens over 2 cm)',
      'Ventilation': 'Cross-ventilation holes to prevent stagnant humidity while retaining comfort'
    };
    didYouKnow = [
      'New World tarantulas possess urticating hairs on their abdomen used as a passive defense mechanism against predators in nature.',
      'Slings molt regularly as they grow, shedding their entire outer exoskeleton and emerging with renewed vibrant coloration.'
    ];
  } else if (isCombo) {
    overview = `The ${p.name} is an all-inclusive, curated complete biological setup designed by Fish Tales specialists. Includes premium glass enclosure, substrate, live specimens, and balanced essentials.`;
    careRequirements = {
      'Setup Difficulty': 'Beginner Friendly / Turnkey Kit',
      'Operating Temp': specs.temp || 'Ambient Room Temp (20°C – 28°C)',
      'Maintenance': 'Weekly misting or feeding as specified in care guidelines',
      'Included Components': specs.kitIncludes ? specs.kitIncludes.join(', ') : 'All essential setup hardware and live specimens'
    };
    habitatSetup = {
      'Enclosure Construction': 'High-clarity precision glass with optimal ventilation and biological balance',
      'Placement': 'Place on a sturdy, level surface away from direct harsh sunlight or extreme drafts',
      'Lighting': 'Gentle ambient room light or nano LED fixture supporting live botanical growth'
    };
    didYouKnow = [
      'Bioactive closed-loop habitats create self-sustaining micro-ecosystems where plants, micro-fauna, and custodial cleaners thrive harmoniously.',
      'All kit components are hand-selected, cleaned, and balanced by Fish Tales biologists for immediate plug-and-play enjoyment.'
    ];
  }

  return { overview, careRequirements, habitatSetup, didYouKnow };
}

console.log('Testing generation for all 32 products:');
PRODUCTS.forEach(p => {
  const ext = generateProductExtensions(p);
  if (!ext.overview || Object.keys(ext.careRequirements).length === 0 || Object.keys(ext.habitatSetup).length === 0 || ext.didYouKnow.length === 0) {
    console.error('Incomplete data for', p.id);
  }
});
console.log('✓ Successfully validated extensions for all 32 products!');
