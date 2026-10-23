import { LayoutDashboard, ArrowLeftRight } from 'lucide-react';

/**
 * Mobile/tablet bottom navigation (below lg breakpoint).
 */
export default function MobileNav({ currentView, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-bottom"
      aria-label="Main navigation"
    >
      <ul className="flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <li key={item.id} className="flex-1">
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
