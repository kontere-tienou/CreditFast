import { BrowserRouter } from 'react-router-dom';
import { Toast } from '@heroui/react';
import type { ReactNode } from 'react';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <Toast.Provider placement="bottom end" />
      {children}
    </BrowserRouter>
  );
}
