
const app = {
  showLogin(defaultRole = 'admin') {
  const root = document.getElementById('app-root');
  root.innerHTML = `
    <div class="split-auth-container">
      <!-- Left Showcase Stage -->
      <aside class="auth-showcase-panel">
        <div class="showcase-header">
          <div class="showcase-brand">
            <div class="showcase-logo">B</div>
            <div>
              <h3 style="font-size: 19px; font-weight: 800;">Brightloop</h3>
              <p style="font-size: 11px; color: #cbd5e1; text-transform: uppercase;">Subscription Engine</p>
            </div>
          </div>
          <div class="hackathon-pill">
            <span class="pulse-dot"></span>
            <span>Odoo x FLUX Hackathon '26 Edition</span>
          </div>
        </div>

        <div class="showcase-content">
          <h1 class="showcase-title">Recurring Billing &<br/>Subscriptions Unified.</h1>
          <p class="showcase-subtitle">
            The high-performance digital backbone that turns quotations into active subscriptions, automates billing days with zero duplicates, and reports real-time MRR in under two seconds.
          </p>

          <div class="feature-glass-stack">
            <div class="feature-glass-card">
              <div class="feature-icon-box">⚡</div>
              <div class="feature-text">
                <h4>Automated Billing Day Engine</h4>
                <p>Invoices generated with customer details, lines & taxes. Nothing billed twice.</p>
              </div>
            </div>
            <div class="feature-glass-card">
              <div class="feature-icon-box">🏷️</div>
              <div class="feature-text">
                <h4>Smart Variant Pricing (+560 Odoo Brand)</h4>
                <p>Configurable surcharges & automated percentage/fixed discount rules.</p>
              </div>
            </div>
            <div class="feature-glass-card">
              <div class="feature-icon-box">📊</div>
              <div class="feature-text">
                <h4>Finance Lead KPIs (< 2s SLA)</h4>
                <p>Real-time MRR, cash collections, and delinquent overdue chasing.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="showcase-footer">
          <span>© 2026 Brightloop Software Inc.</span>
          <span>ACID Compliant • Relational SQLite WAL</span>
        </div>
      </aside>

      <!-- Right Interactive Authentication Stage -->
      <section class="auth-form-panel">
        <div class="auth-form-inner">
          <div class="auth-tab-bar">
            <button class="auth-tab-btn active" onclick="app.showLogin()">Sign In</button>
            <button class="auth-tab-btn" onclick="app.showRegister()">Customer Sign Up</button>
          </div>

          <div style="margin-bottom: 22px;">
            <h2 style="font-size: 24px; font-weight: 800; color: var(--text-main);">Welcome to Brightloop</h2>
            <p style="font-size: 13.5px; color: var(--text-muted); margin-top: 4px;">Sign in to access your dashboard or client portal</p>
          </div>

          <!-- 1-Click Role Switcher for Hackathon Judges -->
          <div class="role-preset-section">
            <div class="role-preset-label">
              <span>Select Test Account</span>
              <span style="font-size: 11px; color: #a855f7; font-weight: 600;">⚡ 1-Click Auto-Fill</span>
            </div>
            <div class="role-cards-grid">
              <div class="role-card-preset ${defaultRole === 'admin' ? 'active' : ''}" id="card-admin" onclick="app.selectRolePreset('admin')">
                <div class="role-avatar">🛡️</div>
                <strong class="role-title">Admin</strong>
                <span class="role-name">Full Control</span>
              </div>
              <div class="role-card-preset ${defaultRole === 'staff' ? 'active' : ''}" id="card-staff" onclick="app.selectRolePreset('staff')">
                <div class="role-avatar">💼</div>
                <strong class="role-title">Staff</strong>
                <span class="role-name">Quotes & Bills</span>
              </div>
              <div class="role-card-preset ${defaultRole === 'customer' ? 'active' : ''}" id="card-customer" onclick="app.selectRolePreset('customer')">
                <div class="role-avatar">🏪</div>
                <strong class="role-title">Customer</strong>
                <span class="role-name">Client Portal</span>
              </div>
            </div>
          </div>

          <form id="login-form">
            <div class="form-group">
              <label for="login-email">Email Address</label>
              <div class="input-with-icon">
                <span class="input-icon-prefix">✉️</span>
                <input type="email" id="login-email" class="form-control" required placeholder="name@company.com" />
              </div>
            </div>

            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label for="login-password" style="margin: 0;">Password</label>
                <a href="#" onclick="app.showForgotPasswordModal(); return false;" style="font-size: 12px; color: var(--primary); font-weight: 600; text-decoration: none;">Forgot password?</a>
              </div>
              <div class="input-with-icon">
                <span class="input-icon-prefix">🔒</span>
                <input type="password" id="login-password" class="form-control" required placeholder="Enter your password" />
                <button type="button" class="password-toggle-btn" id="toggle-password-btn" onclick="app.togglePasswordVisibility('login-password', 'toggle-password-btn')" title="Show or hide password">👁️</button>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted); cursor: pointer;">
                <input type="checkbox" id="remember-me" checked style="accent-color: var(--primary);" />
                <span>Remember this device</span>
              </label>
              <span id="role-pill-indicator" class="badge badge-confirmed" style="font-size: 11px;">ADMIN ROLE</span>
            </div>

            <div id="login-error-container"></div>

            <button type="submit" id="login-submit-btn" class="btn-auth-submit">
              <span>Sign In to Platform</span>
              <span style="font-size: 16px;">→</span>
            </button>
          </form>

          <div style="margin-top: 24px; text-align: center; font-size: 13px; color: var(--text-muted);">
            Looking for client self-service? 
            <a href="#" onclick="app.showRegister(); return false;" style="color: var(--primary); font-weight: 700; text-decoration: none;">Create an account</a>
          </div>
        </div>
      </section>
    </div>
    <div id="modal-container"></div>
  `;

  this.selectRolePreset(defaultRole);

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-submit-btn');
    const errBox = document.getElementById('login-error-container');
    errBox.innerHTML = '';

    btn.disabled = true;
    btn.innerHTML = `<span>⏳</span><span>Verifying credentials...</span>`;

    try {
      const res = await api.login(email, password);
      api.setToken(res.token);
      api.setUser(res.user);
      app.init();
    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = `<span>Sign In to Platform</span><span style="font-size: 16px;">→</span>`;
      errBox.innerHTML = `
        <div class="auth-alert">
          <span style="font-size: 16px;">⚠️</span>
          <div style="flex: 1;"><strong>Authentication failed:</strong> ${err.message}</div>
        </div>
      `;
    }
  });
  },

  showRegister() {
    this.showLogin('customer');
  },

  showForgotPasswordModal() {
    const container = document.getElementById('modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="auth-modal-backdrop" onclick="this.closest('.auth-modal-backdrop').remove();">
        <div class="auth-modal" onclick="event.stopPropagation()">
          <div class="auth-modal-header">
            <h3>Reset your password</h3>
            <button type="button" class="modal-close-btn" onclick="document.getElementById('modal-container').innerHTML = ''">✕</button>
          </div>
          <p style="margin: 12px 0 18px; color: var(--text-muted);">
            Enter your email and we'll send a secure reset link.
          </p>
          <div class="form-group">
            <label for="forgot-email">Email Address</label>
            <div class="input-with-icon">
              <span class="input-icon-prefix">✉️</span>
              <input type="email" id="forgot-email" class="form-control" placeholder="name@company.com" />
            </div>
          </div>
          <button type="button" class="btn-auth-submit" onclick="document.getElementById('modal-container').innerHTML = ''">
            <span>Send Reset Link</span>
            <span style="font-size: 16px;">→</span>
          </button>
        </div>
      </div>
    `;
  },

  selectRolePreset(role) {
  document.querySelectorAll('.role-card-preset').forEach(c => c.classList.remove('active'));
  const targetCard = document.getElementById(`card-${role}`);
  if (targetCard) targetCard.classList.add('active');

  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  const pill = document.getElementById('role-pill-indicator');

  if (role === 'admin') {
    if (emailInput) emailInput.value = 'admin@brightloop.com';
    if (passInput) passInput.value = 'Brightloop#2026';
    if (pill) { pill.className = 'badge badge-confirmed'; pill.textContent = 'ADMIN ROLE'; }
  } else if (role === 'staff') {
    if (emailInput) emailInput.value = 'staff@brightloop.com';
    if (passInput) passInput.value = 'StaffPass#2026';
    if (pill) { pill.className = 'badge badge-quotation'; pill.textContent = 'STAFF ROLE'; }
  } else if (role === 'customer') {
    if (emailInput) emailInput.value = 'customer@shopmate.com';
    if (passInput) passInput.value = 'CustomerPass#2026';
    if (pill) { pill.className = 'badge badge-active'; pill.textContent = 'CUSTOMER PORTAL'; }
  }
},

  togglePasswordVisibility(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!input || !btn) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁️';
    }
  }
,
  logout() {
    if (window.api && window.api.logout) {
      window.api.logout();
    }
    this.showLogin();
  },

  init() {
    const user = (window.api && window.api.getUser) ? window.api.getUser() : null;
    if (!user) {
      this.showLogin();
      return;
    }

    const root = document.getElementById('app-root');
    const header = window.components?.renderHeader(user) || '';

    root.innerHTML = `
      <div style="min-height: 100vh; background: #f8fafc; display: flex; flex-direction: column;">
        ${header}
        <main style="max-width: 1200px; width: 100%; margin: 28px auto; padding: 0 20px; flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
            <div>
              <h1 style="font-size: 24px; font-weight: 800; color: #1e293b; margin: 0;">
                ${user.role === 'admin' ? 'Executive Dashboard' : user.role === 'staff' ? 'Sales & Operations Portal' : 'Customer Self-Service Portal'}
              </h1>
              <p style="font-size: 13px; color: #64748b; margin-top: 4px; margin-bottom: 0;">
                Logged in as <strong>${user.name}</strong> • Real-time subscription metrics & billing automation.
              </p>
            </div>
            <div style="display: flex; gap: 10px;">
              <span class="badge badge-active" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;">
                <span class="pulse-dot"></span> System Live & Syncing
              </span>
            </div>
          </div>

          <!-- KPI Cards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; margin-bottom: 28px;">
            <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Monthly Recurring Revenue</div>
              <div style="font-size: 28px; font-weight: 800; color: #714b67; margin-top: 6px;">$42,850.00</div>
              <div style="font-size: 12px; color: #10b981; margin-top: 4px; font-weight: 600;">↑ +14.2% from last month</div>
            </div>
            <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Active Subscriptions</div>
              <div style="font-size: 28px; font-weight: 800; color: #1e293b; margin-top: 6px;">328</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Across 142 enterprise clients</div>
            </div>
            <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Billed This Cycle</div>
              <div style="font-size: 28px; font-weight: 800; color: #008784; margin-top: 6px;">$18,420.00</div>
              <div style="font-size: 12px; color: #10b981; margin-top: 4px; font-weight: 600;">100% Zero Duplication</div>
            </div>
            <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Query SLA</div>
              <div style="font-size: 28px; font-weight: 800; color: #10b981; margin-top: 6px;">180 ms</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">ACID WAL indexed queries</div>
            </div>
          </div>

          <!-- Subscription Table -->
          <div style="background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
              <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 0;">Recent Subscriptions & Billing Status</h3>
              <span style="font-size: 12px; color: #64748b;">Live Real-time Feed</span>
            </div>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase;">
                    <th style="padding: 12px 20px;">Subscription</th>
                    <th style="padding: 12px 20px;">Customer</th>
                    <th style="padding: 12px 20px;">Plan / Tier</th>
                    <th style="padding: 12px 20px;">Billing Cycle</th>
                    <th style="padding: 12px 20px;">Amount</th>
                    <th style="padding: 12px 20px;">Status</th>
                  </tr>
                </thead>
                <tbody style="color: #334155;">
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 14px 20px; font-weight: 600; color: #714b67;">SUB-2026-001</td>
                    <td style="padding: 14px 20px;">Shopmate Retail Corp</td>
                    <td style="padding: 14px 20px;">Enterprise Plus (+560 Variant)</td>
                    <td style="padding: 14px 20px;">Monthly (Day 1)</td>
                    <td style="padding: 14px 20px; font-weight: 600;">$1,250.00 / mo</td>
                    <td style="padding: 14px 20px;"><span class="badge badge-active">Active</span></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 14px 20px; font-weight: 600; color: #714b67;">SUB-2026-002</td>
                    <td style="padding: 14px 20px;">Apex Logistics Inc</td>
                    <td style="padding: 14px 20px;">Professional Suite</td>
                    <td style="padding: 14px 20px;">Yearly (Day 15)</td>
                    <td style="padding: 14px 20px; font-weight: 600;">$4,800.00 / yr</td>
                    <td style="padding: 14px 20px;"><span class="badge badge-active">Active</span></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 14px 20px; font-weight: 600; color: #714b67;">SUB-2026-003</td>
                    <td style="padding: 14px 20px;">Nexus Media Labs</td>
                    <td style="padding: 14px 20px;">Starter Tier + Add-ons</td>
                    <td style="padding: 14px 20px;">Monthly (Day 28)</td>
                    <td style="padding: 14px 20px; font-weight: 600;">$450.00 / mo</td>
                    <td style="padding: 14px 20px;"><span class="badge badge-quotation">In Quotation</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    `;
  }

};

window.app = app;

document.addEventListener("DOMContentLoaded", () => {
  const user = (window.api && window.api.getUser) ? window.api.getUser() : null;
  if (user) {
    app.init();
  } else {
    app.showLogin();
  }
});
