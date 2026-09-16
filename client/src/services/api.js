// Helper for API calls with JWT token

const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('cashback_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('cashback_token', token);
  } else {
    localStorage.removeItem('cashback_token');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, set Content-Type JSON
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Đã có lỗi xảy ra');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const VIETNAM_BANKS = [
  { code: 'VCB', name: 'Vietcombank', shortName: 'Vietcombank', bin: '970436' },
  { code: 'TCB', name: 'Techcombank', shortName: 'Techcombank', bin: '970407' },
  { code: 'MB', name: 'MBBank', shortName: 'MBBank', bin: '970422' },
  { code: 'ACB', name: 'ACB', shortName: 'ACB', bin: '970416' },
  { code: 'BIDV', name: 'BIDV', shortName: 'BIDV', bin: '970418' },
  { code: 'CTG', name: 'VietinBank', shortName: 'VietinBank', bin: '970415' },
  { code: 'VPB', name: 'VPBank', shortName: 'VPBank', bin: '970432' },
  { code: 'TPB', name: 'TPBank', shortName: 'TPBank', bin: '970423' },
  { code: 'STB', name: 'Sacombank', shortName: 'Sacombank', bin: '970403' },
  { code: 'VIB', name: 'VIB', shortName: 'VIB', bin: '970441' },
  { code: 'HDB', name: 'HDBank', shortName: 'HDBank', bin: '970437' },
  { code: 'SHB', name: 'SHB', shortName: 'SHB', bin: '970443' },
  { code: 'MSB', name: 'MSB', shortName: 'MSB', bin: '970426' },
  { code: 'OCB', name: 'OCB', shortName: 'OCB', bin: '970448' },
  { code: 'VBA', name: 'Agribank', shortName: 'Agribank', bin: '970405' },
  { code: 'CAKE', name: 'CAKE by VPBank', shortName: 'Cake', bin: '546034' },
  { code: 'TIMO', name: 'Timo by BVBank', shortName: 'Timo', bin: '963388' }
];

export function formatVND(amount) {
  return (amount || 0).toLocaleString('vi-VN') + ' đ';
}

export function formatDate(dateString) {
  if (!dateString) return '---';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
