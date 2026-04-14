// ============================================================
// DOTTING Static Site - Core Application Logic
// Language switching, cookie consent, navigation
// ============================================================

(function() {
  'use strict';

  // --- Language Management ---
  let currentLang = 'it'; // Default language

  function getLang() {
    const consent = localStorage.getItem('dotting-cookie-consent');
    if (consent) {
      const prefs = JSON.parse(consent);
      if (prefs.functional) {
        const saved = localStorage.getItem('dotting-language');
        if (saved && translations[saved]) return saved;
      }
    }
    return 'it';
  }

  function setLang(lang) {
    currentLang = lang;
    const consent = localStorage.getItem('dotting-cookie-consent');
    if (consent) {
      const prefs = JSON.parse(consent);
      if (prefs.functional) {
        localStorage.setItem('dotting-language', lang);
      }
    }
    applyTranslations();
    updateLangButton();
  }

  function getT() {
    return translations[currentLang] || translations.it;
  }

  function applyTranslations() {
    const t = getT();
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      const key = el.getAttribute('data-i18n');
      const value = resolveKey(t, key);
      if (value !== undefined && value !== null) {
        if (el.tagName === 'INPUT' && el.getAttribute('placeholder') !== null) {
          el.placeholder = value;
        } else {
          el.textContent = value;
        }
      }
    });
    // Update HTML lang attribute
    document.documentElement.lang = currentLang;
    // Dispatch event for page-specific handlers
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang, t: t } }));
  }

  function resolveKey(obj, path) {
    return path.split('.').reduce(function(o, k) {
      return o && o[k] !== undefined ? o[k] : undefined;
    }, obj);
  }

  function updateLangButton() {
    var btns = document.querySelectorAll('.lang-current');
    btns.forEach(function(btn) {
      btn.textContent = currentLang.toUpperCase();
    });
    // Update active state in dropdown
    document.querySelectorAll('.lang-option').forEach(function(opt) {
      var optLang = opt.getAttribute('data-lang');
      if (optLang === currentLang) {
        opt.classList.add('bg-white/10', 'font-bold');
      } else {
        opt.classList.remove('bg-white/10', 'font-bold');
      }
    });
  }

  // --- Navigation ---
  function initNavigation() {
    var currentPath = window.location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    // Normalize: remove trailing slash except for root
    if (currentPath !== '/' && currentPath.endsWith('/')) {
      currentPath = currentPath.slice(0, -1);
    }
    // Also handle /static/ prefix
    currentPath = currentPath.replace(/^\/static/, '');
    if (currentPath === '' || currentPath === '/') currentPath = '/';

    // Highlight active nav links
    document.querySelectorAll('[data-nav]').forEach(function(link) {
      var navPath = link.getAttribute('data-nav');
      if (navPath === currentPath) {
        link.classList.add('bg-white', 'text-black', 'shadow-lg');
        link.classList.remove('text-white/80');
      }
    });

    // Services dropdown (desktop)
    var servicesBtn = document.getElementById('services-btn');
    var servicesDropdown = document.getElementById('services-dropdown');
    if (servicesBtn && servicesDropdown) {
      servicesBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        servicesDropdown.classList.toggle('hidden');
      });
      document.addEventListener('click', function() {
        servicesDropdown.classList.add('hidden');
      });
      servicesDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }

    // Mobile menu
    var mobileMenuBtn = document.getElementById('mobile-menu-btn');
    var mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
      });
      mobileMenu.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
      });
    }

    // Language dropdown
    document.querySelectorAll('.lang-toggle').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var dropdown = btn.closest('.lang-wrapper').querySelector('.lang-dropdown');
        dropdown.classList.toggle('hidden');
      });
    });

    document.querySelectorAll('.lang-option').forEach(function(opt) {
      opt.addEventListener('click', function() {
        setLang(opt.getAttribute('data-lang'));
        document.querySelectorAll('.lang-dropdown').forEach(function(d) {
          d.classList.add('hidden');
        });
      });
    });

    document.addEventListener('click', function() {
      document.querySelectorAll('.lang-dropdown').forEach(function(d) {
        d.classList.add('hidden');
      });
    });
  }

  // --- Cookie Consent ---
  function initCookieConsent() {
    var isPrivacyPage = window.location.pathname.includes('privacy');
    if (isPrivacyPage) return;

    var consent = localStorage.getItem('dotting-cookie-consent');
    var timestamp = localStorage.getItem('dotting-consent-timestamp');
    var showBanner = false;

    if (!consent) {
      showBanner = true;
    } else if (timestamp) {
      var sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      if (new Date(timestamp) < sixMonthsAgo) {
        showBanner = true;
      }
    }

    renderCookieButton();
    if (showBanner) {
      showCookieBanner();
    }
  }

  function renderCookieButton() {
    var existing = document.getElementById('cookie-manage-btn');
    if (existing) existing.remove();

    var btn = document.createElement('button');
    btn.id = 'cookie-manage-btn';
    btn.className = 'fixed bottom-4 right-4 z-40 md:z-50 bg-slate-800/90 backdrop-blur-sm text-white p-3 rounded-full shadow-2xl border border-white/10 hover:bg-slate-700 transition-all duration-300 hover:scale-105';
    btn.innerHTML = '<div class="flex items-center gap-2"><span class="text-sm">🍪</span><span class="hidden md:inline text-xs font-medium" data-i18n="cookies.manageCookies">' + getT().cookies.manageCookies + '</span></div>';
    btn.addEventListener('click', showCookieBanner);
    document.body.appendChild(btn);
  }

  function showCookieBanner() {
    var existing = document.getElementById('cookie-banner');
    if (existing) existing.remove();

    var t = getT().cookies;
    var consent = localStorage.getItem('dotting-cookie-consent');
    var prefs = consent ? JSON.parse(consent) : { necessary: true, functional: false, analytics: false };

    var overlay = document.createElement('div');
    overlay.id = 'cookie-banner';
    overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4';

    overlay.innerHTML = '<div class="bg-slate-900 text-white rounded-2xl shadow-2xl max-w-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto">' +
      '<div class="p-6 border-b border-white/10 relative">' +
        '<button id="cookie-close-x" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white">' +
          '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>' +
        '</button>' +
        '<h2 class="text-2xl font-bold mb-2 pr-8">' + t.title + '</h2>' +
        '<p class="text-gray-300 text-sm">' + t.subtitle + '</p>' +
        '<p class="text-xs text-gray-400 mt-2">\u2139\ufe0f ' + t.closeXInfo + '</p>' +
      '</div>' +
      '<div class="p-6">' +
        '<div class="space-y-4">' +
          '<p class="text-gray-300">' + t.description + '</p>' +
          '<div class="space-y-3 bg-white/5 rounded-lg p-4 border border-white/10">' +
            '<h3 class="font-bold text-white mb-3">' + t.quickSettings + '</h3>' +
            '<div class="flex items-center justify-between">' +
              '<div><div class="font-medium text-green-400">' + t.necessaryTitle + '</div><div class="text-xs text-gray-400">' + t.necessaryLabel + '</div></div>' +
              '<div class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">' + t.necessaryLabel + '</div>' +
            '</div>' +
            '<div class="flex items-center justify-between">' +
              '<div class="flex-1"><div class="font-medium text-blue-400">' + t.functionalTitle + '</div><div class="text-xs text-gray-400">' + t.functionalDesc + '</div></div>' +
              '<label class="relative inline-flex items-center cursor-pointer ml-4">' +
                '<input type="checkbox" id="cookie-functional" class="sr-only peer" ' + (prefs.functional ? 'checked' : '') + '>' +
                '<div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>' +
              '</label>' +
            '</div>' +
            '<div class="flex items-center justify-between opacity-50">' +
              '<div class="flex-1"><div class="font-medium text-purple-400">' + t.analyticsTitle + '</div><div class="text-xs text-gray-400">' + t.analyticsDesc + '</div></div>' +
              '<label class="relative inline-flex items-center cursor-not-allowed ml-4">' +
                '<input type="checkbox" disabled class="sr-only peer">' +
                '<div class="w-11 h-6 bg-gray-700 rounded-full opacity-50"></div>' +
              '</label>' +
            '</div>' +
          '</div>' +
          '<div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">' +
            '<h3 class="font-bold text-blue-400 mb-2">' + t.gdprTitle + '</h3>' +
            '<p class="text-sm text-gray-300">' + t.gdprDesc + '</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="p-6 border-t border-white/10 space-y-3">' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
          '<button id="cookie-accept-all" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">' + t.acceptAll + '</button>' +
          '<button id="cookie-reject-all" class="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-white/20">' + t.necessaryOnly + '</button>' +
        '</div>' +
        '<button id="cookie-save-custom" class="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">' + t.savePreferences + '</button>' +
        '<div class="text-center"><a href="privacy.html" class="text-xs text-gray-400 hover:text-white underline">' + t.privacyPolicy + '</a></div>' +
      '</div>' +
    '</div>';

    document.body.appendChild(overlay);

    // Event listeners
    document.getElementById('cookie-close-x').addEventListener('click', function() {
      saveCookiePrefs({ necessary: true, functional: false, analytics: false }, 'close_x');
    });
    document.getElementById('cookie-accept-all').addEventListener('click', function() {
      saveCookiePrefs({ necessary: true, functional: true, analytics: false }, 'accept_all');
    });
    document.getElementById('cookie-reject-all').addEventListener('click', function() {
      saveCookiePrefs({ necessary: true, functional: false, analytics: false }, 'reject_all');
    });
    document.getElementById('cookie-save-custom').addEventListener('click', function() {
      var functional = document.getElementById('cookie-functional').checked;
      saveCookiePrefs({ necessary: true, functional: functional, analytics: false }, 'custom');
    });
  }

  function saveCookiePrefs(prefs, action) {
    prefs.analytics = false;
    localStorage.setItem('dotting-cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('dotting-consent-timestamp', new Date().toISOString());

    // Log consent
    var logs = [];
    try { logs = JSON.parse(localStorage.getItem('dotting-consent-log') || '[]'); } catch(e) {}
    logs.push({
      timestamp: new Date().toISOString(),
      preferences: prefs,
      action: action,
      userAgent: navigator.userAgent
    });
    if (logs.length > 50) logs.shift();
    localStorage.setItem('dotting-consent-log', JSON.stringify(logs));

    // Cleanup
    if (!prefs.functional) {
      localStorage.removeItem('dotting-language');
    }

    var banner = document.getElementById('cookie-banner');
    if (banner) banner.remove();
    renderCookieButton();
  }

  // --- Initialization ---
  function init() {
    currentLang = getLang();
    applyTranslations();
    initNavigation();
    initCookieConsent();
    updateLangButton();
  }

  // Expose for page-specific scripts
  window.dotting = {
    getLang: getLang,
    setLang: setLang,
    getT: getT,
    currentLang: function() { return currentLang; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
