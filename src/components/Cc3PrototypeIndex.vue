<script setup lang="ts">
import {
  checkoutProfileLabels,
  checkoutProfiles,
  checkoutVariantLabels,
  checkoutVariants,
  routeHref,
} from '@/composables/useVariant'

// Стартовый экран прототипа: открывается, когда в адресе нет варианта.
// Нужен, чтобы одной ссылкой раздать все сценарии на тестирование.
const groups = checkoutVariants.map((variant) => ({
  variant,
  label: checkoutVariantLabels[variant],
  links: checkoutProfiles.map((profile) => ({
    profile,
    label: checkoutProfileLabels[profile],
    href: routeHref(variant, profile),
  })),
}))
</script>

<template>
  <div class="cc3-prototype-index">
    <header class="cc3-prototype-index__header">
      <h1 class="cc3-prototype-index__title">Прототипы чекаута</h1>
      <p class="cc3-prototype-index__hint">
        Три варианта интерфейса, в каждом — два сценария пользователя.
      </p>
    </header>

    <section v-for="group in groups" :key="group.variant" class="cc3-prototype-index__group">
      <h2 class="cc3-prototype-index__group-title">{{ group.label }}</h2>

      <ul class="cc3-prototype-index__list">
        <li v-for="link in group.links" :key="link.profile">
          <a :href="link.href" class="cc3-prototype-index__link">{{ link.label }}</a>
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
  max-width: 640px;

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

  &__link {
    display: block;

    padding: var(--st-global-distance-space-inset-md);

    @include font('label-md');

    color: var(--st-content-foreground-color-primary-secondary);
    text-decoration: none;
    border: 1px solid var(--st-content-border-color-neutral-secondary);
    border-radius: var(--st-global-radius-lg);

    &:hover {
      border-color: var(--st-content-foreground-color-primary-secondary);
    }
  }
}
</style>
