import {createApp} from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/Aura';
import './style.css';

// PrimeVue 테마 및 CSS
import 'primeicons/primeicons.css';

// PrimeVue 컴포넌트 등록
import {
    Button,
    InputText,
    Textarea,
    Select,
    Dialog,
    ToastService,
    Toast,
    SplitButton,
} from 'primevue'
import {definePreset} from "@primevue/themes";

const app = createApp(App);

const preset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{sky.50}',
            100: '{sky.100}',
            200: '{sky.200}',
            300: '{sky.300}',
            400: '{sky.400}',
            500: '{sky.500}',
            600: '{sky.600}',
            700: '{sky.700}',
            800: '{sky.800}',
            900: '{sky.900}',
            950: '{sky.950}',
        }
    }
})
app.use(PrimeVue, {
    theme: {
        preset: preset
    },
});
app.use(ToastService);

app.component('Button', Button);
app.component('InputText', InputText);
app.component('Textarea', Textarea);
app.component('Select', Select);
app.component('Dialog', Dialog);
app.component('Toast', Toast);
app.component('SplitButton', SplitButton);

app.mount('#app');
