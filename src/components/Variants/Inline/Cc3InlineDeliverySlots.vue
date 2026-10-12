<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import {
  deliveryDatesFor,
  deliveryTimesFor,
  hasDeliverySlots,
} from '@/stand/config/deliverySlots'
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
 * способу доставки, а не адресу: у экспресса и у обычного курьера это
 * разные интервалы. Пока способ не выбран, выбирать дату не от чего — и
 * именно это раньше сбивало, слоты стояли выше вариантов.
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

const selectedDate = ref('')
const selectedTime = ref('')

const dateChips = computed(() =>
  deliveryDatesFor(props.variantId, countryConfig.value.intlLocale, t),
)

// Окна зависят от выбранной даты, а не только от способа: у экспресса на
// сегодня отпадают ближайшие часы, на завтра набор полный.
const timeChips = computed(() => deliveryTimesFor(props.variantId, selectedDate.value))

/**
 * Сменили способ — выбор возвращается к ближайшей дате.
 *
 * Не «оставить, если ещё подходит»: у курьера и экспресса ряды теперь
 * пересекаются по «Завтра», и переключившийся на экспресс человек
 * оставался бы с завтрашней датой, хотя весь смысл экспресса — сегодня.
 */
watch(
  () => props.variantId,
  () => {
    selectedDate.value = dateChips.value[0]?.value ?? ''
  },
  { immediate: true },
)

/**
 * А вот даты меняются и сами — к вечеру, с переходом суток. Здесь выбор
 * трогаем, только если выбранного больше нет в ряду.
 */
watch(dateChips, (chips) => {
  if (!chips.some((chip) => chip.value === selectedDate.value)) {
    selectedDate.value = chips[0]?.value ?? ''
  }
})

/**
 * Окно — первое доступное: ближайшее к выбранной дате. Пересобирается при
 * смене даты, потому что у экспресса на сегодня набор короче.
 */
watch(
  timeChips,
  (chips) => {
    if (!chips.some((chip) => chip.value === selectedTime.value)) {
      selectedTime.value = chips[0]?.value ?? ''
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
