import { format, parseISO, subDays } from "date-fns";

/**
 * Calculates the current tracking date string (YYYY-MM-DD) based on a 6:00 AM IST daily reset.
 * 
 * Rules:
 * - Daily reset occurs at 06:00:00 IST (Indian Standard Time, UTC+5:30).
 * - Between 00:00:00 IST and 05:59:59 IST, the tracking day belongs to the PREVIOUS date.
 * - At and after 06:00:00 IST, the tracking day belongs to the CURRENT date.
 */
export function getTrackingDate(date: Date = new Date()): string {
  // Convert date to IST (UTC + 5 hours 30 minutes)
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcTime + istOffsetMs);

  const hours = istDate.getUTCHours();

  // If before 6:00 AM IST, count as previous tracking day
  if (hours < 6) {
    istDate.setUTCDate(istDate.getUTCDate() - 1);
  }

  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(istDate.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Checks if a given date string (YYYY-MM-DD) is locked for editing.
 * Any date strictly BEFORE the current active tracking date is locked.
 */
export function isDateLocked(dateStr: string, currentTrackingDate: string = getTrackingDate()): boolean {
  return dateStr < currentTrackingDate;
}

/**
 * Formats a tracking date for display with lock status info
 */
export function formatTrackingDate(dateStr: string): string {
  const parsed = parseISO(dateStr);
  return format(parsed, "EEEE, MMMM d, yyyy");
}
