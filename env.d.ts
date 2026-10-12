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
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
