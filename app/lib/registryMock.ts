export function mintTokenId(projectId: string): string {
  // Xange-layer mock serial. A real implementation should call a sovereign
  // issuance registry and return a verifiable serial/token identifier.
  const suffix = Math.floor(Math.random() * 900000 + 100000)
  return `AT-XANGE-${projectId.toUpperCase().slice(0, 16)}-${suffix}`
}

