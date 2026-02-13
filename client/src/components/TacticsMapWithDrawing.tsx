'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import useImage from 'use-image';
import { io, Socket } from 'socket.io-client';
import { KonvaEventObject } from 'konva/lib/Node';
import DrawingToolbar from './DrawingToolbar';
import CanvasRenderer from './CanvasRenderer';
import { useCanvasHistory } from '../hooks/useCanvasHistory';
import {
  CanvasObject,
  DrawingTool,
  DrawingSettings,
  DEFAULT_DRAWING_SETTINGS,
  PencilObject,
  LineObject,
  CircleObject,
  RectangleObject,
  TextObject,
} from '../types/canvas-objects';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  RoomObject,
} from '../types/socket-events';

/**
 * Пропсы компонента TacticsMapWithDrawing.
 */
interface TacticsMapWithDrawingProps {
  /** UUID комнаты для синхронизации */
  roomId: string;
}

/**
 * Тип для типизированного сокета на клиенте
 */
type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * Генерирует уникальный ID для объекта.
 */
const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Преобразует RoomObject в CanvasObject.
 * RoomObject - упрощенный тип для передачи по сети.
 * CanvasObject - полный тип с дополнительными свойствами.
 */
const roomObjectToCanvasObject = (obj: RoomObject): CanvasObject => {
  // RoomObject может содержать дополнительные поля, приводим к CanvasObject
  return obj as unknown as CanvasObject;
};

/**
 * Компонент тактической карты с инструментами рисования и синхронизацией.
 * 
 * Объединяет:
 * - Инструменты рисования (карандаш, линия, круг, прямоугольник, текст)
 * - Ластик для удаления объектов
 * - Систему Undo/Redo (до 20 шагов)
 * - Синхронизацию через Socket.io
 */
