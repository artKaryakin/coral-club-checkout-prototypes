# Типографическая шкала

> Скрин со шкалой (Inter) прислан в чате 2026-08-23 — сохрани сам файл сюда
> же, в эту папку, я его не получаю как файл, только вижу в переписке.

Значения перенесены в код: [`src/styles/_typography.scss`](../../../src/styles/_typography.scss),
миксин `@include font('label-md')`.

По всему проекту теперь используются только эти 15 стилей — руками
`font-size`/`font-weight`/`line-height` больше нигде не выставляются.

| Токен | Начертание | Размер / межстрочный |
| --- | --- | --- |
| `label-lg` | Inter Medium | 18px / 24px |
| `label-md` | Inter Medium | 16px / 20px |
| `label-sm` | Inter Medium | 14px / 16px |
| `label-xs` | Inter Medium | 13px / 16px |
| `label-xxs` | Inter Medium | 12px / 16px |
| `body-lg` | Inter Regular | 18px / 28px |
| `body-md` | Inter Regular | 16px / 24px |
| `body-sm` | Inter Regular | 14px / 20px |
| `body-xs` | Inter Regular | 13px / 20px |
| `heading-md` | Inter Semi Bold | 32px / 40px |
| `heading-xs` | Inter Semi Bold | 24px / 32px |
| `heading-xxs` | Inter Semi Bold | 20px / 28px |
| `strikethrough-sm` | Inter Medium | 14px / 16px, зачёркнутый |
| `strikethrough-xs` | Inter Medium | 13px / 16px, зачёркнутый |
| `display-xl` | Inter Semi Bold | 88px / 88px |

**Важно:** в шкале нет начертания 700 (Bold) — только 400/500/600. Там, где
в проекте раньше стоял `font-weight: 700`, я заменила на ближайший
подходящий токен по смыслу (заголовок → `heading-*`, мелкий акцент →
`label-*`). Это единственная содержательная неточность при переносе — если
у тебя где-то в макетах реально нужен Bold 700, а не Semi Bold 600, скажи,
это будет новый токен, не подмена существующего.
