export const config = { runtime: "edge" };

export default async function handler(request) {
  if (request.method === "POST") {
    try {
      const body = await request.json();
      return new Response(JSON.stringify({ ok: true, received: body }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: e.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  return new Response(JSON.stringify({ ok: true, method: request.method }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
