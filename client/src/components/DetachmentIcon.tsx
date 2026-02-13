/**
 * Компонент иконки выделенного персонажа на карте (Konva).
 * Отображает персонажа, "вытащенного" из отряда.
 * Поддерживает перетаскивание и возврат в отряд.
 */

import React from 'react';
import { Group, Circle, Text } from 'react-konva';
import { Detachment, Character, CharacterClass } from '../types/squad';

/**
 * Маппинг классов персонажей на эмодзи-иконки.
 * Соответствует иконкам в SquadTooltip.
 */
const CLASS_ICONS: Record<CharacterClass, string> = {
  warrior: '⚔️',
  mage: '🔮',
  archer: '🏹',
  cleric: '✨',
  barbarian: '🐻',
  venomancer: '🦊',
  assassin: '🗡️',
  psychic: '🔯',
  seeker: '🛡️',
  mystic: '🌙',
  duskblade: '👻',
  stormbringer: '⚡',
  technician: '🔧',
};

/**
 * Пропсы компонента DetachmentIcon
 */
interface DetachmentIconProps {
  /** Данные выделения */
  detachment: Detachment;
  /** Данные персонажа */
  character: Character;
  /** Цвет родительского отряда */
  squadColor: string;
  /** Callback при перемещении */
  onDragMove?: (detachmentId: string, x: number, y: number) => void;
  /** Callback при завершении перемещения */
  onDragEnd?: (detachmentId: string, x: number, y: number) => void;
  /** Callback при двойном клике (возврат в отряд) */
  onReturnToSquad: (detachmentId: string) => void;
}

/**
 * Компонент иконки выделенного персонажа.
 * Отображается как меньший круг с аббревиатурой класса.
 * Двойной клик возвращает персонажа в отряд.
 */
export const DetachmentIcon: React.FC<DetachmentIconProps> = ({
  detachment,
  character,
  squadColor,
  onDragMove,
  onDragEnd,
  onReturnToSquad,
}) => {
  // Радиус иконки выделения (меньше чем у отряда)
  const RADIUS = 18;

  /**
   * Обработчик перемещения
   */
  const handleDragMove = (e: any) => {
    const { x, y } = e.target.position();
    onDragMove?.(detachment.id, x, y);
  };

  /**
   * Обработчик завершения перемещения
   */
  const handleDragEnd = (e: any) => {
    const { x, y } = e.target.position();
    onDragEnd?.(detachment.id, x, y);
  };

  /**
   * Обработчик двойного клика - возврат в отряд
   */
  const handleDblClick = () => {
    onReturnToSquad(detachment.id);
  };

  return (
    <Group
      x={detachment.x}
      y={detachment.y}
      draggable
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDblClick={handleDblClick}
      data-testid="detachment-icon"
    >
      {/* Круг персонажа с пунктирной обводкой */}
      <Circle
        radius={RADIUS}
        fill={squadColor}
        stroke="#ffffff"
        strokeWidth={2}
        dash={[5, 3]}
        shadowBlur={5}
        shadowColor={squadColor}
        opacity={0.9}
      />

      {/* Иконка класса (эмодзи) - центрируем относительно круга */}
      <Text
        text={CLASS_ICONS[character.characterClass]}
        fontSize={16}
        align="center"
        verticalAlign="middle"
        width={RADIUS * 2}
        height={RADIUS * 2}
        offsetX={RADIUS}
        offsetY={RADIUS}
      />

      {/* Никнейм под иконкой */}
      <Text
        text={character.nickname}
        fontSize={10}
        fill="#ffffff"
        align="center"
        y={RADIUS + 3}
        offsetX={character.nickname.length * 2.5}
      />
    </Group>
  );
};

export default DetachmentIcon;
