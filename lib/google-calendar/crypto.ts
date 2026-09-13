import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { getGoogleCalendarEnvironment } from '@/lib/env';

const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';

function getEncryptionKey() {
  const configuredKey = getGoogleCalendarEnvironment().GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY;
  const key = Buffer.from(configuredKey, 'base64');

  if (key.length !== 32) {
    throw new Error('GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key.');
  }

  return key;
}

export function encryptGoogleRefreshToken(refreshToken: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(refreshToken, 'utf8'), cipher.final()]);
  const authenticationTag = cipher.getAuthTag();

  return [VERSION, iv.toString('base64url'), authenticationTag.toString('base64url'), encrypted.toString('base64url')].join('.');
}

export function decryptGoogleRefreshToken(value: string) {
  const [version, encodedIv, encodedAuthenticationTag, encodedEncrypted] = value.split('.');

  if (version !== VERSION || !encodedIv || !encodedAuthenticationTag || !encodedEncrypted) {
    throw new Error('The stored Google Calendar refresh token has an invalid format.');
  }

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(encodedIv, 'base64url'));
  decipher.setAuthTag(Buffer.from(encodedAuthenticationTag, 'base64url'));

  return Buffer.concat([
    decipher.update(Buffer.from(encodedEncrypted, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}
