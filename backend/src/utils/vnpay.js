const crypto = require("crypto");

function sortObject(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}

function createSecureHash(params, secretKey) {
  const signData = new URLSearchParams(params).toString();
  return crypto
    .createHmac("sha512", secretKey)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
}

module.exports = { sortObject, createSecureHash };
