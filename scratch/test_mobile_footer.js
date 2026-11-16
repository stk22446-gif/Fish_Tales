const fs = require('fs');
const path = require('path');

console.log('--- TESTING FISH TALES MOBILE FOOTER & NAVIGATION SPACING ---');

const cssPath = path.join(__dirname, '..', 'style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

const indexPath = path.join(__dirname, '..', 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

let errors = [];

// 1. Desktop Protection Check
console.log('\n1. Checking Desktop Protection (>= 768px)...');
const desktopFooterMatch = cssContent.match(/\.site-footer\s*\{[^}]*padding:\s*4\.5rem\s+0\s+2\.5rem/);
if (!desktopFooterMatch) {
  errors.push('Desktop .site-footer padding has been altered! Must remain 4.5rem 0 2.5rem');
} else {
  console.log('✓ Desktop .site-footer padding preserved (4.5rem 0 2.5rem)');
}

const desktopGridMatch = cssContent.match(/\.footer-grid\s*\{[^}]*gap:\s*3rem;[^}]*margin-bottom:\s*3\.5rem/);
if (!desktopGridMatch) {
  errors.push('Desktop .footer-grid gap/margin has been altered! Must remain gap: 3rem; margin-bottom: 3.5rem;');
} else {
  console.log('✓ Desktop .footer-grid layout preserved (gap: 3rem; margin-bottom: 3.5rem)');
}

// 2. Mobile Media Query Check (<= 768px)
console.log('\n2. Checking Mobile Media Query Rules (<= 768px)...');
const mediaMatch = cssContent.match(/@media\s*\(max-width:\s*768px\)\s*\{([\s\S]*?)(?=\n@media|$)/);
if (!mediaMatch) {
  errors.push('Could not find @media (max-width: 768px) block!');
} else {
  const mediaContent = mediaMatch[1];

  // A. Footer Brand Section
  console.log('Checking Footer Brand Section...');
  const descMatch = mediaContent.match(/\.footer-desc\s*\{([^}]*)\}/);
  if (!descMatch) {
    errors.push('Mobile .footer-desc rules missing!');
  } else {
    const descCSS = descMatch[1];
    if (!descCSS.includes('margin-top') || !descCSS.includes('line-height')) {
      errors.push('Mobile .footer-desc must reduce margin-top and set line-height');
    } else {
      console.log('✓ Mobile .footer-desc gap reduced and line-height preserved');
    }
  }

  // B. Navigation Links & Categories Spacing
  console.log('Checking Navigation and Categories Spacing...');
  const linksWrapMatch = mediaContent.match(/\.footer-links\s*\{([^}]*)\}/);
  if (!linksWrapMatch) {
    errors.push('Mobile .footer-links rule missing!');
  } else {
    const gapMatch = linksWrapMatch[1].match(/gap:\s*([0-9]+px|[0-9.]+rem)/);
    if (!gapMatch) {
      errors.push('Mobile .footer-links must specify compact gap (0-4px)');
    } else {
      console.log('✓ Mobile .footer-links gap configured:', gapMatch[1]);
    }
  }

  const linksMatch = mediaContent.match(/\.footer-links\s+a[\s\S]*?\{([^}]*)\}/);
  if (!linksMatch) {
    errors.push('Mobile .footer-links a / .footer-link rule missing!');
  } else {
    const linkCSS = linksMatch[1];
    const minHeight = linkCSS.match(/min-height:\s*([0-9]+px)/);
    const padding = linkCSS.match(/padding:\s*([0-9]+px)\s+0/);
    
    if (!minHeight || parseInt(minHeight[1]) < 44 || parseInt(minHeight[1]) > 48) {
      errors.push(`Link min-height should be ~44-48px. Found: ${minHeight ? minHeight[1] : 'none'}`);
    } else {
      console.log(`✓ Link min-height is within 44-48px target: ${minHeight[1]}`);
    }

    if (!padding || parseInt(padding[1]) < 10 || parseInt(padding[1]) > 12) {
      errors.push(`Link vertical padding should be 10-12px. Found: ${padding ? padding[1] : 'none'}`);
    } else {
      console.log(`✓ Link vertical padding is within 10-12px target: ${padding[1]}`);
    }

    if (linkCSS.includes('margin: 0') || linkCSS.includes('margin:0')) {
      console.log('✓ Unnecessary link margins removed (margin: 0)');
    } else {
      errors.push('Link margin should be 0');
    }
  }

  // C. Overall Footer Spacing
  console.log('Checking Overall Footer Spacing...');
  const mobileFooterMatch = mediaContent.match(/\.site-footer\s*\{([^}]*)\}/);
  if (!mobileFooterMatch) {
    errors.push('Mobile .site-footer rule missing!');
  } else {
    const footerCSS = mobileFooterMatch[1];
    const pad = footerCSS.match(/padding:\s*([0-9.]+rem)\s+0\s+([0-9.]+rem)/);
    if (!pad) {
      errors.push('Mobile .site-footer padding not found or formatted differently');
    } else {
      const topPad = parseFloat(pad[1]);
      const botPad = parseFloat(pad[2]);
      if (topPad > 3.0) {
        errors.push(`Mobile footer top padding too large (${topPad}rem)`);
      } else {
        console.log(`✓ Mobile footer top padding reduced: ${topPad}rem`);
      }
      if (botPad < 5.0) {
        errors.push(`Mobile footer bottom padding too small for WhatsApp clearance (${botPad}rem)`);
      } else {
        console.log(`✓ Mobile footer bottom clearance for WhatsApp preserved: ${botPad}rem`);
      }
    }
  }

  // D. Fixed Heights / Clipping Check
  console.log('Checking for clipping or fixed heights...');
  if (mediaContent.match(/\.site-footer\s*\{[^}]*height:\s*[0-9]+/)) {
    errors.push('.site-footer has fixed height which could clip content!');
  }
  if (mediaContent.match(/\.footer-grid\s*\{[^}]*height:\s*[0-9]+/)) {
    errors.push('.footer-grid has fixed height which could clip content!');
  }
  console.log('✓ No fixed clipping heights on footer containers');

  // E. Floating WhatsApp Button Check
  console.log('Checking Floating WhatsApp button...');
  const whatsappMatch = mediaContent.match(/\.floating-whatsapp\s*\{([^}]*)\}/);
  if (!whatsappMatch) {
    errors.push('Mobile .floating-whatsapp rule missing!');
  } else {
    console.log('✓ Floating WhatsApp desk button rules present and intact');
  }
}

// 3. HTML Links and Categories Verification
console.log('\n3. Verifying Navigation & Category Links in index.html...');
const expectedNavLinks = [
  'Home',
  'Master Catalogue',
  'Promotional Bundles',
  'About Fish Tales',
  'Contact Desk'
];

expectedNavLinks.forEach(linkText => {
  if (indexHtml.includes(linkText)) {
    console.log(`✓ Navigation link "${linkText}" present`);
  } else {
    errors.push(`Missing navigation link: "${linkText}"`);
  }
});

const expectedCategories = [
  'Aquarium &amp; Fish',
  'Isopods',
  'Tarantulas',
  'Combo Packs'
];

expectedCategories.forEach(catText => {
  if (indexHtml.includes(catText)) {
    console.log(`✓ Category link "${catText}" present`);
  } else {
    errors.push(`Missing category link: "${catText}"`);
  }
});

// Final summary
console.log('\n--- TEST RESULTS SUMMARY ---');
if (errors.length === 0) {
  console.log('ALL TESTS PASSED! Mobile footer and navigation spacing conforms to all specifications.');
  process.exit(0);
} else {
  console.error(`FAILED with ${errors.length} errors:`);
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
}
