import { readonly, ref } from 'vue'
import { english } from '../data/translations.js'
import mapEnglish from '../data/mapEnglish.json'
import { ch2English } from '../data/ch2English.js'
import { ch3English } from '../data/ch3English.js'
import documentEnglish from '../data/documentEnglish.json'
import geographyEnglish from '../data/geographyEnglish.json'

const normalize = text => text.replace(/\s+/g, '').replace(/[｜|]/g, '至')
const displayEnglish = {...geographyEnglish, ...documentEnglish,
  '出口额': 'Export value',
  '出口额：': 'Export value: ',
  '年 出口总额': ' Total exports: ',
  '亿元，覆盖': ' × CNY 100 million, reaching ',
  '个主要国家': ' major countries',
  '年该省暂无茶叶出口数据': ': No tea export data for this province',
  '该航线扩大了{变量}与{变量}之间的商品往来，使中国茶进入更广阔的海外消费和转口网络。': 'This sea route expanded trade between {origin} and {destination}, bringing Chinese tea into wider overseas consumer and transshipment networks.',
  '该商道加强了{变量}与{变量}之间的物资交换，并推动茶叶在边疆及欧亚内陆市场持续流通。': 'This overland route strengthened exchanges of goods between {origin} and {destination} and sustained tea circulation in frontier and inland Eurasian markets.',
  '茶叶由{变量}出发{变量}，抵达{变量}。地图以{变量}方式呈现该通道；{变量}': 'Tea departed from {origin}{intermediate stops} and arrived at {destination}. The map presents this corridor as a {route mode}; {mapping explanation}',
  '，依次经过{变量}': ', passing in sequence through {intermediate stops}',
  '线形保留人工数字化成果的原始折点顺序与行进方向。': 'The geometry retains the original vertex order and travel direction of the manually digitized route.',
  '有真实数字化线形的路段沿原GeoJSON绘制；缺少真实线形的相邻节点区间采用大圆路线连接，作为路线示意补充。': 'Digitized sections follow the original GeoJSON geometry. Adjacent nodes lacking digitized geometry are linked by great-circle arcs as a schematic supplement.',
  '该路线连接了{变量}与{变量}，反映茶叶贸易带动的区域交流与市场扩展。': 'This route connected {origin} and {destination}, reflecting the regional exchange and market expansion fostered by tea trade.',
}
const approved = new Map(Object.entries(displayEnglish).map(([zh, en]) => [normalize(zh), en]))
const terms = Object.entries(displayEnglish).filter(([zh]) => zh.length > 1 && zh.length < 80 && !zh.includes('{') && !zh.includes('\n')).sort((a,b) => b[0].length-a[0].length)
const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const templates = Object.entries(displayEnglish).filter(([zh]) => zh.includes('{变量}') && !zh.includes('\n') && normalize(zh.replaceAll('{变量}','')).length > 0).map(([zh,en]) => ({
  zh, en, pattern: new RegExp('^'+zh.split('{变量}').map(part => escapePattern(normalize(part))).join('(.+?)')+'$')
})).sort((a,b) => b.zh.replaceAll('{变量}','').length - a.zh.replaceAll('{变量}','').length)

export function translateCopy(value) {
  if (typeof value !== 'string' || !value.trim()) return value
  if (!/[\u3400-\u9fff]/.test(value)) return value
  const exact = approved.get(normalize(value))
  if (exact) return exact
  for (const entry of templates) {
    const match = normalize(value).match(entry.pattern)
    if (!match) continue
    let captures = match.slice(1)
    if (normalize(entry.zh).startsWith('{变量}{变量}')) {
      if (captures.length !== 2) continue
      const suffix = normalize(entry.zh.split('{变量}').at(-1))
      const body = normalize(value).slice(0, suffix ? -suffix.length : undefined)
      const prefix = terms.find(([zh]) => body.startsWith(normalize(zh)) && body.length > normalize(zh).length)
      if (!prefix) continue
      captures = [prefix[0], body.slice(normalize(prefix[0]).length)]
    }
    // These chart headings place the year last in natural English.
    if (/^\{变量\}年中国/.test(entry.zh) && entry.en.includes('{indicator}') && captures.length === 2) captures = [captures[1],captures[0]]
    let index = 0
    return entry.en.replace(/\{[^}]+\}/g, () => translateCopy(captures[index++] ?? ''))
  }
  if (/<[a-z][\s\S]*>/i.test(value)) return value.split(/(<[^>]*>)/g).map(part => part.startsWith('<') ? part : translateCopy(part)).join('')
  let result = english[value] ?? mapEnglish[value] ?? ch2English[value] ?? ch3English[value]
  if (result) return result
  result = value
  for (const [zh, en] of terms) result = result.replaceAll(zh, en)
  return result
}

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
    return language.value === 'en' ? translateCopy(text) : text
  }

  return { language: readonly(language), setLanguage, t }
}
