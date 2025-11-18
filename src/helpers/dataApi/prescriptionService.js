import { GetAxios, PostAxios, DeleteAxios } from './crud'
import apiConstant from './apiConstant'

const BASE = `${apiConstant.BaseUrl}/api/prescription`

export async function fetchProfile() {
  const endpoint = `${BASE}/profile`
  const response = await PostAxios(endpoint, {})
  return response?.data?.data || null
}

export async function updateProfile(profile) {
  const endpoint = `${BASE}/profile/update`
  const response = await PostAxios(endpoint, profile)
  return response?.data?.data || profile
}

export async function fetchPrescriptionCategories() {
  const endpoint = `${BASE}/categories`
  const response = await GetAxios(endpoint)
  return response?.data?.data || []
}

export async function fetchPrescriptionDuas(categoryId) {
  const endpoint = `${BASE}/categories/${categoryId}/duas`
  const response = await GetAxios(endpoint)
  return response?.data?.data || []
}

export async function fetchPrescriptionTemplate(duaId) {
  const endpoint = `${BASE}/template/${duaId}`
  const response = await GetAxios(endpoint)
  return response?.data?.data || null
}

export async function matchPrescriptionDua(desireText) {
  const endpoint = `${BASE}/match`
  const response = await PostAxios(endpoint, { desireText })
  return response?.data?.data || null
}

export async function fetchPlanByDuaId(duaId) {
  const endpoint = `${BASE}/plans/${duaId}`
  const response = await GetAxios(endpoint)
  return response?.data?.data || []
}

export async function createPrescriptionSchedule(payload) {
  const endpoint = `${BASE}/schedule/create`
  const response = await PostAxios(endpoint, payload)
  return response?.data?.data || null
}

export async function fetchDailyPlan(date) {
  const endpoint = `${BASE}/plan`
  const response = await PostAxios(endpoint, { date })
  return response?.data?.data || null
}

export async function submitDailyCompletion(payload) {
  const endpoint = `${BASE}/plan/complete`
  const response = await PostAxios(endpoint, payload)
  return response?.data?.data || null
}

export async function fetchHistory(limit = 14) {
  const endpoint = `${BASE}/history`
  const response = await PostAxios(endpoint, { limit })
  return response?.data?.data || []
}

export async function persistGeneratedPlan(plan) {
  const endpoint = `${BASE}/plan/save`
  const response = await PostAxios(endpoint, plan)
  return response?.data?.data || plan
}

export async function matchAyet(moodText) {
  const endpoint = `${apiConstant.BaseUrl}/api/Ayet/match`
  const response = await PostAxios(endpoint, { moodText })
  return response?.data?.data || null
}

export async function deleteAllPlans() {
  const endpoint = `${BASE}/plans/delete-all`
  const response = await PostAxios(endpoint, {})
  return response?.data?.data || null
}
