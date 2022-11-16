import cors from "cors";
import path, { dirname } from "path";
import sirv from "sirv";
import fs from "fs-extra";
import connect from "connect";
import colors from "picocolors";
import prettyBytes from "pretty-bytes";
import { createServer as createViteServer } from "vite";

import kvCache from "./kv-cache.js";
import bundleSize from "./bundle-size.js";
import { ResolvedConfig } from "./config.js";
import { createServer, ServerResponse } from "http";
import { sendJson, useUrl } from "./utils.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class DevServer {
  middlewares: connect.Server;
  eventMessageId = Date.now();
  eventMessages: { id: number; data: any }[] = [];
  eventResponses: ServerResponse[] = [];
  constructor(private config: ResolvedConfig) {
    this.middlewares = connect();
  }

  async run() {
    this.middlewares.use(cors());

    this.middlewares.use("/api/events", (req, res) => {
      const url = useUrl(req);
      const msgId = parseInt(url.searchParams.get("id") + "");

      if (msgId) {
        const msgIndex = this.eventMessages.findIndex(
          (item) => item.id === msgId
        );

        const nextMsg = this.eventMessages[msgIndex + 1];
        if (nextMsg) {
          sendJson(res, nextMsg);
          return;
        }
      }

      this.eventResponses.push(res);

      res.on("close", () => {
        if (!this.eventResponses.length) return;
        const idx = this.eventResponses.indexOf(res);
        if (idx >= 0) this.eventResponses.splice(idx, 1);
      });
    });

    this.middlewares.use("/api/size", async (req, res) => {
      const { sizeJs, sizeCss } = await bundleSize(this.config.pkgOutputPath);

      sendJson(res, {
        sizeJs: prettyBytes(sizeJs),
        sizeCss: prettyBytes(sizeCss),
      });
    });

    this.middlewares.use("/api/hfz/template", (req, res) => {
      const url = useUrl(req);
      const id = url.searchParams.get("id");
      const code = kvCache.get("HFZ_TEMPLATE_" + id);

      sendJson(res, {
        name: this.config.hfcName,
        version: this.config.version,
        code,
      });
    });

    this.middlewares.use(
      `/hfm/`,
      sirv(this.config.hfmOutputPath, {
        dev: true,
        etag: true,
      })
    );

    this.middlewares.use(
      "/doc/",
      sirv(this.config.docOutputPath, {
        dev: true,
        etag: true,
      })
    );

    let previewJsPath = "/preview.js";
    this.middlewares.use("/preview/", (req, res) => {
      res.setHeader("Content-Type", "text/html");
      res.end(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title></title>
          </head>
          <body>
            <div id="app"></div>
            <script type="module" src="${previewJsPath}"></script>
          </body>
        </html>
      `);
    });

    const clientDist = path.resolve(__dirname, "..", "dist", "client");
    if (fs.existsSync(clientDist)) {
      this.middlewares.use(sirv(clientDist, { dev: true, etag: true }));
    } else {
      const clientSrc = path.resolve(__dirname, "..", "client");

      const vite = await createViteServer({
        server: { middlewareMode: true },
        root: clientSrc,
      });

      this.middlewares.use(vite.middlewares);
      previewJsPath = "/src/preview.ts";
    }
  }
  sendMessage(msg: any) {
    const id = this.eventMessageId++;
    const event = { id, data: msg };
    this.eventMessages.push(event);
    if (this.eventMessages.length > 100) this.eventMessages.shift();
    const eventResponses = this.eventResponses.slice();
    this.eventResponses = [];

    eventResponses.forEach((res) => {
      sendJson(res, event);
    });
  }
  async listen() {
    if (this.config.command === "build") return;

    const httpServer = createServer(this.middlewares);
    let port = this.config.port!;
    const onError = (e: Error & { code?: string }) => {
      if (e.code === "EADDRINUSE") {
        console.log(`Port ${port} is in use, trying another one...`);
        httpServer.listen(++port);
      } else {
        httpServer.removeListener("error", onError);
        throw e;
      }
    };

    httpServer.on("error", onError);

    httpServer.listen(port, () => {
      console.log();
      console.log(
        `${colors.green("➜")} ${colors.cyan(`http://localhost:${port}`)}`
      );
    });
  }
}
