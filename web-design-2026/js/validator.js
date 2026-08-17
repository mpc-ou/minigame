// validator.js - So khop chuoi da chon voi danh sach tu khoa
import { KEYWORDS } from './config.js';

// selection: [{row, col, letter}]
// Tra ve tu khoa khop (hoac null) - chi so khop doc xuoi (dung 1 chieu duy
// nhat, khong con ho tro doc nguoc)
export function checkMatch(selection, foundKeywords) {
  const forward = selection.map((c) => c.letter).join('');

  for (const word of KEYWORDS) {
    if (foundKeywords.includes(word)) continue;
    if (word === forward) {
      return word;
    }
  }
  return null;
}