import Cookies from 'js-cookie';

const TOKEN_KEY = 'accessToken';

export const TokenService = {
  getToken: (): string | undefined => Cookies.get(TOKEN_KEY),

  setToken: (token: string) => {
    Cookies.set(TOKEN_KEY, token, {
      expires: 1,
      secure: true,
      sameSite: 'strict',
    });
  },

  removeToken: () => {
    Cookies.remove(TOKEN_KEY);
  },

  getUserId: (): string | null => {
    const token = Cookies.get(TOKEN_KEY);
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload.sub || null;
    } catch {
      return null;
    }
  },
};
