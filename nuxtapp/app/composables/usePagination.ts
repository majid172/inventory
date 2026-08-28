import { ref, computed, watch, type Ref } from 'vue';

export function usePagination<T>(dataList: Ref<T[]>, itemsPerPageDefault = 10) {
  const currentPage = ref(1);
  const itemsPerPage = ref(itemsPerPageDefault);

  const totalPages = computed(() => {
    return Math.max(1, Math.ceil(dataList.value.length / itemsPerPage.value));
  });

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return dataList.value.slice(start, end);
  });

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };

  // Reset to first page when underlying data length changes significantly (e.g. searching)
  watch(() => dataList.value.length, () => {
    // Simple heuristic: if we type a search and list shrinks/grows, just go back to page 1
    // to prevent getting stuck on empty pages.
    currentPage.value = 1;
  });

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedData,
    nextPage,
    prevPage
  };
}
