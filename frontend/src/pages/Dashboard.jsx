import { useEffect, useState } from 'react';
import { getCustomers, getProducts, getSales } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ customers: 0, products: 0, sales: 0, revenue: 0 });
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customers, products, sales] = await Promise.all([
          getCustomers(),
          getProducts(),
          getSales(),
        ]);
        
        const totalRevenue = sales.data.reduce((sum, sale) => sum + parseFloat(sale.totalAmountPaid), 0);
        
        setStats({
          customers: customers.data.length,
          products: products.data.length,
          sales: sales.data.length,
          revenue: totalRevenue,
        });
        
        setRecentSales(sales.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm">Total Customers</h3>
          <p className="text-3xl font-bold">{stats.customers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm">Total Products</h3>
          <p className="text-3xl font-bold">{stats.products}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm">Total Sales</h3>
          <p className="text-3xl font-bold">{stats.sales}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-3xl font-bold">${stats.revenue.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Sales</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentSales.map((sale) => (
                <tr key={sale.invoiceNumber}>
                  <td className="px-6 py-4">{sale.invoiceNumber}</td>
                  <td className="px-6 py-4">{new Date(sale.salesDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{sale.customerName}</td>
                  <td className="px-6 py-4">${parseFloat(sale.totalAmountPaid).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}