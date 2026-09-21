import type { FieldKey } from '@/stand/config/types'

export type DeliveryProfileMethod = 'courier' | 'pickup'

/**
 * Одна карточка адресной книги — общий тип для секции доставки,
 * диалога курьер/ПВЗ (создаёт профиль по кнопке Continue) и самой
 * адресной книги (хранит и показывает список профилей).
 */
export type DeliveryProfile = {
  id: string
  method: DeliveryProfileMethod

  /**
   * Значения полей адреса по ключам конфига страны. Нужны, чтобы форма
   * редактирования открывалась заполненной — состав полей у каждой страны
   * свой, поэтому не отдельные поля, а словарь.
   */
  fields?: Partial<Record<FieldKey, string>>

  /**
   * Подпись типа над именем: «Courier», «Office», «SDEK» и т.п.
   */
  typeLabel: string

  name: string
  addressLine: string

  /**
   * Строка со сроком/стоимостью, как в карточке — например
   * «Courier, 1-2 days, 149.00 ₽» или «2-3 business days, Free».
   */
  priceLabel: string

  isFavorite: boolean

  /**
   * Телефон/email получателя — только чтобы редактирование (кнопка-карандаш
   * в адресной книге) открывало форму адреса с реально теми же значениями,
   * а не общими демо-заглушками.
   */
  phone: string
  email: string
}
