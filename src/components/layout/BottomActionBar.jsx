import { Phone, MessageCircle, Calendar } from 'lucide-react';
import './BottomActionBar.css';

export default function BottomActionBar() {
    return (
        <div className="bottom-action-bar">
            <a href="tel:02-1234-5678" className="action-btn">
                <Phone size={20} />
                <span>전화</span>
            </a>
            <a href="#" className="action-btn">
                <MessageCircle size={20} />
                <span>카카오톡</span>
            </a>
            <a href="/contact" className="action-btn primary">
                <Calendar size={20} />
                <span>상담 예약</span>
            </a>
        </div>
    );
}
