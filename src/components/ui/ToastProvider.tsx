'use client';

import { Toaster as SonnerToaster } from 'sonner';

export const ToastProvider = () => {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        className: 'border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl rounded-2xl p-4 text-xs font-sans',
      }}
      richColors
      closeButton
    />
  );
};
