const fs = require('fs');

const indexPath = 'C:/Users/pc/OneDrive/Bureau/Dev/aioooki-portfolio/index.html';
let html = fs.readFileSync(indexPath, 'utf8');

const sectionContent = fs.readFileSync('C:/Users/pc/OneDrive/Bureau/Dev/aioooki-portfolio/scripts/catalogue_section.html', 'utf8');

// Replace the old #work section
const workSectionRegex = /<section class="work section" id="work"[\s\S]*?<\/section>/i;
if (!workSectionRegex.test(html)) {
  console.error('Could not find work section in index.html');
  process.exit(1);
}
html = html.replace(workSectionRegex, sectionContent);

// Update general instagram links to the specific profile
html = html.replace(/href="https:\/\/www\.instagram\.com\/"/g, 'href="https://www.instagram.com/ai.ooo.ki/"');

// Add the Instagram embed script before </body> if not present
if (!html.includes('//www.instagram.com/embed.js')) {
  html = html.replace('</body>', '  <!-- Instagram Embed Engine -->\n  <script async src="//www.instagram.com/embed.js"></script>\n</body>');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully updated index.html with Instagram Character Catalogue!');
