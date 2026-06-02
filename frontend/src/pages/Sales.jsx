import { useState, useEffect } from 'react';
import { getSales, getCustomers, getProducts, createSale, deleteSale } from '../api';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    salesDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    customerNumber: '',
    items: [{ productCode: '', quantity: 1, priceAtSale: '' }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [salesRes, customersRes, productsRes] = await Promise.all([
      getSales(),
      getCustomers(),
      getProducts()
    ]);
    setSales(salesRes.data);
    setCustomers(customersRes.data);
    setProducts(productsRes.data);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productCode: '', quantity: 1, priceAtSale: '' }]
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === 'productCode') {
      const product = products.find(p => p.productCode === value);
      if (product) {
        newItems[index].priceAtSale = product.unitPrice;
      }
    }
    setFormData({ ...formData, items: newItems });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSale(formData);
      setShowForm(false);
      setFormData({
        invoiceNumber: '',
        salesDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        customerNumber: '',
        items: [{ productCode: '', quantity: 1, priceAtSale: '' }]
      });
      fetchData();
    } catch (error) {
      alert('Error creating sale: ' + error.response?.data?.error);
    }
  };

  const handleDelete = async (invoiceNumber) => {
    if (window.confirm('Are you sure? This will delete the sale and restore product stock.')) {
      await deleteSale(invoiceNumber);
      fetchData();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Sales</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {showForm ? 'Cancel' : 'New Sale'}
        </button>
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Invoice Number"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              className="p-2 border rounded"
              required
            />
            <input
              type="date"
              value={formData.salesDate}
              onChange={(e) => setFormData({ ...formData, salesDate: e.target.value })}
              className="p-2 border rounded"
              required
            />
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="p-2 border rounded"
              required
            >
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Online">Online</option>
            </select>
            <select
              value={formData.customerNumber}
              onChange={(e) => setFormData({ ...formData, customerNumber: e.target.value })}
              className="p-2 border rounded"
              required
            >
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.customerNumber} value={c.customerNumber}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          </div>
          
          <h3 className="font-bold mb-2">Sale Items</h3>
          {formData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
              <select
                value={item.productCode}
                onChange={(e) => handleItemChange(index, 'productCode', e.target.value)}
                className="p-2 border rounded"
                required
              >
                <option value="">Select Product</option>
                {products.map(p => (
                  <option key={p.productCode} value={p.productCode}>
                    {p.productName} (Stock: {p.quantityInStock})
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                className="p-2 border rounded"
                required
                min="1"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price at Sale"
                value={item.priceAtSale}
                onChange={(e) => handleItemChange(index, 'priceAtSale', parseFloat(e.target.value))}
                className="p-2 border rounded"
                required
              />
              <button type="button" onClick={() => handleRemoveItem(index)} className="bg-red-500 text-white px-2 py-1 rounded">Remove</button>
            </div>
          ))}
          <button type="button" onClick={handleAddItem} className="mt-2 bg-green-500 text-white px-4 py-1 rounded">Add Item</button>
          
          <button type="submit" className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create Sale
          </button>
        </form>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sales.map((sale) => (
              <tr key={sale.invoiceNumber}>
                <td className="px-6 py-4">{sale.invoiceNumber}</td>
                <td className="px-6 py-4">{new Date(sale.salesDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">{sale.customerName}</td>
                <td className="px-6 py-4">{sale.paymentMethod}</td>
                <td className="px-6 py-4">${parseFloat(sale.totalAmountPaid).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(sale.invoiceNumber)} className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}