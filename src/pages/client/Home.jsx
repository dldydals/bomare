import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { supabase } from '../../supabaseClient';
import './Home.css';

// const HERO_IMAGE = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070";
const HERO_IMAGE = "https://images.unsplash.com/photo-1551468307-8c1e3c78013c?q=80&w=2070";

const CATEGORIES = [
    { id: 'dress', name: 'Dress', title: '드레스' },
    { id: 'studio', name: 'Studio', title: '스튜디오' },
    { id: 'makeup', name: 'Makeup', title: '메이크업' },
    { id: 'snap', name: 'Snap', title: '스냅' }
];

export default function Home() {
    const containerRef = useRef(null);
    const [vendorsByCategory, setVendorsByCategory] = useState({});
    const scrollRefs = useRef({});

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const { data, error } = await supabase.from('vendors').select('*');
                if (error) throw error;

                // Filter only featured vendors first
                const featured = data.filter(vendor => vendor.is_featured);

                // Group vendors by category (support both English and Korean matching)
                const grouped = {};
                CATEGORIES.forEach(cat => {
                    grouped[cat.id] = featured.filter(v => {
                        if (!v.category) return false;
                        const c = v.category.toLowerCase().trim();
                        return c === cat.name.toLowerCase() || c === cat.title;
                    });
                });
                setVendorsByCategory(grouped);
            } catch (err) {
                console.error('Failed to fetch vendors:', err);
            }
        };

        fetchVendors();
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

    const scroll = (categoryId, direction) => {
        const container = scrollRefs.current[categoryId];
        if (container) {
            const scrollAmount = 320; // card width + gap
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="home-page" ref={containerRef}>
            {/* Hero Section */}
            <section className="hero-section">
                <motion.div
                    className="hero-bg"
                    style={{ backgroundImage: `url(${HERO_IMAGE})`, opacity: heroOpacity, scale: heroScale }}
                />
                <div className="hero-overlay" />
                <div className="container hero-content">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="hero-title"
                    >
                        The Moment<br></br> Your Love Becomes a Work of Art.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hero-subtitle"
                    >
                        당신의 사랑이 작품이 되는 순간, 보마르 웨딩
                    </motion.p>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="section philosophy-section">
                <div className="container">
                    <div className="philosophy-content">
                        <h2 className="section-title">Digital Wedding Atelier</h2>
                        <p className="section-desc">
                            수많은 결혼식 중 하나가 아닌,
                            오직 두 분만을 위한 단 하나의 서사를 완성합니다. <br />
                            보마르의 안목으로 큐레이션 된 하이엔드 웨딩의 세계로 초대합니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* Category Sections with Horizontal Scroll */}
            {CATEGORIES.map((category, idx) => {
                const vendors = vendorsByCategory[category.id] || [];
                if (vendors.length === 0) return null;

                return (
                    <section key={category.id} className="section category-section">
                        <div className="container">
                            <div className="category-header">
                                <div>
                                    <h2 className="category-title">{category.title}</h2>
                                    <p className="category-subtitle">{category.name}</p>
                                </div>
                                <div className="scroll-controls">
                                    <button
                                        className="scroll-btn"
                                        onClick={() => scroll(category.id, 'left')}
                                        aria-label="Scroll left"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        className="scroll-btn"
                                        onClick={() => scroll(category.id, 'right')}
                                        aria-label="Scroll right"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            </div>

                            <div
                                className="horizontal-scroll-container"
                                ref={el => scrollRefs.current[category.id] = el}
                            >
                                {vendors.map((vendor, i) => (
                                    <motion.div
                                        key={vendor.id}
                                        className="vendor-card"
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <div className="vendor-image-wrapper">
                                            <img
                                                src={vendor.image}
                                                alt={vendor.name}
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/300x400?text=No+Image'}
                                            />
                                            <div className="vendor-overlay">
                                                <Link to={`/vendor/${vendor.id}`}>
                                                    <Button
                                                        variant="outline"
                                                        style={{ color: 'white', borderColor: 'white' }}
                                                    >
                                                        View Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="vendor-info">
                                            <h3 className="vendor-name">{vendor.name}</h3>
                                            <p className="vendor-location">{vendor.location}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                );
            })}

            {/* Event Section */}
            <section className="section event-bg">
                <div className="container text-center">
                    <h2 className="section-title text-white">Curated Events</h2>
                    <p className="text-white mb-8 opacity-80">보마르 웨딩 고객만을 위해 준비된 시즌별 익스클루시브 혜택을 확인하세요.</p>
                    <Button variant="outline" style={{ borderColor: 'white', color: 'white' }}>
                        View Events
                    </Button>
                </div>
            </section>
        </div>
    );
}
