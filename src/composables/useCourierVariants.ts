import { computed } from 'vue'

import { useCheckout } from './useCheckout'
import { useStand } from '@/stand/composables/useStand'
import { orderPrices } from '@/stand/config/order'
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
  /** Стоимость — её же показывает строка «Доставка» в итогах заказа. */
  price: number
}

/**
 * Сроки американского набора. Цены берутся из конфига рынка, сроки считаются
 * от сегодняшнего дня, а не зашиты датами: стенд живёт месяцами, а «Arrives
 * by Sep 25» в декабре респондент прочитает как поломку.
 *
 * Порядок как в тамошних чекаутах: бесплатно и долго сверху, дороже и
 * быстрее ниже.
 */
const US_SHIPPING = [
  { id: 'economy', days: 8 },
  { id: 'standard', days: 5 },
  { id: 'express', days: 4 },
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

  /** Цена платной доставки на этом рынке. */
  const expressPrice = computed(() => orderPrices[country.value].express)

  const usVariants = computed<CourierVariant[]>(() =>
    US_SHIPPING.map((item, index) => {
      const price = orderPrices[country.value].shippingTiers?.[index] ?? 0
      const title =
        price === 0
          ? t('delivery.variant.us.free')
          : t('delivery.variant.us.paid', {
              price: formatPrice(price, countryConfig.value.currency, countryConfig.value.intlLocale),
            })

      return {
        id: item.id,
        title,
        summary: title,
        caption: t('delivery.variant.us.eta', { date: arrivalDate(item.days) }),
        price,
      }
    }),
  )

  /**
   * Обычный курьер бесплатен, платит только тот, кому нужно сегодня. Так
   * устроено большинство чекаутов, на которых вырос покупатель, и так цена
   * участвует в выборе: раньше платным был обычный курьер, а экспресс стоял
   * бесплатным — выбор между ними не стоил респонденту ничего.
   */
  const defaultVariants = computed<CourierVariant[]>(() => [
    {
      id: 'standard',
      title: t('delivery.variant.standard'),
      summary: t('delivery.variant.standard.summary'),
      price: 0,
    },
    {
      id: 'express',
      title: t('delivery.variant.express', { price: formatMoneyRounded(expressPrice.value) }),
      summary: t('delivery.variant.express.summary', {
        price: formatMoneyRounded(expressPrice.value),
      }),
      caption: t('delivery.variant.expressNote'),
      price: expressPrice.value,
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

  /** Цена варианта по его id — для строки «Доставка» в итогах. */
  function priceOf(id: string | undefined): number {
    return courierVariants.value.find((variant) => variant.id === id)?.price ?? 0
  }

  return { courierVariants, defaultVariantId, priceOf }
}
