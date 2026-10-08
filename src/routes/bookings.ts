import { Router } from "express";
import { bookings, findRoom, nextBookingId, bookingsForRoom } from "../store.js";
import { overlaps } from "../lib/overlap.js";
import { priceFor } from "../lib/price.js";
import { requireString, requireDate, requirePositiveInt } from "../lib/validate.js";

export const bookingsRouter = Router();

bookingsRouter.get("/", (req, res) => {
  const roomId = req.query.roomId;
  if (typeof roomId === "string") {
    res.json({ bookings: bookingsForRoom(roomId) });
    return;
  }
  res.json({ bookings });
});

bookingsRouter.post("/", (req, res) => {
  const payload = req.body ?? {};
  const roomId = requireString(payload, "roomId");
  if (!roomId.ok) {
    res.status(400).json({ error: roomId.error });
    return;
  }
  const who = requireString(payload, "who");
  if (!who.ok) {
    res.status(400).json({ error: who.error });
    return;
  }
  const people = requirePositiveInt(payload, "people");
  if (!people.ok) {
    res.status(400).json({ error: people.error });
    return;
  }
  const startsAt = requireDate(payload, "startsAt");
  if (!startsAt.ok) {
    res.status(400).json({ error: startsAt.error });
    return;
  }
  const endsAt = requireDate(payload, "endsAt");
  if (!endsAt.ok) {
    res.status(400).json({ error: endsAt.error });
    return;
  }

  if (Date.parse(endsAt.value) <= Date.parse(startsAt.value)) {
    res.status(400).json({ error: "endsAt doit etre posterieur a startsAt" });
    return;
  }

  const room = findRoom(roomId.value);
  if (!room) {
    res.status(400).json({ error: `salle inconnue : ${roomId.value}` });
    return;
  }
  if (people.value > room.capacity) {
    res.status(400).json({ error: `capacite depassee : ${people.value} > ${room.capacity}` });
    return;
  }

  const clash = bookingsForRoom(roomId.value).find((b) =>
    overlaps(startsAt.value, endsAt.value, b.startsAt, b.endsAt)
  );
  if (clash) {
    res.status(409).json({ error: "creneau deja reserve", conflictsWith: clash.id });
    return;
  }

  const booking = {
    id: nextBookingId(),
    roomId: roomId.value,
    who: who.value,
    people: people.value,
    startsAt: startsAt.value,
    endsAt: endsAt.value,
    price: priceFor(room, startsAt.value, endsAt.value)
  };
  bookings.push(booking);
  res.status(201).json({ booking });
});

bookingsRouter.delete("/:id", (req, res) => {
  const index = bookings.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "reservation inconnue" });
    return;
  }
  const [removed] = bookings.splice(index, 1);
  res.json({ cancelled: removed.id });
});
