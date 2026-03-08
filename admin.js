document.addEventListener('DOMContentLoaded', async () => {
  const adminSections = document.querySelectorAll('.admin-section');
  const attendeesBody = document.getElementById('attendees-body');
  const settingsForm = document.getElementById('location-form');
  const datetimeInput = document.getElementById('datetime-input');
  const placeInput = document.getElementById('location-input');
  const mapUrlInput = document.getElementById('map-url-input');
  const statusEl = document.getElementById('location-status');

  adminSections.forEach((section) => {
    section.style.display = 'none';
  });

  let token = localStorage.getItem('adminToken') || '';
  if (!token) {
    token = await loginFlow();
  }

  if (!token) {
    attendeesBody.innerHTML = '<tr><td colspan="5" class="error">관리자 인증에 실패했습니다.</td></tr>';
    return;
  }

  localStorage.setItem('adminToken', token);
  adminSections.forEach((section) => {
    section.style.display = 'block';
  });

  const settings = await fetchSettings(token);
  if (settings) {
    datetimeInput.value = settings.event_datetime_text || '';
    placeInput.value = settings.place_name || '';
    mapUrlInput.value = settings.naver_map_url || '';
  }

  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      event_datetime_text: datetimeInput.value.trim(),
      place_name: placeInput.value.trim(),
      naver_map_url: mapUrlInput.value.trim(),
    };

    if (!payload.event_datetime_text || !payload.place_name) {
      statusEl.textContent = '행사 일시와 장소명은 필수입니다.';
      statusEl.className = 'status-msg error';
      return;
    }

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
        localStorage.removeItem('adminToken');
        statusEl.textContent = '세션이 만료되었습니다. 새로고침 후 다시 로그인해 주세요.';
        statusEl.className = 'status-msg error';
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

  await fetchAttendees(token);

  async function loginFlow() {
    const password = window.prompt('관리자 비밀번호를 입력하세요');
    if (!password) return '';

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) return '';
      const data = await res.json();
      return data?.token || '';
    } catch (err) {
      console.error(err);
      return '';
    }
  }

  async function fetchSettings(authToken) {
    try {
      const res = await fetch('/api/admin/location', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        return null;
      }

      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async function fetchAttendees(authToken) {
    try {
      const res = await fetch('/api/admin/attendees', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        attendeesBody.innerHTML = '<tr><td colspan="5" class="error">세션이 만료되었습니다. 새로고침 후 다시 로그인해 주세요.</td></tr>';
        return;
      }

      if (!res.ok) {
        attendeesBody.innerHTML = '<tr><td colspan="5" class="error">목록을 불러오지 못했습니다.</td></tr>';
        return;
      }

      const payload = await res.json();
      const attendees = payload?.attendees || [];

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
          <td>${new Date(a.created_at).toLocaleDateString('ko-KR')}</td>
        </tr>
      `).join('');
    } catch (err) {
      console.error(err);
      attendeesBody.innerHTML = '<tr><td colspan="5" class="error">목록을 불러오지 못했습니다.</td></tr>';
    }
  }
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
