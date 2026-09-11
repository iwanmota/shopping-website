const path = require('path');
const { execFileSync } = require('child_process');

const repositoryRoot = path.resolve(__dirname, '../..');
const expectedDatabasePath = path.join(repositoryRoot, 'shopping.db');
const configModule = path.join(repositoryRoot, 'server/config/database.js');

const readDatabasePathFrom = (cwd) => execFileSync(
  process.execPath,
  ['-e', `process.stdout.write(require(${JSON.stringify(configModule)}).DATABASE_PATH)`],
  { cwd, encoding: 'utf8' }
);

describe('database configuration', () => {
  test.each([
    ['repository root', repositoryRoot],
    ['server directory', path.join(repositoryRoot, 'server')]
  ])('uses the same database when started from the %s', (_label, cwd) => {
    expect(readDatabasePathFrom(cwd)).toBe(expectedDatabasePath);
  });
});
