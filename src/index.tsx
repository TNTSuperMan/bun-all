import { color, file, randomUUIDv7, serve } from "bun";
import index from "./index.html";
import { limit } from "./limit";
import { ExpiringMap } from "./expiring_map";

const yellow = color("#FFFF00", "ansi");

const challenges = new ExpiringMap<string, string>();
setTimeout(() => challenges.sweep(), 10000);

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/server_auth/challange": {
      async POST(req) {
        await limit();
        const challenge_id = randomUUIDv7("hex");
        const id = crypto.getRandomValues(new Uint8Array(3)).toHex();
        challenges.set(challenge_id, id, 60000);
        
        console.log(`[AUTH] Code: ${yellow}${id}\x1b[0m | Challenge: ${challenge_id}`);
        
        return Response.json(challenge_id);
      },
    },
    "/server_auth/verify/:challenge_id": {
      async POST(req) {
        await limit();
        const { challenge_id } = req.params;
        const input_code = (await req.text()).toLowerCase();

        if(!challenges.has(challenge_id)) {
          return Response.json({
            error: "Invalid or expired challange"
          }, { status: 404, statusText: "Not Found" });
        } else {
          const [code] = challenges.get(challenge_id)!;
          challenges.delete(challenge_id);
          if(input_code !== code) {
            return Response.json({
              error: "Code incorrect"
            }, { status: 401, statusText: "Unauthorized" });
          } else {
            // TODO: create session
            return Response.json({});
          }
        }
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },

  tls: {
    cert: file("secret/server.crt"),
    key: file("secret/server.key"),
  },
});

console.log(`🚀 Server running at ${server.url}`);
