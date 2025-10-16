// Search & highlight helpers

export function compileRegex(input, flags = 'i') {
  try {
    return input ? new RegExp(input, flags) : null;
  } catch {
    return null;
  }
}

export function highlight(text, re) {
  if (!re) return text;
  return text.replace(re, (m) => `<mark>${m}</mark>`);
}

export function makeFilter(input, caseInsensitive = true) {
  const flags = caseInsensitive ? 'i' : '';
  const re = compileRegex(input, flags);
  return (rec) => !re || re.test(rec.description) || re.test(rec.category);
}
