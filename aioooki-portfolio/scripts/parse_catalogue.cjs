const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/pc/Downloads/blockquote class=instagram-media da.txt';
const raw = fs.readFileSync(filePath, 'utf8');

// Match each blockquote
const blockquoteRegex = /<blockquote class="instagram-media"[\s\S]*?<\/blockquote>/gi;
const blocks = raw.match(blockquoteRegex) || [];

console.log('Total blocks matched:', blocks.length);

const results = [];
blocks.forEach((block, index) => {
  const permalinkMatch = block.match(/data-instgrm-permalink="([^"?]+)[^"]*"/i);
  const permalink = permalinkMatch ? permalinkMatch[1] : '';
  const isReel = permalink.includes('/reel/');
  const isPost = permalink.includes('/p/');

  results.push({
    index,
    permalink,
    type: isReel ? 'reel' : 'post',
  });
});

console.log('Results summary:');
console.log('Total:', results.length);
results.forEach(r => console.log(`[${r.index}] ${r.type} -> ${r.permalink}`));

fs.writeFileSync('C:/Users/pc/OneDrive/Bureau/Dev/aioooki-portfolio/assets/catalogue.json', JSON.stringify({
  count: results.length,
  items: results,
  blocks: blocks
}, null, 2));
console.log('Saved assets/catalogue.json');
