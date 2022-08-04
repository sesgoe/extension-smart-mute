let currentAudioTab: number | undefined = undefined;
let mutedTabs: number[] = [];

const tabUpdated = async (
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
) => {
  if (changeInfo.audible) {
    if (currentAudioTab === tabId) {
      return;
    }

    if (currentAudioTab !== undefined) {
      mutedTabs.push(currentAudioTab);
      chrome.tabs.update(currentAudioTab!!, { muted: true });
    }

    currentAudioTab = tabId;
  }

  if (changeInfo.audible === false) {
    if (currentAudioTab === tabId) {
      if (mutedTabs.length > 0) {
        currentAudioTab = mutedTabs.shift();
        chrome.tabs.update(currentAudioTab!!, { muted: false });
      } else {
        currentAudioTab = undefined;
      }
    }
  }
};

const tabRemoved = async (
  tabId: number,
  removeInfo: chrome.tabs.TabRemoveInfo
) => {
  if (removeInfo.isWindowClosing) {
    mutedTabs = [];
    currentAudioTab = undefined;
  }

  if (tabId === currentAudioTab) {
    if (mutedTabs.length > 0) {
      currentAudioTab = mutedTabs.pop();
      chrome.tabs.update(currentAudioTab!!, { muted: false });
    }
  } else if (mutedTabs.includes(tabId)) {
    mutedTabs = mutedTabs.filter((tabId) => tabId !== tabId);
  }
};

chrome.tabs.onUpdated.addListener(tabUpdated);
chrome.tabs.onRemoved.addListener(tabRemoved);
