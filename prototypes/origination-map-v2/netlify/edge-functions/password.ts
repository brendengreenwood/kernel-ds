// Password-only gate for the whole site. The password lives in the Netlify
// SITE_PASSWORD env var, never in the repo. Fails closed if it is unset.
// A correct password sets an HttpOnly cookie holding a hash of it, so changing
// the env var signs everyone out.
declare const Netlify: { env: { get(key: string): string | undefined } };

const COOKIE = "om_gate";

async function hash(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`om:${value}`));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

function page(wrong: boolean) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Origination map</title><style>
:root{color-scheme:light dark;font-family:"Segoe UI",system-ui,sans-serif}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f6f2e9;color:#1c2722}
@media (prefers-color-scheme:dark){body{background:#151c19;color:#eef1ef}form{background:#232b28!important;border-color:#3a4440!important}input{background:#151c19!important;color:inherit;border-color:#4b5550!important}}
form{display:grid;gap:12px;width:min(320px,calc(100vw - 32px));padding:24px;background:#fff;border:1px solid #ddd6c6;border-radius:8px;box-shadow:0 4px 16px rgb(40 30 15/.1)}
h1{margin:0;font-size:16px;font-weight:600}
label{font-size:13px}
input{height:40px;padding:0 12px;font:inherit;border:1px solid #c9c1ae;border-radius:4px}
button{height:40px;font:inherit;font-weight:600;color:#fff;background:#1f7a45;border:0;border-radius:4px;cursor:pointer}
p{margin:0;font-size:13px;color:#b42318}
</style></head><body><form method="post">
<h1>Origination map</h1>
<label for="pw">Password</label>
<input id="pw" name="password" type="password" autocomplete="current-password" autofocus required${wrong ? ' aria-invalid="true" aria-describedby="err"' : ""}>
${wrong ? '<p id="err" role="alert">That password is not right. Try again.</p>' : ""}
<button type="submit">Open map</button>
</form></body></html>`;
}

const html = (body: string, status: number) =>
  new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const password = Netlify.env.get("SITE_PASSWORD");
  if (!password) return html(page(false), 401);
  const token = await hash(password);

  const cookie = request.headers.get("cookie") ?? "";
  if (cookie.split(/;\s*/).includes(`${COOKIE}=${token}`)) return context.next();

  if (request.method === "POST") {
    const form = await request.formData();
    if (form.get("password") === password) {
      return new Response(null, {
        status: 303,
        headers: {
          location: new URL(request.url).pathname,
          "set-cookie": `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`,
        },
      });
    }
    return html(page(true), 401);
  }
  return html(page(false), 401);
};

export const config = { path: "/*" };
