import { readonly, ref } from 'vue'
import { english } from '../data/translations.js'
import mapEnglish from '../data/mapEnglish.json'
import { ch2English } from '../data/ch2English.js'
import { ch3English } from '../data/ch3English.js'

const storageKey = 'cagis-teamap-language'

function readLanguage() {
  try {
    return localStorage.getItem(storageKey) === 'en' ? 'en' : 'zh'
  } catch {
    return 'zh'
  }
}

const language = ref(readLanguage())

export function useLanguage() {
  function setLanguage(value) {
    if (value !== 'zh' && value !== 'en') return
    language.value = value
    try {
      localStorage.setItem(storageKey, value)
    } catch {
      // Language selection still works when browser storage is unavailable.
    }
  }

  function t(text) {
    return language.value === 'en' ? (english[text] ?? mapEnglish[text] ?? ch2English[text] ?? ch3English[text] ?? text) : text
  }

  return { language: readonly(language), setLanguage, t }
}
