import request, { Test as SupertestReq } from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app";
import { UserRole } from "../../enums/userRole.enum";

const TEST_SECRET = process.env.JWT_SECRET || "test-secret";

let cachedAdmin: { token: string; user_id: string } | null = null;

function signToken(payload: {
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
}) {
  return jwt.sign(payload, TEST_SECRET, { algorithm: "HS256" });
}

async function createUserForRole(role: UserRole) {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const first_name = role === UserRole.Administrador ? "Admin" : "User";
  const last_name = "Test";
  const email = `${first_name.toLowerCase()}.${unique}@example.com`;

  const res = await request(app).post("/api/users").send({
    first_name,
    last_name,
    email,
    password: "secreto123",
  });

  const user_id = res.body.user_id as string;
  const name = `${first_name} ${last_name}`;
  const token = signToken({ user_id, email, name, role });

  return { token, user_id };
}

export async function getAdminToken(reuse: boolean = true) {
  if (reuse && cachedAdmin) return cachedAdmin.token;
  const { token, user_id } = await createUserForRole(UserRole.Administrador);
  if (reuse) cachedAdmin = { token, user_id };
  return token;
}

export async function getToken(role: UserRole = UserRole.Estandar) {
  const { token } = await createUserForRole(role);
  return token;
}

export function withAuth<T extends SupertestReq>(req: T, token: string) {
  return req.set("Authorization", `Bearer ${token}`);
}

export function clearCachedTokens() {
  cachedAdmin = null;
}
