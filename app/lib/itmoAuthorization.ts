export interface ItmoAuthorizationInput {
  governanceAuthorized: boolean
  ndcCompatible: boolean
  exportableAmount: number
  requestedITMOAmount: number
  projectReductionTons: number
}

export type AuthorizationType = 'domestic' | 'ITMO' | 'both'

export interface ItmoAuthorizationResult {
  authorizationType: AuthorizationType
  maxITMOExport: number
  itmoEligible: boolean
}

export function computeItmoAuthorization(
  input: ItmoAuthorizationInput,
): ItmoAuthorizationResult {
  const {
    governanceAuthorized,
    ndcCompatible,
    exportableAmount,
    requestedITMOAmount,
  } = input

  const itmoEligible = governanceAuthorized && ndcCompatible
  const maxITMOExport = Math.max(0, exportableAmount)
  const projectReductionTons = input.projectReductionTons

  let authorizationType: AuthorizationType = 'domestic'
  if (itmoEligible && requestedITMOAmount > 0 && projectReductionTons > 0) {
    authorizationType = requestedITMOAmount >= projectReductionTons ? 'ITMO' : 'both'
  }

  return {
    authorizationType,
    maxITMOExport,
    itmoEligible,
  }
}
