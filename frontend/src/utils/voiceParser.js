/**
 * Parse growth measurements from natural speech.
 * Examples:
 * "weight 8.2 kg height 72 cm date 5 may 2025"
 * "12.5 kilograms 74 centimeters"
 * "muac 14.5"
 */
export const parseGrowthVoice = (text) => {
  const result = {};
  const lower = text.toLowerCase();

  // Weight (supports "weight 8.2 kg" or "8.2 kilograms")
  const weightMatch = lower.match(/(?:weight|wt)[:\s]*(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilogram)?/i) ||
                      lower.match(/(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilogram)/i);
  if (weightMatch) result.weightKg = parseFloat(weightMatch[1]);

  // Height
  const heightMatch = lower.match(/(?:height|ht)[:\s]*(\d+(?:\.\d+)?)\s*(?:cm|centimeter)/i) ||
                      lower.match(/(\d+(?:\.\d+)?)\s*(?:cm|centimeter)/i);
  if (heightMatch) result.heightCm = parseFloat(heightMatch[1]);

  // MUAC
  const muacMatch = lower.match(/(?:muac|mid arm)[:\s]*(\d+(?:\.\d+)?)\s*(?:cm|centimeter)/i);
  if (muacMatch) result.muacCm = parseFloat(muacMatch[1]);

  // Date (e.g., "5 may 2025" or "2025-05-05")
  const dateMatch = lower.match(/(?:date|on)[:\s]*(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i);
  if (dateMatch) {
    const months = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };
    const month = months[dateMatch[2].toLowerCase().slice(0,3)];
    if (month !== undefined) {
      const date = new Date(parseInt(dateMatch[3]), month, parseInt(dateMatch[1]));
      if (!isNaN(date)) result.recordDate = date.toISOString().slice(0,10);
    }
  }
  // Fallback to ISO date
  const isoMatch = lower.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!result.recordDate && isoMatch) result.recordDate = isoMatch[0];

  return result;
};

/**
 * Parse attendance status from speech.
 * Returns { isPresent: boolean } or null if not understood.
 */
export const parseAttendanceVoice = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('present') || lower.includes('here') || lower.includes('attended')) {
    return { isPresent: true };
  }
  if (lower.includes('absent') || lower.includes('not here') || lower.includes('missing')) {
    return { isPresent: false };
  }
  return null;
};

/**
 * Parse beneficiary registration details from speech.
 * Extracts name, parent name, age/DOB, gender.
 */
export const parseBeneficiaryVoice = (text) => {
  const result = {};
  const lower = text.toLowerCase();

  // Name: "name Radhika"
  const nameMatch = lower.match(/(?:name|child name|baby name)[:\s]+([a-zA-Z\s]+?)(?:\s+(?:parent|age|dob|gender)|$)/i);
  if (nameMatch) result.fullName = nameMatch[1].trim();

  // Parent name
  const parentMatch = lower.match(/(?:parent|guardian|mother|father)[:\s]+([a-zA-Z\s]+?)(?:\s+(?:age|dob|gender|$))/i);
  if (parentMatch) result.parentName = parentMatch[1].trim();

  // Gender
  if (lower.includes('boy') || lower.includes('male')) result.gender = 'MALE';
  else if (lower.includes('girl') || lower.includes('female')) result.gender = 'FEMALE';
  else if (lower.includes('other')) result.gender = 'OTHER';

  // Age from "age 2 years" or "2 years old"
  const ageMatch = lower.match(/(?:age|old)[:\s]*(\d+)\s*(?:years?|yrs?)/i);
  if (ageMatch) {
    const age = parseInt(ageMatch[1]);
    const today = new Date();
    const dob = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
    result.dateOfBirth = dob.toISOString().slice(0,10);
  }

  // Or direct DOB: "date of birth 2022-05-10"
  const dobMatch = lower.match(/(?:dob|date of birth|birth date)[:\s]*(\d{4}-\d{2}-\d{2})/i);
  if (dobMatch) result.dateOfBirth = dobMatch[1];

  return result;
};