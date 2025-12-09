import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';
import './Dashboard.css';

const KPI_DATA = [
    { label: 'Weekly Revenue', value: '₩12,500,000', change: '+12%', icon: <DollarSign />, color: 'var(--color-gold)' },
    { label: 'New Inquiries', value: '24', change: '+5%', icon: <Users />, color: '#4CAF50' },
    { label: 'Pending Consultations', value: '8', change: '-2%', icon: <Calendar />, color: '#FF9800' },
    { label: 'Conversion Rate', value: '18%', change: '+1.5%', icon: <TrendingUp />, color: '#2196F3' }
];

export default function Dashboard() {
    return (
        <div className="admin-dashboard">
            <h2 className="page-title">Dashboard</h2>

            {/* KPIs */}
            <div className="kpi-grid">
                {KPI_DATA.map((kpi, index) => (
                    <div key={index} className="kpi-card">
                        <div className="kpi-icon" style={{ backgroundColor: `${kpi.color}20`, color: kpi.color }}>
                            {kpi.icon}
                        </div>
                        <div className="kpi-info">
                            <span className="kpi-label">{kpi.label}</span>
                            <h3 className="kpi-value">{kpi.value}</h3>
                            <span className={`kpi-change ${kpi.change.startsWith('+') ? 'positive' : 'negative'}`}>
                                {kpi.change} from last week
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Placeholder for Charts/Recent Activity */}
            <div className="dashboard-grid">
                <div className="card chart-card">
                    <h3>Monthly Revenue</h3>
                    <div className="chart-placeholder">
                        Chart Visualization Graph
                    </div>
                </div>
                <div className="card recent-activity">
                    <h3>Recent Activity</h3>
                    <ul className="activity-list">
                        <li><strong>Kim Minji</strong> booked specific consultation. <span className="time">2h ago</span></li>
                        <li><strong>Lee Junho</strong> signed contract. <span className="time">5h ago</span></li>
                        <li>System auto-sent confirmation email to <strong>Park Sooyoung</strong>. <span className="time">1d ago</span></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
