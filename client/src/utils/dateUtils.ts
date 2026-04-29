import dayjs from 'dayjs'

export function formatDate(value: string, format = 'DD MMM YYYY'): string {
  return dayjs(value).format(format)
}

export function formatDateTime(value: string, format = 'DD MMM YYYY, hh:mm A'): string {
  return dayjs(value).format(format)
}

export function isToday(value: string): boolean {
  return dayjs(value).isSame(dayjs(), 'day')
}
