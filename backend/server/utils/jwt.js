const crypto = require("crypto");

const SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";
if (!process.env.JWT_SECRET) {
  console.warn("[auth] JWT_SECRET is not set. Using an insecure development secret.");
}

const b64 = obj => Buffer.from(JSON.stringify(obj)).toString("base64url");
const sign = data => crypto.createHmac("sha256", SECRET).update(data).digest("base64url");

function signToken(payload, expiresInSeconds = 3600) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64({ alg: "HS256", typ: "JWT" });
  const body = b64({ ...payload, iat: now, exp: now + expiresInSeconds });
  return `${header}.${body}.${sign(`${header}.${body}`)}`;
}

function verifyToken(token) {
  const parts = typeof token === "string" ? token.split(".") : [];
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expected = Buffer.from(sign(`${header}.${body}`));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;

  try {
    if (JSON.parse(Buffer.from(header, "base64url")).alg !== "HS256") return null;
    const payload = JSON.parse(Buffer.from(body, "base64url"));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

module.exports = { signToken, verifyToken, EXPIRES_IN: 3600 };