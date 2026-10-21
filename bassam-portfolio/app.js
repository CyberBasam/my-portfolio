(function () {
  'use strict';
  var H = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ---------- language: English is in the HTML, Arabic is in data-ar ---------- */
  var lang = H.lang === 'ar' ? 'ar' : 'en';
  var ROLES = {
    en: ['Digital Forensics', 'Incident Response', 'Malware Analysis'],
    ar: ['التحقيق الجنائي الرقمي', 'الاستجابة للحوادث', 'تحليل البرمجيات الخبيثة']
  };
  var resetTyping = function () {};

  function applyLang() {
    $$('[data-ar]').forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.textContent;
      el.textContent = lang === 'ar' ? el.dataset.ar : el.dataset.en;
    });
    H.lang = lang;
    H.dir = lang === 'ar' ? 'rtl' : 'ltr';
    var b = $('#lang');
    if (b) {
      b.textContent = lang === 'ar' ? 'EN' : 'عربي';
      b.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    }
    var t = lang === 'ar' ? document.body.dataset.titleAr : document.body.dataset.titleEn;
    if (t) document.title = t;
    save('lang', lang);
    resetTyping();
  }
  var langBtn = $('#lang');
  if (langBtn) langBtn.addEventListener('click', function () {
    lang = lang === 'en' ? 'ar' : 'en';
    applyLang();
  });

  var acc = '#cfc8b6';
  function readAcc() {
    var v = (getComputedStyle(H).getPropertyValue('--acc') || '').trim();
    if (v) acc = v;
  }
  readAcc();

  /* ---------- theme ---------- */
  var themeBtn = $('#theme');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var cur = H.getAttribute('data-theme');
    var isDark = cur ? cur === 'dark' : !matchMedia('(prefers-color-scheme:light)').matches;
    var next = isDark ? 'light' : 'dark';
    H.setAttribute('data-theme', next);
    save('theme', next);
    readAcc();
  });

  /* ---------- mobile menu ---------- */
  var menu = $('#menu'), links = $('#links');
  function closeMenu() {
    if (!links) return;
    links.classList.remove('open');
    if (menu) menu.setAttribute('aria-expanded', 'false');
  }
  if (menu && links) {
    menu.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) { closeMenu(); menu.focus(); }
    });
  }

  /* ---------- welcome alert: stays until the visitor presses "ابشر" ---------- */
  var ok = $('#welcomeOk');
  function lock(on) {
    ['nav', 'main', 'footer', '.skip'].forEach(function (s) {
      var el = $(s);
      if (!el) return;
      if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }
  if (ok) {
    if (H.classList.contains('welcome')) {
      lock(true);
      setTimeout(function () { ok.focus(); }, 60);
    }
    ok.addEventListener('click', function () {
      H.classList.remove('welcome');
      lock(false);
      try { sessionStorage.setItem('welcomed', '1'); } catch (e) {}
      var m = $('#main');
      if (m) m.focus({ preventScroll: true });
    });
  }

  applyLang();
  H.classList.add('js');

  /* ---------- investigator's magnifier replaces the mouse pointer ---------- */
  var lens = $('#lens');
  if (lens && !reduce && matchMedia('(pointer:fine)').matches) {
    var hot = 'a,button,[role="button"],summary,label';
    H.classList.add('lens-on');
    addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      lens.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
      lens.classList.remove('hide');
      lens.classList.toggle('big', !!(e.target.closest && e.target.closest(hot)));
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', function () { lens.classList.add('hide'); });
    lens.classList.add('hide');
  }

  /* ---------- soft glow that follows the pointer ---------- */
  var spot = $('#spot');
  if (spot && !reduce) {
    addEventListener('pointermove', function (e) {
      spot.style.setProperty('--x', e.clientX + 'px');
      spot.style.setProperty('--y', e.clientY + 'px');
    }, { passive: true });
  }

  /* ---------- typing role line ---------- */
  var tp = $('#typed');
  if (tp) {
    if (reduce) {
      tp.textContent = ROLES[lang][0];
      resetTyping = function () { tp.textContent = ROLES[lang][0]; };
    } else {
      var wi = 0, ci = 0, del = false;
      resetTyping = function () { wi = 0; ci = 0; del = false; };
      (function tick() {
        var w = ROLES[lang][wi % ROLES[lang].length];
        if (!del) {
          ci++;
          if (ci > w.length) { del = true; return setTimeout(tick, 1500); }
        } else {
          ci--;
          if (ci < 0) { del = false; ci = 0; wi++; return setTimeout(tick, 250); }
        }
        tp.textContent = w.slice(0, Math.max(ci, 0));
        setTimeout(tick, del ? 40 : 85);
      })();
    }
  }

  /* ---------- count-up stats (real numbers are already in the HTML) ---------- */
  if (!reduce) {
    $$('[data-n]').forEach(function (el) {
      var n = +el.dataset.n, t0 = null;
      el.textContent = '0';
      requestAnimationFrame(function step(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / 1300);
        el.textContent = String(Math.round(n * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step); else el.textContent = String(n);
      });
    });
  }

  /* ---------- scroll: progress bar, hero fade, section spy, reveals ---------- */
  var prog = $('#prog'), hw = $('#hw'), ticking = false;
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    var y = scrollY;
    if (prog) prog.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    if (hw && !reduce) {
      var k = Math.min(1, y / (innerHeight * 0.7));
      hw.style.opacity = String(1 - k);
      hw.style.transform = 'translateY(' + (k * -40).toFixed(1) + 'px)';
    }
    ticking = false;
  }
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  var navLinks = $$('#links a');
  var sections = $$('main > section[id]');
  var spy = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      navLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(function (sec) { spy.observe(sec); });

  var RV = ['h2', '.sub', '.lead', '.card', '.item', '.note', '.two > div:first-child', '.cta', '#contact p']
    .map(function (s) { return 'main section:not(#home) ' + s; }).join(',');
  var rvEls = $$(RV).filter(function (el, i, a) { return a.indexOf(el) === i; });
  if (!reduce && 'IntersectionObserver' in window) {
    var seen = new Map();
    rvEls.forEach(function (el) {
      var i = (seen.get(el.parentNode) || 0);
      seen.set(el.parentNode, i + 1);
      el.style.setProperty('--i', String(Math.min(i, 5)));
      el.classList.add('rv');
    });
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rvEls.forEach(function (el) { rio.observe(el); });
  }

  /* ---------- hex rain behind the whole site (fixed, soft multicolour) ---------- */
  var c = $('#hex');
  if (c && !reduce) {
    var x = c.getContext('2d'), W = 0, Ht = 0, cols = 0, drops = [], mx = -999, running = true;
    var PAL = ['111,205,227', '139,111,224', '196,84,122', '201,163,90'];
    var size = function () {
      W = c.width = innerWidth; Ht = c.height = innerHeight;
      cols = Math.floor(W / 24); drops = [];
      for (var i = 0; i < cols; i++) drops[i] = Math.random() * Ht / 18;
    };
    size();
    addEventListener('resize', size);
    addEventListener('pointermove', function (e) { mx = e.clientX; }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      var was = running; running = !document.hidden;
      if (running && !was) frame();
    });
    var frame = function () {
      if (!running) return;
      x.globalCompositeOperation = 'destination-out';
      x.fillStyle = 'rgba(0,0,0,.12)';
      x.fillRect(0, 0, W, Ht);
      x.globalCompositeOperation = 'source-over';
      x.font = '15px ui-monospace,monospace';
      for (var i = 0; i < cols; i++) {
        var near = Math.abs(i * 24 - mx) < 120;
        x.fillStyle = 'rgba(' + PAL[i % PAL.length] + ',' + (near ? 0.75 : 0.22 + (i % 4) * 0.05) + ')';
        x.fillText(Math.floor(Math.random() * 256).toString(16).padStart(2, '0'), i * 24, drops[i] * 18);
        if (drops[i] * 18 > Ht && Math.random() > 0.975) drops[i] = 0;
        drops[i] += near ? 1.6 : 0.7;
      }
      requestAnimationFrame(frame);
    };
    frame();
  }

  /* ---------- replayed sample report: starts when it scrolls into view ---------- */
  var term = $('#term');
  if (term) {
    var L = [
      '<span class="o">$</span> cyberman scan IMG_4216.png',
      'analysing metadata ...',
      'error-level analysis ...',
      '<span class="w">[!] SUSPICIOUS_CONTENT</span>',
      'anomaly 68% · fingerprint 72%',
      'verdict: manual review recommended',
      '<span class="o">report saved ✓</span>'
    ];
    if (reduce) {
      term.innerHTML = L.join('<br>');
    } else {
      var li = 0, started = false;
      var play = function () {
        if (li < L.length) { term.insertAdjacentHTML('beforeend', L[li++] + '<br>'); setTimeout(play, 700); }
        else setTimeout(function () { term.innerHTML = ''; li = 0; play(); }, 4000);
      };
      new IntersectionObserver(function (es, o) {
        if (es[0].isIntersecting && !started) { started = true; play(); o.disconnect(); }
      }, { threshold: 0.3 }).observe(term);
    }
  }

  /* ---------- CV chooser: close on outside click / Escape; mark files that are not uploaded yet ---------- */
  document.addEventListener('click', function (e) {
    $$('details.cv[open]').forEach(function (d) { if (!d.contains(e.target)) d.removeAttribute('open'); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    $$('details.cv[open]').forEach(function (d) { d.removeAttribute('open'); var s = d.querySelector('summary'); if (s) s.focus(); });
  });
  if (window.fetch) {
    $$('a[data-cv]').forEach(function (a) {
      var off = function () {
        a.classList.add('off');
        a.setAttribute('aria-disabled', 'true');
        a.setAttribute('tabindex', '-1');
      };
      fetch(a.getAttribute('href'), { method: 'HEAD' }).then(function (r) { if (!r.ok) off(); }).catch(off);
    });
  }
})();
