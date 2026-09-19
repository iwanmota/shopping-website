// Run locally from this reviewed checkout. The private key stays outside the repo.
import { readFile } from 'node:fs/promises';
import { createPrivateKey, sign } from 'node:crypto';

const [head, base, title, bodyFile] = process.argv.slice(2);
const { CODEX_APP_ID: appId, CODEX_APP_PRIVATE_KEY_FILE: keyFile } =
  process.env;
const repo = 'iwanmota/shopping-website';
if (
  !head?.startsWith('codex/') ||
  !base ||
  !title ||
  !bodyFile ||
  !appId ||
  !keyFile
) {
  throw new Error(
    'Provide CODEX_APP_ID and CODEX_APP_PRIVATE_KEY_FILE; usage: node scripts/create-bot-pr.mjs codex/head base "Title" /path/to/body.md'
  );
}
const encode = (value) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ iat: now - 60, exp: now + 540, iss: appId })}`;
const key = createPrivateKey(await readFile(keyFile));
const jwt = `${unsigned}.${sign('RSA-SHA256', Buffer.from(unsigned), key).toString('base64url')}`;
async function api(path, token, method = 'GET', body) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok)
    throw new Error(`GitHub ${method} ${path}: HTTP ${response.status}`);
  return response.status === 204 ? null : response.json();
}
const installation = await api(`/repos/${repo}/installation`, jwt);
const { token } = await api(
  `/app/installations/${installation.id}/access_tokens`,
  jwt,
  'POST',
  {
    repositories: ['shopping-website'],
    permissions: { pull_requests: 'write', contents: 'read' },
  }
);
try {
  const pr = await api(`/repos/${repo}/pulls`, token, 'POST', {
    head,
    base,
    title,
    body: await readFile(bodyFile, 'utf8'),
    draft: false,
  });
  console.log(
    JSON.stringify({
      url: pr.html_url,
      author: pr.user.login,
      head: pr.head.ref,
      base: pr.base.ref,
    })
  );
} finally {
  await api('/installation/token', token, 'DELETE');
}
