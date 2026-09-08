<script setup lang="ts">
import { computed } from 'vue'
import { countryCodes } from '@/stand/config/countries'
import { userTypes } from '@/stand/config/users'
import { routeHref, standVariants, useStand } from '@/stand/composables/useStand'

// Вход на стенд: страна → тип пользователя → версия чекаута.
// Шаг не хранится в компоненте, а читается из адреса, поэтому кнопка «назад»
// в браузере работает как возврат на предыдущий шаг, а любой шаг можно
// отправить ссылкой.
const { selection, country, user, t } = useStand()

const step = computed(() => {
  if (!selection.value.country) return 'country'

  return selection.value.user ? 'variant' : 'user'
})

const steps = computed(() => [
  {
    key: 'country',
    label: t('stand.step.country'),
    value: selection.value.country ? t(`country.${selection.value.country}`) : undefined,
    href: routeHref(),
  },
  {
    key: 'user',
    label: t('stand.step.user'),
    value: selection.value.user ? t(`user.${selection.value.user}.title`) : undefined,
    href: routeHref(selection.value.country),
  },
  {
    key: 'variant',
    label: t('stand.step.variant'),
    value: undefined,
    href: routeHref(selection.value.country, selection.value.user),
  },
])

const countryOptions = computed(() =>
  countryCodes.map((code) => ({
    key: code,
    title: t(`country.${code}`),
    hint: undefined,
    href: routeHref(code),
  })),
)

const userOptions = computed(() =>
  userTypes.map((type) => ({
    key: type,
    title: t(`user.${type}.title`),
    hint: t(`user.${type}.hint`),
    href: routeHref(country.value, type),
  })),
)

const variantOptions = computed(() =>
  standVariants.map((variant) => ({
    key: variant,
    title: t(`variant.${variant}.title`),
    hint: t(`variant.${variant}.hint`),
    href: routeHref(country.value, user.value, variant),
  })),
)

const options = computed(() => {
  if (step.value === 'country') return countryOptions.value
  if (step.value === 'user') return userOptions.value

  return variantOptions.value
})

const standTitle = computed(() => t('stand.title'))
const backLabel = computed(() => t('stand.back'))
const title = computed(() => t(`stand.${step.value}.title`))
const hint = computed(() => t(`stand.${step.value}.hint`))
const backHref = computed(() => {
  if (step.value === 'user') return routeHref()

  return routeHref(country.value)
})
</script>

<template>
  <div class="cc3-prototype-index">
    <header class="cc3-prototype-index__header">
      <p class="cc3-prototype-index__eyebrow">{{ standTitle }}</p>

      <ol class="cc3-prototype-index__steps">
        <li v-for="item in steps" :key="item.key" class="cc3-prototype-index__step">
          <a v-if="item.value" :href="item.href" class="cc3-prototype-index__step-link">
            <span class="cc3-prototype-index__step-label">{{ item.label }}</span>
            <span class="cc3-prototype-index__step-value">{{ item.value }}</span>
          </a>
          <span v-else class="cc3-prototype-index__step-label">{{ item.label }}</span>
        </li>
      </ol>

      <h1 class="cc3-prototype-index__title">{{ title }}</h1>
      <p class="cc3-prototype-index__hint">{{ hint }}</p>
    </header>

    <ul class="cc3-prototype-index__list">
      <li v-for="option in options" :key="option.key">
        <a :href="option.href" class="cc3-prototype-index__option">
          <span class="cc3-prototype-index__option-title">{{ option.title }}</span>
          <span v-if="option.hint" class="cc3-prototype-index__option-hint">{{
            option.hint
          }}</span>
        </a>
      </li>
    </ul>

    <p v-if="step !== 'country'" class="cc3-prototype-index__back">
      <a :href="backHref" class="cc3-prototype-index__back-link">{{ backLabel }}</a>
    </p>
  </div>
</template>

<style lang="scss">
.cc3-prototype-index {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-xl);

  margin: 0 auto;
  padding: var(--st-global-distance-space-inset-2xl)
    var(--st-global-distance-space-inset-xl);
  max-width: 640px;

  &__header {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-sm);
  }

  &__eyebrow {
    margin: 0;

    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-tetriary);
    text-transform: uppercase;
  }

  &__steps {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-global-distance-space-inset-md);

    margin: 0;
    padding: 0;

    list-style: none;
  }

  &__step {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-xs);
  }

  &__step-link {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-xs);

    color: inherit;
    text-decoration: none;
  }

  &__step-label {
    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__step-value {
    @include font('label-md');

    color: var(--st-content-foreground-color-primary-secondary);
  }

  &__title {
    margin: 0;

    @include font('heading-xs');
  }

  &__hint {
    margin: 0;

    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-sm);

    margin: 0;
    padding: 0;

    list-style: none;
  }

  &__option {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-xs);

    padding: var(--st-global-distance-space-inset-lg);

    text-decoration: none;
    background-color: var(--st-content-background-color-neutral-primary);
    border: 1px solid var(--st-content-border-color-neutral-secondary);
    border-radius: var(--st-global-radius-lg);

    &:hover {
      border-color: var(--st-content-foreground-color-primary-secondary);
    }
  }

  &__option-title {
    @include font('label-md');

    color: var(--st-content-foreground-color-primary-secondary);
  }

  &__option-hint {
    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__back {
    margin: 0;
  }

  &__back-link {
    @include font('label-md');

    color: var(--st-content-foreground-color-neutral-secondary);
    text-decoration: none;

    &:hover {
      color: var(--st-content-foreground-color-primary-secondary);
    }
  }
}
</style>
