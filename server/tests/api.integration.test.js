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
  serverProcess.once('error', error => {
    clearTimeout(timeout);
    reject(error);
  });
  serverProcess.once('exit', code => {
    if (code !== null) {
      clearTimeout(timeout);
      reject(new Error(`API server exited with ${code}: ${output}`));
    }
  });
});

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
    const productsResponse = await fetch(`http://localhost:${port}/api/products`);
    expect(productsResponse.status).toBe(200);
    expect((await productsResponse.json())).toHaveLength(6);

    const loginResponse = await fetch(`http://localhost:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@example.com', password: 'customer123' })
    });
    expect(loginResponse.status).toBe(200);
    expect((await loginResponse.json()).user.role).toBe('customer');
  });

  test('requires authentication for checkout', async () => {
    const response = await fetch(`http://localhost:${port}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ productId: 1, quantity: 1, pricingTier: 'regular' }] })
    });
    expect(response.status).toBe(401);
  });
});
