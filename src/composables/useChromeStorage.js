import {ref} from "vue";

export default function useChromeStorage() {
    const prompts = ref([]);
    const loaded = ref(false);
    const isChromeStorageAvailable = ref(typeof window.chrome !== 'undefined' && window.chrome.storage !== undefined);

    function get(key, callback) {
        if (isChromeStorageAvailable.value) {
            window.chrome.storage.sync.get(key, callback);
        } else {
            const data = {}
            data[key] = JSON.parse(localStorage.getItem(key));
            if (callback) {
                callback(data);
            }
        }
    }

    function set(data, callback) {
        if (isChromeStorageAvailable.value) {
            window.chrome.storage.sync.set(data, callback);
        } else {
            for (const key in data) {
                localStorage.setItem(key, JSON.stringify(data[key]));
            }
            if (callback) {
                callback();
            }
        }
    }

    async function loadPrompts() {
        return new Promise(resolve => {
            if (!loaded.value) { // 이미 로드된 경우 실행하지 않음
                get('prompts', (data) => {
                    // 불러온 데이터가 배열인지 확인하고, 아니면 빈 배열로 초기화
                    if (Array.isArray(data.prompts)) {
                        prompts.value = data.prompts;
                    } else {
                        prompts.value = data.prompts ? Object.values(data.prompts) : [];
                    }
                    loaded.value = true; // 데이터 로딩 완료 표시
                });
            }
            resolve();
        });
    }

    // 컴포넌트에서 호출할 수 있도록 초기화를 유지함
    loadPrompts();

    return {
        prompts,
        loaded,
        get,
        set,
        loadPrompts,
        isChromeStorageAvailable,
    };
}
