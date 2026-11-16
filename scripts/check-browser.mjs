import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../', import.meta.url));
const server = spawn(process.execPath, ['scripts/serve.mjs', 'dist'], {
  cwd, env: { ...process.env, PORT: '4173' }, stdio: ['ignore', 'pipe', 'inherit'],
});
try {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(Error('O preview não iniciou em 15 segundos.')), 15000);
    const done = callback => value => { clearTimeout(timeout); callback(value); };
    server.once('error', done(reject));
    server.once('exit', done(() => reject(Error('O preview encerrou antes de iniciar.'))));
    server.stdout.on('data', data => {
      process.stdout.write(data);
      if (String(data).includes('DigiDex:')) done(resolve)();
    });
  });
  const response = await fetch('http://127.0.0.1:4173', { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw Error(`Preview retornou HTTP ${response.status}`);
  for (const file of ['browser_smoke.py', 'exploration_browser.py', 'experience_browser.py', 'sharing_browser.py']) {
    const child = spawn(process.env.PYTHON || 'python', ['tests/' + file], {
      cwd, env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, stdio: 'inherit',
    });
    const [code] = await once(child, 'exit');
    if (code !== 0) throw Error(`${file} falhou com código ${code}`);
  }
} finally {
  if (server.exitCode === null) {
    const ended = once(server, 'exit');
    server.kill();
    await Promise.race([ended, delay(5000, undefined, { ref: false })]);
  }
}
