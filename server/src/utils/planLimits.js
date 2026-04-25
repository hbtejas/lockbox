const PLAN_LIMITS = {
  free: {
    portfolios: 1,
    watchlists: 2,
    alerts: 5,
    screenerQueriesMonthly: 10,
  },
  premium: {
    portfolios: 5,
    watchlists: 10,
    alerts: Number.POSITIVE_INFINITY,
    screenerQueriesMonthly: Number.POSITIVE_INFINITY,
  },
}

function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free
}

module.exports = {
  PLAN_LIMITS,
  getPlanLimits,
}
