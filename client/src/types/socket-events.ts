/**
 * Типы событий Socket.io для синхронизации объектов на карте.
 * Дублируются с сервера для типобезопасности на клиенте.
 */

/**
 * Координаты объекта на карте
 */
export interface ObjectPosition {
  x: number;
  y: number;
}

/**
 * Данные для события обновления позиции объекта
 */
export interface UpdateObjectPayload {
  /** Уникальный идентификатор объекта */
  objectId: string;
  /** Новые координаты объекта */
  position: ObjectPosition;
}

/**
 * Данные для присоединения к комнате
 */
export interface JoinRoomPayload {
  /** UUID комнаты */
  roomId: string;
}

/**
 * Структура объекта в состоянии комнаты
 */
export interface RoomObject {
  id: string;
  x: number;
  y: number;
  type: string;
}

/**
 * События, отправляемые клиентом на сервер
 */
export interface ClientToServerEvents {
  /** Присоединение к комнате */
  join_room: (payload: JoinRoomPayload) => void;
  /** Обновление позиции объекта */
  update_object: (payload: UpdateObjectPayload) => void;
  /** Создание нового объекта */
  create_object: (payload: RoomObject) => void;
  /** Тестовое событие ping */
  ping: () => void;
}

/**
 * События, отправляемые сервером клиенту
 */
export interface ServerToClientEvents {
  /** Broadcast обновления позиции объекта другим участникам */
  object_updated: (payload: UpdateObjectPayload) => void;
  /** Broadcast создания нового объекта */
  object_created: (payload: RoomObject) => void;
  /** Начальное состояние комнаты при подключении */
  room_state: (objects: RoomObject[]) => void;
  /** Тестовое событие pong */
  pong: () => void;
}
