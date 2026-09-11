/**
 * Приёмник журнала прохождений для Google-таблицы.
 *
 * Как подключить:
 *
 *  1. Создать таблицу, Расширения → Apps Script.
 *  2. Вставить этот код, сохранить.
 *  3. Развернуть → Новое развёртывание → тип «Веб-приложение»,
 *     «Запускать от имени: я», «У кого есть доступ: все».
 *  4. Скопировать адрес вида https://script.google.com/macros/s/…/exec
 *     и положить его в сборку стенда переменной VITE_STAND_LOG_URL
 *     (или в константу FALLBACK_LOG_URL в src/stand/config/logging.ts —
 *     но тогда адрес окажется в публичном репозитории, и писать в таблицу
 *     сможет любой, кто откроет исходники).
 *
 * Заголовок пишется один раз, при первой строке. Если таблица пустая,
 * настраивать в ней ничего не нужно.
 */

var HEADER = [
  'Старт',
  'Финиш',
  'Длительность, мс',
  'Длительность, с',
  'Страна',
  'Тип пользователя',
  'Версия',
  'Язык',
  'Имя',
  'Фамилия',
  'Почта',
  'Телефон',
  'Номер заказа',
  'Тестовый прогон',
]

function doPost(e) {
  var lock = LockService.getScriptLock()

  // Две вкладки могут закончить прохождение одновременно — без блокировки
  // строки налезут друг на друга.
  lock.waitLock(30000)

  try {
    var run = JSON.parse(e.postData.contents)
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADER)
      sheet.getRange(1, 1, 1, HEADER.length).setFontWeight('bold')
      sheet.setFrozenRows(1)
    }

    sheet.appendRow([
      run.startedAt,
      run.finishedAt,
      run.durationMs,
      Math.round(run.durationMs / 1000),
      run.country,
      run.user,
      run.variant,
      run.locale,
      run.firstName,
      run.lastName,
      run.email,
      run.phone,
      run.orderNumber,
      run.isTest ? 'да' : 'нет',
    ])

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
      ContentService.MimeType.JSON,
    )
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(error) }),
    ).setMimeType(ContentService.MimeType.JSON)
  } finally {
    lock.releaseLock()
  }
}
