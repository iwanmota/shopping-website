import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/profile';
import './ProfilePage.css';

const ProfilePage = () => {
  const { token, user } = useAuth();
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async event => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await updateProfile(form, token);
      setMessage('Profile updated successfully.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="profile-dashboard">
      <div className="profile-heading">
        <p className="eyebrow">Account</p>
        <h1>Your profile</h1>
        <p>Update the name associated with your ShopSmart account.</p>
      </div>
      {message && <p className="profile-feedback" role="status">{message}</p>}
      {error && <p className="profile-feedback error" role="alert">{error}</p>}
      <form className="profile-form" onSubmit={handleSubmit}>
        <label>Email<input value={user?.email || ''} readOnly /></label>
        <label>First name<input name="firstName" value={form.firstName} onChange={handleChange} /></label>
        <label>Last name<input name="lastName" value={form.lastName} onChange={handleChange} /></label>
        <p className="profile-role">Account role: <strong>{user?.role}</strong></p>
        <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
      </form>
    </main>
  );
};

export default ProfilePage;
