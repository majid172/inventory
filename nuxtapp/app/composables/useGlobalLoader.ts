import { ref, computed } from 'vue';

const activeRequests = ref(0);
const isInitialLoad = ref(true);

export function useGlobalLoader() {
  const startLoader = () => {
    activeRequests.value++;
  };

  const stopLoader = () => {
    activeRequests.value = Math.max(0, activeRequests.value - 1);
  };

  const finishInitialLoad = () => {
    isInitialLoad.value = false;
  };

  // Only show the full-screen solid loader on initial app load, not on every background request
  const isGlobalLoading = computed(() => isInitialLoad.value);

  return {
    isGlobalLoading,
    startLoader,
    stopLoader,
    finishInitialLoad
  };
}
