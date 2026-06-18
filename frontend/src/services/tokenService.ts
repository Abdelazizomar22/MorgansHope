const TOKEN_KEY = 'accessToken';
const PERSISTENCE_KEY = 'accessTokenPersistence';
type PersistenceMode = 'session' | 'local';

const canUseStorage = () => typeof window !== 'undefined';

const read = (storage: Storage, key: string) => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const write = (storage: Storage, key: string, value: string) => {
  try {
    storage.setItem(key, value);
  } catch {
    // Ignore quota or storage availability errors.
  }
};

const remove = (storage: Storage, key: string) => {
  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage availability errors.
  }
};

export const TokenService = {
  getToken: (): string | undefined => {
    if (!canUseStorage()) return undefined;

    return (
      read(window.localStorage, TOKEN_KEY)
      || read(window.sessionStorage, TOKEN_KEY)
      || undefined
    );
  },

  setToken: (token: string, persistent = false) => {
    if (!canUseStorage()) return;

    const target = persistent ? window.localStorage : window.sessionStorage;
    const other = persistent ? window.sessionStorage : window.localStorage;
    const mode: PersistenceMode = persistent ? 'local' : 'session';

    write(target, TOKEN_KEY, token);
    write(target, PERSISTENCE_KEY, mode);
    remove(other, TOKEN_KEY);
    remove(other, PERSISTENCE_KEY);
  },

  removeToken: () => {
    if (!canUseStorage()) return;

    remove(window.localStorage, TOKEN_KEY);
    remove(window.sessionStorage, TOKEN_KEY);
    remove(window.localStorage, PERSISTENCE_KEY);
    remove(window.sessionStorage, PERSISTENCE_KEY);
  },

  isPersistent: (): boolean => {
    if (!canUseStorage()) return false;

    return (
      read(window.localStorage, PERSISTENCE_KEY) === 'local'
      || read(window.localStorage, TOKEN_KEY) !== null
    );
  },

  getUserId: (): string | null => {
    const token = TokenService.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload.sub || null;
    } catch {
      return null;
    }
  },
};
