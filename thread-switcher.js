( () => {

/* helper methods for checking if current page is a DM or a Room */
const isDM = () => document.location.pathname.indexOf('/dm/') > -1;
const isRoom = () => document.location.pathname.indexOf('/room/') > -1;

/* variables */
let lastLocationHref;
let currentRoom;
let threadHeadersArray;

/* go to the thread selected with the thread selector */
const switchThread = () => {
  const select = document.getElementById('thread-selector');
  if (select) {
    const index = select.selectedIndex - 1;
    if (index >= 0) {
      const threadContainer = threadHeadersArray[index].nextElementSibling;
      if (threadContainer) {
        let timerID;
        const watchScroll = () => {
          if (typeof timerID === 'number') {
            clearTimeout(timerID);
          }
          timerID = setTimeout( () => {
            window.removeEventListener('scroll', watchScroll, true);
            currentRoom.firstChild.scrollTop += 40;
          }, 100);
        };
        window.addEventListener('scroll', watchScroll, true);
        threadContainer.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});
      }
      else {
        console.log('thread container element not found.');
      }
      select.selectedIndex = 0;
    }
  }
  else {
    console.log('#thread-selector not found.');
  }
}

/* transform text from a thread summary */
const formatTitleFromThreadHeading = title => {
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

/* build the switcher */
const buildSwitcher = () => {
  /* query for threads in this room */
  const roomId = document.location.pathname.replace(/.*\/room\/([^\/]+).*$/, '$1');
  console.log('location:'+document.location.href+' => roomId:'+roomId);
  currentRoom = document.querySelector(`[data-group-id="space/${roomId}"][role="main"]`);
  if (currentRoom === undefined || currentRoom === null) {
    console.log('Room element not found.');
    return null;
  }
  const threadHeaders = currentRoom.querySelectorAll('[role="heading"][aria-label]');
  threadHeadersArray = Array.from(threadHeaders);
  if (threadHeadersArray.length == 0) {
    console.log('No threads.');
    return null;
  }

  /* build thread list (as <option>s for <select>) */
  const threadList = threadHeadersArray
    .map((thread) => {
      const item = document.createElement('option');
      item.className = 'thread-list-item';
      item.threadHeading = thread.textContent;
      const titleArr = thread.textContent.split('.');
      if (titleArr[0].indexOf('Unread') >= 0 || titleArr[0].indexOf('未読') >= 0) {
        item.className = item.className + ' thread-unread';
        titleArr.shift();
      }
      titleArr.shift();
      item.textContent = formatTitleFromThreadHeading(titleArr.join('.'));
      return item;
    });

  /* build <select> DOM */
  const selectDOM = document.createElement('select');
  //selectDOM.id = `thread-group-${group.label}`;
  selectDOM.id = 'thread-selector';
  selectDOM.onchange = switchThread;

  const head = document.createElement('option');
  head.hidden = true;
  head.disabled = true;
  head.className = 'thread-list-header';
  head.textContent = 'スレッド移動';
  selectDOM.appendChild(head);
  threadList.forEach(option => selectDOM.appendChild(option));

  selectDOM.selectedIndex = 0;

  /* build the switcher DOM */
  const switcherDOM = document.createElement('div');
  switcherDOM.id = 'thread-switcher';
  switcherDOM.appendChild(selectDOM);
  return switcherDOM;
};

/* logic for building the switcher and injecting it into the page */
const insertSwitcher = () => {
  /* if we are not in a room, don't build a switcher */
  const switcher = isRoom()
        ? buildSwitcher()
        : ((console.log('Not in a room. location:'+document.location.href)), null);
  if (switcher) {
    const target = currentRoom.nextElementSibling;
    if (!target || target.id != 'thread-switcher') {
      /* switcher doesn't exist yet! add it */
      currentRoom.parentNode.insertBefore(switcher, target);
    }
    else if (target && target.textContent != switcher.textContent) {
      /* update switcher */
      currentRoom.parentNode.replaceChild(switcher, target);
    }
  }
  else {
    const switcher = document.getElementById('thread-switcher');
    if (switcher) {
      switcher.parentNode.removeChild(switcher);
    }
  }
};

/* css overrides for existing and new controls */
const injectCSS = () => {
  const cssOverride = document.createElement('style');
  cssOverride.innerHTML = `
    #thread-switcher {
      position: absolute;
      top: 0px;
      right: 0px;
    }
    #thread-selector {
      width: 120px;
    }
    .thread-list-header {}
    .thread-list-item {}
    .thread-unread { font-weight: bold; }
  `;
  document.body.appendChild(cssOverride);
};

/* process to be executed when changes occur in the document */
const run = () => {
  insertSwitcher();
  lastLocationHref = document.location.href;
};

const setup = () => {
  /* initial run */
  injectCSS();
  run();

  /* call run when the document changes and then settles down */
  let runID;
  const observer = new MutationObserver( () => {
    if (document.location.href == lastLocationHref) {
      //return;
    }
    if (typeof runID === 'number') {
      clearTimeout(runID);
    }
    runID = setTimeout(run, 200);
  });
  observer.observe(document.body, { childList: true, subtree: true });
};

/* wait for the end of the document loading process before running setup */
window.onload = () => setup();

})();
