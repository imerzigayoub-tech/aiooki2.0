const fs = require('fs');
const html = fs.readFileSync('C:/Users/pc/OneDrive/Bureau/Dev/aioooki-portfolio/index.html', 'utf8');
const sections = [...html.matchAll(/<section[^>]*class="([^"]*)"/gi)];
sections.forEach(m => {
  const cls = m[1];
  const afterSection = html.slice(m.index, m.index + 300);
  const hasContainer = afterSection.includes('class="container"');
  console.log(cls, '-> container:', hasContainer);
});
