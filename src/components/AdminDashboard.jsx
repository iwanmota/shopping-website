import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createProduct, deleteProduct, getAdminProducts, updateProduct } from '../services/admin';
import './AdminDashboard.css';

const EMPTY_PRODUCT = {
  name: '', price: '', description: '', image: '', isOnSale: false,
  salePrice: '', regularInventory: 0, onSaleQuantity: 0, lowStockThreshold: 5
};

const AdminDashboard = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadProducts = () => {
    setLoading(true);
    getAdminProducts(token)
      .then(data => setProducts(data.products || []))
      .catch(requestError => setError(requestError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, [token]);

  const updateField = event => {
    const { name, value, type, checked } = event.target;
    setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const startEditing = product => {
    setEditingId(product.id);
    setForm({ ...EMPTY_PRODUCT, ...product, isOnSale: Boolean(product.isOnSale) });
    setNotice('');
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_PRODUCT);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const payload = {
      ...form,
      price: Number(form.price),
      salePrice: form.isOnSale ? Number(form.salePrice) : null,
      regularInventory: Number(form.regularInventory),
      onSaleQuantity: Number(form.onSaleQuantity),
      lowStockThreshold: Number(form.lowStockThreshold)
    };
    try {
      if (editingId) await updateProduct(editingId, payload, token);
      else await createProduct(payload, token);
      resetForm();
      setNotice(editingId ? 'Product updated.' : 'Product created.');
      loadProducts();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async product => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    try {
      setError('');
      await deleteProduct(product.id, token);
      setNotice('Product deleted.');
      loadProducts();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="admin-dashboard">
      <header className="admin-heading">
        <p className="eyebrow">Administration</p>
        <h1>Product management</h1>
        <p>Create, update, and remove products from the catalog.</p>
      </header>
      {error && <p className="admin-feedback error" role="alert">{error}</p>}
      {notice && <p className="admin-feedback" role="status">{notice}</p>}
      <section className="admin-grid" aria-label="Product management">
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit product' : 'New product'}</h2>
          <label>Name<input name="name" value={form.name} onChange={updateField} required /></label>
          <label>Price<input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={updateField} required /></label>
          <label>Description<textarea name="description" value={form.description || ''} onChange={updateField} rows="4" /></label>
          <label>Image path<input name="image" value={form.image || ''} onChange={updateField} placeholder="/images/products/example.jpg" /></label>
          <div className="admin-form-row">
            <label>Regular stock<input name="regularInventory" type="number" min="0" value={form.regularInventory} onChange={updateField} /></label>
            <label>Sale stock<input name="onSaleQuantity" type="number" min="0" value={form.onSaleQuantity} onChange={updateField} /></label>
          </div>
          <label className="checkbox-label"><input name="isOnSale" type="checkbox" checked={form.isOnSale} onChange={updateField} /> On sale</label>
          {form.isOnSale && <label>Sale price<input name="salePrice" type="number" min="0.01" step="0.01" value={form.salePrice || ''} onChange={updateField} required /></label>}
          <div className="admin-form-actions">
            <button type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update product' : 'Create product'}</button>
            {editingId && <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
        <section className="admin-products">
          <div className="admin-products-heading"><h2>Catalog</h2><span>{products.length} products</span></div>
          {loading ? <p>Loading products…</p> : products.length === 0 ? <p>No products found.</p> : (
            <ul>
              {products.map(product => (
                <li key={product.id}>
                  <div><strong>{product.name}</strong><span>${Number(product.price).toFixed(2)} · {Number(product.regularInventory) || 0} regular in stock</span></div>
                  <div className="product-actions"><button type="button" onClick={() => startEditing(product)}>Edit</button><button type="button" className="danger-button" onClick={() => handleDelete(product)}>Delete</button></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
};

export default AdminDashboard;
