import { describe, it, expect } from "vitest";
import { createApp } from "../src/app.js";

async function call(path: string, init?: RequestInit) {
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address() as { port: number };
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, init);
    return { status: res.status, body: (await res.json()) as Record<string, unknown> };
  } finally {
    server.close();
  }
}

describe("GET /rooms/:id/availability", () => {
  it("retourne toute la journee libre quand la salle n'a rien de prevu", async () => {
    const res = await call("/rooms/labo/availability?date=2026-10-05");
    expect(res.status).toBe(200);
    expect(res.body.roomId).toBe("labo");
    expect(res.body.date).toBe("2026-10-05");
    expect(res.body.busy).toEqual([]);
    expect(res.body.free).toEqual([
      { startsAt: "2026-10-05T08:00:00Z", endsAt: "2026-10-05T20:00:00Z" }
    ]);
  });

  it("decoupe la journee autour d'une reservation", async () => {
    const res = await call("/rooms/salle-a/availability?date=2026-10-05");
    expect(res.status).toBe(200);
    expect(res.body.busy).toEqual([
      { startsAt: "2026-10-05T09:00:00Z", endsAt: "2026-10-05T11:00:00Z" }
    ]);
    expect(res.body.free).toEqual([
      { startsAt: "2026-10-05T08:00:00Z", endsAt: "2026-10-05T09:00:00Z" },
      { startsAt: "2026-10-05T11:00:00Z", endsAt: "2026-10-05T20:00:00Z" }
    ]);
  });

  it("inclut dans busy une reservation hors 08:00-20:00 le meme jour", async () => {
    const created = await call("/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        roomId: "salle-b",
        who: "equipe-nuit",
        people: 2,
        startsAt: "2026-10-05T06:00:00Z",
        endsAt: "2026-10-05T07:00:00Z"
      })
    });
    expect(created.status).toBe(201);

    const res = await call("/rooms/salle-b/availability?date=2026-10-05");
    expect(res.status).toBe(200);
    expect(res.body.busy).toEqual([
      { startsAt: "2026-10-05T06:00:00Z", endsAt: "2026-10-05T07:00:00Z" }
    ]);
    expect(res.body.free).toEqual([
      { startsAt: "2026-10-05T08:00:00Z", endsAt: "2026-10-05T20:00:00Z" }
    ]);
  });

  it("ignore les reservations d'un autre jour", async () => {
    const res = await call("/rooms/salle-a/availability?date=2026-10-06");
    expect(res.status).toBe(200);
    expect(res.body.busy).toEqual([]);
    expect(res.body.free).toHaveLength(1);
  });

  it("renvoie 404 pour une salle inconnue", async () => {
    const res = await call("/rooms/cave/availability?date=2026-10-05");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("salle inconnue");
  });

  it("renvoie 400 pour une date invalide", async () => {
    const res = await call("/rooms/salle-a/availability?date=pas-une-date");
    expect(res.status).toBe(400);
  });

  it("renvoie 400 quand la date est absente", async () => {
    const res = await call("/rooms/salle-a/availability");
    expect(res.status).toBe(400);
  });
});
