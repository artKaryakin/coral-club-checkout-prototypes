<script setup lang="ts">
import { computed } from 'vue'
import coralclubLogoFooter from '@/assets/modal/coralclub-logo-footer.svg'
import socialVk from '@/assets/modal/social-vk.svg'
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'
import { useStandOrder } from '@/stand/composables/useStandOrder'

const { t } = useStand()

// Кнопка заканчивает прохождение: останавливает секундомер, пишет строку в
// журнал и показывает экран благодарности. Логика замера — в ядре стенда.
const { createOrder } = useStandOrder()

const { country, locale } = useStand()

const text = computed(() => ({
  marketing: t('consent.marketing'),
  prefix: t('consent.prefix'),
  privacy: t('consent.privacy'),
  and: t('consent.and'),
  terms: t('consent.terms'),
  submit: t('submit.button'),
  copyright: t('footer.copyright'),
  language: `${t(`country.${country.value}`)} | ${locale.value.toUpperCase()}`,
}))


const { acceptMarketing, acceptTerms, isReady } = useCheckout()
</script>

<template>
  <footer class="cc3-modal-footer">
    <div class="cc3-modal-footer__consent">
      <label class="cc3-modal-footer__cell">
        <span class="cc3-modal-footer__cell-text">
          {{ text.marketing }}
        </span>
        <input v-model="acceptMarketing" type="checkbox" class="cc3-modal-footer__checkbox" />
      </label>

      <label class="cc3-modal-footer__cell">
        <span class="cc3-modal-footer__cell-text">
          {{ text.prefix }} <a href="#">{{ text.privacy }}</a> {{ text.and }}
          <a href="#">{{ text.terms }}</a>.
        </span>
        <input v-model="acceptTerms" type="checkbox" class="cc3-modal-footer__checkbox" />
      </label>
    </div>

    <div class="cc3-modal-footer__cta-wrap">
      <button
        type="button"
        class="cc3-modal-footer__cta"
        :disabled="!isReady"
        @click="createOrder"
      >
        {{ text.submit }}
      </button>
    </div>

    <div class="cc3-modal-footer__site">
      <div class="cc3-modal-footer__legal">
        <img :src="coralclubLogoFooter" alt="Coral Club" class="cc3-modal-footer__logo" />
        <p class="cc3-modal-footer__copyright">
          {{ text.copyright }}
        </p>
      </div>

      <div class="cc3-modal-footer__links">
        <p class="cc3-modal-footer__lang">
          <Cc3Icon name="location-map" :size="24" />
          {{ text.language }}
        </p>

        <a href="#" class="cc3-modal-footer__link">{{ text.privacy }}</a>
        <a href="tel:88001000577" class="cc3-modal-footer__link">8 (800) 100 05 77</a>

        <img :src="socialVk" alt="" class="cc3-modal-footer__social" />
      </div>
    </div>
  </footer>
</template>

<style lang="scss">
.cc3-modal-footer {
  &__consent {
    display: flex;
    flex-direction: column;

    padding: 0 var(--st-global-distance-space-inset-2xl);
  }

  &__cell {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-xl);

    padding: var(--st-global-distance-space-inset-xl) 0;

    cursor: pointer;
  }

  &__cell-text {
    flex: 1;

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);

    a {
      color: inherit;
    }
  }

  &__checkbox {
    @include cc3-modal-check-control;
  }

  &__cta-wrap {
    padding: var(--st-global-distance-space-inset-md) var(--st-global-distance-space-inset-2xl)
      var(--st-global-distance-space-inset-2xl);
  }

  &__cta {
    padding: var(--st-global-distance-space-inset-xl);
    width: 100%;

    font-family: inherit;

    @include font('label-md');

    color: var(--st-action-foreground-color-onprimary-normal);
    background-color: var(--st-action-background-color-positive-normal);
    border: none;
    border-radius: var(--st-global-radius-pill);
    box-shadow:
      0 8px 16px 0 rgb(4 51 103 / 11%),
      0 2px 2px 0 rgb(0 80 178 / 6%);
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__site {
    padding-top: var(--st-global-distance-space-inset-6xl);

    background-color: var(--st-content-background-color-neutral-subtle);
  }

  &__legal {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-md);

    padding: var(--st-global-distance-space-inset-2xl);
  }

  &__logo {
    // SVG-ассет сохранён с preserveAspectRatio="none" — сам растягивается
    // под любые размеры img. Без align-self он ещё и растягивается по
    // ширине контейнера (это flex-item в колонке, где stretch — дефолт).
    align-self: flex-start;

    width: auto;
    height: 28px;
  }

  &__copyright {
    margin: 0;

    @include font('body-xs');

    color: var(--st-content-foreground-color-neutral-primary);
    opacity: 0.64;
  }

  &__links {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--st-global-distance-space-inset-md);

    padding: var(--st-global-distance-space-inset-8xl) var(--st-global-distance-space-inset-2xl);

    background-color: var(--st-content-background-color-neutral-onsubtle);
  }

  &__lang {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-md);

    margin: 0;

    @include font('body-lg');

    color: var(--st-content-foreground-color-neutral-primary);
    opacity: 0.8;
  }

  &__link {
    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
    text-decoration: none;
  }

  &__social {
    margin-top: var(--st-global-distance-space-inset-md);
    width: 44px;
    height: 40px;

    // В исходном ассете иконка перевёрнута — Figma тоже отражает её
    // обратно через transform, а не хранит отдельным файлом.
    transform: scaleY(-1);
  }
}
</style>
