document.addEventListener('DOMContentLoaded', async () => {
  const loginSection = document.getElementById('admin-login-section');
  const loginForm = document.getElementById('admin-login-form');
  const loginStatus = document.getElementById('admin-login-status');
  const passwordInput = document.getElementById('admin-password');

  const adminContent = document.getElementById('admin-content');
  const attendeesBody = document.getElementById('attendees-body');
  const settingsForm = document.getElementById('location-form');
  const titleInput = document.getElementById('title-input');
  const datetimeInput = document.getElementById('datetime-input');
  const placeInput = document.getElementById('location-input');
  const mapUrlInput = document.getElementById('map-url-input');
  const statusEl = document.getElementById('location-status');
  const logoutBtn = document.getElementById('admin-logout-btn');

  let token = localStorage.getItem('adminToken') || '';

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = passwordInput.value;
    if (!password) return;

    loginStatus.textContent = '로그인 중...';
    loginStatus.className = 'status-msg';

    const newToken = await login(password);
    if (!newToken) {
      loginStatus.textContent = '비밀번호가 올바르지 않거나 환경변수 설정이 누락되었습니다.';
      loginStatus.className = 'status-msg error';
      return;
    }

    token = newToken;
    localStorage.setItem('adminToken', token);
    passwordInput.value = '';

    await bootstrapAdmin(true);
  });

  logoutBtn.addEventListener('click', () => {
    clearSession('로그아웃되었습니다.');
  });

  await bootstrapAdmin(false);

  async function bootstrapAdmin(fromLogin) {
    if (!token) {
      showLogin(fromLogin ? '다시 로그인해 주세요.' : '');
      return;
    }

    const settings = await fetchSettings(token);
    if (!settings) {
      clearSession('세션이 만료되었거나 인증에 실패했습니다. 다시 로그인해 주세요.');
      return;
    }

    titleInput.value = settings.event_title || '';
    datetimeInput.value = settings.event_datetime_text || '';
    placeInput.value = settings.place_name || '';
    mapUrlInput.value = settings.naver_map_url || '';

    showAdmin();
    await fetchAttendees(token);
  }

  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      event_title: titleInput.value.trim(),
      event_datetime_text: datetimeInput.value.trim(),
      place_name: placeInput.value.trim(),
      naver_map_url: mapUrlInput.value.trim(),
    };

    if (!payload.event_datetime_text || !payload.place_name) {
      statusEl.textContent = '행사 일시와 장소명은 필수입니다.';
      statusEl.className = 'status-msg error';
      return;
    }

    statusEl.textContent = '저장 중...';
    statusEl.className = 'status-msg';

    try {
      const res = await fetch('/api/admin/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        clearSession('세션이 만료되었습니다. 다시 로그인해 주세요.');
        return;
      }

      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.error || '설정 저장 실패');
      }

      statusEl.textContent = '행사 정보가 저장되었습니다.';
      statusEl.className = 'status-msg success';
    } catch (err) {
      statusEl.textContent = err.message || '설정 저장 실패';
      statusEl.className = 'status-msg error';
    }
  });

  async function login(password) {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) return '';
      const data = await res.json();
      return data?.token || '';
    } catch {
      return '';
    }
  }

  async function fetchSettings(authToken) {
    try {
      const res = await fetch('/api/admin/location', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.status === 401) return null;
      if (!res.ok) return null;

      const data = await res.json();
      return data?.ok ? data : null;
    } catch {
      return null;
    }
  }

  async function fetchAttendees(authToken) {
    attendeesBody.innerHTML = '<tr><td colspan="5" class="loading">로딩 중...</td></tr>';

    try {
      const res = await fetch('/api/admin/attendees', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.status === 401) {
        clearSession('세션이 만료되었습니다. 다시 로그인해 주세요.');
        return;
      }

      if (!res.ok) {
        attendeesBody.innerHTML = '<tr><td colspan="5" class="error">목록을 불러오지 못했습니다.</td></tr>';
        return;
      }

      const payload = await res.json();
      const attendees = Array.isArray(payload?.attendees) ? payload.attendees : [];

      if (!attendees.length) {
        attendeesBody.innerHTML = '<tr><td colspan="5" class="empty">등록된 참석자가 없습니다.</td></tr>';
        return;
      }

      attendeesBody.innerHTML = attendees.map((a) => `
        <tr>
          <td>${escapeHtml(a.name)}</td>
          <td>${escapeHtml(a.student_id)}</td>
          <td>${escapeHtml(a.department)}</td>
          <td><span class="badge badge-${a.attendance === '참석' ? 'attend' : a.attendance === '불참' ? 'not-attend' : 'pending'}">${escapeHtml(a.attendance)}</span></td>
          <td>${escapeHtml(formatDate(a.created_at))}</td>
        </tr>
      `).join('');
    } catch {
      attendeesBody.innerHTML = '<tr><td colspan="5" class="error">목록을 불러오지 못했습니다.</td></tr>';
    }
  }

  function showLogin(message) {
    adminContent.style.display = 'none';
    loginSection.style.display = 'block';
    loginStatus.textContent = message || '';
    loginStatus.className = message ? 'status-msg error' : 'status-msg';
  }

  function showAdmin() {
    loginSection.style.display = 'none';
    adminContent.style.display = 'block';
    loginStatus.textContent = '';
    loginStatus.className = 'status-msg';
  }

  function clearSession(message) {
    token = '';
    localStorage.removeItem('adminToken');
    showLogin(message);
  }
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

function formatDate(input) {
  if (!input) return '-';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('ko-KR');
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
