/**
 * MERIDIAN Institutional Currency Service
 * Standardizes USD-to-INR presentation across all dashboards, models, and intelligence reports
 * using the Indian Numbering System (₹ Lakh, ₹ Crore, ₹ Lakh Crore).
 */

export const USD_TO_INR_RATE = 84.15; // Benchmark RBI Reference Rate

export interface ConvertedFinancial {
  originalUsd: number;
  inrAmount: number;
  formattedInr: string;
  formattedUsd: string;
  rate: number;
}

/**
 * Formats an INR numerical amount into standard Indian Numbering syntax:
 * - >= 10^12: ₹X.XX Lakh Cr
 * - >= 10^7: ₹X,XXX Cr
 * - >= 10^5: ₹X.XX Lakh
 * - < 10^5: ₹XX,XXX
 */
export function formatInr(amountInr: number): string {
  if (amountInr === null || amountInr === undefined || isNaN(amountInr)) {
    return "N/A";
  }

  const sign = amountInr < 0 ? "-" : "";
  const abs = Math.abs(amountInr);

  // 1 Lakh Crore = 1,00,00,00,00,000 (10^12)
  if (abs >= 1_000_000_000_000) {
    const lakhCr = abs / 1_000_000_000_000;
    return `${sign}₹${lakhCr.toFixed(2).replace(/\.?0+$/, "")} Lakh Cr`;
  }

  // 1 Crore = 1,00,00,000 (10^7)
  if (abs >= 10_000_000) {
    const cr = abs / 10_000_000;
    if (cr >= 1000) {
      const crInt = Math.round(cr);
      const str = crInt.toString();
      const lastThree = str.slice(-3);
      const remaining = str.slice(0, -3);
      const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
      const grouped = formattedRemaining ? `${formattedRemaining},${lastThree}` : lastThree;
      return `${sign}₹${grouped} Cr`;
    }
    return `${sign}₹${cr.toFixed(1).replace(/\.?0+$/, "")} Cr`;
  }

  // 1 Lakh = 1,00,000 (10^5)
  if (abs >= 100_000) {
    const lakh = abs / 100_000;
    return `${sign}₹${lakh.toFixed(2).replace(/\.?0+$/, "")} Lakh`;
  }

  // Below 1 Lakh: Indian grouping
  const intStr = Math.round(abs).toString();
  if (intStr.length > 3) {
    const lastThree = intStr.slice(-3);
    const remaining = intStr.slice(0, -3);
    const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return `${sign}₹${formattedRemaining},${lastThree}`;
  }
  return `${sign}₹${intStr}`;
}

/**
 * Formats a USD amount into institutional presentation INR with optional secondary USD footnote.
 * Handles string millions/billions/dollars or raw numeric amounts.
 */
export function formatUsdToInr(
  usdAmount: number,
  options: { showSecondaryUsd?: boolean; rate?: number } = {}
): string {
  const rate = options.rate || USD_TO_INR_RATE;
  const inr = usdAmount * rate;
  const formattedInr = formatInr(inr);

  if (options.showSecondaryUsd) {
    let formattedUsd = `$${usdAmount.toLocaleString()}`;
    if (Math.abs(usdAmount) >= 1_000_000_000) {
      formattedUsd = `$${(usdAmount / 1_000_000_000).toFixed(1)}B`;
    } else if (Math.abs(usdAmount) >= 1_000_000) {
      formattedUsd = `$${(usdAmount / 1_000_000).toFixed(1)}M`;
    }
    return `${formattedInr} (${formattedUsd})`;
  }

  return formattedInr;
}
