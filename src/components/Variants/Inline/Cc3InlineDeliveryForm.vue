<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useCheckout } from '@/composables/useCheckout'
import Cc3StandField from '@/stand/components/Cc3StandField.vue'
import { useStand } from '@/stand/composables/useStand'
import { useStandFields } from '@/stand/composables/useStandFields'
import type { FieldKey } from '@/stand/config/types'
import { applySuggestion } from '@/stand/suggest'
import type { AddressSuggestion } from '@/stand/suggest'

import Cc3ModalConfirmDialog from '../Modal/Cc3ModalConfirmDialog.vue'
import type { DeliveryProfile } from '../Modal/deliveryProfile'

/**
 * Форма адреса курьера — разворачивается прямо в теле страницы, без
 * попапа и без карты (по макету инлайн-концепта, в отличие от модального).
 * Самовывоз в неё не заходит: клик по сегменту Pickup сразу открывает
 * Cc3InlinePickupDialog, у него своя карта и свой список пунктов.
 */
const props = defineProps<{
  editProfile?: DeliveryProfile
}>()

const emit = defineEmits<{
  confirm: [profile: DeliveryProfile]
  delete: [id: string]
  'open-pickup': []
}>()

const { formatMoneyRounded } = useCheckout()
const { t, country } = useStand()

const text = computed(() => ({
  courier: t('delivery.courier.title'),
  pickup: t('delivery.pickup.title'),
  addressSection: t('address.title'),
  recipientSection: t('group.recipient.title'),
  favorite: t('address.favorite'),
  variantsHint: t('delivery.variants.hint'),
  variantsTitle: t('delivery.variants'),
  save: t('common.save'),
  remove: t('common.delete'),
}))

type CourierVariant = { id: string; title: string; summary: string; caption?: string }

const COURIER_PRICE = 149

// summary — то же самое, но без названия способа доставки: в карточке
// сводки оно не нужно, там уже есть заголовок «Курьер».
const courierVariants = computed<CourierVariant[]>(() => [
  {
    id: 'standard',
    title: t('delivery.variant.standard', { price: formatMoneyRounded(COURIER_PRICE) }),
    summary: t('delivery.variant.standard.summary', { price: formatMoneyRounded(COURIER_PRICE) }),
  },
  {
    id: 'express',
    title: t('delivery.variant.express'),
    summary: t('delivery.variant.express.summary'),
    caption: t('delivery.variant.expressNote'),
  },
])

const selectedCourierVariant = ref('standard')

const { fields: addressFields } = useStandFields('address')
const { fields: recipientFields } = useStandFields('recipient')

/**
 * У нас нет флоу с типами адреса «Дом / Работа / Своё название» — только
 * пометка «любимый» сердечком, которая потом показывается в адресной книге.
 * Поле есть в конфиге СНГ-рынков (src/stand/config/countries.ts), но в этой
 * форме не рендерится — состав и порядок остальных полей не трогаем.
 */
const renderedAddressFields = computed(() =>
  addressFields.value.filter((field) => field.key !== 'addressLabel'),
)

const values = ref<Partial<Record<FieldKey, string>>>({})
const resolvedCity = ref('')
const isAddressResolved = computed(() => resolvedCity.value.length > 0)

function seedValues() {
  const profile = props.editProfile

  resolvedCity.value = profile ? (profile.fields?.city ?? profile.addressLine) : ''

  if (!profile) {
    values.value = {}

    return
  }

  const [firstName = '', ...rest] = profile.name.trim().split(/\s+/)

  values.value = {
    ...profile.fields,
    street: profile.fields?.street ?? profile.addressLine,
    recipientName: profile.name,
    recipientFirstName: firstName,
    recipientLastName: rest.join(' '),
    recipientPhone: profile.phone,
    recipientEmail: profile.email,
  }
}

seedValues()

watch(country, seedValues)

