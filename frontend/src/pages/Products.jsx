import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ productCode: '', productName: '', unitPrice: '', quantityInStock: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const response = await getProducts();
    setProducts(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateProduct(editing.productCode, formData);
    } else {
      await createProduct(formData);
    }
    setEditing(null);
    setFormData({ productCode: '', productName: '', unitPrice: '', quantityInStock: '' });
    fetchProducts();
  };

  const handleEdit = (product) => {
    setEditing(product);
    setFormData(product);
  };

  const handleDelete = async (productCode) => {
    if (window.confirm('Are you sure?')) {
      await deleteProduct(productCode);
      fetchProducts();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Products</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Product Code"
            value={formData.productCode}
            onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
            className="p-2 border rounded"
            required
            disabled={editing}
          />
          <input
            type="text"
            placeholder="Product Name"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Unit Price"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Quantity In Stock"
            value={formData.quantityInStock}
            onChange={(e) => setFormData({ ...formData, quantityInStock: e.target.value })}
            className="p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {editing ? 'Update' : 'Add'} Product
        </button>
        {editing && (
          <button type="button" onClick={() => { setEditing(null); setFormData({ productCode: '', productName: '', unitPrice: '', quantityInStock: '' }); }} className="mt-4 ml-2 bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
        )}
      </form>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">In Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.productCode}>
                <td className="px-6 py-4">{product.productCode}</td>
                <td className="px-6 py-4">{product.productName}</td>
                <td className="px-6 py-4">${parseFloat(product.unitPrice).toFixed(2)}</td>
                <td className="px-6 py-4">{product.quantityInStock}</td>
                <td className="px-6 py-4">{product.quantitySold}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                  <button onClick={() => handleDelete(product.productCode)} className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}