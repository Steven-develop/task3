import { useState, useEffect } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', telephone: '', address: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const response = await getCustomers();
    setCustomers(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateCustomer(editing.customerNumber, formData);
    } else {
      await createCustomer(formData);
    }
    setEditing(null);
    setFormData({ firstName: '', lastName: '', telephone: '', address: '' });
    fetchCustomers();
  };

  const handleEdit = (customer) => {
    setEditing(customer);
    setFormData(customer);
  };

  const handleDelete = async (customerNumber) => {
    if (window.confirm('Are you sure?')) {
      await deleteCustomer(customerNumber);
      fetchCustomers();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Customers</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="tel"
            placeholder="Telephone"
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            className="p-2 border rounded"
          />
          <textarea
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="p-2 border rounded col-span-2"
            rows="2"
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {editing ? 'Update' : 'Add'} Customer
        </button>
        {editing && (
          <button type="button" onClick={() => { setEditing(null); setFormData({ firstName: '', lastName: '', telephone: '', address: '' }); }} className="mt-4 ml-2 bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
        )}
      </form>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telephone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.customerNumber}>
                <td className="px-6 py-4">{customer.customerNumber}</td>
                <td className="px-6 py-4">{customer.firstName} {customer.lastName}</td>
                <td className="px-6 py-4">{customer.telephone}</td>
                <td className="px-6 py-4">{customer.address}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleEdit(customer)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                  <button onClick={() => handleDelete(customer.customerNumber)} className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}