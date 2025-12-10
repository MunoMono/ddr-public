export function parseVariables(variables) {
  try {
    if (!variables) return {};
    if (typeof variables === 'object') return variables;
    return JSON.parse(variables);
  } catch (e) {
    return null; // invalid JSON
  }
}

export function formatShort(query) {
  if (!query) return '';
  return query.replace(/\s+/g, ' ').trim().slice(0, 64) + (query.length > 64 ? '…' : '');
}
