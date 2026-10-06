/* Vanilla JS: no jQuery / Owl Carousel / Waypoints needed any more. */
(function () {
    'use strict';

    var $ = function (s, c) { return (c || document).querySelector(s); };
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- navbar + scroll-up button (one passive, rAF-throttled handler) ---------- */
    var navbar = $('.navbar');
    var upBtn = $('.scroll-up-btn');
    var ticking = false;

    function onScroll() {
        var y = window.scrollY;
        navbar.classList.toggle('sticky', y > 20);
        upBtn.classList.toggle('show', y > 500);
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    upBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    /* ---------- mobile menu ---------- */
    var menu = $('.navbar .menu');
    var menuBtn = $('.menu-btn');
    var menuIcon = $('i', menuBtn);

    function setMenu(open) {
        menu.classList.toggle('active', open);
        menuIcon.classList.toggle('active', open);
        menuBtn.setAttribute('aria-expanded', open);
    }
    menuBtn.addEventListener('click', function () {
        setMenu(!menu.classList.contains('active'));
    });
    menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) setMenu(false);
    });

    /* ---------- typing animation: start only when the element is on screen ---------- */
    var roles = ["Software Developer", "6+ Experienced", "AI Expert", "LLM Tuning and Deployment Expert", "Freelancer"];
    var typedConfigs = {
        '.typing':   roles,
        '.typing-2': roles,
        '.typing-3': ["Connect with me on :)"]
    };

    function startTyped(el, strings) {
        if (typeof Typed === 'undefined') return;
        new Typed(el, { strings: strings, typeSpeed: 100, backSpeed: 60, loop: true });
    }
    Object.keys(typedConfigs).forEach(function (sel) {
        var el = $(sel);
        if (!el) return;
        if (!('IntersectionObserver' in window)) { startTyped(el, typedConfigs[sel]); return; }
        var io = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                io.disconnect();
                startTyped(el, typedConfigs[sel]);
            }
        });
        io.observe(el);
    });

    /* ---------- projects carousel (CSS scroll-snap + dots + autoplay) ---------- */
    var track = $('#carousel');
    if (track && track.children.length) {
        var cards = Array.prototype.slice.call(track.children);
        var dotsWrap = document.createElement('div');
        dotsWrap.className = 'carousel-dots';
        track.insertAdjacentElement('afterend', dotsWrap);

        var GAP = 20, pages = 1, stepW = 1, timer = null, hovering = false, visible = false;

        function measure() {
            stepW = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth;
            var perView = Math.max(1, Math.round((track.clientWidth + GAP) / (stepW || 1)));
            pages = Math.max(1, cards.length - perView + 1);
        }
        function current() {
            return Math.min(pages - 1, Math.round(track.scrollLeft / (stepW || 1)));
        }
        function buildDots() {
            measure();
            dotsWrap.innerHTML = '';
            for (var i = 0; i < pages; i++) {
                var b = document.createElement('button');
                b.type = 'button';
                b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
                b.addEventListener('click', (function (n) { return function () { goTo(n); }; })(i));
                dotsWrap.appendChild(b);
            }
            markDot();
        }
        function markDot() {
            var c = current();
            Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
                d.classList.toggle('active', i === c);
            });
        }
        function goTo(i) {
            track.scrollTo({ left: i * stepW, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
        function next() { goTo((current() + 1) % pages); }

        function play() {
            stop();
            if (reduceMotion || hovering || !visible || pages < 2) return;
            timer = setInterval(next, 3000);
        }
        function stop() { clearInterval(timer); timer = null; }

        var dotTick = false;
        track.addEventListener('scroll', function () {
            if (!dotTick) { dotTick = true; requestAnimationFrame(function () { markDot(); dotTick = false; }); }
        }, { passive: true });

        track.addEventListener('pointerenter', function () { hovering = true; stop(); });
        track.addEventListener('pointerleave', function () { hovering = false; play(); });
        track.addEventListener('touchstart', function () { hovering = true; stop(); }, { passive: true });
        track.addEventListener('touchend', function () { hovering = false; play(); }, { passive: true });

        var resizeT;
        window.addEventListener('resize', function () {
            clearTimeout(resizeT);
            resizeT = setTimeout(buildDots, 150);
        });

        buildDots();

        // only autoplay while the carousel is actually on screen
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                visible = entries[0].isIntersecting;
                visible ? play() : stop();
            }).observe(track);
        } else { visible = true; play(); }

        // layout may shift once images/fonts arrive
        window.addEventListener('load', buildDots);
    }
})();
