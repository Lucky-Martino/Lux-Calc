export interface CurrencyMeta {
  code: string;
  name: string;
  country: string;
}

const CURRENCY_DIRECTORY: Record<string, { name: string; country: string }> = {
  USD: { name: 'US Dollar', country: 'United States' },
  EUR: { name: 'Euro', country: 'Eurozone (European Union)' },
  GBP: { name: 'British Pound Sterling', country: 'United Kingdom' },
  JPY: { name: 'Japanese Yen', country: 'Japan' },
  CHF: { name: 'Swiss Franc', country: 'Switzerland' },
  CAD: { name: 'Canadian Dollar', country: 'Canada' },
  AUD: { name: 'Australian Dollar', country: 'Australia' },
  CNY: { name: 'Chinese Yuan Renminbi', country: 'China' },
  INR: { name: 'Indian Rupee', country: 'India' },
  AED: { name: 'UAE Dirham', country: 'United Arab Emirates' },
  SAR: { name: 'Saudi Riyal', country: 'Saudi Arabia' },
  SGD: { name: 'Singapore Dollar', country: 'Singapore' },
  HKD: { name: 'Hong Kong Dollar', country: 'Hong Kong' },
  KRW: { name: 'South Korean Won', country: 'South Korea' },
  NZD: { name: 'New Zealand Dollar', country: 'New Zealand' },
  BRL: { name: 'Brazilian Real', country: 'Brazil' },
  MXN: { name: 'Mexican Peso', country: 'Mexico' },
  ZAR: { name: 'South African Rand', country: 'South Africa' },
  TRY: { name: 'Turkish Lira', country: 'Turkey' },
  SEK: { name: 'Swedish Krona', country: 'Sweden' },
  NOK: { name: 'Norwegian Krone', country: 'Norway' },
  DKK: { name: 'Danish Krone', country: 'Denmark' },
  PLN: { name: 'Polish Zloty', country: 'Poland' },
  THB: { name: 'Thai Baht', country: 'Thailand' },
  IDR: { name: 'Indonesian Rupiah', country: 'Indonesia' },
  MYR: { name: 'Malaysian Ringgit', country: 'Malaysia' },
  PHP: { name: 'Philippine Peso', country: 'Philippines' },
  EGP: { name: 'Egyptian Pound', country: 'Egypt' },
  NGN: { name: 'Nigerian Naira', country: 'Nigeria' },
  ILS: { name: 'Israeli New Shekel', country: 'Israel' },
  AFN: { name: 'Afghan Afghani', country: 'Afghanistan' },
  ALL: { name: 'Albanian Lek', country: 'Albania' },
  AMD: { name: 'Armenian Dram', country: 'Armenia' },
  ANG: { name: 'Netherlands Antillean Guilder', country: 'Curaçao & Sint Maarten' },
  AOA: { name: 'Angolan Kwanza', country: 'Angola' },
  ARS: { name: 'Argentine Peso', country: 'Argentina' },
  AWG: { name: 'Aruban Florin', country: 'Aruba' },
  AZN: { name: 'Azerbaijani Manat', country: 'Azerbaijan' },
  BAM: { name: 'Bosnia-Herzegovina Convertible Mark', country: 'Bosnia & Herzegovina' },
  BBD: { name: 'Barbadian Dollar', country: 'Barbados' },
  BDT: { name: 'Bangladeshi Taka', country: 'Bangladesh' },
  BGN: { name: 'Bulgarian Lev', country: 'Bulgaria' },
  BHD: { name: 'Bahraini Dinar', country: 'Bahrain' },
  BIF: { name: 'Burundian Franc', country: 'Burundi' },
  BMD: { name: 'Bermudian Dollar', country: 'Bermuda' },
  BND: { name: 'Brunei Dollar', country: 'Brunei' },
  BOB: { name: 'Bolivian Boliviano', country: 'Bolivia' },
  BSD: { name: 'Bahamian Dollar', country: 'Bahamas' },
  BTN: { name: 'Bhutanese Ngultrum', country: 'Bhutan' },
  BWP: { name: 'Botswanan Pula', country: 'Botswana' },
  BYN: { name: 'Belarusian Ruble', country: 'Belarus' },
  BZD: { name: 'Belize Dollar', country: 'Belize' },
  CDF: { name: 'Congolese Franc', country: 'DR Congo' },
  CLP: { name: 'Chilean Peso', country: 'Chile' },
  COP: { name: 'Colombian Peso', country: 'Colombia' },
  CRC: { name: 'Costa Rican Colón', country: 'Costa Rica' },
  CUP: { name: 'Cuban Peso', country: 'Cuba' },
  CVE: { name: 'Cape Verdean Escudo', country: 'Cape Verde' },
  CZK: { name: 'Czech Koruna', country: 'Czech Republic' },
  DJF: { name: 'Djiboutian Franc', country: 'Djibouti' },
  DOP: { name: 'Dominican Peso', country: 'Dominican Republic' },
  DZD: { name: 'Algerian Dinar', country: 'Algeria' },
  ERN: { name: 'Eritrean Nakfa', country: 'Eritrea' },
  ETB: { name: 'Ethiopian Birr', country: 'Ethiopia' },
  FJD: { name: 'Fijian Dollar', country: 'Fiji' },
  FKP: { name: 'Falkland Islands Pound', country: 'Falkland Islands' },
  FOK: { name: 'Faroese Króna', country: 'Faroe Islands' },
  GEL: { name: 'Georgian Lari', country: 'Georgia' },
  GGP: { name: 'Guernsey Pound', country: 'Guernsey' },
  GHS: { name: 'Ghanaian Cedi', country: 'Ghana' },
  GIP: { name: 'Gibraltar Pound', country: 'Gibraltar' },
  GMD: { name: 'Gambian Dalasi', country: 'Gambia' },
  GNF: { name: 'Guinean Franc', country: 'Guinea' },
  GTQ: { name: 'Guatemalan Quetzal', country: 'Guatemala' },
  GYD: { name: 'Guyanaese Dollar', country: 'Guyana' },
  HNL: { name: 'Honduran Lempira', country: 'Honduras' },
  HRK: { name: 'Croatian Kuna', country: 'Croatia' },
  HTG: { name: 'Haitian Gourde', country: 'Haiti' },
  HUF: { name: 'Hungarian Forint', country: 'Hungary' },
  IMP: { name: 'Manx Pound', country: 'Isle of Man' },
  IQD: { name: 'Iraqi Dinar', country: 'Iraq' },
  IRR: { name: 'Iranian Rial', country: 'Iran' },
  ISK: { name: 'Icelandic Króna', country: 'Iceland' },
  JEP: { name: 'Jersey Pound', country: 'Jersey' },
  JMD: { name: 'Jamaican Dollar', country: 'Jamaica' },
  JOD: { name: 'Jordanian Dinar', country: 'Jordan' },
  KES: { name: 'Kenyan Shilling', country: 'Kenya' },
  KGS: { name: 'Kyrgystani Som', country: 'Kyrgyzstan' },
  KHR: { name: 'Cambodian Riel', country: 'Cambodia' },
  KID: { name: 'Kiribati Dollar', country: 'Kiribati' },
  KMF: { name: 'Comorian Franc', country: 'Comoros' },
  KWD: { name: 'Kuwaiti Dinar', country: 'Kuwait' },
  KYD: { name: 'Cayman Islands Dollar', country: 'Cayman Islands' },
  KZT: { name: 'Kazakhstani Tenge', country: 'Kazakhstan' },
  LAK: { name: 'Laotian Kip', country: 'Laos' },
  LBP: { name: 'Lebanese Pound', country: 'Lebanon' },
  LKR: { name: 'Sri Lankan Rupee', country: 'Sri Lanka' },
  LRD: { name: 'Liberian Dollar', country: 'Liberia' },
  LSL: { name: 'Lesotho Loti', country: 'Lesotho' },
  LYD: { name: 'Libyan Dinar', country: 'Libya' },
  MAD: { name: 'Moroccan Dirham', country: 'Morocco' },
  MDL: { name: 'Moldovan Leu', country: 'Moldova' },
  MGA: { name: 'Malagasy Ariary', country: 'Madagascar' },
  MKD: { name: 'Macedonian Denar', country: 'North Macedonia' },
  MMK: { name: 'Myanmar Kyat', country: 'Myanmar' },
  MNT: { name: 'Mongolian Tugrik', country: 'Mongolia' },
  MOP: { name: 'Macanese Pataca', country: 'Macau' },
  MRU: { name: 'Mauritanian Ouguiya', country: 'Mauritania' },
  MUR: { name: 'Mauritian Rupee', country: 'Mauritius' },
  MVR: { name: 'Maldivian Rufiyaa', country: 'Maldives' },
  MWK: { name: 'Malawian Kwacha', country: 'Malawi' },
  MZN: { name: 'Mozambican Metical', country: 'Mozambique' },
  NAD: { name: 'Namibian Dollar', country: 'Namibia' },
  NIO: { name: 'Nicaraguan Córdoba', country: 'Nicaragua' },
  NPR: { name: 'Nepalese Rupee', country: 'Nepal' },
  OMR: { name: 'Omani Rial', country: 'Oman' },
  PAB: { name: 'Panamanian Balboa', country: 'Panama' },
  PEN: { name: 'Peruvian Sol', country: 'Peru' },
  PGK: { name: 'Papua New Guinean Kina', country: 'Papua New Guinea' },
  PKR: { name: 'Pakistani Rupee', country: 'Pakistan' },
  PYG: { name: 'Paraguayan Guarani', country: 'Paraguay' },
  QAR: { name: 'Qatari Riyal', country: 'Qatar' },
  RON: { name: 'Romanian Leu', country: 'Romania' },
  RSD: { name: 'Serbian Dinar', country: 'Serbia' },
  RUB: { name: 'Russian Ruble', country: 'Russia' },
  RWF: { name: 'Rwandan Franc', country: 'Rwanda' },
  SBD: { name: 'Solomon Islands Dollar', country: 'Solomon Islands' },
  SCR: { name: 'Seychellois Rupee', country: 'Seychelles' },
  SDG: { name: 'Sudanese Pound', country: 'Sudan' },
  SHP: { name: 'Saint Helena Pound', country: 'Saint Helena' },
  SLE: { name: 'Sierra Leonean Leone', country: 'Sierra Leone' },
  SLL: { name: 'Sierra Leonean Leone (Old)', country: 'Sierra Leone' },
  SOS: { name: 'Somali Shilling', country: 'Somalia' },
  SRD: { name: 'Surinamese Dollar', country: 'Suriname' },
  SSP: { name: 'South Sudanese Pound', country: 'South Sudan' },
  STN: { name: 'São Tomé & Príncipe Dobra', country: 'São Tomé & Príncipe' },
  SYP: { name: 'Syrian Pound', country: 'Syria' },
  SZL: { name: 'Swazi Lilangeni', country: 'Eswatini' },
  TJS: { name: 'Tajikistani Somoni', country: 'Tajikistan' },
  TMT: { name: 'Turkmenistani Manat', country: 'Turkmenistan' },
  TND: { name: 'Tunisian Dinar', country: 'Tunisia' },
  TOP: { name: 'Tongan Paʻanga', country: 'Tonga' },
  TTD: { name: 'Trinidad & Tobago Dollar', country: 'Trinidad & Tobago' },
  TVD: { name: 'Tuvaluan Dollar', country: 'Tuvalu' },
  TWD: { name: 'New Taiwan Dollar', country: 'Taiwan' },
  TZS: { name: 'Tanzanian Shilling', country: 'Tanzania' },
  UAH: { name: 'Ukrainian Hryvnia', country: 'Ukraine' },
  UGX: { name: 'Ugandan Shilling', country: 'Uganda' },
  UYU: { name: 'Uruguayan Peso', country: 'Uruguay' },
  UZS: { name: 'Uzbekistani Som', country: 'Uzbekistan' },
  VES: { name: 'Venezuelan Bolívar', country: 'Venezuela' },
  VND: { name: 'Vietnamese Dong', country: 'Vietnam' },
  VUV: { name: 'Vanuatu Vatu', country: 'Vanuatu' },
  WST: { name: 'Samoan Tala', country: 'Samoa' },
  XAF: { name: 'Central African CFA Franc', country: 'Central Africa (CEMAC)' },
  XCD: { name: 'East Caribbean Dollar', country: 'Eastern Caribbean' },
  XCG: { name: 'Caribbean Guilder', country: 'Curaçao & Sint Maarten' },
  XDR: { name: 'IMF Special Drawing Rights', country: 'International Monetary Fund' },
  XOF: { name: 'West African CFA Franc', country: 'West Africa (WAEMU)' },
  XPF: { name: 'CFP Franc', country: 'French Polynesia & New Caledonia' },
  YER: { name: 'Yemeni Rial', country: 'Yemen' },
  ZMW: { name: 'Zambian Kwacha', country: 'Zambia' },
  ZWL: { name: 'Zimbabwean Dollar', country: 'Zimbabwe' },
  ZWG: { name: 'Zimbabwe Gold', country: 'Zimbabwe' },
};

