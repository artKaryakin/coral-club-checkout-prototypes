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

/**
 * Набор для России и Казахстана: местные способы, какими их видит покупатель
 * на сегодняшнем сайте. Прод так показывал и раньше, концепты — нет: у них
 * оставался набор из макета (ЮMoney, карта, PayPal). Респондент из России
 * видел в двух версиях подряд разные способы оплаты и спрашивал про них
 * модератора, хотя оплата в тесте не проверяется вовсе.
 */
export const cisPaymentMethods: PaymentMethodConfig[] = [
  { id: 'sbp', labelKey: 'payment.sbp' },
  { id: 'card', labelKey: 'payment.card' },
  { id: 'sberpay', labelKey: 'payment.sberpay' },
  { id: 'yoomoney', labelKey: 'payment.umoney' },
]

/**
 * Набор из макета — он достался концептам и остаётся у европейских рынков.
 *
 * СБП и SberPay в немецком или польском чекауте были бы вопросом модератору
 * прямо внутри замера, а какие способы у Coral Club там подключены на самом
 * деле, мы пока не знаем. До тех пор европейские рынки не трогаем: прод
 * показывает там свой набор, концепты — этот, как и было.
 */
export const conceptPaymentMethods: PaymentMethodConfig[] = [
  { id: 'yoomoney', labelKey: 'payment.umoney' },
  { id: 'card', labelKey: 'payment.card' },
  { id: 'paypal', labelKey: 'payment.paypal' },
]

/** Свой набор способов оплаты сейчас только у США. */
export function hasOwnPaymentMethods(country: CountryCode): boolean {
  return country === 'us'
}

/** Рынки, где способы оплаты одинаковы во всех версиях стенда. */
function hasLocalPaymentMethods(country: CountryCode): boolean {
  return country === 'ru' || country === 'kz'
}

/**
 * Способы оплаты прод-версии: у США свой набор, у остальных — местный.
 * Так было до появления этого конфига, и так и остаётся.
 */
export function paymentMethodsFor(country: CountryCode): PaymentMethodConfig[] {
  return hasOwnPaymentMethods(country) ? usPaymentMethods : cisPaymentMethods
}

/**
 * Способы оплаты концептов. Совпадают с прод-версией там, где мы уверены
 * в наборе — США, Россия, Казахстан. В Европе остаётся набор из макета.
 */
export function conceptPaymentMethodsFor(country: CountryCode): PaymentMethodConfig[] {
  if (hasOwnPaymentMethods(country)) {
    return usPaymentMethods
  }

  return hasLocalPaymentMethods(country) ? cisPaymentMethods : conceptPaymentMethods
}
