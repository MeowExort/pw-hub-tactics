import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TacticsMap from './TacticsMap'
import React from 'react'

// Мокаем Konva, так как он сложно тестируется в jsdom
vi.mock('react-konva', () => ({
  Stage: ({ children, onClick }: any) => {
    const mockEvent = {
      target: {
        getStage: () => ({
          getPointerPosition: () => ({ x: 100, y: 100 })
        }),
        attrs: { name: 'map-background' }
      }
    };
    return <div data-testid="konva-stage" onClick={() => onClick && onClick(mockEvent)}>{children}</div>
  },
  Layer: ({ children }: any) => <div data-testid="konva-layer">{children}</div>,
  Image: ({ alt, draggable, onDragEnd }: any) => (
    <div 
      data-testid="konva-image" 
      aria-label={alt} 
      draggable={draggable}
      onDragEnd={onDragEnd}
    />
  ),
  Circle: ({ x, y, draggable, onDragEnd, onClick }: any) => (
    <div 
      data-testid="konva-icon" 
      data-x={x} 
      data-y={y} 
      draggable={draggable}
      onDragEnd={onDragEnd}
      onClick={onClick}
    />
  )
}))

describe('TacticsMap Component', () => {
  it('должен рендерить канвас-сцену', () => {
    render(<TacticsMap />)
    expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
  })

  it('должен добавлять иконку катапульты при клике на карту', async () => {
    render(<TacticsMap />)
    const stage = screen.getByTestId('konva-stage')
    
    // Изначально иконок нет (кроме фонового изображения)
    expect(screen.queryAllByTestId('konva-icon')).toHaveLength(0)
    
    // Клик по сцене для добавления иконки
    fireEvent.click(stage)
    
    // Проверяем, что появилась иконка
    expect(screen.getAllByTestId('konva-icon')).toHaveLength(1)
  })

  it('иконки должны быть перетаскиваемыми', () => {
    render(<TacticsMap />)
    const stage = screen.getByTestId('konva-stage')
    fireEvent.click(stage)
    
    const icon = screen.getByTestId('konva-icon')
    expect(icon).toHaveAttribute('draggable', 'true')
  })
})
