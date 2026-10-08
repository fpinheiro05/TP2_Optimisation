import type { Room } from "../store.js";

const WEEKEND_SURCHARGE = 20;

/** Dit si une date ISO est un samedi ou un dimanche. */
export function isWeekend(startsAt: string): boolean {
  const day = new Date(startsAt).getUTCDay();
  return day === 0 || day === 6;
}

/** Calcule les heures entre deux bornes ISO. */
export function hoursBetween(startsAt: string, endsAt: string): number {
  return (Date.parse(endsAt) - Date.parse(startsAt)) / 3600000;
}

/** Calcule le prix d'une reservation, majoration week-end incluse. */
export function priceFor(room: Room, startsAt: string, endsAt: string): number {
  const base = room.hourlyRate * hoursBetween(startsAt, endsAt);
  if (isWeekend(startsAt)) {
    return base + WEEKEND_SURCHARGE;
  }
  return base;
}
