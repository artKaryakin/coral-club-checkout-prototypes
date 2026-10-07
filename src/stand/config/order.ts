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
    products: { 'b-luron': 2200, 'coral-detox-plus': 5900, 'd-spray': 2000 },
    wallet: 2000,
    express: 500,
  },

  kz: {
    products: { 'b-luron': 11000, 'coral-detox-plus': 29500, 'd-spray': 10000 },
    wallet: 10000,
    express: 2500,
  },

  de: {
    products: { 'b-luron': 22, 'coral-detox-plus': 59, 'd-spray': 20 },
    wallet: 20,
    express: 4.9,
  },

  pl: {
    products: { 'b-luron': 88, 'coral-detox-plus': 236, 'd-spray': 80 },
    wallet: 80,
    express: 19.9,
  },

  cz: {
    products: { 'b-luron': 500, 'coral-detox-plus': 1350, 'd-spray': 480 },
    wallet: 460,
    express: 120,
  },

  us: {
    products: { 'b-luron': 22, 'coral-detox-plus': 59, 'd-spray': 20 },
    wallet: 20,
    express: 9,
    shippingTiers: [0, 5, 9],
  },
}
