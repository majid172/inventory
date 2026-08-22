import { ref, computed } from 'vue';

export type ThemeMode = 'dark' | 'light';

const theme = ref<ThemeMode>('dark');
const isInitialized = ref(false);

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark');

  const applyTheme = (newTheme: ThemeMode) => {
    theme.value = newTheme;
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('dark', 'light');
      root.classList.add(newTheme);
      root.setAttribute('data-theme', newTheme);
      try {
        localStorage.setItem('theme', newTheme);
      } catch (e) {
        // Storage unavailable fallback
      }
    }
  };

  const initTheme = () => {
    if (isInitialized.value || typeof window === 'undefined') return;
    
    let savedTheme: ThemeMode | null = null;
    try {
      savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    } catch (e) {
      savedTheme = null;
    }

    if (savedTheme === 'light' || savedTheme === 'dark') {
      applyTheme(savedTheme);
    } else {
      // Default to dark theme
      applyTheme('dark');
    }
    
    isInitialized.value = true;
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme.value === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  };

  const setTheme = (newTheme: ThemeMode) => {
    applyTheme(newTheme);
  };

  return {
    theme,
    isDark,
    initTheme,
    toggleTheme,
    setTheme
  };
}
