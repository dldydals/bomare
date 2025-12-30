import { useState } from 'react';
import { Phone, MessageCircle, Calendar } from 'lucide-react';
import ConsultationModal from '../features/ConsultationModal';
import './BottomActionBar.css';

export default function BottomActionBar() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="bottom-action-bar">
                <a href="tel:02-1234-5678" className="action-btn">
                    <Phone size={20} />
                    <span>전화</span>
                </a>
                <a href="#" className="action-btn">
                    <MessageCircle size={20} />
                    <span>카카오톡</span>
                </a>
                <button
                    className="action-btn primary"
                    onClick={() => setIsModalOpen(true)}
                    type="button"
                >
                    <Calendar size={20} />
                    <span>상담 신청</span>
                </button>
            </div>

            <ConsultationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
