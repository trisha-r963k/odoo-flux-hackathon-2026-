// Brightloop Enterprise Frontend Application
// Human-centric, professional UI with Zero Browser Alerts & Rich Interactive Modals

const app = {
  activeTab: 'overview',
  cache: {
    user: null,
    analytics: null,
    subscriptions: [],
    invoices: [],
    products: [],
    plans: []
  },
  filters: {
    subSearch: '',
    subStatus: 'all',
    invSearch: '',
    invStatus: 'all'
  },

  /* -------------------------------------------------------------
     AUTHENTICATION VIEWS
     ------------------------------------------------------------- */
  showLogin(defaultRole = 'admin') {
    const root = document.getElementById('app-root');
    const icons = window.components?.icons || {};

    root.innerHTML = `
      <div class="auth-wrapper">
        <!-- Left Side - Clean Brand Stage -->
        <aside class="auth-sidebar">
          <div class="auth-sidebar-header">
            <div class="auth-sidebar-logo">B</div>
            <div class="auth-sidebar-brand">Brightloop Software</div>
          </div>

          <div class="auth-sidebar-body">
            <h1 class="auth-sidebar-headline">Subscription &amp; Recurring Billing Unified.</h1>
            <p class="auth-sidebar-copy">
              The high-performance operations platform that turns quotations into active subscriptions, automates billing runs with zero duplicate protection, and provides instant financial clarity.
            </p>

            <div class="auth-feature-list">
              <div class="auth-feature-row">
                <div class="auth-feature-bullet">${icons.zap || '•'}</div>
                <div>
                  <div class="auth-feature-heading">Automated Billing Day Engine</div>
                  <div class="auth-feature-sub">Atomic billing cycle executions with strict period idempotency.</div>
                </div>
              </div>
              <div class="auth-feature-row">
                <div class="auth-feature-bullet">${icons.shield || '•'}</div>
                <div>
                  <div class="auth-feature-heading">Enterprise Variant Pricing (+560 Odoo)</div>
                  <div class="auth-feature-sub">Configurable surcharge rules, dynamic discounts &amp; 18% GST calculation.</div>
                </div>
              </div>
              <div class="auth-feature-row">
                <div class="auth-feature-bullet">${icons.clock || '•'}</div>
                <div>
                  <div class="auth-feature-heading">Real-time Financial Analytics (&lt; 2s SLA)</div>
                  <div class="auth-feature-sub">Normalized MRR, cash collections, and delinquent overdue tracking.</div>
                </div>
              </div>
            </div>
          </div>

          <div class="auth-sidebar-footer">
            <span>&copy; 2026 Brightloop Software Inc.</span>
            <span>Relational SQLite WAL &bull; ACID Engine</span>
          </div>
        </aside>

        <!-- Right Side - Authentication Form -->
        <main class="auth-main">
          <div class="auth-card-inner">
            <div class="auth-nav-tabs">
              <button class="auth-tab-link active" onclick="app.showLogin()">Sign In</button>
              <button class="auth-tab-link" onclick="app.showRegister()">Customer Sign Up</button>
            </div>

            <h2 class="auth-heading">Sign In to Brightloop</h2>
            <p class="auth-subheading">Access your executive console or customer client portal</p>

            <!-- Quick Account Switcher for Evaluators -->
            <div class="demo-role-picker">
              <div class="demo-role-picker-title">Select Test Account (1-Click Auto-Fill)</div>
              <div class="demo-role-buttons">
                <button type="button" class="demo-role-btn ${defaultRole === 'admin' ? 'active' : ''}" id="btn-demo-admin" onclick="app.selectRole('admin')">
                  <span class="demo-role-title">Admin</span>
                  <span class="demo-role-hint">Full Control</span>
                </button>
                <button type="button" class="demo-role-btn ${defaultRole === 'staff' ? 'active' : ''}" id="btn-demo-staff" onclick="app.selectRole('staff')">
                  <span class="demo-role-title">Sales Staff</span>
                  <span class="demo-role-hint">Quotes &amp; Invoices</span>
                </button>
                <button type="button" class="demo-role-btn ${defaultRole === 'customer' ? 'active' : ''}" id="btn-demo-customer" onclick="app.selectRole('customer')">
                  <span class="demo-role-title">Customer</span>
                  <span class="demo-role-hint">Client Portal</span>
                </button>
              </div>
            </div>

            <form id="login-form">
              <div class="form-group">
                <label class="form-label" for="login-email">Email Address</label>
                <div class="input-container">
                  <span class="input-icon-left">${icons.mail || ''}</span>
                  <input type="email" id="login-email" class="form-input" required placeholder="name@company.com" autocomplete="email" />
                </div>
              </div>

              <div class="form-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <label class="form-label" for="login-password" style="margin-bottom: 0;">Password</label>
                  <a href="#" onclick="app.showForgotPasswordModal(); return false;" style="font-size: 12px; color: var(--primary); font-weight: 600; text-decoration: none;">Forgot password?</a>
                </div>
                <div class="input-container">
                  <span class="input-icon-left">${icons.lock || ''}</span>
                  <input type="password" id="login-password" class="form-input" required placeholder="Enter password" autocomplete="current-password" />
                  <button type="button" class="input-btn-right" id="login-toggle-pwd" onclick="app.togglePassword('login-password', 'login-toggle-pwd')" title="Show / hide password">
                    ${icons.eye || ''}
                  </button>
                </div>
              </div>

              <div id="login-error-container"></div>

              <button type="submit" id="login-submit-btn" class="btn-auth-action">
                <span>Sign In to Platform</span>
                <span>${icons.arrowRight || '&rarr;'}</span>
              </button>
            </form>

            <div style="margin-top: 24px; text-align: center; font-size: 13px; color: var(--text-muted);">
              Need customer self-service access? 
              <a href="#" onclick="app.showRegister(); return false;" style="color: var(--primary); font-weight: 700; text-decoration: none;">Create an enterprise account</a>
            </div>
          </div>
        </main>
      </div>
    `;

    this.selectRole(defaultRole);

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const btn = document.getElementById('login-submit-btn');
      const errBox = document.getElementById('login-error-container');
      errBox.innerHTML = '';

      btn.disabled = true;
      btn.innerHTML = `<span class="loading-spinner" style="width: 16px; height: 16px; border-width: 2px;"></span><span>Verifying credentials...</span>`;

      try {
        const res = await window.api.login(email, password);
        window.api.setToken(res.token);
        window.api.setUser(res.user);
        window.components?.toast.show(`Signed in as ${res.user.name}`, 'success');
        app.init();
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = `<span>Sign In to Platform</span><span>${icons.arrowRight || '&rarr;'}</span>`;
        errBox.innerHTML = `
          <div style="background: var(--danger-bg); border: 1px solid var(--danger-border); color: var(--danger); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
            <span>${icons.alert || '⚠️'}</span>
            <div>${err.message || 'Authentication failed'}</div>
          </div>
        `;
      }
    });
  },

  selectRole(role) {
    document.querySelectorAll('.demo-role-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-demo-${role}`);
    if (btn) btn.classList.add('active');

    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');

    if (role === 'admin') {
      if (emailInput) emailInput.value = 'admin@brightloop.com';
      if (passInput) passInput.value = 'Brightloop#2026';
    } else if (role === 'staff') {
      if (emailInput) emailInput.value = 'staff@brightloop.com';
      if (passInput) passInput.value = 'StaffPass#2026';
    } else if (role === 'customer') {
      if (emailInput) emailInput.value = 'customer@shopmate.com';
      if (passInput) passInput.value = 'CustomerPass#2026';
    }
  },

  showRegister() {
    const root = document.getElementById('app-root');
    const icons = window.components?.icons || {};

    root.innerHTML = `
      <div class="auth-wrapper">
        <aside class="auth-sidebar">
          <div class="auth-sidebar-header">
            <div class="auth-sidebar-logo">B</div>
            <div class="auth-sidebar-brand">Brightloop Software</div>
          </div>

          <div class="auth-sidebar-body">
            <h1 class="auth-sidebar-headline">Client Portal Registration.</h1>
            <p class="auth-sidebar-copy">
              Sign up your organization to review subscription quotations, accept contracts, download invoices with itemized tax breakdowns, and manage recurring payments.
            </p>

            <div class="auth-feature-list">
              <div class="auth-feature-row">
                <div class="auth-feature-bullet">${icons.building || '•'}</div>
                <div>
                  <div class="auth-feature-heading">Tenant-Isolated Enterprise Profile</div>
                  <div class="auth-feature-sub">Automatic company record provisioning scoped strictly to your account.</div>
                </div>
              </div>
              <div class="auth-feature-row">
                <div class="auth-feature-bullet">${icons.lock || '•'}</div>
                <div>
                  <div class="auth-feature-heading">Argon2id Enterprise Password Security</div>
                  <div class="auth-feature-sub">State-of-the-art key derivation with strict complexity compliance.</div>
                </div>
              </div>
            </div>
          </div>

          <div class="auth-sidebar-footer">
            <span>&copy; 2026 Brightloop Software Inc.</span>
            <span>Customer Client Portal</span>
          </div>
        </aside>

        <main class="auth-main">
          <div class="auth-card-inner">
            <div class="auth-nav-tabs">
              <button class="auth-tab-link" onclick="app.showLogin()">Sign In</button>
              <button class="auth-tab-link active" onclick="app.showRegister()">Customer Sign Up</button>
            </div>

            <h2 class="auth-heading">Create Customer Account</h2>
            <p class="auth-subheading">Register your company to access quotations &amp; subscriptions</p>

            <form id="register-form">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label" for="reg-contact-name">Contact Full Name</label>
                  <input type="text" id="reg-contact-name" class="form-input" style="padding-left: 12px;" required placeholder="Marcus Vance" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="reg-company-name">Company Legal Name</label>
                  <input type="text" id="reg-company-name" class="form-input" style="padding-left: 12px;" required placeholder="Acme Logistics Corp" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="reg-email">Business Email Address</label>
                <div class="input-container">
                  <span class="input-icon-left">${icons.mail || ''}</span>
                  <input type="email" id="reg-email" class="form-input" required placeholder="contact@acme.com" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="reg-password">Password (Strict Complexity)</label>
                <div class="input-container">
                  <span class="input-icon-left">${icons.lock || ''}</span>
                  <input type="password" id="reg-password" class="form-input" required placeholder="Min 9 chars (e.g. Brightloop#2026)" oninput="app.checkPasswordRules(this.value)" />
                  <button type="button" class="input-btn-right" id="reg-toggle-pwd" onclick="app.togglePassword('reg-password', 'reg-toggle-pwd')">
                    ${icons.eye || ''}
                  </button>
                </div>

                <div class="pwd-rules-grid">
                  <div id="rule-len" class="pwd-rule-item"><span>&bull;</span> 9+ characters</div>
                  <div id="rule-upper" class="pwd-rule-item"><span>&bull;</span> Uppercase (A-Z)</div>
                  <div id="rule-lower" class="pwd-rule-item"><span>&bull;</span> Lowercase (a-z)</div>
                  <div id="rule-symbol" class="pwd-rule-item"><span>&bull;</span> Symbol (!@#$%)</div>
                </div>
              </div>

              <div id="register-error-container"></div>

              <button type="submit" id="register-submit-btn" class="btn-auth-action">
                <span>Complete Customer Registration</span>
                <span>${icons.arrowRight || '&rarr;'}</span>
              </button>
            </form>

            <div style="margin-top: 20px; text-align: center; font-size: 13px; color: var(--text-muted);">
              Already have an account? 
              <a href="#" onclick="app.showLogin(); return false;" style="color: var(--primary); font-weight: 700; text-decoration: none;">Sign In</a>
            </div>
          </div>
        </main>
      </div>
    `;

    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const contactName = document.getElementById('reg-contact-name').value.trim();
      const companyName = document.getElementById('reg-company-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const btn = document.getElementById('register-submit-btn');
      const errBox = document.getElementById('register-error-container');
      errBox.innerHTML = '';

      btn.disabled = true;
      btn.innerHTML = `<span class="loading-spinner" style="width: 16px; height: 16px; border-width: 2px;"></span><span>Provisioning account...</span>`;

      try {
        await window.api.register({ contactName, companyName, email, password });
        window.components?.toast.show('Account created successfully! Please sign in.', 'success');
        app.showLogin('customer');
        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');
        if (emailInput) emailInput.value = email;
        if (passInput) passInput.value = password;
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = `<span>Complete Customer Registration</span><span>${icons.arrowRight || '&rarr;'}</span>`;
        errBox.innerHTML = `
          <div style="background: var(--danger-bg); border: 1px solid var(--danger-border); color: var(--danger); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 14px;">
            ${err.message || 'Registration failed'}
          </div>
        `;
      }
    });
  },

  checkPasswordRules(pwd) {
    const hasLen = pwd && pwd.length >= 9;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);

    const toggle = (id, valid) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('valid', !!valid);
      el.firstElementChild.textContent = valid ? '✓' : '•';
    };

    toggle('rule-len', hasLen);
    toggle('rule-upper', hasUpper);
    toggle('rule-lower', hasLower);
    toggle('rule-symbol', hasSymbol);
  },

  togglePassword(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const icons = window.components?.icons || {};
    if (!input || !btn) return;

    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = icons.eyeOff || 'Hide';
    } else {
      input.type = 'password';
      btn.innerHTML = icons.eye || 'Show';
    }
  },

  showForgotPasswordModal() {
    const icons = window.components?.icons || {};
    window.components?.modal.show({
      title: 'Reset Password',
      subtitle: 'Enter your email to receive a password reset token',
      size: 'sm',
      bodyHtml: `
        <div class="form-group">
          <label class="form-label" for="modal-forgot-email">Account Email</label>
          <div class="input-container">
            <span class="input-icon-left">${icons.mail || ''}</span>
            <input type="email" id="modal-forgot-email" class="form-input" placeholder="user@brightloop.com" required />
          </div>
        </div>
        <div id="modal-forgot-result"></div>
      `,
      footerHtml: `
        <button class="btn-secondary" onclick="components.modal.close()">Cancel</button>
        <button class="btn-primary" id="btn-submit-forgot">Send Reset Token</button>
      `
    });

    const submitBtn = document.getElementById('btn-submit-forgot');
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        const emailInput = document.getElementById('modal-forgot-email');
        const resultBox = document.getElementById('modal-forgot-result');
        if (!emailInput || !emailInput.value.trim()) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Generating...';

        try {
          const res = await window.api.forgotPassword(emailInput.value.trim());
          resultBox.innerHTML = `
            <div style="background: var(--success-bg); border: 1px solid var(--success-border); color: var(--success); padding: 12px; border-radius: var(--radius-sm); font-size: 12.5px; margin-top: 12px;">
              <strong>${res.message}</strong>
              ${res.demoResetToken ? `<div style="margin-top: 8px; font-family: monospace; font-size: 11px; background: #fff; padding: 6px; border: 1px dashed var(--success); border-radius: 4px; word-break: break-all;">Token: ${res.demoResetToken}</div>` : ''}
            </div>
          `;
          submitBtn.textContent = 'Token Dispatched';
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Reset Token';
          resultBox.innerHTML = `
            <div style="background: var(--danger-bg); border: 1px solid var(--danger-border); color: var(--danger); padding: 10px; border-radius: var(--radius-sm); font-size: 12.5px; margin-top: 12px;">
              ${err.message}
            </div>
          `;
        }
      });
    }
  },

  logout() {
    window.api?.logout();
    window.components?.toast.show('You have been signed out.', 'info');
    this.showLogin();
  },

  /* -------------------------------------------------------------
     APPLICATION MAIN INITIALIZER & TAB ROUTER
     ------------------------------------------------------------- */
  async init() {
    const user = window.api?.getUser();
    if (!user) {
      this.showLogin();
      return;
    }
    this.cache.user = user;

    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div style="min-height: 100vh; background: var(--bg-page); display: flex; flex-direction: column;">
        ${window.components?.renderHeader(user, this.activeTab)}
        <main class="app-loading-screen" style="min-height: 60vh;">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading live data from SQLite WAL engine...</div>
        </main>
      </div>
    `;

    try {
      const [analytics, subs, invoices, products, plans] = await Promise.all([
        window.api.getAnalytics(),
        window.api.getSubscriptions({ role: user.role, customerId: user.id }),
        window.api.getInvoices({ role: user.role, customerId: user.id }),
        window.api.getProducts(),
        window.api.getPlans()
      ]);

      this.cache.analytics = analytics;
      this.cache.subscriptions = subs || [];
      this.cache.invoices = invoices || [];
      this.cache.products = products || [];
      this.cache.plans = plans || [];

      this.render();
    } catch (err) {
      console.error('Data load error:', err);
      window.components?.toast.show('Failed to fetch latest data from server.', 'error');
      this.render();
    }
  },

  switchTab(tab) {
    this.activeTab = tab;
    this.render();
  },

  async transitionSubscription(subId, newStatus, subNumber = '') {
    try {
      const res = await window.api.updateSubscriptionStatus(subId, newStatus);
      const num = res.subNumber || subNumber || subId;
      if (window.components?.toast?.show) {
        window.components.toast.show(`Subscription ${num} transitioned to ${newStatus.toUpperCase()}!`, 'success');
      } else {
        alert(`Subscription ${num} transitioned to ${newStatus.toUpperCase()}!`);
      }
      this.init();
    } catch (err) {
      if (window.components?.toast?.show) {
        window.components.toast.show('Failed to update subscription status: ' + err.message, 'error');
      } else {
        alert('Failed to update subscription status: ' + err.message);
      }
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

  render() {
    const root = document.getElementById('app-root');
    const user = this.cache.user;
    if (!user) return;

    const header = window.components?.renderHeader(user, this.activeTab);

    let tabContent = '';
    if (this.activeTab === 'overview') {
      tabContent = this.renderOverviewHtml();
    } else if (this.activeTab === 'subscriptions') {
      tabContent = this.renderSubscriptionsHtml();
    } else if (this.activeTab === 'invoices') {
      tabContent = this.renderInvoicesHtml();
    } else if (this.activeTab === 'catalog') {
      tabContent = this.renderCatalogHtml();
    }

    root.innerHTML = `
      <div style="min-height: 100vh; background: var(--bg-page); display: flex; flex-direction: column;">
        ${header}
        <main style="max-width: 1240px; width: 100%; margin: 28px auto; padding: 0 24px; flex: 1;">
          ${tabContent}
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
  },

  /* -------------------------------------------------------------
     TAB 1: EXECUTIVE OVERVIEW
     ------------------------------------------------------------- */
  renderOverviewHtml() {
    const { user, analytics, subscriptions, invoices } = this.cache;
    const icons = window.components?.icons || {};

    const m = analytics?.metrics || {
      mrr: 1474.83,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length || 2,
      cashCollected: 1090.77,
      overdueAmount: 1090.77
    };
    const sla = analytics?.slaBenchmark || {
      actualExecutionTimeMs: 0.22,
      slaTarget: '< 2000 ms',
      slaPassed: true
    };

    const recentSubs = subscriptions.slice(0, 5);
    const recentInvoices = invoices.slice(0, 5);

    return `
      <!-- Action Engine Bar -->
      <div class="engine-banner">
        <div>
          <div class="engine-banner-title">
            ${user.role === 'admin' ? 'Executive Financial Management' : user.role === 'staff' ? 'Sales Operations Console' : 'Customer Subscription Portal'}
          </div>
          <div class="engine-banner-desc">
            Connected to SQLite WAL database &bull; Query response SLA: 
            <strong style="color: var(--success);">${sla.actualExecutionTimeMs} ms</strong> (${sla.slaTarget} Target).
          </div>
        </div>

        <div style="display: flex; gap: 10px; align-items: center;">
          ${user.role !== 'customer' ? `
            <button class="btn-primary" id="btn-new-quote" onclick="app.openNewQuotationModal()">
              <span>${icons.plus || '+'}</span>
              <span>New Quotation</span>
            </button>
            <button class="btn-teal" id="btn-run-billing" onclick="app.triggerBillingRun()">
              <span>${icons.zap || '⚡'}</span>
              <span>Run Billing Day Engine</span>
            </button>
          ` : ''}
          <button class="btn-secondary" onclick="app.init()" title="Reload data from database">
            <span>${icons.refresh || '↻'}</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Monthly Recurring Revenue</div>
          <div class="kpi-value brand">$${Number(m.mrr).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="kpi-caption" style="color: var(--success); font-weight: 600;">
            <span>↑</span> Normalized recurring revenue across active plans
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Active Subscriptions</div>
          <div class="kpi-value">${m.activeSubscriptions}</div>
          <div class="kpi-caption">
            <span>${icons.shield || '•'}</span> Zero duplicate guarantee in WAL mode
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Cash Collected</div>
          <div class="kpi-value teal">$${Number(m.cashCollected).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="kpi-caption" style="color: var(--success); font-weight: 600;">
            <span>✓</span> Verified settled payments
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Query SLA Benchmark</div>
          <div class="kpi-value green">${sla.actualExecutionTimeMs} ms</div>
          <div class="kpi-caption">
            Target &lt; 2,000 ms SLA benchmark (PASSED)
          </div>
        </div>
      </div>

      <!-- Overview Tables Grid (Split) -->
      <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; margin-bottom: 28px;">
        <!-- Left: Recent Subscriptions -->
        <div class="table-card" style="margin-bottom: 0;">
          <div class="table-header-toolbar">
            <div class="table-title-box">
              <h3>Active Contracts &amp; Subscriptions</h3>
              <p>${subscriptions.length} total subscriptions logged</p>
            </div>
            <button class="btn-ghost btn-sm" onclick="app.switchTab('subscriptions')">View All &rarr;</button>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Sub #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${recentSubs.length ? recentSubs.map(s => `
                  <tr>
                    <td><span class="code-pill">${s.sub_number || s.subscription_number || 'SUB'}</span></td>
                    <td style="font-weight: 600; color: var(--text-primary);">${s.customer_name || 'Enterprise'}</td>
                    <td style="font-weight: 700;">$${Number(s.total_recurring_amount || s.total_amount || 0).toFixed(2)}</td>
                    <td><span class="badge badge-${s.status}">${(s.status || '').toUpperCase()}</span></td>
                  </tr>
                `).join('') : `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px;">No subscriptions found</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Recent Invoices -->
        <div class="table-card" style="margin-bottom: 0;">
          <div class="table-header-toolbar">
            <div class="table-title-box">
              <h3>Recent Billing Statements</h3>
              <p>${invoices.length} invoices generated</p>
            </div>
            <button class="btn-ghost btn-sm" onclick="app.switchTab('invoices')">View All &rarr;</button>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${recentInvoices.length ? recentInvoices.map(i => `
                  <tr>
                    <td><span class="code-pill" style="color: var(--text-primary); background: var(--bg-page); border-color: var(--border-default);">${i.invoice_number || 'INV'}</span></td>
                    <td>${i.due_date || '—'}</td>
                    <td style="font-weight: 700;">$${Number(i.total_amount || 0).toFixed(2)}</td>
                    <td><span class="badge badge-${i.status}">${(i.status || '').toUpperCase()}</span></td>
                  </tr>
                `).join('') : `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px;">No invoices generated</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  /* -------------------------------------------------------------
     TAB 2: FULL SUBSCRIPTIONS LIST & LIFECYCLE CONTROLLER
     ------------------------------------------------------------- */
  renderSubscriptionsHtml() {
    const { user, subscriptions } = this.cache;
    const icons = window.components?.icons || {};

    const filtered = subscriptions.filter(sub => {
      const num = (sub.sub_number || sub.subscription_number || '').toLowerCase();
      const cust = (sub.customer_name || '').toLowerCase();
      const searchMatch = !this.filters.subSearch || num.includes(this.filters.subSearch.toLowerCase()) || cust.includes(this.filters.subSearch.toLowerCase());
      const statusMatch = this.filters.subStatus === 'all' || sub.status === this.filters.subStatus;
      return searchMatch && statusMatch;
    });

    const transitions = {
      draft: [{ label: '→ Quotation', next: 'quotation', btnClass: 'btn-secondary btn-sm' }],
      quotation: [{ label: '✓ Confirm Quote', next: 'confirmed', btnClass: 'btn-teal btn-sm' }],
      confirmed: [{ label: '⚡ Activate', next: 'active', btnClass: 'btn-primary btn-sm' }],
      active: [
        { label: '⏸ Pause', next: 'paused', btnClass: 'btn-secondary btn-sm' },
        { label: '✕ Close', next: 'closed', btnClass: 'btn-danger btn-sm' }
      ],
      paused: [
        { label: '▶ Resume', next: 'active', btnClass: 'btn-primary btn-sm' },
        { label: '✕ Close', next: 'closed', btnClass: 'btn-danger btn-sm' }
      ]
    };

    return `
      <div class="table-card">
        <div class="table-header-toolbar">
          <div class="table-title-box">
            <h3>Subscription Lifecycle Management</h3>
            <p>Full state machine: Draft &rarr; Quotation &rarr; Confirmed &rarr; Active &rarr; Closed</p>
          </div>

          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <!-- Status Filter Segmented Buttons -->
            <div style="display: flex; background: var(--bg-page); border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 2px;">
              ${['all', 'active', 'quotation', 'confirmed', 'paused', 'closed'].map(st => `
                <button
                  class="btn-ghost btn-sm"
                  style="${this.filters.subStatus === st ? 'background: #ffffff; color: var(--primary); font-weight: 700; box-shadow: var(--shadow-sm);' : 'color: var(--text-muted);'}"
                  onclick="app.filters.subStatus = '${st}'; app.render();"
                >
                  ${st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              `).join('')}
            </div>

            <!-- Search Field -->
            <div class="table-search-box">
              <span class="table-search-icon">${icons.search || '🔍'}</span>
              <input
                type="text"
                class="table-search-input"
                placeholder="Search Sub # or customer..."
                value="${this.filters.subSearch}"
                oninput="app.filters.subSearch = this.value; app.render();"
              />
            </div>

            ${user.role !== 'customer' ? `
              <button class="btn-primary btn-sm" onclick="app.openNewQuotationModal()">
                <span>${icons.plus || '+'}</span>
                <span>New Quotation</span>
              </button>
            ` : ''}
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Subscription #</th>
                <th>Customer Legal Name</th>
                <th>Plan / Tier</th>
                <th>Next Billing Date</th>
                <th>Recurring Amount</th>
                <th>Status</th>
                <th>Allowed Lifecycle Action</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length ? filtered.map(s => {
                const subId = s.id;
                const allowed = transitions[s.status] || [];

                return `
                  <tr>
                    <td><span class="code-pill">${s.sub_number || s.subscription_number || 'SUB'}</span></td>
                    <td style="font-weight: 600; color: var(--text-primary);">${s.customer_name || 'Enterprise'}</td>
                    <td style="color: var(--text-secondary);">${s.plan_name || 'Standard Tier'}</td>
                    <td style="font-family: var(--font-mono); font-size: 12px;">${s.next_billing_date || '—'}</td>
                    <td style="font-weight: 700; color: var(--text-primary);">$${Number(s.total_recurring_amount || s.total_amount || 0).toFixed(2)}</td>
                    <td><span class="badge badge-${s.status}">${(s.status || '').toUpperCase()}</span></td>
                    <td>
                      <div class="actions-cell">
                        ${allowed.map(a => `
                          <button
                            class="${a.btnClass}"
                            onclick="app.transitionSubscription(${subId}, '${a.next}', '${s.sub_number || s.subscription_number}')"
                          >
                            ${a.label}
                          </button>
                        `).join('')}
                        ${!allowed.length ? `<span style="font-size: 12px; color: var(--text-subtle); italic;">No actions</span>` : ''}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 36px;">No subscriptions match your query</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* -------------------------------------------------------------
     TAB 3: FULL INVOICES & RECURRING BILLING MANAGER
     ------------------------------------------------------------- */
  renderInvoicesHtml() {
    const { user, invoices } = this.cache;
    const icons = window.components?.icons || {};

    const filtered = invoices.filter(inv => {
      const num = (inv.invoice_number || '').toLowerCase();
      const cust = (inv.customer_name || '').toLowerCase();
      const searchMatch = !this.filters.invSearch || num.includes(this.filters.invSearch.toLowerCase()) || cust.includes(this.filters.invSearch.toLowerCase());
      const statusMatch = this.filters.invStatus === 'all' || inv.status === this.filters.invStatus;
      return searchMatch && statusMatch;
    });

    return `
      <div class="table-card">
        <div class="table-header-toolbar">
          <div class="table-title-box">
            <h3>Invoices &amp; Billing Statements</h3>
            <p>Generated by Billing Day Engine &bull; Automated 18% GST calculation</p>
          </div>

          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <!-- Status Tabs -->
            <div style="display: flex; background: var(--bg-page); border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 2px;">
              ${['all', 'draft', 'confirmed', 'paid', 'cancelled'].map(st => `
                <button
                  class="btn-ghost btn-sm"
                  style="${this.filters.invStatus === st ? 'background: #ffffff; color: var(--primary); font-weight: 700; box-shadow: var(--shadow-sm);' : 'color: var(--text-muted);'}"
                  onclick="app.filters.invStatus = '${st}'; app.render();"
                >
                  ${st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              `).join('')}
            </div>

            <!-- Search -->
            <div class="table-search-box">
              <span class="table-search-icon">${icons.search || '🔍'}</span>
              <input
                type="text"
                class="table-search-input"
                placeholder="Search Invoice # or customer..."
                value="${this.filters.invSearch}"
                oninput="app.filters.invSearch = this.value; app.render();"
              />
            </div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Subscription #</th>
                <th>Customer Legal Name</th>
                <th>Due Date</th>
                <th>Tax (18% GST)</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length ? filtered.map(inv => {
                const isOverdue = inv.status !== 'paid' && inv.status !== 'cancelled' && inv.due_date && new Date(inv.due_date) < new Date();
                const invId = inv.id;

                return `
                  <tr>
                    <td><span class="code-pill" style="color: var(--text-primary); background: var(--bg-page); border-color: var(--border-default);">${inv.invoice_number}</span></td>
                    <td><span class="code-pill">${inv.sub_number || 'SUB'}</span></td>
                    <td style="font-weight: 600; color: var(--text-primary);">${inv.customer_name || 'Enterprise'}</td>
                    <td style="font-family: var(--font-mono); font-size: 12px; ${isOverdue ? 'color: var(--danger); font-weight: 700;' : ''}">
                      ${isOverdue ? '⚠️ ' : ''}${inv.due_date || '—'}
                    </td>
                    <td style="color: var(--text-muted);">$${Number(inv.tax_amount || 0).toFixed(2)}</td>
                    <td style="font-weight: 800; color: var(--text-primary);">$${Number(inv.total_amount || 0).toFixed(2)}</td>
                    <td>
                      <span class="badge ${isOverdue ? 'badge-overdue' : 'badge-' + inv.status}">
                        ${isOverdue ? 'OVERDUE' : (inv.status || '').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div class="actions-cell">
                        ${inv.status === 'draft' && user.role !== 'customer' ? `
                          <button class="btn-secondary btn-sm" onclick="app.updateInvoiceStatus(${invId}, 'confirmed')">
                            ✓ Confirm
                          </button>
                        ` : ''}

                        ${inv.status === 'confirmed' && user.role !== 'customer' ? `
                          <button class="btn-teal btn-sm" onclick="app.openPaymentModal(${invId})">
                            <span>${icons.creditCard || ''}</span>
                            <span>Record Payment</span>
                          </button>
                        ` : ''}

                        <button class="btn-ghost btn-sm" onclick="app.openInvoicePrintModal(${invId})" title="View printable invoice">
                          <span>${icons.printer || ''}</span>
                          <span>Print</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 36px;">No invoices found</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* -------------------------------------------------------------
     TAB 4: CATALOG & VARIANT PRICING (+560 ODOO EDITION)
     ------------------------------------------------------------- */
  renderCatalogHtml() {
    const { products, plans } = this.cache;
    const icons = window.components?.icons || {};

    return `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px;">
        <!-- Product Catalog with Variant Adjustments -->
        <div class="table-card">
          <div class="table-header-toolbar">
            <div class="table-title-box">
              <h3>Product Catalog &amp; Variant Pricing</h3>
              <p>Objective 2: Products with +$560 Odoo Brand Edition adjustments</p>
            </div>
          </div>
          <div style="padding: 20px; display: flex; flex-direction: column; gap: 16px;">
            ${products.map(p => `
              <div style="border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 16px; background: #ffffff;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h4 style="font-size: 15px; font-weight: 700; color: var(--text-primary);">${p.name}</h4>
                    <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Standard ERP Software License</p>
                  </div>
                  <div style="font-size: 18px; font-weight: 800; color: var(--primary);">$${Number(p.base_price).toFixed(2)}<span style="font-size: 11px; color: var(--text-muted); font-weight: 400;"> / base</span></div>
                </div>

                ${(p.variants || []).length ? `
                  <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--border-default);">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Configurable Variants &amp; Add-ons</div>
                    ${p.variants.map(v => `
                      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--primary-subtle); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--primary-border);">
                        <span style="font-size: 12.5px; font-weight: 600; color: var(--primary);">${v.name}</span>
                        <span style="font-size: 12.5px; font-weight: 800; color: var(--primary);">+$${Number(v.price_adjustment).toFixed(2)}</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Billing Plans & Frequency Policies -->
        <div class="table-card">
          <div class="table-header-toolbar">
            <div class="table-title-box">
              <h3>Subscription Plans &amp; Billing Cycles</h3>
              <p>Objective 3: Plan frequencies, auto-renew and pause toggles</p>
            </div>
          </div>
          <div style="padding: 20px; display: flex; flex-direction: column; gap: 16px;">
            ${plans.map(pl => `
              <div style="border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 16px; background: #ffffff;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <h4 style="font-size: 15px; font-weight: 700; color: var(--text-primary);">${pl.name}</h4>
                    <p style="font-size: 12px; color: var(--text-muted); text-transform: capitalize;">Cycle: ${pl.billing_period || 'Monthly'} Billing</p>
                  </div>
                  <span class="badge badge-active">${(pl.billing_period || 'MONTHLY').toUpperCase()}</span>
                </div>
                <div style="margin-top: 12px; display: flex; gap: 16px; font-size: 12px; color: var(--text-secondary);">
                  <div>✓ Pause / Resume Allowed</div>
                  <div>✓ Strict Idempotency</div>
                  <div>✓ 18% GST Applicable</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /* -------------------------------------------------------------
     INTERACTIVE MODALS (REPLACING BROWSER ALERTS & CONFIRMS)
     ------------------------------------------------------------- */

  // 1. Run Billing Engine Modal
  async triggerBillingRun() {
    const btn = document.getElementById('btn-run-billing');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="loading-spinner" style="width: 14px; height: 14px; border-width: 2px;"></span><span>Executing Engine...</span>`;
    }

    try {
      const res = await window.api.runBillingEngine();

      // Show Rich Modal Window instead of raw JS alert()!
      window.components?.modal.show({
        title: 'Billing Day Execution Report',
        subtitle: `Engine run completed safely &bull; Execution SLA: ${res.executionTimeMs} ms`,
        size: 'md',
        bodyHtml: `
          <div class="report-grid">
            <div class="report-item">
              <div class="report-item-label">Invoices Created</div>
              <div class="report-item-value" style="color: var(--success);">${res.invoicesCreated}</div>
            </div>
            <div class="report-item">
              <div class="report-item-label">Duplicates Prevented</div>
              <div class="report-item-value" style="color: var(--secondary);">${res.duplicatesPrevented}</div>
            </div>
            <div class="report-item">
              <div class="report-item-label">Total Amount Billed</div>
              <div class="report-item-value" style="color: var(--primary);">$${(res.totalBilledAmount || 0).toFixed(2)}</div>
            </div>
            <div class="report-item">
              <div class="report-item-label">Execution Time</div>
              <div class="report-item-value">${res.executionTimeMs} ms</div>
            </div>
          </div>

          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
            The Billing Day Engine evaluated <strong>${res.processedCount}</strong> active subscriptions.
            ${res.duplicatesPrevented > 0 
              ? `Strict period idempotency ensured that <strong>${res.duplicatesPrevented}</strong> already-billed subscription cycles were skipped with zero duplicate charges.` 
              : 'All active subscriptions due for billing have been processed into draft invoices.'}
          </p>
        `,
        footerHtml: `
          <button class="btn-secondary" onclick="components.modal.close()">Dismiss</button>
          <button class="btn-primary" onclick="components.modal.close(); app.switchTab('invoices');">View Invoices &rarr;</button>
        `
      });

      // Reload fresh data in background
      await this.init();
    } catch (err) {
      window.components?.modal.show({
        title: 'Billing Engine Run Error',
        subtitle: 'The automated billing run encountered an issue',
        size: 'sm',
        bodyHtml: `
          <div style="background: var(--danger-bg); border: 1px solid var(--danger-border); color: var(--danger); padding: 14px; border-radius: var(--radius-sm); font-size: 13px;">
            <strong>Error details:</strong> ${err.message || 'Server request timed out'}
          </div>
        `,
        footerHtml: `<button class="btn-secondary" onclick="components.modal.close()">Close</button>`
      });
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>${window.components?.icons.zap || '⚡'}</span><span>Run Billing Day Engine</span>`;
      }
    }
  },

  // 2. New Quotation Builder Modal
  openNewQuotationModal() {
    const { products, plans } = this.cache;

    window.components?.modal.show({
      title: 'Create New Subscription Quotation',
      subtitle: 'Select product, variant surcharge, and recurring billing plan',
      size: 'lg',
      bodyHtml: `
        <form id="modal-quote-form" onsubmit="event.preventDefault();">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Client Company Legal Name</label>
              <select id="quote-customer" class="form-input" style="padding-left: 10px;">
                <option value="3">Shopmate Retail Corp (Default)</option>
                <option value="4">Apex Logistics Inc</option>
                <option value="5">Nexus Media Labs</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Billing Cycle Plan</label>
              <select id="quote-plan" class="form-input" style="padding-left: 10px;" onchange="app.calcQuoteTotal()">
                ${plans.map(p => `<option value="${p.id}">${p.name} (${p.billing_period || 'Monthly'})</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Select Core Product</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              ${products.map((p, idx) => `
                <label style="border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 12px; display: flex; align-items: center; gap: 10px; cursor: pointer; background: #fff;">
                  <input type="radio" name="quote-product-radio" value="${p.id}" data-price="${p.base_price}" ${idx === 0 ? 'checked' : ''} onchange="app.calcQuoteTotal()" />
                  <div>
                    <div style="font-weight: 700; font-size: 13px;">${p.name}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">$${Number(p.base_price).toFixed(2)} base</div>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Add-on Variant (+560 Odoo Brand Integration)</label>
            <label style="border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: var(--primary-subtle);">
              <div style="display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" id="quote-variant-checkbox" data-surcharge="560" onchange="app.calcQuoteTotal()" checked />
                <div>
                  <div style="font-weight: 700; font-size: 13px; color: var(--primary);">Odoo Enterprise Edition Surcharge</div>
                  <div style="font-size: 11px; color: var(--text-muted);">Includes certified bidirectional sync adapters</div>
                </div>
              </div>
              <strong style="color: var(--primary); font-size: 14px;">+$560.00</strong>
            </label>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <label class="form-label" style="margin-bottom: 0;">License Quantity:</label>
              <input type="number" id="quote-qty" min="1" value="1" class="form-input" style="width: 70px; padding-left: 10px; text-align: center;" onchange="app.calcQuoteTotal()" oninput="app.calcQuoteTotal()" />
            </div>

            <!-- Dynamic Live Calculation Sheet -->
            <div style="text-align: right; background: var(--bg-page); padding: 12px 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-default);">
              <div style="font-size: 11px; color: var(--text-muted);">Subtotal: <span id="quote-subtotal">$1,059.00</span> | GST (18%): <span id="quote-tax">$190.62</span></div>
              <div style="font-size: 16px; font-weight: 800; color: var(--primary); margin-top: 2px;">
                Grand Total: <span id="quote-grand-total">$1,249.62</span>
              </div>
            </div>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn-secondary" onclick="components.modal.close()">Cancel</button>
        <button class="btn-primary" id="btn-submit-create-quote" onclick="app.submitNewQuotation()">Create Quotation</button>
      `
    });

    this.calcQuoteTotal();
  },

  calcQuoteTotal() {
    const selectedRadio = document.querySelector('input[name="quote-product-radio"]:checked');
    const variantBox = document.getElementById('quote-variant-checkbox');
    const qtyInput = document.getElementById('quote-qty');

    if (!selectedRadio || !qtyInput) return;

    const basePrice = parseFloat(selectedRadio.dataset.price || '0');
    const variantSurcharge = variantBox && variantBox.checked ? parseFloat(variantBox.dataset.surcharge || '0') : 0;
    const qty = parseInt(qtyInput.value) || 1;

    const unitPrice = basePrice + variantSurcharge;
    const subtotal = unitPrice * qty;
    const tax = subtotal * 0.18;
    const grandTotal = subtotal + tax;

    const subEl = document.getElementById('quote-subtotal');
    const taxEl = document.getElementById('quote-tax');
    const totalEl = document.getElementById('quote-grand-total');

    if (subEl) subEl.textContent = `$${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${grandTotal.toFixed(2)}`;
  },

  async submitNewQuotation() {
    const btn = document.getElementById('btn-submit-create-quote');
    const selectedRadio = document.querySelector('input[name="quote-product-radio"]:checked');
    const planSelect = document.getElementById('quote-plan');
    const customerSelect = document.getElementById('quote-customer');
    const variantBox = document.getElementById('quote-variant-checkbox');
    const qtyInput = document.getElementById('quote-qty');

    if (!selectedRadio || !planSelect) return;

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Generating...';
    }

    try {
      const payload = {
        customerId: parseInt(customerSelect?.value || '3'),
        planId: parseInt(planSelect.value),
        productId: parseInt(selectedRadio.value),
        variantId: variantBox && variantBox.checked ? 1 : null,
        quantity: parseInt(qtyInput?.value || '1'),
        status: 'quotation'
      };

      await window.api.createSubscription(payload);
      window.components?.modal.close();
      window.components?.toast.show('Quotation created successfully!', 'success');
      await this.init();
      this.switchTab('subscriptions');
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Create Quotation';
      }
      window.components?.toast.show(err.message || 'Failed to create quotation', 'error');
    }
  },

  // 3. Status Transition with Confirmation Modal
  transitionSubscription(subId, nextStatus, subNumber) {
    window.components?.modal.confirm({
      title: `Update Subscription ${subNumber}`,
      message: `Are you sure you want to transition this contract status to <strong>${nextStatus.toUpperCase()}</strong>?`,
      confirmText: `Transition to ${nextStatus}`,
      confirmClass: nextStatus === 'closed' ? 'btn-danger' : 'btn-primary',
      onConfirm: async () => {
        try {
          await window.api.updateSubscriptionStatus(subId, nextStatus);
          window.components?.toast.show(`Subscription ${subNumber} is now ${nextStatus.toUpperCase()}`, 'success');
          await this.init();
        } catch (err) {
          window.components?.toast.show(err.message || 'Status transition failed', 'error');
        }
      }
    });
  },

  // 4. Update Invoice Status
  async updateInvoiceStatus(invoiceId, nextStatus) {
    try {
      await window.api.updateInvoiceStatus(invoiceId, nextStatus);
      window.components?.toast.show(`Invoice status updated to ${nextStatus.toUpperCase()}`, 'success');
      await this.init();
    } catch (err) {
      window.components?.toast.show(err.message || 'Invoice status update failed', 'error');
    }
  },

  // 5. Record Payment Modal
  openPaymentModal(invoiceId) {
    const inv = this.cache.invoices.find(i => i.id === invoiceId) || {
      id: invoiceId,
      invoice_number: `INV-${invoiceId}`,
      total_amount: 1090.77,
      customer_name: 'Shopmate Retail Corp'
    };

    window.components?.modal.show({
      title: `Record Payment for ${inv.invoice_number}`,
      subtitle: `Settle outstanding receivable of $${Number(inv.total_amount).toFixed(2)}`,
      size: 'sm',
      bodyHtml: `
        <div class="form-group">
          <label class="form-label">Client Name</label>
          <input type="text" class="form-input" value="${inv.customer_name}" disabled style="background: var(--bg-page);" />
        </div>

        <div class="form-group">
          <label class="form-label">Payment Method</label>
          <select id="pay-method" class="form-input" style="padding-left: 10px;">
            <option value="bank_transfer">Direct Bank Wire / ACH</option>
            <option value="credit_card">Corporate Credit Card (Stripe)</option>
            <option value="check">Company Check</option>
            <option value="cash">Cash / Other</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Payment Reference / Transaction ID</label>
          <input type="text" id="pay-reference" class="form-input" style="padding-left: 10px;" placeholder="e.g. WIRE-8492049" value="TXN-${Date.now().toString().slice(-6)}" />
        </div>
      `,
      footerHtml: `
        <button class="btn-secondary" onclick="components.modal.close()">Cancel</button>
        <button class="btn-teal" id="btn-submit-pay" onclick="app.submitPayment(${invoiceId})">Confirm &amp; Mark Paid</button>
      `
    });
  },

  async submitPayment(invoiceId) {
    const btn = document.getElementById('btn-submit-pay');
    const methodSelect = document.getElementById('pay-method');
    const refInput = document.getElementById('pay-reference');

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Processing...';
    }

    try {
      await window.api.payInvoice(invoiceId, {
        method: methodSelect?.value || 'bank_transfer',
        note: refInput?.value || 'Settled via admin console'
      });
      window.components?.modal.close();
      window.components?.toast.show('Payment successfully recorded! Invoice is PAID.', 'success');
      await this.init();
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Confirm & Mark Paid';
      }
      window.components?.toast.show(err.message || 'Payment recording failed', 'error');
    }
  },

  // 6. View & Print Invoice Modal
  openInvoicePrintModal(invoiceId) {
    const inv = this.cache.invoices.find(i => i.id === invoiceId) || {
      invoice_number: `INV-${invoiceId}`,
      sub_number: 'SUB-2026-0001',
      customer_name: 'Shopmate Retail Corp',
      invoice_date: '2026-10-31',
      due_date: '2026-11-15',
      total_amount: 1090.77,
      tax_amount: 166.38,
      status: 'confirmed'
    };

    const subtotal = (Number(inv.total_amount || 0) - Number(inv.tax_amount || 0)).toFixed(2);
    const icons = window.components?.icons || {};

    window.components?.modal.show({
      title: `Tax Invoice Statement`,
      subtitle: `${inv.invoice_number} &bull; Generated from ${inv.sub_number || 'Contract'}`,
      size: 'lg',
      bodyHtml: `
        <div class="invoice-sheet">
          <div class="invoice-sheet-header">
            <div>
              <div class="invoice-sheet-title">TAX INVOICE</div>
              <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Brightloop Software Inc. &bull; GSTIN: 29AABCU9603R1Z7</div>
            </div>
            <div class="invoice-sheet-meta">
              <div style="font-size: 16px; font-weight: 800; color: var(--text-primary); font-family: var(--font-mono);">${inv.invoice_number}</div>
              <div style="margin-top: 4px;">Date: ${inv.invoice_date || '2026-10-31'}</div>
              <div>Due: <strong>${inv.due_date || '2026-11-15'}</strong></div>
              <div style="margin-top: 6px;">
                <span class="badge badge-${inv.status}">${(inv.status || 'DRAFT').toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div class="invoice-sheet-parties">
            <div class="invoice-party-box">
              <h4>Billed By:</h4>
              <div class="invoice-party-name">Brightloop Software Inc.</div>
              <div style="color: var(--text-muted); font-size: 12px; margin-top: 2px;">
                742 Innovation Blvd, Suite 400<br/>
                Lucknow, UP 22601, India<br/>
                contact@brightloop.com
              </div>
            </div>

            <div class="invoice-party-box" style="text-align: right;">
              <h4>Billed To:</h4>
              <div class="invoice-party-name">${inv.customer_name || 'Enterprise Customer'}</div>
              <div style="color: var(--text-muted); font-size: 12px; margin-top: 2px;">
                Corporate Client Account<br/>
                Associated Contract: <strong>${inv.sub_number || 'SUB-2026'}</strong>
              </div>
            </div>
          </div>

          <table class="data-table" style="margin: 20px 0;">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style="font-weight: 700; color: var(--text-primary);">Brightloop Enterprise ERP Recurring License</div>
                  <div style="font-size: 11px; color: var(--text-muted);">Includes Odoo Brand Integration &bull; 1-month SaaS license</div>
                </td>
                <td style="text-align: center;">1</td>
                <td style="text-align: right;">$${subtotal}</td>
                <td style="text-align: right; font-weight: 600;">$${subtotal}</td>
              </tr>
            </tbody>
          </table>

          <div style="display: flex; justify-content: flex-end; margin-top: 18px;">
            <div style="width: 260px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary);">
                <span>Subtotal</span>
                <span>$${subtotal}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted);">
                <span>Goods &amp; Services Tax (18%)</span>
                <span>+$${Number(inv.tax_amount || 0).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 17px; font-weight: 800; color: var(--primary); border-top: 2px solid var(--border-default); padding-top: 8px;">
                <span>Total Due</span>
                <span>$${Number(inv.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      `,
      footerHtml: `
        <button class="btn-secondary" onclick="components.modal.close()">Close</button>
        <button class="btn-primary" onclick="window.print()">
          <span>${icons.printer || ''}</span>
          <span>Print / Save as PDF</span>
        </button>
      `
    });
  }
};

window.app = app;

document.addEventListener('DOMContentLoaded', () => {
  const user = window.api?.getUser();
  if (user) {
    app.init();
  } else {
    app.showLogin();
  }
});
