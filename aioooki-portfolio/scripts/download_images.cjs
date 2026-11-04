const fs = require('fs');
const path = require('path');

const outDir = 'C:/Users/pc/OneDrive/Bureau/Dev/aioooki-portfolio/assets/catalogue/img';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const data = JSON.parse(fs.readFileSync('C:/Users/pc/OneDrive/Bureau/Dev/aioooki-portfolio/assets/catalogue_extracted.json', 'utf8'));

async function downloadImages() {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const num = String(i + 1).padStart(2, '0');
    const filename = `piece-${num}-${item.shortcode}.jpg`;
    const targetPath = path.join(outDir, filename);

    if (item.imageUrl) {
      console.log(`[${i+1}/${data.length}] Downloading ${filename}...`);
      try {
        const res = await fetch(item.imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(targetPath, buffer);
          item.localImage = `assets/catalogue/img/${filename}`;
          console.log(`  -> Saved ${buffer.length} bytes`);
        } else {
          console.log(`  -> Failed with status ${res.status}`);
        }
      } catch (err) {
        console.log(`  -> Download error: ${err.message}`);
      }
    } else {
      console.log(`[${i+1}/${data.length}] No imageUrl for ${item.shortcode}`);
    }
    await new Promise(r => setTimeout(r, 150));
  }

  fs.writeFileSync('C:/Users/pc/OneDrive/Bureau/Dev/aioooki-portfolio/assets/catalogue_extracted.json', JSON.stringify(data, null, 2), 'utf8');
  console.log('Saved updated assets/catalogue_extracted.json with localImage paths!');
}

downloadImages();
