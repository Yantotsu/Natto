const APP_NAME = "NATTO MUSIC API";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "GET") {
      return Response.json(
        { success: false, error: "Method not allowed" },
        { status: 405, headers }
      );
    }

    if (path === "/" || path === "/api") {
      return Response.json({
        success: true,
        name: APP_NAME,
        version: "1.0.0",
        endpoints: ["/api/health", "/api/music/search?q=night"],
      }, { headers });
    }

    if (path === "/api/health") {
      return Response.json({
        success: true,
        message: "NATTO MUSIC API is online!",
      }, { headers });
    }

    if (path === "/api/music/search") {
      const query = url.searchParams.get("q")?.trim();

      if (!query) {
        return Response.json({
          success: false,
          error: "Masukkan kata pencarian melalui parameter q",
        }, { status: 400, headers });
      }

      try {
        const upstream = new URL("https://api.audius.co/v1/tracks/search");
        upstream.searchParams.set("query", query);
        upstream.searchParams.set("app_name", "natto_music");

        const response = await fetch(upstream.toString());

        if (!response.ok) {
          return Response.json({
            success: false,
            error: "Penyedia musik sedang tidak tersedia",
          }, { status: 502, headers });
        }

        const result = await response.json();

        return Response.json({
          success: true,
          query,
          data: result.data ?? [],
        }, { headers });
      } catch {
        return Response.json({
          success: false,
          error: "Gagal menghubungi penyedia musik",
        }, { status: 502, headers });
      }
    }

    return Response.json({
      success: false,
      error: "Endpoint tidak ditemukan",
    }, { status: 404, headers });
  },
};
            
