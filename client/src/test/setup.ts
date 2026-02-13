import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Заглушка для canvas, так как jsdom его не поддерживает полноценно без дополнительных настроек
// Мы будем использовать react-konva, который сильно полагается на canvas
HTMLCanvasElement.prototype.getContext = vi.fn()
