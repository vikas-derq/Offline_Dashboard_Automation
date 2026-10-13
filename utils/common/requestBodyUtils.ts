import * as constants from '../../constants';

export function parseDataTableValue(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === 'null') return null;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  try { return JSON.parse(trimmed); } catch { return trimmed; }
}

export function parseDataTableToRequestBody(data: Record<string, string> | string[][]): Record<string, unknown> {
  const entries = Array.isArray(data) ? data : Object.entries(data);
  return Object.fromEntries(entries.map(([key, value]) => [key, replacePlaceholders(parseDataTableValue(value))]));
}

function replacePlaceholders(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value.replace(/<([A-Z0-9_]+)>/g, (_, name: keyof typeof constants) => String(constants[name] ?? `<${name}>`));
}
