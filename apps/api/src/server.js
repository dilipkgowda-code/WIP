import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import { URL } from "node:url";
import { authenticate, canUpdateRecords } from "./auth.js";
import { createRepository } from "./repository.js";

const allowedStatuses = new Set(["needs-review", "on-track", "blocked"]);
const repository = createRepository();
const port = Number(process.env.PORT ?? 3000);

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 10_000) reject(new Error("Request body is too large"));
    });
    request.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error("Request body must be valid JSON")); }
    });
    request.on("error", reject);
  });
}

export function createRequestHandler(store = repository) {
  return async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);
    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, { status: "ok" });
      return;
    }
    const identity = authenticate(request);
    if (!identity) {
      sendJson(response, 401, { error: "Authentication required" });
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/workforce-records") {
      sendJson(response, 200, { records: store.listRecords(identity.workspaceId, url.searchParams.get("teamId")) });
      return;
    }
    const updateMatch = url.pathname.match(/^\/api\/workforce-records\/([^/]+)$/);
    if (request.method === "PATCH" && updateMatch) {
      if (!canUpdateRecords(identity)) {
        sendJson(response, 403, { error: "Manager role required" });
        return;
      }
      let body;
      try { body = await readJson(request); } catch (error) {
        sendJson(response, 400, { error: error.message });
        return;
      }
      if (!allowedStatuses.has(body.status)) {
        sendJson(response, 400, { error: "status must be needs-review, on-track, or blocked" });
        return;
      }
      const record = store.updateRecord(identity.workspaceId, updateMatch[1], body.status);
      if (!record) {
        sendJson(response, 404, { error: "Workforce record not found" });
        return;
      }
      store.addAuditEvent({ action: "workforce-record.status-updated", actorId: identity.userId, workspaceId: identity.workspaceId, resourceId: record.id });
      sendJson(response, 200, { record });
      return;
    }
    sendJson(response, 404, { error: "Not found" });
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createServer(createRequestHandler()).listen(port, () => console.log(`Workforce API listening on http://localhost:${port}`));
}
