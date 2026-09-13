import React from 'react';
import { vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';

vi.mock('../services/api', () => ({ apiRequest: vi.fn() }));

import { AuthProvider, useAuth } from './AuthContext';
import { apiRequest } from '../services/api';

const StateProbe = ({ onState }) => {
  const state = useAuth();
  React.useEffect(() => onState(state), [state, onState]);
  return null;
};

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

test('validates a saved token with /api/auth/me instead of trusting saved user data', async () => {
  localStorage.setItem('auth_token', 'saved-token');
  apiRequest.mockResolvedValue({ id: 1, email: 'server@example.com', role: 'customer' });
  const onState = vi.fn();

  render(<AuthProvider><StateProbe onState={onState} /></AuthProvider>);

  await waitFor(() => expect(onState).toHaveBeenLastCalledWith(expect.objectContaining({
    isAuthenticated: true,
    user: { id: 1, email: 'server@example.com', role: 'customer' }
  })));
  expect(apiRequest).toHaveBeenCalledWith('/api/auth/me', { token: 'saved-token' });
});

test('clears an invalid saved token', async () => {
  localStorage.setItem('auth_token', 'expired-token');
  apiRequest.mockRejectedValue({ status: 401 });
  const onState = vi.fn();

  render(<AuthProvider><StateProbe onState={onState} /></AuthProvider>);

  await waitFor(() => expect(onState).toHaveBeenLastCalledWith(expect.objectContaining({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false
  })));
  expect(localStorage.getItem('auth_token')).toBeNull();
});
