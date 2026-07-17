// <!-- ======================================================= -->
// <!-- 3. 자바스크립트 (오류 추적용 안내창 장착) -->
// <!-- ======================================================= -->
document.addEventListener('DOMContentLoaded', function() {
const bgm = document.getElementById('my-bgm');
const musicBtn = document.getElementById('music-toggle-btn');
const musicIcon = document.getElementById('music-btn-icon');

if (!bgm || !musicBtn) return;

// 💡 음악을 재생하는 핵심 함수
function playBGM() {
    if (bgm.paused) {
    bgm.play()
        .then(() => {
        // 재생 성공 시 버튼 애니메이션 및 아이콘 변경
        musicBtn.classList.add('playing');
        musicIcon.textContent = '⏸️';
        // 재생에 성공했으므로 더 이상 스크롤/터치를 감지할 필요가 없어서 이벤트를 제거합니다.
        removeUnlockEvents();
        })
        .catch(err => {
        console.log("재생 대기 중...", err);
        });
    }
}

// 감지 이벤트 해제 함수
function removeUnlockEvents() {
    document.removeEventListener('scroll', playBGM);
    document.removeEventListener('touchstart', playBGM);
    document.removeEventListener('click', playBGM);
}

// 1. 하객이 들어와서 스크롤을 내리거나, 화면을 만지거나, 클릭하면 즉시 음악 실행!
document.addEventListener('scroll', playBGM);
document.addEventListener('touchstart', playBGM);
document.addEventListener('click', playBGM);

// 2. 혹시나 브라우저 환경이 처음부터 자동 재생을 허용하는 상태인지 1차 시도
bgm.play()
    .then(() => {
    musicBtn.classList.add('playing');
    musicIcon.textContent = '⏸️';
    removeUnlockEvents(); // 성공 시 이벤트 해제
    })
    .catch(err => {
    // 차단되어도 경고창을 띄우지 않고, 콘솔로그만 남긴 채 1번 이벤트(스크롤)를 기다립니다.
    console.log("초기 자동재생 차단됨 -> 하객의 스크롤/터치 액션을 대기합니다.");
    });

// 🎵 우측 하단 고정 버튼을 직접 클릭했을 때 (재생/일시정지 토글)
musicBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    removeUnlockEvents(); // 사용자가 수동으로 버튼을 조작했으므로 자동 재생 감지 종료

    if (bgm.paused) {
    bgm.play();
    musicBtn.classList.add('playing');
    musicIcon.textContent = '⏸️';
    } else {
    bgm.pause();
    musicBtn.classList.remove('playing');
    musicIcon.textContent = '🎵';
    }
});
});


// 갤러리 관련
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('gallery-toggle-btn');
    // 추가 이미지들을 모두 가져옵니다.
    const extraItems = document.querySelectorAll('.gallery-item.extra-item');
    const galleryContainer = document.querySelector('.gallery-container');

    if (toggleBtn && extraItems.length > 0) {
    toggleBtn.addEventListener('click', function() {
        // 첫 번째 추가 이미지가 숨겨져 있는지 확인 (true/false)
        const isHidden = extraItems[0].classList.contains('hidden');

        // 상태에 따라 hidden 클래스를 넣었다 뺐다 토글합니다.
        extraItems.forEach(item => {
        if (isHidden) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
        });

        // 버튼 글자 바꾸기
        this.textContent = isHidden ? '접기' : '더보기';
        
        // 중요: '접기'를 눌렀을 때 화면이 붕 뜨지 않도록 갤러리 상단으로 부드럽게 올려줍니다.
        if (!isHidden && galleryContainer) {
        galleryContainer.scrollIntoView({ behavior: 'smooth' });
        }
    });
    }
});


