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
  const city = values.city?.trim() ?? ''
  const region = values.region?.trim() ?? ''
  const postal = values.postal?.trim() ?? ''

  const isNew = (part: string) => part !== '' && !street.toLowerCase().includes(part.toLowerCase())

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

  return [street, ...tail].filter(Boolean).join(', ')
}
