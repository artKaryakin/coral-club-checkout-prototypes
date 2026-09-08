<script setup lang="ts" generic="T extends MapMarker">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useStand } from '@/stand/composables/useStand'

import type { MapMarker, MapPoint } from './mapTypes'

const { t } = useStand()

const text = computed(() => ({
  zoomIn: t('common.zoomIn'),
  zoomOut: t('common.zoomOut'),
}))

type Props = {
  /**
   * Точка, вокруг которой центрируется карта при открытии
   */
  center: MapPoint

  zoom?: number

  /**
   * Метки на карте. Тип сохраняется целиком и приходит в слот `marker`,
   * чтобы в шаблоне не приходилось искать данные по id
   */
  markers: T[]

  /**
   * Высота карты в пикселях
   */
  height?: number

  /**
   * Шаблон адреса тайла.
   *
   * По макету на бою используется Google Maps — он требует ключ API и платный
   * биллинг, поэтому по умолчанию подставлены бесплатные тайлы OpenStreetMap.
   * Для перехода на Google достаточно заменить этот адрес и добавить ключ.
   */
  tileUrl?: string

  /**
   * Подпись правообладателя тайлов. Обязательна по условиям OpenStreetMap
   */
  attribution?: string
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 10,
  height: 320,
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors',
})

const emit = defineEmits<{
  select: [point: MapPoint]
}>()

const TILE_SIZE = 256
const ZOOM_MIN = 3
const ZOOM_MAX = 18

const root = ref<HTMLElement>()
const width = ref(0)

const center = ref<MapPoint>({ ...props.center })
const zoom = ref(props.zoom)

watch(
  () => props.center,
  (value) => {
    center.value = { ...value }
  },
)

// ─── Проекция Web Mercator ───────────────────────────────────────────────────
function lngToWorldX(lng: number, z: number): number {
  return ((lng + 180) / 360) * 2 ** z * TILE_SIZE
}

function latToWorldY(lat: number, z: number): number {
  const rad = (lat * Math.PI) / 180
  const merc = Math.log(Math.tan(rad) + 1 / Math.cos(rad))

  return ((1 - merc / Math.PI) / 2) * 2 ** z * TILE_SIZE
}

function worldXToLng(x: number, z: number): number {
  return (x / (2 ** z * TILE_SIZE)) * 360 - 180
}

function worldYToLat(y: number, z: number): number {
  const n = Math.PI * (1 - (2 * y) / (2 ** z * TILE_SIZE))

  return (180 / Math.PI) * Math.atan(Math.sinh(n))
}

// Левый верхний угол видимой области в мировых пикселях
const originX = computed(() => lngToWorldX(center.value.lng, zoom.value) - width.value / 2)
const originY = computed(() => latToWorldY(center.value.lat, zoom.value) - props.height / 2)

const tiles = computed(() => {
  if (width.value === 0) {
    return []
  }

  const z = zoom.value
  const count = 2 ** z
  const list: { key: string; url: string; left: number; top: number }[] = []

  const fromX = Math.floor(originX.value / TILE_SIZE)
  const toX = Math.floor((originX.value + width.value) / TILE_SIZE)
  const fromY = Math.floor(originY.value / TILE_SIZE)
  const toY = Math.floor((originY.value + props.height) / TILE_SIZE)

  for (let x = fromX; x <= toX; x += 1) {
    for (let y = fromY; y <= toY; y += 1) {
      if (y < 0 || y >= count) {
        continue
      }

      const wrappedX = ((x % count) + count) % count

      list.push({
        key: `${z}-${x}-${y}`,
        url: props.tileUrl
          .replace('{z}', String(z))
          .replace('{x}', String(wrappedX))
          .replace('{y}', String(y)),
        left: x * TILE_SIZE - originX.value,
        top: y * TILE_SIZE - originY.value,
      })
    }
  }

  return list
})

const markerPositions = computed(() =>
  props.markers.map((marker) => ({
    marker,
    left: lngToWorldX(marker.lng, zoom.value) - originX.value,
    top: latToWorldY(marker.lat, zoom.value) - originY.value,
  })),
)

const isZoomOutDisabled = computed(() => zoom.value <= ZOOM_MIN)
const isZoomInDisabled = computed(() => zoom.value >= ZOOM_MAX)

// ─── Перетаскивание и щипок ──────────────────────────────────────────────────
const isDragging = ref(false)

/**
 * Все прижатые к карте пальцы. Нужен именно список: один палец — это
 * перетаскивание, два — щипок, и переключаться между ними надо на лету,
 * не теряя карту под рукой.
 */
const activePointers = new Map<number, { x: number; y: number }>()

let dragStartX = 0
let dragStartY = 0
let dragOriginX = 0
let dragOriginY = 0
let isMoved = false

/** Расстояние между пальцами на момент последнего изменения масштаба. */
let pinchDistance = 0

/**
 * Во сколько раз должно измениться расстояние между пальцами, чтобы
 * шагнуть на один зум. Масштаб у тайлов целочисленный, промежуточных
 * значений нет — порог не даёт карте дёргаться туда-сюда на дрожании руки.
 */
const PINCH_STEP = 1.6

function pointersDistance(): number {
  const [first, second] = [...activePointers.values()]

  if (!first || !second) {
    return 0
  }

  return Math.hypot(first.x - second.x, first.y - second.y)
}

function startDrag(x: number, y: number) {
  dragStartX = x
  dragStartY = y
  dragOriginX = originX.value
  dragOriginY = originY.value
}

