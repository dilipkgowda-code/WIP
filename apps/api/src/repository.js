const initialRecords = [
  { id: "record-1", workspaceId: "workspace-acme", teamId: "team-platform", name: "Platform migration", status: "needs-review", updatedAt: "2026-09-24T00:00:00.000Z" },
  { id: "record-2", workspaceId: "workspace-acme", teamId: "team-platform", name: "Incident readiness", status: "on-track", updatedAt: "2026-09-24T00:00:00.000Z" }
];

export function createRepository() {
  const records = structuredClone(initialRecords);
  const auditEvents = [];
  return {
    listRecords(workspaceId, teamId) {
      return records.filter((record) => record.workspaceId === workspaceId && (!teamId || record.teamId === teamId))
        .map(({ workspaceId: _workspaceId, ...publicRecord }) => publicRecord);
    },
    updateRecord(workspaceId, recordId, status) {
      const record = records.find((candidate) => candidate.workspaceId === workspaceId && candidate.id === recordId);
      if (!record) return null;
      record.status = status;
      record.updatedAt = new Date().toISOString();
      return { ...record };
    },
    addAuditEvent(event) { auditEvents.push({ ...event, createdAt: new Date().toISOString() }); },
    getAuditEvents() { return [...auditEvents]; }
  };
}
