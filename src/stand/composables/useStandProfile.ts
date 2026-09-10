import { computed, ref } from 'vue'
import { autocompleteByKey, defaultTypeByKey } from '../config/types'
import type { CountryCode, FieldKey, StandField, StandProfile } from '../config/types'
import { defaultProfiles } from '../config/profiles'
import { useStand } from './useStand'

/**
 * Профиль респондента — данные, которые в проде приходят из личного кабинета.
 *
 * Заполняется один раз на входе, сразу после выбора страны, и дальше
 * подставляется получателем во все формы доставки. Это и есть проверяемое
 * поведение: получатель по умолчанию — сам покупатель, и вводить его руками
 * не нужно. Пока в формах стояло чужое имя, респондент читал этот блок как
 * обязательный к заполнению и заполнял его заново.
 *
 * Профиль хранится по странам, а не одним объектом: формат телефона, язык
 * имени и почта у каждого рынка свои, и перенос профиля из России в Чехию
 * дал бы в чешской форме русский номер.
 */

const STORAGE_KEY = 'cc3-stand-profile'

type ProfileByCountry = Partial<Record<CountryCode, StandProfile>>

/**
 * Профиль переживает перезагрузку страницы: респондент открывает прототип
 * по ссылке, и если после случайного обновления вкладки его снова просят
 * назваться, сессия ломается на ровном месте. sessionStorage, а не local:
 * это данные одного теста, а не постоянная настройка браузера.
 *
 * Хранилище бывает недоступно (приватное окно, запрет на данные сайтов),
 * поэтому чтение и запись не должны ронять стенд — профиль тогда просто
 * живёт до перезагрузки.
 */
function readStorage(): ProfileByCountry {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)

    return raw ? (JSON.parse(raw) as ProfileByCountry) : {}
  } catch {
    return {}
  }
}

function writeStorage(value: ProfileByCountry) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Хранилище недоступно — профиль остаётся только в памяти.
  }
}

// Профиль общий на всё приложение: его заполняют на входе, а читают формы
// доставки внутри прототипа. Поэтому состояние живёт на модуле.
const savedProfiles = ref<ProfileByCountry>(readStorage())

/** Ключи полей формы профиля — в том же порядке, в каком они показываются. */
const profileFieldKeys: FieldKey[] = [
  'recipientFirstName',
  'recipientLastName',
  'recipientEmail',
  'recipientPhone',
]

export function useStandProfile() {
  const { country, t } = useStand()

  const profile = computed<StandProfile>(
    () => savedProfiles.value[country.value] ?? defaultProfiles[country.value],
  )

  /** Респондент уже прошёл шаг профиля для этой страны. */
  const isProfileFilled = computed(() => Boolean(savedProfiles.value[country.value]))

  function saveProfile(value: StandProfile) {
    savedProfiles.value = { ...savedProfiles.value, [country.value]: value }
    writeStorage(savedProfiles.value)
  }

  const fullName = computed(() =>
    [profile.value.firstName, profile.value.lastName].filter(Boolean).join(' '),
  )

  /**
   * Профиль в виде значений полей получателя.
   *
   * Отдаётся сразу в двух видах имени: на рынках СНГ получатель — одно поле
   * «Имя и фамилия», в Европе и США — два раздельных. Форма берёт те ключи,
   * которые есть в конфиге её страны, лишние просто не рендерятся.
   */
  const recipientValues = computed<Partial<Record<FieldKey, string>>>(() => ({
    recipientName: fullName.value,
    recipientFirstName: profile.value.firstName,
    recipientLastName: profile.value.lastName,
    recipientPhone: profile.value.phone,
    recipientEmail: profile.value.email,
  }))

  /**
   * Поля формы профиля. Собираются так же, как поля адреса — из тех же
   * ключей и того же словаря: подпись «Телефон» и пример ввода должны
   * совпадать с тем, что респондент увидит потом в чекауте.
   */
  const profileFields = computed<StandField[]>(() =>
    profileFieldKeys.map((key) => ({
      key,
      type: defaultTypeByKey[key],
      label: t(`field.${key}.label`),
      placeholder: t(`field.${key}.placeholder`),
      autocomplete: autocompleteByKey[key],
      required: true,
      autofilled: false,
      prefilled: false,
      // Имя и фамилия встают в одну строку — это короткие поля,
      // и на всю ширину форма из четырёх полей выглядит анкетой.
      half: key === 'recipientFirstName' || key === 'recipientLastName',
    })),
  )

  return { profile, isProfileFilled, saveProfile, fullName, recipientValues, profileFields }
}
