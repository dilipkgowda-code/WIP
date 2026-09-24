const developmentIdentities = new Map([
  ["demo-manager-token", { userId: "user-manager", workspaceId: "workspace-acme", role: "manager" }],
  ["demo-member-token", { userId: "user-member", workspaceId: "workspace-acme", role: "member" }]
]);

export function authenticate(request) {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return developmentIdentities.get(header.slice("Bearer ".length)) ?? null;
}

export function canUpdateRecords(identity) {
  return identity.role === "manager";
}
