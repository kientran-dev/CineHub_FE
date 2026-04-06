import { createBrowserRouter } from 'react-router';
import { AdminLayout } from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import MoviesManagement from './pages/MoviesManagement';
import AccountsManagement from './pages/AccountsManagement';
import GenresManagement from './pages/GenresManagement';
import PremiumManagement from './pages/PremiumManagement';
import InvoicesManagement from './pages/InvoicesManagement';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AdminLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'movies', Component: MoviesManagement },
      { path: 'accounts', Component: AccountsManagement },
      { path: 'genres', Component: GenresManagement },
      { path: 'invoices', Component: InvoicesManagement },
      { path: 'premium', Component: PremiumManagement },
    ],
  },
]);