// Update the fieldKeywords to include phone number patterns
const fieldKeywords = {
  // ... other field keywords remain the same ...
  
  phone_number: [
    'phone', 'tel', 'mobile', 'cell', 'contact', 'number', 'telephone',
    '1stphone', '2ndphone', '3rdphone', '4thphone', '5thphone',
    'home phone', 'work phone', 'mobile number', 'cell number', 'primary phone',
    'phone 1', 'phone1', 'contact number', 'best contact'
  ],
  
  // ... rest of the field keywords remain the same ...
};

// Update the findBestFieldMatch function to better handle phone numbers
export function findBestFieldMatch(csvHeader: string, sampleValue?: string, existingMappings: Record<string, string> = {}): any | null {
  const normalizedHeader = csvHeader.toLowerCase().trim();
  let bestMatch: any = { dbField: '', confidence: 0 };

  // Clean header for matching
  const cleanHeader = normalizedHeader
    .replace(/^(primary|secondary|alt|alternate|other)\s+/, '')
    .replace(/\s+(1|2|3|#1|#2|#3)$/, '')
    .replace(/^(\d)(st|nd|rd|th)/, '')
    .replace(/[^a-z0-9]/g, '');

  // Check if this looks like a phone number field
  const isPhoneField = /phone|tel|cell|mobile|contact/i.test(normalizedHeader);
  
  // If it looks like a phone field and has a valid sample value, map to phone_number
  if (isPhoneField && sampleValue) {
    const cleanedPhone = sampleValue.replace(/\D/g, '');
    if (cleanedPhone.length >= 10) {
      return { dbField: 'phone_number', confidence: 0.9 };
    }
  }

  // Rest of the matching logic remains the same...
  // ... (keep existing matching logic)

  return bestMatch.confidence > 0.5 ? bestMatch : null;
}