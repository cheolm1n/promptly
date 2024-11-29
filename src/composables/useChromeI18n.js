import { ref } from 'vue';
import en from '../../public/_locales/en/messages.json'
import ko from '../../public/_locales/ko/messages.json'

export default function useI18n() {
  const isChromeI18nAvailable = ref(typeof window.chrome !== 'undefined' && window.chrome.i18n !== undefined);

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
      // Local 개발 환경에서는 한국어 사용
      return "ko-KR";
    }
  };

  return {
    getMessage,
    getLocale,
  };
}
