export async function onRequestPost(context) {
  const { request, env } = context;

  const body = await request.json().catch(() => ({}));
  const message = body.message || "";
  if (!message) {
    return new Response(JSON.stringify({ error: "Missing message" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Call your Worker (keep BOT_TOKEN hidden on server-side)
  const r = await fetch(env.WORKER_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.BOT_TOKEN}`,
    },
    body: JSON.stringify({ message }),
  });

  const data = await r.json().catch(() => ({}));

  return new Response(JSON.stringify(data), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
