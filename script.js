(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Toast ---------- */
  var toastEl = $('#toast'), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* ---------- Year ---------- */
  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  var toggle = $('#navToggle'), nav = $('#nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Random motivational quotes (new on every refresh) ---------- */
  var QUOTES = [
    ['The only way to do great work is to love what you do.', 'Steve Jobs'],
    ['A journey of a thousand miles begins with a single step.', 'Lao Tzu'],
    ['It does not matter how slowly you go as long as you do not stop.', 'Confucius'],
    ['The best way to predict the future is to create it.', 'Peter Drucker'],
    ['What gets measured gets managed.', 'Peter Drucker'],
    ['The way to get started is to quit talking and begin doing.', 'Walt Disney'],
    ['Whether you think you can, or you think you can’t, you’re right.', 'Henry Ford'],
    ['Quality is not an act, it is a habit.', 'Will Durant'],
    ['Opportunities don’t happen. You create them.', 'Chris Grosser'],
    ['Well done is better than well said.', 'Benjamin Franklin'],
    ['Success usually comes to those who are too busy to be looking for it.', 'Henry David Thoreau'],
    ['Don’t watch the clock; do what it does. Keep going.', 'Sam Levenson'],
    ['The secret of getting ahead is getting started.', 'Mark Twain'],
    ['Alone we can do so little; together we can do so much.', 'Helen Keller'],
    ['Courage is not the absence of fear, but the triumph over it.', 'Nelson Mandela'],
    ['Learning never exhausts the mind.', 'Leonardo da Vinci'],
    ['Make each day your masterpiece.', 'John Wooden'],
    ['Small daily improvements are the key to staggering long-term results.', 'Robin Sharma'],
    ['Do what you can, with what you have, where you are.', 'Theodore Roosevelt'],
    ['Efficiency is doing things right; effectiveness is doing the right things.', 'Peter Drucker']
  ];
  var qText = $('#quoteText'), qAuthor = $('#quoteAuthor'), qBox = $('.quote-box');
  var lastIdx = -1;
  function pickQuote(animate) {
    var i;
    do { i = Math.floor(Math.random() * QUOTES.length); } while (i === lastIdx && QUOTES.length > 1);
    lastIdx = i;
    function apply() {
      qText.textContent = '“' + QUOTES[i][0] + '”';
      qAuthor.textContent = '— ' + QUOTES[i][1];
      if (animate && qBox) qBox.classList.remove('fade');
    }
    if (animate && qBox) {
      qBox.classList.add('fade');
      setTimeout(apply, 250);
    } else apply();
  }
  if (qText && qAuthor) {
    pickQuote(false);
    var nq = $('#newQuote');
    if (nq) nq.addEventListener('click', function () { pickQuote(true); });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Back to top ---------- */
  var topBtn = $('#toTop');
  if (topBtn) {
    window.addEventListener('scroll', function () {
      topBtn.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Modal (services) ---------- */
  var modal = $('#modal'), modalBody = $('#modalBody'), lastFocus = null;
  function openModal(html) {
    lastFocus = document.activeElement;
    modalBody.innerHTML = html;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var close = $('.modal-close', modal);
    if (close) close.focus();
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modalBody.innerHTML = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (modal) {
    $$('[data-service]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var src = document.getElementById(btn.getAttribute('data-service'));
        if (src) openModal(src.innerHTML);
      });
    });
    modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close') || (e.target.closest && e.target.closest('[data-close]'))) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  /* ---------- Tabs (education) ---------- */
  $$('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      $$('.tab').forEach(function (t) { t.classList.remove('active'); });
      $$('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = document.getElementById('tab-' + tab.getAttribute('data-tab'));
      if (panel) panel.classList.add('active');
    });
  });

  /* ---------- Project expand ---------- */
  $$('.toggle-more').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var box = btn.closest('.project').querySelector('.expand');
      var show = box.hasAttribute('hidden');
      if (show) box.removeAttribute('hidden'); else box.setAttribute('hidden', '');
      btn.textContent = show ? 'Hide details' : 'Show details';
      btn.setAttribute('aria-expanded', show ? 'true' : 'false');
    });
  });

  /* ---------- Resume (download / view) with friendly missing-file message ---------- */
  function checkResume(e, link, isView) {
    if (location.protocol.indexOf('http') !== 0) return; // opened from disk: let the browser handle it
    e.preventDefault();
    fetch('resume.pdf', { method: 'HEAD' }).then(function (r) {
      if (!r.ok) throw new Error('missing');
      if (isView) { window.open('resume.pdf', '_blank', 'noopener'); }
      else {
        var a = document.createElement('a');
        a.href = 'resume.pdf'; a.download = 'Md-Al-Shaharia-Hossain-Resume.pdf';
        document.body.appendChild(a); a.click(); a.remove();
        toast('Resume download started');
      }
    }).catch(function () {
      toast('Resume PDF is not available yet. Please check back soon.');
    });
  }
  $$('[data-resume]').forEach(function (a) { a.addEventListener('click', function (e) { checkResume(e, a, false); }); });
  $$('[data-resume-view]').forEach(function (a) { a.addEventListener('click', function (e) { checkResume(e, a, true); }); });

  /* ---------- Copy buttons ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? res() : rej(); } catch (err) { rej(err); }
      ta.remove();
    });
  }
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var original = btn.textContent;
      copyText(btn.getAttribute('data-copy')).then(function () {
        btn.textContent = 'Copied ✓';
        toast('Copied to clipboard');
        setTimeout(function () { btn.textContent = original; }, 1600);
      }).catch(function () { toast('Could not copy. Please copy manually.'); });
    });
  });

  /* ---------- Contact form ---------- */
  var form = $('#contactForm');
  if (form) {
    var EMAIL = 'rimonhassain4087@gmail.com', WA = '8801709010454';
    var errEl = $('#formError');
    function read() {
      return {
        name: $('#fName').value.trim(), email: $('#fEmail').value.trim(),
        subject: $('#fSubject').value.trim(), message: $('#fMessage').value.trim()
      };
    }
    function validate(v) {
      if (!v.name) return 'Please enter your name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return 'Please enter a valid email address.';
      if (!v.message) return 'Please write a message.';
      return '';
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = read(), msg = validate(v);
      errEl.textContent = msg;
      if (msg) return;
      var subject = v.subject || 'Portfolio enquiry from ' + v.name;
      var body = v.message + '\n\n— ' + v.name + '\n' + v.email;
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      toast('Opening your email app…');
    });
    $('#sendWa').addEventListener('click', function () {
      var v = read();
      if (!v.name) { errEl.textContent = 'Please enter your name.'; return; }
      if (!v.message) { errEl.textContent = 'Please write a message.'; return; }
      errEl.textContent = '';
      var text = 'Hello Al Shaharia, I’m ' + v.name + '.' + (v.subject ? '\nSubject: ' + v.subject : '') + '\n\n' + v.message + (v.email ? '\n\nReply to: ' + v.email : '');
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  }
})();
