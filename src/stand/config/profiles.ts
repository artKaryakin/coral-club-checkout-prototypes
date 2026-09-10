import type { CountryCode, StandProfile } from './types'

/**
 * Профиль по умолчанию для каждой страны.
 *
 * Нужен, когда прототип открыли полной ссылкой и шаг с профилем не
 * проходили: получатель всё равно должен быть заполнен, иначе форма
 * доставки выглядит иначе, чем у респондента, прошедшего вход целиком.
 * Сама форма профиля этими значениями не заполняется — там респондент
 * вводит свои данные руками, и именно поэтому потом замечает, что дальше
 * они подставились сами.
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
/**
 * Данные для кнопки «Тест-данные» на экране профиля.
 *
 * Кнопка для нас, а не для респондента: она нужна, чтобы прогнать сценарий
 * целиком и не набирать четыре поля каждый раз. Значения намеренно
 * ненастоящие и одинаковые во всех странах — в журнале прохождений
 * тестовый прогон должен отличаться от боевого с одного взгляда.
 */
export const testProfile: StandProfile = {
  firstName: 'Test',
  lastName: 'Test',
  email: 'test@test.net',
  phone: '89999999999',
}

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
