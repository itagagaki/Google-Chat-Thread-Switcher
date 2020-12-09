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
    const index = select.selectedIndex - 1;
    if (index >= 0) {
      const textbox = threadHeadersArray[index].parentNode.querySelector('[role="textbox"]');
      if (textbox) {
        textbox.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});
        currentRoom.firstChild.scrollTop += 60;
      }
      select.selectedIndex = 0;
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
  console.log('location:'+document.location.href+' => roomId:'+roomId);
  let threadHeaders;
  currentRoom = document.querySelector(`[data-group-id="space/${roomId}"][role="main"]`);
  if (currentRoom === undefined || currentRoom === null) {
    console.log('Room element not found.');
    return null;
  }
  threadHeaders = currentRoom.querySelectorAll('[role="heading"][aria-label]');
  threadHeadersArray = Array.from(threadHeaders);
  if (threadHeadersArray.length == 0) {
    console.log('No threads.');
    return null;
  }

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

      const head = document.createElement('option');
      head.hidden = true;
      head.disabled = true;
      head.className = 'thread-selector-head';
      head.innerText = 'スレッド移動';
      groupDOM.appendChild(head);

      /* append all the threads in the group */
      group.threads
        .forEach(thread => groupDOM.appendChild(thread));

      groupDOM.selectedIndex = 0;
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
  const reference = document.querySelector('c-wiz');
  if (reference === null) {
    console.log('Could not find a point to inject switcher.');
    return;
  }
  const target = reference.nextElementSibling;

  let switcher;
  /* if we are not in a room, don't build a switcher */
  if (!isRoom()) {
    console.log('Not in a room. location:'+document.location.href);
    switcher = null;
  }
  else {
    switcher = buildSwitcher();
  }
  if (switcher) {
    if (target.id !== 'thread-switcher') {
      /* switcher doesn't exist yet! add it */
      reference.parentNode.insertBefore(switcher, reference.nextSibling);
    }
    if (target.textContent !== switcher.textContent) {
      /* we found new threads since the last run, update switcher */
      reference.parentNode.replaceChild(switcher, target);
    }
  }
  else {
    if (target.id === 'thread-switcher') {
      reference.parentNode.removeChild(target);
    }
  }
};

/* css overrides for existing and new controls */
const injectCSS = () => {
  const cssOverride = document.createElement('style');
  cssOverride.innerHTML = `
    #thread-switcher {}
    #thread-selector {
      position: absolute;
      top: 65px;
      right: 0px;
      width: 120px;
      z-index: 2147483647;
    }
    .thread-selector-head {}
    .thread-item {}
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
