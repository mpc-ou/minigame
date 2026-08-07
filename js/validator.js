// validator.js - So khop chuoi da chon voi danh sach tu khoa
import { KEYWORDS } from './config.js';

// selection: [{row, col, letter}]
// Tra ve tu khoa khop (hoac null), ho tro doc ca xuoi va nguoc
export function checkMatch(selection, foundKeywords) {
  const forward = selection.map((c) => c.letter).join('');
  const backward = [...forward].reverse().join('');

  for (const word of KEYWORDS) {
    if (foundKeywords.includes(word)) continue;
    if (word === forward || word === backward) {
      return word;
    }
  }
  return null;
}