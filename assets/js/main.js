(() => {
  const menu = document.querySelector('.mobile-menu');
  const openButton = document.querySelector('.menu-toggle');
  const closeButton = document.querySelector('.mobile-menu__close');
  let lastFocus = null;

  const setMenu = (open) => {
    if (!menu || !openButton) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    openButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (open) {
      lastFocus = document.activeElement;
      closeButton.focus();
    } else if (lastFocus) {
      lastFocus.focus();
    }
  };

  openButton?.addEventListener('click', () => setMenu(true));
  closeButton?.addEventListener('click', () => setMenu(false));
  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (!menu?.classList.contains('is-open')) return;
    if (event.key === 'Escape') setMenu(false);
    if (event.key === 'Tab') {
      const items = [...menu.querySelectorAll('a, button')];
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.matchMedia('(min-width: 992px)').addEventListener('change', (event) => {
    if (event.matches && menu?.classList.contains('is-open')) setMenu(false);
  });

  const confettiLayers = document.querySelectorAll('.confetti-section .confetti');
  if (typeof gsap !== 'undefined' && confettiLayers.length) {
    const motion = gsap.matchMedia();

    motion.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const confettiPieces = [...document.querySelectorAll('.confetti-section .confetti img')];
      const piecesBySection = new Map(
        [...document.querySelectorAll('.confetti-section')].map((section) => [
          section,
          [...section.querySelectorAll('.confetti img')]
        ])
      );
      const moveX = gsap.quickTo(confettiLayers, 'x', { duration: 0.8, ease: 'power2.out' });
      const moveY = gsap.quickTo(confettiLayers, 'y', { duration: 0.8, ease: 'power2.out' });
      const maxTravel = 18;
      let hoveredPiece = null;

      const setHoveredPiece = (piece) => {
        if (piece === hoveredPiece) return;
        if (hoveredPiece) gsap.to(hoveredPiece, { scale: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
        if (piece) gsap.to(piece, { scale: 1.15, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
        hoveredPiece = piece;
      };

      const followPointer = (event) => {
        if (event.pointerType && event.pointerType !== 'mouse') return;
        moveX((event.clientX / window.innerWidth - 0.5) * maxTravel * 2);
        moveY((event.clientY / window.innerHeight - 0.5) * maxTravel * 2);

        const section = event.target.closest?.('.confetti-section');
        const piece = piecesBySection.get(section)?.find((image) => {
          const bounds = image.getBoundingClientRect();
          return event.clientX >= bounds.left && event.clientX <= bounds.right &&
            event.clientY >= bounds.top && event.clientY <= bounds.bottom;
        });
        setHoveredPiece(piece || null);
      };
      const resetPosition = () => {
        moveX(0);
        moveY(0);
        setHoveredPiece(null);
      };

      window.addEventListener('pointermove', followPointer, { passive: true });
      window.addEventListener('blur', resetPosition);
      document.documentElement.addEventListener('pointerleave', resetPosition);

      return () => {
        window.removeEventListener('pointermove', followPointer);
        window.removeEventListener('blur', resetPosition);
        document.documentElement.removeEventListener('pointerleave', resetPosition);
        gsap.killTweensOf(confettiPieces);
        gsap.set(confettiPieces, { clearProps: 'transform' });
      };
    });
  }

  const flareButtons = document.querySelectorAll('.button--flare, .button--outline');
  if (typeof gsap !== 'undefined' && flareButtons.length) {
    gsap.matchMedia().add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const cleanups = [...flareButtons].map((button) => {
        const flare = button.querySelector('.button__flare');
        if (!flare) return () => {};

        const pointerPosition = (event) => {
          const bounds = button.getBoundingClientRect();
          return {
            xPercent: Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100)),
            yPercent: Math.max(0, Math.min(100, (event.clientY - bounds.top) / bounds.height * 100))
          };
        };

        const showFlare = (event) => {
          gsap.killTweensOf(flare);
          gsap.set(flare, { ...pointerPosition(event), scale: 0 });
          gsap.to(flare, { scale: 1, duration: 0.45, ease: 'power2.out' });
        };
        const moveFlare = (event) => {
          gsap.to(flare, {
            ...pointerPosition(event),
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        };
        const hideFlare = (event) => {
          gsap.killTweensOf(flare);
          gsap.to(flare, {
            ...pointerPosition(event),
            scale: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        };

        button.addEventListener('pointerenter', showFlare);
        button.addEventListener('pointermove', moveFlare);
        button.addEventListener('pointerleave', hideFlare);

        return () => {
          button.removeEventListener('pointerenter', showFlare);
          button.removeEventListener('pointermove', moveFlare);
          button.removeEventListener('pointerleave', hideFlare);
          gsap.killTweensOf(flare);
          gsap.set(flare, { clearProps: 'transform' });
        };
      });

      return () => {
        cleanups.forEach((cleanup) => cleanup());
      };
    });
  }

  const logoStar = document.querySelector('.site-logo__star');
  const logoCenterStar = document.querySelector('.site-logo__center-star');
  const logoBurst = document.querySelector('.site-logo__burst');
  if (typeof gsap !== 'undefined' && logoStar && logoCenterStar && logoBurst) {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set([logoStar, logoBurst], {
        opacity: 0,
        scale: 0,
        transformOrigin: '50% 50%'
      });
      gsap.set(logoCenterStar, { scale: 1, transformOrigin: '50% 50%' });

      gsap.timeline()
        .to(logoStar, {
          opacity: 1,
          scale: 1.15,
          duration: 0.55,
          ease: 'power2.out'
        })
        .to(logoCenterStar, {
          scale: 1.13,
          duration: 0.55,
          ease: 'power2.out'
        }, '<')
        .to(logoStar, {
          scale: 1,
          duration: 0.25,
          ease: 'power2.inOut'
        })
        .to(logoCenterStar, {
          scale: 1,
          duration: 0.25,
          ease: 'power2.inOut'
        }, '<')
        .to(logoBurst, {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.4)'
        });
    });
  }

  const stepBursts = document.querySelectorAll('.nomination__step-burst');
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && stepBursts.length) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      stepBursts.forEach((burst, index) => {
        const rays = burst.querySelector('.nomination__step-rays');
        const dots = burst.querySelector('.nomination__step-dots');
        gsap.set([rays, dots], {
          opacity: 0,
          scale: 0,
          transformOrigin: '50% 50%'
        });

        gsap.timeline({
          delay: index * 0.12,
          scrollTrigger: {
            trigger: burst.closest('.nomination__step'),
            start: 'top 80%',
            once: true
          }
        })
          .to(rays, { opacity: 1, scale: 1.3, duration: 0.5, ease: 'power2.out' })
          .to(rays, { scale: 0.86, duration: 0.2, ease: 'power2.inOut' })
          .to(rays, { scale: 1.1, duration: 0.18, ease: 'power2.out' })
          .to(rays, { scale: 1, duration: 0.2, ease: 'power2.inOut' })
          .to(dots, { opacity: 1, scale: 1.55, duration: 0.42, ease: 'power2.out' }, '-=0.08')
          .to(dots, { scale: 0.8, duration: 0.2, ease: 'power2.inOut' })
          .to(dots, { scale: 1.16, duration: 0.18, ease: 'power2.out' })
          .to(dots, { scale: 1, duration: 0.2, ease: 'power2.inOut' });
      });
    });
  }

  const winnersHeadingIcon = document.querySelector('.winners__heading-icon');
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && winnersHeadingIcon) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({
        scrollTrigger: {
          trigger: winnersHeadingIcon.closest('.winners__heading'),
          start: 'top 80%',
          once: true
        }
      })
        .fromTo(winnersHeadingIcon,
          { opacity: 0, scale: 0 },
          {
            opacity: 1,
            scale: 2,
            duration: 0.62,
            ease: 'power2.out',
            immediateRender: true
          }
        )
        .to(winnersHeadingIcon, {
          scale: 1,
          duration: 0.35,
          ease: 'power2.inOut'
        })
        .to(winnersHeadingIcon, {
          scale: 1.5,
          duration: 0.24,
          ease: 'power2.out'
        })
        .to(winnersHeadingIcon, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.inOut'
        });
    });
  }

  const winnerCards = [...document.querySelectorAll('.winner-card[data-youtube-id]')];
  const winnerPosters = new Map(winnerCards.map((card) => [
    card,
    [...card.querySelector('.winner-card__media').childNodes]
  ]));
  let activeWinnerCard = null;
  let winnersSwiper = null;

  const stopWinnerVideo = () => {
    if (!activeWinnerCard) return;

    const media = activeWinnerCard.querySelector('.winner-card__media');
    media.replaceChildren(...winnerPosters.get(activeWinnerCard));
    activeWinnerCard.classList.remove('is-playing');
    activeWinnerCard = null;
  };

  winnerCards.forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.defaultPrevented || winnersSwiper?.allowClick === false || card === activeWinnerCard) return;

      const media = card.querySelector('.winner-card__media');
      const videoId = card.dataset.youtubeId;
      if (!media || !videoId) return;

      stopWinnerVideo();

      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`;
      iframe.title = `${card.querySelector('h3').textContent.trim()} winner video`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';

      media.replaceChildren(iframe);
      card.classList.add('is-playing');
      activeWinnerCard = card;
      iframe.focus();
    });
  });

  if (typeof Swiper !== 'undefined') {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      new Swiper('.deadline__swiper', {
        slidesPerView: 'auto',
        loop: true,
        speed: 10000,
        allowTouchMove: false,
        a11y: false,
        autoplay: {
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }
      });
    }

    winnersSwiper = new Swiper('.winners__swiper', {
      slidesPerView: 1,
      spaceBetween: 16,
      watchOverflow: true,
      keyboard: { enabled: true },
      pagination: { el: '.winners__pagination', clickable: true },
      navigation: { prevEl: '.winners__prev', nextEl: '.winners__next' },
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 24 },
        1200: { slidesPerView: 3.55, spaceBetween: 32 }
      }
    });

    winnersSwiper.on('slideChangeTransitionStart', stopWinnerVideo);
  }
})();

document.querySelectorAll(".about__inner, .hero__content, img, .nomination__intro, .nomination__step, .news, .winners__inner, .site-footer__partners, .categories__content").forEach((intro) => {

    window.gsap.fromTo(
      intro,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 1,
        ease: "power2.out",
        clearProps: "opacity,visibility",
        scrollTrigger: {
          trigger: intro,
          start: "top 85%",
          once: true
        }
      }
    );
  });

const initialiseStickyNavbar = () => {
  const siteHeader = document.querySelector(".site-header");
  const navbar = siteHeader?.querySelector(".navbar");

  if (!siteHeader || !navbar) return;

  let lastScrollPosition = Math.max(window.scrollY, 0);
  let navbarTop = 0;
  let scrollFrame;

  const updateNavbar = () => {
    const scrollPosition = Math.max(window.scrollY, 0);
    const isScrollingUp = scrollPosition < lastScrollPosition;
    const shouldStick = scrollPosition > navbarTop;
    const hasOpenMegaMenu = Boolean(navbar.querySelector(".mega-menu.is-open"));
    const shouldHide = shouldStick && scrollPosition > 200 && !isScrollingUp && !hasOpenMegaMenu;

    siteHeader.classList.toggle("has-sticky-navbar", shouldStick);
    navbar.classList.toggle("is-sticky", shouldStick);
    navbar.classList.toggle("is-hidden", shouldHide);

    lastScrollPosition = scrollPosition;
    scrollFrame = null;
  };

  const measureNavbar = () => {
    siteHeader.classList.remove("has-sticky-navbar");
    navbar.classList.remove("is-sticky", "is-hidden");
    navbarTop = navbar.getBoundingClientRect().top + window.scrollY;
    siteHeader.style.setProperty("--sticky-navbar-height", `${navbar.offsetHeight}px`);
    updateNavbar();
  };

  window.addEventListener(
    "scroll",
    () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateNavbar);
    },
    { passive: true }
  );
  window.addEventListener("resize", measureNavbar);

  measureNavbar();
};

initialiseStickyNavbar();
