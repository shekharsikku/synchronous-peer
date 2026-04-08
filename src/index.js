import { createServer } from "node:http";
import { ExpressPeerServer } from "peer";
import env from "./utils/env.js";
import app from "./app.js";

const server = createServer(app);
const port = env.PORT;

const peerServer = ExpressPeerServer(server, {
  corsOptions: {
    origin: env.CORS_ORIGIN,
    credentials: true,
  },
});

peerServer.on("connection", (client) => {
  console.log("✅ Peer connected:", client.getId());
});

peerServer.on("disconnect", (client) => {
  console.log("❌ Peer disconnected:", client.getId());
});

app.use("/synchronous", peerServer);

(async () => {
  try {
    server.listen(port, () => {
      console.log(`Server running on port: ${port}\n`);
    });
  } catch (error) {
    console.error(`Error: ${error.message}\n`);
    process.exit(1);
  }
})();
