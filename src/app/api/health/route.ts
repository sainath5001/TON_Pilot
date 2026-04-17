export function GET() {
  return Response.json({
    ok: true,
    name: "ton-pilot",
    ts: new Date().toISOString()
  });
}

