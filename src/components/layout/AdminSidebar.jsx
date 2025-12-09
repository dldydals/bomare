import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Settings, ChevronDown, ChevronRight, FileText, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminSidebar.css';

const MENU_ITEMS = [
    { title: '대시보드', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { title: '고객 관리', icon: <Users size={20} />, path: '/admin/customers' },
    { title: '업체 관리', icon: <Calendar size={20} />, path: '/admin/vendors' },
    { title: '정산 관리', icon: <DollarSign size={20} />, path: '/admin/settlements' },
    { title: '설정', icon: <Settings size={20} />, path: '/admin/settings' },
];

export default function AdminSidebar() {
    // Track open menus by index
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (index) => {
        setOpenMenus(prev => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <h2>Bomare Admin</h2>
            </div>

            <nav className="sidebar-nav">
                {MENU_ITEMS.map((item, index) => (
                    <div key={index} className="nav-group">
                        {item.children ? (
                            // Accordion Item
                            <div>
                                <button
                                    className={`nav-item-parent ${openMenus[index] ? 'open' : ''}`}
                                    onClick={() => toggleMenu(index)}
                                >
                                    <span className="flex items-center gap-3">
                                        {item.icon} {item.title}
                                    </span>
                                    {openMenus[index] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                                <AnimatePresence>
                                    {openMenus[index] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="nav-children"
                                        >
                                            {item.children.map((child, cIndex) => (
                                                <NavLink
                                                    key={cIndex}
                                                    to={child.path}
                                                    className={({ isActive }) => `nav-child ${isActive ? 'active' : ''}`}
                                                >
                                                    {child.title}
                                                </NavLink>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            // Single Item
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.title}</span>
                            </NavLink>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
