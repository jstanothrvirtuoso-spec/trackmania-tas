import re

data = """A01-Race: 0:17.61, -6.16
A02-Race: 0:14.72, -0.54
A03-Race: 0:17.43, -0.80
A04-Acrobatic: 0:5.73, -0.05
A05-Race: 0:15.63, -0.42
A06-Obstacle: 0:20.86, -6.64
A07-Race: 0:22.46, -3.72
A08-Endurance: 0:31.32, -24.39
A09-Race: 0:16.77, -7.47
A10-Acrobatic: 0:8.71, -0.09
A11-Race: 0:17.83, -0.52
A12-Speed: 0:8.85, -1.56
A13-Race: 0:16.84, -10.44
A14-Race: 0:18.87, -1.30
A15-Speed: 0:22.26, -2.05
B01-Race: 0:22.05, -3.18
B02-Race: 0:22.85, -2.06
B03-Race: 0:22.10, -2.22
B04-Acrobatic: 0:5.45, -7.02
B05-Race: 0:22.99, -2.02
B06-Obstacle: 0:25.79, -0.91
B07-Race: 0:23.97, -3.37
B08-Endurance: 0:43.45, -44.74
B09-Acrobatic: 0:12.97, -0.03
B10-Speed: 0:18.67, -15.77
B11-Race: 0:26.60, -3.02
B12-Race: 0:19.65, -19.34
B13-Obstacle: 0:19.26, -5.65
B14-Speed: 0:14.18, -16.44
B15-Race: 0:20.60, -17.88
C01-Race: 0:18.73, -7.90
C02-Race: 0:30.12, -7.77
C03-Acrobatic: 0:10.03, -2.01
C04-Race: 0:19.00, -15.61
C05-Endurance: 0:59.10, -44.17
C06-Speed: 0:28.36, -23.07
C07-Race: 0:27.12, -8.34
C08-Obstacle: 0:11.75, -13.18
C09-Race: 0:24.70, -14.51
C10-Acrobatic: 0:10.87, -0.78
C11-Race: 0:22.24, -23.64
C12-Obstacle: 0:17.18, -11.69
C13-Race: 0:17.36, -22.77
C14-Endurance: 0:36.87, -1:00.78
C15-Speed: 0:27.58, -19.09
D01-Race: 1:22.55, -53.08
D02-Race: 0:18.26, -26.98
D03-Acrobatic: 0:8.61, -5.63
D04-Race: 0:24.05, -17.63
D05-Race: 0:27.93, -29.75
D06-Obstacle: 0:21.65, -34.99
D07-Race: 0:19.67, -26.12
D08-Speed: 0:26.93, -20.40
D09-Obstacle: 0:26.19, -14.27
D10-Race: 0:29.37, -13.93
D11-Acrobatic: 0:8.94, -0.23
D12-Speed: 0:19.51, -18.85
D13-Race: 0:29.59, -32.94
D14-Endurance: 0:41.94, -1:52.07
D15-Endurance: 3:07.61, -3:53.85
E01-Obstacle: 0:18.07, -25.50
E02-Endurance: 0:44.43, -2:38.88
E03-Endurance: 2:45.62, -1:48.61
E04-Obstacle: 0:42.54, -45.94
E05-Endurance: 18:29.59, -34:55.55"""

def parse_time(time_str):
    """Convert MM:SS.cc or S.cc format to seconds"""
    time_str = time_str.strip()
    is_negative = time_str.startswith('-')
    time_str = time_str.lstrip('-')
    
    if ':' in time_str:
        parts = time_str.split(':')
        minutes = int(parts[0])
        seconds = float(parts[1])
        total = minutes * 60 + seconds
    else:
        total = float(time_str)
    
    return -total if is_negative else total

def format_time(seconds):
    """Convert seconds to MM:SS.cc or S.cc format"""
    if seconds < 60:
        return f"{seconds:.2f}"
    else:
        minutes = int(seconds // 60)
        secs = seconds % 60
        return f"{minutes}:{secs:05.2f}"

results = []
for line in data.strip().split('\n'):
    match = re.match(r'(\w+-\w+):\s+([\d:\.]+),\s+(-[\d:\.]+)', line)
    if match:
        track_name = match.group(1)
        tas_str = match.group(2)
        vsrta_str = match.group(3)
        
        tas_seconds = parse_time(tas_str)
        vsrta_seconds = parse_time(vsrta_str)
        
        rta_seconds = tas_seconds - vsrta_seconds
        rta_formatted = format_time(rta_seconds)
        
        results.append(f"{track_name}: {rta_formatted}")

for result in results:
    print(result)
