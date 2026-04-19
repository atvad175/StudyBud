const fs = require('fs');

const file = 'src/modules/Auth/pages/OnboardingSetup.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace escaped backticks
content = content.replace(/\\`/g, '`');

// Replace escaped dollar signs
content = content.replace(/\\\$/g, '$');

fs.writeFileSync(file, content);
console.log('Fixed OnboardingSetup.jsx');
