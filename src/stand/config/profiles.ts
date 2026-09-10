import type { CountryCode, StandProfile } from './types'

/**
 * Профиль по умолчанию для каждой страны.
 *
 * Используется в двух случаях: когда модератор открыл прототип полной
 * ссылкой и шаг с профилем не проходил, и как заготовка в самой форме
 * профиля — пустую форму на входе респондент заполняет дольше, чем
 * правит подставленное.
 *
 * Данные совпадают с владельцем адресной книги той же страны
 * (см. addresses.ts): в сохранённых адресах указан тот же человек,
 * иначе на карточках стоит одно имя, а в новой форме подставляется
 * другое, и это выглядит как ошибка прототипа.
 *
 * Почты доменные example.com и телефоны из зарезервированных диапазонов —
 * на стенде их видит посторонний человек, настоящих контактов здесь быть
 * не должно.
 */
export const defaultProfiles: Record<CountryCode, StandProfile> = {
  ru: {
    firstName: 'Иван',
    lastName: 'Иванов',
    email: 'qa.auto.checkout+ru@example.com',
    phone: '+7 999 111-22-33',
  },

  kz: {
    firstName: 'Данияр',
    lastName: 'Ахметов',
    email: 'qa.auto.checkout+kz@example.com',
    phone: '+7 701 111-22-33',
  },

  de: {
    firstName: 'Anna',
    lastName: 'Schmidt',
    email: 'qa.auto.checkout+de@example.com',
    phone: '+49 151 1112233',
  },

  pl: {
    firstName: 'Anna',
    lastName: 'Kowalska',
    email: 'qa.auto.checkout+pl@example.com',
    phone: '+48 501 111 222',
  },

  cz: {
    firstName: 'Jana',
    lastName: 'Nováková',
    email: 'qa.auto.checkout+cz@example.com',
    phone: '+420 601 111 222',
  },

  us: {
    firstName: 'John',
    lastName: 'Miller',
    email: 'qa.auto.checkout+us@example.com',
    phone: '+1 212 111 2233',
  },
}
