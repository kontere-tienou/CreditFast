import { Navigate, Route, Routes } from 'react-router-dom';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<PlaceholderPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
