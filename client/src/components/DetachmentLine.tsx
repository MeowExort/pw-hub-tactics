/**
 * Компонент пунктирной линии связи между отрядом и выделенным персонажем.
 * Визуализирует принадлежность выделения к родительскому отряду.
 */

import React from 'react';
import { Line } from 'react-konva';

/**
 * Пропсы компонента DetachmentLine
 */
interface DetachmentLineProps {
  /** Координаты начала линии (отряд) */
  startX: number;
  startY: number;
  /** Координаты конца линии (выделение) */
  endX: number;
  endY: number;
  /** Цвет линии (обычно цвет отряда) */
  color: string;
}

/**
 * Компонент пунктирной линии связи.
 * Соединяет отряд с выделенным из него персонажем.
 */
export const DetachmentLine: React.FC<DetachmentLineProps> = ({
  startX,
  startY,
  endX,
  endY,
  color,
}) => {
  return (
    <Line
      points={[startX, startY, endX, endY]}
      stroke={color}
      strokeWidth={2}
      dash={[10, 5]}
      opacity={0.6}
      lineCap="round"
      data-testid="detachment-line"
    />
  );
};

export default DetachmentLine;
