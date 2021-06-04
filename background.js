'use strict';

let timeout = false;
let currentTheme = 'dark';
const defaultTheme = 'default-theme@mozilla.org';

const infoTitle = browser.i18n.getMessage('notification_title');
const infoText = browser.i18n.getMessage('notification_text');

const noteHotKeys = {
  type: 'basic',
  title: infoTitle,
  message: infoText,
  iconUrl: 'images/icon_notify.png'
};

const themes = {
  dark: {
    colors: {
      frame: '#1d1d1e',
      frame_inactive: '#1d1d1e',
      toolbar: '#323234',
      toolbar_text: '#bcbbb8',
      toolbar_field: '#1a1a1bFC',
      toolbar_field_text: '#bcbbb8',
      toolbar_field_text_focus: '#bcbbb8',
      toolbar_field_border: '#2b2b2b',
      toolbar_top_separator: '#2b2b2b',
      toolbar_field_border_focus: '#2b2b2b',
      toolbar_field_highlight: '#595959',
      toolbar_field_highlight_text: '#bcbbb8',
      toolbar_bottom_separator: '#2b2b2b',
      tab_text: '#bcbbb8',
      tab_background_text: '#7a7a7a',
      tab_background_separator: '#7a7770',
      tab_line: '#7a7a7a',
      tab_loading: '#ebebec',
      button_background_active: '#4D4D4D',
      button_background_hover: '#404040',
      icons_attention: '#f48c06',
      icons: '#ccccc7cf',
      ntp_background: '#1d1d1e',
      ntp_text: '#bcbbb8',
      popup: '#262627FA',
      popup_text: '#bcbbb8',
      popup_border: '#4a4a4a',
      popup_highlight_text: '#f5f5f5',
      popup_highlight: '#595959',
      sidebar: '#1d1d1e',
      sidebar_border: '#2b2b2b',
      sidebar_highlight_text: '#ffffff',
      sidebar_highlight: '#363636',
      sidebar_text: '#c7c7c3'
    }
  },
  light: {
    colors: {
      frame: '#d7d7da',
      frame_inactive: '#d7d7da',
      toolbar: '#f0f0f0',
      toolbar_text: '#333436',
      toolbar_field: '#fafafaF7',
      toolbar_field_text: '#333436',
      toolbar_field_text_focus: '#333436',
      toolbar_field_border: '#e6e6e6',
      toolbar_top_separator: '#bebfc1',
      toolbar_field_border_focus: '#d6d6d6',
      toolbar_field_highlight: '#828285',
      toolbar_field_highlight_text: '#f5f5f5',
      toolbar_bottom_separator: '#d0d1d2',
      tab_text: '#323335',
      tab_background_text: '#595959',
      tab_line: '#7e8081',
      tab_loading: '#1d1d1e',
      tab_background_separator: '#7a7a7aBF',
      button_background_active: '#dedede',
      button_background_hover: ' #d3d3d3',
      icons_attention: '#f48c06',
      icons: '#5A5b5ced',
      ntp_background: '#f9f9fa',
      ntp_text: '#333436',
      popup: '#f0f0f0FA',
      popup_text: '#323335',
      popup_border: '#d6d6d6',
      popup_highlight_text: '#f5f5f5',
      popup_highlight: '#828285',
      sidebar: '#f9f9fa',
      sidebar_border: '#d6d6d6',
      sidebar_highlight_text: '#ffffff',
      sidebar_highlight: '#828285',
      sidebar_text: '#333436'
    }
  }
};

function addTimeout() {
  if (!timeout) {
    timeout = true;
    setTimeout(() => {
      timeout = false;
    }, 400);
  }
}

function storeCurrent(theme) {
  browser.storage.local.set({ stored: theme });
}

function updateTheme(theme) {
  if (timeout) {
    return;
  }
  currentTheme = theme;
  storeCurrent(theme);
  browser.theme.update(themes[theme]);
  addTimeout();
}

function switchTheme() {
  if (currentTheme === 'light') {
    updateTheme('dark');
  } else {
    updateTheme('light');
  }
}

browser.browserAction.onClicked.addListener(switchTheme);

(function startup() {
  let restoredTheme = browser.storage.local.get('stored');
  restoredTheme.then((res) => {
    if (res.stored === 'dark' || res.stored === 'light') {
      updateTheme(res.stored);
    } else {
      switchTheme();
    }
  });
})();

browser.commands.onCommand.addListener((cmd) => {
  if (cmd === 'switch_theme') {
    switchTheme();
  }
});

browser.management.onEnabled.addListener((info) => {
  if (info.id === defaultTheme) {
    updateTheme(currentTheme);
  }
});

browser.management.onDisabled.addListener((info) => {
  if (info.id === defaultTheme) {
    updateTheme(currentTheme);
  }
});

function handleUpdated(updateInfo) {
  if (updateInfo.theme.colors) {
    let colorMatch = updateInfo.theme.colors.icons;
    if (colorMatch !== '#5A5b5ced' && colorMatch !== '#ccccc7cf') {
      updateTheme(currentTheme);
    }
  }
}

browser.theme.onUpdated.addListener(handleUpdated);

function installedNotification() {
  let storageItem = browser.storage.local.get('notifications');
  storageItem.then((res) => {
    if (res.notifications !== 'blocked') {
      browser.notifications.create(noteHotKeys);
      browser.storage.local.set({ notifications: 'blocked' });
    }
  });
}

browser.runtime.onInstalled.addListener(installedNotification);
