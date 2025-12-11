import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Button from '../../components/ui/Button';
import './Home.css';

const HERO_IMAGE = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070";

export default function Home() {
    const containerRef = useRef(null);
    const [brands, setBrands] = useState([]);

    useEffect(() => {
        fetch('/api/vendors')
            .then(res => res.json())
            .then(data => {
                // Filter only featured brands
                const featured = data.filter(vendor => vendor.is_featured);
                setBrands(featured);
            })
            .catch(err => console.error('Failed to fetch brands:', err));
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

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

            {/* Featured Brands (New) */}
            <section className="section brand-section">
                <div className="container">
                    <h2 className="section-title">Premium Curated Brands</h2>
                    <p className="section-desc mb-10">보마르는 타협하지 않는 기준으로 파트너를 선정합니다.                     트렌드를 선도하되 본질을 잃지 않는 최고의 브랜드들. <br />
                     보마르가 엄선한 라인업을 통해 실패 없는 완벽함을 경험하세요.</p>

                    <div className="brand-grid">
                        {brands.map((brand, i) => (
                            <motion.div
                                key={brand.id || i}
                                className="brand-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className="brand-image-wrapper">
                                    <img src={brand.image} alt={brand.name} onError={(e) => e.target.src = 'https://via.placeholder.com/400x500?text=No+Image'} />
                                    <div className="brand-overlay">
                                        <Button variant="outline" style={{ color: 'white', borderColor: 'white' }}>View Details</Button>
                                    </div>
                                </div>
                                <div className="brand-info">
                                    <span className="brand-category">{brand.category}</span>
                                    <h3 className="brand-name">{brand.name}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Button variant="secondary" onClick={() => window.location.href = '/category/studio'}>
                            View All Brands
                        </Button>
                    </div>
                </div>
            </section>

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
