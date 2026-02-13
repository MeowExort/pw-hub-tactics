'use client';

import React from 'react';
import { DrawingTool, DrawingSettings } from '../types/canvas-objects';

/**
 * Пропсы компонента DrawingToolbar.
 */
interface DrawingToolbarProps {
  /** Текущий выбранный инструмент */
  currentTool: DrawingTool;
  /** Callback при смене инструмента */
  onToolChange: (tool: DrawingTool) => void;
  /** Текущие настройки рисования */
  settings: DrawingSettings;
  /** Callback при изменении настроек */
  onSettingsChange: (settings: DrawingSettings) => void;
  /** Можно ли выполнить Undo */
  canUndo: boolean;
  /** Можно ли выполнить Redo */
  canRedo: boolean;
  /** Callback для Undo */
  onUndo: () => void;
  /** Callback для Redo */
  onRedo: () => void;
}

/**
 * Конфигурация инструментов для отображения в панели.
 */
const TOOLS: { id: DrawingTool; label: string; icon: string }[] = [
  { id: 'select', label: 'Выбор', icon: '👆' },
  { id: 'pencil', label: 'Карандаш', icon: '✏️' },
  { id: 'line', label: 'Линия', icon: '📏' },
  { id: 'circle', label: 'Круг', icon: '⭕' },
  { id: 'rectangle', label: 'Прямоугольник', icon: '⬜' },
  { id: 'text', label: 'Текст', icon: '🔤' },
  { id: 'eraser', label: 'Ластик', icon: '🧹' },
];

/**
 * Панель инструментов для рисования на холсте.
 * Содержит кнопки выбора инструментов, настройки цвета/толщины и кнопки Undo/Redo.
 */
const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  currentTool,
  onToolChange,
  settings,
  onSettingsChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  /**
   * Обработчик изменения цвета обводки.
   */
  const handleStrokeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, strokeColor: e.target.value });
  };

  /**
   * Обработчик изменения цвета заливки.
   */
  const handleFillColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, fillColor: e.target.value });
  };

  /**
   * Обработчик изменения толщины линии.
   */
  const handleStrokeWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, strokeWidth: parseInt(e.target.value, 10) });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-800 rounded-lg shadow-lg">
      {/* Кнопки инструментов */}
      <div className="flex gap-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${currentTool === tool.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }
            `}
            title={tool.label}
            data-testid={`tool-${tool.id}`}
          >
            <span className="mr-1">{tool.icon}</span>
            <span className="hidden sm:inline">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Разделитель */}
      <div className="w-px h-8 bg-slate-600 mx-2" />

      {/* Настройки цвета и толщины */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1 text-slate-300 text-sm">
          <span>Обводка:</span>
          <input
            type="color"
            value={settings.strokeColor}
            onChange={handleStrokeColorChange}
            className="w-8 h-8 rounded cursor-pointer"
            data-testid="stroke-color"
          />
        </label>

        <label className="flex items-center gap-1 text-slate-300 text-sm">
          <span>Заливка:</span>
          <input
            type="color"
            value={settings.fillColor === 'transparent' ? '#ffffff' : settings.fillColor}
            onChange={handleFillColorChange}
            className="w-8 h-8 rounded cursor-pointer"
            data-testid="fill-color"
          />
        </label>

        <label className="flex items-center gap-1 text-slate-300 text-sm">
          <span>Толщина:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={settings.strokeWidth}
            onChange={handleStrokeWidthChange}
            className="w-20"
            data-testid="stroke-width"
          />
          <span className="w-6 text-center">{settings.strokeWidth}</span>
        </label>
      </div>

      {/* Разделитель */}
      <div className="w-px h-8 bg-slate-600 mx-2" />

      {/* Кнопки Undo/Redo */}
      <div className="flex gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`
            px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${canUndo
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }
          `}
          title="Отменить (Ctrl+Z)"
          data-testid="undo-button"
        >
          ↩️ Отменить
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`
            px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${canRedo
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }
          `}
          title="Повторить (Ctrl+Y)"
          data-testid="redo-button"
        >
          ↪️ Повторить
        </button>
      </div>
    </div>
  );
};

export default DrawingToolbar;
