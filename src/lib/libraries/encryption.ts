import scrypt from 'scrypt-js';
import buffer from 'scrypt-js/thirdparty/buffer';

const getSecureKey = (passwordInput) => {
  const password = new buffer.SlowBuffer(passwordInput.normalize('NFKC'));
  const salt = new buffer.SlowBuffer(process.env.VITE_ENCRYPTION_SALT.normalize('NFKC'));

  // key creation should take 500ms
  const N = process.env.VITE_UNSECURE_KEYS ? 2 : 65536,
    r = 8,
    p = 1;
  const dkLen = 32;

  const key = scrypt.syncScrypt(password, salt, N, r, p, dkLen);
  return key;
};

export const importKey = async (passwordInput: string) => {
  const secureKey = await getSecureKey(passwordInput);
  const importedKey = await crypto.subtle.importKey('raw', secureKey.buffer, 'AES-GCM', false, ['encrypt', 'decrypt']);
  return importedKey;
};

export const encrypt = async (value, importedKey: CryptoKey) => {
  const iv = Buffer.from(process.env.VITE_IV);
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    importedKey,
    Buffer.from(value),
  );
  return Buffer.from(encrypted).toString('hex');
};

export const decrypt = async (value, importedKey: CryptoKey) => {
  const iv = Buffer.from(process.env.VITE_IV);
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    importedKey,
    Buffer.from(value, 'hex'),
  );
  const decoder = new TextDecoder();
  const plaintext = decoder.decode(decrypted);
  return plaintext;
};
