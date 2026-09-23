import type { CountryCode } from './types'

/**
 * Способы оплаты для рынка США.
 *
 * На остальных рынках список задаёт сама версия чекаута — там он достался
 * от макета и различается между прод-версией и концептами. Для США он
 * общий на все три версии сознательно: респондент из Штатов не должен
 * спотыкаться о СБП и ЮMoney и тратить на это вопросы модератору. Оплата
 * в тесте не проверяется, она обязана быть привычной и незаметной.
 */
export type PaymentMark = 'apple-pay' | 'google-pay' | 'mastercard' | 'visa'

export interface PaymentMethodConfig {
  id: string
  /** Ключ подписи в словарях `src/stand/i18n`. */
  labelKey: string
  /** Марки платёжных систем, которые принимает способ. */
  marks?: PaymentMark[]
}

export const usPaymentMethods: PaymentMethodConfig[] = [
  {
    id: 'bank-card',
    labelKey: 'payment.creditCard',
  },
  { id: 'paypal', labelKey: 'payment.paypal' },
]

/** Свой набор способов оплаты сейчас только у США. */
export function hasOwnPaymentMethods(country: CountryCode): boolean {
  return country === 'us'
}
