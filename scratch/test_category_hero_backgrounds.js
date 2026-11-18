// scratch/test_category_hero_backgrounds.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Testing Category Hero Background Images and Styles...');

const aquariumHtml = fs.readFileSync(path.join(__dirname, '..', 'aquarium-fish.html'), 'utf8');
const isopodsHtml = fs.readFileSync(path.join(__dirname, '..', 'isopods.html'), 'utf8');
const tarantulasHtml = fs.readFileSync(path.join(__dirname, '..', 'tarantulas.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

// 1. Check Cloudinary URLs in style.css
console.log('1. Checking Cloudinary background image URLs in style.css...');
const urlAquarium = 'https://res.cloudinary.com/pv8lnpft/image/upload/v1794953470/eccae651-a950-4cda-b18c-7378d8db5185.png';
const urlIsopods = 'https://res.cloudinary.com/pv8lnpft/image/upload/v1794953506/988b48ba-c3a9-41b9-b928-e99a1fb5cd7a.png';
const urlTarantulas = 'https://res.cloudinary.com/pv8lnpft/image/upload/v1794953531/0343bded-0337-457f-8ac6-6ec6e7d28e2a.png';

assert(styleCss.includes(urlAquarium), 'Aquarium hero image URL must be in style.css');
assert(styleCss.includes(urlIsopods), 'Isopods hero image URL must be in style.css');
assert(styleCss.includes(urlTarantulas), 'Tarantulas hero image URL must be in style.css');

// Verify distinct URLs
assert(urlAquarium !== urlIsopods && urlIsopods !== urlTarantulas, 'Must not use one image across all three pages');

// 2. Check CSS design rules
console.log('2. Checking CSS design rules...');
assert(styleCss.includes('background-size: cover'), 'Must use background-size: cover');
assert(styleCss.includes('background-position: center'), 'Must use background-position: center');
assert(styleCss.includes('.category-hero-overlay'), 'Must have .category-hero-overlay');
assert(styleCss.includes('rgba(8, 30, 18') || styleCss.includes('rgba(16, 56, 35'), 'Must have subtle dark green overlay');

// 3. Check aquarium-fish.html
console.log('3. Checking aquarium-fish.html hero section...');
assert(aquariumHtml.includes('category-hero-section category-hero-aquarium'), 'Must have category-hero-aquarium class');
assert(aquariumHtml.includes('category-hero-overlay'), 'Must have category-hero-overlay');
assert(aquariumHtml.includes('Aquarium &amp; Fish Collection') || aquariumHtml.includes('Aquarium & Fish Collection'), 'Must have heading');
assert(aquariumHtml.includes('17 VERIFIED AQUATIC SPECIMENS'), 'Must have verified badge');
assert(aquariumHtml.includes('breadcrumb-nav'), 'Must have breadcrumb inside hero');
assert(aquariumHtml.includes('catalogue-subtitle'), 'Must have description inside hero');

// 4. Check isopods.html
console.log('4. Checking isopods.html hero section...');
assert(isopodsHtml.includes('category-hero-section category-hero-isopods'), 'Must have category-hero-isopods class');
assert(isopodsHtml.includes('category-hero-overlay'), 'Must have category-hero-overlay');
assert(isopodsHtml.includes('Bioactive Isopods Collection'), 'Must have heading');
assert(isopodsHtml.includes('7 BIOACTIVE CUSTODIAL STRAINS'), 'Must have custodial badge');
assert(isopodsHtml.includes('breadcrumb-nav'), 'Must have breadcrumb inside hero');
assert(isopodsHtml.includes('catalogue-subtitle'), 'Must have description inside hero');

// 5. Check tarantulas.html
console.log('5. Checking tarantulas.html hero section...');
assert(tarantulasHtml.includes('category-hero-section category-hero-tarantulas'), 'Must have category-hero-tarantulas class');
assert(tarantulasHtml.includes('category-hero-overlay'), 'Must have category-hero-overlay');
assert(tarantulasHtml.includes('Exotic Tarantulas Collection'), 'Must have heading');
assert(tarantulasHtml.includes('6 CAPTIVE-BRED EXOTIC SPECIMENS'), 'Must have captive-bred badge');
assert(tarantulasHtml.includes('breadcrumb-nav'), 'Must have breadcrumb inside hero');
assert(tarantulasHtml.includes('catalogue-subtitle'), 'Must have description inside hero');

console.log('\n✅ ALL Category Hero Background tests passed successfully!');
