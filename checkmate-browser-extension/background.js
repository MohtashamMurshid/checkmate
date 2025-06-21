// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "toggleBlocklist",
    title: "Toggle CheckMate Button for this site",
    contexts: ["page"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toggleBlocklist") {
    // Get the hostname from the current tab
    const url = new URL(tab.url);
    const hostname = url.hostname.toLowerCase();
    
    // Get the current blocklist
    chrome.storage.local.get(['checkmate-blocklist'], (result) => {
      let blocklist = result['checkmate-blocklist'] || [];
      
      if (Array.isArray(blocklist)) {
        const isBlocked = blocklist.includes(hostname);
        
        if (isBlocked) {
          // Remove from blocklist
          blocklist = blocklist.filter(site => site !== hostname);
          chrome.storage.local.set({ 'checkmate-blocklist': blocklist }, () => {
            chrome.tabs.sendMessage(tab.id, { 
              action: 'showNotification',
              message: `CheckMate button enabled for ${hostname}`
            });
          });
        } else {
          // Add to blocklist
          blocklist.push(hostname);
          chrome.storage.local.set({ 'checkmate-blocklist': blocklist }, () => {
            chrome.tabs.sendMessage(tab.id, { 
              action: 'showNotification',
              message: `CheckMate button disabled for ${hostname}`
            });
          });
        }
      }
    });
  }
}); 