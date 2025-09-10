import request from "supertest";
import app from "../../app";
import { getAdminToken, withAuth } from "../auth/token";

describe("PUT /api/device-types/:id", () => {
  let token: string;

  beforeEach(async () => {
    token = await getAdminToken();
  });

  it("✅ actualiza nombre y código", async () => {
    const created = await withAuth(request(app).post("/api/device-types"), token)
      .send({ name: "Base", code: "BAS" });

    const res = await withAuth(
      request(app).put(`/api/device-types/${created.body.device_type_id}`),
      token
    ).send({ name: "Base Mod", code: "xyz" });

    expect(res.status).toBe(200);
    expect(res.body.type_name).toBe("Base Mod");
    expect(res.body.type_code).toBe("XYZ");
  });

  it("❌ 409 si actualiza a nombre duplicado", async () => {
    const a = await withAuth(request(app).post("/api/device-types"), token)
      .send({ name: "Uno", code: "UNO" });
    await withAuth(request(app).post("/api/device-types"), token)
      .send({ name: "Dos", code: "DOS" });

    const res = await withAuth(
      request(app).put(`/api/device-types/${a.body.device_type_id}`),
      token
    ).send({ name: "Dos" });

    expect(res.status).toBe(409);
  });

  it("❌ 409 si actualiza a código duplicado", async () => {
    const a = await withAuth(request(app).post("/api/device-types"), token)
      .send({ name: "A", code: "AAA" });
    await withAuth(request(app).post("/api/device-types"), token)
      .send({ name: "B", code: "BBB" });

    const res = await withAuth(
      request(app).put(`/api/device-types/${a.body.device_type_id}`),
      token
    ).send({ code: "BBB" });

    expect(res.status).toBe(409);
  });

  it("✅ permite limpiar el código (null)", async () => {
    const created = await withAuth(request(app).post("/api/device-types"), token)
      .send({ name: "Temporal", code: "TMP" });

    const res = await withAuth(
      request(app).put(`/api/device-types/${created.body.device_type_id}`),
      token
    ).send({ code: null });

    expect(res.status).toBe(200);
    expect(res.body.type_code).toBeNull();
  });

  it("❌ 400 si code inválido", async () => {
    const created = await withAuth(request(app).post("/api/device-types"), token)
      .send({ name: "X", code: "ABC" });

    const res = await withAuth(
      request(app).put(`/api/device-types/${created.body.device_type_id}`),
      token
    ).send({ code: "AB" });

    expect(res.status).toBe(400);
  });
});
