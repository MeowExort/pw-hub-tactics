'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import useImage from 'use-image';
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

/**
 * Пропсы компонента DrawingCanvas.
 */
interface DrawingCanvasProps {
  /** Ширина холста */
  width?: number;
  /** Высота холста */
  height?: number;
  /** Callback при изменении объектов (для синхронизации) */
  onObjectsChange?: (objects: CanvasObject[]) => void;
  /** Внешние объекты (от сервера) */
  externalObjects?: CanvasObject[];
}

/**
 * Генерирует уникальный ID для объекта.
 */
const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Компонент холста для рисования с поддержкой различных инструментов.
 * 
 * Поддерживает:
 * - Карандаш (свободное рисование)
 * - Линия
 * - Круг
 * - Прямоугольник
 * - Текстовая метка
 * - Ластик (удаление объектов)
 * - Undo/Redo (до 20 шагов)
 */
const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width = 800,
  height = 600,
  onObjectsChange,
  externalObjects,
}) => {
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
   * Синхронизация с внешними объектами (от сервера).
   * Не добавляет в историю, чтобы не засорять локальную историю.
   */
  useEffect(() => {
    if (externalObjects) {
      historyActions.setObjectsWithoutHistory(externalObjects);
    }
  }, [externalObjects, historyActions]);

  /**
   * Уведомление о изменении объектов.
   */
  useEffect(() => {
    if (onObjectsChange) {
      onObjectsChange(historyState.objects);
    }
  }, [historyState.objects, onObjectsChange]);

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
   * Получает позицию курсора относительно Stage.
   */
  const getPointerPosition = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return null;
    return stage.getPointerPosition();
  };

  /**
   * Обработчик начала рисования (mousedown/touchstart).
   */
  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Игнорируем если кликнули не по фону
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
        // Показываем prompt для ввода текста
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
          historyActions.pushState([...historyState.objects, textObj]);
        }
        break;
      }
      // select и eraser обрабатываются отдельно
    }
  }, [currentTool, settings, historyState.objects, historyActions]);

  /**
   * Обработчик движения мыши (mousemove/touchmove).
   * Обновляет текущий рисуемый объект.
   */
  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing || !currentObject || !startPointRef.current) return;

    const pos = getPointerPosition(e);
    if (!pos) return;

    switch (currentObject.type) {
      case 'pencil': {
        // Добавляем новую точку к линии
        const updatedPencil: PencilObject = {
          ...currentObject,
          points: [...currentObject.points, pos.x, pos.y],
        };
        setCurrentObject(updatedPencil);
        break;
      }
      case 'line': {
        // Обновляем конечную точку линии
        const updatedLine: LineObject = {
          ...currentObject,
          points: [startPointRef.current.x, startPointRef.current.y, pos.x, pos.y],
        };
        setCurrentObject(updatedLine);
        break;
      }
      case 'circle': {
        // Вычисляем радиус как расстояние от центра до текущей позиции
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
        // Вычисляем размеры прямоугольника
        const width = pos.x - startPointRef.current.x;
        const height = pos.y - startPointRef.current.y;
        const updatedRect: RectangleObject = {
          ...currentObject,
          // Корректируем позицию если рисуем влево/вверх
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
   * Обработчик завершения рисования (mouseup/touchend).
   * Сохраняет объект в историю.
   */
  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentObject) {
      setIsDrawing(false);
      return;
    }

    // Проверяем что объект имеет размер (не нулевой клик)
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
      historyActions.pushState([...historyState.objects, currentObject]);
    }

    setIsDrawing(false);
    setCurrentObject(null);
    startPointRef.current = null;
  }, [isDrawing, currentObject, historyState.objects, historyActions]);

  /**
   * Обработчик удаления объекта (ластик).
   */
  const handleObjectDelete = useCallback((id: string) => {
    const newObjects = historyState.objects.filter(obj => obj.id !== id);
    historyActions.pushState(newObjects);
  }, [historyState.objects, historyActions]);

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

  // Объекты для отрисовки: сохраненные + текущий рисуемый
  const objectsToRender = currentObject 
    ? [...historyState.objects, currentObject]
    : historyState.objects;

  return (
    <div className="flex flex-col items-center gap-4">
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
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          style={{ cursor: getCursor() }}
          data-testid="drawing-stage"
        >
          <Layer>
            {/* Фоновое изображение */}
            {mapImage && (
              <Image
                image={mapImage}
                width={width}
                height={height}
                name="map-background"
              />
            )}

            {/* Отрисовка объектов */}
            <CanvasRenderer
              objects={objectsToRender}
              onObjectClick={handleObjectDelete}
              isEraserMode={currentTool === 'eraser'}
            />
          </Layer>
        </Stage>
      </div>

      {/* Подсказка */}
      <div className="bg-slate-100 p-2 text-sm rounded text-center">
        {currentTool === 'select' && 'Режим выбора. Выберите инструмент для рисования.'}
        {currentTool === 'pencil' && 'Карандаш: зажмите кнопку мыши и рисуйте.'}
        {currentTool === 'line' && 'Линия: кликните и протяните для создания линии.'}
        {currentTool === 'circle' && 'Круг: кликните в центре и протяните для задания радиуса.'}
        {currentTool === 'rectangle' && 'Прямоугольник: кликните и протяните для создания.'}
        {currentTool === 'text' && 'Текст: кликните на карту для добавления текстовой метки.'}
        {currentTool === 'eraser' && 'Ластик: кликните на объект для удаления.'}
      </div>
    </div>
  );
};

export default DrawingCanvas;
