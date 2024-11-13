export const cleanCurrencyValue = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  return parseFloat(value.replace(/[$,]/g, ''));
};

export const cleanDateValue = (value: string | Date | null | undefined): string | null => {
  if (!value) return null;
  
  try {
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Try parsing as ISO date first
    const isoDate = new Date(value);
    if (!isNaN(isoDate.getTime())) {
      return isoDate.toISOString();
    }

    // Try parsing MM/DD/YYYY format
    const parts = value.split(/[/-]/);
    if (parts.length === 3) {
      const [month, day, year] = parts.map(p => parseInt(p));
      if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }
    }

    return null;
  } catch (error) {
    console.warn('Invalid date format:', value);
    return null;
  }
};