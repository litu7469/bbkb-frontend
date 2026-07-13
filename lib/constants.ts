// Core regulatory bodies that back the search/query APIs.
export const ISSUING_BODIES = ['BB', 'NBR', 'BSEC', 'BFIU'];

// Full set of bodies shown in the document library browser.
export const ALL_ISSUING_BODIES = [
  ...ISSUING_BODIES, 'Ministry of Law', 'International',
];

// Bangladesh Bank departments used across search + document filters.
export const BB_DEPARTMENTS = [
  'BRPD', 'DOS', 'DFIM', 'FEPD', 'BFIU', 'PSD', 'MPD', 'SME',
  'SDAD', 'DMD', 'SPCD', 'SFD', 'FEOD', 'FEID', 'ACD', 'CIB',
  'FICSD', 'ISMD', 'FSD', 'FININCLD', 'GBCSRD',
];
