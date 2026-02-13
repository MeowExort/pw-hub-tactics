'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

/**
 * Динамический импорт TacticsMap для отключения SSR.
 * Konva требует window/document, которые недоступны на сервере.
 */
const TacticsMap = dynamic(() => import('../components/TacticsMap'), {
  ssr: false,
  loading: () => <div className="w-[800px] h-[600px] bg-slate-800 animate-pulse rounded-lg" />,
});

/**
 * Генерирует UUID v4 для идентификации комнаты.
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Главная страница приложения.
 * Управляет roomId через URL hash для изоляции комнат.
 */
export default function Home() {
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    // Получаем roomId из URL hash или генерируем новый
    let id = window.location.hash.slice(1);
    
    if (!id) {
      // Если нет roomId в URL, генерируем новый и добавляем в hash
      id = generateUUID();
      window.location.hash = id;
    }
    
    setRoomId(id);
  }, []);

  // Ждем пока roomId будет определен (клиентский рендеринг)
  if (!roomId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-2xl font-bold">PW Hub Tactics</h1>
        
        {/* Отображаем ID комнаты для возможности поделиться ссылкой */}
        <div className="text-sm text-gray-500">
          Комната: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{roomId}</code>
        </div>
        
        <TacticsMap roomId={roomId} />
        
        <p className="text-sm text-gray-500 max-w-md text-center">
          Поделитесь ссылкой с другими участниками для совместного планирования.
          Все изменения синхронизируются в реальном времени.
        </p>
      </main>
    </div>
  );
}
