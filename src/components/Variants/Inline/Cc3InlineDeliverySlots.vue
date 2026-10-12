<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { deliverySlotsFor, hasDeliverySlots } from '@/stand/config/deliverySlots'
import { useStand } from '@/stand/composables/useStand'

/**
 * Дата и время доставки — два ряда чипсов.
 *
 * Слоты есть только на российском рынке: в Европе и США курьер приезжает
 * в интервал, который человек не выбирает. Компонент сам знает об этом и
 * на остальных рынках не рисует ничего — тому, кто его ставит, не нужно
 * повторять это условие.
 *
 * Стоит под вариантами доставки, а не в карточке адреса. Слот принадлежит
 * способу доставки, а не адресу: у экспресса в день заказа и у обычного
 * курьера это разные интервалы. Пока способ не выбран, выбирать дату не от
 * чего — и именно это раньше сбивало, слоты стояли выше вариантов.
 *
 * Сам набор приходит из ядра стенда: даты считаются от дня прогона, а не
 * стоят строками в словаре. Здесь только отрисовка и выбор.
 */
const props = defineProps<{
  /** Выбранный способ доставки: у экспресса свои даты и окна. */
  variantId?: string
}>()

const { country, countryConfig, t } = useStand()

const hasSlots = computed(() => hasDeliverySlots(country.value))

const slots = computed(() =>
  deliverySlotsFor(props.variantId, countryConfig.value.intlLocale, t),
)

const dateChips = computed(() => slots.value.dates)
const timeChips = computed(() => slots.value.times)

const selectedDate = ref('')
const selectedTime = ref('')

/**
 * Смена способа доставки меняет и набор: выбранное «Завтра» у экспресса в
 * день заказа не существует, и ряд остался бы без выбранной чипсы. Первый
 * слот выбран заранее — это ближайшая доставка, то есть то, чего человек
 * чаще всего и хочет.
 */
watch(
  slots,
  (value) => {
    if (!value.dates.some((chip) => chip.value === selectedDate.value)) {
      selectedDate.value = value.dates[0]?.value ?? ''
    }

    if (!value.times.some((chip) => chip.value === selectedTime.value)) {
      selectedTime.value = value.times[0]?.value ?? ''
    }
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="hasSlots" class="cc3-inline-delivery-slots">
    <div class="cc3-inline-delivery-slots__row">
      <button
        v-for="chip in dateChips"
        :key="chip.value"
        type="button"
        class="cc3-inline-delivery-slots__chip"
        :class="{ 'cc3-inline-delivery-slots__chip--selected': selectedDate === chip.value }"
        @click="selectedDate = chip.value"
      >
        {{ chip.label }}
      </button>
    </div>

    <div class="cc3-inline-delivery-slots__row">
      <button
        v-for="chip in timeChips"
        :key="chip.value"
        type="button"
        class="cc3-inline-delivery-slots__chip"
        :class="{ 'cc3-inline-delivery-slots__chip--selected': selectedTime === chip.value }"
        @click="selectedTime = chip.value"
      >
        {{ chip.label }}
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.cc3-inline-delivery-slots {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-inset-md);

  padding-top: var(--st-global-distance-space-inset-md);

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-global-distance-space-inset-md);
  }

  &__chip {
    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-md);

    font-family: inherit;

    @include font('label-md');

    color: var(--st-action-foreground-color-neutral-normal);
    background: none;
    border: 1px solid var(--st-action-border-color-neutral-subtle-normal);
    border-radius: var(--st-global-radius-xs);
    cursor: pointer;

    &--selected {
      color: var(--st-action-foreground-color-positive-normal);
      border-color: var(--st-action-foreground-color-positive-normal);
    }
  }
}
</style>
