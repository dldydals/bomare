import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientLayout from './components/layout/ClientLayout';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/client/Home';
import About from './pages/client/About';
import Portfolio from './pages/client/Portfolio';
import Event from './pages/client/Event';
import Contact from './pages/client/Contact';
import Dashboard from './pages/admin/Dashboard';
import CustomerList from './pages/admin/CustomerList';
import VendorList from './pages/admin/VendorList';
import SettlementList from './pages/admin/SettlementList';
import CategoryPage from './pages/client/CategoryPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="category/:id" element={<CategoryPage />} />
          <Route path="event" element={<Event />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="vendors" element={<VendorList />} />
          <Route path="settlements" element={<SettlementList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
