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
/**
 * Класс для управления состоянием комнат
 */
export class RoomManager {
    /** Хранилище состояний комнат: roomId -> RoomState */
    rooms = new Map();
    /**
     * Получает или создает комнату по ID
     * @param roomId UUID комнаты
     * @returns Состояние комнаты
     */
    getOrCreateRoom(roomId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, {
                roomId,
                objects: new Map(),
            });
        }
        return this.rooms.get(roomId);
    }
    /**
     * Добавляет объект в комнату
     * @param roomId UUID комнаты
     * @param object Объект для добавления
     */
    addObject(roomId, object) {
        const room = this.getOrCreateRoom(roomId);
        room.objects.set(object.id, object);
    }
    /**
     * Обновляет позицию объекта в комнате
     * @param roomId UUID комнаты
     * @param objectId ID объекта
     * @param position Новые координаты
     * @returns true если объект найден и обновлен, false иначе
     */
    updateObjectPosition(roomId, objectId, position) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        const object = room.objects.get(objectId);
        if (!object)
            return false;
        object.x = position.x;
        object.y = position.y;
        return true;
    }
    /**
     * Получает все объекты комнаты в виде массива
     * @param roomId UUID комнаты
     * @returns Массив объектов или пустой массив
     */
    getRoomObjects(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return [];
        return Array.from(room.objects.values());
    }
    /**
     * Удаляет комнату (для очистки памяти)
     * @param roomId UUID комнаты
     */
    deleteRoom(roomId) {
        this.rooms.delete(roomId);
    }
    /**
     * Проверяет существование комнаты
     * @param roomId UUID комнаты
     */
    hasRoom(roomId) {
        return this.rooms.has(roomId);
    }
}
/** Singleton экземпляр менеджера комнат */
export const roomManager = new RoomManager();
//# sourceMappingURL=RoomManager.js.map