function onSuggestionSelect(suggestion: AddressSuggestion) {
  values.value = applySuggestion(values.value, 'street', suggestion, addressFields.value)

  if (suggestion.city) {
    resolvedCity.value = suggestion.city
  }
}

const recipientDisplayName = computed(() =>
  values.value.recipientName?.trim() ||
  [values.value.recipientFirstName, values.value.recipientLastName].filter(Boolean).join(' '),
)

const isFavorite = ref(props.editProfile?.isFavorite ?? false)
const isDeleteConfirmOpen = ref(false)

const confirmedProfile = computed<DeliveryProfile>(() => {
  const variant = courierVariants.value.find((item) => item.id === selectedCourierVariant.value)

  return {
    id: props.editProfile?.id ?? `profile-${Date.now()}`,
    method: 'courier',
    typeLabel: t('delivery.method.courier'),
    name: recipientDisplayName.value,
    addressLine: values.value.street ?? '',
    priceLabel: variant?.summary ?? '',
    isFavorite: isFavorite.value,
    phone: values.value.recipientPhone ?? '',
    email: values.value.recipientEmail ?? '',
    fields: values.value,
  }
})

function confirm() {
  emit('confirm', confirmedProfile.value)
}

function deleteProfile() {
  isDeleteConfirmOpen.value = false

  if (props.editProfile) {
    emit('delete', props.editProfile.id)
  }
}
</script>

<template>
  <div class="cc3-inline-delivery-form">
    <div class="cc3-inline-delivery-form__tabs">
      <button type="button" class="cc3-inline-delivery-form__tab cc3-inline-delivery-form__tab--active">
        {{ text.courier }}
      </button>
      <button
        type="button"
        class="cc3-inline-delivery-form__tab"
        @click="$emit('open-pickup')"
      >
        {{ text.pickup }}
      </button>
    </div>

    <h3 class="cc3-inline-delivery-form__section-title">{{ text.addressSection }}</h3>

    <div class="cc3-inline-delivery-form__fields">
      <Cc3StandField
        v-for="field in renderedAddressFields"
        :key="field.key"
        v-model="values[field.key]"
        :field="field"
        @select="onSuggestionSelect"
      />
    </div>

    <h3 class="cc3-inline-delivery-form__section-title">{{ text.recipientSection }}</h3>

    <div class="cc3-inline-delivery-form__fields">
      <Cc3StandField
        v-for="field in recipientFields"
        :key="field.key"
        v-model="values[field.key]"
        :field="field"
      />
    </div>

    <h3 class="cc3-inline-delivery-form__section-title">{{ text.variantsTitle }}</h3>

    <div v-if="isAddressResolved" class="cc3-inline-delivery-form__variants">
      <label v-for="variant in courierVariants" :key="variant.id" class="cc3-inline-delivery-form__cell">
        <span class="cc3-inline-delivery-form__cell-content">
          <span class="cc3-inline-delivery-form__cell-title">{{ variant.title }}</span>
          <span v-if="variant.caption" class="cc3-inline-delivery-form__cell-caption">
            {{ variant.caption }}
          </span>
        </span>
        <input
          v-model="selectedCourierVariant"
          type="radio"
          name="inline-courier-variant"
          :value="variant.id"
          class="cc3-inline-delivery-form__radio"
        />
      </label>
    </div>
    <p v-else class="cc3-inline-delivery-form__variants-hint">{{ text.variantsHint }}</p>

    <label class="cc3-inline-delivery-form__favorite">
      <span>{{ text.favorite }}</span>
      <input v-model="isFavorite" type="checkbox" class="cc3-inline-delivery-form__checkbox" />
    </label>

    <div class="cc3-inline-delivery-form__actions">
      <template v-if="editProfile">
        <button type="button" class="cc3-inline-delivery-form__continue" @click="confirm">
          {{ text.save }}
        </button>
        <button
          type="button"
          class="cc3-inline-delivery-form__delete"
          @click="isDeleteConfirmOpen = true"
        >
          {{ text.remove }}
        </button>
      </template>

      <button v-else type="button" class="cc3-inline-delivery-form__continue" @click="confirm">
        {{ text.save }}
      </button>
    </div>

    <Cc3ModalConfirmDialog
      v-if="isDeleteConfirmOpen"
      message="Do you want to delete this address?"
      @confirm="deleteProfile"
      @cancel="isDeleteConfirmOpen = false"
    />
  </div>
