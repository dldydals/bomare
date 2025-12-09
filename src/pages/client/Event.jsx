import Button from '../../components/ui/Button';
import './Event.css';

export default function Event() {
    return (
        <div className="event-page">
            <div className="container py-20">
                <h1 className="text-4xl mb-8 font-serif text-center">Special Events</h1>

                <div className="event-grid">
                    {/* Event Card 1 */}
                    <div className="event-card">
                        <div className="event-badge">New</div>
                        <h3>Early Bird Promotion</h3>
                        <p className="date">2025.01.01 ~ 2025.02.28</p>
                        <p className="desc">2025년 상반기 예식 얼리버드 혜택. 스드메 패키지 최대 20% 할인.</p>
                        <Button variant="primary" className="w-full mt-4">신청하기</Button>
                    </div>

                    {/* Event Card 2 */}
                    <div className="event-card">
                        <h3>Review Event</h3>
                        <p className="date">Always Open</p>
                        <p className="desc">상담 후기 작성 시 스타벅스 기프티콘 100% 증정.</p>
                        <Button variant="outline" className="w-full mt-4">참여하기</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