const TacticsMapWithDrawing: React.FC<TacticsMapWithDrawingProps> = ({ roomId }) => {
  // Размеры карты
  const MAP_WIDTH = 800;
  const MAP_HEIGHT = 600;

  // Socket.io
  const socketRef = useRef<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Текущий инструмент и настройки
  const [currentTool, setCurrentTool] = useState<DrawingTool>('select');
  const [settings, setSettings] = useState<DrawingSettings>(DEFAULT_DRAWING_SETTINGS);

  // История для Undo/Redo
  const { state: historyState, actions: historyActions } = useCanvasHistory([]);

  // Состояние рисования
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentObject, setCurrentObject] = useState<CanvasObject | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);

  // Загрузка фонового изображения
  const [mapImage] = useImage('https://placehold.co/800x600/223344/white?text=GVG+MAP+STUB');

  /**
   * Инициализация Socket.io подключения.
   */
  useEffect(() => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
    const socket: TypedSocket = io(serverUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_room', { roomId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    /**
     * Обработчик начального состояния комнаты.
     */
    socket.on('room_state', (roomObjects: RoomObject[]) => {
      const canvasObjects = roomObjects.map(roomObjectToCanvasObject);
      historyActions.setObjectsWithoutHistory(canvasObjects);
    });

    /**
     * Обработчик создания объекта другим участником.
     */
    socket.on('object_created', (newObject: RoomObject) => {
      const canvasObject = roomObjectToCanvasObject(newObject);
      historyActions.setObjectsWithoutHistory([...historyState.objects, canvasObject]);
    });

    /**
     * Обработчик удаления объекта другим участником.
     */
    socket.on('object_deleted', (payload) => {
      historyActions.setObjectsWithoutHistory(
        historyState.objects.filter(obj => obj.id !== payload.objectId)
      );
    });

    /**
     * Обработчик обновления позиции объекта другим участником.
     */
    socket.on('object_updated', (payload) => {
      historyActions.setObjectsWithoutHistory(
        historyState.objects.map(obj =>
          obj.id === payload.objectId
            ? { ...obj, x: payload.position.x, y: payload.position.y }
            : obj
        )
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  /**
   * Обработчик горячих клавиш Ctrl+Z / Ctrl+Y.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          historyActions.undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          historyActions.redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyActions]);

  /**
   * Отправляет созданный объект на сервер.
   */
  const emitCreateObject = useCallback((obj: CanvasObject) => {
    const socket = socketRef.current;
    if (socket && isConnected) {
      socket.emit('create_object', obj as unknown as RoomObject);
    }
  }, [isConnected]);

  /**
   * Отправляет удаление объекта на сервер.
   */
  const emitDeleteObject = useCallback((objectId: string) => {
    const socket = socketRef.current;
    if (socket && isConnected) {
      socket.emit('delete_object', { objectId });
    }
  }, [isConnected]);

  /**
   * Получает позицию курсора относительно Stage.
   */
  const getPointerPosition = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return null;
    return stage.getPointerPosition();
  };

  /**
   * Обработчик начала рисования.
   */
  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage() ||
                           e.target.attrs.name === 'map-background';

    if (!clickedOnEmpty && currentTool !== 'eraser') return;

    const pos = getPointerPosition(e);
    if (!pos) return;

    startPointRef.current = pos;

    switch (currentTool) {
      case 'pencil': {
        setIsDrawing(true);
        const pencilObj: PencilObject = {
          id: generateId(),
          type: 'pencil',
          x: pos.x,
          y: pos.y,
          points: [pos.x, pos.y],
          stroke: settings.strokeColor,
          strokeWidth: settings.strokeWidth,
        };
        setCurrentObject(pencilObj);
        break;
      }
      case 'line': {
        setIsDrawing(true);
        const lineObj: LineObject = {
          id: generateId(),
          type: 'line',
          x: pos.x,
          y: pos.y,
          points: [pos.x, pos.y, pos.x, pos.y],
          stroke: settings.strokeColor,
          strokeWidth: settings.strokeWidth,
        };
        setCurrentObject(lineObj);
        break;
      }
      case 'circle': {
        setIsDrawing(true);
        const circleObj: CircleObject = {
          id: generateId(),
          type: 'circle',
          x: pos.x,
          y: pos.y,
          radius: 0,
          fill: settings.fillColor,
          stroke: settings.strokeColor,
          strokeWidth: settings.strokeWidth,
        };
        setCurrentObject(circleObj);
        break;
      }
      case 'rectangle': {
        setIsDrawing(true);
        const rectObj: RectangleObject = {
          id: generateId(),
          type: 'rectangle',
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          fill: settings.fillColor,
          stroke: settings.strokeColor,
          strokeWidth: settings.strokeWidth,
        };
        setCurrentObject(rectObj);
        break;
      }
      case 'text': {
        const text = window.prompt('Введите текст:');
        if (text && text.trim()) {
          const textObj: TextObject = {
            id: generateId(),
            type: 'text',
            x: pos.x,
            y: pos.y,
            text: text.trim(),
            fontSize: settings.fontSize,
            fill: settings.strokeColor,
          };
          const newObjects = [...historyState.objects, textObj];
          historyActions.pushState(newObjects);
          emitCreateObject(textObj);
        }
        break;
      }
    }
  }, [currentTool, settings, historyState.objects, historyActions, emitCreateObject]);

  /**
   * Обработчик движения мыши.
   */
  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing || !currentObject || !startPointRef.current) return;

    const pos = getPointerPosition(e);
    if (!pos) return;

    switch (currentObject.type) {
      case 'pencil': {
        const updatedPencil: PencilObject = {
          ...currentObject,
          points: [...currentObject.points, pos.x, pos.y],
        };
        setCurrentObject(updatedPencil);
        break;
      }
      case 'line': {
        const updatedLine: LineObject = {
          ...currentObject,
          points: [startPointRef.current.x, startPointRef.current.y, pos.x, pos.y],
        };
        setCurrentObject(updatedLine);
        break;
      }
      case 'circle': {
        const dx = pos.x - startPointRef.current.x;
        const dy = pos.y - startPointRef.current.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        const updatedCircle: CircleObject = {
          ...currentObject,
          radius,
        };
        setCurrentObject(updatedCircle);
        break;
      }
      case 'rectangle': {
        const width = pos.x - startPointRef.current.x;
        const height = pos.y - startPointRef.current.y;
        const updatedRect: RectangleObject = {
          ...currentObject,
          x: width < 0 ? pos.x : startPointRef.current.x,
          y: height < 0 ? pos.y : startPointRef.current.y,
          width: Math.abs(width),
          height: Math.abs(height),
        };
        setCurrentObject(updatedRect);
        break;
      }
    }
  }, [isDrawing, currentObject]);

  /**
   * Обработчик завершения рисования.
   */
  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentObject) {
      setIsDrawing(false);
      return;
    }

    let isValidObject = true;

    switch (currentObject.type) {
      case 'pencil':
        isValidObject = currentObject.points.length > 2;
        break;
      case 'line':
        isValidObject = currentObject.points[0] !== currentObject.points[2] ||
                        currentObject.points[1] !== currentObject.points[3];
        break;
      case 'circle':
        isValidObject = currentObject.radius > 5;
        break;
      case 'rectangle':
        isValidObject = currentObject.width > 5 && currentObject.height > 5;
        break;
    }

    if (isValidObject) {
      const newObjects = [...historyState.objects, currentObject];
      historyActions.pushState(newObjects);
      emitCreateObject(currentObject);
    }

    setIsDrawing(false);
    setCurrentObject(null);
    startPointRef.current = null;
  }, [isDrawing, currentObject, historyState.objects, historyActions, emitCreateObject]);

  /**
   * Обработчик удаления объекта (ластик).
   */
  const handleObjectDelete = useCallback((id: string) => {
    const newObjects = historyState.objects.filter(obj => obj.id !== id);
    historyActions.pushState(newObjects);
    emitDeleteObject(id);
  }, [historyState.objects, historyActions, emitDeleteObject]);

  /**
   * Обработчик перемещения объекта (локальное обновление для плавности).
   */
  const handleObjectDrag = useCallback((id: string, x: number, y: number) => {
    // Обновляем позицию локально без записи в историю
    historyActions.setObjectsWithoutHistory(
      historyState.objects.map(obj =>
        obj.id === id ? { ...obj, x, y } : obj
      )
    );
  }, [historyState.objects, historyActions]);

  /**
   * Обработчик завершения перемещения объекта.
   * Записывает финальную позицию в историю и синхронизирует с сервером.
   */
  const handleObjectDragEnd = useCallback((id: string, x: number, y: number) => {
    const newObjects = historyState.objects.map(obj =>
      obj.id === id ? { ...obj, x, y } : obj
    );
    historyActions.pushState(newObjects);
    
    // Отправляем обновление позиции на сервер
    const socket = socketRef.current;
    if (socket && isConnected) {
      socket.emit('update_object', { objectId: id, position: { x, y } });
    }
  }, [historyState.objects, historyActions, isConnected]);

  /**
   * Определяет курсор в зависимости от инструмента.
   */
  const getCursor = (): string => {
    switch (currentTool) {
      case 'pencil':
      case 'line':
      case 'circle':
      case 'rectangle':
        return 'crosshair';
      case 'text':
        return 'text';
      case 'eraser':
        return 'pointer';
      default:
        return 'default';
    }
  };

  const objectsToRender = currentObject
    ? [...historyState.objects, currentObject]
    : historyState.objects;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Индикатор подключения */}
      <div className={`px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
        {isConnected ? '🟢 Подключено' : '🔴 Отключено'}
      </div>

      {/* Панель инструментов */}
      <DrawingToolbar
        currentTool={currentTool}
        onToolChange={setCurrentTool}
        settings={settings}
        onSettingsChange={setSettings}
        canUndo={historyState.canUndo}
        canRedo={historyState.canRedo}
        onUndo={historyActions.undo}
        onRedo={historyActions.redo}
      />

      {/* Холст */}
      <div className="border-4 border-slate-700 rounded-lg overflow-hidden shadow-xl bg-slate-900">
        <Stage
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          style={{ cursor: getCursor() }}
          data-testid="tactics-map-stage"
        >
          <Layer>
            {mapImage && (
              <Image
                image={mapImage}
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
                name="map-background"
              />
            )}

            <CanvasRenderer
              objects={objectsToRender}
              onObjectClick={handleObjectDelete}
              onObjectDrag={handleObjectDrag}
              onObjectDragEnd={handleObjectDragEnd}
              isEraserMode={currentTool === 'eraser'}
              isSelectMode={currentTool === 'select'}
            />
          </Layer>
        </Stage>
      </div>

      {/* Подсказка */}
      <div className="bg-slate-100 p-2 text-sm rounded text-center max-w-xl">
        {currentTool === 'select' && 'Выбор: перетаскивайте объекты для перемещения.'}
        {currentTool === 'pencil' && 'Карандаш: зажмите кнопку мыши и рисуйте.'}
        {currentTool === 'line' && 'Линия: кликните и протяните для создания линии.'}
        {currentTool === 'circle' && 'Круг: кликните в центре и протяните для задания радиуса.'}
        {currentTool === 'rectangle' && 'Прямоугольник: кликните и протяните для создания.'}
        {currentTool === 'text' && 'Текст: кликните на карту для добавления текстовой метки.'}
        {currentTool === 'eraser' && 'Ластик: кликните на объект для удаления.'}
        <span className="ml-2 text-slate-500">| Ctrl+Z - отмена, Ctrl+Y - повтор</span>
      </div>
    </div>
  );
};

export default TacticsMapWithDrawing;