</template>

<style lang="scss">
.cc3-inline-delivery-form {
  display: flex;
  flex-direction: column;

  padding: 0 var(--st-global-distance-space-inset-2xl);

  &__tabs {
    display: flex;
    gap: var(--st-global-distance-space-inset-none);

    margin: var(--st-global-distance-space-inset-lg) 0 var(--st-global-distance-space-inset-xl);
    padding: var(--st-global-distance-space-inset-xs);

    background-color: var(--st-content-background-color-neutral-onsubtle);
    border-radius: var(--st-global-radius-xl);
  }

  &__tab {
    flex: 1;

    padding: var(--st-global-distance-space-inset-md) var(--st-global-distance-space-inset-2xl);

    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-primary);
    background: none;
    border: none;
    border-radius: var(--st-global-radius-md);
    cursor: pointer;

    &--active {
      background-color: var(--st-content-background-color-default-solid-normal);
      box-shadow:
        0 1px 4px 0 rgb(4 8 13 / 8%),
        0 1px 2px 0 rgb(4 8 13 / 8%);
    }
  }

  &__section-title {
    margin: 0;
    padding: var(--st-global-distance-space-inset-sm) 0;

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__fields {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--st-global-distance-space-inset-2xl);

    padding-bottom: var(--st-global-distance-space-inset-sm);

    // half — не своя модификация, а флаг из конфига страны (см. Cc3StandField):
    // поле встаёт в половину строки, а не на всю ширину.
    .cc3-stand-field--half {
      flex: 1 1 calc(50% - var(--st-global-distance-space-inset-2xl));
      min-width: 140px;
    }
  }

  &__variants-hint {
    margin: 0;
    padding: var(--st-global-distance-space-inset-xl) var(--st-global-distance-space-inset-3xl);

    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-tetriary);
    background-color: var(--st-content-background-color-neutral-subtle);
    border-radius: var(--st-global-radius-lg);
  }

  &__variants {
    display: flex;
    flex-direction: column;
  }

  &__cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--st-global-distance-space-inset-xl);

    padding: var(--st-global-distance-space-inset-md) 0;

    cursor: pointer;
  }

  &__cell-content {
    display: flex;
    flex-direction: column;
  }

  &__cell-title {
    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__cell-caption {
    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__radio {
    @include cc3-modal-radio-control;
  }

  &__checkbox {
    @include cc3-modal-check-control;
  }

  &__favorite {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--st-global-distance-space-inset-xl);

    padding: var(--st-global-distance-space-inset-xl) 0;

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
    cursor: pointer;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-xl);

    padding: var(--st-global-distance-space-inset-xl) 0 var(--st-global-distance-space-inset-2xl);
  }

  &__continue,
  &__delete {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: var(--st-global-distance-space-inset-lg);
    width: 100%;
    height: 44px;

    font-family: inherit;

    @include font('label-md');

    border: none;
    border-radius: var(--st-global-radius-md);
    cursor: pointer;
  }

  &__continue {
    color: var(--st-action-foreground-color-onprimary-normal);
    background-color: var(--st-action-background-color-positive-normal);
  }

  &__delete {
    color: var(--st-action-foreground-color-neutral-normal);
    background-color: var(--st-content-background-color-default-solid-normal);
    border: 1px solid var(--st-action-border-color-neutral-subtle-normal);
  }
}
</style>
