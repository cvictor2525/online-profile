/* ====================
   HEADER 與 FOOTER 模板
   負責為子頁面注入共用的 Header 與 Footer
   ==================== */

const headerHTML = `
<header id="header">
    <div class="header-inner">
        <h1 class="logo">
            <a href="../../index.html">
                <img src="../../assets/home/Logo.png" alt="HUNG-LING CHEN">
            </a>
        </h1>
        <nav class="nav">
            <ul class="nav-list">
                <li><a href="../../index.html#about" class="nav-link">ABOUT</a></li>
                <li><a href="../../index.html#achievements" class="nav-link">ACHIEVEMENTS</a></li>
                <li><a href="../../index.html#opinion" class="nav-link">OPINION</a></li>
                <li><a href="../../index.html#contact" class="nav-link">CONTACT</a></li>
            </ul>
        </nav>
        <button class="hamburger" aria-label="Toggle menu" aria-expanded="false">
            <span class="hamburger-line hamburger-line-vertical"></span>
            <span class="hamburger-line hamburger-line-horizontal"></span>
        </button>
    </div>
    <nav class="mobile-menu">
        <ul class="mobile-menu-list">
            <li class="mobile-menu-item"><a href="../../index.html#about" class="mobile-menu-link">ABOUT</a></li>
            <li class="mobile-menu-item"><a href="../../index.html#achievements" class="mobile-menu-link">ACHIEVEMENTS</a></li>
            <li class="mobile-menu-item"><a href="../../index.html#opinion" class="mobile-menu-link">OPINION</a></li>
            <li class="mobile-menu-item"><a href="../../index.html#contact" class="mobile-menu-link">CONTACT</a></li>
        </ul>
    </nav>
</header>`;

const footerHTML = `
<footer id="contact">
    <div class="footer-inner">
        <div class="footer-left">
            <h3 class="footer-header">CONTACT</h3>
            <p>hunglingchenlynch@gmail.com</p>
            <p>+886 911 571 052</p>
            <p>Taipei, Taiwan</p>
        </div>
        <div class="footer-right">
            <p class="footer-copyright">
                &copy; 2026 Hung-Ling Chen. All Rights Reserved.<br>
                Designed &amp; Developed with &#129391;&#127846;
            </p>
        </div>
    </div>
</footer>`;

/**
 * 為子頁面注入共用 Header 與 Footer
 */
function injectHeaderAndFooter() {
    const isProjectPage = document.querySelector('.project-detail') !== null;
    if (isProjectPage) {
        if (!document.getElementById('header')) {
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
        }
        if (!document.getElementById('contact')) {
            document.body.insertAdjacentHTML('beforeend', footerHTML);
        }
        /* initDOMCache();      */
        /* initMobileMenu();    */
        /* initSmoothScroll();  */

        // 初始化 Scroll Reveal 效果
        initScrollRevealStandalone();
    }
}

injectHeaderAndFooter();

// ==================== 設定常數 ====================

/**
 * 全域設定物件 - 集中管理所有可調整的設定值
 */
const CONFIG = {
    // 捲動目標設定
    SCROLL_TARGETS: {
        about: {
            selector: '#about',
            description: 'INFO / About 區塊'
        },
        achievements: {
            selector: '#achievements .ach-title-container',
            description: 'ACHIEVEMENTS 區塊標題容器'
        },
        opinion: {
            selector: '#opinion .opinion-grid-bg',
            description: 'OPINION 區塊頂部背景'
        },
        contact: {
            selector: '#contact',
            description: 'CONTACT / Footer 區塊'
        }
    },

    // 時間設定（單位：毫秒）
    TIMING: {
        VIEW_TRANSITION_DELAY: 150,     // 切換頁面後的等待時間，確保 DOM 完成渲染
        ERROR_DISPLAY_DURATION: 3000,   // 錯誤訊息顯示時間
        RESIZE_DEBOUNCE_DELAY: 250      // 視窗調整大小的防抖延遲
    },

    // 響應式斷點設定
    BREAKPOINTS: {
        MOBILE: 768  // 與 CSS @media (max-width: 768px) 保持一致
    },

    // DOM 選擇器集中管理
    SELECTORS: {
        header: '#header',
        homeView: '#home-view',
        detailView: '#detail-view',
        hamburger: '.hamburger',
        mobileMenu: '.mobile-menu',
        mobileMenuLinks: '.mobile-menu-link',
        navLinks: '.nav-link',
        logoLink: '.logo a',
        spaLinks: '.spa-trigger',
        backButtons: '.btn-home, .btn-back'
    }
};

