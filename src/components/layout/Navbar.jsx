import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from '../../assets/logo2.png';
import { Menu, X, Phone, MessageCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import './Navbar.css';

const navItems = [
    { name: '웨딩홀', path: '/category/wedding-hall' },
    { name: '스튜디오', path: '/category/studio' },
    { name: '드레스', path: '/category/dress' },
    { name: '메이크업', path: '/category/makeup' },
    { name: '본식/DVD', path: '/category/snap-dvd' },
    { name: '혼수/기타', path: '/category/etc' },
    { name: '이벤트', path: '/event' },
    { name: '상담문의', path: '/contact' },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-content">
                {/* <Link to="/" className="logo flex items-center"> */}
                <a href="/"><img src={logo} alt="Bomare Logo" className="logo-image" /></a>
                {/* </Link> */}
                <span className="logo-text" >Bomare Wedding</span>

                {/* Desktop Menu */}
                <div className="desktop-menu">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            {item.name}
                        </NavLink>
                    ))}
                    <Button variant="primary" className="ml-4" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                        Book Consultation
                    </Button>
                </div>

                {/* Mobile Hamburger */}
                <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="mobile-menu"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className="mobile-link"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </NavLink>
                        ))}
                        <div className="mobile-actions">
                            <Button variant="primary" onClick={() => setIsOpen(false)} className="w-full">
                                Book Consultation
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
