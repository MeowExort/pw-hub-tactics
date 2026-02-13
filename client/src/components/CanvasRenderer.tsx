'use client';

import React, { useState } from 'react';
import { Line, Circle, Rect, Text } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import {
  CanvasObject,
  PencilObject,
  LineObject,
  CircleObject,
  RectangleObject,
  TextObject,
  CatapultObject,
} from '../types/canvas-objects';

/**
 * Пропсы компонента CanvasRenderer.
 */
interface CanvasRendererProps {
  /** Массив объектов для отрисовки */
  objects: CanvasObject[];
  /** Callback при клике на объект (для ластика) */
  onObjectClick?: (id: string) => void;
  /** Callback при перемещении объекта */
  onObjectDrag?: (id: string, x: number, y: number) => void;
  /** Callback при завершении перемещения объекта */
  onObjectDragEnd?: (id: string, x: number, y: number) => void;
  /** Включен ли режим ластика */
  isEraserMode?: boolean;
  /** Включен ли режим выбора (перемещение объектов) */
  isSelectMode?: boolean;
}

/**
 * Компонент для отрисовки объектов на холсте Konva.
 * Рендерит различные типы фигур в зависимости от их типа.
 * 
 * Использует дискриминацию по полю type для определения
 * конкретного типа объекта и его свойств.
 */
