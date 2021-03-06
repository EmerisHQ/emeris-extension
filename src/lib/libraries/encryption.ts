import scrypt from 'scrypt-js';
import buffer from 'scrypt-js/thirdparty/buffer';

const getSecureKey = (passwordInput: string) => {
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
  const secureKey = getSecureKey(passwordInput);
  const importedKey = await crypto.subtle.importKey('raw', secureKey.buffer, 'AES-GCM', true, ['encrypt', 'decrypt']);
  return importedKey;
};

export const encrypt = async (plaintext, importedKey: CryptoKey) => {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // get 96-bit random iv
  const ivStr = Array.from(iv)
    .map((b) => String.fromCharCode(b))
    .join(''); // iv as utf-8 string

  const alg = { name: 'AES-GCM', iv: iv }; // specify algorithm to use

  const ptUint8 = new TextEncoder().encode(plaintext); // encode plaintext as UTF-8
  const ctBuffer = await crypto.subtle.encrypt(alg, importedKey, ptUint8); // encrypt plaintext using key

  const ctArray = Array.from(new Uint8Array(ctBuffer)); // ciphertext as byte array
  const ctStr = ctArray.map((byte) => String.fromCharCode(byte)).join(''); // ciphertext as string

  return Buffer.from(ivStr + ctStr).toString('base64');
};

export const decrypt = async (ciphertext, importedKey: CryptoKey) => {
  const ivStr = Buffer.from(ciphertext, 'base64').toString().slice(0, 12); // decode base64 iv
  const iv = new Uint8Array(Array.from(ivStr).map((ch) => ch.charCodeAt(0))); // iv as Uint8Array

  const alg = { name: 'AES-GCM', iv: iv }; // specify algorithm to use

  const ctStr = Buffer.from(ciphertext, 'base64').toString().slice(12); // decode base64 ciphertext
  const ctUint8 = new Uint8Array(Array.from(ctStr).map((ch) => ch.charCodeAt(0))); // ciphertext as Uint8Array

  try {
    const plainBuffer = await crypto.subtle.decrypt(alg, importedKey, ctUint8); // decrypt ciphertext using key
    const plaintext = new TextDecoder().decode(plainBuffer); // plaintext from ArrayBuffer
    return plaintext; // return the plaintext
  } catch (e) {
    throw new Error('Decrypt failed');
  }
};
