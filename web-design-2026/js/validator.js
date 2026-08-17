import { KEYWORDS } from './config.js';

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