/**
 * DOM 快取物件 - 儲存常用的 DOM 元素參照，避免重複查詢
 */
const DOM = {
    header: null,
    homeView: null,
    detailView: null,
    hamburger: null,
    mobileMenu: null
};

/**
 * 全域狀態管理
 */
const STATE = {
    isDetailView: false,
    isMobileMenuOpen: false,
    isBackNavigating: false,
    isProjectLoading: false
};

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
    initDOMCache();
    initMobileMenu();
    initSmoothScroll();
    initSPARouter();
    initChaffleEffect();
    initHistoryHandler();

    // 若為專案子頁面，由模板注入 Header 後重新初始化互動功能
    const isProjectPage = document.querySelector('.project-detail') !== null;
    if (isProjectPage) {
        initMobileMenu();
        initSmoothScroll();
    }
});

/**
 * 初始化 DOM 快取
 */
function initDOMCache() {
    DOM.header = document.querySelector(CONFIG.SELECTORS.header);
    DOM.homeView = document.querySelector(CONFIG.SELECTORS.homeView);
    DOM.detailView = document.querySelector(CONFIG.SELECTORS.detailView);
    DOM.hamburger = document.querySelector(CONFIG.SELECTORS.hamburger);
    DOM.mobileMenu = document.querySelector(CONFIG.SELECTORS.mobileMenu);
}

// ==================== 工具函式 ====================

/**
 * 取得 Header 高度（像素）
 * @returns {number} Header 高度
 */
function getHeaderHeight() {
    if (!DOM.header) return 0;

    // 使用實際渲染後的元素高度
    return DOM.header.offsetHeight;
}

/**
 * 判斷目前是否為行動裝置視窗寬度
 * @returns {boolean}
 */
function isMobile() {
    return window.innerWidth <= CONFIG.BREAKPOINTS.MOBILE;
}

/**
 * 防抖函式 - 避免事件在短時間內重複觸發
 * @param {Function} func - 要防抖的函式
 * @param {number} wait - 等待時間（ms）
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 捲動至指定位置
 * @param {number} top - 目標捲動位置（像素）
 * @param {boolean} instant - 是否立即跳轉（true = 無動畫）
 */
function scrollToPosition(top, instant = false) {
    if (!instant) {
        window.scrollTo({ top, behavior: 'smooth' });
        return;
    }

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlBehavior = html.style.scrollBehavior;
    const prevBodyBehavior = body ? body.style.scrollBehavior : '';

    html.style.scrollBehavior = 'auto';
    if (body) {
        body.style.scrollBehavior = 'auto';
    }
    window.scrollTo({ top, behavior: 'auto' });
    html.scrollTop = top;
    if (body) {
        body.scrollTop = top;
    }

    html.style.scrollBehavior = prevHtmlBehavior;
    if (body) {
        body.style.scrollBehavior = prevBodyBehavior;
    }
}

// ==================== 行動選單處理 ====================

/**
 * 初始化行動選單事件
 */
function initMobileMenu() {
    // 防護：確認必要元素存在
    if (!DOM.hamburger || !DOM.mobileMenu) {
        console.warn('Mobile menu elements not found');
        return;
    }

    // 漢堡按鈕點擊事件
    DOM.hamburger.addEventListener('click', toggleMobileMenu);

    // 點擊選單連結時關閉選單
    const mobileMenuLinks = document.querySelectorAll(CONFIG.SELECTORS.mobileMenuLinks);
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // 調整視窗大小時，若切換為桌面版則關閉選單
    window.addEventListener('resize', debounce(() => {
        if (!isMobile()) {
            closeMobileMenu();
        }
    }, CONFIG.TIMING.RESIZE_DEBOUNCE_DELAY));
}

/**
 * 切換行動選單開關狀態
 */
function toggleMobileMenu() {
    STATE.isMobileMenuOpen = !STATE.isMobileMenuOpen;

    DOM.hamburger.classList.toggle('active', STATE.isMobileMenuOpen);
    DOM.mobileMenu.classList.toggle('active', STATE.isMobileMenuOpen);
    DOM.hamburger.setAttribute('aria-expanded', STATE.isMobileMenuOpen);

    // 鎖定背景捲動
    if (STATE.isMobileMenuOpen) {
        const scrollY = window.scrollY;
        document.body.style.top = `-${scrollY}px`;
        document.body.classList.add('menu-open');
    } else {
        _unlockBodyScroll();
    }
}

