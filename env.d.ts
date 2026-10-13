/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * API-ключ «Дадаты» для подсказок адресов по России.
   *
   * В репозитории его нет: берётся из .env.local при локальной работе и из
   * секрета репозитория при сборке на GitHub Pages (см. .env.example).
   * Без ключа Россия работает на запасном провайдере.
   *
   * Это именно API-ключ, не секретный: секретный нужен только серверной
   * «Стандартизации» и в браузер не попадает никогда.
   */
  readonly VITE_DADATA_TOKEN?: string

  /**
   * API-ключ Geoapify для подсказок адресов на остальных рынках.
   *
   * Берётся оттуда же, откуда ключ «Дадаты»: .env.local локально, секрет
   * репозитория при сборке. Без ключа рынки работают на Photon.
   */
  readonly VITE_GEOAPIFY_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
