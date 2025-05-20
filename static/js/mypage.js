document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const itemList = document.getElementById('friend-list');

    // 팝업 관련 요소
    const popup = document.getElementById('popup');
    const popupOverlay = document.getElementById('popup-overlay');
    const openPopupBtn = document.getElementById('open-popup');
    const addByIdBtn = document.getElementById('add-by-id');
    const inviteKakaoBtn = document.getElementById('invite-kakao');

    // 아이디로 친구 추가 팝업 관련
    const popupAdd = document.getElementById('popup-add');
    const popupAddOverlay = document.getElementById('popup-add-overlay');
    const addCancelBtn = document.getElementById('add-cancel');
    const addConfirmBtn = document.getElementById('add-confirm');
    const friendInput = document.getElementById('friend-input');

    // 팝업 열기
    openPopupBtn.addEventListener('click', () => {
        popup.style.display = 'block';
        popupOverlay.style.display = 'block';
    });

    // 팝업 닫기 (오버레이 클릭시)
    popupOverlay.addEventListener('click', closePopup);
    function closePopup() {
        popup.style.display = 'none';
        popupOverlay.style.display = 'none';
    }

    // "아이디로 친구 추가" 클릭
    addByIdBtn.addEventListener('click', () => {
        closePopup();
        friendInput.value = '';
        popupAdd.style.display = 'block';
        popupAddOverlay.style.display = 'block';
        friendInput.focus();
    });

    // 아이디로 친구 추가 팝업 닫기
    addCancelBtn.addEventListener('click', closeAddPopup);
    popupAddOverlay.addEventListener('click', closeAddPopup);
    function closeAddPopup() {
        popupAdd.style.display = 'none';
        popupAddOverlay.style.display = 'none';
    }

    // 아이디로 친구 추가 팝업 - 확인 버튼
    addConfirmBtn.addEventListener('click', () => {
        const val = friendInput.value.trim();
        if (val) {
            addFriend(val);
            closeAddPopup();
        } else {
            friendInput.focus();
        }
    });

    // 엔터키로도 확인
    friendInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            addConfirmBtn.click();
        }
    });

    // "카카오톡으로 친구 초대" 클릭
    inviteKakaoBtn.addEventListener('click', () => {
        window.open('https://www.kakao.com/talk', '_blank');
        closePopup();
    });

    // 친구 추가 함수
    function addFriend(name) {
        // 중복 체크 (옵션)
        const exists = [...itemList.children].some(li => li.querySelector('.item-text').textContent === name);
        if (exists) return alert('이미 친구 목록에 있습니다.');

        const li = document.createElement('li');
        li.className = 'list-item';
        li.innerHTML = `
            <div class="item-left">
                <button class="star-btn" aria-label="즐겨찾기 추가">
                    <span class="material-symbols-outlined star" aria-hidden="true">star_border</span>
                </button>
                <span class="item-text"></span>
            </div>
            <span class="material-symbols-outlined chevron">chevron_right</span>
        `;
        li.querySelector('.item-text').textContent = name;

        // 별 버튼 이벤트
        const starBtn = li.querySelector('.star-btn');
        setStarToggleEvent(starBtn);

        // 리스트 클릭 이벤트
        setListItemClickEvent(li);

        itemList.appendChild(li);
    }

    // 검색 기능
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            [...itemList.children].forEach(item => {
                const text = item.querySelector('.item-text').textContent.toLowerCase();
                item.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    // 별 버튼 토글 기능 (즐겨찾기)
    function setStarToggleEvent(starBtn) {
        starBtn.addEventListener('click', e => {
            e.stopPropagation();
            const starIcon = starBtn.querySelector('.star');
            starBtn.classList.toggle('favorited');
            if (starBtn.classList.contains('favorited')) {
                starIcon.textContent = 'star';
                starBtn.setAttribute('aria-label', '즐겨찾기 해제');
            } else {
                starIcon.textContent = 'star_border';
                starBtn.setAttribute('aria-label', '즐겨찾기 추가');
            }
        });
    }

    // 리스트 아이템 클릭 시 친구 일정 페이지로 이동
    function setListItemClickEvent(listItem) {
        listItem.addEventListener('click', () => {
            const friendName = listItem.querySelector('.item-text').textContent;
            window.location.href = `schedule.html?name=${encodeURIComponent(friendName)}`;
        });
    }

    // 프로필 수정 버튼 클릭시 profile.html로 이동
    const editButton = document.querySelector('.edit-button');
    if (editButton) {
        editButton.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }

    // 초기에는 친구 목록이 비어 있음
});