document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("galleryModal");
    const modalImg = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".modal-close");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    let currentIndex = 0; // 현재 보고 있는 이미지의 인덱스
    let allImages = [];   // 전체 이미지 배열을 담을 변수

    // 1. 이미지 클릭 시 모달 열기
    function initGallery() {
        // 현재 갤러리 그리드 안에 있는 모든 이미지를 갱신
        allImages = Array.from(document.querySelectorAll(".gallery-grid .gallery-item img"));

        allImages.forEach((img, index) => {
            // 중복 등록 방지를 위해 기존 이벤트 제거 후 재등록 (더보기 버튼 대응용)
            img.removeEventListener("click", openModal);
            img.addEventListener("click", () => openModal(index));
        });
    }

    function openModal(index) {
        currentIndex = index;
        updateModalImage();
        modal.style.display = "flex";
        
        // 💡 모달 열릴 때 바디 스크롤 막기 (선택 사항)
        document.body.style.overflow = 'hidden'; 
    }

    // 2. 모달 이미지 업데이트 (부드러운 전환 효과)
    function updateModalImage() {
        // 이미지를 살짝 투명하게 만들었다가 소스를 바꾸고 다시 보여줌
        modalImg.style.opacity = "0.3";
        
        // 브라우저가 이미지를 비동기로 로드하는 시간을 고려하여 아주 잠시 대기
        setTimeout(() => {
            modalImg.src = allImages[currentIndex].src;
            modalImg.alt = allImages[currentIndex].alt;
            modalImg.style.opacity = "1";
        }, 100); 
    }

    // 3. 이전 / 다음 사진 이동 로직 (무한 루프)
    function showPrev() {
        currentIndex = (currentIndex === 0) ? allImages.length - 1 : currentIndex - 1;
        updateModalImage();
    }

    function showNext() {
        currentIndex = (currentIndex === allImages.length - 1) ? 0 : currentIndex + 1;
        updateModalImage();
    }

    // 버튼 클릭 이벤트 (💡 스와이프 대신 이 버튼들만 사용됩니다)
    prevBtn.addEventListener("click", (e) => { 
        e.stopPropagation(); // 모달 배경 클릭 이벤트 전파 막기
        showPrev(); 
    });
    
    nextBtn.addEventListener("click", (e) => { 
        e.stopPropagation(); // 모달 배경 클릭 이벤트 전파 막기
        showNext(); 
    });

    // 4. 키보드 방향키 이벤트 (PC 사용자 편의성 유지)
    document.addEventListener("keydown", function(e) {
        if (modal.style.display === "flex") {
            if (e.key === "ArrowLeft") showPrev();
            if (e.key === "ArrowRight") showNext();
            if (e.key === "Escape") closeModal(); // ESC로 닫기
        }
    });

    // 5. 닫기 로직
    function closeModal() {
        modal.style.display = "none";
        
        // 💡 모달 닫힐 때 바디 스크롤 원복 (선택 사항)
        document.body.style.overflow = ''; 
    }
    
    closeBtn.addEventListener("click", closeModal);
    
    modal.addEventListener("click", function(e) {
        // 배경을 클릭했을 때만 닫히도록 체크 (이미지나 버튼 클릭 시 닫힘 방지)
        if (e.target === modal) closeModal();
    });

    // 최초 실행
    initGallery();
});



// 아코디언 토글 메뉴 작동 함수
function clickToggle(panelId) {
    const panel = document.getElementById(panelId);
    const arrow = document.getElementById('arrow-' + panelId);

    if (panel.style.display === "block") {
        panel.style.display = "none";
        arrow.textContent = "▼";
    } else {
        panel.style.display = "block";
        arrow.textContent = "▲";
    }
}

// 계좌번호 클립보드 복사 함수
function copyClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("성공적으로 복사되었습니다.");
    }).catch(err => {
        alert("복사에 실패했습니다. 직접 선택하여 복사해 주세요.");
    });
}

// 디데이 카운트다운 기능 추가 (예식일 기준 실시간 계산)
function calculateDDay() {
// 💡 1. 결혼식 날짜 설정 (아이폰 등 모바일 오류 방지를 위해 숫자로 세팅)
// 자바스크립트는 월(Month)이 0부터 시작하므로, 7월은 '6'으로 적어야 정확합니다.
const weddingDate = new Date(2026, 11-1, 14); 
weddingDate.setHours(0, 0, 0, 0); // 시, 분, 초, 밀리초를 0으로 초기화

// 💡 2. 현재 날짜 설정 및 시간 초기화
const now = new Date();
now.setHours(0, 0, 0, 0); // 현재 시간도 똑같이 0시 0분 0초로 강제 고정

// 3. 두 날짜의 차이 계산 (밀리초 단위)
const distance = weddingDate.getTime() - now.getTime();

// 4. 정확히 하루 단위(24시간)로 나누어 떨어지게 계산
const days = Math.floor(distance / (1000 * 60 * 60 * 24));
const element = document.getElementById("dday-counter");

if (!element) return; // 카운터 태그가 없을 때를 위한 예외 처리

// 5. 조건에 따른 텍스트 출력
if (days > 0) {
    element.textContent = "D-" + days;
} else if (days === 0) {
    element.textContent = "D-Day";
} else {
    element.textContent = "감사합니다~";
}
}

// 페이지 로드 시 디데이 계산 실행
calculateDDay();