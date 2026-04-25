// script.js

(function () {
    'use strict';

    // --- Constants ---

    var CORRECT_HASH = '59e104390f2d7fb29a81a4ea634114e1ff2b70b9518813f4530a4e2e9cefb04e';

    var KEY = {
        SESSION: 'shiori_auth',
        ENTER:   'Enter',
        ESCAPE:  'Escape'
    };

    var CLASS = {
        HIDDEN:          'hidden',
        IS_OPEN:         'is-open',
        IS_ACTIVE:       'is-active',
        IS_VISIBLE:      'is-visible',
        IS_SCROLLED:     'is-scrolled',
        OVERFLOW_HIDDEN: 'overflow-hidden',
        TRANSLATE_FULL:  'translate-x-full'
    };

    var SEL = {
        PASSWORD_GATE:       '#password-gate',
        PASSWORD_INPUT:      '#password-input',
        PASSWORD_SUBMIT:     '#password-submit',
        PASSWORD_ERROR:      '#password-error',
        MAIN_CONTENT:        '#main-content',
        MAIN_FOOTER:         '#main-footer',
        MAIN_HEADER:         '#main-header',
        MOBILE_MENU:         '#mobile-menu',
        MENU_BTN:            '#menu-btn',
        DESKTOP_NAV:         '#desktop-nav',
        MOBILE_NAV:          '#mobile-nav',
        GALLERY_MODAL:       '#gallery-modal',
        GALLERY_MODAL_IMG:   '#gallery-modal-image',
        GALLERY_MODAL_CLOSE: '#gallery-modal-close',
        GALLERY_MODAL_PREV:  '#gallery-modal-prev',
        GALLERY_MODAL_NEXT:  '#gallery-modal-next',
        PARALLAX_BG:         '.parallax-bg',
        FADE_IN:             '.fade-in-up',
        SECTION:             '.section[id]',
        GALLERY_ITEM:        '.gallery-item',
        GALLERY_IMAGE:       '.gallery-image',
        NAV_LINK:            '.nav-link',
        MOBILE_NAV_LINK:     '.mobile-nav-link',
        ERROR_HIDDEN_IMG:    '.js-img-error-hidden',
        LAZY_IMG:            'img[data-src]',
        LAZY_IFRAME:         'iframe[data-src]'
    };

    var NAV_ITEMS = [
        { href: '#greeting', label: 'ご挨拶' },
        { href: '#timeline', label: '当日の流れ' },
        { href: '#seating',  label: '席次表' },
        { href: '#family',   label: '家族紹介' },
        { href: '#profile',  label: '新郎新婦' },
        { href: '#menu',     label: 'お品書き' },
        { href: '#access',   label: '会場案内' },
        { href: '#gallery',  label: '思い出' },
        { href: '#message',  label: 'メッセージ' },
        { href: '#schedule', label: '入籍日' },
        { href: '#photo',    label: '記念写真' }
    ];

    // --- DOM Cache ---

    var DOM = {};

    function cacheDOM() {
        DOM.gate       = document.querySelector(SEL.PASSWORD_GATE);
        DOM.input      = document.querySelector(SEL.PASSWORD_INPUT);
        DOM.submitBtn  = document.querySelector(SEL.PASSWORD_SUBMIT);
        DOM.errorMsg   = document.querySelector(SEL.PASSWORD_ERROR);
        DOM.main       = document.querySelector(SEL.MAIN_CONTENT);
        DOM.footer     = document.querySelector(SEL.MAIN_FOOTER);
        DOM.header     = document.querySelector(SEL.MAIN_HEADER);
        DOM.mobileMenu = document.querySelector(SEL.MOBILE_MENU);
        DOM.menuBtn    = document.querySelector(SEL.MENU_BTN);
        DOM.desktopNav = document.querySelector(SEL.DESKTOP_NAV);
        DOM.mobileNav  = document.querySelector(SEL.MOBILE_NAV);
        DOM.modal      = document.querySelector(SEL.GALLERY_MODAL);
        DOM.modalImage = document.querySelector(SEL.GALLERY_MODAL_IMG);
        DOM.modalClose = document.querySelector(SEL.GALLERY_MODAL_CLOSE);
        DOM.modalPrev  = document.querySelector(SEL.GALLERY_MODAL_PREV);
        DOM.modalNext  = document.querySelector(SEL.GALLERY_MODAL_NEXT);
        DOM.parallax   = document.querySelector(SEL.PARALLAX_BG);
    }

    // --- Utilities ---

    function on(el, event, fn, options) {
        el.addEventListener(event, fn, options || false);
    }

    function createObserver(callback, options) {
        return new IntersectionObserver(callback, options);
    }

    // --- State ---

    var state = {
        menuOpen:      false,
        scrollTicking: false
    };

    // --- Bootstrap ---

    document.addEventListener('DOMContentLoaded', function () {
        cacheDOM();
        PasswordGate.init(function () {
            Content.reveal();
            Nav.init();
            FamilyImages.init();
            Header.init();
            MobileMenu.init();
            Animations.init();
            Gallery.init();
        });
    });

    // --- PasswordGate ---

    var PasswordGate = {
        init: function (onSuccess) {
            if (sessionStorage.getItem(KEY.SESSION) === '1') {
                DOM.gate.classList.add(CLASS.HIDDEN);
                onSuccess();
                return;
            }
            on(DOM.submitBtn, 'click', function () { PasswordGate._attempt(onSuccess); });
            on(DOM.input, 'keydown', function (e) {
                if (e.key === KEY.ENTER) PasswordGate._attempt(onSuccess);
            });
        },

        _attempt: function (onSuccess) {
            var value = DOM.input.value;
            if (!value) return;
            hashString(value).then(function (hash) {
                if (hash === CORRECT_HASH) {
                    sessionStorage.setItem(KEY.SESSION, '1');
                    DOM.errorMsg.classList.add(CLASS.HIDDEN);
                    DOM.gate.style.transition = 'opacity 0.8s';
                    DOM.gate.style.opacity = '0';
                    setTimeout(function () {
                        DOM.gate.classList.add(CLASS.HIDDEN);
                        onSuccess();
                    }, 800);
                } else {
                    DOM.errorMsg.classList.remove(CLASS.HIDDEN);
                    DOM.input.value = '';
                    DOM.input.focus();
                }
            });
        }
    };

    function hashString(str) {
        var data = new TextEncoder().encode(str);
        return crypto.subtle.digest('SHA-256', data).then(function (buffer) {
            return Array.from(new Uint8Array(buffer))
                .map(function (b) { return b.toString(16).padStart(2, '0'); })
                .join('');
        });
    }

    // --- Content ---

    var Content = {
        reveal: function () {
            if (DOM.main)   DOM.main.classList.remove(CLASS.HIDDEN);
            if (DOM.footer) DOM.footer.classList.remove(CLASS.HIDDEN);
            document.querySelectorAll(SEL.LAZY_IMG).forEach(function (img) {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
            });
            document.querySelectorAll(SEL.LAZY_IFRAME).forEach(function (iframe) {
                iframe.src = iframe.getAttribute('data-src');
                iframe.removeAttribute('data-src');
            });
        }
    };

    // --- Nav ---

    var Nav = {
        init: function () {
            this._build();
            this._initHighlight();
            this._initSmoothScroll();
        },

        _build: function () {
            var desktopHtml = NAV_ITEMS.map(function (item) {
                return '<a href="' + item.href + '" class="nav-link">' + item.label + '</a>';
            }).join('');
            var mobileHtml = NAV_ITEMS.map(function (item) {
                return '<a href="' + item.href + '" class="mobile-nav-link">' + item.label + '</a>';
            }).join('');
            if (DOM.desktopNav) DOM.desktopNav.innerHTML = desktopHtml;
            if (DOM.mobileNav)  DOM.mobileNav.innerHTML  = mobileHtml;
        },

        _initHighlight: function () {
            var observer = createObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    var id = entry.target.id;
                    document.querySelectorAll(SEL.NAV_LINK).forEach(function (link) {
                        link.classList.toggle(CLASS.IS_ACTIVE, link.getAttribute('href') === '#' + id);
                    });
                });
            }, { rootMargin: '-20% 0px -20% 0px', threshold: 0 });

            document.querySelectorAll(SEL.SECTION).forEach(function (section) {
                observer.observe(section);
            });
        },

        _initSmoothScroll: function () {
            document.querySelectorAll(SEL.NAV_LINK).forEach(function (link) {
                on(link, 'click', function (e) {
                    e.preventDefault();
                    var target = document.querySelector(link.getAttribute('href'));
                    if (!target) return;
                    window.scrollTo({
                        top: target.offsetTop - DOM.header.offsetHeight,
                        behavior: 'smooth'
                    });
                });
            });
        }
    };

    // --- FamilyImages ---

    var FamilyImages = {
        init: function () {
            document.querySelectorAll(SEL.ERROR_HIDDEN_IMG).forEach(function (img) {
                on(img, 'error', function () {
                    img.style.visibility = 'hidden';
                });
            });
        }
    };

    // --- Header ---

    var Header = {
        init: function () {
            on(window, 'scroll', Header._onScroll, { passive: true });
        },

        _onScroll: function () {
            if (state.scrollTicking) return;
            state.scrollTicking = true;
            requestAnimationFrame(function () {
                var scrollY = window.scrollY;
                DOM.header.classList.toggle(CLASS.IS_SCROLLED, scrollY > 100);
                if (DOM.parallax) {
                    DOM.parallax.style.transform = 'translateY(' + (scrollY * 0.1) + 'px) scale(1.1)';
                }
                state.scrollTicking = false;
            });
        }
    };

    // --- MobileMenu ---

    var MobileMenu = {
        init: function () {
            on(DOM.menuBtn, 'click', function () {
                state.menuOpen ? MobileMenu.close() : MobileMenu.open();
            });
            document.querySelectorAll(SEL.MOBILE_NAV_LINK).forEach(function (link) {
                on(link, 'click', MobileMenu.close);
            });
        },

        open: function () {
            state.menuOpen = true;
            DOM.menuBtn.classList.add(CLASS.IS_OPEN);
            DOM.menuBtn.setAttribute('aria-expanded', 'true');
            DOM.menuBtn.setAttribute('aria-label', 'メニューを閉じる');
            DOM.mobileMenu.classList.remove(CLASS.TRANSLATE_FULL);
            document.body.classList.add(CLASS.OVERFLOW_HIDDEN);
        },

        close: function () {
            state.menuOpen = false;
            DOM.menuBtn.classList.remove(CLASS.IS_OPEN);
            DOM.menuBtn.setAttribute('aria-expanded', 'false');
            DOM.menuBtn.setAttribute('aria-label', 'メニューを開く');
            DOM.mobileMenu.classList.add(CLASS.TRANSLATE_FULL);
            document.body.classList.remove(CLASS.OVERFLOW_HIDDEN);
        }
    };

    // --- Animations ---

    var Animations = {
        init: function () {
            var observer = createObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add(CLASS.IS_VISIBLE);
                    observer.unobserve(entry.target);
                });
            }, { rootMargin: '-20% 0px -20% 0px', threshold: 0 });

            document.querySelectorAll(SEL.FADE_IN).forEach(function (el) {
                observer.observe(el);
            });
        }
    };

    // --- Gallery ---

    var Gallery = {
        _items:          [],
        _index:          0,
        // zoom / pan state
        _scale:          1,
        _tx:             0,
        _ty:             0,
        _naturalRect:    null,
        _naturalCenter:  null,
        // pinch tracking
        _pinchStartDist: 0,
        _pinchBaseScale: 1,
        _pinchBaseTx:    0,
        _pinchBaseTy:    0,
        _pinchMidX:      0,
        _pinchMidY:      0,
        // swipe / pan tracking
        _touchStartX:    0,
        _touchStartY:    0,
        _panBaseTx:      0,
        _panBaseTy:      0,
        _touchWasPinch:  false,
        // double-tap tracking
        _lastTapTime:    0,
        _lastTapX:       0,
        _lastTapY:       0,

        init: function () {
            this._initFallbacks();
            this._initModal();
        },

        _initFallbacks: function () {
            document.querySelectorAll(SEL.GALLERY_IMAGE).forEach(function (img) {
                on(img, 'error', function () {
                    img.style.display = 'none';
                    var fallback = img.nextElementSibling;
                    if (fallback) fallback.classList.remove(CLASS.HIDDEN);
                });
            });
        },

        _initModal: function () {
            document.querySelectorAll(SEL.GALLERY_ITEM).forEach(function (item) {
                var img = item.querySelector(SEL.GALLERY_IMAGE);
                if (!img) return;
                on(item, 'click', function () {
                    if (img.style.display === 'none') return;
                    Gallery._opener = item;
                    var section = item.closest('.section[id]');
                    var scope   = section || document;
                    Gallery._items = Array.from(scope.querySelectorAll(SEL.GALLERY_ITEM)).filter(function (i) {
                        var im = i.querySelector(SEL.GALLERY_IMAGE);
                        return im && im.style.display !== 'none';
                    });
                    Gallery._openAt(Gallery._items.indexOf(item));
                });
            });

            on(DOM.modalClose, 'click', Gallery._close);
            on(DOM.modalPrev,  'click', function () { Gallery._navigate(-1); });
            on(DOM.modalNext,  'click', function () { Gallery._navigate(1); });
            on(DOM.modal, 'click', function (e) {
                if (e.target === DOM.modal) Gallery._close();
            });
            on(document, 'keydown', function (e) {
                if (DOM.modal.classList.contains(CLASS.HIDDEN)) return;
                if (e.key === KEY.ESCAPE)   Gallery._close();
                if (e.key === 'ArrowLeft')  Gallery._navigate(-1);
                if (e.key === 'ArrowRight') Gallery._navigate(1);
            });

            // --- Touch: start ---
            // touch-action:none on .gallery-modal handles browser-level pinch/scroll,
            // so e.preventDefault() is no longer needed here → passive:true で入力レイテンシを削減
            on(DOM.modal, 'touchstart', function (e) {
                if (e.touches.length === 2) {
                    Gallery._touchWasPinch  = true;
                    Gallery._pinchStartDist = Gallery._getPinchDist(e.touches);
                    Gallery._pinchBaseScale = Gallery._scale;
                    Gallery._pinchBaseTx    = Gallery._tx;
                    Gallery._pinchBaseTy    = Gallery._ty;
                    Gallery._pinchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                    Gallery._pinchMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                } else if (e.touches.length === 1) {
                    if (!Gallery._touchWasPinch) {
                        Gallery._touchStartX = e.touches[0].clientX;
                        Gallery._touchStartY = e.touches[0].clientY;
                    }
                    Gallery._panBaseTx = Gallery._tx;
                    Gallery._panBaseTy = Gallery._ty;
                }
            }, { passive: true });

            // --- Touch: move ---
            on(DOM.modal, 'touchmove', function (e) {
                if (e.touches.length >= 2) {
                    e.preventDefault();
                    var dist     = Gallery._getPinchDist(e.touches);
                    var newScale = Math.min(Math.max(
                        Gallery._pinchBaseScale * dist / Gallery._pinchStartDist, 1), 4);
                    var ratio = newScale / Gallery._pinchBaseScale;
                    var nc    = Gallery._naturalCenter;
                    if (nc) {
                        // Keep the pinch midpoint fixed on the image
                        Gallery._tx = (Gallery._pinchMidX - nc.x) * (1 - ratio) + Gallery._pinchBaseTx * ratio;
                        Gallery._ty = (Gallery._pinchMidY - nc.y) * (1 - ratio) + Gallery._pinchBaseTy * ratio;
                    }
                    Gallery._scale = newScale;
                    Gallery._clampTranslation();
                    Gallery._applyTransform();
                } else if (e.touches.length === 1 && Gallery._scale > 1.05) {
                    // Pan while zoomed
                    e.preventDefault();
                    Gallery._tx = Gallery._panBaseTx + e.touches[0].clientX - Gallery._touchStartX;
                    Gallery._ty = Gallery._panBaseTy + e.touches[0].clientY - Gallery._touchStartY;
                    Gallery._clampTranslation();
                    Gallery._applyTransform();
                }
            }, { passive: false });

            // --- Touch: end ---
            on(DOM.modal, 'touchend', function (e) {
                // 2本指→1本指の移行: パン基点を現在位置に同期してジャンプを防ぐ
                if (e.touches.length === 1) {
                    Gallery._touchStartX = e.touches[0].clientX;
                    Gallery._touchStartY = e.touches[0].clientY;
                    Gallery._panBaseTx   = Gallery._tx;
                    Gallery._panBaseTy   = Gallery._ty;
                    return;
                }
                if (e.touches.length > 0) return;

                if (Gallery._scale < 1.05) {
                    Gallery._resetZoom();
                }
                if (Gallery._touchWasPinch || Gallery._scale > 1.05) {
                    Gallery._touchWasPinch = false;
                    return;
                }
                Gallery._touchWasPinch = false;

                var cx = e.changedTouches[0].clientX;
                var cy = e.changedTouches[0].clientY;
                var dx = cx - Gallery._touchStartX;
                var dy = cy - Gallery._touchStartY;

                // Double-tap to zoom in / out
                if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
                    var now = Date.now();
                    if (now - Gallery._lastTapTime < 300 &&
                        Math.abs(cx - Gallery._lastTapX) < 40 &&
                        Math.abs(cy - Gallery._lastTapY) < 40) {
                        Gallery._doubleTapZoom(cx, cy);
                        Gallery._lastTapTime = 0;
                        return;
                    }
                    Gallery._lastTapTime = now;
                    Gallery._lastTapX    = cx;
                    Gallery._lastTapY    = cy;
                }

                // Swipe to navigate (only when not zoomed)
                if (Math.abs(dx) < 50) return;
                Gallery._navigate(dx < 0 ? 1 : -1);
            }, { passive: true });

            on(DOM.modal, 'touchcancel', function () {
                Gallery._touchWasPinch = false;
            }, { passive: true });
        },

        // Zoom 2x at the tapped point, or snap back to 1x
        _doubleTapZoom: function (x, y) {
            var nc = Gallery._naturalCenter;
            if (!nc) return;
            if (Gallery._scale > 1.05) {
                Gallery._resetZoom();
            } else {
                var s      = 2;
                Gallery._tx    = (x - nc.x) * (1 - s);
                Gallery._ty    = (y - nc.y) * (1 - s);
                Gallery._scale = s;
                Gallery._clampTranslation();
                Gallery._applyTransform();
            }
        },

        _getPinchDist: function (touches) {
            var dx = touches[0].clientX - touches[1].clientX;
            var dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
        },

        // Apply (tx, ty, scale) to the image element
        _applyTransform: function () {
            DOM.modalImage.style.transform =
                'translate(' + Gallery._tx + 'px,' + Gallery._ty + 'px) scale(' + Gallery._scale + ')';
        },

        // Reset zoom / pan to initial state
        _resetZoom: function () {
            Gallery._scale = 1;
            Gallery._tx    = 0;
            Gallery._ty    = 0;
            DOM.modalImage.style.transform = '';
        },

        // Clamp translation so the image always covers the screen center
        _clampTranslation: function () {
            var rect = Gallery._naturalRect;
            if (!rect) return;
            var s     = Gallery._scale;
            var maxTx = rect.width  * (s - 1) / 2;
            var maxTy = rect.height * (s - 1) / 2;
            Gallery._tx = Math.min(Math.max(Gallery._tx, -maxTx), maxTx);
            Gallery._ty = Math.min(Math.max(Gallery._ty, -maxTy), maxTy);
        },

        _openAt: function (index) {
            var items = Gallery._items;
            if (!items.length) return;
            Gallery._index = Math.min(Math.max(index, 0), items.length - 1);
            var img = items[Gallery._index].querySelector(SEL.GALLERY_IMAGE);
            var src = img && img.getAttribute('src');
            if (!src) return;
            Gallery._resetZoom();
            Gallery._naturalRect   = null;
            Gallery._naturalCenter = null;
            DOM.modalImage.classList.add('is-changing');
            DOM.modalImage.onload = function () {
                Gallery._cacheNaturalRect();
                DOM.modalImage.classList.remove('is-changing');
            };
            DOM.modalImage.src = src;
            DOM.modalImage.alt = img.getAttribute('alt') || '拡大表示した写真';
            DOM.modal.classList.remove(CLASS.HIDDEN);
            DOM.modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add(CLASS.OVERFLOW_HIDDEN);
            // モーダルが visible になった後のフレームで rect をキャッシュ
            // (display:none 中に getBoundingClientRect() を呼ぶと 0 が返るため)
            requestAnimationFrame(function () {
                Gallery._cacheNaturalRect();
                if (DOM.modalImage.complete) {
                    DOM.modalImage.classList.remove('is-changing');
                }
            });
            Gallery._preload(Gallery._index);
            DOM.modalPrev.classList.toggle(CLASS.HIDDEN, Gallery._index === 0);
            DOM.modalNext.classList.toggle(CLASS.HIDDEN, Gallery._index === items.length - 1);
        },

        // Cache the natural (untransformed) rect of the modal image
        _cacheNaturalRect: function () {
            var rect = DOM.modalImage.getBoundingClientRect();
            Gallery._naturalRect   = { width: rect.width, height: rect.height };
            Gallery._naturalCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        },

        _preload: function (index) {
            var items = Gallery._items;
            [-1, 1].forEach(function (offset) {
                var i = index + offset;
                if (i < 0 || i >= items.length) return;
                var img = items[i].querySelector(SEL.GALLERY_IMAGE);
                var src = img && img.getAttribute('src');
                if (src) { (new Image()).src = src; }
            });
        },

        _navigate: function (dir) {
            var newIndex = Gallery._index + dir;
            if (newIndex < 0 || newIndex >= Gallery._items.length) return;
            Gallery._openAt(newIndex);
        },

        _close: function () {
            if (document.activeElement && DOM.modal.contains(document.activeElement)) {
                document.activeElement.blur();
            }
            DOM.modal.classList.add(CLASS.HIDDEN);
            DOM.modal.setAttribute('aria-hidden', 'true');
            if (Gallery._opener) {
                Gallery._opener.focus();
                Gallery._opener = null;
            }
            DOM.modalImage.src = '';
            Gallery._resetZoom();
            document.body.classList.remove(CLASS.OVERFLOW_HIDDEN);
        }
    };

})();