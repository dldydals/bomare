import { Bell, Search } from 'lucide-react';
import './AdminHeader.css';

export default function AdminHeader() {
    return (
        <header className="admin-header">
            <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search..." />
            </div>
            <div className="header-actions">
                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="badge">3</span>
                </button>
                <div className="admin-profile">
                    <div className="avatar">A</div>
                    <span>Admin</span>
                </div>
            </div>
        </header>
    );
}
