/* ==========================================================================
   구재관 ♥ 이채희  |  2026.11.14
   Wedding Invitation — script
   ========================================================================== */
(function () {
  'use strict';

  var WEDDING = new Date(2026, 10, 14, 17, 50, 0);   // 2026-11-14 17:50 (월은 0부터)
  var VENUE   = { lat: 35.8252300, lng: 128.620010, name: '호텔수성 수성스퀘어' };

  var prefersReduced = window.matchMedia &&
                       window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     0. 토스트 (alert 대체)
     ------------------------------------------------------------------------ */
  var toastEl = document.getElementById('toast');
  var toastTimer = null;

  function toast(message) {
    if (!toastEl) { return; }
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 1900);
  }

  /* ------------------------------------------------------------------------
     1. 클립보드 복사 — [data-copy] 를 가진 모든 버튼에 자동 적용
     ------------------------------------------------------------------------ */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // 구형 브라우저 / http 환경 대비 폴백
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) { return; }
    var btn = e.target.closest('[data-copy]');
    if (!btn) { return; }
    e.preventDefault();
    var label = btn.getAttribute('data-copy-label') || '복사되었습니다';
    copyText(btn.getAttribute('data-copy'))
      .then(function () { toast(label); })
      .catch(function () { toast('복사에 실패했습니다. 직접 선택해 주세요.'); });
  });

  /* ------------------------------------------------------------------------
     2. 배경음악
     ------------------------------------------------------------------------ */
  var bgm      = document.getElementById('my-bgm');
  var musicBtn = document.getElementById('music-toggle-btn');

  function startMusic() {
    if (!bgm) { return; }
    var p = bgm.play();
    if (p && typeof p.then === 'function') {
      p.then(function () {
        if (musicBtn) { musicBtn.classList.add('playing'); }
      }).catch(function () {
        // 브라우저가 막았을 뿐이므로 조용히 넘어가고 다음 제스처를 기다린다
      });
    } else if (musicBtn) {
      musicBtn.classList.add('playing');
    }
  }

  if (bgm && musicBtn) {
    musicBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (bgm.paused) {
        bgm.play().then(function () {
          musicBtn.classList.add('playing');
        }).catch(function () {
          toast('음악을 재생할 수 없습니다.');
        });
      } else {
        bgm.pause();
        musicBtn.classList.remove('playing');
      }
    });

    bgm.addEventListener('pause', function () { musicBtn.classList.remove('playing'); });
    bgm.addEventListener('play',  function () { musicBtn.classList.add('playing'); });

    // 브라우저 자동재생 정책상 첫 사용자 동작(터치/클릭/스크롤) 때 재생을 시도한다
    var once = function () {
      startMusic();
      document.removeEventListener('click', once);
      document.removeEventListener('touchstart', once);
      document.removeEventListener('scroll', once);
    };
    document.addEventListener('click', once);
    document.addEventListener('touchstart', once, { passive: true });
    document.addEventListener('scroll', once, { passive: true });
  }

  /* ------------------------------------------------------------------------
     3. 스크롤 페이드인
     ------------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) { return; }

    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------------
     4. 카운트다운 + D-Day
     ------------------------------------------------------------------------ */
  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function tickCountdown() {
    var now  = new Date();
    var diff = WEDDING.getTime() - now.getTime();

    var days, hours, mins, secs;
    if (diff > 0) {
      days  = Math.floor(diff / 86400000);
      hours = Math.floor(diff % 86400000 / 3600000);
      mins  = Math.floor(diff % 3600000 / 60000);
      secs  = Math.floor(diff % 60000 / 1000);
    } else {
      days = hours = mins = secs = 0;
    }

    var set = function (id, v) {
      var el = document.getElementById(id);
      if (el) { el.textContent = pad(v); }
    };
    set('cd-days', days); set('cd-hours', hours); set('cd-min', mins); set('cd-sec', secs);

    // 자정 기준 D-Day (시각과 무관하게 '며칠 남았는지'를 표기)
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var wd    = new Date(2026, 10, 14); wd.setHours(0, 0, 0, 0);
    var dday  = Math.round((wd.getTime() - today.getTime()) / 86400000);

    var badge = document.getElementById('dday-counter');
    if (badge) {
      badge.textContent = dday > 0 ? 'D-' + dday : (dday === 0 ? 'D-DAY' : 'Thank You');
    }

    var caption = document.getElementById('countdown-caption');
    if (caption) {
      if (dday > 0) {
        caption.innerHTML = '재관 &amp; 채희의 결혼식까지 <b>' + dday + '일</b> 남았습니다.';
      } else if (dday === 0) {
        caption.innerHTML = '오늘은 <b>재관 &amp; 채희</b>의 결혼식입니다.';
      } else {
        caption.innerHTML = '함께해 주신 모든 분들께 <b>감사드립니다.</b>';
      }
    }
  }

  /* ------------------------------------------------------------------------
     5. 갤러리 더보기 / 접기
     ------------------------------------------------------------------------ */
  function initGalleryToggle() {
    var btn    = document.getElementById('gallery-toggle-btn');
    var extras = document.querySelectorAll('.gallery-item.extra-item');
    var wrap   = document.getElementById('gallery-section');
    if (!btn || !extras.length) { return; }

    btn.addEventListener('click', function () {
      var opening = extras[0].classList.contains('hidden');

      extras.forEach(function (item) {
        item.classList.toggle('hidden', !opening);
        if (opening) { item.classList.add('reveal', 'is-in'); }
      });

      btn.textContent = opening ? '접기' : '사진 더보기';
      btn.classList.toggle('is-open', opening);

      refreshLightbox();

      if (!opening && wrap) {
        wrap.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      }
    });
  }

  /* ------------------------------------------------------------------------
     6. 라이트박스 (클릭 · 키보드 · 스와이프)
     ------------------------------------------------------------------------ */
  var modal   = document.getElementById('galleryModal');
  var modalImg = document.getElementById('modalImage');
  var counter = document.getElementById('modalCounter');
  var images  = [];
  var index   = 0;

  function visibleImages() {
    return Array.prototype.filter.call(
      document.querySelectorAll('.gallery-grid .gallery-item'),
      function (item) { return !item.classList.contains('hidden'); }
    ).map(function (item) { return item.querySelector('img'); })
     .filter(Boolean);
  }

  function refreshLightbox() { images = visibleImages(); }

  function render() {
    if (!images[index]) { return; }
    modalImg.classList.add('is-swapping');
    var src = images[index].src;
    var alt = images[index].alt;
    var pre = new Image();
    pre.onload = pre.onerror = function () {
      modalImg.src = src;
      modalImg.alt = alt;
      modalImg.classList.remove('is-swapping');
    };
    pre.src = src;
    if (counter) { counter.textContent = (index + 1) + ' / ' + images.length; }
  }

  function openModal(i) {
    refreshLightbox();
    index = i;
    render();
    modal.classList.add('is-open');
    requestAnimationFrame(function () { modal.classList.add('is-visible'); });
    document.body.classList.add('is-locked');
  }

  function closeModal() {
    modal.classList.remove('is-visible');
    setTimeout(function () { modal.classList.remove('is-open'); }, 300);
    document.body.classList.remove('is-locked');
  }

  function step(delta) {
    if (!images.length) { return; }
    index = (index + delta + images.length) % images.length;
    render();
  }

  function initLightbox() {
    if (!modal || !modalImg) { return; }
    refreshLightbox();

    // 이벤트 위임 — '더보기'로 추가된 사진에도 자동 적용된다
    var grid = document.querySelector('.gallery-grid');
    if (grid) {
      grid.addEventListener('click', function (e) {
        // 💡변경: 클릭된 대상이 img가 아니라 부모인 .gallery-item이 되므로, 부모를 먼저 찾고 그 안의 img를 찾습니다.
        var item = e.target.closest('.gallery-item');
        if (!item) { return; }
        
        var img = item.querySelector('img');
        if (!img) { return; }
        
        refreshLightbox();
        var i = images.indexOf(img);
        if (i > -1) { openModal(i); }
      });
    }

    modal.querySelector('.prev-btn').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    modal.querySelector('.next-btn').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
    modal.querySelector('.modal-close').addEventListener('click', function (e) { e.stopPropagation(); closeModal(); });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) { closeModal(); }
    });

    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('is-open')) { return; }
      if (e.key === 'ArrowLeft')  { step(-1); }
      if (e.key === 'ArrowRight') { step(1); }
      if (e.key === 'Escape')     { closeModal(); }
    });

    // 스와이프
    var startX = 0, startY = 0, tracking = false;
    modal.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { tracking = false; return; }
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });

    modal.addEventListener('touchend', function (e) {
      if (!tracking) { return; }
      tracking = false;
      var t  = e.changedTouches[0];
      var dx = t.clientX - startX;
      var dy = t.clientY - startY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        step(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     7. 계좌 아코디언
     ------------------------------------------------------------------------ */
  function initAccordion() {
    document.querySelectorAll('.toggle-menu-btn[data-panel]').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('data-panel'));
      if (!panel) { return; }

      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';

        if (open) {
          panel.style.maxHeight = '0px';
          panel.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          panel.classList.add('is-open');
          panel.style.maxHeight = (panel.scrollHeight + 24) + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // 폰트 로딩 등으로 높이가 변할 수 있어 열려 있는 패널은 재계산
    window.addEventListener('resize', function () {
      document.querySelectorAll('.toggle-panel.is-open').forEach(function (panel) {
        panel.style.maxHeight = (panel.scrollHeight + 24) + 'px';
      });
    });
  }

  /* ------------------------------------------------------------------------
     8. 링크 공유
     ------------------------------------------------------------------------ */
  function initShare() {
    var btn = document.getElementById('share-btn');
    if (!btn) { return; }
    btn.addEventListener('click', function () {
      var url = location.href;
      if (navigator.share) {
        navigator.share({
          title: '구재관 ♥ 이채희 결혼식에 초대합니다',
          text: '2026.11.14 (토) 오후 5시 50분 · 호텔수성 수성스퀘어 아이비홀',
          url: url
        }).catch(function () { /* 사용자가 취소한 경우 */ });
        return;
      }
      copyText(url)
        .then(function () { toast('청첩장 링크가 복사되었습니다'); })
        .catch(function () { toast('복사에 실패했습니다.'); });
    });
  }

  /* ------------------------------------------------------------------------
     9. 네이버 지도 (스크립트 미로드 시에도 페이지가 죽지 않도록 방어)
     ------------------------------------------------------------------------ */
  function initMap() {
    var mapEl = document.getElementById('map');
    var goBtn = document.getElementById('goWeddingHall');
    if (!mapEl) { return; }

    if (typeof naver === 'undefined' || !naver.maps) {
      mapEl.innerHTML =
        '<div style="height:300px;display:flex;flex-direction:column;gap:6px;' +
        'align-items:center;justify-content:center;color:#8d8578;font-size:13px;">' +
        '<span style="font-size:20px;">📍</span>' + VENUE.name +
        '<span style="font-size:12px;color:#b6ada0;">대구광역시 수성구 용학로 92-4</span></div>';
      if (goBtn) { goBtn.style.display = 'none'; }
      return;
    }

    var center = new naver.maps.LatLng(VENUE.lat, VENUE.lng);

    var map = new naver.maps.Map(mapEl, {
      center: center,
      zoom: 16,
      minZoom: 7,
      zoomAnimation: true, // 부드러운 줌 전환 애니메이션 활성화
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT,
        style: naver.maps.ZoomControlStyle.SMALL
      },
      scaleControl: false,
      logoControl: false,
      mapDataControl: false
    });

    var marker = new naver.maps.Marker({ position: center, map: map });

    var infoWindow = new naver.maps.InfoWindow({
      borderWidth: 0,
      disableAnchor: false,
      backgroundColor: 'transparent',
      pixelOffset: new naver.maps.Point(0, -10),
      content:
        '<div style="padding:9px 15px;border-radius:20px;background:#fffefc;' +
        'box-shadow:0 4px 14px rgba(60,46,34,.2);font-family:\'Noto Sans KR\',sans-serif;' +
        'font-size:12.5px;font-weight:500;color:#1b1917;letter-spacing:-.01em;white-space:nowrap;">' +
        '📍 ' + VENUE.name + '</div>'
    });

    infoWindow.open(map, marker);
    naver.maps.Event.addListener(marker, 'click', function () {
      infoWindow.open(map, marker);
    });

    if (goBtn) {
      goBtn.addEventListener('click', function () {
        map.morph(center, 16, { duration: 500, easing: 'easeOutCubic'});
        naver.maps.Event.once(map, 'idle', function () {
          infoWindow.open(map, marker);
        });
      });
    }
  }


  function preventDownload() {
      // 이미지 우클릭 및 모바일 롱클릭 메뉴 방지
      document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
          e.preventDefault();
        }
      }, false);

      // 이미지 드래그 방지
      document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG') {
          e.preventDefault();
        }
      }, false);
    }



  /* ------------------------------------------------------------------------
     실행
     ------------------------------------------------------------------------ */
  function boot() {
    initReveal();
    initGalleryToggle();
    initLightbox();
    initAccordion();
    initShare();
    initMap();

    preventDownload()
    
    tickCountdown();
    setInterval(tickCountdown, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
