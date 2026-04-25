import { useMemo, useState } from 'react'
import { Zap } from 'lucide-react'
import AlertForm from '../components/alerts/AlertForm'
import AlertList from '../components/alerts/AlertList'
import { useAlerts, useCreateAlert, useDeleteAlert, useToggleAlert } from '../hooks/useAlerts'
import { useAuthStore } from '../store/authStore'
import type { AlertRule } from '../types/domain'

function AlertsPage() {
  const user = useAuthStore((state) => state.user)
  const alertsQuery = useAlerts(Boolean(user))
  const createAlertMutation = useCreateAlert()
  const toggleAlertMutation = useToggleAlert()
  const deleteAlertMutation = useDeleteAlert()
  const [error, setError] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const alerts = useMemo(() => alertsQuery.data ?? [], [alertsQuery.data])

  const addAlert = async (payload: { symbol: string; alertType: string; triggerValue: number }) => {
    setError('')
    try {
      await createAlertMutation.mutateAsync({
        symbol: payload.symbol,
        alertType: payload.alertType as AlertRule['alertType'],
        triggerValue: payload.triggerValue,
      })
      setIsFormOpen(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create alert')
    }
  }

  const toggleAlert = async (alertId: number) => {
    setError('')
    try {
      await toggleAlertMutation.mutateAsync(alertId)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update alert')
    }
  }

  const deleteAlert = async (alertId: number) => {
    setError('')
    try {
      await deleteAlertMutation.mutateAsync(alertId)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete alert')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-white dark:bg-transparent px-2">My Alerts</h1>
      </div>

      {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500">{error}</p>}

      {alerts.length === 0 && !isFormOpen ? (
        <div className="flex flex-col items-center justify-center mt-20 pt-10">
          <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Zap className="h-20 w-20 text-yellow-400 fill-yellow-400 -rotate-12" />
            <div className="absolute bottom-6 right-6 rounded-full bg-white p-1.5 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-black">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>
          <h2 className="mt-8 text-lg font-bold text-slate-800 dark:text-slate-100">
            Currently you don't have any alerts
          </h2>
          <button
            onClick={() => setIsFormOpen(true)}
            className="mt-6 rounded-lg bg-[#ebaa00] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#d69b00] shadow-md"
          >
            + Create an Alert
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {(isFormOpen || alerts.length > 0) && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-[var(--border)]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">New Alert configuration</h2>
                {isFormOpen && alerts.length > 0 && (
                  <button onClick={() => setIsFormOpen(false)} className="text-xs text-blue-600 hover:underline">Cancel</button>
                )}
              </div>
              <AlertForm onSubmit={addAlert} />
            </div>
          )}
          {alerts.length > 0 && (
            <AlertList alerts={alerts} onToggle={toggleAlert} onDelete={deleteAlert} />
          )}
        </div>
      )}
    </div>
  )
}

export default AlertsPage