const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  objects,
  onObjectClick,
  onObjectDrag,
  onObjectDragEnd,
  isEraserMode = false,
  isSelectMode = false,
}) => {
  // ID объекта под курсором (для подсветки в режиме ластика)
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  /**
   * Обработчик клика по объекту.
   * Вызывается только в режиме ластика.
   */
  const handleClick = (id: string) => {
    if (isEraserMode && onObjectClick) {
      onObjectClick(id);
    }
  };

  /**
   * Обработчик наведения на объект.
   * Подсвечивает объект в режиме ластика.
   */
  const handleMouseEnter = (id: string) => {
    if (isEraserMode) {
      setHoveredId(id);
    }
  };

  /**
   * Обработчик ухода курсора с объекта.
   */
  const handleMouseLeave = () => {
    setHoveredId(null);
  };

  /**
   * Обработчик перемещения объекта.
   */
  const handleDragMove = (id: string, e: KonvaEventObject<DragEvent>) => {
    if (isSelectMode && onObjectDrag) {
      const node = e.target;
      onObjectDrag(id, node.x(), node.y());
    }
  };

  /**
   * Обработчик завершения перемещения объекта.
   */
  const handleDragEnd = (id: string, e: KonvaEventObject<DragEvent>) => {
    if (isSelectMode && onObjectDragEnd) {
      const node = e.target;
      onObjectDragEnd(id, node.x(), node.y());
    }
  };

  /**
   * Возвращает стиль подсветки для объекта в режиме ластика.
   */
  const getHighlightProps = (id: string) => {
    if (isEraserMode && hoveredId === id) {
      return {
        shadowColor: 'red',
        shadowBlur: 10,
        shadowOpacity: 0.8,
      };
    }
    return {};
  };

  /**
   * Рендерит объект "Карандаш" (свободное рисование).
   */
  const renderPencil = (obj: PencilObject) => (
    <Line
      key={obj.id}
      id={obj.id}
      points={obj.points}
      stroke={isEraserMode && hoveredId === obj.id ? 'red' : obj.stroke}
      strokeWidth={obj.strokeWidth}
      lineCap="round"
      lineJoin="round"
      tension={0.5}
      draggable={isSelectMode}
      onClick={() => handleClick(obj.id)}
      onMouseEnter={() => handleMouseEnter(obj.id)}
      onMouseLeave={handleMouseLeave}
      onDragMove={(e) => handleDragMove(obj.id, e)}
      onDragEnd={(e) => handleDragEnd(obj.id, e)}
      hitStrokeWidth={10}
      data-testid={`pencil-${obj.id}`}
    />
  );

  /**
   * Рендерит объект "Линия".
   */
  const renderLine = (obj: LineObject) => (
    <Line
      key={obj.id}
      id={obj.id}
      points={obj.points}
      stroke={isEraserMode && hoveredId === obj.id ? 'red' : obj.stroke}
      strokeWidth={obj.strokeWidth}
      lineCap="round"
      draggable={isSelectMode}
      onClick={() => handleClick(obj.id)}
      onMouseEnter={() => handleMouseEnter(obj.id)}
      onMouseLeave={handleMouseLeave}
      onDragMove={(e) => handleDragMove(obj.id, e)}
      onDragEnd={(e) => handleDragEnd(obj.id, e)}
      hitStrokeWidth={10}
      data-testid={`line-${obj.id}`}
    />
  );

  /**
   * Рендерит объект "Круг".
   */
  const renderCircle = (obj: CircleObject) => (
    <Circle
      key={obj.id}
      id={obj.id}
      x={obj.x}
      y={obj.y}
      radius={obj.radius}
      fill={obj.fill}
      stroke={isEraserMode && hoveredId === obj.id ? 'red' : obj.stroke}
      strokeWidth={obj.strokeWidth}
      draggable={isSelectMode}
      onClick={() => handleClick(obj.id)}
      onMouseEnter={() => handleMouseEnter(obj.id)}
      onMouseLeave={handleMouseLeave}
      onDragMove={(e) => handleDragMove(obj.id, e)}
      onDragEnd={(e) => handleDragEnd(obj.id, e)}
      {...getHighlightProps(obj.id)}
      data-testid={`circle-${obj.id}`}
    />
  );

  /**
   * Рендерит объект "Прямоугольник".
   */
  const renderRectangle = (obj: RectangleObject) => (
    <Rect
      key={obj.id}
      id={obj.id}
      x={obj.x}
      y={obj.y}
      width={obj.width}
      height={obj.height}
      fill={obj.fill}
      stroke={isEraserMode && hoveredId === obj.id ? 'red' : obj.stroke}
      strokeWidth={obj.strokeWidth}
      draggable={isSelectMode}
      onClick={() => handleClick(obj.id)}
      onMouseEnter={() => handleMouseEnter(obj.id)}
      onMouseLeave={handleMouseLeave}
      onDragMove={(e) => handleDragMove(obj.id, e)}
      onDragEnd={(e) => handleDragEnd(obj.id, e)}
      {...getHighlightProps(obj.id)}
      data-testid={`rectangle-${obj.id}`}
    />
  );

  /**
   * Рендерит объект "Текст".
   */
  const renderText = (obj: TextObject) => (
    <Text
      key={obj.id}
      id={obj.id}
      x={obj.x}
      y={obj.y}
      text={obj.text}
      fontSize={obj.fontSize}
      fill={isEraserMode && hoveredId === obj.id ? 'red' : obj.fill}
      draggable={isSelectMode}
      onClick={() => handleClick(obj.id)}
      onMouseEnter={() => handleMouseEnter(obj.id)}
      onMouseLeave={handleMouseLeave}
      onDragMove={(e) => handleDragMove(obj.id, e)}
      onDragEnd={(e) => handleDragEnd(obj.id, e)}
      data-testid={`text-${obj.id}`}
    />
  );

  /**
   * Рендерит объект "Катапульта" (для совместимости с существующим кодом).
   */
  const renderCatapult = (obj: CatapultObject) => (
    <Circle
      key={obj.id}
      id={obj.id}
      x={obj.x}
      y={obj.y}
      radius={15}
      fill="orange"
      stroke={isEraserMode && hoveredId === obj.id ? 'red' : '#331100'}
      strokeWidth={3}
      shadowBlur={isEraserMode && hoveredId === obj.id ? 10 : 5}
      shadowColor={isEraserMode && hoveredId === obj.id ? 'red' : undefined}
      draggable={isSelectMode}
      onClick={() => handleClick(obj.id)}
      onMouseEnter={() => handleMouseEnter(obj.id)}
      onMouseLeave={handleMouseLeave}
      onDragMove={(e) => handleDragMove(obj.id, e)}
      onDragEnd={(e) => handleDragEnd(obj.id, e)}
      data-testid={`catapult-${obj.id}`}
    />
  );

  /**
   * Рендерит объект в зависимости от его типа.
   * Использует switch для дискриминации union-типа.
   */
  const renderObject = (obj: CanvasObject) => {
    switch (obj.type) {
      case 'pencil':
        return renderPencil(obj);
      case 'line':
        return renderLine(obj);
      case 'circle':
        return renderCircle(obj);
      case 'rectangle':
        return renderRectangle(obj);
      case 'text':
        return renderText(obj);
      case 'catapult':
        return renderCatapult(obj);
      default:
        // TypeScript exhaustive check
        const _exhaustive: never = obj;
        return null;
    }
  };

  return <>{objects.map(renderObject)}</>;
};

export default CanvasRenderer;
