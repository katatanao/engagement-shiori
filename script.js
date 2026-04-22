// script.js

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        initGalleryImageFallbacks();
        initScrollHeader();
        initMobileMenu();
        initFadeInObserver();
        initNavHighlightObserver();
        initSmoothScroll();
        initGalleryModal();
    }

    // --- Gallery image error fallback (replaces inline onerror) ---

    function initGalleryImageFallbacks() {
        document.querySelectorAll('.gallery-image').forEach(function (img) {
            img.addEventListener('error', function () {
                this.style.display = 'none';
                var fallback = this.nextElementSibling;
                if (fallback) {
                    fallback.classList.remove('hidden');
                }
            });
        });
    }

    // --- Scroll-based header style & parallax ---

    function initScrollHeader() {
        var header = document.getElementById('main-header');
        var parallax = document.querySelector('.parallax-bg');
        var ticking = false;

        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(function () {
                    var scrollY = window.scrollY;

                    header.classList.toggle('scrolled', scrollY > 100);

                    if (parallax) {
                        parallax.style.transform = 'translateY(' + (scrollY * 0.1) + 'px) scale(1.1)';
                    }

                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // --- Mobile hamburger menu ---

    function initMobileMenu() {
        var menuBtn = document.getElementById('menu-btn');
        var mobileMenu = document.getElementById('mobile-menu');
        var isOpen = false;

        function open() {
            isOpen = true;
            menuBtn.classList.add('open');
            menuBtn.setAttribute('aria-expanded', 'true');
            menuBtn.setAttribute('aria-label', 'メニューを閉じる');
            mobileMenu.classList.remove('translate-x-full');
            document.body.classList.add('overflow-hidden');
        }

        function close() {
            isOpen = false;
            menuBtn.classList.remove('open');
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.setAttribute('aria-label', 'メニューを開く');
            mobileMenu.classList.add('translate-x-full');
            document.body.classList.remove('overflow-hidden');
        }

        menuBtn.addEventListener('click', function () {
            isOpen ? close() : open();
        });

        mobileMenu.querySelectorAll('.mobile-nav-link').forEach(function (link) {
            link.addEventListener('click', close);
        });
    }

    // --- Fade-in animation observer ---

    function initFadeInObserver() {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '-20% 0px -20% 0px',
            threshold: 0
        });

        document.querySelectorAll('.fade-in-up').forEach(function (el) {
            observer.observe(el);
        });
    }

    // --- Active nav link highlight observer ---

    function initNavHighlightObserver() {
        var navLinks = document.querySelectorAll('.nav-link');

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.getAttribute('id');
                    navLinks.forEach(function (link) {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, {
            rootMargin: '-20% 0px -20% 0px',
            threshold: 0
        });

        document.querySelectorAll('.section[id]').forEach(function (section) {
            observer.observe(section);
        });
    }

    // --- Smooth scroll for desktop nav ---

    function initSmoothScroll() {
        var header = document.getElementById('main-header');

        document.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                var target = document.querySelector(this.getAttribute('href'));
                if (!target) return;

                window.scrollTo({
                    top: target.offsetTop - header.offsetHeight,
                    behavior: 'smooth'
                });
            });
        });
    }

    // --- Gallery lightbox modal ---

    function initGalleryModal() {
        var modal = document.getElementById('gallery-modal');
        var modalImage = document.getElementById('gallery-modal-image');
        var closeBtn = document.getElementById('gallery-modal-close');

        function openModal(img) {
            var src = img.getAttribute('src');
            if (!src) return;

            modalImage.src = src;
            modalImage.alt = img.getAttribute('alt') || '拡大表示した写真';
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('overflow-hidden');
        }

        function closeModal() {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
            modalImage.src = '';
            document.body.classList.remove('overflow-hidden');
        }

        document.querySelectorAll('.gallery-item').forEach(function (item) {
            var img = item.querySelector('.gallery-image');
            if (!img) return;

            item.addEventListener('click', function () {
                if (img.style.display === 'none') return;
                openModal(img);
            });
        });

        closeBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }
})();