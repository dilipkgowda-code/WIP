import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createRequestHandler } from "../src/server.js";
import { createRepository } from "../src/repository.js";

async function withServer(callback) {
  const server = createServer(createRequestHandler(createRepository()));
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  try { await callback(`http://localhost:${port}`); }
  finally { await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }
}

test("rejects unauthenticated API requests", async () => {
  await withServer(async (baseUrl) => assert.equal((await fetch(`${baseUrl}/api/workforce-records`)).status, 401));
});

test("lists workspace records without exposing workspace identifiers", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/workforce-records`, { headers: { authorization: "Bearer demo-manager-token" } });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.records.length, 2);
    assert.equal(body.records.every((record) => record.workspaceId === undefined), true);
  });
});

test("allows managers to update a record", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/workforce-records/record-1`, {
      method: "PATCH",
      headers: { authorization: "Bearer demo-manager-token", "content-type": "application/json" },
      body: JSON.stringify({ status: "blocked" })
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).record.status, "blocked");
  });
});

test("prevents members from updating records", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/workforce-records/record-1`, {
      method: "PATCH",
      headers: { authorization: "Bearer demo-member-token", "content-type": "application/json" },
      body: JSON.stringify({ status: "blocked" })
    });
    assert.equal(response.status, 403);
  });
});
