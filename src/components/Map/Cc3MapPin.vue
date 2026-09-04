<script setup lang="ts">
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'

type Props = {
  /**
   * Короткая подпись внутри метки. Не используется, если задан icon
   */
  label?: string

  /**
   * Иконка внутри метки вместо текста — так на референсе показана точка
   * доставки курьером (грузовик в красном кружке)
   */
  icon?: 'delivery-truck'

  variant?: 'cdek' | 'office' | 'fivepost' | 'address'

  selected?: boolean
}

withDefaults(defineProps<Props>(), {
  label: '',
  icon: undefined,
  variant: 'address',
  selected: false,
})
</script>

<template>
  <span
    class="cc3-map-pin"
    :class="[
      `cc3-map-pin--${variant}`,
      { 'cc3-map-pin--selected': selected, 'cc3-map-pin--icon': icon },
    ]"
  >
    <span class="cc3-map-pin__body">
      <Cc3Icon v-if="icon" :name="icon" :size="16" />
      <template v-else>{{ label }}</template>
    </span>
    <span class="cc3-map-pin__tail" />
  </span>
</template>

<style lang="scss">
.cc3-map-pin {
  display: flex;
  flex-direction: column;
  align-items: center;

  pointer-events: auto;
  cursor: pointer;

  &__body {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0 6px;
    min-width: 26px;
    height: 26px;

    @include font('label-xxs');

    color: #fff;
    border: 2px solid #fff;
    border-radius: 13px;
    box-shadow: 0 1px 4px rgb(16 24 40 / 35%);
  }

  &__tail {
    margin-top: -3px;

    border-top: 6px solid;
    border-right: 4px solid transparent;
    border-left: 4px solid transparent;
  }

  &--cdek {
    .cc3-map-pin__body {
      background-color: #17a54a;
    }

    .cc3-map-pin__tail {
      border-top-color: #17a54a;
    }
  }

  &--office,
  &--address {
    .cc3-map-pin__body {
      background-color: var(--st-content-foreground-color-primary-primary);
    }

    .cc3-map-pin__tail {
      border-top-color: var(--st-content-foreground-color-primary-primary);
    }
  }

  &--fivepost {
    .cc3-map-pin__body {
      background-color: var(--st-asemantic-foreground-color-indigo-secondary);
    }

    .cc3-map-pin__tail {
      border-top-color: var(--st-asemantic-foreground-color-indigo-secondary);
    }
  }

  &--selected {
    .cc3-map-pin__body {
      border-color: var(--st-content-foreground-color-neutral-primary);
      transform: scale(1.15);
    }
  }

  &--icon {
    .cc3-map-pin__body {
      padding: 0;
      width: 36px;
      height: 36px;

      border-radius: 50%;
      border-width: 3px;
    }
  }
}
</style>
