export function formatPhoneView(phone: string, withSeven = false) {
  if (withSeven) {
    return `+7 ${phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')}`
  }

  return phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')
}
