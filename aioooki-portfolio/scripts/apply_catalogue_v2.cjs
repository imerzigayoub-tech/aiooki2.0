const fs = require('fs');

const indexPath = 'C:/Users/pc/OneDrive/Bureau/Dev/aioooki-portfolio/index.html';
let html = fs.readFileSync(indexPath, 'utf8');

const sectionContent = fs.readFileSync('C:/Users/pc/OneDrive/Bureau/Dev/aioooki-portfolio/scripts/catalogue_section.html', 'utf8');

// Split the section content: main section + lightbox
const lightboxSplit = sectionContent.indexOf('<!-- Catalogue Lightbox -->');
const mainSection = sectionContent.slice(0, lightboxSplit).trim();
const lightboxHtml = sectionContent.slice(lightboxSplit).trim();

// Replace the old catalogue-section
const sectionRegex = /<section class="catalogue-section[\s\S]*?<\/section>/i;
if (sectionRegex.test(html)) {
  html = html.replace(sectionRegex, mainSection);
  console.log('Replaced catalogue-section');
} else {
  console.error('Could not find catalogue-section in index.html');
  process.exit(1);
}

// Remove old cat-lightbox if present, then inject before </body>
html = html.replace(/<div class="cat-lightbox"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i, '');

// Remove the instagram embed script if present
html = html.replace(/\s*<!-- Instagram Embed Engine -->\s*<script async src="\/\/www\.instagram\.com\/embed\.js"><\/script>\s*/i, '\n');

// Inject lightbox before </body>
html = html.replace('</body>', `\n  ${lightboxHtml}\n\n</body>`);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('index.html updated with clean catalogue + lightbox');
