/**
 * Менеджер комнат для хранения состояния объектов на карте.
 *
 * Архитектура:
 * - Каждая комната идентифицируется UUID из URL
 * - Состояние хранится в памяти (Map)
 * - При обновлении позиции объекта, изменения сохраняются и рассылаются участникам
 *
 * Ограничения:
 * - Данные теряются при перезапуске сервера (in-memory storage)
 * - Не подходит для горизонтального масштабирования без Redis
 */
import type { RoomState, RoomObject, ObjectPosition } from '../types/socket-events.js';
/**
 * Класс для управления состоянием комнат
 */
export declare class RoomManager {
    /** Хранилище состояний комнат: roomId -> RoomState */
    private rooms;
    /**
     * Получает или создает комнату по ID
     * @param roomId UUID комнаты
     * @returns Состояние комнаты
     */
    getOrCreateRoom(roomId: string): RoomState;
    /**
     * Добавляет объект в комнату
     * @param roomId UUID комнаты
     * @param object Объект для добавления
     */
    addObject(roomId: string, object: RoomObject): void;
    /**
     * Обновляет позицию объекта в комнате
     * @param roomId UUID комнаты
     * @param objectId ID объекта
     * @param position Новые координаты
     * @returns true если объект найден и обновлен, false иначе
     */
    updateObjectPosition(roomId: string, objectId: string, position: ObjectPosition): boolean;
    /**
     * Получает все объекты комнаты в виде массива
     * @param roomId UUID комнаты
     * @returns Массив объектов или пустой массив
     */
    getRoomObjects(roomId: string): RoomObject[];
    /**
     * Удаляет комнату (для очистки памяти)
     * @param roomId UUID комнаты
     */
    deleteRoom(roomId: string): void;
    /**
     * Проверяет существование комнаты
     * @param roomId UUID комнаты
     */
    hasRoom(roomId: string): boolean;
}
/** Singleton экземпляр менеджера комнат */
export declare const roomManager: RoomManager;
//# sourceMappingURL=RoomManager.d.ts.map