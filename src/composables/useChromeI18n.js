import { ref } from 'vue';
import en from '../../public/_locales/en/messages.json'
import ko from '../../public/_locales/ko/messages.json'

export default function useI18n() {
  const isChromeI18nAvailable = ref(typeof chrome !== 'undefined' && chrome.i18n !== undefined);

  function getLocaleFile(lang) {
    switch (lang) {
      case 'ko':
      case 'ko-KR':
        return ko;
      default:
        return en;
    }
  }

  function getMessage(key) {
    if (isChromeI18nAvailable.value) {
      return chrome.i18n.getMessage(key);
    } else {
      return getLocaleFile(navigator.language)[key].message
    }
  };

  function getLocale() {
    if (isChromeI18nAvailable.value) {
      return chrome.i18n.getUILanguage();
    } else {
      return navigator.language;
    }
  };

  return {
    getMessage,
    getLocale,
  };
}
