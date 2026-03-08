document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('attendanceForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  const successMessage = document.getElementById('successMessage');

  const titleEl = document.getElementById('eventTitle');
  const datetimeEl = document.getElementById('eventDatetime');
  const locationEl = document.getElementById('eventLocation');
  const mapLink = document.getElementById('mapLink');
  const locationMap = document.getElementById('locationMap');

  const defaults = {
    eventTitle: '동문회 참석 신청',
    eventDatetime: '2026년 5월 12일',
    placeName: '여의도',
    mapUrl: '',
  };

  await loadEventInfo();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    const formData = {
      attendance: document.querySelector('input[name="attendance"]:checked')?.value,
      student_id: document.getElementById('studentId').value.trim(),
      department: document.getElementById('department').value.trim(),
      name: document.getElementById('name').value.trim(),
    };

    if (!formData.attendance || !formData.student_id || !formData.department || !formData.name) {
      alert('모든 항목을 입력해 주세요.');
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
      return;
    }

    try {
      const res = await fetch('/api/attendees-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.status === 409) {
        alert('이미 신청하셨습니다.');
        return;
      }

      if (!res.ok) {
        const payload = await safeJson(res);
        throw new Error(payload?.error || '등록에 실패했습니다. 다시 시도해 주세요.');
      }

      alert('확인되었습니다! 감사합니다!');
      form.style.display = 'none';
      successMessage.style.display = 'block';
      form.reset();
    } catch (err) {
      console.error(err);
      alert(err.message || '등록에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  });

  async function loadEventInfo() {
    try {
      const res = await fetch('/api/event-settings', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load event settings');

      const data = await res.json();
      applyEventSettings({
        eventTitle: data?.event_title || defaults.eventTitle,
        eventDatetime: data?.event_datetime_text || defaults.eventDatetime,
        placeName: data?.place_name || defaults.placeName,
        mapUrl: data?.naver_map_url || '',
      });
    } catch (err) {
      console.error('Failed to load event info:', err);
      applyEventSettings(defaults);
    }
  }

  function applyEventSettings(settings) {
    titleEl.textContent = settings.eventTitle;
    datetimeEl.textContent = settings.eventDatetime;
    locationEl.textContent = settings.placeName;

    const mapUrl = (settings.mapUrl || '').trim();
    if (!mapUrl) {
      mapLink.style.display = 'none';
      mapLink.removeAttribute('href');
      locationMap.style.display = 'none';
      locationMap.innerHTML = '';
      return;
    }

    mapLink.href = mapUrl;
    mapLink.style.display = 'inline-block';

    locationMap.innerHTML = `
      <iframe
        src="${escapeHtmlAttr(mapUrl)}"
        width="100%"
        height="200"
        frameborder="0"
        allowfullscreen
        style="border-radius: 12px; border: none; margin-top: 8px;"
        loading="lazy"
      ></iframe>
    `;
    locationMap.style.display = 'block';
  }
});

function escapeHtmlAttr(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
