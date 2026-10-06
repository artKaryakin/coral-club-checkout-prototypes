import type { CountryCode } from './types'

/**
 * Суммы заказа по странам.
 *
 * Раньше цены лежали одним набором чисел в рублёвом масштабе, а
 * форматировались валютой страны: американский респондент видел заказ на
 * $10 899 и первым делом спрашивал модератора, настоящие ли это деньги.
 * Вопрос попадал ровно внутрь замера.
 *
 * Поэтому у каждого рынка свой набор. Порядок величин одинаковый —
 * примерно сто долларов за корзину из шести позиций, — и считается он не
 * по курсу дня, а по тому, как такие цены выглядят на полке: ровные числа,
 * привычные для рынка.
 *
 * Товары, их названия и фото общие: сравниваем интерфейс, а не ассортимент.
 */

export interface CountryOrderPrices {
  /** Цена позиции по её id в составе заказа. */
  products: Record<string, number>
  /** Баланс Coral Wallet — порядка пятой части заказа. */
  wallet: number
  /**
   * Экспресс-доставка. Обычная курьерская бесплатна на всех рынках,
   * платная остаётся одна — иначе цена не участвует в выборе вообще.
   */
  express: number
  /**
   * Американский набор: три тарифа от бесплатного к быстрому. На остальных
   * рынках вариантов два — бесплатный курьер и платный экспресс.
   */
  shippingTiers?: number[]
}

export const orderPrices: Record<CountryCode, CountryOrderPrices> = {
  ru: {
    products: { 'b-luron': 1200, 'coral-detox-plus': 3900, 'd-spray': 1000, 'ultimate-max': 1400 },
    wallet: 2000,
    express: 500,
  },

  kz: {
    products: { 'b-luron': 6000, 'coral-detox-plus': 19500, 'd-spray': 5000, 'ultimate-max': 7000 },
    wallet: 10000,
    express: 2500,
  },

  de: {
    products: { 'b-luron': 12, 'coral-detox-plus': 39, 'd-spray': 10, 'ultimate-max': 14 },
    wallet: 20,
    express: 4.9,
  },

  pl: {
    products: { 'b-luron': 48, 'coral-detox-plus': 156, 'd-spray': 40, 'ultimate-max': 56 },
    wallet: 80,
    express: 19.9,
  },

  cz: {
    products: { 'b-luron': 280, 'coral-detox-plus': 900, 'd-spray': 230, 'ultimate-max': 320 },
    wallet: 460,
    express: 120,
  },

  us: {
    products: { 'b-luron': 12, 'coral-detox-plus': 39, 'd-spray': 10, 'ultimate-max': 14 },
    wallet: 20,
    express: 9,
    shippingTiers: [0, 5, 9],
  },
}
