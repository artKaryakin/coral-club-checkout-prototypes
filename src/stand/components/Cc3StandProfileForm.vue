<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import Cc3StandField from './Cc3StandField.vue'
import type { FieldKey, StandProfile } from '../config/types'
import { testProfile } from '../config/profiles'
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
 * Все четыре поля обязательны. Незаполненный профиль ломает не форму, а
 * замер: в журнале прохождений остаётся строка без человека, и понять,
 * чей это прогон, потом невозможно.
 *
 * Форма открыта пустой, а не с подставленными значениями: респондент
 * должен ввести свои данные, иначе он не заметит, что дальше они
 * подставились сами, — а именно это мы и проверяем.
 */
const emit = defineEmits<{ submit: [] }>()

const { t, country } = useStand()
const { profileFields, saveProfile } = useStandProfile()

const text = computed(() => ({
  submit: t('stand.profile.submit'),
  fill: t('stand.profile.fill'),
  required: t('stand.profile.required'),
}))

function empty(): Partial<Record<FieldKey, string>> {
  return {
    recipientFirstName: '',
    recipientLastName: '',
    recipientEmail: '',
    recipientPhone: '',
  }
}

const values = ref(empty())

// Ошибки показываются только после первой попытки отправить. Красное поле
// у человека, который ещё ничего не успел набрать, — это не подсказка,
// а упрёк.
const isSubmitted = ref(false)

// Смена страны — другой формат телефона. Начинаем заново.
watch(country, () => {
  values.value = empty()
  isSubmitted.value = false
})

const filled = computed<StandProfile>(() => ({
  firstName: values.value.recipientFirstName?.trim() ?? '',
  lastName: values.value.recipientLastName?.trim() ?? '',
  email: values.value.recipientEmail?.trim() ?? '',
  phone: values.value.recipientPhone?.trim() ?? '',
}))

const isComplete = computed(() => Object.values(filled.value).every(Boolean))

function isInvalid(key: FieldKey) {
  return isSubmitted.value && !values.value[key]?.trim()
}

/**
 * Кнопка для нас, а не для респондента: прогнать сценарий целиком, не
 * набирая каждый раз четыре поля. Данные заведомо ненастоящие, чтобы в
 * журнале прохождений тестовые прогоны отличались от боевых с одного
 * взгляда.
 */
function fillTestData() {
  values.value = {
    recipientFirstName: testProfile.firstName,
    recipientLastName: testProfile.lastName,
    recipientEmail: testProfile.email,
    recipientPhone: testProfile.phone,
  }
  isSubmitted.value = false
}

function submit() {
  isSubmitted.value = true

  if (!isComplete.value) {
    return
  }

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
        :invalid="isInvalid(field.key)"
        :error="text.required"
      />
    </div>

    <button type="submit" class="cc3-stand-profile-form__submit">{{ text.submit }}</button>

    <button type="button" class="cc3-stand-profile-form__fill" @click="fillTestData">
      {{ text.fill }}
    </button>
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

  // Служебная кнопка модератора: намеренно тише основной, чтобы
  // респондент не принял её за шаг сценария.
  &__fill {
    align-self: center;

    padding: var(--st-global-distance-space-inset-sm);

    font-family: inherit;

    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-tetriary);
    background: none;
    border: none;
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
