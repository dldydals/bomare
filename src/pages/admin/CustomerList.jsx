import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import './AdminTable.css'; // Shared styles

export default function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/customers')
            .then(res => res.json())
            .then(data => {
                setCustomers(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <h1 className="page-title">고객 관리</h1>
                <div className="page-actions">
                    <button className="btn-primary"><Plus size={16} /> 고객 등록</button>
                </div>
            </div>

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>이름</th>
                            <th>이메일</th>
                            <th>전화번호</th>
                            <th>상태</th>
                            <th>가입일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center">로딩 중...</td></tr>
                        ) : customers.length === 0 ? (
                            <tr><td colSpan="6" className="text-center">데이터가 없습니다.</td></tr>
                        ) : (
                            customers.map(customer => (
                                <tr key={customer.id}>
                                    <td>{customer.id}</td>
                                    <td>{customer.name}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.phone}</td>
                                    <td><span className={`status-badge ${customer.status}`}>{customer.status}</span></td>
                                    <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
