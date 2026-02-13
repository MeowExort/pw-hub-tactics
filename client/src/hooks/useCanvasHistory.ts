/**
 * Хук для управления историей изменений на холсте (Undo/Redo).
 * 
 * Реализация основана на паттерне "Хранение состояний" (State-based):
 * - Каждое изменение сохраняет полный снимок состояния объектов
 * - Undo восстанавливает предыдущий снимок
 * - Redo восстанавливает следующий снимок
 * 
 * Преимущества данного подхода перед паттерном Command:
 * - Проще реализация для сложных объектов с множеством свойств
 * - Не требует реализации обратных операций для каждого действия
 * - Легче отлаживать - можно просмотреть любое состояние
 * 
 * Ограничения:
 * - Больше потребление памяти (хранятся полные снимки)
 * - Максимум 20 шагов истории для оптимизации памяти
 */

import { useState, useCallback, useRef } from 'react';
import { CanvasObject } from '../types/canvas-objects';

/** Максимальное количество шагов в истории */
const MAX_HISTORY_SIZE = 20;

/**
 * Интерфейс возвращаемого значения хука useCanvasHistory.
 */
export interface CanvasHistoryState {
  /** Текущее состояние объектов на холсте */
  objects: CanvasObject[];
  /** Можно ли выполнить Undo */
  canUndo: boolean;
  /** Можно ли выполнить Redo */
  canRedo: boolean;
  /** Количество шагов, доступных для Undo */
  undoCount: number;
  /** Количество шагов, доступных для Redo */
  redoCount: number;
}

/**
 * Интерфейс действий хука useCanvasHistory.
 */
export interface CanvasHistoryActions {
  /** Отменить последнее действие */
  undo: () => CanvasObject[] | null;
  /** Повторить отмененное действие */
  redo: () => CanvasObject[] | null;
  /** Сохранить новое состояние в историю */
  pushState: (objects: CanvasObject[]) => void;
  /** Установить состояние без сохранения в историю (для внешней синхронизации) */
  setObjectsWithoutHistory: (objects: CanvasObject[]) => void;
  /** Очистить всю историю */
  clearHistory: () => void;
}

/**
 * Хук для управления историей изменений на холсте.
 * 
 * @param initialObjects Начальное состояние объектов
 * @returns Состояние и действия для работы с историей
 * 
 * @example
 * ```tsx
 * const { state, actions } = useCanvasHistory([]);
 * 
 * // Добавить объект
 * actions.pushState([...state.objects, newObject]);
 * 
 * // Отменить
 * if (state.canUndo) {
 *   const prevState = actions.undo();
 * }
 * ```
 */
export function useCanvasHistory(
  initialObjects: CanvasObject[] = []
): { state: CanvasHistoryState; actions: CanvasHistoryActions } {
  // Текущее состояние объектов
  const [objects, setObjects] = useState<CanvasObject[]>(initialObjects);
  
  /**
   * Стек истории для Undo.
   * Хранит предыдущие состояния объектов.
   * Последний элемент - самое недавнее состояние для отмены.
   */
  const undoStackRef = useRef<CanvasObject[][]>([]);
  
  /**
   * Стек истории для Redo.
   * Хранит отмененные состояния.
   * Последний элемент - самое недавнее отмененное состояние.
   */
  const redoStackRef = useRef<CanvasObject[][]>([]);

  // Для принудительного обновления компонента при изменении стеков
  const [, forceUpdate] = useState({});

  /**
   * Сохраняет новое состояние в историю.
   * Очищает стек Redo, так как после нового действия
   * ветка отмененных действий становится недействительной.
   */
  const pushState = useCallback((newObjects: CanvasObject[]) => {
    // Сохраняем текущее состояние в стек Undo
    undoStackRef.current = [
      ...undoStackRef.current.slice(-(MAX_HISTORY_SIZE - 1)),
      objects,
    ];
    
    // Очищаем стек Redo - новое действие отменяет возможность Redo
    redoStackRef.current = [];
    
    // Устанавливаем новое состояние
    setObjects(newObjects);
    forceUpdate({});
  }, [objects]);

  /**
   * Отменяет последнее действие (Undo).
   * Перемещает текущее состояние в стек Redo.
   * 
   * @returns Восстановленное состояние или null если Undo невозможен
   */
  const undo = useCallback((): CanvasObject[] | null => {
    if (undoStackRef.current.length === 0) {
      return null;
    }

    // Извлекаем предыдущее состояние из стека Undo
    const previousState = undoStackRef.current[undoStackRef.current.length - 1];
    undoStackRef.current = undoStackRef.current.slice(0, -1);

    // Сохраняем текущее состояние в стек Redo
    redoStackRef.current = [...redoStackRef.current, objects];

    // Восстанавливаем предыдущее состояние
    setObjects(previousState);
    forceUpdate({});
    
    return previousState;
  }, [objects]);

  /**
   * Повторяет отмененное действие (Redo).
   * Перемещает текущее состояние в стек Undo.
   * 
   * @returns Восстановленное состояние или null если Redo невозможен
   */
  const redo = useCallback((): CanvasObject[] | null => {
    if (redoStackRef.current.length === 0) {
      return null;
    }

    // Извлекаем следующее состояние из стека Redo
    const nextState = redoStackRef.current[redoStackRef.current.length - 1];
    redoStackRef.current = redoStackRef.current.slice(0, -1);

    // Сохраняем текущее состояние в стек Undo
    undoStackRef.current = [...undoStackRef.current, objects];

    // Восстанавливаем следующее состояние
    setObjects(nextState);
    forceUpdate({});
    
    return nextState;
  }, [objects]);

  /**
   * Устанавливает состояние без сохранения в историю.
   * Используется для синхронизации с сервером,
   * чтобы не засорять историю внешними изменениями.
   */
  const setObjectsWithoutHistory = useCallback((newObjects: CanvasObject[]) => {
    setObjects(newObjects);
  }, []);

  /**
   * Очищает всю историю.
   * Используется при сбросе состояния или смене комнаты.
   */
  const clearHistory = useCallback(() => {
    undoStackRef.current = [];
    redoStackRef.current = [];
    forceUpdate({});
  }, []);

  return {
    state: {
      objects,
      canUndo: undoStackRef.current.length > 0,
      canRedo: redoStackRef.current.length > 0,
      undoCount: undoStackRef.current.length,
      redoCount: redoStackRef.current.length,
    },
    actions: {
      undo,
      redo,
      pushState,
      setObjectsWithoutHistory,
      clearHistory,
    },
  };
}
