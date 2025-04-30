import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ship, Plus, Eye, Code, MenuIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  title: string;
  path: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  {
    title: 'Adicionar Navio',
    path: '/add',
    icon: Plus,
  },
  {
    title: 'Visualizar Movimentos',
    path: '/',
    icon: Eye,
  },
  {
    title: 'Código para Incorporar',
    path: '/embed',
    icon: Code,
  },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <button 
        className="fixed z-50 bottom-4 right-4 md:hidden bg-primary text-primary-foreground rounded-full p-3 shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
      </button>
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out bg-white shadow-lg md:translate-x-0 md:relative md:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-8 border-b">
            <Ship size={28} className="text-primary" />
            <div>
              <h1 className="font-bold text-lg text-vessel-foreground">VesselView</h1>
              <p className="text-xs text-vessel">Brazil Stone Shipping</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                      location.pathname === item.path
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon size={20} />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Footer */}
          <div className="p-4 text-xs text-muted-foreground border-t">
            VesselView &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full">
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
      
      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
