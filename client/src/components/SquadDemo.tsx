/**
 * Демо-компонент для тестирования системы отрядов и выделений.
 * Показывает карту с отрядами, тултипами и механикой detachment.
 */

'use client';

import React, { useEffect } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import useImage from 'use-image';
import { useSquadState } from '../hooks/useSquadState';
import { SquadLayer } from './SquadLayer';
import { Squad } from '../types/squad';

/**
 * Демо-данные отрядов для тестирования
 */
const DEMO_SQUADS: Squad[] = [
  {
    id: 'squad-alpha',
    name: 'Alpha',
    x: 150,
    y: 200,
    color: '#e74c3c',
    characters: [
      { id: 'char-1', nickname: 'DragonSlayer', characterClass: 'warrior' },
      { id: 'char-2', nickname: 'IceQueen', characterClass: 'mage' },
      { id: 'char-3', nickname: 'HolyLight', characterClass: 'cleric' },
    ],
  },
  {
    id: 'squad-bravo',
    name: 'Bravo',
    x: 400,
    y: 300,
    color: '#3498db',
    characters: [
      { id: 'char-4', nickname: 'ShadowBlade', characterClass: 'assassin' },
      { id: 'char-5', nickname: 'BearTank', characterClass: 'barbarian' },
      { id: 'char-6', nickname: 'FoxSpirit', characterClass: 'venomancer' },
      { id: 'char-7', nickname: 'ArrowStorm', characterClass: 'archer' },
    ],
  },
  {
    id: 'squad-charlie',
    name: 'Charlie',
    x: 600,
    y: 150,
    color: '#2ecc71',
    characters: [
      { id: 'char-8', nickname: 'MindBender', characterClass: 'psychic' },
      { id: 'char-9', nickname: 'ShieldMaster', characterClass: 'seeker' },
    ],
  },
];

/**
 * Демо-компонент системы отрядов.
 * Используется для визуального тестирования функционала.
 */
export const SquadDemo: React.FC = () => {
  const {
    squads,
    detachments,
    addSquad,
    createDetachment,
    returnToSquad,
    updateSquadPosition,
    updateDetachmentPosition,
  } = useSquadState();

  // Размеры карты
  const MAP_WIDTH = 800;
  const MAP_HEIGHT = 600;

  // Загрузка фонового изображения
  const [mapImage] = useImage('https://placehold.co/800x600/1a2634/white?text=GVG+TACTICS+MAP');

  // Инициализация демо-данных (только если отрядов ещё нет)
  useEffect(() => {
    if (squads.length === 0) {
      DEMO_SQUADS.forEach((squad) => {
        addSquad(squad);
      });
    }
  }, []);

  /**
   * Обработчик выделения персонажа из отряда
   */
  const handleDetach = (squadId: string, characterId: string, x: number, y: number) => {
    createDetachment(squadId, characterId, x, y);
  };

  /**
   * Обработчик возврата персонажа в отряд
   */
  const handleReturnToSquad = (detachmentId: string) => {
    returnToSquad(detachmentId);
  };

  /**
   * Обработчик перемещения отряда (во время drag)
   */
  const handleSquadDragMove = (squadId: string, x: number, y: number) => {
    updateSquadPosition(squadId, x, y);
  };

  /**
   * Обработчик завершения перемещения отряда
   */
  const handleSquadDragEnd = (squadId: string, x: number, y: number) => {
    updateSquadPosition(squadId, x, y);
  };

  /**
   * Обработчик перемещения выделения (во время drag)
   */
  const handleDetachmentDragMove = (detachmentId: string, x: number, y: number) => {
    updateDetachmentPosition(detachmentId, x, y);
  };

  /**
   * Обработчик завершения перемещения выделения.
   * Если персонаж перемещён близко к родительскому отряду - возвращает его.
   */
  const handleDetachmentDragEnd = (detachmentId: string, x: number, y: number) => {
    // Радиус для возврата в отряд (если персонаж ближе этого расстояния - возвращаем)
    const RETURN_RADIUS = 40;
    
    // Находим выделение и его родительский отряд
    const detachment = detachments.find((d) => d.id === detachmentId);
    if (detachment) {
      const parentSquad = squads.find((s) => s.id === detachment.parentSquadId);
      if (parentSquad) {
        // Вычисляем расстояние до отряда
        const distance = Math.sqrt(
          Math.pow(x - parentSquad.x, 2) + Math.pow(y - parentSquad.y, 2)
        );
        
        if (distance <= RETURN_RADIUS) {
          // Возвращаем персонажа в отряд
          returnToSquad(detachmentId);
          return;
        }
      }
    }
    
    updateDetachmentPosition(detachmentId, x, y);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-2xl font-bold text-white">Демо: Система отрядов и выделений</h1>
      
      <div className="text-sm text-slate-300 mb-2">
        <p>• Наведите на отряд для просмотра состава</p>
        <p>• Нажмите ↗ для выделения персонажа на карту</p>
        <p>• Двойной клик или перетаскивание на отряд вернёт персонажа</p>
        <p>• Перетаскивайте отряды и выделения</p>
      </div>

      <div className="border-4 border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <Stage width={MAP_WIDTH} height={MAP_HEIGHT}>
          {/* Фоновый слой */}
          <Layer>
            {mapImage && (
              <Image
                image={mapImage}
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
              />
            )}
          </Layer>

          {/* Слой отрядов и выделений */}
          <SquadLayer
            squads={squads}
            detachments={detachments}
            onSquadDragMove={handleSquadDragMove}
            onSquadDragEnd={handleSquadDragEnd}
            onDetach={handleDetach}
            onDetachmentDragMove={handleDetachmentDragMove}
            onDetachmentDragEnd={handleDetachmentDragEnd}
            onReturnToSquad={handleReturnToSquad}
          />
        </Stage>
      </div>

      {/* Информация о состоянии */}
      <div className="bg-slate-800 p-4 rounded-lg text-sm text-slate-300 w-full max-w-[800px]">
        <div className="font-bold mb-2">Состояние:</div>
        <div>Отрядов: {squads.length}</div>
        <div>Выделений: {detachments.length}</div>
        {detachments.length > 0 && (
          <div className="mt-2">
            <div className="font-bold">Активные выделения:</div>
            {detachments.map((d) => {
              const squad = squads.find((s) => s.id === d.parentSquadId);
              const char = squad?.characters.find((c) => c.id === d.characterId);
              return (
                <div key={d.id} className="text-xs">
                  {char?.nickname} из {squad?.name} @ ({Math.round(d.x)}, {Math.round(d.y)})
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SquadDemo;
