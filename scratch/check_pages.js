const fs = require('fs');
['index.html', 'aquarium-fish.html', 'isopods.html', 'tarantulas.html', 'combo-packs.html', 'product.html'].forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const hasGrid = content.includes('id="productGrid"');
  const modalMatches = (content.match(/openProductModal/g) || []).length;
  const navigateMatches = (content.match(/navigateToProduct/g) || []).length;
  console.log(`${f}: #productGrid=${hasGrid}, openProductModal=${modalMatches}, navigateToProduct=${navigateMatches}`);
});
