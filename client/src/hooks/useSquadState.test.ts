/**
 * Тесты для хука useSquadState.
 * TDD: Red phase - тесты для логики управления отрядами и выделениями.
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSquadState } from './useSquadState';
import { Squad, Character } from '../types/squad';

// Мок-данные
const mockCharacters: Character[] = [
  { id: 'char-1', nickname: 'Warrior1', characterClass: 'warrior' },
  { id: 'char-2', nickname: 'Mage1', characterClass: 'mage' },
];

const mockSquad: Squad = {
  id: 'squad-1',
  name: 'Test Squad',
  x: 100,
  y: 100,
  characters: mockCharacters,
  color: '#ff5500',
};

describe('useSquadState', () => {
  it('должен инициализироваться с пустым состоянием', () => {
    const { result } = renderHook(() => useSquadState());
    
    expect(result.current.squads).toEqual([]);
    expect(result.current.detachments).toEqual([]);
  });

  it('должен добавлять отряд', () => {
    const { result } = renderHook(() => useSquadState());
    
    act(() => {
      result.current.addSquad(mockSquad);
    });
    
    expect(result.current.squads).toHaveLength(1);
    expect(result.current.squads[0].id).toBe('squad-1');
  });

  it('должен создавать выделение персонажа из отряда', () => {
    const { result } = renderHook(() => useSquadState());
    
    act(() => {
      result.current.addSquad(mockSquad);
    });
    
    act(() => {
      result.current.createDetachment('squad-1', 'char-1', 150, 150);
    });
    
    expect(result.current.detachments).toHaveLength(1);
    expect(result.current.detachments[0].parentSquadId).toBe('squad-1');
    expect(result.current.detachments[0].characterId).toBe('char-1');
    expect(result.current.detachments[0].x).toBe(150);
    expect(result.current.detachments[0].y).toBe(150);
  });

  it('должен возвращать персонажа в отряд (удалять выделение)', () => {
    const { result } = renderHook(() => useSquadState());
    
    act(() => {
      result.current.addSquad(mockSquad);
      result.current.createDetachment('squad-1', 'char-1', 150, 150);
    });
    
    const detachmentId = result.current.detachments[0].id;
    
    act(() => {
      result.current.returnToSquad(detachmentId);
    });
    
    expect(result.current.detachments).toHaveLength(0);
  });

  it('должен обновлять позицию выделения', () => {
    const { result } = renderHook(() => useSquadState());
    
    act(() => {
      result.current.addSquad(mockSquad);
      result.current.createDetachment('squad-1', 'char-1', 150, 150);
    });
    
    const detachmentId = result.current.detachments[0].id;
    
    act(() => {
      result.current.updateDetachmentPosition(detachmentId, 200, 250);
    });
    
    expect(result.current.detachments[0].x).toBe(200);
    expect(result.current.detachments[0].y).toBe(250);
  });

  it('должен обновлять позицию отряда', () => {
    const { result } = renderHook(() => useSquadState());
    
    act(() => {
      result.current.addSquad(mockSquad);
    });
    
    act(() => {
      result.current.updateSquadPosition('squad-1', 300, 350);
    });
    
    expect(result.current.squads[0].x).toBe(300);
    expect(result.current.squads[0].y).toBe(350);
  });

  it('должен возвращать персонажа по ID из отряда', () => {
    const { result } = renderHook(() => useSquadState());
    
    act(() => {
      result.current.addSquad(mockSquad);
    });
    
    const character = result.current.getCharacterFromSquad('squad-1', 'char-1');
    
    expect(character).toBeDefined();
    expect(character?.nickname).toBe('Warrior1');
  });

  it('должен возвращать отряд по ID выделения', () => {
    const { result } = renderHook(() => useSquadState());
    
    act(() => {
      result.current.addSquad(mockSquad);
      result.current.createDetachment('squad-1', 'char-1', 150, 150);
    });
    
    const detachmentId = result.current.detachments[0].id;
    const squad = result.current.getSquadByDetachment(detachmentId);
    
    expect(squad).toBeDefined();
    expect(squad?.id).toBe('squad-1');
  });

  it('не должен создавать дублирующее выделение для того же персонажа', () => {
    const { result } = renderHook(() => useSquadState());
    
    act(() => {
      result.current.addSquad(mockSquad);
      result.current.createDetachment('squad-1', 'char-1', 150, 150);
    });
    
    act(() => {
      // Попытка создать второе выделение для того же персонажа
      result.current.createDetachment('squad-1', 'char-1', 200, 200);
    });
    
    // Должно остаться только одно выделение
    expect(result.current.detachments).toHaveLength(1);
  });
});
