import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrder, getOrders } from '../services/orders';
import { parseServerDate } from '../services/dates';
import './OrderHistory.css';

const formatCurrency = amount => `$${Number(amount).toFixed(2)}`;

const OrderHistory = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrders(token)
      .then(setOrders)
      .catch(requestError => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [token]);

  const viewOrder = async orderId => {
    try {
      setError('');
      setSelectedOrder(await getOrder(orderId, token));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (loading) return <main className="orders-page"><p>Loading orders…</p></main>;

  return (
    <main className="orders-page">
      <div className="orders-heading">
        <p className="eyebrow">Account</p>
        <h1>Order history</h1>
        <p>Your completed local purchases are stored here.</p>
      </div>
      {error && <p className="orders-error" role="alert">{error}</p>}
      {orders.length === 0 ? <p className="orders-empty">You have not placed an order yet.</p> : (
        <div className="orders-layout">
          <ul className="orders-list">
            {orders.map(order => (
              <li key={order.id}>
                <button className={selectedOrder?.id === order.id ? 'order-row selected' : 'order-row'} onClick={() => viewOrder(order.id)}>
                  <span>Order #{order.id}</span>
                  <span>{parseServerDate(order.createdAt).toLocaleDateString()}</span>
                  <strong>{formatCurrency(order.total)}</strong>
                </button>
              </li>
            ))}
          </ul>
          {selectedOrder && (
            <section className="order-detail" aria-live="polite">
              <p className="eyebrow">Order #{selectedOrder.id}</p>
              <h2>{selectedOrder.status}</h2>
              <p>{parseServerDate(selectedOrder.createdAt).toLocaleString()}</p>
              <ul>
                {selectedOrder.items.map(item => (
                  <li key={`${item.productId}-${item.pricingTier}`}>
                    <span>{item.productName} · {item.pricingTier}</span>
                    <span>{item.quantity} × {formatCurrency(item.unitPrice)}</span>
                    <strong>{formatCurrency(item.subtotal)}</strong>
                  </li>
                ))}
              </ul>
              <div className="order-total">Total <strong>{formatCurrency(selectedOrder.total)}</strong></div>
            </section>
          )}
        </div>
      )}
    </main>
  );
};

export default OrderHistory;
