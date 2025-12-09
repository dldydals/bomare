import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import './CategoryPage.css';

const CATEGORY_INFO = {
    'wedding-hall': { title: 'Wedding Hall', subtitle: '품격 있는 웨딩 베뉴 큐레이션' },
    'studio': { title: 'Studio', subtitle: '당신의 순간을 영원히, 프리미엄 스튜디오' },
    'dress': { title: 'Dress', subtitle: '가장 아름다운 신부를 위한 드레스 컬렉션' },
    'makeup': { title: 'Makeup', subtitle: '본연의 아름다움을 깨우는 터치' },
    'snap-dvd': { title: 'Snap & DVD', subtitle: '그날의 감동을 생생하게' },
    'etc': { title: 'Hon-su & Etc', subtitle: '혼수부터 허니문까지, 완벽한 준비' },
};

export default function CategoryPage() {
    const { id } = useParams();
    const info = CATEGORY_INFO[id] || { title: id, subtitle: 'Digital Wedding Atelier' };

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
                <div className="empty-state">
                    <p>현재 등록된 {info.title} 업체가 없습니다.</p>
                    <p className="sub">보마르 웨딩이 엄선한 업체를 곧 만나보세요.</p>
                </div>
            </div>
        </div>
    );
}
