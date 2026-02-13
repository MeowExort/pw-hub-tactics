/**
 * Тесты для RoomManager - менеджера состояния комнат
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from './RoomManager.js';

describe('RoomManager', () => {
  let manager: RoomManager;

  beforeEach(() => {
    manager = new RoomManager();
  });

  describe('getOrCreateRoom', () => {
    it('должен создавать новую комнату если она не существует', () => {
      const roomId = 'test-room-123';
      const room = manager.getOrCreateRoom(roomId);

      expect(room.roomId).toBe(roomId);
      expect(room.objects.size).toBe(0);
    });

    it('должен возвращать существующую комнату', () => {
      const roomId = 'test-room-123';
      const room1 = manager.getOrCreateRoom(roomId);
      const room2 = manager.getOrCreateRoom(roomId);

      expect(room1).toBe(room2);
    });
  });

  describe('addObject', () => {
    it('должен добавлять объект в комнату', () => {
      const roomId = 'test-room';
      const object = { id: 'obj-1', x: 100, y: 200, type: 'catapult' };

      manager.addObject(roomId, object);
      const objects = manager.getRoomObjects(roomId);

      expect(objects).toHaveLength(1);
      expect(objects[0]).toEqual(object);
    });

    it('должен создавать комнату если она не существует', () => {
      const roomId = 'new-room';
      const object = { id: 'obj-1', x: 50, y: 50, type: 'catapult' };

      manager.addObject(roomId, object);

      expect(manager.hasRoom(roomId)).toBe(true);
    });
  });

  describe('updateObjectPosition', () => {
    it('должен обновлять позицию существующего объекта', () => {
      const roomId = 'test-room';
      const object = { id: 'obj-1', x: 100, y: 200, type: 'catapult' };
      manager.addObject(roomId, object);

      const result = manager.updateObjectPosition(roomId, 'obj-1', { x: 300, y: 400 });
      const objects = manager.getRoomObjects(roomId);

      expect(result).toBe(true);
      expect(objects[0]!.x).toBe(300);
      expect(objects[0]!.y).toBe(400);
    });

    it('должен возвращать false для несуществующей комнаты', () => {
      const result = manager.updateObjectPosition('non-existent', 'obj-1', { x: 0, y: 0 });
      expect(result).toBe(false);
    });

    it('должен возвращать false для несуществующего объекта', () => {
      manager.getOrCreateRoom('test-room');
      const result = manager.updateObjectPosition('test-room', 'non-existent', { x: 0, y: 0 });
      expect(result).toBe(false);
    });
  });

  describe('getRoomObjects', () => {
    it('должен возвращать пустой массив для несуществующей комнаты', () => {
      const objects = manager.getRoomObjects('non-existent');
      expect(objects).toEqual([]);
    });

    it('должен возвращать все объекты комнаты', () => {
      const roomId = 'test-room';
      manager.addObject(roomId, { id: 'obj-1', x: 10, y: 20, type: 'catapult' });
      manager.addObject(roomId, { id: 'obj-2', x: 30, y: 40, type: 'catapult' });

      const objects = manager.getRoomObjects(roomId);

      expect(objects).toHaveLength(2);
    });
  });

  describe('deleteRoom', () => {
    it('должен удалять комнату', () => {
      const roomId = 'test-room';
      manager.getOrCreateRoom(roomId);

      manager.deleteRoom(roomId);

      expect(manager.hasRoom(roomId)).toBe(false);
    });
  });
});
