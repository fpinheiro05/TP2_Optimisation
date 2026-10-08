/** Résultat d'une opération qui peut échouer, sans exception. */
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

/** Exige une chaîne non vide dans le payload. */
export function requireString(payload: Record<string, unknown>, field: string): Result<string> {
  const value = payload[field];
  if (typeof value !== "string" || value.trim() === "") {
    return { ok: false, error: `champ manquant ou vide : ${field}` };
  }
  return { ok: true, value };
}

/** Exige une date ISO valide dans le payload. */
export function requireDate(payload: Record<string, unknown>, field: string): Result<string> {
  const str = requireString(payload, field);
  if (!str.ok) {
    return str;
  }
  if (Number.isNaN(Date.parse(str.value))) {
    return { ok: false, error: `date invalide : ${field}` };
  }
  return { ok: true, value: str.value };
}

/** Exige un entier strictement positif dans le payload. */
export function requirePositiveInt(payload: Record<string, unknown>, field: string): Result<number> {
  const value = payload[field];
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return { ok: false, error: `entier positif attendu : ${field}` };
  }
  return { ok: true, value };
}
