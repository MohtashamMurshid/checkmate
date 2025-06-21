// content.js — TikTok Embed URL Extractor → localhost
(() => {
  function extractTikTokEmbedURL() {
    return new Promise((resolve, reject) => {
      const shareBtn = document.querySelector(
        '[data-e2e="share-button"], [data-e2e="video-share-button"], button[data-e2e="browse-share"], [aria-label*="Share"]'
      );
      if (!shareBtn) return reject(new Error("Share button not found."));
      shareBtn.click();

      const embedPoll = setInterval(() => {
        const embedBtn = document.querySelector('[data-e2e="share-embed"]');
        if (!embedBtn) return;
        clearInterval(embedPoll);
        (embedBtn.querySelector('[tabindex]') || embedBtn).click();

        const textareaPoll = setInterval(() => {
          const textarea = document.querySelector(
            'textarea.css-fvmwqw-TextareaEmbedCode'
          );
          if (!textarea) return;

          clearInterval(textareaPoll);
          const match = textarea.value.match(/cite="([^"]+)"/);
          if (match) {
            const url = match[1];
            closeEmbedModal();
            resolve(url);
          } else {
            closeEmbedModal();
            reject(new Error("Video URL not found in embed code."));
          }
        }, 200);

        setTimeout(() => {
          clearInterval(textareaPoll);
          reject(new Error("Embed code textarea not found."));
        }, 3000);
      }, 200);

      setTimeout(() => {
        clearInterval(embedPoll);
        reject(new Error("Embed button not found."));
      }, 3000);
    });
  }

  function closeEmbedModal() {
    document.querySelector('.css-zwzupe-DivXMarkWrapper')?.click();
  }

  function injectButton() {
    if (document.getElementById("tt-localhost-btn")) return;

    const feedNav = document.querySelector('.css-1o2f1ti-DivFeedNavigationContainer');
    if (!feedNav) return;

    const btn = document.createElement("button");
    btn.id = "tt-localhost-btn";
    btn.style.cssText = `
      position: absolute;
      right: 120%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 10px;
      z-index: 9999;
      background: hsl(331.8947 97.9381% 38.0392%);
      border: none;
      border-radius: 12px;
      width: 45px;
      height: 45px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    btn.setAttribute("aria-label", "Send to localhost");
    btn.setAttribute("title", "CheckMate fact checker");

    // Add hover effects
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
      extractTikTokEmbedURL()
        .then((url) => {
          navigator.clipboard?.writeText(url).catch(() => { });
          window.open(`http://localhost:3000/?link=${encodeURIComponent(url)}`, "_blank");
        })
        .catch((err) => alert(err.message));
    });

    feedNav.appendChild(btn);
  }

  const observer = new MutationObserver(injectButton);
  observer.observe(document.body, { childList: true, subtree: true });

  injectButton();
})();

