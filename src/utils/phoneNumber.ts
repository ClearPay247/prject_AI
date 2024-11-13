import { parsePhoneNumber, CountryCode } from 'libphonenumber-js';

export const formatPhoneNumber = (number: string, countryCode: CountryCode = 'US'): string | null => {
  try {
    // If number already has country code, parse as-is
    if (number.startsWith('+')) {
      const phoneNumber = parsePhoneNumber(number);
      return phoneNumber.format('E.164'); // Returns +1234567890 format
    }

    // Otherwise, assume the provided country code
    const phoneNumber = parsePhoneNumber(number, countryCode);
    return phoneNumber.format('E.164');
  } catch (error) {
    console.error('Failed to format phone number:', error);
    return null;
  }
};

export const formatPhoneNumberForDisplay = (number: string): string => {
  try {
    const phoneNumber = parsePhoneNumber(number);
    return phoneNumber.formatInternational(); // Returns "+1 234 567 8900" format
  } catch {
    return number; // Return original if parsing fails
  }
};

export const isValidPhoneNumber = (number: string, countryCode: CountryCode = 'US'): boolean => {
  try {
    if (number.startsWith('+')) {
      return parsePhoneNumber(number).isValid();
    }
    return parsePhoneNumber(number, countryCode).isValid();
  } catch {
    return false;
  }
};