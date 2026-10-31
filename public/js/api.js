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
    // Simulate network delay for hackathon UX
    await new Promise((res) => setTimeout(res, 450));

    // Preset Hackathon Accounts
    const accounts = {
      'admin@brightloop.com': {
        role: 'admin',
        name: 'Alex Rivera (Admin)',
        email: 'admin@brightloop.com',
        permissions: ['all']
      },
      'staff@brightloop.com': {
        role: 'staff',
        name: 'Sarah Chen (Sales Ops)',
        email: 'staff@brightloop.com',
        permissions: ['quotes', 'invoices', 'subscriptions']
      },
      'customer@shopmate.com': {
        role: 'customer',
        name: 'Shopmate Retail Corp',
        email: 'customer@shopmate.com',
        tenantId: 'cust_9021',
        permissions: ['portal']
      }
    };

    const user = accounts[email.toLowerCase()] || {
      role: 'customer',
      name: email.split('@')[0],
      email: email,
      permissions: ['portal']
    };

    const token = 'jwt_' + Math.random().toString(36).substring(2) + Date.now();
    return { token, user };
  },

  logout() {
    this.setToken(null);
    this.setUser(null);
  }
};

window.api = api;
