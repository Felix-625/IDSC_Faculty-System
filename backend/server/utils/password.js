const crypto = require("crypto");

// No look-alike characters (0/O, 1/l/I) so temporary passwords are easy to type.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function generateTempPassword(length = 12) {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return out;
}

const MIN_PASSWORD_LENGTH = 8;

module.exports = { generateTempPassword, MIN_PASSWORD_LENGTH };