/**
 * 關閉行動選單
 */
function closeMobileMenu() {
    STATE.isMobileMenuOpen = false;

    DOM.hamburger.classList.remove('active');
    DOM.mobileMenu.classList.remove('active');
    DOM.hamburger.setAttribute('aria-expanded', 'false');

    _unlockBodyScroll();
}

/**
 * 解除頁面捲動鎖定，並還原至原始位置
 */
function _unlockBodyScroll() {
    const scrollY = parseInt(document.body.style.top || '0') * -1;
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, scrollY);
    document.documentElement.style.scrollBehavior = '';
}

// ==================== 平滑捲動 ====================

/**
 * 初始化導覽列平滑捲動事件
 */
function initSmoothScroll() {
    const navLinks = document.querySelectorAll(CONFIG.SELECTORS.navLinks);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // 若為專案子頁面，讓瀏覽器預設行為處理跨頁導覽（如 /#about）
            const isProjectPage = document.querySelector('.project-detail') !== null;
            if (isProjectPage) {
                return;
            }

            e.preventDefault();
            const targetId = href.replace(/.*#/, '');
            scrollToSection(targetId);
        });
    });

    // Logo 連結 - 點擊後返回頂部
    const logoLink = document.querySelector(CONFIG.SELECTORS.logoLink);
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {

            // 若為專案子頁面，讓瀏覽器預設行為處理跨頁導覽
            const isProjectPage = document.querySelector('.project-detail') !== null;
            if (isProjectPage) {
                return;
            }

            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ==================== 區塊捲動計算 ====================

/**
 * 計算指定區塊的捲動目標位置（扣除 Header 高度）
 * @param {string} sectionId - 區塊 ID
 * @returns {number|null} 捲動位置（像素），若找不到目標則回傳 null
 */
function calculateScrollPosition(sectionId) {
    // 取得對應設定
    const targetConfig = CONFIG.SCROLL_TARGETS[sectionId];

    if (!targetConfig) {
        console.warn(`Unknown section ID: ${sectionId}`);
        return null;
    }

    // 查詢目標元素
    const targetElement = document.querySelector(targetConfig.selector);

    if (!targetElement) {
        console.error(`Target element not found: ${targetConfig.selector}`);
        return null;
    }

    // 計算扣除 Header 高度後的最終捲動位置
    const headerHeight = getHeaderHeight();
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

    return offsetPosition;
}

/**
 * 計算指定專案卡片的捲動目標位置
 * @param {string} projectId - 專案 ID
 * @returns {number|null} 捲動位置（像素），若找不到目標則回傳 null
 */
function calculateProjectScrollPosition(projectId) {
    const projectElement = document.getElementById(`project-${projectId}`);

    if (!projectElement) {
        console.warn(`Project element not found: project-${projectId}`);
        return null;
    }

    // 計算扣除 Header 高度後的最終捲動位置
    const headerHeight = getHeaderHeight();
    const elementPosition = projectElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

    return offsetPosition;
}

/**
 * 捲動至指定區塊
 * @param {string} sectionId - 區塊 ID
 * @param {boolean} instant - 是否立即跳轉（true = 無動畫，false = 平滑捲動）
 */
function scrollToSection(sectionId, instant = false) {
    const offsetPosition = calculateScrollPosition(sectionId);

    if (offsetPosition === null) {
        // 若找不到目標，捲動至頂部
        scrollToPosition(0, instant);
        return;
    }

    scrollToPosition(offsetPosition, instant);
}

// ==================== SPA 路由 ====================

/**
 * 初始化 SPA 路由系統
 */
function initSPARouter() {
    // 防護：確認必要元素存在
    if (!DOM.homeView || !DOM.detailView) {
        console.warn('SPA Router: Required elements not found');
        return;
    }

    // 1. 初始化專案卡片連結（spa-trigger）
    initProjectLinks();

    // 2. 初始化 Header 導覽連結（Logo + 選單）
    initHeaderNavigation();

    // 3. 監聽瀏覽器上一頁 / 下一頁事件
    window.addEventListener('popstate', handlePopState);
}

/**
 * 初始化所有專案連結（具有 spa-trigger 類別的元素）
 */
function initProjectLinks() {
    const spaLinks = document.querySelectorAll(CONFIG.SELECTORS.spaLinks);

    spaLinks.forEach(link => {
        link.addEventListener('click', handleProjectClick);
    });
}

/**
 * 處理專案卡片點擊事件
 */
function handleProjectClick(e) {
    if (STATE.isDetailView || STATE.isProjectLoading) {
        e.preventDefault();
        return;
    }

    e.preventDefault();
    const pageUrl = this.getAttribute('data-spa-link');
    const projectId = this.getAttribute('data-project-id');

    if (pageUrl) {
        // 儲存來源專案 ID 至 sessionStorage（供返回時捲動定位使用）
        if (projectId) {
            sessionStorage.setItem('sourceProjectId', projectId);
        }

        loadPage(pageUrl);
    }
}

/**
 * 初始化 Header 所有導覽連結事件（Logo、桌面選單、行動選單）
 */
function initHeaderNavigation() {
    const logoLink = document.querySelector(CONFIG.SELECTORS.logoLink);
    const navLinks = document.querySelectorAll(CONFIG.SELECTORS.navLinks);
    const mobileLinks = document.querySelectorAll(CONFIG.SELECTORS.mobileMenuLinks);

    // Logo 連結
    if (logoLink) {
        logoLink.addEventListener('click', handleHeaderClick);
    }

    // 桌面導覽連結
    navLinks.forEach(link => {
        link.addEventListener('click', handleHeaderClick);
    });

    // 行動選單連結
    mobileLinks.forEach(link => {
        link.addEventListener('click', handleHeaderClick);
    });
}

/**
 * 處理 Header 導覽點擊（統一處理主頁與詳細頁兩種狀態）
 */
function handleHeaderClick(e) {
    const href = this.getAttribute('href');

    if (STATE.isDetailView) {
        // 在詳細頁：攔截並統一處理
        e.preventDefault();

        // 返回主頁（不帶捲動）
        goBackToHome();

        // 執行區塊捲動
        if (href && href.startsWith('#') && href !== '#') {
            const targetId = href.substring(1);

            // 等待下一幀動畫後執行捲動
            requestAnimationFrame(() => {
                scrollToSection(targetId, true);
            });
        }
    } else {
        // 在主頁：執行平滑捲動（不觸發跨頁導覽）
        if (href && href.startsWith('#') && href !== '#') {
            e.preventDefault();
            const targetId = href.substring(1);
            scrollToSection(targetId, false); // 平滑捲動
        }
    }
}

/**
 * 載入並渲染專案頁面（SPA 方式）
 * @param {string} url - 要載入的頁面 URL
 */
async function loadPage(url) {
    if (STATE.isProjectLoading) {
        return;
    }
    STATE.isProjectLoading = true;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyContent = doc.body.innerHTML.replace(/src="\.\.\/\.\.\//g, 'src="').replace(/href="\.\.\/\.\.\//g, 'href="');

        STATE.isDetailView = true;
        STATE.isBackNavigating = false;
        document.body.classList.add('detail-view-active');
        DOM.homeView.style.display = 'none';
        DOM.detailView.innerHTML = bodyContent;
        DOM.detailView.style.display = 'block';

        scrollToPosition(0, true);
        requestAnimationFrame(() => {
            scrollToPosition(0, true);
        });
        setTimeout(() => {
            if (STATE.isDetailView) {
                scrollToPosition(0, true);
            }
        }, 120);

        history.pushState({ page: url, view: 'detail' }, '', `?page=${encodeURIComponent(url)}`);

        initBackButton();
        if (!DOM.detailView.querySelector('#contact')) {
            DOM.detailView.insertAdjacentHTML('beforeend', footerHTML);
        }

        // 初始化 Scroll Reveal 效果
        initScrollReveal();

    } catch (error) {
        console.error('Error loading page:', error);
        showError('Failed to load project page. Please try again.');
    } finally {
        STATE.isProjectLoading = false;
    }
}

/**
 * 返回主頁
 * @param {boolean} skipPushState - 是否略過 pushState（瀏覽器返回時使用 true）
 */
function goBackToHome(skipPushState = false) {
    STATE.isDetailView = false;
    document.body.classList.remove('detail-view-active');
    DOM.detailView.style.display = 'none';
    DOM.detailView.innerHTML = ''; // 清空內容，釋放記憶體
    DOM.homeView.style.display = 'block';

    // 捲動至頂部
    scrollToPosition(0, true);

    // 更新 URL
    if (!skipPushState) {
        history.pushState({ page: 'home', view: 'home' }, '', window.location.pathname);
    }
}

/**
 * 初始化詳細頁的返回按鈕事件
 */
function initBackButton() {
    const backButtons = DOM.detailView.querySelectorAll(CONFIG.SELECTORS.backButtons);

    backButtons.forEach(btn => {
        // 複製節點以清除舊事件，再用 clone 替換原節點
        const newBtn = btn.cloneNode(true);
        btn.replaceWith(newBtn);

        // 重新綁定點擊事件
        newBtn.addEventListener('click', handleBackClick);
        newBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleBackClick(e);
        }, { passive: false });
    });
}

