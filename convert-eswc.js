const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'tmn-eswc.csv');
const raw = fs.readFileSync(filePath, 'utf8');
const lines = raw.split(/\r?\n/);

function parseCSV(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }

  fields.push(current);
  return fields;
}

function convertDate(dateStr) {
  const months = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  };

  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return dateStr;
  }

  const day = parts[0].padStart(2, '0');
  const month = months[parts[1]] ?? parts[1];
  const year = `20${parts[2]}`;
  return `${year}-${month}-${day}`;
}

const entries = [];

for (const line of lines) {
  const row = parseCSV(line);
  const track = row[2]?.trim();
  const time = row[3]?.trim();
  const vsRta = row[4]?.trim();
  const authorsRaw = row[5]?.trim();
  const date = row[6]?.trim();

  if (!track || !time || !vsRta || !authorsRaw || !date) {
    continue;
  }

  const authors = authorsRaw.split(' + ').map((author) => author.trim()).filter(Boolean);
  if (!authors.length) {
    continue;
  }

  entries.push({ track, time, vsRta, authors, date: convertDate(date) });
}

const outputLines = [];
for (const entry of entries) {
  const authorsPrinted = entry.authors.map((a) => `"${a.replace(/"/g, '\\"')}"`).join(', ');
  outputLines.push('  {');
  outputLines.push(`    track: "${entry.track.replace(/"/g, '\\"')}",`);
  outputLines.push(`    time: "${entry.time.replace(/"/g, '\\"')}",`);
  outputLines.push(`    vsRta: "${entry.vsRta.replace(/"/g, '\\"')}",`);
  outputLines.push(`    authors: [${authorsPrinted}],`);
  outputLines.push(`    date: "${entry.date}",`);
  outputLines.push('    links: {');
  outputLines.push('      video: "",');
  outputLines.push('      replay: "",');
  outputLines.push('      inputs: "",');
  outputLines.push('    },');
  outputLines.push('  },');
}

const output = outputLines.join('\n');
fs.writeFileSync(path.resolve(__dirname, 'tmn-eswc-entries.txt'), output, 'utf8');
console.log('Wrote tmn-eswc-entries.txt with', entries.length, 'entries.');
