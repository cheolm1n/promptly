import { ref } from 'vue';

export default function useI18n() {
  const getMessage = (key) => {
    const isChromeI18nAvailable = ref(typeof window.chrome !== 'undefined' && window.chrome.i18n !== undefined);

    if (isChromeI18nAvailable) {
      // 프로덕션 환경에서는 chrome.i18n 메시지 사용
      return chrome.i18n.getMessage(key);
    } else {
      // FIXME 개발 환경에서는 어떡하지...  
      return chrome.i18n.getMessage(key);
    }
  };

  return {
    getMessage,
  };
} 