/**
 * 在詳細頁初始化 Scroll Reveal 效果
 * 使用 Intersection Observer 監測元素進入可視區域
 */
function initScrollReveal() {
    // 選取需要動畫的元素（排除已有入場動畫的 Hero / Title / Text Grid 區塊）
    const revealSelectors = [
        '.project-image-text-grid',
        '.project-double-image',
        '.project-single-image',
        '.project-text-block',
        '.project-two-column'
    ];

    // 取得所有目標元素
    const revealElements = DOM.detailView.querySelectorAll(revealSelectors.join(', '));

    if (revealElements.length === 0) return;

    // 為每個元素加入 reveal class 與遞增的過渡延遲
    revealElements.forEach((el, index) => {
        el.classList.add('reveal');
        // 每個元素相差 0.1 秒
        el.style.transitionDelay = `${index * 0.1}s`;
    });

    // 等待所有圖片載入完成後，再啟動 Intersection Observer
    const images = DOM.detailView.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
        if (img.complete) {
            return Promise.resolve();
        }
        return new Promise(resolve => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
        });
    });

    Promise.all(imagePromises).then(() => {
        // 給予短暫延遲確保 DOM 完全就緒後再啟動觀察
        setTimeout(() => {
            startRevealObserver(revealElements);
        }, 50);
    });
}

