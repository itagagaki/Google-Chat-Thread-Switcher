/* helper methods for checking if current page is a DM or a Room */
const isDM = () => document.location.href.split('/').slice(-2)[0] === 'dm';
const isRoom = () => document.location.href.split('/').slice(-2)[0] === 'room';

/* transform text from a thread summary */
const formatTitleFromThreadHeading = (title) => {
  return title
    .replace(/Thread by [^\.]*\./, '') /* remove thread creator */
    .replace(/\d+ (Replies|Reply)\./, '') /* remove number of replies */
    .replace(/\.[^\.]*\d+\:\d+ (A|P)M/, '') /* remove string with thread start date */
    .replace(/Last updated.*$/, '') /* remove everything after "Last updated */
    .replace(/\. Now$/, '') /* remove 'Now' that's added for brand new threads */
    .replace(/\. \d+ mins?$/, '') /* remove minute counter for brand new threads */
    .replace(/\d+ Unread\./, ''); /* remove unread counter */
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

/* build the sidebar and add thread selectors to it */
const buildSidebar = () => {
  /* query for threads in this room */
  const containsThreadContent = element => element.textContent.match(/^Thread by/);
  const roomId = document.location.href.split('/').slice(-1)[0];
  const currentRoom = document.querySelectorAll(`[data-stream-group-id="space/${roomId}"]`)[0];
  const headers = currentRoom.querySelectorAll('[role="heading"]');
  const threads = Array.from(headers).filter(containsThreadContent);

  /* build selectors (buttons) that will unhide the thread */
  const threadSelectors = threads
    .reverse() /* reverse the order of the threads so that the newest appear at the top */
    .map((thread) => {
      const newSelector = document.createElement('button');
      newSelector.className = 'thread-selector';
      newSelector.threadHeading = thread.textContent;
      if (thread.textContent.match(/\d+ Unread\./)) {
        newSelector.className = newSelector.className + ' thread-unread';
      }
      newSelector.innerText = formatTitleFromThreadHeading(thread.textContent);
      newSelector.onclick = (event) => {
        /* hide all previous threads */
        threads
          .map(thread => thread.parentElement)
          .forEach(controller => controller.style.display = '');

        /* make selected thread visible */
        thread.parentElement.style.display = 'inherit';

        /* make thread selector active */
        event.target.className = event.target.className + ' thread-active';
      };
      return newSelector;
    });

  /* create the sidebar DOM */
  const sidebar = document.createElement('div');
  sidebar.className = 'thread-sidebar';

  /* build groups based on checks in the group configs */
  const groupings = groupThreads(threadSelectors, groupingConfigs);

  /* build container DOM based on the groups */
  const groupContainers = groupings
    .filter(group => group.threads.length > 0) /* remove any groups where there are no threads */
    .filter(group => !group.shouldHide) /* don't add any threads that should be hidden */
    .map((group, groupIndex, unfilteredGroups) => {
      /* build groups */
      const groupDOM = document.createElement('div');
      groupDOM.id = `thread-group-${group.label}`;
      groupDOM.className = 'thread-group-container';

      /* don't add group label if there's only one group */
      if (unfilteredGroups.length > 1) {
        /* create and append group heading */
        const groupHeading = document.createElement('h3');
        groupHeading.className = 'thread-group-heading';
        groupHeading.innerText = group.label;
        groupDOM.appendChild(groupHeading);
      }

      /* append all the threads in the group */
      group.threads
        .forEach(thread => groupDOM.appendChild(thread));

      return groupDOM;
    });

  /* append each group container to the sidebar */
  groupContainers
    .forEach(groupContainer => sidebar.appendChild(groupContainer));

  return sidebar;
};

/* logic for injecting the sidebar into the page */
/* (this gets called at an interval, and will replace an existing sidebar if there are updates) */
const insertSidebar = () => {
  /* if we are not in a room, don't build a sidebar */
  if (!isRoom()) { return; }

  const sidebar = buildSidebar();

  const roomId = document.location.href.split('/').slice(-1)[0];
  const currentRoom = document.querySelectorAll(`[data-stream-group-id="space/${roomId}"]`)[0];

  const roomFirstChild = currentRoom.firstChild;
  if (roomFirstChild.className !== 'thread-sidebar') {
    /* sidebar doesn't exist yet! add it */
    currentRoom.insertBefore(sidebar, currentRoom.firstChild);
  }
  if (roomFirstChild.textContent !== sidebar.textContent) {
    /* we found new threads since the last run, update sidebar */
    currentRoom.replaceChild(sidebar, currentRoom.firstChild);
  }
};

/* css overrides for existing and new controls */
const injectCSS = () => {
  const cssOverride = document.createElement('style');
  cssOverride.innerHTML = `
    /* hide "added" notifications */
    .mCOR5e { display: none; }
    /* hide threads, and not messages */
    .cZICLc.ajCeRb:not(.XbbXmb) { display: none; }
    /* hide loading indicator */
    .qbEbKd { display: none!important; }
    /* hide jump to bottom */
    .NMA9Re { display: none }
    /* make rooms flex */
    .bzJiD.BEjUKc.eO2Zfd { display: flex; }
    /* expand room view */
    .Bl2pUd.krjOGe { width: 100%; }
    /* set sidebar width */
    .thread-sidebar { width: 20vw; overflow-y: scroll; }
    .thread-selector {
      background: none;
      width: 100%;
      padding: 0.5em;
      border: none;
      border-top: solid 1px;
    }
    .thread-selector:hover {
      background: rgba(95,99,104,0.078);
    }
    .thread-active {
      background: #e4f7fb;
    }
    /* make selector bold when there are unreads */
    .thread-unread { font-weight: bold; }
  `;
  document.body.appendChild(cssOverride);
};

/* trigger the whole process */
const run = () => {
  console.log('injecting thread sidebar and selectors');
  injectCSS();
  insertSidebar();
  setInterval(insertSidebar, 2000);
};

run();
