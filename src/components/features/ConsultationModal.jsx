import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Phone, MessageSquare } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../supabaseClient';
import './ConsultationModal.css';

export default function ConsultationModal({ isOpen, onClose }) {
    const [form, setForm] = useState({
        name: '',
        phone: '',
        date: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Reset form on close? optional
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { error } = await supabase.from('reservations').insert([{
                name: form.name,
                phone: form.phone,
                date: form.date,
                request_content: form.message,
                status: 'pending',
                type: 'consultation' // distinctive type
            }]);

            if (error) throw error;
            alert('상담 신청이 완료되었습니다. 곧 연락드리겠습니다.');
            onClose();
            setForm({ name: '', phone: '', date: '', message: '' });
        } catch (err) {
            console.error('Error submitting consultation:', err);
            alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-wrapper"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key="modal"
                >
                    <motion.div
                        className="modal-backdrop"
                        onClick={onClose}
                    />
                    <motion.div
                        className="modal-container"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    >
                        <button className="close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>

                        <div className="modal-header">
                            <h2>상담 신청</h2>
                            <p>특별한 당신의 웨딩을 위해<br />전문 디렉터가 1:1로 상담해드립니다.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label><User size={16} /> 하시는 분 성함</label>
                                <input
                                    type="text"
                                    placeholder="성함을 입력해주세요"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label><Phone size={16} /> 연락처</label>
                                <input
                                    type="tel"
                                    placeholder="010-0000-0000"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label><Calendar size={16} /> 예식 예정일 (미정 시 대략적인 날짜)</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label><MessageSquare size={16} /> 문의 내용</label>
                                <textarea
                                    placeholder="궁금한 점이나 원하시는 스타일을 자유롭게 적어주세요."
                                    rows={3}
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                />
                            </div>

                            <Button type="submit" variant="primary" className="submit-btn" disabled={submitting}>
                                {submitting ? '제출 중...' : '신청하기'}
                            </Button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
