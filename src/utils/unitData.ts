export type UnitCategoryId =
  | 'currency'
  | 'length'
  | 'mass'
  | 'temperature'
  | 'area'
  | 'volume'
  | 'speed'
  | 'time'
  | 'data';

export interface UnitDefinition {
  id: string;
  label: string;
  shortLabel: string;
  /** Factor to convert 1 unit into base unit (for linear categories) */
  factor?: number;
}

export interface UnitCategory {
  id: UnitCategoryId;
  label: string;
  units: UnitDefinition[];
}

export const CURRENCY_UNITS: UnitDefinition[] = [
  { id: 'USD', label: 'USD — US Dollar ($)', shortLabel: 'USD' },
  { id: 'EUR', label: 'EUR — Euro (€)', shortLabel: 'EUR' },
  { id: 'GBP', label: 'GBP — British Pound (£)', shortLabel: 'GBP' },
  { id: 'JPY', label: 'JPY — Japanese Yen (¥)', shortLabel: 'JPY' },
  { id: 'CHF', label: 'CHF — Swiss Franc', shortLabel: 'CHF' },
  { id: 'CAD', label: 'CAD — Canadian Dollar', shortLabel: 'CAD' },
  { id: 'AUD', label: 'AUD — Australian Dollar', shortLabel: 'AUD' },
  { id: 'CNY', label: 'CNY — Chinese Yuan', shortLabel: 'CNY' },
  { id: 'INR', label: 'INR — Indian Rupee (₹)', shortLabel: 'INR' },
  { id: 'AED', label: 'AED — UAE Dirham', shortLabel: 'AED' },
  { id: 'SAR', label: 'SAR — Saudi Riyal', shortLabel: 'SAR' },
  { id: 'SGD', label: 'SGD — Singapore Dollar', shortLabel: 'SGD' },
  { id: 'HKD', label: 'HKD — Hong Kong Dollar', shortLabel: 'HKD' },
  { id: 'KRW', label: 'KRW — South Korean Won', shortLabel: 'KRW' },
  { id: 'NZD', label: 'NZD — New Zealand Dollar', shortLabel: 'NZD' },
  { id: 'BRL', label: 'BRL — Brazilian Real', shortLabel: 'BRL' },
  { id: 'MXN', label: 'MXN — Mexican Peso', shortLabel: 'MXN' },
  { id: 'ZAR', label: 'ZAR — South African Rand', shortLabel: 'ZAR' },
  { id: 'TRY', label: 'TRY — Turkish Lira', shortLabel: 'TRY' },
  { id: 'SEK', label: 'SEK — Swedish Krona', shortLabel: 'SEK' },
  { id: 'NOK', label: 'NOK — Norwegian Krone', shortLabel: 'NOK' },
  { id: 'DKK', label: 'DKK — Danish Krone', shortLabel: 'DKK' },
  { id: 'PLN', label: 'PLN — Polish Zloty', shortLabel: 'PLN' },
  { id: 'THB', label: 'THB — Thai Baht', shortLabel: 'THB' },
  { id: 'IDR', label: 'IDR — Indonesian Rupiah', shortLabel: 'IDR' },
  { id: 'MYR', label: 'MYR — Malaysian Ringgit', shortLabel: 'MYR' },
  { id: 'PHP', label: 'PHP — Philippine Peso', shortLabel: 'PHP' },
  { id: 'EGP', label: 'EGP — Egyptian Pound', shortLabel: 'EGP' },
  { id: 'NGN', label: 'NGN — Nigerian Naira', shortLabel: 'NGN' },
  { id: 'ILS', label: 'ILS — Israeli New Shekel', shortLabel: 'ILS' },
];

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    label: 'Length',
    units: [
      { id: 'meters', label: 'meters', shortLabel: 'm', factor: 1 },
      { id: 'kilometers', label: 'kilometers', shortLabel: 'km', factor: 1000 },
      { id: 'centimeters', label: 'centimeters', shortLabel: 'cm', factor: 0.01 },
      { id: 'millimeters', label: 'millimeters', shortLabel: 'mm', factor: 0.001 },
      { id: 'miles', label: 'miles', shortLabel: 'mi', factor: 1609.344 },
      { id: 'yards', label: 'yards', shortLabel: 'yd', factor: 0.9144 },
      { id: 'feet', label: 'feet', shortLabel: 'ft', factor: 0.3048 },
      { id: 'inches', label: 'inches', shortLabel: 'in', factor: 0.0254 },
      { id: 'nautical_miles', label: 'nautical miles', shortLabel: 'nmi', factor: 1852 },
    ],
  },
  {
    id: 'currency',
    label: 'Currency (Live)',
    units: CURRENCY_UNITS,
  },
  {
    id: 'mass',
    label: 'Weight / Mass',
    units: [
      { id: 'kilograms', label: 'kilograms', shortLabel: 'kg', factor: 1 },
      { id: 'grams', label: 'grams', shortLabel: 'g', factor: 0.001 },
      { id: 'milligrams', label: 'milligrams', shortLabel: 'mg', factor: 0.000001 },
      { id: 'metric_tons', label: 'metric tons', shortLabel: 't', factor: 1000 },
      { id: 'pounds', label: 'pounds', shortLabel: 'lb', factor: 0.45359237 },
      { id: 'ounces', label: 'ounces', shortLabel: 'oz', factor: 0.028349523125 },
      { id: 'stones', label: 'stones', shortLabel: 'st', factor: 6.35029318 },
      { id: 'troy_oz', label: 'troy ounces (gold)', shortLabel: 'ozt', factor: 0.0311034768 },
    ],
  },
  {
    id: 'temperature',
    label: 'Temperature',
    units: [
      { id: 'celsius', label: 'Celsius (°C)', shortLabel: '°C' },
      { id: 'fahrenheit', label: 'Fahrenheit (°F)', shortLabel: '°F' },
      { id: 'kelvin', label: 'Kelvin (K)', shortLabel: 'K' },
    ],
  },
  {
    id: 'area',
    label: 'Area',
    units: [
      { id: 'sq_meters', label: 'sq meters', shortLabel: 'm²', factor: 1 },
      { id: 'sq_kilometers', label: 'sq kilometers', shortLabel: 'km²', factor: 1e6 },
      { id: 'hectares', label: 'hectares', shortLabel: 'ha', factor: 10000 },
      { id: 'acres', label: 'acres', shortLabel: 'ac', factor: 4046.8564224 },
      { id: 'sq_feet', label: 'sq feet', shortLabel: 'ft²', factor: 0.09290304 },
      { id: 'sq_miles', label: 'sq miles', shortLabel: 'mi²', factor: 2589988.110336 },
    ],
  },
  {
    id: 'volume',
    label: 'Volume',
    units: [
      { id: 'liters', label: 'liters', shortLabel: 'L', factor: 1 },
      { id: 'milliliters', label: 'milliliters', shortLabel: 'mL', factor: 0.001 },
      { id: 'cubic_meters', label: 'cubic meters', shortLabel: 'm³', factor: 1000 },
      { id: 'us_gallons', label: 'US gallons', shortLabel: 'gal', factor: 3.785411784 },
      { id: 'us_quarts', label: 'US quarts', shortLabel: 'qt', factor: 0.946352946 },
      { id: 'us_cups', label: 'US cups', shortLabel: 'cup', factor: 0.2365882365 },
      { id: 'fluid_oz', label: 'US fluid oz', shortLabel: 'fl oz', factor: 0.0295735295625 },
    ],
  },
  {
    id: 'speed',
    label: 'Speed',
    units: [
      { id: 'mps', label: 'meters/sec', shortLabel: 'm/s', factor: 1 },
      { id: 'kmh', label: 'km/hour', shortLabel: 'km/h', factor: 1 / 3.6 },
      { id: 'mph', label: 'miles/hour', shortLabel: 'mph', factor: 0.44704 },
      { id: 'knots', label: 'knots', shortLabel: 'kn', factor: 0.5144444444 },
    ],
  },
  {
    id: 'time',
    label: 'Time',
    units: [
      { id: 'seconds', label: 'seconds', shortLabel: 's', factor: 1 },
      { id: 'minutes', label: 'minutes', shortLabel: 'min', factor: 60 },
      { id: 'hours', label: 'hours', shortLabel: 'hr', factor: 3600 },
      { id: 'days', label: 'days', shortLabel: 'd', factor: 86400 },
      { id: 'weeks', label: 'weeks', shortLabel: 'wk', factor: 604800 },
      { id: 'years', label: 'years (365d)', shortLabel: 'yr', factor: 31536000 },
    ],
  },
  {
    id: 'data',
    label: 'Digital Data',
    units: [
      { id: 'bytes', label: 'Bytes', shortLabel: 'B', factor: 1 },
      { id: 'kb', label: 'Kilobytes', shortLabel: 'KB', factor: 1024 },
      { id: 'mb', label: 'Megabytes', shortLabel: 'MB', factor: 1024 ** 2 },
      { id: 'gb', label: 'Gigabytes', shortLabel: 'GB', factor: 1024 ** 3 },
      { id: 'tb', label: 'Terabytes', shortLabel: 'TB', factor: 1024 ** 4 },
    ],
  },
];

export function convertUnitValue(
  categoryId: UnitCategoryId,
  value: number,
  fromId: string,
  toId: string,
  currencyRates?: Record<string, number>
): number {
  if (!Number.isFinite(value)) return 0;
  if (fromId === toId) return value;

  if (categoryId === 'currency') {
    if (!currencyRates) return 0;
    const fromRate = currencyRates[fromId];
    const toRate = currencyRates[toId];
    if (!fromRate || !toRate) return 0;
    return (value / fromRate) * toRate;
  }

  if (categoryId === 'temperature') {
    let celsius = value;
    if (fromId === 'fahrenheit') celsius = ((value - 32) * 5) / 9;
    else if (fromId === 'kelvin') celsius = value - 273.15;

    if (toId === 'celsius') return celsius;
    if (toId === 'fahrenheit') return (celsius * 9) / 5 + 32;
    if (toId === 'kelvin') return celsius + 273.15;
    return celsius;
  }

  const category = UNIT_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return value;
  const fromUnit = category.units.find((u) => u.id === fromId);
  const toUnit = category.units.find((u) => u.id === toId);
  if (!fromUnit?.factor || !toUnit?.factor) return value;

  return (value * fromUnit.factor) / toUnit.factor;
}
