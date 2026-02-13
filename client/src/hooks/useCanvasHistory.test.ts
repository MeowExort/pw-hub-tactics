/**
 * Тесты для хука useCanvasHistory.
 * Проверяют корректность работы системы Undo/Redo.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvasHistory } from './useCanvasHistory';
import { CanvasObject, CircleObject, RectangleObject } from '../types/canvas-objects';

/**
 * Вспомогательная функция для создания тестового объекта "Круг".
 */
const createCircle = (id: string, x: number, y: number): CircleObject => ({
  id,
  type: 'circle',
  x,
  y,
  radius: 50,
  fill: '#ff0000',
  stroke: '#000000',
  strokeWidth: 2,
});

/**
 * Вспомогательная функция для создания тестового объекта "Прямоугольник".
 */
const createRectangle = (id: string, x: number, y: number): RectangleObject => ({
  id,
  type: 'rectangle',
  x,
  y,
  width: 100,
  height: 50,
  fill: '#00ff00',
  stroke: '#000000',
  strokeWidth: 2,
});

describe('useCanvasHistory', () => {
  describe('инициализация', () => {
    it('должен инициализироваться с пустым массивом объектов по умолчанию', () => {
      const { result } = renderHook(() => useCanvasHistory());
      
      expect(result.current.state.objects).toEqual([]);
      expect(result.current.state.canUndo).toBe(false);
      expect(result.current.state.canRedo).toBe(false);
    });

    it('должен инициализироваться с переданными объектами', () => {
      const initialObjects: CanvasObject[] = [createCircle('1', 100, 100)];
      const { result } = renderHook(() => useCanvasHistory(initialObjects));
      
      expect(result.current.state.objects).toEqual(initialObjects);
    });
  });

  describe('pushState', () => {
    it('должен добавлять новое состояние и включать возможность Undo', () => {
      const { result } = renderHook(() => useCanvasHistory());
      
      const newObjects: CanvasObject[] = [createCircle('1', 100, 100)];
      
      act(() => {
        result.current.actions.pushState(newObjects);
      });
      
      expect(result.current.state.objects).toEqual(newObjects);
      expect(result.current.state.canUndo).toBe(true);
      expect(result.current.state.undoCount).toBe(1);
    });

    it('должен очищать стек Redo при добавлении нового состояния', () => {
      const { result } = renderHook(() => useCanvasHistory());
      
      // Добавляем состояние
      act(() => {
        result.current.actions.pushState([createCircle('1', 100, 100)]);
      });
      
      // Отменяем
      act(() => {
        result.current.actions.undo();
      });
      
      expect(result.current.state.canRedo).toBe(true);
      
      // Добавляем новое состояние - Redo должен очиститься
      act(() => {
        result.current.actions.pushState([createRectangle('2', 200, 200)]);
      });
      
      expect(result.current.state.canRedo).toBe(false);
      expect(result.current.state.redoCount).toBe(0);
    });

    it('должен ограничивать историю 20 шагами', () => {
      const { result } = renderHook(() => useCanvasHistory());
      
      // Добавляем 25 состояний
      for (let i = 0; i < 25; i++) {
        act(() => {
          result.current.actions.pushState([createCircle(`${i}`, i * 10, i * 10)]);
        });
      }
      
      // Должно быть максимум 20 шагов для Undo
      expect(result.current.state.undoCount).toBe(20);
    });
  });

  describe('undo', () => {
    it('должен возвращать null если история пуста', () => {
      const { result } = renderHook(() => useCanvasHistory());
      
      let undoResult: CanvasObject[] | null = null;
      act(() => {
        undoResult = result.current.actions.undo();
      });
      
      expect(undoResult).toBeNull();
    });

    it('должен восстанавливать предыдущее состояние', () => {
      const { result } = renderHook(() => useCanvasHistory());
      
      const state1: CanvasObject[] = [createCircle('1', 100, 100)];
      const state2: CanvasObject[] = [createCircle('1', 100, 100), createRectangle('2', 200, 200)];
      
      act(() => {
        result.current.actions.pushState(state1);
      });
      
      act(() => {
        result.current.actions.pushState(state2);
      });
      
      act(() => {
        result.current.actions.undo();
      });
      
      expect(result.current.state.objects).toEqual(state1);
      expect(result.current.state.canRedo).toBe(true);
    });

    it('должен корректно работать при множественных Undo', () => {
      const { result } = renderHook(() => useCanvasHistory());
      
      const states: CanvasObject[][] = [
        [createCircle('1', 100, 100)],
        [createCircle('1', 100, 100), createRectangle('2', 200, 200)],
        [createCircle('1', 100, 100), createRectangle('2', 200, 200), createCircle('3', 300, 300)],
      ];
      
      // Добавляем все состояния
      states.forEach((state) => {
        act(() => {
          result.current.actions.pushState(state);
        });
      });
      
      // Отменяем все действия
      act(() => {
        result.current.actions.undo(); // -> state2
      });
      expect(result.current.state.objects).toEqual(states[1]);
      
      act(() => {
        result.current.actions.undo(); // -> state1
      });
      expect(result.current.state.objects).toEqual(states[0]);
      
      act(() => {
        result.current.actions.undo(); // -> пустой массив
      });
      expect(result.current.state.objects).toEqual([]);
      
      // Больше нечего отменять
      expect(result.current.state.canUndo).toBe(false);
    });
  });

  describe('redo', () => {
    it('должен возвращать null если стек Redo пуст', () => {
      const { result } = renderHook(() => useCanvasHistory());
      
      let redoResult: CanvasObject[] | null = null;
      act(() => {
        redoResult = result.current.actions.redo();
      });
      
      expect(redoResult).toBeNull();
    });

    it('должен восстанавливать отмененное состояние', () => {
      const { result } = renderHook(() => useCanvasHistory());
      
      const state1: CanvasObject[] = [createCircle('1', 100, 100)];
      
      act(() => {
        result.current.actions.pushState(state1);
      });
      
      act(() => {
        result.current.actions.undo();
      });
      
      act(() => {
        result.current.actions.redo();
      });
      
      expect(result.current.state.objects).toEqual(state1);
      expect(result.current.state.canUndo).toBe(true);
      expect(result.current.state.canRedo).toBe(false);
    });

    it('должен корректно работать при чередовании Undo/Redo', () => {
      const { result } = renderHook(() => useCanvasHistory());
      
      const state1: CanvasObject[] = [createCircle('1', 100, 100)];
      const state2: CanvasObject[] = [createCircle('1', 100, 100), createRectangle('2', 200, 200)];
      
      act(() => {
        result.current.actions.pushState(state1);
      });
      
      act(() => {
        result.current.actions.pushState(state2);
      });
      
      // Undo -> state1
      act(() => {
        result.current.actions.undo();
      });
      expect(result.current.state.objects).toEqual(state1);
      
      // Redo -> state2
      act(() => {
        result.current.actions.redo();
      });
      expect(result.current.state.objects).toEqual(state2);
      
      // Undo -> state1
      act(() => {
        result.current.actions.undo();
      });
      expect(result.current.state.objects).toEqual(state1);
    });
  });

  describe('setObjectsWithoutHistory', () => {
    it('должен устанавливать состояние без добавления в историю', () => {
      const { result } = renderHook(() => useCanvasHistory());
      
      const newObjects: CanvasObject[] = [createCircle('1', 100, 100)];
      
      act(() => {
        result.current.actions.setObjectsWithoutHistory(newObjects);
      });
      
      expect(result.current.state.objects).toEqual(newObjects);
      expect(result.current.state.canUndo).toBe(false);
      expect(result.current.state.undoCount).toBe(0);
    });
  });

  describe('clearHistory', () => {
    it('должен очищать всю историю', () => {
      const { result } = renderHook(() => useCanvasHistory());
      
      // Добавляем несколько состояний
      act(() => {
        result.current.actions.pushState([createCircle('1', 100, 100)]);
      });
      
      act(() => {
        result.current.actions.pushState([createRectangle('2', 200, 200)]);
      });
      
      // Отменяем одно действие для создания Redo
      act(() => {
        result.current.actions.undo();
      });
      
      expect(result.current.state.canUndo).toBe(true);
      expect(result.current.state.canRedo).toBe(true);
      
      // Очищаем историю
      act(() => {
        result.current.actions.clearHistory();
      });
      
      expect(result.current.state.canUndo).toBe(false);
      expect(result.current.state.canRedo).toBe(false);
      expect(result.current.state.undoCount).toBe(0);
      expect(result.current.state.redoCount).toBe(0);
    });
  });

  describe('счетчики undoCount и redoCount', () => {
    it('должен корректно отслеживать количество шагов', () => {
      const { result } = renderHook(() => useCanvasHistory());
      
      expect(result.current.state.undoCount).toBe(0);
      expect(result.current.state.redoCount).toBe(0);
      
      // Добавляем 3 состояния
      for (let i = 1; i <= 3; i++) {
        act(() => {
          result.current.actions.pushState([createCircle(`${i}`, i * 100, i * 100)]);
        });
      }
      
      expect(result.current.state.undoCount).toBe(3);
      expect(result.current.state.redoCount).toBe(0);
      
      // Отменяем 2 действия
      act(() => {
        result.current.actions.undo();
        result.current.actions.undo();
      });
      
      expect(result.current.state.undoCount).toBe(1);
      expect(result.current.state.redoCount).toBe(2);
      
      // Повторяем 1 действие
      act(() => {
        result.current.actions.redo();
      });
      
      expect(result.current.state.undoCount).toBe(2);
      expect(result.current.state.redoCount).toBe(1);
    });
  });
});
