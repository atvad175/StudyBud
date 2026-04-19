const fs = require('fs');
['src/modules/Focus/pages/Beats.jsx', 'src/modules/Auth/pages/OnboardingSetup.jsx', 'src/modules/Focus/pages/StudyRooms.jsx'].forEach(f => {
    let text = fs.readFileSync(f, 'utf8');
    text = text.replace(/\\`/g, '`');
    text = text.replace(/\\\$/g, '$');
    fs.writeFileSync(f, text);
});
console.log("Cleanup done.");
