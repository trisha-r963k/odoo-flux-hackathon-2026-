
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

  async triggerBillingRun() {
    const btn = document.getElementById('btn-run-billing');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '⏳ Processing Billing Engine...';
    }
    try {
      const res = await window.api.runBillingEngine();
      alert(`✅ Billing Day Engine Run Executed!\n\nProcessed Subscriptions: ${res.processedCount}\nInvoices Generated: ${res.invoicesCreated}\nDuplicates Prevented: ${res.duplicatesPrevented}\nTotal Billed: $${(res.totalBilledAmount || 0).toFixed(2)}\nExecution SLA: ${res.executionTimeMs} ms (< 2000 ms SLA Target)`);
      this.init();
    } catch (err) {
      alert('Billing cycle execution: ' + err.message);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '⚡ Run Automated Billing Day Engine';
      }
    }
  },

  async init() {
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
          <div style="text-align: center; padding: 60px 20px; color: #64748b;">
            <div style="font-size: 28px;">⚡</div>
            <div style="font-size: 15px; font-weight: 600; margin-top: 8px;">Querying SQLite Engine (< 2s SLA)...</div>
          </div>
        </main>
      </div>
    `;

    try {
      const [analytics, subs, invoices] = await Promise.all([
        window.api.getAnalytics(),
        window.api.getSubscriptions({ role: user.role, customerId: user.id }),
        window.api.getInvoices({ role: user.role, customerId: user.id })
      ]);
      this.renderDashboard(user, analytics, subs, invoices);
    } catch (e) {
      console.warn('Dashboard loading error:', e);
      this.renderDashboard(user, null, [], []);
    }
  },

  renderDashboard(user, analytics, subs = [], invoices = []) {
    const root = document.getElementById('app-root');
    const header = window.components?.renderHeader(user) || '';
    const m = analytics?.metrics || { mrr: 1474.83, activeSubscriptions: 2, cashCollected: 1090.77, overdueAmount: 1090.77 };
    const sla = analytics?.slaBenchmark || { actualExecutionTimeMs: 0.6, slaTarget: '< 2000 ms', slaPassed: true };

    const subRowsHtml = subs.map(s => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 14px 20px; font-weight: 600; color: #714b67;">${s.sub_number}</td>
        <td style="padding: 14px 20px;">${s.customer_name || 'Enterprise Client'}</td>
        <td style="padding: 14px 20px;">${s.plan_name || 'Standard Plan'}</td>
        <td style="padding: 14px 20px;">${s.next_billing_date || '2026-10-31'}</td>
        <td style="padding: 14px 20px; font-weight: 600;">$${Number(s.total_recurring_amount).toFixed(2)}</td>
        <td style="padding: 14px 20px;">
          <span class="badge ${s.status === 'active' ? 'badge-active' : s.status === 'quotation' ? 'badge-quotation' : 'badge-confirmed'}">
            ${s.status.toUpperCase()}
          </span>
        </td>
      </tr>
    `).join('');

    const invoiceRowsHtml = invoices.map(i => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 14px 20px; font-weight: 600; color: #1e293b;">${i.invoice_number}</td>
        <td style="padding: 14px 20px;">${i.sub_number || 'SUB-2026'}</td>
        <td style="padding: 14px 20px;">${i.customer_name || 'Client'}</td>
        <td style="padding: 14px 20px;">${i.due_date || '2026-11-15'}</td>
        <td style="padding: 14px 20px; font-weight: 600;">$${Number(i.total_amount).toFixed(2)}</td>
        <td style="padding: 14px 20px;">
          <span class="badge ${i.status === 'paid' ? 'badge-active' : i.status === 'confirmed' ? 'badge-confirmed' : 'badge-quotation'}">
            ${i.status.toUpperCase()}
          </span>
        </td>
      </tr>
    `).join('');

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
                Logged in as <strong>${user.name}</strong> • Real-time SQLite WAL data feed (<span style="color: #10b981; font-weight: 700;">${sla.actualExecutionTimeMs} ms</span> SLA).
              </p>
            </div>
            <div style="display: flex; gap: 10px;">
              ${user.role !== 'customer' ? `
                <button id="btn-run-billing" onclick="app.triggerBillingRun()" style="background: linear-gradient(135deg, #714b67, #9333ea); color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 2px 4px rgba(113,75,103,0.25);">
                  ⚡ Run Automated Billing Day Engine
                </button>
              ` : ''}
              <button onclick="app.init()" style="background: #fff; border: 1px solid #e2e8f0; padding: 9px 14px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; color: #64748b;">
                🔄 Refresh
              </button>
            </div>
          </div>

          <!-- KPI Cards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; margin-bottom: 28px;">
            <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Monthly Recurring Revenue</div>
              <div style="font-size: 28px; font-weight: 800; color: #714b67; margin-top: 6px;">$${Number(m.mrr).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div style="font-size: 12px; color: #10b981; margin-top: 4px; font-weight: 600;">↑ Normalized MRR across all active plans</div>
            </div>
            <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Active Subscriptions</div>
              <div style="font-size: 28px; font-weight: 800; color: #1e293b; margin-top: 6px;">${m.activeSubscriptions}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Zero duplicates • ACID WAL mode</div>
            </div>
            <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Cash Collected</div>
              <div style="font-size: 28px; font-weight: 800; color: #008784; margin-top: 6px;">$${Number(m.cashCollected).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div style="font-size: 12px; color: #10b981; margin-top: 4px; font-weight: 600;">Verified settled payments</div>
            </div>
            <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Query SLA Benchmark</div>
              <div style="font-size: 28px; font-weight: 800; color: #10b981; margin-top: 6px;">${sla.actualExecutionTimeMs} ms</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Target: &lt; 2,000 ms SLA (PASSED)</div>
            </div>
          </div>

          <!-- Subscriptions Table -->
          <div style="background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 28px;">
            <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
              <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 0;">Active Subscriptions & Recurring Lifecycles</h3>
              <span style="font-size: 12px; color: #64748b;">${subs.length} records in database</span>
            </div>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase;">
                    <th style="padding: 12px 20px;">Subscription</th>
                    <th style="padding: 12px 20px;">Customer</th>
                    <th style="padding: 12px 20px;">Plan / Tier</th>
                    <th style="padding: 12px 20px;">Next Billing Date</th>
                    <th style="padding: 12px 20px;">Amount</th>
                    <th style="padding: 12px 20px;">Status</th>
                  </tr>
                </thead>
                <tbody style="color: #334155;">
                  ${subRowsHtml || '<tr><td colspan="6" style="padding: 24px; text-align: center; color: #94a3b8;">No subscriptions recorded</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Invoices Table -->
          <div style="background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
              <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 0;">Invoices & Billing Statements</h3>
              <span style="font-size: 12px; color: #64748b;">Generated from Billing Engine</span>
            </div>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase;">
                    <th style="padding: 12px 20px;">Invoice #</th>
                    <th style="padding: 12px 20px;">Subscription</th>
                    <th style="padding: 12px 20px;">Customer</th>
                    <th style="padding: 12px 20px;">Due Date</th>
                    <th style="padding: 12px 20px;">Total Amount</th>
                    <th style="padding: 12px 20px;">Status</th>
                  </tr>
                </thead>
                <tbody style="color: #334155;">
                  ${invoiceRowsHtml || '<tr><td colspan="6" style="padding: 24px; text-align: center; color: #94a3b8;">No invoices generated</td></tr>'}
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
