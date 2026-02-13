/**
 * Компонент иконки отряда на карте (Konva).
 * При наведении показывает тултип со списком персонажей.
 * Поддерживает перетаскивание и выделение персонажей.
 */

import React, { useState, useRef, useCallback } from 'react';
import { Group, Circle, Text } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Squad } from '../types/squad';
import { SquadTooltip } from './SquadTooltip';

/**
 * Пропсы компонента SquadIcon
 */
interface SquadIconProps {
  /** Данные отряда */
  squad: Squad;
  /** Callback при перемещении отряда */
  onDragMove?: (squadId: string, x: number, y: number) => void;
  /** Callback при завершении перемещения */
  onDragEnd?: (squadId: string, x: number, y: number) => void;
  /** Callback при выделении персонажа */
  onDetach: (squadId: string, characterId: string, x: number, y: number) => void;
}

/**
 * Компонент иконки отряда для отображения на Konva Stage.
 * Показывает круг с количеством персонажей и тултип при наведении.
 */
export const SquadIcon: React.FC<SquadIconProps> = ({
  squad,
  onDragMove,
  onDragEnd,
  onDetach,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const groupRef = useRef<any>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Радиус иконки отряда
  const RADIUS = 25;

  /**
   * Показывает тултип с задержкой отмены скрытия.
   * Предотвращает мерцание при быстром перемещении мыши.
   */
  const showTooltip = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsHovered(true);
  }, []);

  /**
   * Скрывает тултип с небольшой задержкой.
   * Позволяет переместить мышь на тултип без его исчезновения.
   */
  const hideTooltip = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      if (!isTooltipHovered) {
        setIsHovered(false);
      }
    }, 100);
  }, [isTooltipHovered]);

  /**
   * Обработчик наведения мыши на иконку
   */
  const handleMouseEnter = () => {
    showTooltip();
  };

  /**
   * Обработчик ухода мыши с иконки
   */
  const handleMouseLeave = () => {
    hideTooltip();
  };

  /**
   * Обработчик наведения на тултип
   */
  const handleTooltipMouseEnter = () => {
    setIsTooltipHovered(true);
    showTooltip();
  };

  /**
   * Обработчик ухода мыши с тултипа
   */
  const handleTooltipMouseLeave = () => {
    setIsTooltipHovered(false);
    setIsHovered(false);
  };

  /**
   * Обработчик перемещения.
   * Скрывает тултип во время перетаскивания.
   */
  const handleDragMove = (e: any) => {
    setIsHovered(false);
    setIsTooltipHovered(false);
    const { x, y } = e.target.position();
    onDragMove?.(squad.id, x, y);
  };

  /**
   * Обработчик завершения перемещения
   */
  const handleDragEnd = (e: any) => {
    const { x, y } = e.target.position();
    onDragEnd?.(squad.id, x, y);
  };

  /**
   * Обработчик выделения персонажа.
   * Создаёт выделение рядом с отрядом (смещение 50px вправо).
   */
  const handleDetach = (squadId: string, characterId: string) => {
    onDetach(squadId, characterId, squad.x + 50, squad.y);
  };

  return (
    <Group
      ref={groupRef}
      x={squad.x}
      y={squad.y}
      draggable
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Основной круг отряда */}
      <Circle
        radius={RADIUS}
        fill={squad.color}
        stroke={isHovered ? '#ffffff' : '#000000'}
        strokeWidth={isHovered ? 3 : 2}
        shadowBlur={isHovered ? 10 : 5}
        shadowColor={squad.color}
        data-testid="squad-icon-circle"
      />

      {/* Название отряда в круге */}
      <Text
        text={squad.name || String(squad.characters.length)}
        fontSize={squad.name && squad.name.length > 3 ? 10 : 14}
        fontStyle="bold"
        fill="#ffffff"
        align="center"
        verticalAlign="middle"
        width={RADIUS * 2}
        height={RADIUS * 2}
        offsetX={RADIUS}
        offsetY={RADIUS}
      />

      {/* Название отряда под иконкой */}
      {squad.name && (
        <Text
          text={squad.name}
          fontSize={12}
          fill="#ffffff"
          align="center"
          y={RADIUS + 5}
          offsetX={squad.name.length * 3}
        />
      )}

      {/* Тултип при наведении (HTML overlay) */}
      {(isHovered || isTooltipHovered) && (
        <Html
          divProps={{
            style: {
              position: 'absolute',
              top: -150,
              left: RADIUS + 10,
              pointerEvents: 'auto',
            },
          }}
        >
          <div
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <SquadTooltip squad={squad} onDetach={handleDetach} />
          </div>
        </Html>
      )}
    </Group>
  );
};

export default SquadIcon;