/**
 * 啟動 Reveal Observer，根據捲動方向決定是否重置動畫
 * 向下捲動：元素進入可視區後觸發動畫
 * 向上捲動：元素離開可視區頂部後重置動畫
 */
function startRevealObserver(elements) {
    let lastScrollY = window.scrollY;
    let scrollDirection = 'down';

    // 追蹤捲動方向
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
        lastScrollY = currentScrollY;
    }, { passive: true });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 進入可視區：觸發動畫
                entry.target.classList.add('revealed');
            } else {
                // 離開可視區：僅在向上捲動時重置，向下捲動保持已觸發狀態
                if (scrollDirection === 'up') {
                    // 向上捲動，元素已離開畫面頂部：重置動畫
                    entry.target.classList.remove('revealed');
                }
                // 向下捲動，元素已離開畫面底部：保持已觸發狀態
            }
        });
    }, {
        threshold: 0.01,
        rootMargin: '0px 0px -100px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

/**
 * 獨立版本的 Scroll Reveal（供直接以子頁面 URL 開啟時使用）
 * 不依賴 DOM.detailView，改使用 .project-detail 容器
 */
function initScrollRevealStandalone() {
    const revealSelectors = [
        '.project-image-text-grid',
        '.project-double-image',
        '.project-single-image',
        '.project-text-block',
        '.project-two-column'
    ];

    const container = document.querySelector('.project-detail');
    if (!container) return;

    const revealElements = container.querySelectorAll(revealSelectors.join(', '));
    if (revealElements.length === 0) return;

    revealElements.forEach((el, index) => {
        el.classList.add('reveal');
        el.style.transitionDelay = `${index * 0.1}s`;
    });

    const images = container.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
        if (img.complete) {
            return Promise.resolve();
        }
        return new Promise(resolve => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
        });
    });

    Promise.all(imagePromises).then(() => {
        setTimeout(() => {
            startRevealObserver(revealElements);
        }, 50);
    });
}

/**
 * 處理返回按鈕點擊事件
 */
