(() => {
  if (document.getElementById("checkmate-generic-btn")) {
    return;
  }

  // Default blocklist of sites where the button should not appear
  const defaultBlocklist = [
    "google.com",
    "facebook.com",
    "instagram.com",
    "lazada.com.my",
    "shopee.com.my",
    "mudah.my",
    "waze.com",
    "grab.com",
    "gmail.com",
    "youtube.com"
  ];

  // Get or initialize the blocklist from chrome.storage
  const getBlocklist = () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['checkmate-blocklist'], (result) => {
        if (!result['checkmate-blocklist']) {
          chrome.storage.local.set({ 'checkmate-blocklist': defaultBlocklist });
          resolve(defaultBlocklist);
        } else {
          resolve(result['checkmate-blocklist']);
        }
      });
    });
  };

  // Add a site to the blocklist
  const addToBlocklist = async (site) => {
    const blocklist = await getBlocklist();
    if (!blocklist.includes(site)) {
      blocklist.push(site);
      await chrome.storage.local.set({ 'checkmate-blocklist': blocklist });
    }
  };

  // Remove a site from the blocklist
  const removeFromBlocklist = async (site) => {
    const blocklist = await getBlocklist();
    const index = blocklist.indexOf(site);
    if (index > -1) {
      blocklist.splice(index, 1);
      await chrome.storage.local.set({ 'checkmate-blocklist': blocklist });
    }
  };

  // Check if current site is blocked
  const isBlocked = async () => {
    const currentHostname = window.location.hostname.toLowerCase();
    const blocklist = await getBlocklist();
    return blocklist.some(site => currentHostname === site || currentHostname.endsWith('.' + site));
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

  // Initialize and check if blocked
  (async () => {
    // Don't run on localhost or in iframes or blocked sites
    if (
      window.location.hostname === "localhost" || 
      window.location.hostname === "127.0.0.1" ||
      window.self !== window.top ||
      await isBlocked()
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
      window.open(`http://localhost:3000/?url=${encodeURIComponent(url)}`, "_blank");
    });

    document.body.appendChild(btn);
  })();

  // Expose blocklist management to global scope for debugging and manual management
  window.checkmate = {
    addToBlocklist,
    removeFromBlocklist,
    getBlocklist,
    isBlocked
  };
})(); 