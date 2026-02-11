export async function onRequestPost({ request, env }) {
  try {
    // ambil body dari frontend
    const body = await request.json().catch(() => ({}));

    // kirim ke Worker backend kamu
    const upstream = await fetch(env.CHAT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.CHAT_API_TOKEN
          ? { Authorization: `Bearer ${env.CHAT_API_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(body),
    });

    // ambil raw text agar tidak error kalau upstream balas non-JSON (HTML error page, dll)
    const raw = await upstream.text();

    // pastikan response ke browser selalu JSON
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = {
        error: "Upstream returned non-JSON",
        status: upstream.status,
        raw: raw.slice(0, 300),
      };
    }

    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

// Preflight (optional, tapi aman)
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
