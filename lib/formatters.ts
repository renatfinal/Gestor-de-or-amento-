/**
 * Formats a raw string of digits into currency: 0.000,00
 * e.g., "150000" -> "1.500,00"
 * "50" -> "0,50"
 */
export function formatCurrencyInput(val: string): { formatted: string; numeric: number } {
  // Extract all digits
  const cleanDigits = val.replace(/\D/g, '');
  if (!cleanDigits) {
    return { formatted: '0,00', numeric: 0 };
  }

  const numericValue = parseInt(cleanDigits, 10) / 100;
  const formatted = numericValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return { formatted, numeric: numericValue };
}

/**
 * Parses a Brazilian currency string (e.g. "1.500,00") into a float number
 */
export function parseCurrencyToNumber(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Formats a number to Brazilian currency string with R$
 */
export function formatBRL(amount: number): string {
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Formats vehicle license plate:
 * Always UPPERCASE, auto adds hyphen if old pattern, allows Mercosul (BRA2E19)
 */
export function formatPlate(val: string): string {
  if (!val) return '';
  // Convert to uppercase and keep only letters and numbers
  const upper = val.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (upper.length <= 3) {
    return upper;
  }
  // Mercosul plate: 3 letters + 1 number + 1 letter + 2 numbers (e.g., ABC1D23)
  // Old plate: 3 letters + 4 numbers (e.g., ABC-1234)
  if (upper.length > 7) {
    return upper.slice(0, 7);
  }

  // Format with hyphen if it looks like old format or general view:
  // Usually Mercosul is written ABC1D23 without hyphen, old is ABC-1234
  return upper;
}

/**
 * Formats phone number into: (XX) XXXXX-XXXX
 */
export function formatPhone(val: string): string {
  if (!val) return '';
  const digits = val.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : '';
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Formats date into: XX/XX/XXXX
 */
export function formatDateInput(val: string): string {
  if (!val) return '';
  const digits = val.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

/**
 * Converts YYYY-MM-DD to DD/MM/YYYY
 */
export function isoToBrDate(isoString: string): string {
  if (!isoString) return '';
  const parts = isoString.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoString;
}

/**
 * Converts DD/MM/YYYY to YYYY-MM-DD
 */
export function brDateToIso(brDate: string): string {
  if (!brDate) return '';
  const parts = brDate.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    if (d && m && y && y.length === 4) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return '';
}
