import { computed } from 'vue'

import { useCheckout } from './useCheckout'
import { useStand } from '@/stand/composables/useStand'

/**
 * Варианты курьерской доставки — копия и цены из макета.
 *
 * Живут отдельно от вёрстки, потому что показываются в двух разных местах:
 * внутри формы адреса (концепты modal и inline) и отдельным блоком в теле
 * чекаута (концепт inline-alt). Один список на оба места — иначе цена
 * разъедется между версиями, и сравнивать концепты станет нечестно.
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

export function useCourierVariants() {
  const { formatMoneyRounded } = useCheckout()
  const { t } = useStand()

  const courierVariants = computed<CourierVariant[]>(() => [
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

  return { courierVariants }
}
