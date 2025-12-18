import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientLayout from './components/layout/ClientLayout';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/client/Home';
import About from './pages/client/About';
import Tarrot from './pages/client/Tarrot';
import Portfolio from './pages/client/Portfolio';
import Event from './pages/client/Event';
import Contact from './pages/client/Contact';
import Dashboard from './pages/admin/Dashboard';
import CustomerList from './pages/admin/CustomerList';
import VendorList from './pages/admin/VendorList';
import SettlementList from './pages/admin/SettlementList';
import TarrotAdmin from './pages/admin/TarrotAdmin';
import TarrotAdminLogin from './pages/admin/TarrotAdminLogin';
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
          {/* Tarrot is a standalone site — not inside Bomare client layout */}
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="vendors" element={<VendorList />} />
          <Route path="settlements" element={<SettlementList />} />
          {/* Tarrot admin is standalone and should not be inside Bomare admin layout */}
        </Route>

        {/* Tarrot standalone routes (no Bomare header/footer) */}
        <Route path="/tarrot" element={<Tarrot />} />
        <Route path="/tarrot-admin" element={<TarrotAdmin />} />
        <Route path="/tarrot-admin/login" element={<TarrotAdminLogin />} />

        {/* Rarrot (Tarrot alternative) standalone routes */}
        <Route path="/rarrot" element={<Tarrot />} />
        <Route path="/rarrot/tarrot-admin" element={<TarrotAdmin />} />
        <Route path="/rarrot/tarrot-admin/login" element={<TarrotAdminLogin />} />

      </Routes>
    </Router>
  );
}

export default App;
