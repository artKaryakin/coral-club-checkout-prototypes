import type { CountryCode, LocaleCode } from '../config/types'
import ru from './ru'
import en from './en'
import de from './de'
import pl from './pl'
import cs from './cs'

export type Dictionary = Record<string, string>

export const dictionaries: Record<LocaleCode, Dictionary> = { ru, en, de, pl, cs }

export const localeCodes = Object.keys(dictionaries) as LocaleCode[]

export function isLocale(value: string | undefined): value is LocaleCode {
  return localeCodes.includes(value as LocaleCode)
}

/**
 * Перевод с учётом страны.
 *
 * Сначала ищется ключ с суффиксом страны (`field.postal.label@us`), затем
 * общий. Это позволяет одной локали обслуживать несколько рынков: в США
 * поле называется ZIP code, в остальных англоязычных — Postcode, но форма
 * при этом остаётся одна.
 */
export function translate(
  locale: LocaleCode,
  country: CountryCode,
  key: string,
  params?: Record<string, string | number>,
): string {
  const dictionary = dictionaries[locale] ?? dictionaries.en
  const template = dictionary[`${key}@${country}`] ?? dictionary[key] ?? key

  if (!params) {
    return template
  }

  // Подстановка вида {count}, {amount}, {name}. Достаточно для чекаута:
  // склонений по числу в текстах нет, суммы и коды приходят уже готовыми
  // строками из формата валюты.
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}
