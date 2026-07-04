
export function formatTime(timeMs: number, isTM2: boolean = false, showSign: boolean = false) {

  if (timeMs < 0) {
    const sign = showSign ? timeMs > 0 ? "+" : "-" : "";
    return `${sign}${Math.abs(timeMs) / 1000}`
  }

  const sign = showSign ? timeMs > 0 ? "+" : "-" : "";
  const abs = Math.abs(timeMs);

  const rounded = isTM2 ? Math.round(abs) : Math.round(abs / 10) * 10;
  const minutes = Math.floor(rounded / 60000);
  const seconds = Math.floor((rounded % 60000) / 1000);
  const split = isTM2 ? rounded % 1000 : Math.floor((rounded % 1000) / 10);
  const decimals = isTM2 ? 3 : 2

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

export function formatDiff(timeMs: number, rtaMs: number, isTM2: boolean = false, showSign: boolean = true) { 

  if (timeMs < 0) {
    const sign = showSign ? rtaMs < timeMs ? "-" : "+" : "";
    return `${sign}${Math.abs(timeMs - rtaMs) / 1000}`
  };

  return `${showSign ? rtaMs < timeMs ? "+" : "-" : ""}${formatTime(rtaMs - timeMs, isTM2)}`
}

export function formatPercentSaved(timeMs: number, rtaMs: number, numSig: number, showSign: boolean = false) {

  const percent = (rtaMs - timeMs) / rtaMs * 100;
  if (percent >= 1000) {
    return "+++"
  }
  
  let str = Math.abs(Number(percent)).toPrecision(numSig);

  if (str.length > numSig + 1) {
    str = str.slice(0, numSig + 1);

    if (str.endsWith(".")) {
      str = str.slice(0, -1);
    }
  }

  if (showSign) {
    return `${percent < 0 ? "+" : "-"}${str}`;
  }
  if (rtaMs < 0) {
    return `${percent <= 0 ? "" : "-"}${str}`;
  } else {
    return `${percent >= 0 ? "" : "+"}${str}`;
  }
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: '2-digit'
  }).replace(/ /g, '-')       
}

export function formatGame(gameStr: string, font?: string) {
  if (font === "DOSVGA") {
    if (gameStr === "TM2") return "TM\u00FD"
    return gameStr
  }
  if (gameStr === "TM2") return "TM²"
  return gameStr
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
