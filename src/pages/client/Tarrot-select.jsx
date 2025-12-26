import { useEffect, useState, useRef } from 'react';
import Select from 'react-select';
import './Tarrot.css';
import { Calendar, User, Phone, Clock, Sparkles } from 'lucide-react'; // 아이콘 추가로 직관성 향상

export default function Tarrot() {
    const [reviews, setReviews] = useState([]);
    const [form, setForm] = useState({ name: '', rating: 5, comment: '' });
    const [serviceFilter, setServiceFilter] = useState('all');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Reservation Form State
    const [reservationForm, setReservationForm] = useState({ name: '', phone: '', date: '', time: '', type: 'phone' });
    const [reservedTimes, setReservedTimes] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [faqQuery, setFaqQuery] = useState('');

    // Animation ref
    const containerRef = useRef(null);

    const services = [
        { id: 'phone', title: '심층 전화 타로', desc: '연애, 직업, 재회 등 복잡한 문제에 대한 깊이 있는 해석', time: '60분', price: '₩80,000', note: '✅ 실시간 잔여 시간 반영 (예약 페이지에서 확인)' },
        { id: 'visit', title: '프리미엄 방문 상담', desc: '오프라인에서 카드와 에너지를 직접 교류하는 특별한 경험', time: '90분', price: '₩120,000', note: '✅ 오직 평일 오후에만 예약 가능' },
        { id: 'chat', title: '빠른 채팅 타로', desc: '간단한 질문이나 급한 상황에 1시간 동안 집중적으로 답변', time: '60분', price: '₩50,000', note: '✅ 빠른 답변 보장 (오류 방지 시스템 적용)' }
    ];

    // Fetch FAQs on mount
    useEffect(() => {
        document.title = '행운의 별';
        fetch('/api/faqs')
            .then(res => res.json())
            .then(data => setFaqs(data))
            .catch(err => console.error('Failed to fetch FAQs:', err));
    }, []);

    // Fetch reserved times when date changes
    useEffect(() => {
        if (reservationForm.date) {
            fetch(`/api/reservations/availability?date=${reservationForm.date}`)
                .then(res => res.json())
                .then(times => setReservedTimes(times))
                .catch(err => console.error('Failed to fetch availability:', err));
        }
    }, [reservationForm.date]);

    // Dummy reviews for initial display if fetch fails or is empty
    const initialReviews = [
        { id: 1, name: '익명 고객 01', rating: 5, comment: '"정말 신기하게도 제가 말하지 않은 상황까지 정확하게 짚어주셔서 놀랐습니다. 앞으로의 방향을 잡는 데 큰 도움이 되었어요. 감사합니다!"', date: '2024.10.25', product: '심층 전화 타로' },
        { id: 2, name: '익명 고객 02', rating: 4, comment: '"조언이 현실적이고 따뜻했어요. 다만 예약이 너무 어려워서 별 하나 뺐습니다 ㅠㅠ. 그래도 상담 퀄리티는 최고!"', date: '2024.11.01', product: '프리미엄 방문 상담' }
    ];

    // Scroll Fade-in Effect
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        const faders = document.querySelectorAll('.section-fade-in');
        faders.forEach(fader => observer.observe(fader));

        return () => observer.disconnect();
    }, []);

    // Reservation Logic
    const showReservationModal = () => {
        const modal = document.getElementById('reservation-modal');
        const content = document.getElementById('modal-content');
        if (modal && content) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                content.classList.add('open');
            }, 10);
        }
    };

    const closeReservationModal = (e) => {
        if (e && e.target.id !== 'reservation-modal' && e.target.id !== 'close-modal-btn') return;
        const modal = document.getElementById('reservation-modal');
        const content = document.getElementById('modal-content');
        if (modal && content) {
            content.classList.remove('open');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    };

    const submitReservation = async () => {
        if (!reservationForm.name || !reservationForm.phone || !reservationForm.date || !reservationForm.time) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservationForm)
            });
            if (res.ok) {
                alert('예약이 완료되었습니다! (확정 시 알림톡 발송)');
                setReservationForm({ name: '', phone: '', date: '', time: '', type: 'phone' });
                closeReservationModal({ target: { id: 'close-modal-btn' } });
            } else {
                alert('예약 실패. 다시 시도해주세요.');
            }
        } catch (err) {
            console.error(err);
            alert('오류가 발생했습니다.');
        }
    };

    // React Select Custom Styles
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'white',
            borderColor: state.isFocused ? '#6366f1' : '#e2e8f0', // indigo-500 : slate-200
            borderWidth: '2px',
            borderRadius: '0.75rem', // rounded-xl
            padding: '0.2rem',
            boxShadow: state.isFocused ? '0 0 0 2px #e0e7ff' : 'none', // ring-indigo-100
            '&:hover': {
                borderColor: '#cbd5e1' // slate-300
            },
            fontSize: '0.875rem' // text-sm
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#581c87' // tarrot-primary
                : state.isFocused
                    ? '#f3e8ff' // light purple hover
                    : 'white',
            color: state.isSelected ? 'white' : '#1e293b', // slate-800
            cursor: state.isDisabled ? 'not-allowed' : 'pointer',
            opacity: state.isDisabled ? 0.5 : 1,
            fontSize: '0.875rem'
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '0.75rem',
            overflow: 'hidden',
            zIndex: 9999
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#cbd5e1' // slate-300
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#0f172a', // gray-900
            fontWeight: 500
        })
    };

    const timeOptions = ['10:00', '11:00', '14:00', '15:00', '19:00'].map(time => ({
        value: time,
        label: time + (reservedTimes.includes(time) ? ' (마감)' : ''),
        isDisabled: reservedTimes.includes(time)
    }));

    const typeOptions = [
        { value: 'phone', label: '🔮 심층 전화 타로' },
        { value: 'visit', label: '🏠 프리미엄 방문 상담' },
        { value: 'chat', label: '💬 빠른 채팅 타로' }
    ];

    const filteredServices = services.filter(s => serviceFilter === 'all' || s.id === serviceFilter);
    const filteredFaqs = faqs.filter(f => f.question.toLowerCase().includes(faqQuery) || f.answer.toLowerCase().includes(faqQuery));

    return (
        <div className="tarrot-page">
            <div className="tarrot-container" ref={containerRef}>

                {/* Header */}
                <header className="tarrot-header">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-secondary">운명의 별</h1>
                        <button
                            className="mobile-menu-btn md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    <nav className={`mobile-nav ${mobileMenuOpen ? '' : 'hidden'}`}>
                        <a href="#expert-intro" className="nav-link" onClick={() => setMobileMenuOpen(false)}>전문가 소개</a>
                        <a href="#decks-type" className="nav-link" onClick={() => setMobileMenuOpen(false)}>상담 유형</a>
                        <a href="#services" className="nav-link" onClick={() => setMobileMenuOpen(false)}>서비스/요금</a>
                        <a href="#reviews" className="nav-link" onClick={() => setMobileMenuOpen(false)}>상담 후기</a>
                        <a href="#faq" className="nav-link" onClick={() => setMobileMenuOpen(false)}>공지/FAQ</a>
                        <button className="nav-cta" onClick={() => { showReservationModal(); setMobileMenuOpen(false); }}>지금 예약하기</button>
                    </nav>
                </header>

                <main className="p-6 relative z-10">
                    {/* Hero Section */}
                    <section id="home" className="text-center py-12 section-fade-in" style={{ animationDelay: '0s' }}>
                        <div className="hero-photo-frame">
                            <img src="/assets/img_bg.png" alt="타로 전문가 타로스타" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://placehold.co/128x128/581c87/fcd34d?text=타로스타'} />
                        </div>
                        <h2 className="text-3xl font-bold mb-2 text-primary">타로 전문가 타로스타</h2>
                        <p className="text-lg mb-6 text-gray-500">
                            당신의 길을 밝히는, <span className="text-secondary font-semibold">운명 해석의 마스터</span>
                        </p>

                        <button onClick={showReservationModal} className="cta-button">
                            🔮 실시간 예약하기 (CTA)
                        </button>

                        <div className="review-highlight">
                            <p className="text-sm font-medium text-gray-300">"고민하던 문제에 명쾌한 해답을 얻었어요." - 베스트 후기</p>
                            <div className="flex justify-center items-center mt-2">
                                <span className="text-2xl star-filled">★★★★★</span>
                                <span className="ml-2 text-sm text-gray-400">(총 4.9점, 350+건 상담)</span>
                            </div>
                        </div>
                    </section>

                    {/* Expert Intro */}
                    <section id="expert-intro" className="py-12 divider section-fade-in" style={{ animationDelay: '0.2s' }}>
                        <h3 className="section-title">✨ 전문가 타로스타 소개</h3>

                        <div className="flex flex-col gap-4">
                            <div className="info-card">
                                <p className="font-semibold text-secondary mb-2">철학: 타로는 '선택'의 조력자</p>
                                <p className="text-sm text-gray-600">저는 타로를 단순한 점술이 아닌, 내면의 목소리를 듣고 최선의 선택을 할 수 있도록 돕는 심리 상담 도구로 사용합니다. 당신의 미래는 이미 결정된 것이 아니라, 지금 이 순간의 선택으로 만들어집니다.</p>
                            </div>

                            <div className="info-card">
                                <p className="font-semibold text-secondary mb-2">주요 경력</p>
                                <ul className="text-sm text-gray-600 list-disc">
                                    <li>국제 타로 마스터 협회 공인 자격증 취득 (2015)</li>
                                    <li>온/오프라인 누적 상담 10,000회 이상</li>
                                    <li>[미디어 출연] SBS '미래를 읽다' 게스트 출연 (2023)</li>
                                    <li>심리상담사 2급 자격 보유</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-purple-100 rounded-lg text-center" style={{ backgroundColor: 'rgba(88, 28, 135, 0.1)' }}>
                            <p className="font-medium text-primary italic">"타로 카드가 보여주는 것은 당신 마음속의 진실입니다."</p>
                            <a href="#" className="text-sm text-secondary hover:text-primary mt-1 block">전문가 인터뷰 전문 보기 &gt;</a>
                        </div>
                    </section>

                    {/* Decks Type */}
                    <section id="decks-type" className="py-12 divider section-fade-in" style={{ animationDelay: '0.3s' }}>
                        <h3 className="section-title">🃏 타로 덱/상담 유형</h3>
                        <p className="text-sm text-gray-300 mb-6">
                            상담 주제와 고객님의 상황에 따라 가장 적합한 덱을 선택하여 심도 있는 해석을 제공합니다. 아래는 타로스타가 주력으로 사용하는 주요 덱들입니다.
                        </p>

                        <div className="deck-grid">
                            <div className="deck-tag">
                                <p className="text-lg font-bold">유니버셜 웨이트</p>
                                <p className="text-xs text-gray-400 mt-1">기본/전통 해석</p>
                            </div>
                            <div className="deck-tag">
                                <p className="text-lg font-bold">심볼론 (Symbolon)</p>
                                <p className="text-xs text-gray-400 mt-1">심리/관계 분석</p>
                            </div>
                            <div className="deck-tag">
                                <p className="text-lg font-bold">데카메론</p>
                                <p className="text-xs text-gray-400 mt-1">성인/연애 심리</p>
                            </div>
                            <div className="deck-tag">
                                <p className="text-lg font-bold">오쇼젠 (Osho Zen)</p>
                                <p className="text-xs text-gray-400 mt-1">명상/현실 자각</p>
                            </div>
                            <div className="deck-tag" style={{ gridColumn: 'span 2', backgroundColor: 'rgba(88, 28, 135, 0.5)', border: 'none', color: 'white' }}>
                                이 외에도 <span className="font-bold">마르세유, 키퍼, 레노먼드</span> 등 다양한 덱을 준비하고 있습니다.
                            </div>
                        </div>
                    </section>

                    {/* Services */}
                    <section id="services" className="py-12 divider section-fade-in" style={{ animationDelay: '0.5s' }}>
                        <h3 className="section-title">⭐ 서비스/요금 안내</h3>

                        <div className="flex gap-2 mb-6 flex-wrap">
                            <button onClick={() => setServiceFilter('all')} className={`filter-btn ${serviceFilter === 'all' ? 'active' : ''}`}>전체</button>
                            <button onClick={() => setServiceFilter('phone')} className={`filter-btn ${serviceFilter === 'phone' ? 'active' : ''}`}>전화 상담</button>
                            <button onClick={() => setServiceFilter('visit')} className={`filter-btn ${serviceFilter === 'visit' ? 'active' : ''}`}>방문 상담</button>
                            <button onClick={() => setServiceFilter('chat')} className={`filter-btn ${serviceFilter === 'chat' ? 'active' : ''}`}>채팅 상담</button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {filteredServices.map(service => (
                                <div key={service.id} className="service-card">
                                    <h4 className="text-xl font-bold text-secondary mb-1">{service.title}</h4>
                                    <p className="text-sm text-gray-500 mb-3">{service.desc}</p>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span>🕒 소요 시간: {service.time}</span>
                                        <span className="text-lg font-bold text-gray-900">{service.price}</span>
                                    </div>
                                    <p className="text-xs mt-2" style={{ color: '#16a34a' }}>{service.note}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-center pt-8 divider">
                            <p className="text-lg font-semibold text-gray-800 mb-4">원하는 상담 방식과 시간을 선택하세요.</p>
                            <button onClick={showReservationModal} className="cta-button">
                                🗓️ 예약 시간표 확인 및 결제 연동
                            </button>
                            <p className="text-xs mt-2 text-gray-500">실시간 잔여 시간을 확인하고 바로 예약/결제할 수 있습니다.</p>
                        </div>
                    </section>

                    {/* Reviews */}
                    <section id="reviews" className="py-12 divider section-fade-in" style={{ animationDelay: '0.7s' }}>
                        <h3 className="section-title">💬 실제 고객 후기</h3>

                        <div className="flex flex-col gap-6">
                            {(reviews.length > 0 ? reviews : initialReviews).map(review => (
                                <div key={review.id} className="review-card">
                                    <div className="flex items-center mb-2">
                                        <span className="star-filled">{'★'.repeat(review.rating)}</span>
                                        <span className="ml-3 text-sm font-semibold text-gray-600">{review.name}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 italic mb-2">{review.comment}</p>
                                    <p className="text-xs text-gray-500 text-right">상담 상품: {review.product || '상담'} | {review.date || new Date(review.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}

                            <p className="text-sm text-center text-gray-500 pt-4 divider">
                                * 후기는 예약 및 결제를 완료한 실제 고객에게만 작성 권한이 부여됩니다.
                            </p>
                            <a href="#" className="block text-center text-primary font-semibold hover:text-secondary mt-2">전체 후기 더 보기 &gt;</a>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section id="faq" className="py-12 divider section-fade-in" style={{ animationDelay: '0.9s' }}>
                        <h3 className="section-title">❓ 공지 및 FAQ</h3>

                        <div className="notice-box">
                            <p className="text-lg font-semibold text-gray-900 mb-2">📌 [필독] 12월 운영 시간 안내</p>
                            <p className="text-sm text-gray-600">운영 시간: 평일 10:00 - 22:00 / 주말 11:00 - 18:00 (화요일 정기 휴무)</p>
                            <p className="text-sm mt-1" style={{ color: '#ef4444' }}>임시 휴무일: 12월 24일, 25일 전체 예약 마감.</p>
                        </div>

                        <input
                            type="text"
                            className="faq-input"
                            placeholder="궁금한 점을 검색해보세요 (예: 환불, 준비물)"
                            value={faqQuery}
                            onChange={(e) => setFaqQuery(e.target.value)}
                        />

                        <div className="flex flex-col gap-3">
                            {filteredFaqs.map((faq, i) => (
                                <details key={i} className="faq-details">
                                    <summary className="font-semibold text-gray-800">{faq.question}</summary>
                                    <p className="mt-2 text-sm text-gray-500">{faq.answer}</p>
                                </details>
                            ))}
                        </div>

                        <div className="mt-8 text-center pt-8 divider">
                            <p className="text-xs text-gray-500">
                                예약 시 수집되는 개인 정보는 안전하게 보관되며, <span className="font-bold" style={{ color: '#f87171' }}>보관 및 파기 정책을 준수</span>합니다.
                            </p>
                            <a href="#" className="text-sm text-primary font-semibold hover:text-secondary mt-2 block">개인 정보 보호 정책 전문 보기</a>
                        </div>
                    </section>
                </main>

                <footer className="tarrot-footer">
                    <p className="mb-2">운명의 별 | 타로 전문가 타로스타</p>
                    <p>사업자 등록 번호: 123-45-67890</p>
                    <p>연락처: 010-0000-0000 | 이메일: tarostar@email.com</p>
                    <p className="mt-4">&copy; 2024. 운명의 별. All rights reserved.</p>
                </footer>

                {/* Reservation Modal */}
                <div id="reservation-modal" className="modal-overlay hidden" onClick={closeReservationModal}>
                    <div id="modal-content" className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-slate-50 p-6 text-center border-b border-gray-100">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3 text-indigo-600">
                                <Calendar size={24} color="#a79f9fff" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 flex justify-center items-center gap-2">
                                상담 예약하기 <Sparkles size={18} className="text-yellow-500" />
                            </h4>
                            <p className="text-sm text-slate-500 mt-1" style={{ color: "#5f5c5cff" }}>당신의 운명을 밝혀줄 소중한 시간을 예약하세요.</p>
                        </div>
                        <div className="flex flex-col gap-3 mb-6">
                            <div className="flex flex-row items-center gap-4 mb-6">
                                <div className="flex flex-row items-center gap-6 mb-6">
                                    {/* 이름 & 연락처 섹션: 2컬럼 그리드로 한 줄 배치 */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-900 ml-1">
                                                <User size={14} color="#3a3939ff" /> 이름
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="성함"
                                                className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition-all placeholder:text-slate-300"
                                                value={reservationForm.name}
                                                onChange={e => setReservationForm({ ...reservationForm, name: e.target.value })}
                                            />
                                        </div><br />
                                        <div className="space-y-1.5">
                                            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-900 ml-1 ">
                                                <Phone size={14} color="#3a3939ff" /> 연락처
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="010-0000-0000"
                                                className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition-all placeholder:text-slate-300"
                                                value={reservationForm.phone}
                                                onChange={e => setReservationForm({ ...reservationForm, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <div className="w-1/2 flex flex-col">
                                    <label className="text-left text-xs text-gray-500 font-semibold ml-1 mb-1">날짜</label>

                                    <input
                                        type="date"
                                        className="
                          w-full 
                          bg-white               /* 1. 배경을 순백색으로 변경하여 대비 강화 */
                          text-gray-900         /* 2. 입력된 글자색을 아주 진한 회색으로 고정 */
                          border-2               /* 3. 테두리 두께를 살짝 높임 */
                          border-slate-200       /* 4. 연한 회색 테두리 적용 */
                          rounded-xl 
                          p-3 
                          text-sm 
                          font-medium            /* 5. 글자 두께를 약간 주어 가독성 향상 */
                          focus:border-indigo-500 /* 6. 클릭 시 테두리 색상 강조 */
                          focus:ring-2 
                          focus:ring-indigo-100  /* 7. 클릭 시 은은한 외곽광 효과 */
                          outline-none 
                          transition-all
                          /* appearance-none 제거: 브라우저 기본 캘린더 아이콘이 보이도록 함 */
                        "
                                        value={reservationForm.date}
                                        onChange={e => setReservationForm({ ...reservationForm, date: e.target.value })}
                                        required
                                    />

                                    {/* <input
                    type="date"
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                    value={reservationForm.date}
                    onChange={e => setReservationForm({ ...reservationForm, date: e.target.value })}
                  /> */}
                                </div>

                                <div className="w-1/2 modal-input-group">
                                    <label className="text-xs font-bold text-gray-900 ml-1 flex items-center gap-1.5">
                                        <Clock size={14} /> 시간
                                    </label>
                                    <Select
                                        options={timeOptions}
                                        value={timeOptions.find(opt => opt.value === reservationForm.time) || null}
                                        onChange={(option) => setReservationForm({ ...reservationForm, time: option ? option.value : '' })}
                                        placeholder="선택"
                                        styles={customSelectStyles}
                                        isDisabled={!reservationForm.date} // 날짜 선택 전에는 비활성화 (선택적)
                                        isSearchable={false}
                                    />
                                </div>
                            </div>
                        </div>

                        <label className="text-left text-xs text-gray-500 font-semibold ml-1 mt-2">상담 유형</label>
                        <Select
                            options={typeOptions}
                            value={typeOptions.find(opt => opt.value === reservationForm.type)}
                            onChange={(option) => setReservationForm({ ...reservationForm, type: option.value })}
                            styles={customSelectStyles}
                            isSearchable={false}
                        />
                    </div>

                    <button
                        onClick={submitReservation}
                        className="cta-button font-bold text-sm py-3 w-full"
                    >
                        예약 완료 및 결제(가상)
                    </button>
                    <button
                        id="close-modal-btn"
                        onClick={closeReservationModal}
                        className="mt-3 w-full px-4 py-2 font-medium rounded-lg bg-gray-700 text-gray-300"
                    >
                        닫기
                    </button>
                </div>
            </div> {/* Reservation Modal End */}

        </div>
    );
}

