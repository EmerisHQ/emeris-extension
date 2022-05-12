import scrypt from 'scrypt-js';
import buffer from 'scrypt-js/thirdparty/buffer';

const getSecureKey = (passwordInput) => {
  const password = new buffer.SlowBuffer(passwordInput.normalize('NFKC'));
  const salt = new buffer.SlowBuffer(process.env.VITE_ENCRYPTION_SALT.normalize('NFKC'));

  // key creation should take 500ms
  const N = 65536,
    r = 8,
    p = 1;
  const dkLen = 32;

  const key = scrypt.syncScrypt(password, salt, N, r, p, dkLen);
  return key;
};

export const encrypt = async (value, password) => {
  const key = getSecureKey(password);
  const iv = Buffer.from(process.env.VITE_IV);
  const key_encoded = await crypto.subtle.importKey('raw', key.buffer, 'AES-GCM', false, ['encrypt', 'decrypt']);
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key_encoded,
    Buffer.from(value),
  );
  return Buffer.from(encrypted).toString('hex');
};

export const decrypt = async (value, password) => {
  const key = getSecureKey(password);
  const iv = Buffer.from(process.env.VITE_IV);
  const key_encoded = await crypto.subtle.importKey('raw', key.buffer, 'AES-GCM', false, ['encrypt', 'decrypt']);
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key_encoded,
    Buffer.from(value, 'hex'),
  );
  const decoder = new TextDecoder();
  const plaintext = decoder.decode(decrypted);
  return plaintext;
};
