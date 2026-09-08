<script setup lang="ts">
import { computed } from 'vue'
import Cc3InputField from '@/components/Field/Cc3InputField.vue'
import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

const { t } = useStand()

const text = computed(() => ({
  title: t('wallet.balance', { amount: walletDisplayBalanceFormat.value }),
  payAll: t('wallet.payAll'),
  applyFull: t('wallet.applyFull'),
  spendUpTo: t('wallet.spendUpTo', { amount: walletMaxUsableFormat.value }),
  applyBelow: t('wallet.applyBelow'),
  otherAmount: t('wallet.otherAmount'),
  applyDiscount: t('wallet.applyDiscount'),
  question: t('wallet.question'),
  enterAmount: t('wallet.enterAmount'),
  max: t('wallet.max', { amount: walletMaxUsableFormat.value }),
  remaining: t('wallet.remaining', { amount: walletRemainingToPayFormat.value }),
  fullyCovered: t('wallet.fullyCovered'),
  remove: t('wallet.remove'),
}))


const {
  walletMode,
  walletCustomAmount,
  isWalletFullyCovering,
  isOrderFullyPaidByWallet,
  isWalletCustomAmountValid,
  walletDisplayBalanceFormat,
  walletMaxUsableFormat,
  walletAppliedAmountFormat,
  walletRemainingToPayFormat,
  applyWalletFullDiscount,
  openWalletCustomAmount,
  applyWalletCustomAmount,
  removeWalletDiscount,
} = useCheckout()
</script>

<template>
  <section class="cc3-checkout-wallet">
    <h2 class="cc3-checkout-wallet__title">{{ text.title }}</h2>

    <!-- Скидка ещё не применена: предлагаем оплатить весь заказ балансом целиком -->
    <template v-if="walletMode === 'idle'">
      <p class="cc3-checkout-wallet__description">
        <template v-if="isWalletFullyCovering">
          {{ text.payAll }}
          <strong>{{ text.applyFull }}</strong>
        </template>
        <template v-else>
          {{ text.spendUpTo }} <strong>{{ text.applyBelow }}</strong>
        </template>
      </p>

      <button
        type="button"
        class="cc3-checkout-wallet__link"
        @click="openWalletCustomAmount"
      >
        {{ text.otherAmount }}
      </button>

      <button type="button" class="cc3-checkout-wallet__apply" @click="applyWalletFullDiscount">
        {{ text.applyDiscount }}
      </button>
    </template>

    <!-- Ввод произвольной суммы -->
    <template v-else-if="walletMode === 'custom'">
      <p class="cc3-checkout-wallet__description">
        {{ text.question }}
      </p>

      <label class="cc3-checkout-wallet__field">
        <span class="cc3-checkout-wallet__label">{{ text.enterAmount }}</span>

        <span class="cc3-checkout-wallet__field-row">
          <Cc3InputField
            v-model="walletCustomAmount"
            type="text"
            inputmode="numeric"
            class="cc3-checkout-wallet__input"
          />

          <button
            type="button"
            class="cc3-checkout-wallet__apply"
            :disabled="!isWalletCustomAmountValid"
            @click="applyWalletCustomAmount"
          >
            {{ text.applyDiscount }}
          </button>
        </span>

        <span class="cc3-checkout-wallet__hint">{{ text.max }}</span>
      </label>
    </template>

    <!-- Скидка применена -->
    <template v-else>
      <p class="cc3-checkout-wallet__description">
        {{ walletAppliedAmountFormat }} скидка применена к вашему заказу.
        <strong v-if="!isOrderFullyPaidByWallet">
          {{ text.remaining }}
          ниже.
        </strong>
        <strong v-else>{{ text.fullyCovered }}</strong>
      </p>

      <button type="button" class="cc3-checkout-wallet__remove" @click="removeWalletDiscount">
        {{ text.remove }}
      </button>
    </template>
  </section>
</template>

<style lang="scss">
.cc3-checkout-wallet {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-md);

  align-items: flex-start;

  &__title {
    margin: 0;

    @include font('heading-xxs');
  }

  &__description {
    margin: 0;

    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-primary);

    strong {
      font-weight: 600;
    }
  }

  &__link {
    padding: 0;

    font-family: inherit;

    @include font('label-xs');

    color: var(--st-content-foreground-color-neutral-secondary);
    text-decoration: underline dashed;
    text-underline-offset: 3px;
    background: none;
    border: none;
    cursor: pointer;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-sm);

    width: 100%;
  }

  &__label {
    @include font('label-xs');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__field-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-global-distance-space-stack-md);
  }

  &__input {
    max-width: 260px;
  }

  &__hint {
    @include font('label-xxs');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__apply,
  &__remove {
    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-xl);

    font-family: inherit;

    @include font('label-sm');

    border-radius: var(--st-global-radius-lg);
    cursor: pointer;
  }

  &__apply {
    color: var(--st-content-foreground-color-primary-primary);
    background-color: var(--st-action-background-color-primary-subtle);
    border: none;

    &:disabled {
      color: var(--st-content-foreground-color-neutral-tetriary);
      background-color: var(--st-content-background-color-neutral-secondary);
      cursor: not-allowed;
    }
  }

  &__remove {
    color: var(--st-content-foreground-color-neutral-primary);
    background-color: var(--st-content-background-color-neutral-primary);
    border: 1px solid var(--st-content-border-color-neutral-primary);
  }
}
</style>
