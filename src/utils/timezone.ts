import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

// Map of area codes to timezone identifiers
const areaCodeTimezones: Record<string, string> = {
  // Eastern Time
  '201': 'America/New_York', '202': 'America/New_York', '203': 'America/New_York',
  '207': 'America/New_York', '212': 'America/New_York', '215': 'America/New_York',
  '216': 'America/New_York', '234': 'America/New_York', '239': 'America/New_York',
  '240': 'America/New_York', '267': 'America/New_York', '301': 'America/New_York',
  '302': 'America/New_York', '305': 'America/New_York', '315': 'America/New_York',
  '321': 'America/New_York', '330': 'America/New_York', '347': 'America/New_York',
  '351': 'America/New_York', '352': 'America/New_York', '386': 'America/New_York',
  '401': 'America/New_York', '404': 'America/New_York', '407': 'America/New_York',
  '410': 'America/New_York', '419': 'America/New_York', '440': 'America/New_York',
  '443': 'America/New_York', '484': 'America/New_York', '516': 'America/New_York',
  '561': 'America/New_York', '585': 'America/New_York', '607': 'America/New_York',
  '610': 'America/New_York', '646': 'America/New_York', '678': 'America/New_York',
  '704': 'America/New_York', '716': 'America/New_York', '717': 'America/New_York',
  '727': 'America/New_York', '732': 'America/New_York', '754': 'America/New_York',
  '772': 'America/New_York', '786': 'America/New_York', '813': 'America/New_York',
  '828': 'America/New_York', '845': 'America/New_York', '850': 'America/New_York',
  '856': 'America/New_York', '862': 'America/New_York', '904': 'America/New_York',
  '908': 'America/New_York', '914': 'America/New_York', '917': 'America/New_York',
  '919': 'America/New_York', '929': 'America/New_York', '954': 'America/New_York',

  // Central Time
  '205': 'America/Chicago', '214': 'America/Chicago', '217': 'America/Chicago',
  '224': 'America/Chicago', '225': 'America/Chicago', '228': 'America/Chicago',
  '251': 'America/Chicago', '254': 'America/Chicago', '262': 'America/Chicago',
  '281': 'America/Chicago', '309': 'America/Chicago', '312': 'America/Chicago',
  '314': 'America/Chicago', '316': 'America/Chicago', '318': 'America/Chicago',
  '319': 'America/Chicago', '331': 'America/Chicago', '334': 'America/Chicago',
  '337': 'America/Chicago', '361': 'America/Chicago', '402': 'America/Chicago',
  '405': 'America/Chicago', '409': 'America/Chicago', '414': 'America/Chicago',
  '417': 'America/Chicago', '430': 'America/Chicago', '432': 'America/Chicago',
  '469': 'America/Chicago', '479': 'America/Chicago', '501': 'America/Chicago',
  '504': 'America/Chicago', '507': 'America/Chicago', '512': 'America/Chicago',
  '515': 'America/Chicago', '563': 'America/Chicago', '573': 'America/Chicago',
  '580': 'America/Chicago', '601': 'America/Chicago', '608': 'America/Chicago',
  '612': 'America/Chicago', '615': 'America/Chicago', '618': 'America/Chicago',
  '630': 'America/Chicago', '636': 'America/Chicago', '651': 'America/Chicago',
  '662': 'America/Chicago', '682': 'America/Chicago', '708': 'America/Chicago',
  '713': 'America/Chicago', '715': 'America/Chicago', '731': 'America/Chicago',
  '763': 'America/Chicago', '769': 'America/Chicago', '773': 'America/Chicago',
  '815': 'America/Chicago', '816': 'America/Chicago', '817': 'America/Chicago',
  '830': 'America/Chicago', '832': 'America/Chicago', '847': 'America/Chicago',
  '870': 'America/Chicago', '901': 'America/Chicago', '903': 'America/Chicago',
  '913': 'America/Chicago', '918': 'America/Chicago', '920': 'America/Chicago',
  '936': 'America/Chicago', '940': 'America/Chicago', '952': 'America/Chicago',
  '956': 'America/Chicago', '972': 'America/Chicago', '979': 'America/Chicago',

  // Mountain Time
  '303': 'America/Denver', '307': 'America/Denver', '385': 'America/Denver',
  '406': 'America/Denver', '435': 'America/Denver', '480': 'America/Denver',
  '505': 'America/Denver', '520': 'America/Denver', '575': 'America/Denver',
  '602': 'America/Denver', '623': 'America/Denver', '720': 'America/Denver',
  '928': 'America/Denver', '970': 'America/Denver',

  // Pacific Time
  '206': 'America/Los_Angeles', '209': 'America/Los_Angeles', '213': 'America/Los_Angeles',
  '253': 'America/Los_Angeles', '310': 'America/Los_Angeles', '323': 'America/Los_Angeles',
  '408': 'America/Los_Angeles', '415': 'America/Los_Angeles', '425': 'America/Los_Angeles',
  '442': 'America/Los_Angeles', '503': 'America/Los_Angeles', '509': 'America/Los_Angeles',
  '510': 'America/Los_Angeles', '530': 'America/Los_Angeles', '559': 'America/Los_Angeles',
  '562': 'America/Los_Angeles', '619': 'America/Los_Angeles', '626': 'America/Los_Angeles',
  '650': 'America/Los_Angeles', '657': 'America/Los_Angeles', '661': 'America/Los_Angeles',
  '669': 'America/Los_Angeles', '702': 'America/Los_Angeles', '707': 'America/Los_Angeles',
  '714': 'America/Los_Angeles', '725': 'America/Los_Angeles', '747': 'America/Los_Angeles',
  '760': 'America/Los_Angeles', '775': 'America/Los_Angeles', '805': 'America/Los_Angeles',
  '818': 'America/Los_Angeles', '831': 'America/Los_Angeles', '858': 'America/Los_Angeles',
  '909': 'America/Los_Angeles', '916': 'America/Los_Angeles', '925': 'America/Los_Angeles',
  '949': 'America/Los_Angeles', '951': 'America/Los_Angeles',

  // Alaska Time
  '907': 'America/Anchorage',

  // Hawaii Time
  '808': 'Pacific/Honolulu',
};

export function getTimezoneFromAreaCode(areaCode: string): string {
  return areaCodeTimezones[areaCode] || 'America/New_York'; // Default to ET if unknown
}

export function isWithinCallHours(phoneNumber: string): boolean {
  // Extract area code
  const areaCode = phoneNumber.substring(0, 3);
  const timezone = getTimezoneFromAreaCode(areaCode);

  // Get current time in the target timezone
  const now = new Date();
  const zonedTime = utcToZonedTime(now, timezone);
  const hour = zonedTime.getHours();

  // Check if within 8am-9pm in the target timezone
  return hour >= 8 && hour < 21;
}

export function getNextCallWindow(phoneNumber: string): Date {
  const areaCode = phoneNumber.substring(0, 3);
  const timezone = getTimezoneFromAreaCode(areaCode);
  const now = new Date();
  const zonedTime = utcToZonedTime(now, timezone);
  const hour = zonedTime.getHours();

  // If before 8am, return 8am today
  if (hour < 8) {
    zonedTime.setHours(8, 0, 0, 0);
    return zonedTimeToUtc(zonedTime, timezone);
  }

  // If after 9pm, return 8am tomorrow
  if (hour >= 21) {
    zonedTime.setDate(zonedTime.getDate() + 1);
    zonedTime.setHours(8, 0, 0, 0);
    return zonedTimeToUtc(zonedTime, timezone);
  }

  return now;
}