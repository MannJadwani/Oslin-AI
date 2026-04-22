#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env.local}"

node - "$ENV_FILE" <<'NODE'
const fs = require("fs");
const envFile = process.argv[2];
(async () => {
  const { generateKeyPair, exportPKCS8, exportJWK } = await import("jose");
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const jwtPrivateKey = (await exportPKCS8(privateKey)).trimEnd().replace(/\n/g, " ");
  const jwks = JSON.stringify({ keys: [{ use: "sig", ...(await exportJWK(publicKey)) }] });

  let text = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : "";
  const upsert = (src, key, value) => {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(src)) return src.replace(re, line);
    if (src.length > 0 && !src.endsWith("\n")) src += "\n";
    return src + line + "\n";
  };

  text = upsert(text, "JWT_PRIVATE_KEY", jwtPrivateKey);
  text = upsert(text, "JWKS", jwks);
  fs.writeFileSync(envFile, text);
})();
NODE

JWT_PRIVATE_KEY="$(sed -n 's/^JWT_PRIVATE_KEY=//p' "$ENV_FILE" | head -n1)"
JWKS="$(sed -n 's/^JWKS=//p' "$ENV_FILE" | head -n1)"
CONVEX_DEPLOYMENT="$(sed -n 's/^CONVEX_DEPLOYMENT=//p' "$ENV_FILE" | head -n1 | sed 's/#.*$//' | xargs || true)"

if [[ -n "${CONVEX_DEPLOYMENT}" ]]; then
  export CONVEX_DEPLOYMENT
fi

npx convex env set -- JWT_PRIVATE_KEY "$JWT_PRIVATE_KEY"
npx convex env set -- JWKS "$JWKS"

echo "Done."
