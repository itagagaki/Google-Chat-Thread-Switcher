/* helper methods for checking if current page is a DM or a Room */
const isDM = () => document.location.href.replace(/^https:\/\/chat\.google\.com\/([^\/\?]+).*$/, '$1') === 'dm';
const isRoom = () => document.location.href.replace(/^https:\/\/chat\.google\.com\/([^\/\?]+).*$/, '$1') === 'room';
let lastLocationHref;
let currentRoom;
let threadHeadersArray;

const switchThread = function()
{
  const select = document.getElementById('thread-selector');
  if (select) {
    const textbox = threadHeadersArray[select.selectedIndex].parentNode.querySelector('[role="textbox"]');
    if (textbox) {
      textbox.scrollIntoView(false);
      currentRoom.scrollTop += 60;
    }
  }
}

/* transform text from a thread summary */
const formatTitleFromThreadHeading = (title) => {
  return title
  //.replace(/Thread by [^\.]*\./, '') /* remove thread creator */
    .replace(/\. \d+ (Replies|Reply)\./, '') /* remove number of replies */
    .replace(/\. \d+ 件の返信/, '')
    .replace(/\. [^\.]*\d+\:\d+( (A|P)M)?/, '') /* remove string with thread start date */
    .replace(/. Last updated.*$/, '') /* remove everything after "Last updated */
    .replace(/\. 最終更新.*$/, '')
    .replace(/\. Now$/, '') /* remove 'Now' that's added for brand new threads */
    .replace(/\. たった今$/, '')
    .replace(/\. \d+ mins?$/, '') /* remove minute counter for brand new threads */
    .replace(/\. \d+ 分前/, '') /* remove minute counter for brand new threads */
  //.replace(/\d+ Unread\./, ''); /* remove unread counter */
    .replace(/\n.*/gm, '') /* remove the second line and beyond */
    .replace(/。.*/gm, '') /* remove 2nd sentence and beyond */
    .replace(/\*([^(\*)]+)\*/g, '$1'); /* remove bold markdown */
    //.replace(/【([^(【】)]+)】/g, '$1'); /* remove 【】 */
};

/* helper methods for group configs */
const hasEmoji = emoji => thread => thread.threadHeading.includes(emoji);
const updatedToday = thread => thread.threadHeading.match(/Last updated: \d+:\d+ (A|P)M/);
const updatedNow = thread => thread.threadHeading.match(/Last updated: Now/);
const addedNow = thread => thread.threadHeading.match(/\. Now$/);
const addedNMinutesAgo = thread => thread.threadHeading.match(/(\.|\:) \d+ mins?$/);
const updatedYesterday = thread => thread.threadHeading.match(/Last updated: Yesterday \d+:\d+ (A|P)M/);
const fallback = () => true;

/* default group config, you can set your own in localstorage if you want */
const groupingConfigs = window.localStorage.getItem('thread-group-configs') || [
  { label: 'Pinned', check: [hasEmoji('📌'), hasEmoji('⭐'), hasEmoji('🔔')] },
  { label: 'Hidden', check: [hasEmoji('🔕'), hasEmoji('⛔'), hasEmoji('🚫')], shouldHide: true },
  { label: 'Today', check: [updatedToday, updatedNow, addedNow, addedNMinutesAgo] }, /* updated today */
  { label: 'Yesterday', check: [updatedYesterday] }, /* updated yesterday */
  { label: 'Older', check: [fallback] }, /* updated before yesterday */
];

/* some very complicated logic for putting threads into groups */
const groupThreads = (threadSelectors, configs) => {
  /* add a threads field for each config (where we will put the relevant threads) */
  const configsWithThreads = configs
    .map(config => ({ ...config, threads: [] }));

  /* for each thread, find the first config where some check passes */
  /* and add the thread to that config */
  return threadSelectors
    .reduce((groupConfigs, thread) => {
      const passingConfigIndex = groupConfigs.findIndex(config => config.check.some(check => check(thread)));
      const passingConfig = groupConfigs[passingConfigIndex];
      const updatedConfig = { ...passingConfig, threads: [...passingConfig.threads, thread] };
      return groupConfigs
        .map((config, configIndex) => configIndex === passingConfigIndex ? updatedConfig : config);
    }, configsWithThreads);
};

