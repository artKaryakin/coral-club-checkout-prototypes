# Ядро стенда

Зона PM. Дизайн вариантов интерфейса сюда не заходит — см. `docs/STAND.md`.

```
config/
  types.ts        типы полей, карта autocomplete-атрибутов
  countries.ts    набор и ПОРЯДОК полей по странам
  cases.ts        стартовые состояния под usability-кейсы
i18n/
  ru en de pl cs  словари; ключ с суффиксом @us переопределяет термин для рынка
  index.ts        translate(locale, country, key)
composables/
  useStand.ts       оси variant × country × case × locale, чтение из URL
  useStandFields.ts готовый список полей для варианта интерфейса
components/
  Cc3StandField.vue универсальное поле формы
```

## Как вариант интерфейса использует ядро

```vue
<template>
  <div class="cc3-inline-address-form">
    <Cc3StandField
      v-for="field in fields"
      :key="field.key"
      v-model="values[field.key]"
      :field="field"
      class="cc3-inline-address-form__field"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import Cc3StandField from '@/stand/components/Cc3StandField.vue'
import { useStandFields } from '@/stand/composables/useStandFields'

const { fields } = useStandFields('address')
const values = reactive<Record<string, string>>({})
</script>
```

Оформление обёртки, сетка, отступы и внешний вид поля — зона дизайна.
Состав и порядок полей приходят из конфига.

## Ссылки

```
#/inline/us/UC-03            инлайн, США, ввод своего адреса
#/modal/de/UC-07             модальный, Германия, добавление при трёх сохранённых
#/prod/ru/UC-01              контроль, Россия, пустая книга
#/inline/de/UC-03?locale=en  та же форма, но на английском
#/modal/ru/UC-05?debug=1     с панелью модератора
```

## Что осталось сделать

- `usePickupPoints` и `useAddressSuggest` с обязательным мок-режимом:
  при недоступности провайдера отдаётся фиксированный набор подсказок,
  чтобы сессия не срывалась.
- Панель модератора `Cc3StandPanel` и вкладка кейсов `Cc3StandCases` за `?debug=1`.
- Фикстуры адресов под `savedAddresses` из `cases.ts`.
- Полный список штатов США в `countries.us.regions`.
- Заменить `Cc3CheckoutCity.vue` на поле из конфига — это последний хардкод,
  который мешает переключать страны.