function handleBackClick(e) {
    e.preventDefault();
    if (STATE.isBackNavigating) {
        return;
    }
    STATE.isBackNavigating = true;

    // 返回主頁（捲動至頂部）
    goBackToHome();

    // 讀取來源專案 ID
    const sourceProjectId = sessionStorage.getItem('sourceProjectId');
    const releaseBackLock = () => {
        requestAnimationFrame(() => {
            STATE.isBackNavigating = false;
        });
    };

    if (sourceProjectId) {
        // 等待下一幀動畫後捲動至專案位置
        requestAnimationFrame(() => {
            const projectElement = document.getElementById(`project-${sourceProjectId}`);

            if (projectElement) {
                // 計算扣除 Header 高度後的捲動位置
                const headerHeight = getHeaderHeight();
                const elementPosition = projectElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                // 立即捲動至專案卡片位置
                scrollToPosition(offsetPosition, true);
            } else {
                // 若找不到元素，捲動至 ACHIEVEMENTS 區塊
                scrollToSection('achievements', true);
            }

            // 清除儲存的專案 ID
            sessionStorage.removeItem('sourceProjectId');
            releaseBackLock();
        });
    } else {
        // 若無儲存的 ID，捲動至 ACHIEVEMENTS 區塊
        requestAnimationFrame(() => {
            scrollToSection('achievements', true);
            releaseBackLock();
        });
    }
}

/**
 * 顯示錯誤通知（3 秒後自動消失）
 * @param {string} message - 要顯示的錯誤訊息
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--color-black, #000);
        color: var(--color-white, #fff);
        padding: 20px 40px;
        border-radius: 8px;
        z-index: 10000;
        font-family: var(--font-nav, sans-serif);
        font-size: 1rem;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'assertive');

    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, CONFIG.TIMING.ERROR_DISPLAY_DURATION);
}

/**
 * 返回主頁後，捲動至來源專案卡片位置
 */
function scrollToSourceProject() {
    const sourceProjectId = sessionStorage.getItem('sourceProjectId');
    requestAnimationFrame(() => {
        if (sourceProjectId) {
            const projectElement = document.getElementById('project-' + sourceProjectId);
            if (projectElement) {
                const headerHeight = getHeaderHeight();
                const elementPosition = projectElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                scrollToPosition(offsetPosition, true);
            } else {
                scrollToSection('achievements', true);
            }
            sessionStorage.removeItem('sourceProjectId');
        } else {
            scrollToSection('achievements', true);
        }
    });
}

// ==================== 瀏覽器歷史記錄處理 ====================

/**
 * 處理瀏覽器上一頁 / 下一頁（popstate）事件
 */
function handlePopState(event) {
    if (event.state) {
        if (event.state.view === 'home') {
            goBackToHome(true);
            scrollToSourceProject();
        } else if (event.state.view === 'detail' && event.state.page) {
            loadPage(event.state.page);
        }
    } else {
        goBackToHome(true);
        scrollToSourceProject();
    }
}

// ==================== 歷史記錄初始化 ====================

/**
 * 初始化瀏覽器歷史記錄設定
 */
function initHistoryHandler() {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // 若 URL 含有 hash 錨點，讓瀏覽器自行處理捲動
    if (window.location.hash) {
        return;
    }
    history.replaceState({ page: 'home', view: 'home' }, '', window.location.pathname);
}

// ==================== Chaffle 文字隨機化效果 ====================

/**
 * 初始化 Hero 區塊的 Chaffle 文字隨機化動畫
 */
