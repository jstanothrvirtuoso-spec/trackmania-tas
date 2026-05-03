const fs = require('fs');

// Read the CSV file
const fileContent = fs.readFileSync('./tmnf.csv', 'utf-8');
const lines = fileContent.split('\n');

// Parse CSV manually
const entries = [];
for (let i = 2; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) break;
  
  // Split by comma, but be careful with quoted fields
  const parts = [];
  let current = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '"') {
      inQuotes = !inQuotes;
    } else if (line[j] === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += line[j];
    }
  }
  parts.push(current.trim());
  
  const track = parts[2]?.trim();
  const time = parts[3]?.trim();
  const vsRta = parts[4]?.trim();
  const authors = parts[5]?.trim();
  const date = parts[6]?.trim();
  
  // Stop at E05 (empty track means end)
  if (!track) break;
  
  // Skip if essential data is missing
  if (!time || !vsRta || !authors || !date) continue;
  
  entries.push({
    track,
    time,
    vsRta,
    authors: authors.split(' + ').map(a => a.trim()),
    date: convertDate(date),
    links: {
      video: '',
      replay: '',
      inputs: ''
    }
  });
}

// Convert date format from DD-Mon-YY to YYYY-MM-DD
function convertDate(dateStr) {
  const months = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
    'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const day = parts[0].padStart(2, '0');
  const month = months[parts[1]];
  const year = '20' + parts[2];
  
  return `${year}-${month}-${day}`;
}

// Output TypeScript code
console.log('Copy this into leaderboards.ts as the entries for TMNF:');
console.log('\nentries: [');
entries.forEach((entry) => {
  console.log(`  {
    track: "${entry.track}",
    time: "${entry.time}",
    vsRta: "${entry.vsRta}",
    authors: [${entry.authors.map(a => `"${a}"`).join(', ')}],
    date: "${entry.date}",
    links: {
      video: "",
      replay: "",
      inputs: "",
    },
  },`);
});
console.log(']');

console.log(`\n\nTotal entries: ${entries.length}`);

