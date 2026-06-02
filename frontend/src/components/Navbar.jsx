import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="text-xl font-bold">SRMS - Sales Management System</div>
          <div className="space-x-6">
            <Link to="/" className="hover:text-blue-200">Dashboard</Link>
            <Link to="/customers" className="hover:text-blue-200">Customers</Link>
            <Link to="/products" className="hover:text-blue-200">Products</Link>
            <Link to="/sales" className="hover:text-blue-200">Sales</Link>
            <button onClick={handleLogout} className="bg-red-500 px-4 py-1 rounded hover:bg-red-600">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}