function initChaffleEffect() {
    const chaffleElements = document.querySelectorAll('.chaffle-text');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

    // 各文字元素的自動觸發間隔（毫秒）
    const intervalMap = {
        "Designer Background": 3000,
        "Big-Picture Thinking": 3500,
        "Thoughtful Decisions": 4000,
        "Team-First Collaboration": 5000,
        "Business Mindset": 4500,
        "AI Learner": 6000
    };

    chaffleElements.forEach(el => {
        const originalText = el.getAttribute('data-text') || el.textContent;

        // 執行 Chaffle 隨機化動畫
        const runChaffle = () => {
            let iteration = 0;

            clearInterval(el.interval);

            el.interval = setInterval(() => {
                el.textContent = originalText
                    .split('')
                    .map((char, index) => {
                        if (char === ' ') return ' ';
                        if (index < iteration) {
                            return originalText[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('');

                if (iteration >= originalText.length) {
                    clearInterval(el.interval);
                }

                iteration += 1 / 3;
            }, 30);
        };

        // 滑鼠移入時觸發
        el.addEventListener('mouseenter', runChaffle);

        el.addEventListener('mouseleave', () => {
            clearInterval(el.interval);
            el.textContent = originalText;
        });

        // 頁面載入後立即執行一次
        runChaffle();

        const intervalTime = intervalMap[originalText] || 4000;
        setInterval(runChaffle, intervalTime);
    });
}

// ==================== URL 參數處理 ====================

/**
 * 頁面載入時處理 URL 參數（?page=...）與錨點捲動
 */
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageUrl = urlParams.get('page');

    if (pageUrl) {
        loadPage(decodeURIComponent(pageUrl));
    }

    const hash = window.location.hash;
    if (hash && hash !== '#') {
        const sectionId = hash.replace('#', '');

        // 等待頁面完全渲染後再執行錨點捲動
        setTimeout(() => {
            const target = document.getElementById(sectionId);
            if (target) {
                const header = document.getElementById('header');
                const headerHeight = header ? header.offsetHeight : 0;
                const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        }, 800);
    }
});

// ==================== 行動裝置觸控效果（成就區塊） ====================

/**
 * 觸控互動邏輯說明：
 * 1. 快速點擊（< 0.6 秒）：顯示遮罩，0.6 秒後觸發連結跳轉
 * 2. 長按（≥ 0.6 秒）：顯示遮罩並保持，再次點擊才觸發跳轉
 * 3. 捲動時：不顯示遮罩，不觸發跳轉
 */

// 偵測觸控設備後初始化
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {

    // 觸控狀態追蹤變數
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let currentTouchedLink = null;
    let isScrolling = false;
    let longPressTimer = null;
    let pendingTapTimer = null;

    /**
     * 觸控開始事件
     */
    document.addEventListener('touchstart', function(e) {
        const achLink = e.target.closest('.ach-img-link');

        if (achLink) {
            // 記錄觸控起始狀態
            touchStartTime = Date.now();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            currentTouchedLink = achLink;
            isScrolling = false;

            // 啟動長按計時器（600ms）
            if (longPressTimer) {
                clearTimeout(longPressTimer);
            }
            longPressTimer = setTimeout(() => {
                // 長按：顯示遮罩並保持
                if (!isScrolling && currentTouchedLink === achLink) {
                    achLink.classList.add('touch-active');
                }
            }, 600);
        }
    }, { passive: true });

    /**
     * 觸控移動事件（偵測是否為捲動操作）
     */
    document.addEventListener('touchmove', function(e) {
        if (currentTouchedLink && longPressTimer) {
            const touchMoveX = e.touches[0].clientX;
            const touchMoveY = e.touches[0].clientY;
            const deltaX = Math.abs(touchMoveX - touchStartX);
            const deltaY = Math.abs(touchMoveY - touchStartY);

            // 若移動超過 10px 則判定為捲動
            if (deltaX > 10 || deltaY > 10) {
                isScrolling = true;
                clearTimeout(longPressTimer);
                longPressTimer = null;

                // 取消 active 狀態（使用者正在捲動）
                if (currentTouchedLink) {
                    currentTouchedLink.classList.remove('touch-active');
                }
            }
        }
    }, { passive: true });

    /**
     * 觸控結束事件
     */
    document.addEventListener('touchend', function(e) {
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        const tappedLink = currentTouchedLink;

        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }

        if (isScrolling || !tappedLink) {
            currentTouchedLink = null;
            return;
        }

        e.preventDefault();

        if (touchDuration < 600 && !tappedLink.classList.contains('touch-active')) {
            tappedLink.classList.add('touch-active');

            if (pendingTapTimer) {
                clearTimeout(pendingTapTimer);
                pendingTapTimer = null;
            }

            pendingTapTimer = setTimeout(() => {
                if (document.body.contains(tappedLink)) {
                    tappedLink.click();
                }
                pendingTapTimer = null;
            }, 600);
        } else if (tappedLink.classList.contains('touch-active')) {
            if (pendingTapTimer) {
                clearTimeout(pendingTapTimer);
                pendingTapTimer = null;
            }

            tappedLink.classList.remove('touch-active');
            tappedLink.click();
        }

        currentTouchedLink = null;
    }, { passive: false });

    /**
     * 點擊其他區域時清除所有 active 狀態
     */
    document.addEventListener('touchstart', function(e) {
        if (!e.target.closest('.ach-img-link')) {
            if (pendingTapTimer) {
                clearTimeout(pendingTapTimer);
                pendingTapTimer = null;
            }
            document.querySelectorAll('.ach-img-link.touch-active').forEach(link => {
                link.classList.remove('touch-active');
            });
        }
    }, { passive: true });
}

// ==================== 觸控效果結束 ====================
