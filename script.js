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
        { href: '#schedule', label: '入籍日' }
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
        _items: [],
        _index: 0,
        _touchStartX: 0,
        _touchWasPinch: false,
        _pinchScale: 1,
        _pinchBaseScale: 1,
        _pinchStartDist: 0,

        init: function () {
            this._initFallbacks();
            this._initModal();
            this._initPinchZoom();
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
            Gallery._items = Array.from(document.querySelectorAll(SEL.GALLERY_ITEM)).filter(function (item) {
                var img = item.querySelector(SEL.GALLERY_IMAGE);
                return img && img.style.display !== 'none';
            });

            document.querySelectorAll(SEL.GALLERY_ITEM).forEach(function (item, i) {
                var img = item.querySelector(SEL.GALLERY_IMAGE);
                if (!img) return;
                on(item, 'click', function () {
                    if (img.style.display === 'none') return;
                    var idx = Gallery._items.indexOf(item);
                    Gallery._openAt(idx);
                });
            });
            on(DOM.modalClose, 'click', Gallery._close);
            on(DOM.modalPrev, 'click', function () { Gallery._navigate(-1); });
            on(DOM.modalNext, 'click', function () { Gallery._navigate(1); });
            on(DOM.modal, 'click', function (e) {
                if (e.target === DOM.modal) Gallery._close();
            });
            on(document, 'keydown', function (e) {
                if (DOM.modal.classList.contains(CLASS.HIDDEN)) return;
                if (e.key === KEY.ESCAPE)       Gallery._close();
                if (e.key === 'ArrowLeft')  Gallery._navigate(-1);
                if (e.key === 'ArrowRight') Gallery._navigate(1);
            });
            on(DOM.modal, 'touchstart', function (e) {
                if (e.touches.length >= 2) {
                    Gallery._touchWasPinch = true;
                    Gallery._pinchStartDist = Gallery._getPinchDist(e.touches);
                    Gallery._pinchBaseScale = Gallery._pinchScale;
                } else {
                    Gallery._touchWasPinch = false;
                    Gallery._touchStartX = e.changedTouches[0].clientX;
                }
            }, { passive: true });
            on(DOM.modal, 'touchmove', function (e) {
                if (e.touches.length < 2) return;
                e.preventDefault();
                var scale = Gallery._pinchBaseScale * (Gallery._getPinchDist(e.touches) / Gallery._pinchStartDist);
                Gallery._pinchScale = Math.min(Math.max(scale, 1), 4);
                DOM.modalImage.style.transform = 'scale(' + Gallery._pinchScale + ')';
            }, { passive: false });
            on(DOM.modal, 'touchend', function (e) {
                if (e.touches.length === 0 && Gallery._pinchScale < 1.05) {
                    Gallery._pinchScale = 1;
                    DOM.modalImage.style.transform = '';
                }
                if (Gallery._touchWasPinch || Gallery._pinchScale > 1.05) return;
                var dx = e.changedTouches[0].clientX - Gallery._touchStartX;
                if (Math.abs(dx) < 120) return;
                Gallery._navigate(dx < 0 ? 1 : -1);
            }, { passive: true });
        },

        _getPinchDist: function (touches) {
            var dx = touches[0].clientX - touches[1].clientX;
            var dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
        },

        _initPinchZoom: function () {
            var meta = document.querySelector('meta[name="viewport"]');
            Gallery._viewportOrig = meta ? meta.getAttribute('content') : null;
            Gallery._viewportMeta = meta;
        },

        _openAt: function (index) {
            var items = Gallery._items;
            if (!items.length) return;
            Gallery._index = (index + items.length) % items.length;
            var img = items[Gallery._index].querySelector(SEL.GALLERY_IMAGE);
            var src = img && img.getAttribute('src');
            if (!src) return;
            Gallery._pinchScale = 1;
            Gallery._pinchBaseScale = 1;
            DOM.modalImage.style.transform = '';
            DOM.modalImage.src = src;
            DOM.modalImage.alt = img.getAttribute('alt') || '拡大表示した写真';
            DOM.modal.classList.remove(CLASS.HIDDEN);
            DOM.modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add(CLASS.OVERFLOW_HIDDEN);
            if (Gallery._viewportMeta) {
                Gallery._viewportMeta.setAttribute('content', (Gallery._viewportOrig || '') + ', user-scalable=no');
            }
        },

        _navigate: function (dir) {
            Gallery._openAt(Gallery._index + dir);
        },

        _open: function (img) {
            var src = img.getAttribute('src');
            if (!src) return;
            DOM.modalImage.src = src;
            DOM.modalImage.alt = img.getAttribute('alt') || '拡大表示した写真';
            DOM.modal.classList.remove(CLASS.HIDDEN);
            DOM.modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add(CLASS.OVERFLOW_HIDDEN);
        },

        _close: function () {
            DOM.modal.classList.add(CLASS.HIDDEN);
            DOM.modal.setAttribute('aria-hidden', 'true');
            DOM.modalImage.src = '';
            DOM.modalImage.style.transform = '';
            Gallery._pinchScale = 1;
            document.body.classList.remove(CLASS.OVERFLOW_HIDDEN);
            if (Gallery._viewportMeta && Gallery._viewportOrig !== null) {
                Gallery._viewportMeta.setAttribute('content', Gallery._viewportOrig);
            }
        }
    };

})();