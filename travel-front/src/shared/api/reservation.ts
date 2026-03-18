import { apiFetch } from './http'

/**
 * Рассчитать штраф за отмену бронирования.
 * Возвращает { penaltyAmount: number }.
 */
export function calculateCancellationPenalty(
  bookingNumber: string,
  cancellationDateTimeUtc?: string,
) {
  const dateParam = cancellationDateTimeUtc ?? new Date().toISOString()
  return apiFetch<{ penaltyAmount: number }>(
    `/reservation/bookings/${encodeURIComponent(bookingNumber)}/calculate-cancellation-penalty?cancellationDateTimeUtc=${encodeURIComponent(dateParam)}`,
  )
}

/**
 * Отмена бронирования по номеру.
 * Тело запроса опционально (причина, ожидаемая сумма штрафа).
 */
export function cancelBooking(
  bookingNumber: string,
  body?: { reason?: string; expectedPenaltyAmount?: number },
) {
  return apiFetch<{ booking?: { number: string; status?: string } }>(
    `/reservation/bookings/${encodeURIComponent(bookingNumber)}/cancel`,
    {
      method: 'POST',
      body: body ?? {},
    },
  )
}
