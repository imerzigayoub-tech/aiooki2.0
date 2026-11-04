const fs = require('fs');

const catData = JSON.parse(fs.readFileSync('C:/Users/pc/OneDrive/Bureau/Dev/aioooki-portfolio/assets/catalogue.json', 'utf8'));

async function fetchAllOgData() {
  const extracted = [];
  
  for (let i = 0; i < catData.items.length; i++) {
    const item = catData.items[i];
    const permalink = item.permalink;
    const isReel = permalink.includes('/reel/');
    const scMatch = permalink.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
    const shortcode = scMatch ? scMatch[1] : '';
    const igPath = isReel ? 'reel' : 'p';
    console.log(`[${i+1}/${catData.items.length}] Fetching ${igPath} ${shortcode}...`);

    try {
      const res = await fetch(`https://www.instagram.com/${igPath}/${shortcode}/`, {
        headers: {
          'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });

      const html = await res.text();
      const ogImgMatch = html.match(/<meta property="og:image" content="([^"]+)"/i) || html.match(/<meta name="twitter:image" content="([^"]+)"/i);
      const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
      const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"/i);
      
      const imageUrl = ogImgMatch ? ogImgMatch[1].replace(/&amp;/g, '&') : null;
      let title = ogTitleMatch ? ogTitleMatch[1].replace(/&quot;/g, '"').replace(/&#039;/g, "'") : '';
      let desc = ogDescMatch ? ogDescMatch[1].replace(/&quot;/g, '"').replace(/&#039;/g, "'") : '';

      // Clean up title
      let cleanTitle = title.replace(/^Im'Pooh on Instagram:\s*"/i, '').replace(/"$/, '').split('#')[0].trim();
      if (!cleanTitle || cleanTitle.toLowerCase().includes('instagram')) {
        cleanTitle = `Character IP #${String(i+1).padStart(2, '0')}`;
      }

      extracted.push({
        index: i,
        shortcode,
        type: isReel ? 'reel' : 'post',
        permalink: item.permalink,
        imageUrl,
        cleanTitle,
        rawTitle: title,
        rawDesc: desc
      });
      console.log(`  -> Image: ${imageUrl ? 'FOUND' : 'MISSING'}`);
      console.log(`  -> Title: "${cleanTitle}"`);
    } catch (e) {
      console.log(`  -> Error: ${e.message}`);
      extracted.push({
        index: i,
        shortcode,
        type: isReel ? 'reel' : 'post',
        permalink: item.permalink,
        imageUrl: null,
        cleanTitle: `Character IP #${String(i+1).padStart(2, '0')}`
      });
    }

    await new Promise(r => setTimeout(r, 200));
  }

  fs.writeFileSync('C:/Users/pc/OneDrive/Bureau/Dev/aioooki-portfolio/assets/catalogue_extracted.json', JSON.stringify(extracted, null, 2), 'utf8');
  console.log('Saved assets/catalogue_extracted.json');
}

fetchAllOgData();