const POPULAR_ORDER = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CHF',
  'CAD',
  'AUD',
  'CNY',
  'INR',
  'AED',
  'SAR',
  'SGD',
  'MXN',
  'BRL',
];

let intlCurrencyNames: Intl.DisplayNames | null = null;
try {
  if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
    intlCurrencyNames = new Intl.DisplayNames(['en'], { type: 'currency' });
  }
} catch {
  intlCurrencyNames = null;
}

export function getCurrencyMeta(code: string): CurrencyMeta {
  const upper = code.toUpperCase();
  const known = CURRENCY_DIRECTORY[upper];
  if (known) {
    return { code: upper, name: known.name, country: known.country };
  }
  const intlName = intlCurrencyNames?.of(upper);
  return {
    code: upper,
    name: intlName && intlName !== upper ? intlName : upper,
    country: 'International',
  };
}

export function buildAllCurrencyList(
  liveRates: Record<string, number> | null
): CurrencyMeta[] {
  const codes = new Set<string>(Object.keys(CURRENCY_DIRECTORY));
  if (liveRates) {
    for (const key of Object.keys(liveRates)) {
      if (/^[A-Z]{3}$/.test(key)) {
        codes.add(key);
      }
    }
  }

  const list = Array.from(codes).map((c) => getCurrencyMeta(c));

  return list.sort((a, b) => {
    const idxA = POPULAR_ORDER.indexOf(a.code);
    const idxB = POPULAR_ORDER.indexOf(b.code);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.country.localeCompare(b.country) || a.code.localeCompare(b.code);
  });
}
