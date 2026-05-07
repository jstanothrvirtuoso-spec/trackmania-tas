from pathlib import Path

path = Path(r'c:\Users\albea\Documents\TAS Website\trackmania-tas\lib\leaderboards.ts')
text = path.read_text(encoding='utf-8')
idx = 0
removed = 0
out = []
while True:
    start = text.find('rtaWr:', idx)
    if start == -1:
        out.append(text[idx:])
        break
    out.append(text[idx:start])
    i = start + len('rtaWr:')
    while i < len(text) and text[i].isspace():
        i += 1
    if i >= len(text) or text[i] != '{':
        idx = start + 1
        continue
    depth = 0
    j = i
    while j < len(text):
        if text[j] == '{':
            depth += 1
        elif text[j] == '}':
            depth -= 1
            if depth == 0:
                j += 1
                break
        j += 1
    while j < len(text) and text[j].isspace():
        j += 1
    if j < len(text) and text[j] == ',':
        j += 1
    while j < len(text) and text[j] in '\r\n':
        j += 1
    removed += 1
    idx = j
new_text = ''.join(out)
path.write_text(new_text, encoding='utf-8')
print('removed', removed)
print('count', new_text.count('rtaWr:'))
