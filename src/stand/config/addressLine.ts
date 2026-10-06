import type { CountryCode, FieldKey } from './types'

/**
 * Строка адреса для карточки сохранённого адреса.
 *
 * Карточки из адресной книги приходят с готовой строкой — там индекс, город
 * и штат уже проставлены руками (см. addresses.ts). А адрес, который человек
 * только что создал сам, собирается здесь из полей формы, и до этой функции
 * в карточке оставалась одна улица: «350 5th Ave» вместо «350 5th Ave, New
 * York, NY 10118». Респондент, проверяя себя перед оплатой, видел адрес без
 * индекса и возвращался в форму убедиться, что его не потеряли.
 *
 * Порядок частей — местный, как и у карточек в книге: в СНГ индекс в конце,
 * в Европе перед городом, в США после кода штата. Чужой формат собственного
 * адреса читается как ошибка ввода.
 *
 * Дом идёт сразу за улицей: там, где он вынесен отдельным полем, в самой
 * строке улицы его больше нет.
 *
 * Части, которых в форме этой страны нет или которые человек не заполнил,
 * выпадают. Часть, которая уже встречается в строке улицы, тоже выпадает:
 * подсказка адреса кладёт в поле улицы полную строку с городом, и повторять
 * его за ней незачем.
 */
export function composeAddressLine(
  country: CountryCode,
  values: Partial<Record<FieldKey, string>>,
): string {
  const street = values.street?.trim() ?? ''
  const house = values.house?.trim() ?? ''
  const city = values.city?.trim() ?? ''
  const region = values.region?.trim() ?? ''
  const postal = values.postal?.trim() ?? ''

  const isNew = (part: string) => part !== '' && !street.toLowerCase().includes(part.toLowerCase())

  // Дом вынесен отдельным полем там, где он есть в форме, — в строке улицы
  // его нет, и в карточку он возвращается здесь.
  const head = [street, house].filter(Boolean).join(', ')

  const tail: string[] = []

  if (country === 'us') {
    if (isNew(city)) tail.push(city)

    const stateZip = [region, postal].filter(isNew).join(' ')

    if (stateZip) tail.push(stateZip)
  } else if (country === 'de' || country === 'pl' || country === 'cz') {
    const zipCity = [postal, city].filter(isNew).join(' ')

    if (zipCity) tail.push(zipCity)
  } else {
    if (isNew(city)) tail.push(city)
    if (isNew(postal)) tail.push(postal)
  }

  return [head, ...tail].filter(Boolean).join(', ')
}

/**
 * Вторая строка карточки адреса: квартира, подъезд, домофон, этаж.
 *
 * Человек вводит эти поля в форме, а в чекауте их не было вообще — карточка
 * показывала одну улицу. Респондент, который только что набрал код домофона,
 * не находил его на экране и возвращался в форму проверять, сохранилось ли.
 *
 * Порядок как в карточке Озона: квартира, подъезд, домофон, этаж. Поля,
 * которых в форме этой страны нет или которые человек не заполнил, выпадают;
 * пустая строка не рисуется вовсе.
 *
 * Подпись к номеру квартиры добавляется только в СНГ, где поле так и
 * называется «Квартира» и человек вводит в него одно число. В США и Европе
 * поле описательное («Wohnung, Etage usw.», «Apartment, suite, etc.»), и
 * человек вводит туда готовую формулировку — «Apt 21B», «3. OG», «byt 9».
 * Подпись к ней дала бы «byt byt 9».
 */
const APARTMENT_LABEL_COUNTRIES: CountryCode[] = ['ru', 'kz']

export function composeAddressExtras(
  country: CountryCode,
  values: Partial<Record<FieldKey, string>> | undefined,
  translate: (key: string, params?: Record<string, string>) => string,
): string {
  if (!values) {
    return ''
  }

  const parts: string[] = []

  const push = (key: FieldKey, labelKey: string) => {
    const value = values[key]?.trim()

    if (!value) {
      return
    }

    const isBareApartment =
      key === 'apartment' && !APARTMENT_LABEL_COUNTRIES.includes(country)

    parts.push(isBareApartment ? value : translate(labelKey, { value }))
  }

  push('apartment', 'address.part.apartment')
  push('entrance', 'address.part.entrance')
  push('intercom', 'address.part.intercom')
  push('floor', 'address.part.floor')

  return parts.join(', ')
}
