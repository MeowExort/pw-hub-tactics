/**
 * Компонент тултипа отряда.
 * Отображает список персонажей с иконками классов и кнопками выделения.
 * Появляется при наведении на иконку отряда на карте.
 */

import React from 'react';
import { Squad, CharacterClass } from '../types/squad';

/**
 * Пропсы компонента SquadTooltip
 */
interface SquadTooltipProps {
  /** Данные отряда для отображения */
  squad: Squad;
  /** Callback при выделении персонажа из отряда */
  onDetach: (squadId: string, characterId: string) => void;
}

/**
 * Маппинг классов персонажей на эмодзи-иконки.
 * В будущем можно заменить на реальные изображения.
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
 * Компонент тултипа отряда.
 * Показывает состав отряда и позволяет выделить персонажа.
 */
export const SquadTooltip: React.FC<SquadTooltipProps> = ({ squad, onDetach }) => {
  const displayName = squad.name || `Отряд ${squad.id}`;
  const hasCharacters = squad.characters.length > 0;

  return (
    <div 
      className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl min-w-[200px]"
      data-testid="squad-tooltip"
    >
      {/* Заголовок с названием отряда */}
      <div 
        className="font-bold text-white mb-2 pb-2 border-b border-slate-600"
        style={{ borderLeftColor: squad.color, borderLeftWidth: 3 }}
      >
        {displayName}
      </div>

      {/* Список персонажей */}
      {hasCharacters ? (
        <ul className="space-y-1">
          {squad.characters.map((character) => (
            <li 
              key={character.id}
              className="flex items-center justify-between gap-2 text-slate-200 hover:bg-slate-700 rounded px-1 py-0.5"
            >
              <div className="flex items-center gap-2">
                {/* Иконка класса */}
                <span 
                  data-testid={`class-icon-${character.characterClass}`}
                  className="text-lg"
                  title={character.characterClass}
                >
                  {CLASS_ICONS[character.characterClass]}
                </span>
                {/* Никнейм */}
                <span className="text-sm">{character.nickname}</span>
              </div>
              
              {/* Кнопка выделения */}
              <button
                data-testid="detach-button"
                onClick={() => onDetach(squad.id, character.id)}
                className="text-xs bg-orange-600 hover:bg-orange-500 text-white px-2 py-0.5 rounded"
                title="Выделить на карту"
              >
                ↗
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-slate-400 text-sm italic">
          Нет персонажей
        </div>
      )}
    </div>
  );
};

export default SquadTooltip;
