// script.js

document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById('main-header');
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

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
    const toggleMenu = () => {
        menuBtn.classList.toggle('open');
        mobileMenu.classList.toggle('translate-x-full');
        document.body.classList.toggle('overflow-hidden');
    };

    menuBtn.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));

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
});