<script setup lang="ts">
/**
 * Локальная заглушка вместо C2Icon из пакета UI.
 * Имена совпадают с именами иконок в реальной ДС (Storybook → C2/Icon),
 * поэтому после подключения пакета замена — это просто
 * <Cc3Icon name="chevron-down" /> → <C2Icon icon="chevron-down" />.
 */
type IconName =
  | 'chevron-down'
  | 'search-md'
  | 'location-pin'
  | 'edit-01'
  | 'info-circle'
  | 'x-circle'
  | 'delivery-truck'
  | 'delivery-package-01'
  | 'diamond-01'
  | 'credit-card'
  | 'layout-list'
  | 'location-map'
  | 'phone'
  | 'plus-md'
  | 'check-md'
  | 'file-01'
  | 'eye-off'
  | 'trash'
  | 'x-md'
  | 'menu-01'
  | 'bank'
  | 'shopping-cart-01'

type Props = {
  name: IconName
  size?: number
}

withDefaults(defineProps<Props>(), {
  size: 20,
})
</script>

<template>
  <svg
    class="cc3-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <template v-if="name === 'chevron-down'">
      <polyline points="6 9 12 15 18 9" />
    </template>

    <template v-else-if="name === 'search-md'">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </template>

    <template v-else-if="name === 'location-pin'">
      <path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12Z" />
      <circle cx="12" cy="9" r="2.3" />
    </template>

    <template v-else-if="name === 'edit-01'">
      <path d="M4 20h4L18.5 9.5a2.121 2.121 0 0 0-3-3L5 17v3Z" />
      <path d="M13.5 6.5l4 4" />
    </template>

    <template v-else-if="name === 'info-circle'">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none" />
    </template>

    <template v-else-if="name === 'x-circle'">
      <circle cx="12" cy="12" r="9" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </template>

    <template v-else-if="name === 'delivery-truck'">
      <rect x="1" y="7.5" width="12.5" height="9.5" rx="2" />
      <path d="M13.5 10.5h4l3.5 3v3.5h-7.5z" />
      <circle cx="6" cy="19" r="1.7" />
      <circle cx="17" cy="19" r="1.7" />
    </template>

    <template v-else-if="name === 'delivery-package-01'">
      <path d="M12 2.5 20.5 7 20.5 17 12 21.5 3.5 17 3.5 7Z" />
      <path d="M3.5 7 12 11.5 20.5 7" />
      <path d="M12 11.5v10" />
    </template>

    <template v-else-if="name === 'diamond-01'">
      <path d="M4 9h16l-8 12L4 9Z" />
      <path d="M8 4h8l3 5H5l3-5Z" />
    </template>

    <template v-else-if="name === 'credit-card'">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </template>
    <template v-else-if="name === 'layout-list'">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="14" y2="17" />
    </template>

    <template v-else-if="name === 'location-map'">
      <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z" />
      <path d="M9 4v13" />
      <path d="M15 6.5v13" />
    </template>

    <template v-else-if="name === 'phone'">
      <path
        d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z"
      />
    </template>

    <template v-else-if="name === 'plus-md'">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </template>

    <template v-else-if="name === 'check-md'">
      <polyline points="5 12.5 10 17.5 19 6.5" />
    </template>

    <template v-else-if="name === 'file-01'">
      <path d="M6 3h7l5 5v13H6V3Z" />
      <polyline points="13 3 13 8 18 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </template>

    <template v-else-if="name === 'eye-off'">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A9.6 9.6 0 0 1 12 5c5 0 9 5 9 7a11 11 0 0 1-2.6 3.4" />
      <path d="M6.2 7.4A11.4 11.4 0 0 0 3 12c0 2 4 7 9 7a9.3 9.3 0 0 0 3.6-.7" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </template>

    <template v-else-if="name === 'trash'">
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </template>

    <template v-else-if="name === 'x-md'">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </template>

    <template v-else-if="name === 'menu-01'">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </template>

    <template v-else-if="name === 'bank'">
      <path d="M3 10.5 12 5l9 5.5" />
      <line x1="3" y1="10.5" x2="21" y2="10.5" />
      <line x1="5" y1="10.5" x2="5" y2="18.5" />
      <line x1="10" y1="10.5" x2="10" y2="18.5" />
      <line x1="14" y1="10.5" x2="14" y2="18.5" />
      <line x1="19" y1="10.5" x2="19" y2="18.5" />
      <line x1="3" y1="18.5" x2="21" y2="18.5" />
      <line x1="2" y1="21.5" x2="22" y2="21.5" />
    </template>

    <template v-else-if="name === 'shopping-cart-01'">
      <path d="M3 4h2l2.2 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20.5 8H6" />
      <circle cx="9.5" cy="20" r="1.3" />
      <circle cx="17" cy="20" r="1.3" />
    </template>
  </svg>
</template>
