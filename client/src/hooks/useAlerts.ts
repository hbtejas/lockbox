import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAlert,
  deleteAlert,
  fetchAlerts,
  toggleAlert,
} from '../api/alertsApi'
import type { AlertRule } from '../types/domain'

export function useAlerts(enabled: boolean) {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    enabled,
  })
}

export function useCreateAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { symbol: string; alertType: AlertRule['alertType']; triggerValue: number }) =>
      createAlert(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

export function useToggleAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (alertId: number) => toggleAlert(alertId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

export function useDeleteAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (alertId: number) => deleteAlert(alertId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}
