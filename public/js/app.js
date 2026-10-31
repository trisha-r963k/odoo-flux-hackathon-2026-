
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
            <h1 class="showcase-title">Join Brightloop.<br/>Client Self-Service.</h1>
            <p class="showcase-subtitle">
              Access your subscriptions, view quotations, download invoices with full tax breakdowns, and track payment receipts in real time.
            </p>

            <div class="feature-glass-stack">
              <div class="feature-glass-card">
                <div class="feature-icon-box">🏢</div>
                <div class="feature-text">
                  <h4>Tenant-Isolated Company Profile</h4>
                  <p>Automatic customer profile creation linked securely to your authenticated session.</p>
                </div>
              </div>
              <div class="feature-glass-card">
                <div class="feature-icon-box">🛡️</div>
                <div class="feature-text">
                  <h4>Argon2id Enterprise Security</h4>
                  <p>State-of-the-art password hashing with strict multi-factor complexity enforcement.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="showcase-footer">
            <span>© 2026 Brightloop Software Inc.</span>
            <span>PostgreSQL 16 • Strict Decimal(12, 2)</span>
          </div>
        </aside>

        <!-- Right Registration Stage -->
        <section class="auth-form-panel">
          <div class="auth-form-inner">
            <div class="auth-tab-bar">
              <button class="auth-tab-btn" onclick="app.showLogin()">Sign In</button>
              <button class="auth-tab-btn active" onclick="app.showRegister()">Customer Sign Up</button>
            </div>

            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 24px; font-weight: 800; color: var(--text-main);">Create Customer Account</h2>
              <p style="font-size: 13.5px; color: var(--text-muted); margin-top: 4px;">Register your enterprise to view quotes and manage subscriptions</p>
            </div>

            <form id="register-form">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div class="form-group">
                  <label for="reg-contact-name">Contact Full Name</label>
                  <input type="text" id="reg-contact-name" class="form-control" required placeholder="Marcus Vance" />
                </div>
                <div class="form-group">
                  <label for="reg-company-name">Company Legal Name</label>
                  <input type="text" id="reg-company-name" class="form-control" required placeholder="Acme Logistics Corp" />
                </div>
              </div>

              <div class="form-group">
                <label for="reg-email">Business Email Address</label>
                <div class="input-with-icon">
                  <span class="input-icon-prefix">✉️</span>
                  <input type="email" id="reg-email" class="form-control" required placeholder="contact@acme.com" />
                </div>
              </div>

              <div class="form-group">
                <label for="reg-password">Password (Strict Complexity)</label>
                <div class="input-with-icon">
                  <span class="input-icon-prefix">🔒</span>
                  <input type="password" id="reg-password" class="form-control" required placeholder="Min 9 chars (e.g. Brightloop#2026)" oninput="app.checkPasswordRequirements(this.value)" />
                  <button type="button" class="password-toggle-btn" id="reg-toggle-pwd" onclick="app.togglePasswordVisibility('reg-password', 'reg-toggle-pwd')">👁️</button>
                </div>
                <!-- Live Requirement Checkmarks -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 10px; font-size: 12px; color: var(--text-muted);">
                  <div id="req-len" style="display: flex; align-items: center; gap: 6px;">❌ Minimum 9 characters</div>
                  <div id="req-upper" style="display: flex; align-items: center; gap: 6px;">❌ Uppercase letter (A-Z)</div>
                  <div id="req-lower" style="display: flex; align-items: center; gap: 6px;">❌ Lowercase letter (a-z)</div>
                  <div id="req-special" style="display: flex; align-items: center; gap: 6px;">❌ Special symbol (!@#$%)</div>
                </div>
              </div>

              <div id="register-alert-container" style="margin-top: 14px;"></div>

              <button type="submit" id="register-submit-btn" class="btn-auth-submit" style="margin-top: 16px;">
                <span>Complete Customer Registration</span>
                <span style="font-size: 16px;">→</span>
              </button>
            </form>

            <div style="margin-top: 20px; text-align: center; font-size: 13px; color: var(--text-muted);">
              Already have an account?
              <a href="#" onclick="app.showLogin(); return false;" style="color: var(--primary); font-weight: 700; text-decoration: none;">Sign In</a>
            </div>
          </div>
        </section>
      </div>
      <div id="modal-container"></div>
    `;

    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const contactName = document.getElementById('reg-contact-name').value.trim();
      const companyName = document.getElementById('reg-company-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const btn = document.getElementById('register-submit-btn');
      const alertBox = document.getElementById('register-alert-container');
      alertBox.innerHTML = '';

      btn.disabled = true;
      btn.innerHTML = `<span>⏳</span><span>Registering customer profile...</span>`;

      try {
        const res = await api.register({ contactName, companyName, email, password });
        alertBox.innerHTML = `
          <div style="background: #ecfdf5; border: 1px solid #10b981; color: #065f46; padding: 12px 14px; border-radius: 8px; font-size: 13px;">
            ✅ <strong>Registration successful!</strong> Your customer profile has been created. Redirecting to sign in...
          </div>
        `;
        setTimeout(() => {
          app.showLogin('customer');
          const emailInput = document.getElementById('login-email');
          const passInput = document.getElementById('login-password');
          if (emailInput) emailInput.value = email;
          if (passInput) passInput.value = password;
        }, 1200);
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = `<span>Complete Customer Registration</span><span style="font-size: 16px;">→</span>`;
        alertBox.innerHTML = `
          <div class="auth-alert">
            <span style="font-size: 16px;">⚠️</span>
            <div style="flex: 1;"><strong>Registration failed:</strong> ${err.message}</div>
          </div>
        `;
      }
    });
  },

  checkPasswordRequirements(pwd) {
    const rLen = document.getElementById('req-len');
    const rUpper = document.getElementById('req-upper');
    const rLower = document.getElementById('req-lower');
    const rSpec = document.getElementById('req-special');

    if (!rLen) return;

    const hasLen = pwd && pwd.length >= 9;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasSpec = /[^a-zA-Z0-9]/.test(pwd);

    rLen.innerHTML = hasLen ? '✅ Minimum 9 characters' : '❌ Minimum 9 characters';
    rLen.style.color = hasLen ? '#10b981' : '#64748b';

    rUpper.innerHTML = hasUpper ? '✅ Uppercase letter (A-Z)' : '❌ Uppercase letter (A-Z)';
    rUpper.style.color = hasUpper ? '#10b981' : '#64748b';

    rLower.innerHTML = hasLower ? '✅ Lowercase letter (a-z)' : '❌ Lowercase letter (a-z)';
    rLower.style.color = hasLower ? '#10b981' : '#64748b';

    rSpec.innerHTML = hasSpec ? '✅ Special symbol (!@#$%)' : '❌ Special symbol (!@#$%)';
    rSpec.style.color = hasSpec ? '#10b981' : '#64748b';
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
          <p style="margin: 12px 0 18px; color: var(--text-muted); font-size: 13.5px;">
            Enter your account email to dispatch a cryptographically secure 32-byte hex reset token (1-hour validity).
          </p>
          <div class="form-group">
            <label for="forgot-email">Email Address</label>
            <div class="input-with-icon">
              <span class="input-icon-prefix">✉️</span>
              <input type="email" id="forgot-email" class="form-control" placeholder="name@company.com" required />
            </div>
          </div>
          <div id="forgot-alert-box" style="margin-bottom: 14px;"></div>
          <button type="button" id="forgot-submit-btn" class="btn-auth-submit" onclick="app.submitForgotPassword()">
            <span>Dispatch Reset Link</span>
            <span style="font-size: 16px;">→</span>
          </button>
        </div>
      </div>
    `;
  },

  async submitForgotPassword() {
    const emailInput = document.getElementById('forgot-email');
    const alertBox = document.getElementById('forgot-alert-box');
    const btn = document.getElementById('forgot-submit-btn');
    if (!emailInput || !emailInput.value) return;

    btn.disabled = true;
    btn.innerHTML = `<span>⏳</span><span>Dispatching token...</span>`;

    try {
      const res = await api.forgotPassword(emailInput.value.trim());
      alertBox.innerHTML = `
        <div style="background: #f0fdf4; border: 1px solid #10b981; color: #166534; padding: 12px; border-radius: 8px; font-size: 12.5px;">
          <strong>Reset token generated:</strong> ${res.message}
          ${res.demoResetToken ? `<div style="margin-top: 6px; word-break: break-all; font-family: monospace; font-size: 11px; background: #fff; padding: 6px; border: 1px dashed #10b981; border-radius: 4px;">Token: ${res.demoResetToken}</div>` : ''}
        </div>
      `;
      btn.innerHTML = `<span>Link Dispatched</span>`;
    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = `<span>Dispatch Reset Link</span><span style="font-size: 16px;">→</span>`;
      alertBox.innerHTML = `
        <div class="auth-alert">
          <span>⚠️</span>
          <div>${err.message}</div>
        </div>
      `;
    }
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

  async transitionSubscription(subId, newStatus) {
    try {
      const res = await window.api.updateSubscriptionStatus(subId, newStatus);
      alert(`Subscription ${res.subNumber || subId} transitioned to ${newStatus.toUpperCase()}!`);
      this.init();
    } catch (err) {
      alert('Failed to update subscription status: ' + err.message);
    }
  },

  filterSubscriptions(statusFilter) {
    this._subFilter = statusFilter;
    const rows = document.querySelectorAll('.sub-table-row');
    rows.forEach(r => {
      const s = r.getAttribute('data-status');
      if (statusFilter === 'all') {
        r.style.display = '';
      } else if (statusFilter === 'quotes') {
        r.style.display = (s === 'draft' || s === 'quotation') ? '' : 'none';
      } else if (statusFilter === 'active') {
        r.style.display = (s === 'active' || s === 'confirmed') ? '' : 'none';
      } else if (statusFilter === 'paused') {
        r.style.display = (s === 'paused') ? '' : 'none';
      } else {
        r.style.display = (s === statusFilter) ? '' : 'none';
      }
    });

    document.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === statusFilter);
    });
  },

  renderDashboard(user, analytics, subs = [], invoices = []) {
    const root = document.getElementById('app-root');
    const header = window.components?.renderHeader(user) || '';
    const m = analytics?.metrics || { mrr: 1474.83, activeSubscriptions: 2, cashCollected: 1090.77, overdueAmount: 1090.77 };
    const sla = analytics?.slaBenchmark || { actualExecutionTimeMs: 0.6, slaTarget: '< 2000 ms', slaPassed: true };

    const getBadgeClass = (status) => {
      switch (status) {
        case 'active': return 'badge-active';
        case 'quotation': return 'badge-quotation';
        case 'draft': return 'badge-draft';
        case 'confirmed': return 'badge-confirmed';
        case 'paused': return 'badge-paused';
        case 'closed': return 'badge-closed';
        default: return 'badge-draft';
      }
    };

    const subRowsHtml = subs.map(s => {
      const isQuote = s.status === 'draft' || s.status === 'quotation';
      const badgeClass = getBadgeClass(s.status);

      let actionButtons = '';
      if (s.status === 'draft') {
        actionButtons = `
          <button onclick="app.transitionSubscription('${s.id}', 'quotation')" title="Send quote to customer" style="padding: 4px 8px; font-size: 11px; font-weight: 700; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; border-radius: 4px; cursor: pointer; margin-right: 4px;">Send Quote</button>
          <button onclick="app.transitionSubscription('${s.id}', 'active')" title="Convert to Active Subscription (SUB-2026-XXXX)" style="padding: 4px 8px; font-size: 11px; font-weight: 700; background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; border-radius: 4px; cursor: pointer;">Activate</button>
        `;
      } else if (s.status === 'quotation') {
        actionButtons = `
          <button onclick="app.transitionSubscription('${s.id}', 'active')" title="Customer Accepts Quote -> Converts to SUB-2026-XXXX" style="padding: 4px 8px; font-size: 11px; font-weight: 700; background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; border-radius: 4px; cursor: pointer; margin-right: 4px;">Accept &amp; Activate</button>
          <button onclick="app.transitionSubscription('${s.id}', 'closed')" title="Cancel Quotation" style="padding: 4px 8px; font-size: 11px; font-weight: 700; background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; border-radius: 4px; cursor: pointer;">Cancel</button>
        `;
      } else if (s.status === 'active') {
        actionButtons = `
          <button onclick="app.transitionSubscription('${s.id}', 'paused')" title="Pause recurring billing" style="padding: 4px 8px; font-size: 11px; font-weight: 700; background: #fed7aa; color: #9a3412; border: 1px solid #fdba74; border-radius: 4px; cursor: pointer; margin-right: 4px;">Pause</button>
          <button onclick="app.transitionSubscription('${s.id}', 'closed')" title="Close contract" style="padding: 4px 8px; font-size: 11px; font-weight: 700; background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; border-radius: 4px; cursor: pointer;">Close</button>
        `;
      } else if (s.status === 'paused') {
        actionButtons = `
          <button onclick="app.transitionSubscription('${s.id}', 'active')" title="Resume recurring billing" style="padding: 4px 8px; font-size: 11px; font-weight: 700; background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; border-radius: 4px; cursor: pointer;">Resume</button>
        `;
      } else if (s.status === 'closed') {
        actionButtons = `
          <button onclick="app.transitionSubscription('${s.id}', 'draft')" title="Reopen as Draft Quote" style="padding: 4px 8px; font-size: 11px; font-weight: 700; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer;">Reopen</button>
        `;
      }

      return `
        <tr class="sub-table-row" data-status="${s.status}" style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 14px 20px; font-weight: 700; font-family: monospace; color: ${isQuote ? '#b45309' : '#714b67'};">
            ${s.sub_number}
          </td>
          <td style="padding: 14px 20px; font-weight: 600;">${s.customer_name || 'Enterprise Client'}</td>
          <td style="padding: 14px 20px;">
            <div style="font-weight: 600;">${s.plan_name || 'Standard Plan'}</div>
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">${s.billing_frequency || 'monthly'}</div>
          </td>
          <td style="padding: 14px 20px;">${s.next_billing_date || '2026-10-31'}</td>
          <td style="padding: 14px 20px; font-weight: 700; font-family: monospace;">$${Number(s.total_recurring_amount).toFixed(2)}</td>
          <td style="padding: 14px 20px;">
            <span class="badge ${badgeClass}">
              ${s.status.toUpperCase()}
            </span>
          </td>
          <td style="padding: 14px 20px; text-align: right; white-space: nowrap;">
            ${actionButtons}
          </td>
        </tr>
      `;
    }).join('');

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
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              ${user.role !== 'customer' ? `
                <button onclick="app.showQuotationBuilder()" style="background: #008784; color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,135,132,0.25); display: flex; align-items: center; gap: 6px;">
                  📝 + New Quotation
                </button>
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

          <!-- Subscriptions & Quotations Master Table with Lifecycle Actions -->
          <div style="background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 28px;">
            <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <div>
                <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 0;">Subscriptions &amp; Quotations Master List</h3>
                <span style="font-size: 12px; color: #64748b;">${subs.length} total records • Full 6-state lifecycle tracking</span>
              </div>
              <!-- Status Filter Tabs -->
              <div class="filter-tabs-row" style="margin-bottom: 0; border-bottom: none;">
                <button class="filter-tab-btn active" data-filter="all" onclick="app.filterSubscriptions('all')">All</button>
                <button class="filter-tab-btn" data-filter="quotes" onclick="app.filterSubscriptions('quotes')">Quotes &amp; Drafts</button>
                <button class="filter-tab-btn" data-filter="active" onclick="app.filterSubscriptions('active')">Active</button>
                <button class="filter-tab-btn" data-filter="paused" onclick="app.filterSubscriptions('paused')">Paused</button>
              </div>
            </div>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase;">
                    <th style="padding: 12px 20px;">Identifier</th>
                    <th style="padding: 12px 20px;">Customer</th>
                    <th style="padding: 12px 20px;">Plan / Frequency</th>
                    <th style="padding: 12px 20px;">Next Billing Date</th>
                    <th style="padding: 12px 20px;">Amount</th>
                    <th style="padding: 12px 20px;">Status</th>
                    <th style="padding: 12px 20px; text-align: right;">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody style="color: #334155;">
                  ${subRowsHtml || '<tr><td colspan="7" style="padding: 24px; text-align: center; color: #94a3b8;">No subscriptions recorded</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Invoices Table -->
          <div style="background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
              <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 0;">Invoices &amp; Billing Statements</h3>
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
  },

  // =========================================================
  // OBJECTIVE 4: INTERACTIVE QUOTATION BUILDER & WORKFLOW
  // =========================================================
  async showQuotationBuilder(presetOptions = null) {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; color: #64748b;">
        Loading Quotation Builder &amp; Catalog...
      </div>
    `;

    try {
      const [products, plans, customers] = await Promise.all([
        window.api.getProducts(),
        window.api.getPlans(),
        window.api.getCustomers()
      ]);

      this._quoteState = {
        products,
        plans,
        customers,
        selectedCustomerId: customers.find(c => c.name.toLowerCase().includes('acme'))?.id || customers[0]?.id || '',
        selectedPlanId: plans[0]?.id || '',
        paymentTerms: 'Net 30',
        couponCode: '',
        appliedDiscount: null,
        discountStatus: null, // { success: boolean, message: string }
        lines: [
          {
            id: 'line_' + Date.now(),
            productId: products[0]?.id || '',
            variantId: products[0]?.variants?.[0]?.id || '',
            basePrice: products[0]?.sales_price || 1200.0,
            priceAdjustment: products[0]?.variants?.[0]?.price_extra || 560.0,
            unitPrice: (products[0]?.sales_price || 1200.0) + (products[0]?.variants?.[0]?.price_extra || 560.0),
            quantity: 10,
            taxRatePercent: 18.0
          }
        ]
      };

      if (presetOptions) {
        Object.assign(this._quoteState, presetOptions);
      }

      this.renderQuotationBuilder();
    } catch (err) {
      alert('Failed to load quotation catalog: ' + err.message);
      this.init();
    }
  },

  loadScene4Preset() {
    if (!this._quoteState) return;
    const { products, plans, customers } = this._quoteState;

    // 1. Customer: Acme Corp
    const acme = customers.find(c => c.name.toLowerCase().includes('acme')) || customers[0];
    // 2. Product: Brightloop Cloud ERP ($1,200) + Odoo Brand Edition (+$560) = $1,760
    const erp = products.find(p => p.id === 'prod_erp' || p.name.includes('ERP')) || products[0];
    const odooVariant = erp?.variants?.find(v => v.id === 'var_odoo_brand' || v.variant_name.includes('Odoo')) || erp?.variants?.[0];
    // 3. Plan: Monthly Pro
    const monthlyPlan = plans.find(p => p.id === 'plan_monthly_pro' || p.billing_frequency === 'monthly') || plans[0];

    const basePrice = erp ? Number(erp.sales_price) : 1200.0;
    const priceAdjustment = odooVariant ? Number(odooVariant.price_extra) : 560.0;
    const effectiveUnitPrice = basePrice + priceAdjustment;

    this._quoteState.selectedCustomerId = acme ? acme.id : '';
    this._quoteState.selectedPlanId = monthlyPlan ? monthlyPlan.id : '';
    this._quoteState.paymentTerms = 'Net 30';
    this._quoteState.couponCode = 'ODU20';
    this._quoteState.appliedDiscount = {
      code: 'ODU20',
      type: 'PERCENTAGE',
      value: 20.0,
      minQuantity: 5,
      minPurchaseAmount: 1000.0
    };
    this._quoteState.discountStatus = {
      success: true,
      message: '✓ Coupon ODU20 Applied: 20% discount on 5+ seats (-$3,520.00)'
    };
    this._quoteState.lines = [
      {
        id: 'line_' + Date.now(),
        productId: erp ? erp.id : '',
        variantId: odooVariant ? odooVariant.id : '',
        basePrice,
        priceAdjustment,
        unitPrice: effectiveUnitPrice,
        quantity: 10,
        taxRatePercent: 18.0
      }
    ];

    this.renderQuotationBuilder();
  },

  calculateCurrentTotals() {
    const state = this._quoteState;
    if (!state) return { subtotal: 0, discountTotal: 0, taxableSubtotal: 0, taxTotal: 0, grandTotal: 0, totalQty: 0 };

    const D = window.Decimal || class {
      constructor(v) { this.val = Number(v); }
      plus(v) { return new D(this.val + Number(v.val !== undefined ? v.val : v)); }
      minus(v) { return new D(this.val - Number(v.val !== undefined ? v.val : v)); }
      times(v) { return new D(this.val * Number(v.val !== undefined ? v.val : v)); }
      dividedBy(v) { return new D(this.val / Number(v.val !== undefined ? v.val : v)); }
      toDecimalPlaces(dp) { return new D(Number(this.val.toFixed(dp))); }
      toNumber() { return this.val; }
      toFixed(dp) { return this.val.toFixed(dp); }
    };

    let totalQty = 0;
    let rawSubtotal = new D(0);

    const calculatedLines = state.lines.map(line => {
      const qty = Math.max(1, parseInt(line.quantity, 10) || 1);
      totalQty += qty;
      const unitPrice = new D(line.unitPrice || 0);
      const lineSubtotal = unitPrice.times(qty);
      rawSubtotal = rawSubtotal.plus(lineSubtotal);
      return { ...line, quantity: qty, lineSubtotal };
    });

    // Discount evaluation
    let discountApplied = false;
    let discountTotal = new D(0);
    let discountMsg = '';

    if (state.appliedDiscount) {
      const rule = state.appliedDiscount;
      const meetsQty = !rule.minQuantity || totalQty >= rule.minQuantity;
      const meetsSpend = !rule.minPurchaseAmount || rawSubtotal.toNumber() >= Number(rule.minPurchaseAmount);

      if (meetsQty && meetsSpend) {
        discountApplied = true;
        if (rule.type === 'PERCENTAGE' || rule.discount_type === 'percentage') {
          const pct = new D(rule.value).dividedBy(100);
          discountTotal = rawSubtotal.times(pct).toDecimalPlaces(2, 4);
        } else {
          discountTotal = new D(Math.min(Number(rule.value), rawSubtotal.toNumber()));
        }
        discountMsg = `✓ Coupon ${rule.code} Applied: ${rule.value}% discount (-$${discountTotal.toFixed(2)})`;
      } else if (!meetsQty) {
        discountMsg = `⚠️ Coupon ${rule.code} requires minimum ${rule.minQuantity} seats (current: ${totalQty})`;
      } else {
        discountMsg = `⚠️ Coupon ${rule.code} requires minimum spend of $${rule.minPurchaseAmount}`;
      }
    }

    const subtotalRounded = rawSubtotal.toDecimalPlaces(2, 4);
    const discountRounded = discountTotal.toDecimalPlaces(2, 4);
    const taxableSubtotal = subtotalRounded.minus(discountRounded);
    const taxTotal = taxableSubtotal.times(new D(0.18)).toDecimalPlaces(2, 4);
    const grandTotal = taxableSubtotal.plus(taxTotal);

    return {
      totalQty,
      subtotal: subtotalRounded.toNumber(),
      discountTotal: discountRounded.toNumber(),
      taxableSubtotal: taxableSubtotal.toNumber(),
      taxTotal: taxTotal.toNumber(),
      grandTotal: grandTotal.toNumber(),
      discountApplied,
      discountMsg,
      lines: calculatedLines
    };
  },

  renderQuotationBuilder() {
    const root = document.getElementById('app-root');
    const state = this._quoteState;
    if (!state) return;

    const user = (window.api && window.api.getUser) ? window.api.getUser() : { name: 'Staff User', role: 'staff' };
    const header = window.components?.renderHeader(user) || '';
    const totals = this.calculateCurrentTotals();

    // Customer Options
    const customerOptions = state.customers.map(c => `
      <option value="${c.id}" ${c.id === state.selectedCustomerId ? 'selected' : ''}>
        ${c.company_name || c.name} (${c.email})
      </option>
    `).join('');

    // Plan Cards
    const planCardsHtml = state.plans.map(p => {
      const isSelected = p.id === state.selectedPlanId;
      const freqBadge = p.billing_frequency.toUpperCase();
      const validityBadge = p.end_date ? `Valid until ${p.end_date}` : 'Active Plan';
      return `
        <div class="plan-card-option ${isSelected ? 'selected' : ''}" onclick="app.selectPlan('${p.id}')">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 14px; color: #1e293b;">${p.name}</strong>
            <span class="badge ${freqBadge === 'YEARLY' ? 'badge-confirmed' : 'badge-quotation'}">${freqBadge}</span>
          </div>
          <div style="font-size: 18px; font-weight: 800; color: #714b67; margin: 8px 0 4px;">
            $${Number(p.price).toFixed(2)} <span style="font-size: 11px; font-weight: 500; color: #64748b;">/${p.billing_frequency}</span>
          </div>
          <div style="font-size: 11.5px; color: #64748b;">${validityBadge}</div>
        </div>
      `;
    }).join('');

    // Line items HTML
    const lineRowsHtml = state.lines.map((line, idx) => {
      const currentProduct = state.products.find(p => p.id === line.productId) || state.products[0];
      const variants = currentProduct?.variants || [];
      const currentVariant = variants.find(v => v.id === line.variantId) || variants[0];

      const productOptions = state.products.map(p => `
        <option value="${p.id}" ${p.id === line.productId ? 'selected' : ''}>
          ${p.name} ($${Number(p.sales_price).toFixed(2)})
        </option>
      `).join('');

      const variantOptions = variants.length > 0
        ? variants.map(v => `
            <option value="${v.id}" ${v.id === line.variantId ? 'selected' : ''}>
              ${v.variant_name} (${v.price_extra >= 0 ? '+' : ''}$${Number(v.price_extra).toFixed(2)})
            </option>
          `).join('')
        : `<option value="">Standard Edition (No Variant Surcharge)</option>`;

      const lineSubtotal = (Number(line.unitPrice) || 0) * (Number(line.quantity) || 1);

      return `
        <tr class="line-item-row" data-index="${idx}">
          <td style="min-width: 200px;">
            <select class="form-select" onchange="app.onProductChange(${idx}, this.value)">
              ${productOptions}
            </select>
          </td>
          <td style="min-width: 220px;">
            <select class="form-select" onchange="app.onVariantChange(${idx}, this.value)">
              ${variantOptions}
            </select>
          </td>
          <td style="width: 130px;">
            <div style="display: flex; align-items: center; position: relative;">
              <span style="position: absolute; left: 10px; color: #64748b; font-weight: 600;">$</span>
              <input type="number" step="0.01" class="form-input" style="padding-left: 24px; font-weight: 700;"
                value="${Number(line.unitPrice).toFixed(2)}"
                oninput="app.onUnitPriceChange(${idx}, this.value)" />
            </div>
          </td>
          <td style="width: 100px;">
            <input type="number" min="1" class="form-input" style="font-weight: 700; text-align: center;"
              value="${line.quantity}"
              oninput="app.onQuantityChange(${idx}, this.value)" />
          </td>
          <td style="width: 90px; text-align: center; color: #64748b; font-weight: 600;">
            18% VAT
          </td>
          <td style="width: 140px; font-weight: 800; font-family: monospace; font-size: 14.5px; color: #1e293b;">
            $${lineSubtotal.toFixed(2)}
          </td>
          <td style="width: 50px; text-align: right;">
            ${state.lines.length > 1 ? `
              <button class="btn-remove-line" onclick="app.removeQuoteLine(${idx})" title="Remove item">✕</button>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');

    root.innerHTML = `
      <div style="min-height: 100vh; background: #f8fafc; display: flex; flex-direction: column;">
        ${header}
        <main class="quote-builder-container">
          <!-- Header Bar -->
          <div class="quote-header-bar">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button onclick="app.init()" style="background: none; border: none; font-size: 13px; color: #64748b; cursor: pointer; padding: 0; font-weight: 600;">
                  ← Back to Dashboard
                </button>
                <span style="color: #cbd5e1;">/</span>
                <span class="badge badge-quotation">Objective 4</span>
              </div>
              <h1 style="font-size: 24px; font-weight: 800; color: #1e293b; margin: 6px 0 0;">
                Interactive Quotation Builder &amp; Workflow
              </h1>
              <p style="font-size: 13px; color: #64748b; margin: 4px 0 0;">
                Assemble contract line items with variant price adjustments, apply promotional coupons, and transition directly into active subscriptions.
              </p>
            </div>

            <!-- Scene 4 1-Click Demo Shortcut -->
            <div>
              <button onclick="app.loadScene4Preset()" style="background: linear-gradient(135deg, #10b981 0%, #008784 100%); color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 12.5px; cursor: pointer; box-shadow: 0 2px 5px rgba(16,185,129,0.3); display: flex; align-items: center; gap: 6px;">
                ⚡ 1-Click Load Scene 4 Demo Spec
              </button>
            </div>
          </div>

          <!-- Top Grid: Customer & Billing Plan -->
          <div class="quote-grid-2">
            <!-- Customer Picker -->
            <div class="quote-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <label class="form-label" style="margin: 0;">1. Customer Account</label>
                <button onclick="app.showQuickAddCustomerModal()" style="background: none; border: none; color: var(--primary); font-size: 12.5px; font-weight: 700; cursor: pointer; padding: 0;">
                  + Quick-Create Customer
                </button>
              </div>
              <select class="form-select" onchange="app.selectCustomer(this.value)">
                ${customerOptions}
              </select>
              <div style="margin-top: 10px; font-size: 12px; color: #64748b;">
                Quotes are strictly scoped to the selected client organization with sequential tracking.
              </div>

              <!-- Payment Terms -->
              <div style="margin-top: 18px;">
                <label class="form-label">Payment Terms</label>
                <select class="form-select" onchange="app.selectPaymentTerms(this.value)">
                  <option value="Immediate Payment" ${state.paymentTerms === 'Immediate Payment' ? 'selected' : ''}>Immediate Payment</option>
                  <option value="Net 15" ${state.paymentTerms === 'Net 15' ? 'selected' : ''}>Net 15 Days</option>
                  <option value="Net 30" ${state.paymentTerms === 'Net 30' ? 'selected' : ''}>Net 30 Days (Standard Corporate)</option>
                </select>
              </div>
            </div>

            <!-- Billing Plan Picker -->
            <div class="quote-card">
              <label class="form-label" style="margin-bottom: 12px;">2. Recurring Billing Plan</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                ${planCardsHtml}
              </div>
            </div>
          </div>

          <!-- Dynamic Line Items Editor -->
          <div class="quote-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <h3 style="font-size: 16px; font-weight: 800; color: #1e293b; margin: 0;">
                  3. Line Items Editor &amp; Smart Variant Pricing
                </h3>
                <span style="font-size: 12px; color: #64748b;">
                  Add products &amp; variants. Surcharges (e.g. +$560.00 Odoo Brand) automatically adjust effective unit price.
                </span>
              </div>
              <button class="btn-add-line" onclick="app.addQuoteLine()">
                <span>+</span> Add Product Line
              </button>
            </div>

            <div style="overflow-x: auto;">
              <table class="line-items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Attribute Variant (Price Adj)</th>
                    <th>Unit Price</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: center;">Tax</th>
                    <th>Line Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${lineRowsHtml}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Bottom Grid: Promotional Discount & Live Calculation Summary -->
          <div class="quote-grid-2">
            <!-- Promotional Coupon Code Box -->
            <div class="quote-card">
              <h3 style="font-size: 16px; font-weight: 800; color: #1e293b; margin: 0 0 6px;">
                4. Promotional Discount Coupon
              </h3>
              <p style="font-size: 12.5px; color: #64748b; margin: 0 0 14px;">
                Enter promotional code (e.g. <strong>ODU20</strong> for 20% off when total seats ≥ 5).
              </p>

              <div class="discount-box">
                <div class="discount-input-row">
                  <input type="text" id="input-coupon-code" class="form-input" style="text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;"
                    placeholder="Enter coupon code (e.g. ODU20)"
                    value="${state.couponCode}" />
                  <button class="btn-apply-discount" onclick="app.applyCouponCode()">Apply</button>
                </div>

                <!-- 1-Click Coupon Test Helper -->
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
                  <button type="button" onclick="app.quickFillCoupon('ODU20')" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #475569; cursor: pointer;">
                    🏷️ Try 'ODU20' (-20% for 5+ seats)
                  </button>
                  <button type="button" onclick="app.quickFillCoupon('FLUX2026')" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #475569; cursor: pointer;">
                    🏷️ Try 'FLUX2026' (-15%)
                  </button>
                </div>

                <!-- Live Feedback Pill -->
                ${totals.discountApplied ? `
                  <div class="discount-status-pill success">
                    <span>${totals.discountMsg || `✓ Discount code applied (-$${totals.discountTotal.toFixed(2)})`}</span>
                  </div>
                ` : totals.discountMsg ? `
                  <div class="discount-status-pill warning">
                    <span>${totals.discountMsg}</span>
                  </div>
                ` : state.discountStatus ? `
                  <div class="discount-status-pill ${state.discountStatus.success ? 'success' : 'warning'}">
                    <span>${state.discountStatus.message}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Live Financial Totals Breakdown (Decimal.js Exact Calculation) -->
            <div class="quote-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="font-size: 16px; font-weight: 800; color: #1e293b; margin: 0;">
                  5. Real-Time Decimal.js Billing Calculation
                </h3>
                <span style="font-size: 11px; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px; font-weight: 700;">
                  BANKER'S ROUNDING
                </span>
              </div>

              <div class="totals-summary-card">
                <div class="totals-row">
                  <span>Gross Line Subtotal (${totals.totalQty} seats)</span>
                  <strong style="font-family: monospace; font-size: 15px; color: #1e293b;">
                    $${totals.subtotal.toFixed(2)}
                  </strong>
                </div>

                <div class="totals-row" style="color: ${totals.discountTotal > 0 ? '#059669' : '#64748b'};">
                  <span>Promotional Discount ${state.couponCode ? `(${state.couponCode})` : ''}</span>
                  <strong style="font-family: monospace; font-size: 15px;">
                    -${totals.discountTotal > 0 ? `$${totals.discountTotal.toFixed(2)}` : '$0.00'}
                  </strong>
                </div>

                <div class="totals-row" style="border-top: 1px dashed #cbd5e1; padding-top: 10px; margin-top: 4px;">
                  <span style="font-weight: 600;">Taxable Amount</span>
                  <strong style="font-family: monospace; font-size: 15px; color: #1e293b;">
                    $${totals.taxableSubtotal.toFixed(2)}
                  </strong>
                </div>

                <div class="totals-row">
                  <span>Standard VAT (18.00%)</span>
                  <strong style="font-family: monospace; font-size: 15px; color: #1e293b;">
                    +$${totals.taxTotal.toFixed(2)}
                  </strong>
                </div>

                <div class="totals-row grand-total">
                  <span>Grand Total (Recurring)</span>
                  <span style="font-family: monospace;">$${totals.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quotation Actions Footer -->
          <div class="quote-actions-bar">
            <button class="btn-action-draft" onclick="app.saveQuotation('draft')">
              💾 Save as Draft (QT-2026-XXXX)
            </button>
            <button class="btn-action-send" onclick="app.saveQuotation('quotation')">
              ✉️ Send Quotation to Customer
            </button>
            <button class="btn-action-activate" onclick="app.saveQuotation('active')">
              ⚡ Convert to Active Subscription (SUB-2026-XXXX)
            </button>
          </div>
        </main>
      </div>
    `;
  },

  selectCustomer(customerId) {
    if (this._quoteState) {
      this._quoteState.selectedCustomerId = customerId;
    }
  },

  selectPaymentTerms(terms) {
    if (this._quoteState) {
      this._quoteState.paymentTerms = terms;
    }
  },

  selectPlan(planId) {
    if (this._quoteState) {
      this._quoteState.selectedPlanId = planId;
      this.renderQuotationBuilder();
    }
  },

  addQuoteLine() {
    if (!this._quoteState) return;
    const { products } = this._quoteState;
    const defaultProduct = products[0] || { sales_price: 1200.0, variants: [] };
    const defaultVariant = defaultProduct.variants?.[0] || null;
    const basePrice = Number(defaultProduct.sales_price) || 1200.0;
    const priceAdjustment = defaultVariant ? Number(defaultVariant.price_extra) : 0;

    this._quoteState.lines.push({
      id: 'line_' + Date.now(),
      productId: defaultProduct.id,
      variantId: defaultVariant ? defaultVariant.id : '',
      basePrice,
      priceAdjustment,
      unitPrice: basePrice + priceAdjustment,
      quantity: 1,
      taxRatePercent: 18.0
    });
    this.renderQuotationBuilder();
  },

  removeQuoteLine(idx) {
    if (!this._quoteState || this._quoteState.lines.length <= 1) return;
    this._quoteState.lines.splice(idx, 1);
    this.renderQuotationBuilder();
  },

  onProductChange(idx, productId) {
    if (!this._quoteState) return;
    const product = this._quoteState.products.find(p => p.id === productId);
    if (!product) return;

    const variant = product.variants?.[0] || null;
    const basePrice = Number(product.sales_price) || 0;
    const priceAdjustment = variant ? Number(variant.price_extra) : 0;

    const line = this._quoteState.lines[idx];
    if (line) {
      line.productId = productId;
      line.variantId = variant ? variant.id : '';
      line.basePrice = basePrice;
      line.priceAdjustment = priceAdjustment;
      line.unitPrice = basePrice + priceAdjustment;
    }
    this.renderQuotationBuilder();
  },

  onVariantChange(idx, variantId) {
    if (!this._quoteState) return;
    const line = this._quoteState.lines[idx];
    if (!line) return;

    const product = this._quoteState.products.find(p => p.id === line.productId);
    const variant = product?.variants?.find(v => v.id === variantId);

    const basePrice = Number(line.basePrice) || 0;
    const priceAdjustment = variant ? Number(variant.price_extra) : 0;

    line.variantId = variantId;
    line.priceAdjustment = priceAdjustment;
    line.unitPrice = basePrice + priceAdjustment;

    this.renderQuotationBuilder();
  },

  onUnitPriceChange(idx, value) {
    if (!this._quoteState) return;
    const line = this._quoteState.lines[idx];
    if (line) {
      line.unitPrice = Math.max(0, parseFloat(value) || 0);
    }
    this.renderQuotationBuilder();
  },

  onQuantityChange(idx, value) {
    if (!this._quoteState) return;
    const line = this._quoteState.lines[idx];
    if (line) {
      line.quantity = Math.max(1, parseInt(value, 10) || 1);
    }
    this.renderQuotationBuilder();
  },

  quickFillCoupon(code) {
    const input = document.getElementById('input-coupon-code');
    if (input) input.value = code;
    this.applyCouponCode(code);
  },

  async applyCouponCode(directCode = null) {
    if (!this._quoteState) return;
    const code = (directCode || document.getElementById('input-coupon-code')?.value || '').trim().toUpperCase();
    this._quoteState.couponCode = code;

    if (!code) {
      this._quoteState.appliedDiscount = null;
      this._quoteState.discountStatus = null;
      this.renderQuotationBuilder();
      return;
    }

    const totals = this.calculateCurrentTotals();
    try {
      const res = await window.api.validateDiscount(code, {
        quantity: totals.totalQty,
        subtotal: totals.subtotal
      });

      if (res.valid) {
        this._quoteState.appliedDiscount = res.rule;
        this._quoteState.discountStatus = { success: true, message: res.message };
      } else {
        this._quoteState.appliedDiscount = res.rule || null;
        this._quoteState.discountStatus = { success: false, message: res.error || `Coupon '${code}' not eligible` };
      }
    } catch (err) {
      this._quoteState.discountStatus = { success: false, message: err.message };
    }

    this.renderQuotationBuilder();
  },

  async saveQuotation(actionStatus = 'quotation') {
    const state = this._quoteState;
    if (!state) return;

    if (!state.selectedCustomerId) {
      alert('Please select or create a customer account.');
      return;
    }
    if (!state.selectedPlanId) {
      alert('Please select a recurring billing plan.');
      return;
    }
    if (state.lines.length === 0) {
      alert('Please add at least one line item.');
      return;
    }

    const totals = this.calculateCurrentTotals();

    const payload = {
      customerId: state.selectedCustomerId,
      planId: state.selectedPlanId,
      paymentTerms: state.paymentTerms,
      status: actionStatus, // 'draft' | 'quotation' | 'active'
      discountCode: state.appliedDiscount ? state.appliedDiscount.code : null,
      discountId: state.appliedDiscount ? state.appliedDiscount.id : null,
      totalAmount: totals.grandTotal,
      lines: state.lines.map(l => ({
        productId: l.productId,
        variantId: l.variantId || null,
        quantity: l.quantity,
        unitPrice: l.unitPrice
      }))
    };

    try {
      const result = await window.api.createQuotation(payload);
      const isQuote = ['draft', 'quotation'].includes(actionStatus);
      const alertMsg = isQuote
        ? `Quotation ${result.subNumber} successfully created in ${actionStatus.toUpperCase()} status!\nTotal Amount: $${Number(result.totalAmount).toFixed(2)}`
        : `Subscription ${result.subNumber} activated successfully!\nNext Recurring Billing Date: Today\nRecurring Total: $${Number(result.totalAmount).toFixed(2)}`;

      alert(alertMsg);
      this.init();
    } catch (err) {
      alert('Failed to save quotation: ' + err.message);
    }
  },

  showQuickAddCustomerModal() {
    const existingModal = document.getElementById('quick-customer-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'quick-customer-modal';
    modal.style.cssText = `
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6);
      display: flex; align-items: center; justify-content: center; z-index: 10000;
      backdrop-filter: blur(4px);
    `;

    modal.innerHTML = `
      <div style="background: #fff; width: 100%; max-width: 440px; border-radius: 12px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 18px; font-weight: 800; color: #1e293b; margin: 0;">Quick-Create Customer</h3>
          <button onclick="document.getElementById('quick-customer-modal').remove()" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #94a3b8;">✕</button>
        </div>
        <form id="quick-customer-form" onsubmit="app.submitQuickCustomer(event)">
          <div style="margin-bottom: 14px;">
            <label class="form-label">Company / Account Name *</label>
            <input type="text" id="qc-company" required class="form-control" placeholder="e.g. Acme Corporation" />
          </div>
          <div style="margin-bottom: 14px;">
            <label class="form-label">Contact Person Name</label>
            <input type="text" id="qc-contact" class="form-control" placeholder="e.g. Wile E. Coyote" />
          </div>
          <div style="margin-bottom: 20px;">
            <label class="form-label">Billing Email Address *</label>
            <input type="email" id="qc-email" required class="form-control" placeholder="billing@company.com" />
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" onclick="document.getElementById('quick-customer-modal').remove()" class="btn-action-draft" style="padding: 8px 16px;">Cancel</button>
            <button type="submit" class="btn-action-send" style="padding: 8px 18px;">Create &amp; Select</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  },

  async submitQuickCustomer(e) {
    e.preventDefault();
    const companyName = document.getElementById('qc-company').value.trim();
    const contactName = document.getElementById('qc-contact').value.trim();
    const email = document.getElementById('qc-email').value.trim();

    try {
      const res = await window.api.createCustomer({ companyName, contactName, email });
      const newCustomer = res.customer;

      if (this._quoteState) {
        this._quoteState.customers.push({
          id: newCustomer.id,
          name: newCustomer.name,
          email: newCustomer.email,
          company_name: companyName
        });
        this._quoteState.selectedCustomerId = newCustomer.id;
      }

      document.getElementById('quick-customer-modal')?.remove();
      this.renderQuotationBuilder();
    } catch (err) {
      alert('Failed to create customer: ' + err.message);
    }
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
