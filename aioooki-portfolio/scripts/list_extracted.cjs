const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Users/pc/OneDrive/Bureau/Dev/aioooki-portfolio/assets/catalogue_extracted.json'));
data.forEach(d => {
  const num = String(d.index + 1).padStart(2, '0');
  const type = d.type.toUpperCase().padEnd(5);
  const title = (d.cleanTitle || 'Character IP').slice(0, 32).padEnd(32);
  console.log(`[#${num}] ${type} | ${title} | ${d.localImage}`);
});
