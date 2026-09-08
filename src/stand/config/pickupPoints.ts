import type { CountryCode, StandPickupPoint } from './types'

/**
 * Пункты выдачи по странам.
 *
 * Данные — зона PM, визуал карты и карточки — зона дизайна. Службы взяты
 * настоящие для каждого рынка: респондент должен узнавать название, иначе
 * выбор пункта проверяется в вакууме. Координаты приблизительные, они нужны
 * только чтобы точки не легли в одну кучу на карте.
 *
 * У каждой страны минимум два пункта службы доставки и один офис компании —
 * ровно то, что лежит в адресной книге у пользователя с сохранёнными
 * адресами (см. addresses.ts).
 */
export const pickupPoints: Record<CountryCode, StandPickupPoint[]> = {
  ru: [
    {
      id: 'ru-office-horoshevskoe',
      provider: 'office',
      address: 'Москва, Хорошевское шоссе, 32к2',
      price: 0,
      code: '11ВЭ',
      phone: '+7 495 797-42-81',
      lat: 55.7789,
      lng: 37.5232,
    },
    {
      id: 'ru-cdek-vinogradova',
      provider: 'cdek',
      address: 'Москва, ул. Академика Виноградова, 5',
      price: 0,
      code: 'MSK112',
      phone: '+7 495 797-42-81',
      lat: 55.6156,
      lng: 37.4938,
    },
    {
      id: 'ru-fivepost-varshavskoe',
      provider: 'fivepost',
      address: 'Москва, Варшавское шоссе, 132',
      price: 0,
      code: 'MSK408',
      phone: '+7 495 797-42-81',
      lat: 55.6072,
      lng: 37.6091,
    },
  ],

  kz: [
    {
      id: 'kz-office-alfarabi',
      provider: 'office',
      address: 'Алматы, пр. Аль-Фараби, 77/7',
      price: 0,
      code: 'ALA01',
      phone: '+7 727 355-44-00',
      lat: 43.2201,
      lng: 76.9286,
    },
    {
      id: 'kz-cdek-raiymbek',
      provider: 'cdek',
      address: 'Алматы, пр. Райымбека, 212',
      price: 0,
      code: 'ALA114',
      phone: '+7 727 355-44-00',
      lat: 43.2755,
      lng: 76.8512,
    },
    {
      id: 'kz-kazpost-bogenbay',
      provider: 'kazpost',
      address: 'Алматы, ул. Богенбай батыра, 132',
      price: 0,
      code: '050000',
      phone: '+7 727 355-44-00',
      lat: 43.2612,
      lng: 76.9435,
    },
  ],

  de: [
    {
      id: 'de-office-kurfuerstendamm',
      provider: 'office',
      address: 'Kurfürstendamm 194, 10707 Berlin',
      price: 0,
      code: 'BER01',
      phone: '+49 30 5679 4281',
      lat: 52.5024,
      lng: 13.3243,
    },
    {
      id: 'de-dhl-packstation-128',
      provider: 'dhl',
      address: 'Prenzlauer Allee 90, 10409 Berlin',
      price: 0,
      code: '128',
      phone: '+49 228 4333112',
      lat: 52.5389,
      lng: 13.4249,
    },
    {
      id: 'de-dhl-packstation-215',
      provider: 'dhl',
      address: 'Danziger Straße 12, 10435 Berlin',
      price: 0,
      code: '215',
      phone: '+49 228 4333112',
      lat: 52.5401,
      lng: 13.4109,
    },
  ],

  pl: [
    {
      id: 'pl-office-domaniewska',
      provider: 'office',
      address: 'ul. Domaniewska 37, 02-672 Warszawa',
      price: 0,
      code: 'WAW01',
      phone: '+48 22 567 42 81',
      lat: 52.1826,
      lng: 21.0009,
    },
    {
      id: 'pl-inpost-waw01m',
      provider: 'inpost',
      address: 'ul. Nowogrodzka 50, 00-695 Warszawa',
      price: 0,
      code: 'WAW01M',
      phone: '+48 722 444 000',
      lat: 52.2277,
      lng: 21.0091,
    },
    {
      id: 'pl-inpost-waw42a',
      provider: 'inpost',
      address: 'ul. Grójecka 194, 02-390 Warszawa',
      price: 0,
      code: 'WAW42A',
      phone: '+48 722 444 000',
      lat: 52.2149,
      lng: 20.9635,
    },
  ],

  cz: [
    {
      id: 'cz-office-naprikope',
      provider: 'office',
      address: 'Na Příkopě 22, 110 00 Praha 1',
      price: 0,
      code: 'PRG01',
      phone: '+420 234 567 428',
      lat: 50.0855,
      lng: 14.4270,
    },
    {
      id: 'cz-zasilkovna-belehradska',
      provider: 'zasilkovna',
      address: 'Bělehradská 45, 120 00 Praha 2',
      price: 0,
      code: '1043',
      phone: '+420 216 216 516',
      lat: 50.0755,
      lng: 14.4363,
    },
    {
      id: 'cz-zasilkovna-ceskomoravska',
      provider: 'zasilkovna',
      address: 'Českomoravská 2420, 190 00 Praha 9',
      price: 0,
      code: '2812',
      phone: '+420 216 216 516',
      lat: 50.1053,
      lng: 14.4926,
    },
  ],

  us: [
    {
      id: 'us-office-sixth-avenue',
      provider: 'office',
      address: '1120 Avenue of the Americas, New York, NY 10036',
      price: 0,
      code: 'NYC01',
      phone: '+1 212 567 4281',
      lat: 40.7566,
      lng: -73.9822,
    },
    {
      id: 'us-usps-farley',
      provider: 'usps',
      address: '421 8th Ave, New York, NY 10001',
      price: 0,
      code: '10001',
      phone: '+1 800 275 8777',
      lat: 40.7515,
      lng: -73.9971,
    },
    {
      id: 'us-usps-cooper',
      provider: 'usps',
      address: '93 4th Ave, New York, NY 10003',
      price: 0,
      code: '10003',
      phone: '+1 800 275 8777',
      lat: 40.7305,
      lng: -73.9905,
    },
  ],
}
