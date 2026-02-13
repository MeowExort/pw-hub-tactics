/**
 * Слой отрядов и выделений для Konva Stage.
 * Объединяет отображение отрядов, выделенных персонажей и связей между ними.
 */

import React from 'react';
import { Layer } from 'react-konva';
import { Squad, Detachment, Character } from '../types/squad';
import { SquadIcon } from './SquadIcon';
import { DetachmentIcon } from './DetachmentIcon';
import { DetachmentLine } from './DetachmentLine';

/**
 * Пропсы компонента SquadLayer
 */
interface SquadLayerProps {
  /** Список отрядов */
  squads: Squad[];
  /** Список выделений */
  detachments: Detachment[];
  /** Callback при перемещении отряда */
  onSquadDragMove?: (squadId: string, x: number, y: number) => void;
  /** Callback при завершении перемещения отряда */
  onSquadDragEnd?: (squadId: string, x: number, y: number) => void;
  /** Callback при выделении персонажа */
  onDetach: (squadId: string, characterId: string, x: number, y: number) => void;
  /** Callback при перемещении выделения */
  onDetachmentDragMove?: (detachmentId: string, x: number, y: number) => void;
  /** Callback при завершении перемещения выделения */
  onDetachmentDragEnd?: (detachmentId: string, x: number, y: number) => void;
  /** Callback при возврате персонажа в отряд */
  onReturnToSquad: (detachmentId: string) => void;
}

/**
 * Компонент слоя отрядов.
 * Отрисовывает все отряды, выделения и пунктирные связи между ними.
 */
export const SquadLayer: React.FC<SquadLayerProps> = ({
  squads,
  detachments,
  onSquadDragMove,
  onSquadDragEnd,
  onDetach,
  onDetachmentDragMove,
  onDetachmentDragEnd,
  onReturnToSquad,
}) => {
  /**
   * Получает персонажа из отряда по ID
   */
  const getCharacter = (squadId: string, characterId: string): Character | undefined => {
    const squad = squads.find((s) => s.id === squadId);
    return squad?.characters.find((c) => c.id === characterId);
  };

  /**
   * Получает отряд по ID
   */
  const getSquad = (squadId: string): Squad | undefined => {
    return squads.find((s) => s.id === squadId);
  };

  return (
    <Layer>
      {/* Сначала рисуем линии связи (под иконками) */}
      {detachments.map((detachment) => {
        const squad = getSquad(detachment.parentSquadId);
        if (!squad) return null;

        return (
          <DetachmentLine
            key={`line-${detachment.id}`}
            startX={squad.x}
            startY={squad.y}
            endX={detachment.x}
            endY={detachment.y}
            color={squad.color}
          />
        );
      })}

      {/* Затем рисуем иконки отрядов */}
      {squads.map((squad) => (
        <SquadIcon
          key={squad.id}
          squad={squad}
          onDragMove={onSquadDragMove}
          onDragEnd={onSquadDragEnd}
          onDetach={onDetach}
        />
      ))}

      {/* Наконец рисуем иконки выделений */}
      {detachments.map((detachment) => {
        const squad = getSquad(detachment.parentSquadId);
        const character = getCharacter(detachment.parentSquadId, detachment.characterId);
        
        if (!squad || !character) return null;

        return (
          <DetachmentIcon
            key={detachment.id}
            detachment={detachment}
            character={character}
            squadColor={squad.color}
            onDragMove={onDetachmentDragMove}
            onDragEnd={onDetachmentDragEnd}
            onReturnToSquad={onReturnToSquad}
          />
        );
      })}
    </Layer>
  );
};

export default SquadLayer;
