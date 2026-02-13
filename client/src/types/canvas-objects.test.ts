/**
 * Тесты для типов и фабричных функций объектов холста.
 * Проверяют корректность создания различных типов фигур.
 */

import { describe, it, expect } from 'vitest';
import {
  CanvasObject,
  PencilObject,
  LineObject,
  CircleObject,
  RectangleObject,
  TextObject,
  CatapultObject,
  DEFAULT_DRAWING_SETTINGS,
} from './canvas-objects';

describe('canvas-objects типы', () => {
  describe('PencilObject', () => {
    it('должен создаваться с корректными свойствами', () => {
      const pencil: PencilObject = {
        id: 'pencil-1',
        type: 'pencil',
        x: 100,
        y: 100,
        points: [100, 100, 150, 150, 200, 120],
        stroke: '#ff0000',
        strokeWidth: 3,
      };

      expect(pencil.type).toBe('pencil');
      expect(pencil.points).toHaveLength(6);
      expect(pencil.stroke).toBe('#ff0000');
    });
  });

  describe('LineObject', () => {
    it('должен создаваться с двумя точками', () => {
      const line: LineObject = {
        id: 'line-1',
        type: 'line',
        x: 50,
        y: 50,
        points: [50, 50, 200, 200],
        stroke: '#00ff00',
        strokeWidth: 2,
      };

      expect(line.type).toBe('line');
      expect(line.points).toHaveLength(4);
    });
  });

  describe('CircleObject', () => {
    it('должен создаваться с радиусом', () => {
      const circle: CircleObject = {
        id: 'circle-1',
        type: 'circle',
        x: 300,
        y: 300,
        radius: 50,
        fill: '#0000ff',
        stroke: '#000000',
        strokeWidth: 2,
      };

      expect(circle.type).toBe('circle');
      expect(circle.radius).toBe(50);
      expect(circle.fill).toBe('#0000ff');
    });
  });

  describe('RectangleObject', () => {
    it('должен создаваться с шириной и высотой', () => {
      const rect: RectangleObject = {
        id: 'rect-1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        fill: '#ffff00',
        stroke: '#000000',
        strokeWidth: 1,
      };

      expect(rect.type).toBe('rectangle');
      expect(rect.width).toBe(200);
      expect(rect.height).toBe(150);
    });
  });

  describe('TextObject', () => {
    it('должен создаваться с текстом и размером шрифта', () => {
      const text: TextObject = {
        id: 'text-1',
        type: 'text',
        x: 400,
        y: 200,
        text: 'Тестовая метка',
        fontSize: 16,
        fill: '#333333',
      };

      expect(text.type).toBe('text');
      expect(text.text).toBe('Тестовая метка');
      expect(text.fontSize).toBe(16);
    });
  });

  describe('CatapultObject', () => {
    it('должен создаваться для совместимости', () => {
      const catapult: CatapultObject = {
        id: 'catapult-1',
        type: 'catapult',
        x: 500,
        y: 500,
      };

      expect(catapult.type).toBe('catapult');
    });
  });

  describe('CanvasObject union type', () => {
    it('должен корректно дискриминировать типы по полю type', () => {
      const objects: CanvasObject[] = [
        { id: '1', type: 'pencil', x: 0, y: 0, points: [], stroke: '#000', strokeWidth: 1 },
        { id: '2', type: 'line', x: 0, y: 0, points: [0, 0, 10, 10], stroke: '#000', strokeWidth: 1 },
        { id: '3', type: 'circle', x: 0, y: 0, radius: 10, fill: '#fff', stroke: '#000', strokeWidth: 1 },
        { id: '4', type: 'rectangle', x: 0, y: 0, width: 10, height: 10, fill: '#fff', stroke: '#000', strokeWidth: 1 },
        { id: '5', type: 'text', x: 0, y: 0, text: 'test', fontSize: 12, fill: '#000' },
        { id: '6', type: 'catapult', x: 0, y: 0 },
      ];

      expect(objects).toHaveLength(6);
      
      // Проверяем дискриминацию типов
      objects.forEach(obj => {
        switch (obj.type) {
          case 'pencil':
            expect(obj.points).toBeDefined();
            break;
          case 'line':
            expect(obj.points).toHaveLength(4);
            break;
          case 'circle':
            expect(obj.radius).toBeDefined();
            break;
          case 'rectangle':
            expect(obj.width).toBeDefined();
            expect(obj.height).toBeDefined();
            break;
          case 'text':
            expect(obj.text).toBeDefined();
            break;
          case 'catapult':
            // Только базовые свойства
            expect(obj.id).toBeDefined();
            break;
        }
      });
    });
  });

  describe('DEFAULT_DRAWING_SETTINGS', () => {
    it('должен содержать корректные значения по умолчанию', () => {
      expect(DEFAULT_DRAWING_SETTINGS.strokeColor).toBe('#ff0000');
      expect(DEFAULT_DRAWING_SETTINGS.fillColor).toBe('transparent');
      expect(DEFAULT_DRAWING_SETTINGS.strokeWidth).toBe(3);
      expect(DEFAULT_DRAWING_SETTINGS.fontSize).toBe(16);
    });
  });
});
