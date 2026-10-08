import { Router } from "express";
import { rooms, findRoom, bookingsForRoom } from "../store.js";
import { overlaps } from "../lib/overlap.js";
import { freeSlots } from "../lib/availability.js";
import { requireDate } from "../lib/validate.js";

export const roomsRouter = Router();

roomsRouter.get("/", (_req, res) => {
  res.json({ rooms });
});

roomsRouter.get("/:id/availability", (req, res) => {
  const room = findRoom(req.params.id);
  if (!room) {
    res.status(404).json({ error: "salle inconnue" });
    return;
  }
  const date = requireDate({ date: req.query.date }, "date");
  if (!date.ok) {
    res.status(400).json({ error: date.error });
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date.value)) {
    res.status(400).json({ error: "date invalide : date" });
    return;
  }
  const dayStart = `${date.value}T00:00:00Z`;
  const dayEnd = new Date(Date.parse(dayStart) + 24 * 60 * 60 * 1000).toISOString();
  const openStart = `${date.value}T08:00:00Z`;
  const openEnd = `${date.value}T20:00:00Z`;
  const busy = bookingsForRoom(room.id)
    .filter((b) => overlaps(b.startsAt, b.endsAt, dayStart, dayEnd))
    .map((b) => ({ startsAt: b.startsAt, endsAt: b.endsAt }));
  res.json({ roomId: room.id, date: date.value, busy, free: freeSlots(busy, openStart, openEnd) });
});

roomsRouter.get("/:id", (req, res) => {
  const room = findRoom(req.params.id);
  if (!room) {
    res.status(404).json({ error: "salle inconnue" });
    return;
  }
  res.json({ room, bookings: bookingsForRoom(room.id) });
});