/* build the switcher */
const buildSwitcher = () => {
  /* query for threads in this room */
  const roomId = document.location.href.replace(/^https:\/\/chat\.google\.com\/room\/([^\/\?]+).*$/, '$1');
  let threadHeaders;
  currentRoom = document.querySelector(`[data-group-id="space/${roomId}"][role="main"]`);
  if (currentRoom === undefined || currentRoom === null) {
    return null;
  }
  currentRoom = currentRoom.firstChild;
  if (currentRoom === undefined || currentRoom === null) {
    return null;
  }
  threadHeaders = currentRoom.querySelectorAll('[role="heading"][aria-label]');
  if (threadHeaders === undefined || threadHeaders === null) {
    return null;
  }
  threadHeadersArray = Array.from(threadHeaders);

  /* build selectors (buttons) that will unhide the thread */
  const threadSelectors = threadHeadersArray
    .map((thread) => {
      const newSelector = document.createElement('option');
      newSelector.className = 'thread-item';
      newSelector.threadHeading = thread.textContent;
      const titleArr = thread.textContent.split('.');
      if (titleArr[0].indexOf('Unread') >= 0 || titleArr[0].indexOf('未読') >= 0) {
        newSelector.className = newSelector.className + ' thread-unread';
        titleArr.shift();
      }
      titleArr.shift();
      newSelector.innerText = formatTitleFromThreadHeading(titleArr.join('.'));
      return newSelector;
    });

  /* create the switcher DOM */
  const switcher = document.createElement('div');
  switcher.id = 'thread-switcher';

  /* build groups based on checks in the group configs */
  const groupings = groupThreads(threadSelectors, groupingConfigs);

  /* build container DOM based on the groups */
  const groupContainers = groupings
    .filter(group => group.threads.length > 0) /* remove any groups where there are no threads */
    .filter(group => !group.shouldHide) /* don't add any threads that should be hidden */
    .map((group, groupIndex, unfilteredGroups) => {
      /* build groups */
      const groupDOM = document.createElement('select');
      //groupDOM.id = `thread-group-${group.label}`;
      groupDOM.id = 'thread-selector';
      groupDOM.onchange = switchThread;

      /* don't add group label if there's only one group */
      if (unfilteredGroups.length > 1) {
        /* create and append group heading */
        const groupHeading = document.createElement('option');
        //groupHeading.className = 'thread-group-heading';
        groupHeading.innerText = group.label;
        groupDOM.appendChild(groupHeading);
      }

      /* append all the threads in the group */
      group.threads
        .forEach(thread => groupDOM.appendChild(thread));

      return groupDOM;
    });

  /* append each group container to the switcher */
  groupContainers
    .forEach(groupContainer => switcher.appendChild(groupContainer));

  return switcher;
};

/* logic for injecting the switcher into the page */
/* (this gets called at an interval, and will replace an existing switcher if there are updates) */
const insertSwitcher = () => {
  /* if we are not in a room, don't build a switcher */
  if (!isRoom()) { return; }

  const switcher = buildSwitcher();
  if (switcher === null) {
    return;
  }

  const roomId = document.location.href.replace(/^https:\/\/chat\.google\.com\/room\/([^\/\?]+).*$/, '$1');
  const target = document.querySelector(`div[data-soft-view-id="space/${roomId}"]`);
  const lastChild = target.lastChild;
  if (lastChild.id !== 'thread-switcher') {
    /* switcher doesn't exist yet! add it */
    target.insertBefore(switcher, target.nextSibling);
  }
  if (lastChild.textContent !== switcher.textContent) {
    /* we found new threads since the last run, update switcher */
    target.replaceChild(switcher, target.lastChild);
  }
};

/* css overrides for existing and new controls */
const injectCSS = () => {
  const cssOverride = document.createElement('style');
  cssOverride.innerHTML = `
    #thread-switcher {}
    #thread-selector {
      position: fixed;
      top: 65px;
      right: 0px;
      width: 200px;
    }
    .thread-item { }
    .thread-unread { font-weight: bold; }
  `;
  document.body.appendChild(cssOverride);
};

/* trigger the whole process */
const run = () => {
  //const scrollContainer = document.querySelector('c-wiz[data-group-id][data-is-client-side] > div:nth-child(1)');
  insertSwitcher();
  lastLocationHref = document.location.href;
};

const init = () => {
  const observer = new MutationObserver(function() {
    if (document.location.href == lastLocationHref) {
      //return;
    }
    if (typeof runID === 'number') {
      clearTimeout(runID);
    }
    runID = setTimeout(run, 200);
  });
  injectCSS();
  run();
  observer.observe(document.body, { childList: true, subtree: true });
}

window.onload = function() {
  init();
};
