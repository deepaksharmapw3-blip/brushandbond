import { createDecipheriv, createCipheriv, randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const [mode, inputPath, outputPath] = process.argv.slice(2);
const keyText = process.env.BACKUP_ENCRYPTION_KEY ?? '';
if (!['encrypt', 'decrypt'].includes(mode) || !inputPath || !outputPath || !/^[a-fA-F0-9]{64}$/.test(keyText)) {
  console.error('Usage: BACKUP_ENCRYPTION_KEY=<64 hex chars> node scripts/backup-crypto.mjs <encrypt|decrypt> <input> <output>');
  process.exit(1);
}

const key = Buffer.from(keyText, 'hex');
const input = await readFile(inputPath);
if (mode === 'encrypt') {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(input), cipher.final()]);
  await writeFile(outputPath, Buffer.concat([Buffer.from('BBBK1'), iv, cipher.getAuthTag(), ciphertext]), { mode: 0o600, flag: 'wx' });
} else {
  if (input.length < 33 || input.subarray(0, 5).toString() !== 'BBBK1') throw new Error('Unrecognized backup file format.');
  const iv = input.subarray(5, 17);
  const tag = input.subarray(17, 33);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(input.subarray(33)), decipher.final()]);
  await writeFile(outputPath, plaintext, { mode: 0o600, flag: 'wx' });
}
