<script setup lang="ts">
import { computed } from 'vue'

import type { PaymentMark } from '@/stand/config/payments'

/**
 * Ряд марок платёжных систем справа от способа оплаты.
 *
 * Официальных логотипов Visa, Mastercard, Apple Pay и Google Pay в
 * репозитории нет: их выдают сами платёжные системы, у каждой свои
 * правила использования, и скачивать их со стороны нельзя. Пока файлов
 * нет, марка рисуется подписью в плашке того же размера и на том же
 * месте — чтобы положить настоящие, дизайнеру достаточно добавить файл
 * в `src/assets/payment-icons` и вписать его в `markFiles` ниже.
 */
const props = defineProps<{ marks: PaymentMark[] }>()

/** Названия марок одинаковы во всех языках — это имена брендов. */
const markLabels: Record<PaymentMark, string> = {
  'apple-pay': 'Apple Pay',
  'google-pay': 'G Pay',
  mastercard: 'Mastercard',
  visa: 'VISA',
}

/** Сюда дизайнер добавляет импортированные файлы логотипов. */
const markFiles: Partial<Record<PaymentMark, string>> = {}

interface MarkView {
  id: PaymentMark
  label: string
  src?: string
}

const items = computed<MarkView[]>(() =>
  props.marks.map((mark) => ({
    id: mark,
    label: markLabels[mark],
    src: markFiles[mark],
  })),
)
</script>

<template>
  <span class="cc3-payment-marks">
    <span v-for="item in items" :key="item.id" class="cc3-payment-marks__item">
      <img v-if="item.src" :src="item.src" :alt="item.label" class="cc3-payment-marks__image" />
      <span v-else class="cc3-payment-marks__label">{{ item.label }}</span>
    </span>
  </span>
</template>

<style lang="scss">
.cc3-payment-marks {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--st-global-distance-space-inline-xs);

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: var(--st-global-distance-space-inset-2xs)
      var(--st-global-distance-space-inset-xs);
    min-width: 40px;
    height: 28px;

    background-color: var(--st-content-background-color-default-solid-normal);
    border: 1px solid var(--st-content-border-color-neutral-implicit);
    border-radius: var(--st-global-radius-xs);
  }

  &__image {
    max-width: 100%;
    max-height: 100%;
  }

  &__label {
    @include font('label-xs');

    white-space: nowrap;
    color: var(--st-content-foreground-color-neutral-primary);
  }
}
</style>
