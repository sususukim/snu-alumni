document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('attendanceForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  const successMessage = document.getElementById('successMessage');
  const locationEl = document.getElementById('eventLocation');
  const mapLink = document.getElementById('mapLink');
  const locationMap = document.getElementById('locationMap');
  const defaultLocation = '여의도';

  let sb;
  try {
    const cfgRes = await fetch('/api/public-config', { cache: 'no-store' });
    if (!cfgRes.ok) throw new Error('public config load failed');
    const cfg = await cfgRes.json();

    if (!window.supabase?.createClient || !cfg?.url || !cfg?.anonKey) {
      throw new Error('invalid public config');
    }

    sb = window.supabase.createClient(cfg.url, cfg.anonKey);
  } catch (err) {
    console.error(err);
    setLocationFallback();
    return;
  }

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
      const { data: existingRows, error: checkError } = await sb
        .from('attendees')
        .select('id')
        .eq('student_id', formData.student_id)
        .eq('department', formData.department)
        .eq('name', formData.name)
        .limit(1);

      if (checkError) throw checkError;

      if (existingRows && existingRows.length > 0) {
        alert('이미 신청하셨습니다.');
        return;
      }

      const { error } = await sb.from('attendees').insert([formData]);
      if (error) throw error;

      alert('반영되었습니다. 감사합니다!');
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
      const { data: settings } = await sb
        .from('event_settings')
        .select('key, value')
        .eq('key', 'location');

      const location = settings?.[0]?.value?.trim();
      if (!location) {
        setLocationFallback();
        return;
      }

      locationEl.textContent = location;

      const encodedAddr = encodeURIComponent(location);
      if (mapLink) {
        mapLink.href = `https://map.naver.com/v5/search/${encodedAddr}`;
        mapLink.style.display = 'inline-block';
      }

      if (locationMap) {
        locationMap.innerHTML = `
          <iframe
            src="https://map.naver.com/v5/search/${encodedAddr}"
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
    } catch (err) {
      console.error('Failed to load event info:', err);
      setLocationFallback();
    }
  }

  function setLocationFallback() {
    locationEl.textContent = defaultLocation;

    if (mapLink) {
      mapLink.style.display = 'none';
      mapLink.removeAttribute('href');
    }

    if (locationMap) {
      locationMap.style.display = 'none';
      locationMap.innerHTML = '';
    }
  }
});
