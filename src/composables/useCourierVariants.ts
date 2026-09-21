import { computed } from 'vue'

import { useCheckout } from './useCheckout'
import { useStand } from '@/stand/composables/useStand'
import { formatPrice } from '@/utils/formatPrice'

/**
 * Варианты курьерской доставки — копия и цены из макета.
 *
 * Живут отдельно от вёрстки, потому что показываются в трёх местах: внутри
 * окна адреса на шаге поиска, внутри него же на шаге формы и отдельным
 * блоком в теле чекаута. Один список на все три — иначе цена разъедется, и
 * сравнивать концепты станет нечестно.
 *
 * Это не то же самое, что Cc3CheckoutDeliveryVariant в проде: там другой
 * текст и самостоятельный сценарий, здесь — визуальный прототип.
 */
export interface CourierVariant {
  id: string
  /** Полная подпись со способом доставки — для формы адреса. */
  title: string
  /** То же без способа доставки — для карточки сводки, где он уже назван. */
  summary: string
  caption?: string
}

/** Стоимость обычной доставки — демо-значение, форматируется в валюте страны. */
const COURIER_PRICE = 149

/**
 * Цены и сроки американского набора. Порядок как в тамошних чекаутах:
 * бесплатно и долго сверху, дороже и быстрее ниже. Сроки считаются от
 * сегодняшнего дня, а не зашиты датами: стенд живёт месяцами, а «Arrives by
 * Sep 25» в декабре респондент прочитает как поломку.
 */
const US_SHIPPING = [
  { id: 'economy', price: 0, days: 8 },
  { id: 'standard', price: 20, days: 5 },
  { id: 'express', price: 30, days: 4 },
]

export function useCourierVariants() {
  const { formatMoneyRounded } = useCheckout()
  const { t, country, countryConfig } = useStand()

  function arrivalDate(days: number): string {
    const date = new Date()

    date.setDate(date.getDate() + days)

    return new Intl.DateTimeFormat(countryConfig.value.intlLocale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  const usVariants = computed<CourierVariant[]>(() =>
    US_SHIPPING.map((item) => {
      const title =
        item.price === 0
          ? t('delivery.variant.us.free')
          : t('delivery.variant.us.paid', {
              price: formatPrice(item.price, countryConfig.value.currency, countryConfig.value.intlLocale),
            })

      return {
        id: item.id,
        title,
        summary: title,
        caption: t('delivery.variant.us.eta', { date: arrivalDate(item.days) }),
      }
    }),
  )

  const defaultVariants = computed<CourierVariant[]>(() => [
    {
      id: 'standard',
      title: t('delivery.variant.standard', { price: formatMoneyRounded(COURIER_PRICE) }),
      summary: t('delivery.variant.standard.summary', {
        price: formatMoneyRounded(COURIER_PRICE),
      }),
    },
    {
      id: 'express',
      title: t('delivery.variant.express'),
      summary: t('delivery.variant.express.summary'),
      caption: t('delivery.variant.expressNote'),
    },
  ])

  const courierVariants = computed<CourierVariant[]>(() =>
    country.value === 'us' ? usVariants.value : defaultVariants.value,
  )

  /**
   * Выбранный по умолчанию вариант — всегда первый в списке. В американском
   * наборе это бесплатная доставка: предвыбранная платная там, где рядом есть
   * бесплатная, сама по себе стала бы находкой теста, а мы проверяем не это.
   */
  const defaultVariantId = computed(() => courierVariants.value[0]?.id ?? 'standard')

  return { courierVariants, defaultVariantId }
}
