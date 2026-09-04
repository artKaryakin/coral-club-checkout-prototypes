<script setup lang="ts">
import Cc3CheckboxField from '@/components/Field/Cc3CheckboxField.vue'
import { useCheckout } from '@/composables/useCheckout'

const { acceptMarketing, acceptTerms } = useCheckout()
</script>

<template>
  <div class="cc3-checkout-consent">
    <Cc3CheckboxField v-model="acceptMarketing">
      Я хочу получать письма о скидках и акциях
    </Cc3CheckboxField>

    <Cc3CheckboxField v-model="acceptTerms">
      Оформляя заказ, вы соглашаетесь с
      <a href="#" class="cc3-checkout-consent__link">Политикой обработки персональных данных</a>
      и принимаете <a href="#" class="cc3-checkout-consent__link">Условия продажи</a>.
    </Cc3CheckboxField>
  </div>
</template>

<style lang="scss">
.cc3-checkout-consent {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-sm);

  &__link {
    color: var(--st-content-foreground-color-primary-primary);
  }
}
</style>
