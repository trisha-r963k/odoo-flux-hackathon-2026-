// Brightloop Design System - Core Components, SVG Icons & Modal/Toast Engine

const icons = {
  zap: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCircle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  alert: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  close: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  lock: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  mail: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  eye: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  refresh: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  fileText: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  creditCard: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  user: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  building: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="22.01"/><line x1="15" y1="22" x2="15" y2="22.01"/><line x1="9" y1="18" x2="9" y2="18.01"/><line x1="15" y1="18" x2="15" y2="18.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/></svg>`,
  plus: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  printer: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
  arrowRight: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  shield: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
};

const components = {
  icons,

  renderHeader(user, activeTab = 'overview') {
    const roleBadgeClass = user?.role === 'admin'
      ? 'badge-confirmed'
      : user?.role === 'staff'
      ? 'badge-quotation'
      : 'badge-active';

    return `
      <header class="app-navbar">
        <div class="nav-left">
          <div class="brand-badge">
            <span class="brand-letter">B</span>
          </div>
          <div class="brand-info">
            <div class="brand-title">Brightloop Software</div>
            <div class="brand-subtitle">Subscription &amp; Recurring Billing</div>
          </div>

          <nav class="nav-links">
            <button class="nav-item ${activeTab === 'overview' ? 'active' : ''}" onclick="app.switchTab('overview')">
              Overview
            </button>
            <button class="nav-item ${activeTab === 'subscriptions' ? 'active' : ''}" onclick="app.switchTab('subscriptions')">
              Subscriptions
            </button>
            <button class="nav-item ${activeTab === 'invoices' ? 'active' : ''}" onclick="app.switchTab('invoices')">
              Invoices
            </button>
            ${user?.role !== 'customer' ? `
              <button class="nav-item ${activeTab === 'catalog' ? 'active' : ''}" onclick="app.switchTab('catalog')">
                Catalog &amp; Plans
              </button>
            ` : ''}
          </nav>
        </div>

        <div class="nav-right">
          <div class="user-chip">
            <div class="user-text">
              <span class="user-name">${user?.name || 'User'}</span>
              <span class="badge ${roleBadgeClass} user-role">${user?.role || 'user'}</span>
            </div>
          </div>
          <button class="btn-secondary btn-sm" onclick="app.logout()" title="Sign out of system">
            Sign Out
          </button>
        </div>
      </header>
    `;
  },

  // Modal Dialog System (replaces raw browser alert & confirm)
  modal: {
    show({ title, subtitle = '', bodyHtml = '', footerHtml = '', size = 'md' }) {
      this.close(); // Close any existing modal first

      const modalRoot = document.getElementById('modal-root') || document.body;
      const sizeClass = size === 'lg' ? 'modal-lg' : size === 'sm' ? 'modal-sm' : 'modal-md';

      const wrapper = document.createElement('div');
      wrapper.id = 'active-modal-backdrop';
      wrapper.className = 'modal-backdrop';
      wrapper.innerHTML = `
        <div class="modal-dialog ${sizeClass}" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">${title}</h3>
              ${subtitle ? `<p class="modal-subtitle">${subtitle}</p>` : ''}
            </div>
            <button type="button" class="modal-close-btn" onclick="components.modal.close()" aria-label="Close dialog">
              ${icons.close}
            </button>
          </div>
          <div class="modal-body">
            ${bodyHtml}
          </div>
          ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
        </div>
      `;

      // Backdrop click closes modal
      wrapper.addEventListener('click', (e) => {
        if (e.target === wrapper) components.modal.close();
      });

      // Escape key closes modal
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          components.modal.close();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);

      modalRoot.appendChild(wrapper);
      // Trigger animation frame
      requestAnimationFrame(() => wrapper.classList.add('visible'));
    },

    close() {
      const active = document.getElementById('active-modal-backdrop');
      if (active) {
        active.classList.remove('visible');
        setTimeout(() => active.remove(), 160);
      }
    },

    confirm({ title, message, confirmText = 'Confirm', confirmClass = 'btn-primary', onConfirm }) {
      this.show({
        title,
        subtitle: 'Please review before proceeding',
        size: 'sm',
        bodyHtml: `<p class="confirm-message">${message}</p>`,
        footerHtml: `
          <button class="btn-secondary" onclick="components.modal.close()">Cancel</button>
          <button class="${confirmClass}" id="confirm-modal-ok-btn">${confirmText}</button>
        `
      });

      const okBtn = document.getElementById('confirm-modal-ok-btn');
      if (okBtn) {
        okBtn.addEventListener('click', () => {
          components.modal.close();
          if (typeof onConfirm === 'function') onConfirm();
        });
      }
    }
  },

  // Toast Notification System
  toast: {
    show(message, type = 'info', duration = 4000) {
      let toastRoot = document.getElementById('toast-root');
      if (!toastRoot) {
        toastRoot = document.createElement('div');
        toastRoot.id = 'toast-root';
        toastRoot.className = 'toast-container';
        document.body.appendChild(toastRoot);
      }

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      const icon = type === 'success' ? icons.checkCircle : type === 'error' ? icons.alert : icons.info;

      toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close-btn" onclick="this.parentElement.remove()">${icons.close}</button>
      `;

      toastRoot.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('visible'));

      setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 250);
      }, duration);
    }
  }
};

window.icons = icons;
window.components = components;
