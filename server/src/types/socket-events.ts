/**
 * Типы событий Socket.io для синхронизации объектов на карте.
 * Используются как на сервере, так и на клиенте для типобезопасности.
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
 * Состояние комнаты, хранящееся в памяти сервера
 */
export interface RoomState {
  /** UUID комнаты */
  roomId: string;
  /** Объекты на карте */
  objects: Map<string, RoomObject>;
}

/**
 * Данные для удаления объекта
 */
export interface DeleteObjectPayload {
  /** ID объекта для удаления */
  objectId: string;
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
  /** Удаление объекта */
  delete_object: (payload: DeleteObjectPayload) => void;
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
  /** Broadcast удаления объекта */
  object_deleted: (payload: DeleteObjectPayload) => void;
  /** Начальное состояние комнаты при подключении */
  room_state: (objects: RoomObject[]) => void;
  /** Тестовое событие pong */
  pong: () => void;
}

/**
 * Данные сокета (для хранения информации о подключении)
 */
export interface SocketData {
  /** ID комнаты, к которой подключен пользователь */
  roomId?: string;
}
