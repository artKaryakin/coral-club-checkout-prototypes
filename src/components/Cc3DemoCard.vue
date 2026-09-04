<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  /**
   * Заголовок карточки
   */
  title: string

  /**
   * Название цвета из ДС для палитры
   */
  palette?: string
}

const props = withDefaults(defineProps<Props>(), {
  palette: 'iris',
})

const paletteClass = computed(() => `c2-palette--${props.palette}`)
</script>

<template>
  <div class="cc3-demo-card c2" :class="paletteClass">
    <div class="cc3-demo-card__title">{{ title }}</div>

    <div class="cc3-demo-card__body">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.cc3-demo-card {
  @include paletteColor(var(--st-asemantic-foreground-color-indigo-secondary));
  @include paletteBackground(var(--st-asemantic-background-color-indigo-subtile));

  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-md);

  padding: var(--st-global-distance-space-inset-md);
  border-radius: var(--st-global-radius-md);

  @include mediaMinWidth('md') {
    padding: var(--st-global-distance-space-inset-xl);
  }

  &__title {
    @include font('label-md');

    letter-spacing: -0.224px;
  }

  &__body {
    color: var(--st-content-foreground-color-neutral-tetriary);
  }
}
</style>
