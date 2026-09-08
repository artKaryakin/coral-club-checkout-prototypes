<script setup lang="ts">
import { computed } from 'vue'
import Cc3CheckboxField from '@/components/Field/Cc3CheckboxField.vue'
import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

const { t } = useStand()

const text = computed(() => ({
  marketing: t('consent.marketing'),
  prefix: t('consent.prefix'),
  privacy: t('consent.privacy'),
  and: t('consent.and'),
  terms: t('consent.terms'),
}))


const { acceptMarketing, acceptTerms } = useCheckout()
</script>

<template>
  <div class="cc3-checkout-consent">
    <Cc3CheckboxField v-model="acceptMarketing">
      {{ text.marketing }}
    </Cc3CheckboxField>

    <Cc3CheckboxField v-model="acceptTerms">
      {{ text.prefix }}
      <a href="#" class="cc3-checkout-consent__link">{{ text.privacy }}</a>
      {{ text.and }}
      <a href="#" class="cc3-checkout-consent__link">{{ text.terms }}</a>.
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
