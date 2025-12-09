import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomActionBar from './BottomActionBar';
import './ClientLayout.css';

export default function ClientLayout() {
    return (
        <div className="client-layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
            <BottomActionBar />
        </div>
    );
}
