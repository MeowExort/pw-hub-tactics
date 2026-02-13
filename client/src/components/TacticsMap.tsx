'use client';

import React from 'react';
import { Stage, Layer, Circle, Image } from 'react-konva';
import useImage from 'use-image';
import { useRoomSync } from '../hooks/useRoomSync';
import { RoomObject } from '../types/socket-events';

/**
 * Пропсы компонента TacticsMap
 */
interface TacticsMapProps {
  /** UUID комнаты для синхронизации */
  roomId: string;
}

/**
 * Компонент интерактивной карты для планирования тактики ГВГ.
 * Использует Konva.js для отрисовки графики на Canvas.
 * Синхронизирует позиции объектов между пользователями через Socket.io.
 */
const TacticsMap: React.FC<TacticsMapProps> = ({ roomId }) => {
  const {
    objects,
    isConnected,
    emitUpdateObject,
    emitUpdateObjectForce,
    createObject,
    updateObjectLocal,
  } = useRoomSync(roomId);
  
  // Размеры карты (базовые)
  const MAP_WIDTH = 800;
  const MAP_HEIGHT = 600;

  // Загрузка фонового изображения (заглушка)
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
    const stage = e.target.getStage ? e.target.getStage() : e.currentTarget?.getStage?.();
    if (!stage) return;

    // Если кликнули не по фону/сцене, а по существующему объекту - ничего не делаем
    if (e.target !== stage && e.target.attrs.name !== 'map-background') {
      return;
    }

    const pointerPosition = stage.getPointerPosition();
    if (pointerPosition) {
      const constrainedPos = boundBox(pointerPosition);
      
      const newObject: RoomObject = {
        id: Date.now().toString(),
        x: constrainedPos.x,
        y: constrainedPos.y,
        type: 'catapult',
      };
      
      // Создаем объект через хук синхронизации
      createObject(newObject);
    }
  };

  /**
   * Обработчик перемещения объекта (dragmove).
   * Отправляет throttled обновления позиции на сервер.
   */
  const handleDragMove = (id: string, e: any) => {
    const { x, y } = e.target.position();
    const constrained = boundBox({ x, y });
    
    // Обновляем локально для плавности
    updateObjectLocal(id, constrained);
    
    // Отправляем на сервер с throttle
    emitUpdateObject(id, constrained);
  };

  /**
   * Обработчик завершения перетаскивания объекта.
   * Гарантированно отправляет финальную позицию.
   */
  const handleDragEnd = (id: string, e: any) => {
    const { x, y } = e.target.position();
    const constrained = boundBox({ x, y });
    
    // Обновляем локально
    updateObjectLocal(id, constrained);
    
    // Принудительно отправляем финальную позицию
    emitUpdateObjectForce(id, constrained);
    
    e.target.position(constrained);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Индикатор подключения */}
      <div className={`px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
        {isConnected ? '🟢 Подключено' : '🔴 Отключено'}
      </div>
      
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
                onDragMove={(e) => handleDragMove(obj.id, e)}
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
