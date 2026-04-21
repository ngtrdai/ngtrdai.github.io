(function () {
  const status = document.getElementById('event-status');
  const ipStatus = document.getElementById('ip-status');
  const ipInput = document.getElementById('test-ip-input');
  const saveTestIpButton = document.getElementById('save-test-ip');
  const clearTestIpButton = document.getElementById('clear-test-ip');

  const updateStatus = function (message) {
    if (status) {
      status.textContent = message;
    }
  };

  const updateIpStatus = function (ip) {
    if (!ipStatus) {
      return;
    }

    if (ip) {
      ipStatus.textContent =
        'IP override: ' +
        ip +
        ' (applied via X-Coad-Test-IP in debug/local mode, reload page to ensure first ad call uses it)';
      return;
    }

    ipStatus.textContent = 'IP override: off (default: browser source IP)';
  };

  const trackEvent = function (eventName) {
    const analytics = window.coadAnalytics;

    if (analytics && typeof analytics.trackEvent === 'function') {
      analytics.trackEvent(eventName);
      updateStatus('Tracked event: ' + eventName);
      return true;
    }

    updateStatus('Analytics bundle loaded, but trackEvent is unavailable on window.coadAnalytics.');
    return false;
  };

  const clickableTrackers = document.querySelectorAll('[data-track-event]');
  clickableTrackers.forEach(function (element) {
    element.addEventListener('click', function () {
      const eventName = element.getAttribute('data-track-event');
      if (eventName) {
        trackEvent(eventName);
      }
    });
  });

  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach(function (element) {
    observer.observe(element);
  });

  if (typeof window.__setCoadTestIp === 'function') {
    const currentIp = window.__coadTestIp || (ipInput ? ipInput.value : '') || '';
    if (currentIp && !window.__coadTestIp) {
      window.__setCoadTestIp(currentIp);
    }
    if (ipInput) {
      ipInput.value = currentIp;
    }
    updateIpStatus(currentIp);

    if (saveTestIpButton) {
      saveTestIpButton.addEventListener('click', function () {
        const value = ipInput ? ipInput.value : '';
        const savedIp = window.__setCoadTestIp(value);

        if (!savedIp && value && value.trim()) {
          updateIpStatus('');
          updateStatus('Invalid IP format. Use IPv4 (x.x.x.x) or IPv6 (contains :).');
          return;
        }

        if (ipInput) {
          ipInput.value = savedIp;
        }

        updateIpStatus(savedIp);
        updateStatus(
          savedIp
            ? 'Saved test IP override: ' + savedIp
            : 'Cleared test IP override. Browser source IP will be used.'
        );
      });
    }

    if (clearTestIpButton) {
      clearTestIpButton.addEventListener('click', function () {
        window.__setCoadTestIp('');
        if (ipInput) {
          ipInput.value = '';
        }
        updateIpStatus('');
        updateStatus('Cleared test IP override. Browser source IP will be used.');
      });
    }
  }
})();
