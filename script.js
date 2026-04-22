// script.js

document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById('main-header');
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryModal = document.getElementById('gallery-modal');
    const galleryModalImage = document.getElementById('gallery-modal-image');
    const galleryModalClose = document.getElementById('gallery-modal-close');

    // --- 1. スクロール時のヘッダー変化 ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // パララックス風演出 (Hero背景を微動)
        const parallax = document.querySelector('.parallax-bg');
        if (parallax) {
            let offset = window.scrollY * 0.1;
            parallax.style.transform = `translateY(${offset}px) scale(1.1)`;
        }
    });

    // --- 2. ハンバーガーメニュー開閉 ---
    const openMenu = () => {
        menuBtn.classList.add('open');
        mobileMenu.classList.remove('translate-x-full');
        document.body.classList.add('overflow-hidden');
    };

    const closeMenu = () => {
        menuBtn.classList.remove('open');
        mobileMenu.classList.add('translate-x-full');
        document.body.classList.remove('overflow-hidden');
    };

    const toggleMenu = () => {
        if (menuBtn.classList.contains('open')) {
            closeMenu();
            return;
        }

        openMenu();
    };

    menuBtn.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

    // --- 3. Intersection Observer (フェードイン & ナビハイライト) ---
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -20% 0px', // 画面中央付近で見えたら発火
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // フェードインアニメーション
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // ナビハイライトの更新
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, observerOptions);

    // 各セクションとフェード要素を監視
    sections.forEach(section => sectionObserver.observe(section));
    document.querySelectorAll('.fade-in-up').forEach(el => sectionObserver.observe(el));

    // --- 4. スムーズスクロール (補正) ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            const headerHeight = header.offsetHeight;
            const offsetPosition = targetElement.offsetTop - headerHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        });
    });

    // --- 5. ギャラリー画像の全画面表示 ---
    const closeGalleryModal = () => {
        galleryModal.classList.add('hidden');
        galleryModal.setAttribute('aria-hidden', 'true');
        galleryModalImage.src = '';
        document.body.classList.remove('overflow-hidden');
    };

    const openGalleryModal = (image) => {
        if (!image || !image.getAttribute('src')) {
            return;
        }

        galleryModalImage.src = image.getAttribute('src');
        galleryModalImage.alt = image.getAttribute('alt') || '拡大表示した写真';
        galleryModal.classList.remove('hidden');
        galleryModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('overflow-hidden');
    };

    galleryItems.forEach(item => {
        const image = item.querySelector('.gallery-image');

        if (!image) {
            return;
        }

        item.addEventListener('click', () => {
            if (image.style.display === 'none') {
                return;
            }

            openGalleryModal(image);
        });
    });

    galleryModalClose.addEventListener('click', closeGalleryModal);
    galleryModal.addEventListener('click', (event) => {
        if (event.target === galleryModal) {
            closeGalleryModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !galleryModal.classList.contains('hidden')) {
            closeGalleryModal();
        }
    });
});