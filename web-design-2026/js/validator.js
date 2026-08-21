export function checkMatch(selection, foundKeywords, activeKeywords = []) {
  const forward = selection.map((c) => c.letter).join('');

  for (const word of activeKeywords) {
    if (foundKeywords.includes(word)) continue;
    if (word === forward) {
      return word;
    }
  }
  return null;
}