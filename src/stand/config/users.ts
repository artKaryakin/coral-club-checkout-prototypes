/**
 * Тип пользователя — вторая ось стенда.
 *
 * Заменяет прежний список юз-кейсов: для сравнения концептов важно ровно
 * одно различие в стартовом состоянии — есть ли у человека сохранённые
 * адреса. Всё остальное (какой именно адрес выбран, что пошло не так)
 * задаёт модератор голосом по ходу сессии, а не ссылкой.
 */
export type UserType = 'new' | 'saved'

export const userTypes: UserType[] = ['new', 'saved']

export const defaultUser: UserType = 'new'

export function isUserType(value: string | undefined): value is UserType {
  return userTypes.includes(value as UserType)
}

/**
 * Прежняя схема адреса #/{variant}/{profile} и #/{variant}/{country}/{case}.
 * Ссылки лежат в закладках и в переписке, поэтому вместо пустого экрана
 * открывается ближайший по смыслу тип пользователя.
 *
 * Кейсы, где адресная книга была не пуста (savedAddresses > 0), ведут
 * на saved, остальные — на new.
 */
export const legacyUserAliases: Record<string, UserType> = {
  new: 'new',
  returning: 'saved',
  'UC-01': 'new',
  'UC-02': 'new',
  'UC-03': 'new',
  'UC-04': 'new',
  'UC-05': 'saved',
  'UC-06': 'saved',
  'UC-07': 'saved',
  'UC-08': 'saved',
  'UC-09': 'saved',
  'UC-10': 'saved',
  'UC-11': 'saved',
  'UC-12': 'new',
  'UC-13': 'saved',
}
