// UI Component Helpers for Brightloop Subscription Engine

const components = {
  renderHeader(user) {
    return `
      <header style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 14px 28px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #9333ea, #714b67); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800;">B</div>
          <div>
            <h2 style="font-size: 16px; font-weight: 700; margin: 0; color: #1e293b;">Brightloop ERP</h2>
            <span style="font-size: 11px; color: #64748b;">Subscription & Recurring Billing</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="text-align: right;">
            <div style="font-size: 13px; font-weight: 600; color: #1e293b;">${user?.name || 'User'}</div>
            <span class="badge ${user?.role === 'admin' ? 'badge-confirmed' : user?.role === 'staff' ? 'badge-quotation' : 'badge-active'}" style="font-size: 10px; text-transform: uppercase;">${user?.role || 'User'}</span>
          </div>
          <button onclick="app.logout()" style="padding: 6px 12px; border: 1px solid #e2e8f0; background: #fff; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; color: #64748b;">
            Sign Out
          </button>
        </div>
      </header>
    `;
  }
};

window.components = components;
