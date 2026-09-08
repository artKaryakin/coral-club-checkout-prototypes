<script setup lang="ts">
import { caseIds, cases, mandatoryEveryCountry } from '@/stand/config/cases'
import { countryCodes } from '@/stand/config/countries'
import { routeHref, standVariantLabels, standVariants } from '@/stand/composables/useStand'

// Стартовый экран стенда: открывается, когда в адресе нет варианта.
// Одна ссылка = одна полностью определённая конфигурация (вариант, страна,
// кейс), поэтому модератор ничего не переключает руками во время сессии.
const groups = standVariants.map((variant) => ({
  variant,
  label: standVariantLabels[variant],
  rows: caseIds.map((caseId) => ({
    caseId,
    title: cases[caseId].title,
    isEveryCountry: mandatoryEveryCountry.includes(caseId),
    links: countryCodes.map((country) => ({
      country,
      href: routeHref(variant, country, caseId),
    })),
  })),
}))
</script>

<template>
  <div class="cc3-prototype-index">
    <header class="cc3-prototype-index__header">
      <h1 class="cc3-prototype-index__title">Прототипы чекаута</h1>
      <p class="cc3-prototype-index__hint">
        Три варианта интерфейса, шесть стран, тринадцать кейсов. Кейс задаёт
        стартовое состояние целиком, включая адресную книгу.
      </p>
      <p class="cc3-prototype-index__hint">
        Отметкой выделены кейсы, обязательные к прогону в каждой стране.
        Язык берётся из страны, для проверки локализации отдельно — параметр
        <code>?locale=en</code>.
      </p>
    </header>

    <section v-for="group in groups" :key="group.variant" class="cc3-prototype-index__group">
      <h2 class="cc3-prototype-index__group-title">{{ group.label }}</h2>

      <ul class="cc3-prototype-index__list">
        <li v-for="row in group.rows" :key="row.caseId" class="cc3-prototype-index__row">
          <div class="cc3-prototype-index__case">
            <span class="cc3-prototype-index__case-id">{{ row.caseId }}</span>
            <span class="cc3-prototype-index__case-title">{{ row.title }}</span>
            <span v-if="row.isEveryCountry" class="cc3-prototype-index__badge">все страны</span>
          </div>

          <div class="cc3-prototype-index__countries">
            <a
              v-for="link in row.links"
              :key="link.country"
              :href="link.href"
              class="cc3-prototype-index__link"
              >{{ link.country }}</a
            >
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style lang="scss">
.cc3-prototype-index {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-xl);

  margin: 0 auto;
  padding: var(--st-global-distance-space-inset-xl);
  max-width: 840px;

  &__header {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-sm);
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

  &__group {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-md);

    padding: var(--st-global-distance-space-inset-2xl);

    background-color: var(--st-content-background-color-neutral-primary);
    border: 1px solid var(--st-content-border-color-neutral-secondary);
    border-radius: var(--st-global-radius-2xl);
  }

  &__group-title {
    margin: 0;

    @include font('heading-xxs');
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-sm);

    margin: 0;
    padding: 0;

    list-style: none;
  }

  &__row {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-sm);

    padding: var(--st-global-distance-space-inset-md);

    border: 1px solid var(--st-content-border-color-neutral-secondary);
    border-radius: var(--st-global-radius-lg);

    @include mediaMinWidth('md') {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: var(--st-global-distance-space-inset-lg);
    }
  }

  &__case {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--st-global-distance-space-inset-sm);

    @include font('body-sm');
  }

  &__case-id {
    @include font('label-md');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__case-title {
    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__badge {
    padding: var(--st-global-distance-space-inset-xs)
      var(--st-global-distance-space-inset-sm);

    @include font('label-sm');

    color: var(--st-content-foreground-color-primary-secondary);
    border: 1px solid var(--st-content-border-color-neutral-secondary);
    border-radius: var(--st-global-radius-md);
  }

  &__countries {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-global-distance-space-inset-sm);
  }

  &__link {
    display: block;

    padding: var(--st-global-distance-space-inset-sm)
      var(--st-global-distance-space-inset-md);

    @include font('label-md');

    color: var(--st-content-foreground-color-primary-secondary);
    text-transform: uppercase;
    text-decoration: none;
    border: 1px solid var(--st-content-border-color-neutral-secondary);
    border-radius: var(--st-global-radius-lg);

    &:hover {
      border-color: var(--st-content-foreground-color-primary-secondary);
    }
  }
}
</style>