function onPointerDown(event: PointerEvent) {
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  root.value?.setPointerCapture(event.pointerId)

  if (activePointers.size === 1) {
    isDragging.value = true
    isMoved = false
    startDrag(event.clientX, event.clientY)

    return
  }

  // Второй палец — дальше это щипок, а не перетаскивание.
  isDragging.value = false
  isMoved = true
  pinchDistance = pointersDistance()
}

function onPointerMove(event: PointerEvent) {
  if (!activePointers.has(event.pointerId)) {
    return
  }

  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (activePointers.size >= 2) {
    const distance = pointersDistance()

    if (pinchDistance === 0 || distance === 0) {
      return
    }

    const ratio = distance / pinchDistance

    if (ratio > PINCH_STEP) {
      changeZoom(1)
      pinchDistance = distance
    } else if (ratio < 1 / PINCH_STEP) {
      changeZoom(-1)
      pinchDistance = distance
    }

    return
  }

  if (!isDragging.value) {
    return
  }

  const deltaX = event.clientX - dragStartX
  const deltaY = event.clientY - dragStartY

  if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
    isMoved = true
  }

  const nextOriginX = dragOriginX - deltaX
  const nextOriginY = dragOriginY - deltaY

  center.value = {
    lng: worldXToLng(nextOriginX + width.value / 2, zoom.value),
    lat: worldYToLat(nextOriginY + props.height / 2, zoom.value),
  }
}

function onPointerUp(event: PointerEvent) {
  const wasPinching = activePointers.size >= 2

  activePointers.delete(event.pointerId)
  root.value?.releasePointerCapture(event.pointerId)

  // Оторвали один палец из двух — оставшийся продолжает вести карту.
  if (activePointers.size === 1) {
    const [remaining] = [...activePointers.values()]

    if (remaining) {
      isDragging.value = true
      startDrag(remaining.x, remaining.y)
    }

    return
  }

  isDragging.value = false
  pinchDistance = 0

  if (wasPinching || isMoved || !root.value) {
    return
  }

  const bounds = root.value.getBoundingClientRect()

  emit('select', {
    lng: worldXToLng(originX.value + event.clientX - bounds.left, zoom.value),
    lat: worldYToLat(originY.value + event.clientY - bounds.top, zoom.value),
  })
}

function changeZoom(delta: number) {
  zoom.value = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom.value + delta))
}

// ─── Размеры ─────────────────────────────────────────────────────────────────
let observer: ResizeObserver | undefined

onMounted(() => {
  if (!root.value) {
    return
  }

  width.value = root.value.clientWidth

  observer = new ResizeObserver((entries) => {
    width.value = entries[0].contentRect.width
  })
  observer.observe(root.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <div
    ref="root"
    class="cc3-map"
    :class="{ 'cc3-map--dragging': isDragging }"
    :style="{ height: `${height}px` }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <img
      v-for="tile in tiles"
      :key="tile.key"
      :src="tile.url"
      class="cc3-map__tile"
      :style="{ left: `${tile.left}px`, top: `${tile.top}px` }"
      alt=""
      draggable="false"
    />

    <div
      v-for="position in markerPositions"
      :key="position.marker.id"
      class="cc3-map__marker"
      :style="{ left: `${position.left}px`, top: `${position.top}px` }"
      @pointerdown.stop
    >
      <slot name="marker" :marker="position.marker" />
    </div>

    <div class="cc3-map__zoom">
      <button
        type="button"
        class="cc3-map__zoom-button"
        :disabled="isZoomInDisabled"
        :aria-label="text.zoomIn"
        @pointerdown.stop
        @click="changeZoom(1)"
      >
        +
      </button>

      <button
        type="button"
        class="cc3-map__zoom-button"
        :disabled="isZoomOutDisabled"
        :aria-label="text.zoomOut"
        @pointerdown.stop
        @click="changeZoom(-1)"
      >
        −
      </button>
    </div>

    <span class="cc3-map__attribution">{{ attribution }}</span>
  </div>
</template>

<style lang="scss">
.cc3-map {
  position: relative;

  width: 100%;

  background-color: var(--st-content-background-color-neutral-secondary);
  border: 1px solid var(--st-content-border-color-neutral-primary);
  border-radius: var(--st-global-radius-sm);
  overflow: hidden;
  cursor: grab;
  touch-action: none;
  user-select: none;

  &--dragging {
    cursor: grabbing;
  }

  &__tile {
    position: absolute;

    width: 256px;
    height: 256px;

    pointer-events: none;
  }

  &__marker {
    position: absolute;

    pointer-events: none;
    transform: translate(-50%, -100%);
  }

  &__zoom {
    position: absolute;
    right: var(--st-global-distance-space-stack-md);
    bottom: var(--st-global-distance-space-stack-md);

    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  &__zoom-button {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 28px;
    height: 28px;

    font: inherit;
    font-size: 16px;
    line-height: 1;
    color: var(--st-content-foreground-color-neutral-primary);
    background-color: var(--st-content-background-color-neutral-primary);
    border: 1px solid var(--st-content-border-color-neutral-primary);
    border-radius: var(--st-global-radius-sm);
    cursor: pointer;

    &:disabled {
      color: var(--st-content-foreground-color-neutral-tetriary);
      cursor: not-allowed;
    }
  }

  &__attribution {
    position: absolute;
    left: var(--st-global-distance-space-stack-sm);
    bottom: var(--st-global-distance-space-stack-sm);

    padding: 2px 6px;

    @include font('label-xxs');

    color: var(--st-content-foreground-color-neutral-secondary);
    background-color: rgb(255 255 255 / 75%);
    border-radius: 4px;
    pointer-events: none;
  }
}
</style>
