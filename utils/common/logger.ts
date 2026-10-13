import fs from 'fs';
import path from 'path';

const logPath = path.resolve(process.cwd(), 'logs', 'test.log');
fs.mkdirSync(path.dirname(logPath), { recursive: true });

export const logger = {
  info(message: string): void { write('INFO', message); },
  error(message: string): void { write('ERROR', message); }
};

function write(level: string, message: string): void {
  const line = `${new Date().toISOString()} [${level}] ${message}`;
  console.log(line);
  fs.appendFileSync(logPath, `${line}\n`);
}
