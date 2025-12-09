import { useState, useEffect } from 'react';
import './AdminTable.css';

export default function SettlementList() {
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/settlements')
            .then(res => res.json())
            .then(data => {
                setSettlements(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <h1 className="page-title">정산 관리</h1>
            </div>

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>업체명</th>
                            <th>금액</th>
                            <th>상태</th>
                            <th>지급 예정일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center">로딩 중...</td></tr>
                        ) : settlements.map(item => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.vendor_name}</td>
                                <td>{Number(item.amount).toLocaleString()}원</td>
                                <td>
                                    <span className={`status-badge ${item.status === 'paid' ? 'active' : 'pending'}`}>
                                        {item.status === 'paid' ? '지급 완료' : '대기중'}
                                    </span>
                                </td>
                                <td>{new Date(item.due_date).toLocaleDateString()}</td>
                            </tr>
                        ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}
