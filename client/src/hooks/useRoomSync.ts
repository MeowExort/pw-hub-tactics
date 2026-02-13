'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  RoomObject,
  ObjectPosition,
} from '../types/socket-events';

/**
 * Интервал throttle для отправки событий перемещения (мс).
 * 16мс ≈ 60fps - оптимальный баланс между плавностью и нагрузкой на сеть.
 */
const THROTTLE_INTERVAL = 16;

/**
 * Тип для типизированного сокета на клиенте
 */
type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * Хук для синхронизации объектов на карте через Socket.io.
 * 
 * Механизм работы:
 * 1. При монтировании подключается к серверу и присоединяется к комнате
 * 2. Получает начальное состояние объектов от сервера
 * 3. Слушает события обновления/создания объектов от других участников
 * 4. Предоставляет throttled функции для отправки обновлений
 * 
 * @param roomId UUID комнаты из URL
 * @returns Объект с состоянием и функциями для синхронизации
 */
export function useRoomSync(roomId: string) {
  const socketRef = useRef<TypedSocket | null>(null);
  const [objects, setObjects] = useState<RoomObject[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // Ref для throttle - хранит время последней отправки для каждого объекта
  const lastEmitTimeRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // Создаем подключение к серверу
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
    const socket: TypedSocket = io(serverUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Присоединяемся к комнате после подключения
      socket.emit('join_room', { roomId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    /**
     * Обработчик начального состояния комнаты.
     * Вызывается сразу после join_room.
     */
    socket.on('room_state', (roomObjects: RoomObject[]) => {
      setObjects(roomObjects);
    });

    /**
     * Обработчик обновления позиции объекта от другого участника.
     * Плавно обновляет позицию соответствующего объекта.
     */
    socket.on('object_updated', (payload) => {
      setObjects((prev) =>
        prev.map((obj) =>
          obj.id === payload.objectId
            ? { ...obj, x: payload.position.x, y: payload.position.y }
            : obj
        )
      );
    });

    /**
     * Обработчик создания нового объекта другим участником.
     */
    socket.on('object_created', (newObject: RoomObject) => {
      setObjects((prev) => [...prev, newObject]);
    });

    // Очистка при размонтировании
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  /**
   * Отправляет обновление позиции объекта с throttle.
   * Ограничивает частоту отправки до THROTTLE_INTERVAL мс.
   * 
   * @param objectId ID объекта
   * @param position Новые координаты
   */
  const emitUpdateObject = useCallback((objectId: string, position: ObjectPosition) => {
    const socket = socketRef.current;
    if (!socket || !isConnected) return;

    const now = Date.now();
    const lastEmitTime = lastEmitTimeRef.current.get(objectId) || 0;

    // Throttle: отправляем только если прошло достаточно времени
    if (now - lastEmitTime >= THROTTLE_INTERVAL) {
      socket.emit('update_object', { objectId, position });
      lastEmitTimeRef.current.set(objectId, now);
    }
  }, [isConnected]);

  /**
   * Принудительно отправляет обновление позиции (без throttle).
   * Используется при dragend для гарантированной отправки финальной позиции.
   */
  const emitUpdateObjectForce = useCallback((objectId: string, position: ObjectPosition) => {
    const socket = socketRef.current;
    if (!socket || !isConnected) return;

    socket.emit('update_object', { objectId, position });
    lastEmitTimeRef.current.set(objectId, Date.now());
  }, [isConnected]);

  /**
   * Создает новый объект и отправляет его на сервер.
   * Также добавляет объект в локальное состояние.
   */
  const createObject = useCallback((object: RoomObject) => {
    const socket = socketRef.current;
    
    // Добавляем объект локально сразу для отзывчивости UI
    setObjects((prev) => [...prev, object]);
    
    // Отправляем на сервер если подключены
    if (socket && isConnected) {
      socket.emit('create_object', object);
    }
  }, [isConnected]);

  /**
   * Обновляет позицию объекта локально.
   * Используется для немедленного отображения перемещения.
   */
  const updateObjectLocal = useCallback((objectId: string, position: ObjectPosition) => {
    setObjects((prev) =>
      prev.map((obj) =>
        obj.id === objectId ? { ...obj, x: position.x, y: position.y } : obj
      )
    );
  }, []);

  return {
    objects,
    isConnected,
    emitUpdateObject,
    emitUpdateObjectForce,
    createObject,
    updateObjectLocal,
  };
}
