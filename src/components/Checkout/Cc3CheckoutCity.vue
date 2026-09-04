<script setup lang="ts">
import Cc3InputField from '@/components/Field/Cc3InputField.vue'
import { useCheckout } from '@/composables/useCheckout'

// Поле-заглушка: в реальном проекте — C2Select с подсказками городов из API.
// city — общее состояние: его же читает и пишет адресная книга.
const { city } = useCheckout()
</script>

<template>
  <section class="cc3-checkout-city">
    <h2 class="cc3-checkout-city__title">Город</h2>

    <label class="cc3-checkout-city__field">
      <span class="cc3-checkout-city__label">
        Город доставки <span class="cc3-checkout-city__required">*</span>
      </span>
      <Cc3InputField v-model="city" type="text" />
    </label>

    <p class="cc3-checkout-city__hint">
      Не нашли свой город? Воспользуйтесь
      <a href="#" class="cc3-checkout-city__link">расширенным поиском</a>
    </p>
  </section>
</template>

<style lang="scss">
.cc3-checkout-city {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-md);

  margin-top: var(--st-global-distance-space-stack-md);

  &__title {
    margin: 0;

    @include font('heading-xxs');
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-sm);
  }

  &__label {
    @include font('body-xs');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__required {
    color: var(--st-content-foreground-color-primary-primary);
  }

  &__hint {
    margin: 0;

    @include font('label-xxs');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__link {
    color: var(--st-content-foreground-color-primary-primary);
  }
}
</style>
