/**
 * Страница демонстрации системы отрядов.
 * Доступна по адресу /squad-demo
 */

'use client';

import dynamic from 'next/dynamic';

// Динамический импорт для избежания SSR проблем с Konva
const SquadDemo = dynamic(
  () => import('../../components/SquadDemo'),
  { ssr: false }
);

export default function SquadDemoPage() {
  return (
    <main className="min-h-screen bg-slate-900">
      <SquadDemo />
    </main>
  );
}
