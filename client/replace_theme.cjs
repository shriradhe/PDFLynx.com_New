const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'src', 'pages'),
  path.join(__dirname, 'src', 'components')
];

const excludeFiles = ['Navbar.jsx', 'App.jsx'];

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') && !excludeFiles.includes(item)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We use regex with negative lookbehind to avoid double replacing. Wait, older node doesn't support negative lookahead well? 
      // It's safer to just replace word boundaries where possible.
      
      const replacements = [
        { regex: /\btext-white\b(?! dark:text-white)/g, replace: 'text-slate-800 dark:text-white' },
        { regex: /\btext-slate-400\b(?! dark:text-slate-400)/g, replace: 'text-slate-600 dark:text-slate-400' },
        { regex: /\btext-slate-300\b(?! dark:text-slate-300)/g, replace: 'text-slate-700 dark:text-slate-300' },
        { regex: /\btext-slate-100\b(?! dark:text-slate-100)/g, replace: 'text-slate-800 dark:text-slate-100' },
        { regex: /\bbg-white\/5\b(?! dark:bg-white\/5)/g, replace: 'bg-black/5 dark:bg-white/5' },
        { regex: /\bbg-white\/10\b(?! dark:bg-white\/10)/g, replace: 'bg-black/10 dark:bg-white/10' },
        { regex: /\bborder-white\/10\b(?! dark:border-white\/10)/g, replace: 'border-slate-200 dark:border-white/10' },
        { regex: /\bborder-white\/20\b(?! dark:border-white\/20)/g, replace: 'border-slate-300 dark:border-white/20' }
      ];

      let newContent = content;
      for (const rule of replacements) {
        newContent = newContent.replace(rule.regex, rule.replace);
      }

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

directories.forEach(processDirectory);
console.log('Theme replacement complete!');
