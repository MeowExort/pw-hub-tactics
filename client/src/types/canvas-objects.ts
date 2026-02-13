/**
 * Типы объектов на холсте для инструментов рисования.
 * Каждый тип объекта имеет свои специфичные свойства.
 */

/**
 * Базовый интерфейс для всех объектов на холсте.
 * Содержит общие свойства: идентификатор, позиция, тип.
 */
export interface BaseCanvasObject {
  /** Уникальный идентификатор объекта */
  id: string;
  /** Тип объекта для дискриминации */
  type: CanvasObjectType;
  /** Координата X левого верхнего угла или центра */
  x: number;
  /** Координата Y левого верхнего угла или центра */
  y: number;
}

/**
 * Перечисление всех типов объектов на холсте.
 * Используется для дискриминации union-типа CanvasObject.
 */
export type CanvasObjectType = 
  | 'pencil'      // Свободное рисование карандашом
  | 'line'        // Прямая линия
  | 'circle'      // Круг
  | 'rectangle'   // Прямоугольник
  | 'text'        // Текстовая метка
  | 'catapult';   // Существующий тип (катапульта)

/**
 * Объект "Карандаш" - свободное рисование.
 * Хранит массив точек, через которые проходит линия.
 */
export interface PencilObject extends BaseCanvasObject {
  type: 'pencil';
  /** Массив точек линии [x1, y1, x2, y2, ...] */
  points: number[];
  /** Цвет линии */
  stroke: string;
  /** Толщина линии */
  strokeWidth: number;
}

/**
 * Объект "Линия" - прямая линия между двумя точками.
 */
export interface LineObject extends BaseCanvasObject {
  type: 'line';
  /** Массив точек [x1, y1, x2, y2] */
  points: number[];
  /** Цвет линии */
  stroke: string;
  /** Толщина линии */
  strokeWidth: number;
}

/**
 * Объект "Круг".
 * x, y - координаты центра.
 */
export interface CircleObject extends BaseCanvasObject {
  type: 'circle';
  /** Радиус круга */
  radius: number;
  /** Цвет заливки */
  fill: string;
  /** Цвет обводки */
  stroke: string;
  /** Толщина обводки */
  strokeWidth: number;
}

/**
 * Объект "Прямоугольник".
 * x, y - координаты левого верхнего угла.
 */
export interface RectangleObject extends BaseCanvasObject {
  type: 'rectangle';
  /** Ширина прямоугольника */
  width: number;
  /** Высота прямоугольника */
  height: number;
  /** Цвет заливки */
  fill: string;
  /** Цвет обводки */
  stroke: string;
  /** Толщина обводки */
  strokeWidth: number;
}

/**
 * Объект "Текстовая метка".
 * x, y - координаты начала текста.
 */
export interface TextObject extends BaseCanvasObject {
  type: 'text';
  /** Текст метки */
  text: string;
  /** Размер шрифта */
  fontSize: number;
  /** Цвет текста */
  fill: string;
}

/**
 * Объект "Катапульта" - существующий тип для совместимости.
 */
export interface CatapultObject extends BaseCanvasObject {
  type: 'catapult';
}

/**
 * Union-тип всех объектов на холсте.
 * Позволяет TypeScript различать объекты по полю type.
 */
export type CanvasObject = 
  | PencilObject 
  | LineObject 
  | CircleObject 
  | RectangleObject 
  | TextObject
  | CatapultObject;

/**
 * Тип инструмента рисования.
 * Определяет текущий режим работы с холстом.
 */
export type DrawingTool = 
  | 'select'      // Выбор и перемещение объектов
  | 'pencil'      // Свободное рисование
  | 'line'        // Рисование линии
  | 'circle'      // Рисование круга
  | 'rectangle'   // Рисование прямоугольника
  | 'text'        // Добавление текста
  | 'eraser';     // Ластик для удаления объектов

/**
 * Настройки инструмента рисования.
 */
export interface DrawingSettings {
  /** Цвет линии/обводки */
  strokeColor: string;
  /** Цвет заливки */
  fillColor: string;
  /** Толщина линии */
  strokeWidth: number;
  /** Размер шрифта для текста */
  fontSize: number;
}

/**
 * Настройки по умолчанию для инструментов рисования.
 */
export const DEFAULT_DRAWING_SETTINGS: DrawingSettings = {
  strokeColor: '#ff0000',
  fillColor: 'transparent',
  strokeWidth: 3,
  fontSize: 16,
};
