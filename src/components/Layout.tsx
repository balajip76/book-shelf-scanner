import { Outlet, NavLink } from 'react-router-dom';
import { StorageWarning } from './StorageWarning';

export function Layout() {
  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-surface)' }}>
      <StorageWarning />
      <main className="flex-1 overflow-auto pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <nav
        className="fixed bottom-0 left-0 right-0 flex border-t"
        style={{
          background: 'var(--color-surface-2)',
          borderColor: 'var(--color-surface-3)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          height: 'calc(4rem + env(safe-area-inset-bottom))',
        }}
      >
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
              isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
            }`
          }
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
          </svg>
          <span>Scan</span>
        </NavLink>
        <NavLink
          to="/collection"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
              isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
            }`
          }
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <span>Collection</span>
        </NavLink>
      </nav>
    </div>
  );
}
