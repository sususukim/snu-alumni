// 관리자 페이지 - 장소 설정 및 참석자 목록
document.addEventListener('DOMContentLoaded', async () => {
  const locationForm = document.getElementById('location-form');
  const locationInput = document.getElementById('location-input');
  const locationStatus = document.getElementById('location-status');
  const attendeesBody = document.getElementById('attendees-body');

  if (!window.supabase) {
    attendeesBody.innerHTML = '<tr><td colspan="5" class="error">config.js에 Supabase 설정이 필요합니다.</td></tr>';
    return;
  }

  // 현재 장소 로드
  const { data: locData } = await window.supabase
    .from('event_settings')
    .select('value')
    .eq('key', 'location')
    .single();
  if (locData) locationInput.value = locData.value || '';

  // 장소 저장
  locationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const addr = locationInput.value.trim();
    if (!addr) return;

    try {
      const { error } = await window.supabase
        .from('event_settings')
        .upsert([{ key: 'location', value: addr }], { onConflict: 'key' });

      if (error) throw error;
      locationStatus.textContent = '장소가 저장되었습니다.';
      locationStatus.className = 'status-msg success';
    } catch (err) {
      locationStatus.textContent = err.message || '저장 실패';
      locationStatus.className = 'status-msg error';
    }
  });

  // 참석자 목록 로드
  const { data: attendees, error } = await window.supabase
    .from('attendees')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    attendeesBody.innerHTML = `<tr><td colspan="5" class="error">목록을 불러올 수 없습니다.</td></tr>`;
    return;
  }

  if (!attendees?.length) {
    attendeesBody.innerHTML = `<tr><td colspan="5" class="empty">등록된 참석자가 없습니다.</td></tr>`;
    return;
  }

  attendeesBody.innerHTML = attendees.map(a => `
    <tr>
      <td>${escapeHtml(a.name)}</td>
      <td>${escapeHtml(a.student_id)}</td>
      <td>${escapeHtml(a.department)}</td>
      <td><span class="badge badge-${a.attendance === '참석' ? 'attend' : a.attendance === '불참' ? 'not-attend' : 'pending'}">${escapeHtml(a.attendance)}</span></td>
      <td>${new Date(a.created_at).toLocaleDateString('ko-KR')}</td>
    </tr>
  `).join('');
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}
