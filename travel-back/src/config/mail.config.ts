import { registerAs } from '@nestjs/config'

export interface MailConfig {
  rusenderKey?: string
  from?: string
  templateWelcome?: string
  templateRentBooking?: string
  templateRentPayment?: string
  templateRentCancellation?: string
}

export default registerAs(
  'mail',
  (): MailConfig => ({
    rusenderKey: process.env.RUSENDER_KEY || undefined,
    from: process.env.MAIL_FROM || undefined,
    templateWelcome: process.env.RUSENDER_TEMPLATE_WELCOME || undefined,
    templateRentBooking: process.env.RUSENDER_TEMPLATE_RENT_BOOKING || undefined,
    templateRentPayment: process.env.RUSENDER_TEMPLATE_RENT_PAYMENT || undefined,
    templateRentCancellation: process.env.RUSENDER_TEMPLATE_RENT_CANCELLATION || undefined,
  }),
)
