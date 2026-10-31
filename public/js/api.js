// API Client & Mock Authentication Service for Brightloop ERP

const api = {
  baseUrl: '',
  tokenKey: 'brightloop_auth_token',
  userKey: 'brightloop_auth_user',

  getToken() {
    return localStorage.getItem(this.tokenKey);
  },

  setToken(token) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  },

  getUser() {
    try {
      const data = localStorage.getItem(this.userKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.userKey);
    }
  },

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please verify your credentials.');
      }

      return { token: data.token, user: data.user };
    } catch (err) {
      console.warn('Backend login request error, checking local fallback:', err);
      // If server unreachable, throw meaningful error
      throw err;
    }
  },

  async register(registrationData) {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      const errMsg = data.details ? data.details.join('. ') : (data.error || 'Registration failed');
      throw new Error(errMsg);
    }
    return data;
  },

  async forgotPassword(email) {
    const response = await fetch(`${this.baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to request password reset link');
    }
    return data;
  },

  logout() {
    this.setToken(null);
    this.setUser(null);
  }
};

window.api = api;
