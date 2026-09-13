import { describe, expect, test, vi } from 'vitest';
import { apiRequest } from './api';
import { updateProfile } from './profile';

vi.mock('./api', () => ({ apiRequest: vi.fn() }));

test('updates the authenticated user profile', async () => {
  apiRequest.mockResolvedValue({ id: 2, firstName: 'Ada' });
  const profile = { firstName: 'Ada', lastName: 'Lovelace' };

  await updateProfile(profile, 'customer-token');

  expect(apiRequest).toHaveBeenCalledWith('/api/auth/me', {
    method: 'PUT', body: profile, token: 'customer-token'
  });
});
