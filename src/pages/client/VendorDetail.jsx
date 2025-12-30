import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Tag, Star, Share2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import ConsultationModal from '../../components/features/ConsultationModal';
import { supabase } from '../../supabaseClient';
import './VendorDetail.css';

export default function VendorDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isConsultationOpen, setIsConsultationOpen] = useState(false);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const { data, error } = await supabase
                    .from('vendors')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setVendor(data);
            } catch (err) {
                console.error('Error fetching vendor:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchVendor();
        }
    }, [id]);

    if (loading) return <div className="vendor-detail-loading">Loading...</div>;
    if (error || !vendor) return <div className="vendor-detail-error">Vendor not found</div>;

    return (
        <div className="vendor-detail-page">
            <ConsultationModal
                isOpen={isConsultationOpen}
                onClose={() => setIsConsultationOpen(false)}
            />

            {/* Hero Image Section */}
            <div className="detail-hero">
                <img
                    src={vendor.image}
                    alt={vendor.name}
                    className="detail-hero-image"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/1200x600?text=No+Image'}
                />
                <div className="detail-hero-overlay" />
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} /> Back
                </button>
            </div>

            {/* Content Section */}
            <div className="container detail-content-wrapper">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="detail-header"
                >
                    <div className="header-main">
                        <span className="vendor-category-badge">{vendor.category}</span>
                        <h1 className="vendor-title">{vendor.name}</h1>
                        <div className="vendor-meta">
                            <span className="meta-item">
                                <MapPin size={18} /> {vendor.location}
                            </span>
                            <span className="meta-item">
                                <Star size={18} /> 4.9 (Premium)
                            </span>
                        </div>
                    </div>
                    <div className="header-actions">
                        <Button
                            variant="primary"
                            size="lg"
                            className="consult-btn"
                            onClick={() => setIsConsultationOpen(true)}
                        >
                            상담 신청
                        </Button>
                        <button className="share-btn">
                            <Share2 size={20} />
                        </button>
                    </div>
                </motion.div>

                <div className="detail-grid">
                    {/* Main Info */}
                    <div className="detail-main">
                        <section className="detail-section">
                            <h2>About</h2>
                            <p className="description">
                                {vendor.description ||
                                    "보마르 웨딩이 엄선한 하이엔드 파트너입니다. 최고의 순간, 최고의 전문가와 함께하세요. 세심한 디렉팅과 독보적인 감각으로 당신만의 웨딩 씬을 완성해드립니다."}
                            </p>
                        </section>

                        <section className="detail-section gallery-section">
                            <h2>Gallery</h2>
                            <div className="detail-gallery-grid">
                                {/* Placeholder gallery since we might just have one image in DB currently */}
                                <div className="gallery-item main">
                                    <img src={vendor.image} alt="Gallery 1" />
                                </div>
                                <div className="gallery-item"><div className="placeholder-box">Portfolio 1</div></div>
                                <div className="gallery-item"><div className="placeholder-box">Portfolio 2</div></div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Info */}
                    <div className="detail-sidebar">
                        <div className="sidebar-card">
                            <h3>Contact Info</h3>
                            <div className="info-row">
                                <span className="label">Location</span>
                                <span className="value">{vendor.location}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Contact</span>
                                <span className="value">02-540-0000</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Hours</span>
                                <span className="value">10:00 - 19:00</span>
                            </div>
                        </div>

                        <div className="sidebar-card promo-card">
                            <h3>Exclusive Benefit</h3>
                            <p>보마르 웨딩 고객님만을 위한<br />특별한 혜택을 확인하세요.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
