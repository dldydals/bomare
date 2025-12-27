import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import { supabase } from '../../supabaseClient';
import './CategoryPage.css';

const CATEGORY_INFO = {
    'wedding-hall': { title: 'Wedding Hall', subtitle: '품격 있는 웨딩 베뉴 큐레이션', dbParams: ['Wedding Hall', '웨딩홀'] },
    'studio': { title: 'Studio', subtitle: '당신의 순간을 영원히, 프리미엄 스튜디오', dbParams: ['Studio', '스튜디오'] },
    'dress': { title: 'Dress', subtitle: '가장 아름다운 신부를 위한 드레스 컬렉션', dbParams: ['Dress', '드레스'] },
    'makeup': { title: 'Makeup', subtitle: '본연의 아름다움을 깨우는 터치', dbParams: ['Makeup', '메이크업'] },
    'snap-dvd': { title: 'Snap & DVD', subtitle: '그날의 감동을 생생하게', dbParams: ['Snap', '스냅', 'DVD', '본식'] },
    'etc': { title: 'Hon-su & Etc', subtitle: '혼수부터 허니문까지, 완벽한 준비', dbParams: ['Honsu', '혼수', 'Etc', '기타'] },
};

export default function CategoryPage() {
    const { id } = useParams();
    const info = CATEGORY_INFO[id] || { title: id, subtitle: 'Digital Wedding Atelier', dbParams: [id] };
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVendors = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase.from('vendors').select('*');
                if (error) throw error;

                // Filter vendors by category
                const filtered = data.filter(vendor => {
                    if (!vendor.category) return false;
                    const c = vendor.category.toLowerCase().trim();
                    const searchTerms = info.dbParams.map(term => term.toLowerCase());
                    return searchTerms.includes(c);
                });
                setVendors(filtered);
            } catch (err) {
                console.error('Failed to fetch vendors:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchVendors();
    }, [id, info.dbParams]); // Add info.dbParams to dependencies carefully or ignore if constant

    return (
        <div className="category-page">
            <div className="category-header">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="category-title"
                >
                    {info.title}
                </motion.h1>
                <p className="category-subtitle">{info.subtitle}</p>
            </div>

            <div className="container">
                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : vendors.length > 0 ? (
                    <div className="category-grid">
                        {vendors.map((vendor, i) => (
                            <motion.div
                                key={vendor.id}
                                className="category-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className="card-image-wrapper">
                                    <img
                                        src={vendor.image}
                                        alt={vendor.name}
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/400x500?text=No+Image'}
                                    />
                                    <div className="card-overlay">
                                        <Button variant="outline" style={{ color: 'white', borderColor: 'white' }}>View Details</Button>
                                    </div>
                                </div>
                                <div className="card-info">
                                    <h3 className="card-name">{vendor.name}</h3>
                                    <p className="card-category">{vendor.category}</p>
                                    <p className="card-location">{vendor.location}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>현재 등록된 {info.title} 업체가 없습니다.</p>
                        <p className="sub">보마르 웨딩이 엄선한 업체를 곧 만나보세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

