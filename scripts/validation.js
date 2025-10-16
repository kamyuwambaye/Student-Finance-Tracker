// Input validation and helper patterns

export const patterns = {
  noEdgeSpaces: /^(?!\s)(?:.*\S)?$/,
  amount: /^(?:\d+|\d+\.\d{1,2})$/,
  date: /^(?:20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
  noDuplicateWord: /\b(\w+)\s+\1\b/i,
};

export function validateRecord(rec) {
  const errs = [];
  if (!patterns.noEdgeSpaces.test(rec.description))
    errs.push('Description cannot start or end with space.');
  if (patterns.noDuplicateWord.test(rec.description))
    errs.push('Duplicate word in description.');
  if (!patterns.amount.test(String(rec.amount)))
    errs.push('Amount must be a number (e.g., 12.50).');
  if (!patterns.category.test(rec.category))
    errs.push('Category must contain only letters/spaces.');
  if (!patterns.date.test(rec.date))
    errs.push('Date must be YYYY-MM-DD.');
  return errs;
}
