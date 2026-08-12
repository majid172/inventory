import { defineStore } from 'pinia';

export const useCategoryStore = defineStore('category',()=>{
  const categories = ref([])
  const loading = ref(false)

  const fetchCategories = async () => {
    loading.value = true

    try {
      categories.value = await axios.get (
        'http://localhost:5000/api/categories'
      )
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    loading,
    fetchCategories
  }
});
