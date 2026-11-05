export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDistanceKm(distance: number): string {
  return `${distance.toFixed(1)} km`;
}

export function formatDurationHours(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatFuel(liters: number, uncertaintyPct?: number): string {
  if (uncertaintyPct !== undefined) {
    return `${liters.toFixed(1)} L (±${uncertaintyPct.toFixed(1)}%)`;
  }
  return `${liters.toFixed(1)} L`;
}

export function formatCO2(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} t`;
  }
  return `${kg.toFixed(1)} kg`;
}

export function formatRiskScore(score: number): {
  label: 'Low' | 'Medium' | 'High';
  color: string;
  badgeBg: string;
} {
  if (score < 0.3) {
    return {
      label: 'Low',
      color: '#3ec99f',
      badgeBg: 'bg-[#1a5c47]/40 text-[#3ec99f] border border-[#267b5e]/50',
    };
  }
  if (score < 0.6) {
    return {
      label: 'Medium',
      color: '#d8993a',
      badgeBg: 'bg-[#d8993a]/20 text-[#eab055] border border-[#d8993a]/40',
    };
  }
  return {
    label: 'High',
    color: '#c0504d',
    badgeBg: 'bg-[#c0504d]/20 text-[#d96966] border border-[#c0504d]/40',
  };
}

export function formatDateString(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

