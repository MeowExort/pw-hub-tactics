/**
 * Тесты для хука useRoomSync
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRoomSync } from './useRoomSync';

// Мок для socket.io-client
const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

describe('useRoomSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Сбрасываем все обработчики
    mockSocket.on.mockReset();
    mockSocket.emit.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('должен подключаться к серверу при монтировании', () => {
    renderHook(() => useRoomSync('test-room'));

    // Проверяем что зарегистрированы обработчики событий
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('room_state', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('object_updated', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('object_created', expect.any(Function));
  });

  it('должен отключаться при размонтировании', () => {
    const { unmount } = renderHook(() => useRoomSync('test-room'));

    unmount();

    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('должен присоединяться к комнате после подключения', () => {
    renderHook(() => useRoomSync('test-room-123'));

    // Находим обработчик connect и вызываем его
    const connectHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'connect'
    )?.[1];

    act(() => {
      connectHandler?.();
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('join_room', { roomId: 'test-room-123' });
  });

  it('должен обновлять состояние при получении room_state', async () => {
    const { result } = renderHook(() => useRoomSync('test-room'));

    const roomStateHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'room_state'
    )?.[1];

    const testObjects = [
      { id: 'obj-1', x: 100, y: 200, type: 'catapult' },
      { id: 'obj-2', x: 300, y: 400, type: 'catapult' },
    ];

    act(() => {
      roomStateHandler?.(testObjects);
    });

    expect(result.current.objects).toEqual(testObjects);
  });

  it('должен обновлять позицию объекта при получении object_updated', async () => {
    const { result } = renderHook(() => useRoomSync('test-room'));

    // Сначала устанавливаем начальное состояние
    const roomStateHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'room_state'
    )?.[1];

    act(() => {
      roomStateHandler?.([{ id: 'obj-1', x: 100, y: 200, type: 'catapult' }]);
    });

    // Затем обновляем позицию
    const objectUpdatedHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'object_updated'
    )?.[1];

    act(() => {
      objectUpdatedHandler?.({ objectId: 'obj-1', position: { x: 500, y: 600 } });
    });

    expect(result.current.objects[0].x).toBe(500);
    expect(result.current.objects[0].y).toBe(600);
  });

  it('должен добавлять объект при получении object_created', async () => {
    const { result } = renderHook(() => useRoomSync('test-room'));

    const objectCreatedHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'object_created'
    )?.[1];

    const newObject = { id: 'new-obj', x: 150, y: 250, type: 'catapult' };

    act(() => {
      objectCreatedHandler?.(newObject);
    });

    expect(result.current.objects).toContainEqual(newObject);
  });

  it('createObject должен добавлять объект локально и отправлять на сервер', async () => {
    const { result } = renderHook(() => useRoomSync('test-room'));

    // Симулируем подключение
    const connectHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'connect'
    )?.[1];

    act(() => {
      connectHandler?.();
    });

    const newObject = { id: 'local-obj', x: 200, y: 300, type: 'catapult' };

    act(() => {
      result.current.createObject(newObject);
    });

    // Проверяем локальное добавление
    expect(result.current.objects).toContainEqual(newObject);

    // Проверяем отправку на сервер
    expect(mockSocket.emit).toHaveBeenCalledWith('create_object', newObject);
  });

  it('updateObjectLocal должен обновлять позицию локально', () => {
    const { result } = renderHook(() => useRoomSync('test-room'));

    // Устанавливаем начальное состояние
    const roomStateHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'room_state'
    )?.[1];

    act(() => {
      roomStateHandler?.([{ id: 'obj-1', x: 100, y: 200, type: 'catapult' }]);
    });

    // Обновляем локально
    act(() => {
      result.current.updateObjectLocal('obj-1', { x: 999, y: 888 });
    });

    expect(result.current.objects[0].x).toBe(999);
    expect(result.current.objects[0].y).toBe(888);
  });

  it('emitUpdateObjectForce должен отправлять обновление без throttle', () => {
    const { result } = renderHook(() => useRoomSync('test-room'));

    // Симулируем подключение
    const connectHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'connect'
    )?.[1];

    act(() => {
      connectHandler?.();
    });

    act(() => {
      result.current.emitUpdateObjectForce('obj-1', { x: 100, y: 200 });
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('update_object', {
      objectId: 'obj-1',
      position: { x: 100, y: 200 },
    });
  });
});
