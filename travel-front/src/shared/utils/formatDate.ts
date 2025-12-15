export function formatDateToISO(dateString: string): string {
  if (!dateString) return ''

  const parts = dateString.split('.')
  if (parts.length !== 3) return ''

  const year = parts[2]
  const month = parts[1].padStart(2, '0')
  const day = parts[0].padStart(2, '0')

  return `${year}-${month}-${day}T00:00:00.000Z`
}

export function formatISOToDate(isoString: string): string {
  if (!isoString) return ''

  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return ''

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  } catch (error: any) {
    console.error(error)
    return ''
  }
}
