/**
 * Хук для управления состоянием отрядов и выделений (detachments).
 * 
 * Логика работы:
 * - Хранит список отрядов (squads) и выделенных персонажей (detachments)
 * - Позволяет создавать выделения - "вытаскивать" персонажа из отряда на карту
 * - Выделенный персонаж сохраняет связь с родительским отрядом
 * - Персонаж может быть возвращён в отряд (удаление выделения)
 */

import { useState, useCallback } from 'react';
import { Squad, Detachment, Character } from '../types/squad';

/**
 * Генерирует уникальный ID для выделения
 */
const generateDetachmentId = (): string => {
  return `detach-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Возвращаемый тип хука useSquadState
 */
export interface UseSquadStateReturn {
  /** Список всех отрядов */
  squads: Squad[];
  /** Список всех выделений */
  detachments: Detachment[];
  /** Добавить новый отряд */
  addSquad: (squad: Squad) => void;
  /** Удалить отряд */
  removeSquad: (squadId: string) => void;
  /** Создать выделение персонажа из отряда */
  createDetachment: (squadId: string, characterId: string, x: number, y: number) => void;
  /** Вернуть персонажа в отряд (удалить выделение) */
  returnToSquad: (detachmentId: string) => void;
  /** Обновить позицию выделения */
  updateDetachmentPosition: (detachmentId: string, x: number, y: number) => void;
  /** Обновить позицию отряда */
  updateSquadPosition: (squadId: string, x: number, y: number) => void;
  /** Получить персонажа из отряда по ID */
  getCharacterFromSquad: (squadId: string, characterId: string) => Character | undefined;
  /** Получить отряд по ID выделения */
  getSquadByDetachment: (detachmentId: string) => Squad | undefined;
  /** Установить полное состояние (для синхронизации) */
  setState: (squads: Squad[], detachments: Detachment[]) => void;
}

/**
 * Хук для управления состоянием отрядов и выделений.
 * Предоставляет CRUD операции для отрядов и механику detachment.
 */
export function useSquadState(): UseSquadStateReturn {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [detachments, setDetachments] = useState<Detachment[]>([]);

  /**
   * Добавляет новый отряд в состояние
   */
  const addSquad = useCallback((squad: Squad) => {
    setSquads((prev) => [...prev, squad]);
  }, []);

  /**
   * Удаляет отряд и все связанные с ним выделения
   */
  const removeSquad = useCallback((squadId: string) => {
    setSquads((prev) => prev.filter((s) => s.id !== squadId));
    // Удаляем все выделения этого отряда
    setDetachments((prev) => prev.filter((d) => d.parentSquadId !== squadId));
  }, []);

  /**
   * Создаёт выделение персонажа из отряда.
   * Персонаж "вытаскивается" на карту как отдельный объект.
   * Не создаёт дубликат, если персонаж уже выделен.
   */
  const createDetachment = useCallback((squadId: string, characterId: string, x: number, y: number) => {
    setDetachments((prev) => {
      // Проверяем, не выделен ли уже этот персонаж
      const alreadyDetached = prev.some(
        (d) => d.parentSquadId === squadId && d.characterId === characterId
      );
      
      if (alreadyDetached) {
        return prev; // Не создаём дубликат
      }

      const newDetachment: Detachment = {
        id: generateDetachmentId(),
        parentSquadId: squadId,
        characterId,
        x,
        y,
      };

      return [...prev, newDetachment];
    });
  }, []);

  /**
   * Возвращает персонажа в отряд (удаляет выделение)
   */
  const returnToSquad = useCallback((detachmentId: string) => {
    setDetachments((prev) => prev.filter((d) => d.id !== detachmentId));
  }, []);

  /**
   * Обновляет позицию выделения на карте
   */
  const updateDetachmentPosition = useCallback((detachmentId: string, x: number, y: number) => {
    setDetachments((prev) =>
      prev.map((d) => (d.id === detachmentId ? { ...d, x, y } : d))
    );
  }, []);

  /**
   * Обновляет позицию отряда на карте
   */
  const updateSquadPosition = useCallback((squadId: string, x: number, y: number) => {
    setSquads((prev) =>
      prev.map((s) => (s.id === squadId ? { ...s, x, y } : s))
    );
  }, []);

  /**
   * Возвращает персонажа из отряда по ID
   */
  const getCharacterFromSquad = useCallback((squadId: string, characterId: string): Character | undefined => {
    const squad = squads.find((s) => s.id === squadId);
    return squad?.characters.find((c) => c.id === characterId);
  }, [squads]);

  /**
   * Возвращает отряд по ID выделения
   */
  const getSquadByDetachment = useCallback((detachmentId: string): Squad | undefined => {
    const detachment = detachments.find((d) => d.id === detachmentId);
    if (!detachment) return undefined;
    return squads.find((s) => s.id === detachment.parentSquadId);
  }, [squads, detachments]);

  /**
   * Устанавливает полное состояние (для синхронизации с сервером)
   */
  const setState = useCallback((newSquads: Squad[], newDetachments: Detachment[]) => {
    setSquads(newSquads);
    setDetachments(newDetachments);
  }, []);

  return {
    squads,
    detachments,
    addSquad,
    removeSquad,
    createDetachment,
    returnToSquad,
    updateDetachmentPosition,
    updateSquadPosition,
    getCharacterFromSquad,
    getSquadByDetachment,
    setState,
  };
}
