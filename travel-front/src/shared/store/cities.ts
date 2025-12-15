type City = {
  id: string
  name: string
  regionId: string
  countryCode: string
}

type CitiesResponse = {
  data: {
    cities: City[]
  }
  success: boolean
  cached: boolean
  timestamp: number
}

export const useCitiesStore = defineStore('cities', () => {
  const runtimeConfig = useRuntimeConfig()

  const cities = ref<City[]>([])
  const isLoading = ref(false)

  const getCities = async () => {
    try {
      isLoading.value = true
      const response = await $fetch<CitiesResponse>(
        `${runtimeConfig.public.apiUrl}/cities`
      )
      cities.value = response.data.cities
    } catch (error) {
      console.error(error)
    } finally {
      isLoading.value = false
    }
  }

  const currentCity = (cityId: string) => {
    return cities.value.find((city) => city.id === cityId)
  }

  return {
    cities,
    isLoading,
    getCities,
    currentCity,
  }
})
