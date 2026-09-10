<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import Cc3StandField from './Cc3StandField.vue'
import type { FieldKey, StandProfile } from '../config/types'
import { useStand } from '../composables/useStand'
import { useStandProfile } from '../composables/useStandProfile'

/**
 * Шаг «профиль» на входе на стенд.
 *
 * Заменяет собой личный кабинет: респондент называет себя один раз, и
 * дальше во всех формах доставки получатель подставляется из этих данных.
 * Поля те же самые, что в чекауте (`useStandProfile`), поэтому подписи,
 * примеры ввода и формат телефона совпадают с тем, что он увидит потом.
 *
 * Форма заполнена значениями по умолчанию, а не пуста: она стоит до теста,
 * а не внутри него, и заставлять человека печатать четыре поля ради того,
 * чтобы начать, — потерянные минуты сессии. Всё подставленное правится.
 */
const emit = defineEmits<{ submit: [] }>()

const { t, country } = useStand()
const { profile, profileFields, saveProfile } = useStandProfile()

const text = computed(() => ({
  submit: t('stand.profile.submit'),
}))

function seed(): Partial<Record<FieldKey, string>> {
  return {
    recipientFirstName: profile.value.firstName,
    recipientLastName: profile.value.lastName,
    recipientEmail: profile.value.email,
    recipientPhone: profile.value.phone,
  }
}

const values = ref(seed())

// Смена страны — другой формат телефона и другое имя по умолчанию.
// Значения предыдущей страны в новую форму не переносятся.
watch(country, () => {
  values.value = seed()
})

const filled = computed<StandProfile>(() => ({
  firstName: values.value.recipientFirstName?.trim() ?? '',
  lastName: values.value.recipientLastName?.trim() ?? '',
  email: values.value.recipientEmail?.trim() ?? '',
  phone: values.value.recipientPhone?.trim() ?? '',
}))

function submit() {
  saveProfile(filled.value)
  emit('submit')
}
</script>

<template>
  <form class="cc3-stand-profile-form" @submit.prevent="submit">
    <div class="cc3-stand-profile-form__fields">
      <Cc3StandField
        v-for="field in profileFields"
        :key="field.key"
        v-model="values[field.key]"
        :field="field"
      />
    </div>

    <button type="submit" class="cc3-stand-profile-form__submit">{{ text.submit }}</button>
  </form>
</template>

<style lang="scss">
.cc3-stand-profile-form {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-md);

  &__fields {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--st-global-distance-space-inset-2xl);

    // half — флаг из конфига поля, а не модификация этой формы:
    // имя и фамилия встают по половине строки, остальные — во всю.
    .cc3-stand-field--half {
      flex: 1 1 calc(50% - var(--st-global-distance-space-inset-2xl));
      min-width: 140px;
    }
  }

  &__submit {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: var(--st-global-distance-space-inset-lg);
    width: 100%;
    height: 44px;

    font-family: inherit;

    @include font('label-md');

    color: var(--st-action-foreground-color-onprimary-normal);
    background-color: var(--st-action-background-color-positive-normal);
    border: none;
    border-radius: var(--st-global-radius-md);
    cursor: pointer;
  }
}
</style>
