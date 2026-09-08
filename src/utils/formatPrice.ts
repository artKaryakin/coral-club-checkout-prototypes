/**
 * Форматирует цену по правилам локали.
 *
 * ВНИМАНИЕ: временная замена GeoIntl из пакета `ui`. После его подключения
 * форматирование обязано идти через `new GeoIntl().currency(value, currency)` —
 * по правилам ДС все зависящие от языка данные форматируются централизованно.
 */
export function formatPrice(value: number, currency = 'RUB', locale = 'ru-RU'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

/**
 * Округлённая сумма с символом валюты, без копеек — так подписан баланс
 * и суммы скидки в блоке Coral Wallet (в отличие от сводки заказа,
 * где суммы всегда с копейками).
 */
export function formatPriceRounded(
  value: number,
  currency = 'RUB',
  locale = 'ru-RU',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Число с копейками, без символа валюты — используется в строке
 * «Использовано Coral Wallet» в сводке заказа.
 */
export function formatDecimal(value: number, locale = 'ru-RU'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
