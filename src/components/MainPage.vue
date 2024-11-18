<template>
  <div class="container">
    <div class="dropdown-container">
      <Dropdown
          :options="prompts"
          optionLabel="text"
          optionValue="value"
          v-model="selectedPrompt"
          placeholder="프롬프트를 선택하세요"
          style="width: 100%; margin-bottom: 1rem;"
      />

      <div v-if="variables.length" class="variables-container">
        <div
            v-for="(variable, index) in variables"
            :key="index"
            class="p-field variable-field"
        >
          <label :for="'var_' + index">{{ variable }} 입력:</label>
          <component
              :is="userInputs[variable].length > 50 ? 'Textarea' : 'InputText'"
              v-model="userInputs[variable]"
              :id="'var_' + index"
              :rows="userInputs[variable].length > 50 ? 3 : 1"
              autoResize
              class="variable-input"
          />
        </div>
      </div>
    </div>
    <div class="button-container">
      <Button
          label="결과 보기"
          @click="generatePrompt"
          class="result-button"
          :disabled="!selectedPrompt"
      />
    </div>
    <div v-if="filledPrompt" class="p-mt-3">
      <p><strong>결과:</strong></p>
      <pre class="result-block">{{ filledPrompt }}</pre>
      <div class="button-container">
        <SplitButton
            :label="`Run on ${selectedModel}`"
            icon="pi pi-external-link"
            @click="runOnModel"
            :model="modelOptions"
            :class="['p-mt-2', getButtonClass]"
        />
        <Button
            label="복사"
            icon="pi pi-copy"
            iconPos="left"
            @click="copyToClipboard"
            class="p-mt-2 p-button-secondary"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {computed, reactive, ref, watch, onMounted} from 'vue';
import {useToast} from 'primevue/usetoast';
import SplitButton from 'primevue/splitbutton';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import useChromeStorage from "../composables/useChromeStorage";

export default {
  name: 'MainPage',
  components: {
    SplitButton,
    Dropdown,
    Button,
    InputText,
    Textarea,
  },
  setup() {
    const storage = useChromeStorage();
    const toast = useToast();
    const selectedPrompt = ref(null);
    const variables = ref([]);
    const userInputs = reactive({});
    const filledPrompt = ref('');
    const selectedModel = ref('gpt-4'); // 기본 값 설정

    // 모델 옵션들
    const modelOptions = [
      {label: 'gpt-4', command: () => selectModel('gpt-4')},
      {label: 'gpt-4o', command: () => selectModel('gpt-4o')},
      {label: 'gpt-4o-mini', command: () => selectModel('gpt-4o-mini')},
      {label: 'gpt-4o-canmore', command: () => selectModel('gpt-4o-canmore')},
      {label: 'o1-preview', command: () => selectModel('o1-preview')},
      {label: 'o1-mini', command: () => selectModel('o1-mini')},
      {separator: true},
      {label: 'Claude 3.5 Sonnet', command: () => selectModel('Claude 3.5 Sonnet')},
    ];

    // 버튼 클래스 계산
    const getButtonClass = computed(() => {
      return selectedModel.value.toLowerCase().includes('claude')
          ? 'p-button-claude'
          : 'p-button-primary';
    });

    // 모델 선택 함수
    const selectModel = (model) => {
      selectedModel.value = model;
      storage.set({selectedModel: model});
    };

    // 컴포넌트가 마운트될 때 모델을 스토리지에서 불러옴
    onMounted(() => {
      storage.get('selectedModel', (data) => {
        if (data.selectedModel) {
          selectedModel.value = data.selectedModel;
        }
      });
    });

    const prompts = computed(() => {
      return storage.prompts.value.map((prompt, index) => ({
        text: prompt,
        value: prompt,
        id: index,
      }));
    });

    watch(selectedPrompt, (newPrompt) => {
      if (newPrompt) {
        const varMatches = newPrompt.match(/{(.*?)}/g);
        variables.value = varMatches
            ? varMatches.map((v) => v.replace(/[{}]/g, ''))
            : [];
        variables.value.forEach((variable) => {
          userInputs[variable] = '';
        });
        filledPrompt.value = '';
      } else {
        variables.value = [];
      }
    });

    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    const generatePrompt = () => {
      if (selectedPrompt.value) {
        let tempPrompt = selectedPrompt.value;
        variables.value.forEach((variable) => {
          const value = userInputs[variable] || '';
          const escapedVariable = escapeRegExp(variable);
          tempPrompt = tempPrompt.replace(
              new RegExp(`\\{${escapedVariable}\\}`, 'g'),
              value
          );
        });
        filledPrompt.value = tempPrompt;
      }
    };

    const runOnModel = () => {
      if (filledPrompt.value) {
        const encodedPrompt = encodeURIComponent(filledPrompt.value);
        const model = selectedModel.value;
        const url = model.toLowerCase().includes('claude')
            ? `https://claude.ai/new?q=${encodedPrompt}`
            : `https://chat.openai.com/?model=${model}&q=${encodedPrompt}`;
        window.open(url, '_blank');
      }
    };

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(filledPrompt.value);
        toast.add({
          severity: 'success',
          summary: '복사 완료',
          detail: '프롬프트가 클립보드에 복사되었습니다!',
          life: 1000,
        });
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: '복사 실패',
          detail: '클립보드에 복사할 수 없습니다.',
          life: 1000,
        });
      }
    };

    return {
      prompts,
      selectedPrompt,
      variables,
      userInputs,
      generatePrompt,
      filledPrompt,
      runOnModel,
      copyToClipboard,
      selectedModel,
      modelOptions,
      getButtonClass,
    };
  },
};
</script>

<style scoped>
.p-field {
  margin-top: 1em;
}

.variable-input {
  width: 100%;
}

.dropdown-container {
  margin-bottom: 1.5rem;
}

.variables-container {
  margin-top: 1rem;
}

.variable-field {
  margin-bottom: 1rem;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.result-block {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  border: 1px solid #ddd;
  overflow-x: auto;
}

/* Claude 모델용 버튼 스타일 수정 */
:deep(.p-button-claude) button.p-splitbutton-defaultbutton {
  background: #AB4E1C !important;
  border-color: #AB4E1C !important;
}

:deep(.p-button-claude) button.p-splitbutton-defaultbutton:hover {
  background: #8B3E12 !important;
  border-color: #8B3E12 !important;
}

:deep(.p-button-claude) button.p-splitbutton-menubutton {
  background: #AB4E1C !important;
  border-color: #AB4E1C !important;
}

:deep(.p-button-claude) button.p-splitbutton-menubutton:hover {
  background: #8B3E12 !important;
  border-color: #8B3E12 !important;
}

/* Split 버튼 사이의 구분선 색상도 맞춤 */
:deep(.p-button-claude) button.p-splitbutton-menubutton:before {
  border-left-color: rgba(255, 255, 255, 0.3) !important;
}
</style>