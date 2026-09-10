<script setup lang="ts">
import { computed } from 'vue'

import { logHref, routeHref, useStand } from '../composables/useStand'
import { formatDuration, useStandRun } from '../composables/useStandRun'
import { countries } from '../config/countries'

/**
 * Экран после создания заказа.
 *
 * Он не только благодарит: на нём напечатано всё, что попало в журнал
 * прохождений. Модератор сверяет строку сразу, при респонденте, а не через
 * день по выгрузке, когда спросить уже не у кого — правильные ли данные
 * подставились, тот ли это кейс, сколько заняло.
 *
 * Язык — язык страны, как и весь остальной прототип: экран благодарности
 * такая же часть чекаута, как и форма.
 */
const { t, country, user, locale } = useStand()
const { finishedRun, resetRun, isLogEnabled } = useStandRun()

const text = computed(() => ({
  title: t('thanks.title'),
  subtitle: t('thanks.subtitle'),
  order: t('thanks.order'),
  details: t('thanks.details'),
  again: t('thanks.again'),
  log: t('thanks.log'),
  notSent: t('thanks.notSent'),
  name: t('thanks.field.name'),
  email: t('thanks.field.email'),
  phone: t('thanks.field.phone'),
  country: t('thanks.field.country'),
  user: t('thanks.field.user'),
  variant: t('thanks.field.variant'),
  startedAt: t('thanks.field.startedAt'),
  duration: t('thanks.field.duration'),
}))

const startedAtLabel = computed(() => {
  const run = finishedRun.value

  if (!run) {
    return ''
  }

  return new Date(run.startedAt).toLocaleString(countries[country.value].intlLocale)
})

const durationLabel = computed(() =>
  finishedRun.value
    ? formatDuration(finishedRun.value.durationMs, t('common.minutes'), t('common.seconds'))
    : '',
)

const rows = computed(() => {
  const run = finishedRun.value

  if (!run) {
    return []
  }

  return [
    { key: 'name', label: text.value.name, value: `${run.firstName} ${run.lastName}` },
    { key: 'email', label: text.value.email, value: run.email },
    { key: 'phone', label: text.value.phone, value: run.phone },
    { key: 'country', label: text.value.country, value: countries[run.country].nativeName },
    { key: 'user', label: text.value.user, value: t(`user.${user.value}.title`) },
    { key: 'variant', label: text.value.variant, value: t(`variant.${run.variant}.title`) },
    { key: 'startedAt', label: text.value.startedAt, value: startedAtLabel.value },
    { key: 'duration', label: text.value.duration, value: durationLabel.value },
  ]
})

const orderLabel = computed(() =>
  finishedRun.value ? t('thanks.order', { number: finishedRun.value.orderNumber }) : '',
)

// Строка не доехала до таблицы — модератор должен знать об этом сразу, а не
// обнаружить пропажу при разборе результатов.
const isUnsent = computed(() => isLogEnabled.value && finishedRun.value?.sent === false)

const indexHref = computed(() => routeHref())
const journalHref = computed(() => logHref())
const localeCode = computed(() => locale.value)

function again() {
  resetRun()
}
</script>

<template>
  <div class="cc3-stand-thank-you" :lang="localeCode">
    <div class="cc3-stand-thank-you__card">
      <h1 class="cc3-stand-thank-you__title">{{ text.title }}</h1>
      <p class="cc3-stand-thank-you__subtitle">{{ text.subtitle }}</p>
      <p class="cc3-stand-thank-you__order">{{ orderLabel }}</p>

      <h2 class="cc3-stand-thank-you__section">{{ text.details }}</h2>

      <dl class="cc3-stand-thank-you__list">
        <div v-for="row in rows" :key="row.key" class="cc3-stand-thank-you__row">
          <dt class="cc3-stand-thank-you__label">{{ row.label }}</dt>
          <dd class="cc3-stand-thank-you__value">{{ row.value }}</dd>
        </div>
      </dl>

      <p v-if="isUnsent" class="cc3-stand-thank-you__warning">{{ text.notSent }}</p>

      <div class="cc3-stand-thank-you__actions">
        <a :href="indexHref" class="cc3-stand-thank-you__button" @click="again">
          {{ text.again }}
        </a>
        <a :href="journalHref" class="cc3-stand-thank-you__link" @click="again">
          {{ text.log }}
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.cc3-stand-thank-you {
  display: flex;
  justify-content: center;

  padding: var(--st-global-distance-space-inset-2xl)
    var(--st-global-distance-space-inset-xl);

  background-color: var(--st-content-background-color-neutral-subtle);
  min-height: 100dvh;

  &__card {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-sm);

    padding: var(--st-global-distance-space-inset-2xl);
    width: 100%;
    max-width: 560px;

    background-color: var(--st-content-background-color-neutral-primary);
    border-radius: var(--st-global-radius-lg);
    height: fit-content;
  }

  &__title {
    margin: 0;

    @include font('heading-xs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__subtitle {
    margin: 0;

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__order {
    margin: 0 0 var(--st-global-distance-space-stack-md);

    @include font('label-md');

    color: var(--st-action-foreground-color-positive-normal);
  }

  &__section {
    margin: 0;

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-sm);

    margin: 0;
  }

  // Подпись и значение в строку на широком экране и в столбик на узком:
  // почта и дата в две колонки на телефоне не помещаются.
  &__row {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-xs);

    padding-bottom: var(--st-global-distance-space-inset-sm);

    border-bottom: 1px solid var(--st-content-border-color-neutral-implicit);

    @include mediaMinWidth('sm') {
      flex-direction: row;
      justify-content: space-between;
      gap: var(--st-global-distance-space-inset-2xl);
    }
  }

  &__label {
    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__value {
    margin: 0;

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
    overflow-wrap: anywhere;
  }

  &__warning {
    margin: 0;
    padding: var(--st-global-distance-space-inset-md);

    @include font('body-sm');

    color: var(--st-content-foreground-color-negative-primary);
    background-color: var(--st-content-background-color-neutral-subtle);
    border-radius: var(--st-global-radius-md);
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--st-global-distance-space-stack-sm);

    padding-top: var(--st-global-distance-space-inset-xl);
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: var(--st-global-distance-space-inset-lg);
    width: 100%;
    height: 44px;

    @include font('label-md');

    color: var(--st-action-foreground-color-onprimary-normal);
    text-decoration: none;
    background-color: var(--st-action-background-color-positive-normal);
    border-radius: var(--st-global-radius-md);
  }

  &__link {
    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }
}
</style>
