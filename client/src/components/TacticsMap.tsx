'use client';

import React, { useState } from 'react';
import { Stage, Layer, Circle, Image } from 'react-konva';
import useImage from 'use-image';

/**
 * Интерфейс для объектов на карте
 */
interface MapObject {
  id: string;
  x: number;
  y: number;
  type: 'catapult';
}

/**
 * Компонент интерактивной карты для планирования тактики ГВГ.
 * Использует Konva.js для отрисовки графики на Canvas.
 */
const TacticsMap: React.FC = () => {
  const [objects, setObjects] = useState<MapObject[]>([]);
  
  // Размеры карты (базовые)
  const MAP_WIDTH = 800;
  const MAP_HEIGHT = 600;

  // Загрузка фонового изображения (заглушка)
  // useImage возвращает [image, status]
  const [mapImage] = useImage('https://placehold.co/800x600/223344/white?text=GVG+MAP+STUB');

  /**
   * Ограничивает координаты объекта, чтобы он не выходил за границы карты.
   * @param pos Желаемая позиция объекта
   * @param radius Радиус объекта для учета границ
   */
  const boundBox = (pos: { x: number; y: number }, radius: number = 15) => {
    const x = Math.max(radius, Math.min(MAP_WIDTH - radius, pos.x));
    const y = Math.max(radius, Math.min(MAP_HEIGHT - radius, pos.y));
    return { x, y };
  };

  /**
   * Обработчик клика по сцене для добавления нового объекта.
   */
  const handleStageClick = (e: any) => {
    // В Konva событие клика на Stage передает объект, у которого есть getStage()
    const stage = e.target.getStage ? e.target.getStage() : e.currentTarget?.getStage?.();
    if (!stage) return;

    // Если кликнули не по фону/сцене, а по существующему объекту - ничего не делаем
    if (e.target !== stage && e.target.attrs.name !== 'map-background') {
      return;
    }

    const pointerPosition = stage.getPointerPosition();
    if (pointerPosition) {
      const constrainedPos = boundBox(pointerPosition);
      
      const newObject: MapObject = {
        id: Date.now().toString(),
        x: constrainedPos.x,
        y: constrainedPos.y,
        type: 'catapult',
      };
      setObjects([...objects, newObject]);
    }
  };

  /**
   * Обработчик завершения перетаскивания объекта.
   */
  const handleDragEnd = (id: string, e: any) => {
    const { x, y } = e.target.position();
    const constrained = boundBox({ x, y });
    
    setObjects(
      objects.map((obj) => 
        obj.id === id ? { ...obj, x: constrained.x, y: constrained.y } : obj
      )
    );
    
    e.target.position(constrained);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="map-container border-4 border-slate-700 rounded-lg overflow-hidden shadow-xl bg-slate-900">
        <Stage
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          onClick={handleStageClick}
          style={{ cursor: 'crosshair' }}
          data-testid="konva-stage"
        >
          <Layer>
            {/* Фоновое изображение карты */}
            {mapImage && (
              <Image 
                image={mapImage} 
                width={MAP_WIDTH} 
                height={MAP_HEIGHT} 
                alt="GVG Map"
                name="map-background"
              />
            )}
            
            {/* Слой с объектами */}
            {objects.map((obj) => (
              <Circle
                key={obj.id}
                id={obj.id}
                x={obj.x}
                y={obj.y}
                radius={15}
                fill="orange"
                stroke="#331100"
                strokeWidth={3}
                draggable
                onDragEnd={(e) => handleDragEnd(obj.id, e)}
                dragBoundFunc={(pos) => boundBox(pos)}
                data-testid="konva-icon"
                shadowBlur={5}
              />
            ))}
          </Layer>
        </Stage>
      </div>
      <div className="bg-slate-100 p-2 text-sm rounded">
        Кликните на карту, чтобы добавить катапульту. Перетаскивайте иконки для перемещения.
      </div>
    </div>
  );
};

export default TacticsMap;
