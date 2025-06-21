(() => {
  if (document.getElementById("checkmate-generic-btn")) {
    return;
  }

  // Default whitelist of sites where the button should appear
  const defaultWhitelist = [
    // Malaysian news sites
    "thestar.com.my",
    "nst.com.my",
    "malaymail.com",
    "freemalaysiatoday.com",
    "malaysianow.com",
    "malaysiakini.com",
    "astroawani.com",
    "bernama.com",
    "theedgemarkets.com",
    "themalaysianinsight.com",
    "wired.com",
    // International news sites
    "bbc.com",
    "cnn.com",
    "reuters.com",
    "ap.org",
    "theguardian.com",
    "aljazeera.com",
    "channelnewsasia.com",
    "straitstimes.com",
    // General article platforms
    "medium.com",
    "substack.com",
    "x.com"
  ];

  // Get or initialize the whitelist from chrome.storage
  const getWhitelist = () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['checkmate-whitelist'], (result) => {
        if (!result['checkmate-whitelist']) {
          chrome.storage.local.set({ 'checkmate-whitelist': defaultWhitelist });
          resolve(defaultWhitelist);
        } else {
          resolve(result['checkmate-whitelist']);
        }
      });
    });
  };

  // Add a site to the whitelist
  const addToWhitelist = async (site) => {
    const whitelist = await getWhitelist();
    if (!whitelist.includes(site)) {
      whitelist.push(site);
      await chrome.storage.local.set({ 'checkmate-whitelist': whitelist });
    }
  };

  // Remove a site from the whitelist
  const removeFromWhitelist = async (site) => {
    const whitelist = await getWhitelist();
    const index = whitelist.indexOf(site);
    if (index > -1) {
      whitelist.splice(index, 1);
      await chrome.storage.local.set({ 'checkmate-whitelist': whitelist });
    }
  };

  // Check if current site is blocked
  const isBlocked = () => {
    return new Promise((resolve) => {
      const currentHostname = window.location.hostname.toLowerCase();
      chrome.storage.local.get(['checkmate-blocklist'], (result) => {
        const blocklist = result['checkmate-blocklist'] || [];
        resolve(blocklist.includes(currentHostname));
      });
    });
  };

  // Check if current site is whitelisted
  const isWhitelisted = async () => {
    const currentHostname = window.location.hostname.toLowerCase();
    const whitelist = await getWhitelist();
    return whitelist.some(site => currentHostname === site || currentHostname.endsWith('.' + site));
  };

  // Check if button should be shown (whitelisted AND not blocked)
  const shouldShowButton = async () => {
    const whitelisted = await isWhitelisted();
    const blocked = await isBlocked();
    return whitelisted && !blocked;
  };

  // Create and show a notification
  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 2147483647;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: opacity 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showNotification') {
      showNotification(request.message);
    }
  });

  // Wait for DOM to be ready before initializing
  const initializeButton = async () => {
    // Don't run on localhost or in iframes, and only run on allowed sites
    if (
      window.location.hostname === "localhost" || 
      window.location.hostname === "127.0.0.1" ||
      window.self !== window.top ||
      !(await shouldShowButton())
    ) {
      return;
    }

    const btn = document.createElement("button");
    btn.id = "checkmate-generic-btn";
    btn.style.cssText = `
      position: fixed;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2147483647;
      background: hsl(331.8947 97.9381% 38.0392%);
      color: white;
      border: none;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    `;
    btn.setAttribute("aria-label", "Analyze with CheckMate");
    btn.setAttribute("title", "Analyze with CheckMate");

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-50%) scale(1.1)';
      btn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(-50%) scale(1)';
      btn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    });

    const span = document.createElement("span");
    span.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    `;
    span.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-check-icon lucide-search-check"><path d="m8 11 2 2 4-4"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    `;
    btn.appendChild(span);

    btn.addEventListener("click", () => {
      const url = window.location.href;
      window.open(`http://localhost:3000/?link=${encodeURIComponent(url)}`, "_blank");
    });

    document.body.appendChild(btn);
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeButton);
  } else {
    // DOM is already ready
    initializeButton();
  }

  // Expose whitelist management to global scope for debugging and manual management
  window.checkmate = {
    addToWhitelist,
    removeFromWhitelist,
    getWhitelist,
    isWhitelisted,
    isBlocked,
    shouldShowButton
  };


})();
