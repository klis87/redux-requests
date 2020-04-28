export const gql = (strings, ...values) =>
  strings
    .map((string, i) => string + (values[i] || ''))
    .join('')
    .trim();
