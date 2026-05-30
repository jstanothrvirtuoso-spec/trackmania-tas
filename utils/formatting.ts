
export function formatTime(timeMs: number, isStunt: boolean = false, isTM2: boolean = false, showSign: boolean = false): string {

  if (isStunt) {
    const sign = showSign && timeMs !== 0 ? timeMs > 0 ? "+" : "-" : "";
    return `${sign}${timeMs / 1000}`
  }

  const sign = showSign ? timeMs > 0 ? "+" : "-" : "";
  const abs = Math.abs(timeMs);
  const minutes = Math.floor(abs / 60000);
  const seconds = Math.floor((abs % 60000) / 1000);
  const decimals = isTM2 ? 3 : 2
  const split = isTM2 ? Math.round(abs) % 1000 : Math.round(abs / 10) % 100;

  if (minutes > 0) {
    return `${sign}${minutes}:${seconds
      .toString()
      .padStart(2, "0")}.${split
      .toString()
      .padStart(decimals, "0")}`;
  }

  return `${sign}${seconds}.${split
    .toString()
    .padStart(decimals, "0")}`;
}

export function formatPercentSaved(timeMs: number, rtaMs: number, numSig: number, isStunt: boolean = false) {

  const percent = ((rtaMs - timeMs) / rtaMs) * (isStunt ? 100 : -100);
  if (percent >= 1000) {
    return "+++"
  }
  let str = Number(percent).toPrecision(numSig);

  const isNegative = str.startsWith("-");
  if (isNegative) str = str.slice(1);

  if (str.length > numSig + 1) {
    str = str.slice(0, numSig + 1);

    if (str.endsWith(".")) {
      str = str.slice(0, -1);
    }
  }

  if (isStunt) {
    return `${percent <= 0 ? "" : "-"}${str}`;
  } else {
    return `${percent <= 0 ? "" : "+"}${str}`;
  }
  
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: '2-digit'
  }).replace(/ /g, '-')       
}

export function timeAgo(dateStr: string) {
  
  const date = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = Math.floor((now - date) / 1000);

  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}
