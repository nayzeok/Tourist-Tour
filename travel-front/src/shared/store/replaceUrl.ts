export const useReplaceUrl = defineStore('replaceUrl', () => {
  const key = ref('')
  const loading = ref(false)

  const setKey = () => {
    console.log('key', key.value)
    key.value = crypto.randomUUID()
  }

  const setLoading = (val: boolean) => (loading.value = val)

  return {
    key,
    setKey,
    loading,
    setLoading,
  }
})
