/**
 * Типы данных для системы отрядов (Squad) и выделения персонажей (Detachment).
 * 
 * Архитектура:
 * - Squad (Отряд) - группа персонажей, отображается как единая иконка на карте
 * - Character (Персонаж) - член отряда с классом и никнеймом
 * - Detachment (Выделение) - персонаж, временно "вытащенный" из отряда на карту
 * 
 * Связи:
 * - Отряд содержит массив персонажей (characters)
 * - Выделенный персонаж хранит ссылку на родительский отряд (parentSquadId)
 * - Визуальная связь отображается пунктирной линией между отрядом и выделением
 */

/**
 * Классы персонажей в игре Perfect World.
 * Используются для отображения соответствующих иконок.
 */
export type CharacterClass = 
  | 'warrior'      // Воин
  | 'mage'         // Маг
  | 'archer'       // Лучник  
  | 'cleric'       // Жрец
  | 'barbarian'    // Варвар
  | 'venomancer'   // Друид
  | 'assassin'     // Убийца
  | 'psychic'      // Мистик
  | 'seeker'       // Страж
  | 'mystic'       // Шаман
  | 'duskblade'    // Призрак
  | 'stormbringer' // Штормовод
  | 'technician';  // Техник

/**
 * Персонаж в составе отряда
 */
export interface Character {
  /** Уникальный идентификатор персонажа */
  id: string;
  /** Игровой никнейм */
  nickname: string;
  /** Класс персонажа */
  characterClass: CharacterClass;
}

/**
 * Отряд - группа персонажей на карте
 */
export interface Squad {
  /** Уникальный идентификатор отряда */
  id: string;
  /** Название отряда (опционально) */
  name?: string;
  /** Позиция отряда на карте */
  x: number;
  y: number;
  /** Список персонажей в отряде */
  characters: Character[];
  /** Цвет отряда для визуального различия */
  color: string;
}

/**
 * Выделенный персонаж - временно отделён от отряда.
 * Отображается отдельной иконкой с пунктирной связью к родительскому отряду.
 */
export interface Detachment {
  /** Уникальный идентификатор выделения */
  id: string;
  /** ID родительского отряда */
  parentSquadId: string;
  /** ID персонажа из отряда */
  characterId: string;
  /** Позиция выделенного персонажа на карте */
  x: number;
  y: number;
}

/**
 * Полное состояние отрядов в комнате
 */
export interface SquadState {
  /** Все отряды в комнате */
  squads: Squad[];
  /** Все выделенные персонажи */
  detachments: Detachment[];
}

/**
 * Payload для создания выделения персонажа
 */
export interface CreateDetachmentPayload {
  /** ID отряда, из которого выделяется персонаж */
  squadId: string;
  /** ID персонажа для выделения */
  characterId: string;
  /** Начальная позиция выделения на карте */
  x: number;
  y: number;
}

/**
 * Payload для возврата персонажа в отряд
 */
export interface ReturnToSquadPayload {
  /** ID выделения для возврата */
  detachmentId: string;
}

/**
 * Payload для обновления позиции выделения
 */
export interface UpdateDetachmentPositionPayload {
  /** ID выделения */
  detachmentId: string;
  /** Новая позиция */
  x: number;
  y: number;
}

/**
 * Payload для обновления позиции отряда
 */
export interface UpdateSquadPositionPayload {
  /** ID отряда */
  squadId: string;
  /** Новая позиция */
  x: number;
  y: number;
}
