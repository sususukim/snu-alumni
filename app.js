// 서울대 동문회 참석 신청 - 메인 앱
document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('attendanceForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  const successMessage = document.getElementById('successMessage');
  const locationEl = document.getElementById('eventLocation');
  const mapLink = document.getElementById('mapLink');
  const locationMap = document.getElementById('locationMap');

  if (!window.supabase) {
    locationEl.textContent = '설정이 필요합니다. config.js를 확인해주세요.';
    return;
  }

  // 이벤트 정보 로드 (장소)
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
      const { error } = await window.supabase
        .from('attendees')
        .insert([formData]);

      if (error) throw error;

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
      const { data: settings } = await window.supabase
        .from('event_settings')
        .select('key, value')
        .eq('key', 'location');

      const location = settings?.[0]?.value || '서울특별시 영등포구 여의도동 (상세 주소는 추후 안내)';
      locationEl.textContent = location;

      // 지도 링크 (네이버 지도 검색)
      if (location && !location.includes('추후 안내')) {
        const encodedAddr = encodeURIComponent(location);
        mapLink.href = `https://map.naver.com/v5/search/${encodedAddr}`;
        mapLink.style.display = 'inline-block';

        // 지도 미리보기 (iframe)
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
      } else if (mapLink) {
        mapLink.style.display = 'none';
      }
    } catch (err) {
      console.error('이벤트 정보 로드 실패:', err);
      locationEl.textContent = '서울특별시 영등포구 여의도동 (상세 주소는 추후 안내)';
    }
  }
});
