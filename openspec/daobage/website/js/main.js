/**
 * Wilderness Brother - Personal Website
 * 荒野刀疤哥个人网站脚本
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize lazy loading for gallery images
    initLazyLoading();

    // Initialize smooth scroll for anchor links
    initSmoothScroll();

    // Initialize scroll animations
    initScrollAnimations();
});

/**
 * Lazy Loading for Gallery Images
 * 使用 IntersectionObserver 实现图片懒加载
 */
function initLazyLoading() {
    const placeholders = document.querySelectorAll('.gallery-placeholder');

    if (!('IntersectionObserver' in window)) {
        // Fallback for browsers without IntersectionObserver
        placeholders.forEach(loadImage);
        return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadImage(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });

    placeholders.forEach(placeholder => {
        imageObserver.observe(placeholder);
    });
}

/**
 * Load image into placeholder
 */
function loadImage(placeholder) {
    const src = placeholder.getAttribute('data-src');
    if (!src) return;

    const img = document.createElement('img');
    img.alt = placeholder.textContent.trim();
    img.loading = 'lazy';

    // Fade in effect when image loads
    img.addEventListener('load', function() {
        placeholder.innerHTML = '';
        placeholder.appendChild(img);
        placeholder.classList.add('loaded');
    });

    img.addEventListener('error', function() {
        // Keep placeholder text if image fails to load
        console.warn('Failed to load image:', src);
    });

    img.src = src;
}

/**
 * Smooth Scroll for Anchor Links
 * 为锚点链接添加平滑滚动
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Scroll Animations
 * 滚动时触发动画效果
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.philosophy-card, .gallery-item, .about-content'
    );

    if (!('IntersectionObserver' in window)) {
        // Fallback: show all elements
        animatedElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }

    // Add initial styles for animation
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add staggered delay based on element index
                const index = Array.from(animatedElements).indexOf(entry.target);
                const delay = index % 3 * 100; // 0, 100, 200ms stagger

                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, delay);

                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    });

    animatedElements.forEach(el => {
        animationObserver.observe(el);
    });
}

/**
 * Navigation Active State on Scroll
 * 滚动时更新导航状态
 */
function initNavigationHighlight() {
    const sections = document.querySelectorAll('section[id]');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Update active nav state if navigation exists
                const id = entry.target.getAttribute('id');
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    });

    sections.forEach(section => {
        navObserver.observe(section);
    });
}

// Initialize navigation highlight if nav exists
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.nav-link')) {
        initNavigationHighlight();
    }
});
