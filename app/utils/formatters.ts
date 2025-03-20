/**
 * Formats a phone number to the format: +1 (###) ###-####
 * Automatically adds +1 if missing
 * 
 * @param phoneNumber The raw phone number input
 * @returns The formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Check if the country code is missing
  let formattedNumber = digitsOnly;
  if (!digitsOnly.startsWith('1') && digitsOnly.length === 10) {
    formattedNumber = '1' + digitsOnly;
  } else if (digitsOnly.length < 10) {
    // Return the original if there aren't enough digits to format
    return phoneNumber;
  }
  
  // Handle case where number might be longer than 11 digits
  if (formattedNumber.length > 11) {
    formattedNumber = formattedNumber.slice(0, 11);
  }
  
  // Format the number
  if (formattedNumber.length === 11 && formattedNumber.startsWith('1')) {
    return `+1 (${formattedNumber.slice(1, 4)}) ${formattedNumber.slice(4, 7)}-${formattedNumber.slice(7, 11)}`;
  }
  
  // If we couldn't format it properly, return the original
  return phoneNumber;
}

/**
 * Validates a phone number to ensure it can be formatted correctly
 * 
 * @param phoneNumber The phone number to validate
 * @returns Boolean indicating if the phone number is valid
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Must have either 10 digits (US number without country code)
  // or 11 digits starting with 1 (US number with country code)
  return (
    digitsOnly.length === 10 || 
    (digitsOnly.length === 11 && digitsOnly.startsWith('1'))
  );
} 