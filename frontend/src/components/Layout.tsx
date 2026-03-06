/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, FolderGit2, PieChart, PanelLeftClose, PanelLeftOpen, ListTree } from 'lucide-react';

const Layout = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const navItems = [
        { name: 'Dashboard', path: '/', icon: Home },
        { name: 'Projects', path: '/projects', icon: FolderGit2 },
        { name: 'Categories', path: '/categories', icon: ListTree },
        { name: 'Reports', path: '/reports', icon: PieChart },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col`}>
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} h-16 border-b border-gray-200`}>
                    {!isCollapsed && <h1 className="text-xl font-bold text-gray-800 truncate">BudgetMaster</h1>}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
                        title={isCollapsed ? "メニューを展開" : "メニューを折り畳む"}
                    >
                        {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                    </button>
                </div>
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`
                                }
                                title={isCollapsed ? item.name : undefined}
                            >
                                <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
                                {!isCollapsed && <span>{item.name}</span>}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
