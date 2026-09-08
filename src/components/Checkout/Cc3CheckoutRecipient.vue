<script setup lang="ts">
import { computed, toRefs } from 'vue'

import Cc3InputField from '@/components/Field/Cc3InputField.vue'
import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

const { t } = useStand()

const { countryConfig } = useStand()

const text = computed(() => ({
  title: t('group.recipient.title'),
  lastName: t('recipient.lastName'),
  firstName: t('recipient.firstName'),
  middleName: t('recipient.middleName'),
  phone: t('recipient.phone'),
  phonePlaceholder: t('recipient.phonePlaceholder'),
  email: t('recipient.email'),
  flag: countryConfig.value.flag,
}))


// Поля-заглушки: в реальном проекте — C2Field + C2Input(Phone) из пакета UI.
// recipient — общее состояние: его же читает и пишет адресная книга.
const { recipient } = useCheckout()
const { lastName, firstName, middleName, phone, email } = toRefs(recipient.value)
</script>

<template>
  <section class="cc3-checkout-recipient">
    <h2 class="cc3-checkout-recipient__title">{{ text.title }}</h2>

    <div class="cc3-checkout-recipient__row cc3-checkout-recipient__row--name">
      <label class="cc3-checkout-recipient__field">
        <span class="cc3-checkout-recipient__label">
          {{ text.lastName }} <span class="cc3-checkout-recipient__required">*</span>
        </span>
        <Cc3InputField v-model="lastName" type="text" />
      </label>

      <label class="cc3-checkout-recipient__field">
        <span class="cc3-checkout-recipient__label">
          {{ text.firstName }} <span class="cc3-checkout-recipient__required">*</span>
        </span>
        <Cc3InputField v-model="firstName" type="text" />
      </label>

      <label class="cc3-checkout-recipient__field">
        <span class="cc3-checkout-recipient__label">{{ text.middleName }}</span>
        <Cc3InputField v-model="middleName" type="text" />
      </label>
    </div>

    <div class="cc3-checkout-recipient__row cc3-checkout-recipient__row--contacts">
      <label class="cc3-checkout-recipient__field">
        <span class="cc3-checkout-recipient__label">
          {{ text.phone }} <span class="cc3-checkout-recipient__required">*</span>
        </span>
        <Cc3InputField v-model="phone" type="tel" :placeholder="text.phonePlaceholder">
          <template #prefix>
            <span class="cc3-checkout-recipient__flag" aria-hidden="true">{{ text.flag }}</span>
          </template>
        </Cc3InputField>
      </label>

      <label class="cc3-checkout-recipient__field">
        <span class="cc3-checkout-recipient__label">
          {{ text.email }} <span class="cc3-checkout-recipient__required">*</span>
        </span>
        <Cc3InputField v-model="email" type="email" />
      </label>
    </div>
  </section>
</template>

<style lang="scss">
.cc3-checkout-recipient {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-lg);

  &__title {
    margin: 0;

    @include font('heading-xxs');
  }

  &__row {
    display: grid;
    gap: var(--st-global-distance-space-inset-md);
    grid-template-columns: 1fr;

    @include mediaMinWidth('sm') {
      &.cc3-checkout-recipient__row--name {
        grid-template-columns: repeat(3, 1fr);
      }

      &.cc3-checkout-recipient__row--contacts {
        grid-template-columns: repeat(2, 1fr);
      }
    }
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

  &__flag {
    font-size: 16px;
  }
}
</style>
