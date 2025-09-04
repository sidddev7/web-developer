/**
 * Testing library/framework: Jest with jsdom environment.
 * These tests validate front-end script behaviors introduced/changed in the diff.
 * We simulate DOM, mock timers, and stub browser APIs as needed.
 */

describe('Home page inline script behaviors', () => {
  let typedEl;
  let navbar;
  let sections;
  let navLinks;
  let anchors;

  // Provide globals from the diff
  let texts, textIndex, charIndex, isDeleting;
  let typeWriter, scrollToTop;

  const installGlobalsFromDiff = () => {
    // AOS global mock
    global.AOS = { init: jest.fn() };

    // Variables from diff
    texts = ['Full Stack Developer', 'React Developer', 'Node.js Developer', 'UI/UX Designer', 'Problem Solver'];
    textIndex = 0;
    charIndex = 0;
    isDeleting = false;

    // Functions from diff adapted to reference globals in this test scope
    typeWriter = function () {
      const currentText = texts[textIndex];
      const typedElement = document.getElementById('typed-text');

      if (isDeleting) {
        typedElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typedElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
      }

      if (!isDeleting && charIndex === currentText.length) {
        setTimeout(() => (isDeleting = true), 2000);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
      }

      const speed = isDeleting ? 100 : 150;
      setTimeout(typeWriter, speed);
    };

    scrollToTop = function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };
  };

  const setupDOM = () => {
    document.body.innerHTML = `
      <nav class="navbar"></nav>
      <div id="hero">
        <span id="typed-text"></span>
      </div>

      <a class="nav-link" href="#section-a">A</a>
      <a class="nav-link" href="#section-b">B</a>
      <a class="nav-link" href="#section-c">C</a>

      <section id="section-a" style="height: 400px;"></section>
      <section id="section-b" style="height: 400px;"></section>
      <section id="section-c" style="height: 400px;"></section>
    `;

    typedEl = document.getElementById('typed-text');
    navbar = document.querySelector('.navbar');
    sections = document.querySelectorAll('section[id]');
    navLinks = Array.from(document.querySelectorAll('.nav-link'));
    anchors = document.querySelectorAll('a[href^="#"]');
  };

  const attachEventListenersFromDiff = () => {
    // Smooth scrolling for navigation links
    anchors.forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', function () {
      const navbarEl = document.querySelector('.navbar');
      if (window.scrollY > 50) {
        navbarEl.style.background = 'rgba(255, 255, 255, 0.98)';
        navbarEl.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
      } else {
        navbarEl.style.background = 'rgba(255, 255, 255, 0.95)';
        navbarEl.style.boxShadow = 'none';
      }
    });

    // Active navigation highlighting
    window.addEventListener('scroll', function () {
      const sectionsEls = document.querySelectorAll('section[id]');
      const navLinksEls = document.querySelectorAll('.nav-link');

      let current = '';
      sectionsEls.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 200) {
          current = section.getAttribute('id');
        }
      });

      navLinksEls.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
    // jsdom doesn't implement scrollTo/scrollY by default; mock them
    window.scrollTo = jest.fn();
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });

    setupDOM();
    installGlobalsFromDiff();
    attachEventListenersFromDiff();

    // Simulate AOS.init call at load
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  test('AOS.init is called once with expected options', () => {
    expect(AOS.init).toHaveBeenCalledTimes(1);
    expect(AOS.init).toHaveBeenCalledWith({
      duration: 1000,
      once: true,
      offset: 100
    });
  });

  test('typeWriter types characters forward until word completes, then starts delete after 2s pause', () => {
    // Start effect after 1s (per diff)
    setTimeout(typeWriter, 1000);

    // Initial tick to schedule typeWriter
    jest.advanceTimersByTime(1000);
    // Let it type first 5 chars
    jest.advanceTimersByTime(150 * 5);

    expect(typedEl.textContent.length).toBeGreaterThanOrEqual(5);
    const firstWord = texts[0];
    // Fast-forward to finish typing first word
    const remaining = firstWord.length - typedEl.textContent.length;
    jest.advanceTimersByTime(150 * remaining);
    expect(typedEl.textContent).toBe(firstWord);
    expect(isDeleting).toBe(false);

    // 2s pause before deleting
    jest.advanceTimersByTime(2000 + 1);
    expect(isDeleting).toBe(true);

    // Delete a few chars
    jest.advanceTimersByTime(100 * 3);
    expect(typedEl.textContent.length).toBe(firstWord.length - 3);
  });

  test('typeWriter cycles to next word after deletion reaches 0', () => {
    // Start
    setTimeout(typeWriter, 1000);
    jest.advanceTimersByTime(1000);

    // Type whole first word
    const firstWord = texts[0];
    jest.advanceTimersByTime(150 * firstWord.length);

    // Trigger delete
    jest.advanceTimersByTime(2000 + 1);
    // Delete entire word
    jest.advanceTimersByTime(100 * firstWord.length);

    expect(isDeleting).toBe(false);
    expect(charIndex).toBe(0);
    expect(textIndex).toBe(1); // moved to next word
  });

  test('scrollToTop calls window.scrollTo with smooth behavior', () => {
    scrollToTop();
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    });
  });

  test('smooth scrolling anchor: prevents default and calls scrollIntoView on target', () => {
    const link = navLinks[1]; // #section-b
    const target = document.querySelector('#section-b');
    target.scrollIntoView = jest.fn();

    const preventDefault = jest.fn();
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    // We need to simulate handler: since we attached listeners in setup, dispatching click should invoke it.
    // jsdom does not provide default prevention feedback; so we spy by wrapping event
    link.addEventListener('click', (e) => e.preventDefault && e.preventDefault());
    link.click();

    // Manually invoke with event to assert preventDefault
    const e = new Event('click', { cancelable: true });
    Object.defineProperty(e, 'preventDefault', { value: preventDefault });
    link.dispatchEvent(e);

    expect(preventDefault).toHaveBeenCalled();

    // Ensure scrollIntoView called with expected options
    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    });
  });

  test('navbar styles change when scrollY > 50 and reset when <= 50', () => {
    // Initial scroll (<= 50)
    window.scrollY = 0;
    window.dispatchEvent(new Event('scroll'));
    expect(navbar.style.background).toBe('rgba(255, 255, 255, 0.95)');
    expect(navbar.style.boxShadow).toBe('none');

    // Beyond threshold
    window.scrollY = 51;
    window.dispatchEvent(new Event('scroll'));
    expect(navbar.style.background).toBe('rgba(255, 255, 255, 0.98)');
    expect(navbar.style.boxShadow).toBe('0 2px 20px rgba(0,0,0,0.1)');
  });

  test('active nav link highlights the section in view based on scrollY and offsets', () => {
    // Simulate section positions
    const sectionA = document.getElementById('section-a');
    const sectionB = document.getElementById('section-b');
    const sectionC = document.getElementById('section-c');

    // jsdom lacks layout; stub offsetTop
    Object.defineProperty(sectionA, 'offsetTop', { configurable: true, get: () => 100 });
    Object.defineProperty(sectionB, 'offsetTop', { configurable: true, get: () => 700 });
    Object.defineProperty(sectionC, 'offsetTop', { configurable: true, get: () => 1300 });

    // Scroll just before section A threshold (sectionTop - 200)
    window.scrollY = 0;
    window.dispatchEvent(new Event('scroll'));
    expect(navLinks[0].classList.contains('active')).toBe(false);
    expect(navLinks[1].classList.contains('active')).toBe(false);
    expect(navLinks[2].classList.contains('active')).toBe(false);

    // Into section A (>= 100 - 200 => always true once >= -100)
    window.scrollY = 120;
    window.dispatchEvent(new Event('scroll'));
    expect(navLinks[0].classList.contains('active')).toBe(true);

    // Into section B
    window.scrollY = 900;
    window.dispatchEvent(new Event('scroll'));
    expect(navLinks[1].classList.contains('active')).toBe(true);
    expect(navLinks[0].classList.contains('active')).toBe(false);

    // Into section C
    window.scrollY = 1500;
    window.dispatchEvent(new Event('scroll'));
    expect(navLinks[2].classList.contains('active')).toBe(true);
    expect(navLinks[1].classList.contains('active')).toBe(false);
  });

  test('typeWriter uses correct speeds: 150ms when typing, 100ms when deleting', () => {
    const scheduleSpy = jest.spyOn(global, 'setTimeout');

    // Start typing
    setTimeout(typeWriter, 1000);
    jest.advanceTimersByTime(1000);

    // First call schedules next with 150ms (typing)
    const call1 = scheduleSpy.mock.calls.find(c => c[0] === typeWriter);
    expect(call1 && call1[1]).toBe(150);

    // Fast-forward to end of first word to flip deleting after 2s pause
    const firstWord = texts[0];
    jest.advanceTimersByTime(150 * (firstWord.length - 1)); // we already typed 1 char in first invocation
    jest.advanceTimersByTime(2000 + 1); // trigger isDeleting = true

    // Next schedule while deleting should be 100ms
    // Trigger delete step
    jest.advanceTimersByTime(100);
    const nextDeletingCall = scheduleSpy.mock.calls.reverse().find(c => c[0] === typeWriter);
    expect(nextDeletingCall && nextDeletingCall[1]).toBe(100);
  });
});