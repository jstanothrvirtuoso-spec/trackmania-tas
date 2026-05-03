import csv
from datetime import datetime

# Read CSV
with open('tmnf.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    lines = list(reader)

# Convert month
months = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
    'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
}

def convert_date(date_str):
    parts = date_str.split('-')
    if len(parts) != 3:
        return date_str
    day = parts[0].zfill(2)
    month = months.get(parts[1], '01')
    year = '20' + parts[2]
    return f"{year}-{month}-{day}"

# Parse entries
entries = []
for i in range(2, len(lines)):
    row = lines[i]
    if len(row) < 7 or not row[2].strip():
        break
    
    track = row[2].strip()
    time = row[3].strip()
    vsRta = row[4].strip()
    authors_str = row[5].strip()
    date = row[6].strip()
    
    if not all([track, time, vsRta, authors_str, date]):
        continue
    
    authors = [a.strip() for a in authors_str.split(' + ')]
    
    entries.append({
        'track': track,
        'time': time,
        'vsRta': vsRta,
        'authors': authors,
        'date': convert_date(date)
    })

# Output TypeScript
print("entries: [")
for entry in entries:
    authors_str = ", ".join(f'"{a}"' for a in entry['authors'])
    print(f'''  {{
    track: "{entry['track']}",
    time: "{entry['time']}",
    vsRta: "{entry['vsRta']}",
    authors: [{authors_str}],
    date: "{entry['date']}",
    links: {{
      video: "",
      replay: "",
      inputs: "",
    }},
  }},''')
print("]")
print(f"\n\nTotal entries: {len(entries)}")
