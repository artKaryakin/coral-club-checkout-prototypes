<script setup lang="ts">
import Cc3InputField from '@/components/Field/Cc3InputField.vue'
import { useCheckout } from '@/composables/useCheckout'

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
    <h2 class="cc3-checkout-wallet__title">Баланс Coral Wallet {{ walletDisplayBalanceFormat }}</h2>

    <!-- Скидка ещё не применена: предлагаем оплатить весь заказ балансом целиком -->
    <template v-if="walletMode === 'idle'">
      <p class="cc3-checkout-wallet__description">
        <template v-if="isWalletFullyCovering">
          Оплатите весь заказ средствами с баланса Coral Wallet.
          <strong>Примените скидку 100% ниже.</strong>
        </template>
        <template v-else>
          Спишите с баланса Coral Wallet до {{ walletMaxUsableFormat }} в качестве скидки на этот
          заказ. <strong>Примените скидку ниже.</strong>
        </template>
      </p>

      <button
        type="button"
        class="cc3-checkout-wallet__link"
        @click="openWalletCustomAmount"
      >
        Я хочу использовать другую сумму
      </button>

      <button type="button" class="cc3-checkout-wallet__apply" @click="applyWalletFullDiscount">
        Применить скидку
      </button>
    </template>

    <!-- Ввод произвольной суммы -->
    <template v-else-if="walletMode === 'custom'">
      <p class="cc3-checkout-wallet__description">
        На какую сумму хотите использовать баланс Coral Wallet в качестве скидки на этот заказ?
      </p>

      <label class="cc3-checkout-wallet__field">
        <span class="cc3-checkout-wallet__label">Введите сумму</span>

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
            Применить скидку
          </button>
        </span>

        <span class="cc3-checkout-wallet__hint">Максимум {{ walletMaxUsableFormat }}</span>
      </label>
    </template>

    <!-- Скидка применена -->
    <template v-else>
      <p class="cc3-checkout-wallet__description">
        {{ walletAppliedAmountFormat }} скидка применена к вашему заказу.
        <strong v-if="!isOrderFullyPaidByWallet">
          Вам всё ещё нужно оплатить {{ walletRemainingToPayFormat }} одним из способов оплаты
          ниже.
        </strong>
        <strong v-else>Заказ полностью покрыт балансом Coral Wallet.</strong>
      </p>

      <button type="button" class="cc3-checkout-wallet__remove" @click="removeWalletDiscount">
        Убрать скидку
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
