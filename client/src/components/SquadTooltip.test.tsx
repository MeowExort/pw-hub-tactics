/**
 * Тесты для компонента SquadTooltip.
 * TDD: Red phase - тесты написаны до реализации компонента.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SquadTooltip } from './SquadTooltip';
import { Squad, Character } from '../types/squad';

// Мок-данные для тестов
const mockCharacters: Character[] = [
  { id: 'char-1', nickname: 'TestWarrior', characterClass: 'warrior' },
  { id: 'char-2', nickname: 'TestMage', characterClass: 'mage' },
  { id: 'char-3', nickname: 'TestCleric', characterClass: 'cleric' },
];

const mockSquad: Squad = {
  id: 'squad-1',
  name: 'Alpha Squad',
  x: 100,
  y: 100,
  characters: mockCharacters,
  color: '#ff5500',
};

describe('SquadTooltip', () => {
  it('должен отображать название отряда', () => {
    render(
      <SquadTooltip 
        squad={mockSquad} 
        onDetach={vi.fn()} 
      />
    );
    
    expect(screen.getByText('Alpha Squad')).toBeInTheDocument();
  });

  it('должен отображать список персонажей с никнеймами', () => {
    render(
      <SquadTooltip 
        squad={mockSquad} 
        onDetach={vi.fn()} 
      />
    );
    
    expect(screen.getByText('TestWarrior')).toBeInTheDocument();
    expect(screen.getByText('TestMage')).toBeInTheDocument();
    expect(screen.getByText('TestCleric')).toBeInTheDocument();
  });

  it('должен отображать иконки классов персонажей', () => {
    render(
      <SquadTooltip 
        squad={mockSquad} 
        onDetach={vi.fn()} 
      />
    );
    
    // Проверяем наличие иконок классов по data-testid
    expect(screen.getByTestId('class-icon-warrior')).toBeInTheDocument();
    expect(screen.getByTestId('class-icon-mage')).toBeInTheDocument();
    expect(screen.getByTestId('class-icon-cleric')).toBeInTheDocument();
  });

  it('должен вызывать onDetach при клике на кнопку выделения персонажа', () => {
    const onDetachMock = vi.fn();
    
    render(
      <SquadTooltip 
        squad={mockSquad} 
        onDetach={onDetachMock} 
      />
    );
    
    // Кликаем на кнопку выделения первого персонажа
    const detachButtons = screen.getAllByTestId('detach-button');
    fireEvent.click(detachButtons[0]);
    
    expect(onDetachMock).toHaveBeenCalledWith('squad-1', 'char-1');
  });

  it('должен отображать отряд без названия корректно', () => {
    const squadWithoutName: Squad = {
      ...mockSquad,
      name: undefined,
    };
    
    render(
      <SquadTooltip 
        squad={squadWithoutName} 
        onDetach={vi.fn()} 
      />
    );
    
    // Должен показать ID отряда или дефолтное название
    expect(screen.getByTestId('squad-tooltip')).toBeInTheDocument();
  });

  it('должен корректно обрабатывать пустой список персонажей', () => {
    const emptySquad: Squad = {
      ...mockSquad,
      characters: [],
    };
    
    render(
      <SquadTooltip 
        squad={emptySquad} 
        onDetach={vi.fn()} 
      />
    );
    
    expect(screen.getByText(/пусто|нет персонажей/i)).toBeInTheDocument();
  });
});
