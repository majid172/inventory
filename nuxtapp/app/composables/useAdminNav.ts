import { ref } from 'vue';

const isSidebarOpen = ref<boolean>(false);

export function useAdminNav() {
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };

  const closeSidebar = () => {
    isSidebarOpen.value = false;
  };

  return {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar
  };
}
