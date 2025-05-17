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
    openPopupBtn.addEventListener('click', function() {
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
    addByIdBtn.addEventListener('click', function() {
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
    addConfirmBtn.addEventListener('click', function() {
        const val = friendInput.value.trim();
        if (val !== '') {
            addFriend(val);
            closeAddPopup();
        } else {
            friendInput.focus();
        }
    });

    // 엔터키로도 확인
    friendInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            addConfirmBtn.click();
        }
    });

    // "카카오톡으로 친구 초대" 클릭
    inviteKakaoBtn.addEventListener('click', function() {
        // 실제 카카오톡 공유 링크 (예시: 카카오톡 채널 추가/공유)
        window.open('https://www.kakao.com/talk', '_blank');
        closePopup();
    });

    // 친구 추가 함수
    function addFriend(name) {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.innerHTML = `
            <div class="item-left">
                <button class="star-btn" aria-label="즐겨찾기 추가">
                    <span class="material-symbols-outlined star" aria-hidden="true">star_border</span>
                </button>
                <span class="item-text">${name}</span>
            </div>
            <span class="material-symbols-outlined chevron">chevron_right</span>
        `;
        // 별 버튼 이벤트
        const starBtn = li.querySelector('.star-btn');
        setStarToggleEvent(starBtn);
        // 리스트 클릭 이벤트
        setListItemClickEvent(li);
        itemList.appendChild(li);
    }

    // 검색 기능
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        document.querySelectorAll('.list-item').forEach(item => {
            const text = item.querySelector('.item-text').textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // 별 버튼 토글 기능 (즐겨찾기)
    function setStarToggleEvent(starBtn) {
        starBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const starIcon = this.querySelector('.star');
            this.classList.toggle('favorited');
            if (this.classList.contains('favorited')) {
                starIcon.textContent = 'star';
                this.setAttribute('aria-label', '즐겨찾기 해제');
            } else {
                starIcon.textContent = 'star_border';
                this.setAttribute('aria-label', '즐겨찾기 추가');
            }
        });
    }

    // 리스트 아이템 클릭 시 해당 친구의 일정 페이지로 이동
    function setListItemClickEvent(listItem) {
        listItem.addEventListener('click', function(e) {
            const friendName = this.querySelector('.item-text').textContent;
            window.location.href = `schedule.html?name=${encodeURIComponent(friendName)}`;
        });
    }

    // 프로필 수정 버튼 클릭시 profile.html로 이동
    const editButton = document.querySelector('.edit-button');
    editButton.addEventListener('click', function() {
        window.location.href = 'profile.html';
    });

    // 초기에는 친구 목록이 비어 있음
});
