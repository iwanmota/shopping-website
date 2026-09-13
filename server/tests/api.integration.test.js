const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const port = 3199;
const databasePath = path.join(os.tmpdir(), `shopsmart-api-${process.pid}.db`);
const serverRoot = path.resolve(__dirname, '..');
let serverProcess;

const waitForServer = () => new Promise((resolve, reject) => {
  let output = '';
  const timeout = setTimeout(() => reject(new Error(`Timed out waiting for API server: ${output}`)), 10000);
  serverProcess.stdout.on('data', chunk => {
    output += chunk.toString();
    if (output.includes(`Server running on port ${port}`)) {
      clearTimeout(timeout);
      resolve();
    }
  });
  serverProcess.stderr.on('data', chunk => { output += chunk.toString(); });
  serverProcess.once('error', error => { clearTimeout(timeout); reject(error); });
  serverProcess.once('exit', code => {
    if (code !== null) {
      clearTimeout(timeout);
      reject(new Error(`API server exited with ${code}: ${output}`));
    }
  });
});

const api = (route, options = {}) => fetch(`http://localhost:${port}${route}`, options);
const login = async email => {
  const response = await api('/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: email === 'admin@shopsmart.com' ? 'admin123' : 'customer123' })
  });
  return response.json();
};

jest.setTimeout(15000);

describe('API integration', () => {
  beforeAll(async () => {
    fs.rmSync(databasePath, { force: true });
    const env = { ...process.env, DATABASE_PATH: databasePath, JWT_SECRET: 'integration-test-secret', PORT: String(port) };
    const initialization = spawnSync(process.execPath, ['initDb.js'], { cwd: serverRoot, env, encoding: 'utf8' });
    if (initialization.status !== 0) throw new Error(initialization.stderr);
    serverProcess = spawn(process.execPath, ['server.js'], { cwd: serverRoot, env });
    await waitForServer();
  });

  afterAll(() => {
    serverProcess?.kill();
    fs.rmSync(databasePath, { force: true });
  });

  test('serves seeded products and authenticates a seeded customer', async () => {
    const productsResponse = await api('/api/products');
    expect(productsResponse.status).toBe(200);
    expect((await productsResponse.json())).toHaveLength(6);

    const session = await login('customer@example.com');
    expect(session.user.role).toBe('customer');
  });

  test('requires authentication for checkout and order history', async () => {
    const checkoutResponse = await api('/api/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ productId: 1, quantity: 1, pricingTier: 'regular' }] })
    });
    expect(checkoutResponse.status).toBe(401);
    expect((await api('/api/orders')).status).toBe(401);
  });

  test('creates and returns a customer-owned order without exposing another user’s history', async () => {
    const customer = await login('customer@example.com');
    const checkoutResponse = await api('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customer.token}` },
      body: JSON.stringify({ items: [{ productId: 3, quantity: 1, pricingTier: 'regular' }] })
    });
    expect(checkoutResponse.status).toBe(200);
    const { receipt } = await checkoutResponse.json();
    expect(receipt.id).toEqual(expect.any(Number));

    const historyResponse = await api('/api/orders', { headers: { Authorization: `Bearer ${customer.token}` } });
    expect(historyResponse.status).toBe(200);
    expect(await historyResponse.json()).toEqual([expect.objectContaining({ id: receipt.id, total: 299.99 })]);

    const admin = await login('admin@shopsmart.com');
    expect((await api(`/api/orders/${receipt.id}`, { headers: { Authorization: `Bearer ${admin.token}` } })).status).toBe(404);
    expect((await api('/api/orders/1abc', { headers: { Authorization: `Bearer ${customer.token}` } })).status).toBe(400);
  });

  test('allows an authenticated customer to update their own profile', async () => {
    const customer = await login('customer@example.com');
    const updateResponse = await api('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customer.token}` },
      body: JSON.stringify({ firstName: 'Updated', lastName: 'Customer' })
    });

    expect(updateResponse.status).toBe(200);
    expect(await updateResponse.json()).toEqual(expect.objectContaining({
      email: 'customer@example.com', firstName: 'Updated', lastName: 'Customer', role: 'customer'
    }));

    const profileResponse = await api('/api/auth/me', {
      headers: { Authorization: `Bearer ${customer.token}` }
    });
    expect((await profileResponse.json()).firstName).toBe('Updated');
  });
});
