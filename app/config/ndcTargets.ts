export type NdcTarget = {
  sector: string
  year: number
  ndcTarget: number
  ndcPath: number[]
  allowedExportShare: number
}

export const ndcTargets: NdcTarget[] = [
  {
    sector: 'cement',
    year: 2026,
    ndcTarget: 50000,
    ndcPath: [52000, 51000, 50000, 49000, 48000],
    allowedExportShare: 0.2,
  },
  {
    sector: 'agriculture',
    year: 2026,
    ndcTarget: 12000,
    ndcPath: [12500, 12200, 12000, 11800, 11500],
    allowedExportShare: 0.15,
  },
  {
    sector: 'energy',
    year: 2026,
    ndcTarget: 80000,
    ndcPath: [85000, 82500, 80000, 77500, 75000],
    allowedExportShare: 0.25,
  },
  {
    sector: 'forestry',
    year: 2026,
    ndcTarget: 15000,
    ndcPath: [15500, 15200, 15000, 14800, 14500],
    allowedExportShare: 0.3,
  },
  {
    sector: 'steel',
    year: 2026,
    ndcTarget: 35000,
    ndcPath: [36000, 35500, 35000, 34500, 34000],
    allowedExportShare: 0.2,
  },
  {
    sector: 'waste',
    year: 2026,
    ndcTarget: 10000,
    ndcPath: [10500, 10200, 10000, 9800, 9500],
    allowedExportShare: 0.2,
  },
  {
    sector: 'logistics',
    year: 2026,
    ndcTarget: 18000,
    ndcPath: [19000, 18500, 18000, 17500, 17000],
    allowedExportShare: 0.15,
  },
]
