import type { AspectRatio } from '~/src/shared/constants'
export interface ImageModifiers {
  width?: number
  height?: number
  quality?: number
  format?: string
  fit?: 'cover' | 'contain' | 'fill'
  position?: string
}

export interface ImageProps {
  /**
   * URL изображения
   */
  src: string
  /**
   * Alt текст
   */
  alt: string
  /**
   * Соотношение сторон
   * @default AspectRatio.SQUARE
   */
  aspectRatio?: AspectRatio | number
  /**
   * Включить ленивую загрузку
   * @default true
   */
  lazy?: boolean
  /**
   * Размеры для разных брейкпоинтов
   * @example "sm:400px md:250px lg:250px"
   */
  sizes?: string
  /**
   * Модификаторы изображения
   */
  modifiers?: ImageModifiers
  /**
   * CSS классы для контейнера
   */
  className?: string
  /**
   * Качество изображения
   * @default 100
   */
  quality?: number
  /**
   * ID изображения
   */
  id: string | number

  /**
   * Объект-фит
   * @default 'contain'
   */
  objectFit?: 'object-contain' | 'object-cover' | 'object-fill'

  /**
   * Высота изображения
   * @default false
   */
  hAuto?: boolean
}
