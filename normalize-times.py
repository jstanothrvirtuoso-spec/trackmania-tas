import re

# Read the file
with open('lib/leaderboards.ts', 'r') as f:
    content = f.read()

def normalize_time(time_str):
    """Convert all times to m:ss.00 format"""
    time_str = time_str.strip('"')
    
    # Check if already in m:ss or mm:ss format
    if ':' in time_str:
        return time_str
    
    # Convert s.ss format to 0:s.ss format
    return f"0:{time_str}"

# Find and replace all times
pattern = r'time: "([^"]+)"'

def replace_time(match):
    original = match.group(1)
    normalized = normalize_time(original)
    return f'time: "{normalized}"'

# Replace all times
updated_content = re.sub(pattern, replace_time, content)

# Write back
with open('lib/leaderboards.ts', 'w') as f:
    f.write(updated_content)

print("Times normalized successfully!")
