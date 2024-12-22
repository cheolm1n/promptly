const menuIds = {
  addSelectedTextAsPrompt: "addSelectedTextAsPrompt",
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: menuIds.addSelectedTextAsPrompt,
    title: chrome.i18n.getMessage("contextMenuAddSelectedTextAsPrompt"),
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (
    info.menuItemId === menuIds.addSelectedTextAsPrompt &&
    info.selectionText
  ) {
    onClickAddSelectedTextAsPrompt(info, tab);
  }
  // 다른 메뉴가 추가된다면 여기에 분기를 추가
});

function onClickAddSelectedTextAsPrompt(info, tab) {
  chrome.action.openPopup().then(() => {
    chrome.runtime.sendMessage({ type: "addPrompt", data: info.selectionText });
  });
}
