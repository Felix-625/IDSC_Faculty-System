/**
 * Converts 24-hour time "HH:mm" to 12-hour formatted time "h:mm A"
 * Example: "07:00" -> "7:00 AM", "14:30" -> "2:30 PM"
 */
export function formatTime12(time24) {
  if (!time24 || typeof time24 !== 'string') return '';
  const [hourStr, minuteStr] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  if (isNaN(hour)) return time24;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minuteStr || '00'} ${ampm}`;
}

/**
 * Formats a start and end time range
 * Example: ("07:00", "10:00") -> "7:00 AM–10:00 AM"
 */
export function formatTimeRange(start24, end24) {
  if (!start24 && !end24) return '';
  if (!start24) return formatTime12(end24);
  if (!end24) return formatTime12(start24);
  return `${formatTime12(start24)}–${formatTime12(end24)}`;
}

/**
 * Formats currency in Philippine Peso (PHP)
 * Example: 45000 -> "₱45,000.00"
 */
export function formatCurrencyPHP(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return '₱0.00';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Formats ISO date string to readable format
 * Example: "2026-09-05T08:00:00Z" -> "Sep 05, 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Formats date and time
 * Example: "2026-09-05T08:00:00Z" -> "Sep 05, 2026, 8:00 AM"
 */
export function formatDateTime(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Formats grade to two decimal places
 * Example: 1.5 -> "1.50", 1 -> "1.00"
 */
export function formatGrade(grade) {
  if (grade === null || grade === undefined || grade === '') return '—';
  const num = typeof grade === 'number' ? grade : parseFloat(grade);
  if (isNaN(num)) return String(grade);
  return num.toFixed(2);
}

/**
 * Generates up to 2 uppercase initials from a name
 * Example: "Maria Dela Cruz" -> "MD", "Juan Reyes" -> "JR"
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
