import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TarrotAdmin.css';

export default function TarrotAdmin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reservations');

  const [customers, setCustomers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [faqs, setFaqs] = useState([]);

  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '' });
  const [faqForm, setFaqForm] = useState({ question: '', answer: '' });
  const [editingFaqId, setEditingFaqId] = useState(null);

  const [token] = useState(localStorage.getItem('admin_token'));

  const location = useLocation();
  const isRarrot = location.pathname.startsWith('/rarrot');

  useEffect(() => {
    document.title = '행운의 별 관리자';
    const loginPath = isRarrot ? '/rarrot/tarrot-admin/login' : '/tarrot-admin/login';
    if (!token) { navigate(loginPath); return; }

    // Initial fetch based on active tab or all
    fetchCustomers();
    fetchReviews();
    fetchReservations();
    fetchFaqs();
    // eslint-disable-next-line
  }, [token, isRarrot]);

  const fetchCustomers = async () => {
    const res = await fetch('/api/customers', { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) return handleLogout();
    setCustomers(await res.json());
  };
  const fetchReviews = async () => {
    const res = await fetch('/api/reviews', { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) return handleLogout();
    setReviews(await res.json());
  };
  const fetchReservations = async () => {
    const res = await fetch('/api/reservations', { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) return handleLogout();
    setReservations(await res.json());
  };
  const fetchFaqs = async () => {
    const res = await fetch('/api/faqs');
    setFaqs(await res.json());
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate(isRarrot ? '/rarrot/tarrot-admin/login' : '/tarrot-admin/login');
  };

  const createCustomer = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(customerForm) });
    if (res.status === 401) return handleLogout();
    setCustomerForm({ name: '', email: '', phone: '' });
    fetchCustomers();
  };

  const deleteReview = async (id) => {
    if (!confirm('삭제하시겠습니까?')) return;
    await fetch(`/api/reviews/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchReviews();
  };

  const confirmReservation = async (id) => {
    await fetch(`/api/reservations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'confirmed' })
    });
    fetchReservations();
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    const url = editingFaqId ? `/api/faqs/${editingFaqId}` : '/api/faqs';
    const method = editingFaqId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(faqForm)
    });
    setFaqForm({ question: '', answer: '' });
    setEditingFaqId(null);
    fetchFaqs();
  };

  const editFaq = (faq) => {
    setEditingFaqId(faq.id);
    setFaqForm({ question: faq.question, answer: faq.answer });
  };

  const deleteFaq = async (id) => {
    if (!confirm('FAQ를 삭제하시겠습니까?')) return;
    await fetch(`/api/faqs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchFaqs();
  };

  return (
    <div className="tarrot-admin">
      <aside className="sidebar">
        <h2>Tarrot Admin</h2>
        <nav>
          <button className={`nav-item ${activeTab === 'reservations' ? 'active' : ''}`} onClick={() => setActiveTab('reservations')}>Reservations</button>
          <button className={`nav-item ${activeTab === 'faqs' ? 'active' : ''}`} onClick={() => setActiveTab('faqs')}>FAQs</button>
          <button className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>Customers</button>
          <button className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews</button>
        </nav>
        <div style={{ marginTop: 16 }}>
          <button className="btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        {activeTab === 'reservations' && (
          <section id="reservations">
            <h3>📅 Reservations</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>연락처</th>
                  <th>날짜</th>
                  <th>시간</th>
                  <th>상담 유형</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 && (
                  <tr><td colSpan="7" className="text-center py-4 text-gray-500">예약 내역이 없습니다.</td></tr>
                )}
                {reservations.map(r => (
                  <tr key={r.id}>
                    <td className="font-bold">{r.name}</td>
                    <td>{r.phone}</td>
                    <td>{r.date}</td>
                    <td>{r.time}</td>
                    <td>
                      <span className={`badge ${r.type}`}>
                        {r.type === 'phone' ? '📞 심층 전화 타로' : r.type === 'visit' ? '🏢 프리미엄 방문 상담' : (r.type === 'chat' ? '💬 빠른 채팅 타로' : r.type)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${r.status}`}>
                        {r.status === 'confirmed' ? '확정됨' : '대기중'}
                      </span>
                    </td>
                    <td>
                      {r.status !== 'confirmed' && (
                        <button className="btn small" onClick={() => confirmReservation(r.id)}>확정</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'faqs' && (
          <section id="faqs">
            <h3>❓ FAQ Management</h3>
            <form className="admin-form" onSubmit={handleFaqSubmit}>
              <input
                placeholder="질문 (Question)"
                value={faqForm.question}
                onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                className="w-full"
              />
              <textarea
                placeholder="답변 (Answer)"
                value={faqForm.answer}
                onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                rows={3}
                style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
              />
              <button className="btn">{editingFaqId ? '수정 저장' : 'FAQ 추가'}</button>
              {editingFaqId && <button type="button" className="btn secondary ml-2" onClick={() => { setEditingFaqId(null); setFaqForm({ question: '', answer: '' }); }}>취소</button>}
            </form>

            <div className="list">
              {faqs.map(faq => (
                <div key={faq.id} className="list-item">
                  <div>
                    <div className="font-bold">Q. {faq.question}</div>
                    <div className="text-sm mt-1">A. {faq.answer}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn small secondary" onClick={() => editFaq(faq)}>수정</button>
                    <button className="btn small danger" onClick={() => deleteFaq(faq.id)}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'customers' && (
          <section id="customers">
            <h3>Customers</h3>
            <form className="admin-form" onSubmit={createCustomer}>
              <input placeholder="이름" value={customerForm.name} onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })} />
              <input placeholder="이메일" value={customerForm.email} onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })} />
              <input placeholder="전화번호" value={customerForm.phone} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} />
              <button className="btn">고객 생성</button>
            </form>

            <div className="list">
              {customers.map(c => (
                <div key={c.id} className="list-item">
                  <div>{c.name}</div>
                  <div>{c.email}</div>
                  <div>{c.phone}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'reviews' && (
          <section id="reviews">
            <h3>Reviews</h3>
            <div className="list">
              {reviews.map(r => (
                <div key={r.id} className="list-item">
                  <div><strong>{r.name}</strong> · {r.rating}점</div>
                  <div className="comment">{r.comment}</div>
                  <div><button className="danger" onClick={() => deleteReview(r.id)}>삭제</button></div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
