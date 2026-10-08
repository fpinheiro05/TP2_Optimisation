import { overlaps } from "./overlap.js";

export interface Slot {
  startsAt: string;
  endsAt: string;
}

/** Retire les plages occupees d'une journee et renvoie les creneaux libres restants. */
export function freeSlots(busy: Slot[], dayStart: string, dayEnd: string): Slot[] {
  const occupied = busy
    .filter((slot) => overlaps(slot.startsAt, slot.endsAt, dayStart, dayEnd))
    .map((slot) => ({
      startsAt: Date.parse(slot.startsAt) < Date.parse(dayStart) ? dayStart : slot.startsAt,
      endsAt: Date.parse(slot.endsAt) > Date.parse(dayEnd) ? dayEnd : slot.endsAt
    }))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

  const free: Slot[] = [];
  let cursor = dayStart;
  for (const slot of occupied) {
    if (Date.parse(slot.startsAt) > Date.parse(cursor)) {
      free.push({ startsAt: cursor, endsAt: slot.startsAt });
    }
    if (Date.parse(slot.endsAt) > Date.parse(cursor)) {
      cursor = slot.endsAt;
    }
  }
  if (Date.parse(cursor) < Date.parse(dayEnd)) {
    free.push({ startsAt: cursor, endsAt: dayEnd });
  }
  return free;
}
