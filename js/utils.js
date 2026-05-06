// TalesUber — Shared Utilities
// Maseno, Kisumu Kenya | Founded by Finley Nyabuga

// ─── Toast System ────────────────────────────────────────────────────────────
export function toast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-text">${message}</span>`;
  container.appendChild(t);
  setTimeout(() => t.remove(), duration + 300);
}

// ─── Loader ──────────────────────────────────────────────────────────────────
export function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.4s';
    setTimeout(() => loader.remove(), 400);
  }
}

export function showLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) loader.style.display = 'flex';
}

// ─── Format Helpers ───────────────────────────────────────────────────────────
export function formatKES(amount) {
  return `KES ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'Just now';
}

// ─── Status Helpers ───────────────────────────────────────────────────────────
export function statusBadge(status) {
  const map = {
    pending:    { label: 'Pending',    cls: 'badge-pending',    dot: '🟡' },
    confirmed:  { label: 'Confirmed',  cls: 'badge-confirmed',  dot: '🔵' },
    'in-transit':{ label: 'In Transit',cls: 'badge-in-transit', dot: '🟣' },
    completed:  { label: 'Completed',  cls: 'badge-completed',  dot: '🟢' },
    cancelled:  { label: 'Cancelled',  cls: 'badge-cancelled',  dot: '🔴' },
  };
  const s = map[status] || map.pending;
  return `<span class="badge ${s.cls}">${s.dot} ${s.label}</span>`;
}

export function getStatusStep(status) {
  const steps = ['pending', 'confirmed', 'in-transit', 'completed'];
  return steps.indexOf(status);
}

// ─── Vehicle Data ─────────────────────────────────────────────────────────────
export const VEHICLES = {
  motorbike: { name: 'MotoBoda',     icon: '🏍️', seats: 1, basePrice: 50,  perKm: 15, groupEligible: false },
  'tuk-tuk': { name: 'TukTuk',       icon: '🛺', seats: 3, basePrice: 80,  perKm: 20, groupEligible: false },
  car:        { name: 'TalesRide',   icon: '🚗', seats: 4, basePrice: 150, perKm: 35, groupEligible: true  },
  suv:        { name: 'TalesX',      icon: '🚙', seats: 7, basePrice: 300, perKm: 55, groupEligible: true  },
  minibus:    { name: 'TalesShuttle',icon: '🚐', seats:14, basePrice: 500, perKm: 80, groupEligible: true  },
};

// ─── Pricing Calculator ───────────────────────────────────────────────────────
export function calculatePrice(vehicleType, distanceKm, passengerCount = 1, discountPct = 0) {
  const v = VEHICLES[vehicleType];
  if (!v) return { base: 0, total: 0, discount: 0, discounted: 0 };
  const base = v.basePrice + (v.perKm * distanceKm);
  const discountAmt = Math.round(base * (discountPct / 100));
  const total = base - discountAmt;
  return { base, discountAmt, discountPct, total, perPerson: Math.round(total / Math.max(passengerCount, 1)) };
}

// ─── Route Distance Estimator ─────────────────────────────────────────────────
export function estimateDistance(from, to) {
  // Simple hash-based estimator for demo; returns km
  const seed = (from + to).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return 5 + (seed % 45); // 5–50km range
}

// ─── Discount Engine ──────────────────────────────────────────────────────────
export function getBestDiscount(opts = {}) {
  const { isGroup, passengerCount, distanceKm, isFirstRide, hour, dayOfWeek } = opts;
  let best = { code: null, label: null, pct: 0, reason: '' };

  const check = (pct, code, label, reason) => {
    if (pct > best.pct) best = { pct, code, label, reason };
  };

  if (isFirstRide)           check(10, 'TALES10',  'New Member',     'Welcome discount!');
  if (isGroup && passengerCount >= 3) check(15, 'GROUP15',  'Group Ride',     `${passengerCount} passengers`);
  if (distanceKm >= 40)      check(20, 'FAR20',    'Long Distance',   `${distanceKm}km trip`);
  if (hour < 7)              check(12, 'EARLY12',  'Early Bird',      'Booking before 7AM');
  if (dayOfWeek === 0 || dayOfWeek === 6) check(8, 'WKND8', 'Weekend Special', 'Weekend deal');

  return best;
}

// ─── Locations ────────────────────────────────────────────────────────────────
export const LOCATIONS = [
  'Maseno University Main Gate',
  'Maseno University Back Gate',
  'Maseno Market',
  'Maseno Police Station',
  'Maseno Health Centre',
  'Kisumu City Centre',
  'Kisumu Airport',
  'Kisumu Referral Hospital',
  'Kisumu Mega City Mall',
  'Kisumu Bus Terminal',
  'Kisumu Railway Station',
  'Ahero Junction',
  'Ahero Town Centre',
  'Luanda Town',
  'Luanda Market',
  'Siaya Town',
  'Bondo Town',
  'Homa Bay Town',
  'Migori Town',
  'Vihiga Town',
];

// ─── Guard: redirect if not logged in ─────────────────────────────────────────
export function requireAuth(redirectTo = '../pages/login.html') {
  // Used in dashboard pages — checks Firebase auth state
  return new Promise((resolve) => {
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js').then(({ getAuth, onAuthStateChanged }) => {
      const auth = getAuth();
      const unsub = onAuthStateChanged(auth, (user) => {
        unsub();
        if (!user) { window.location.href = redirectTo; return; }
        resolve(user);
      });
    });
  });
}
