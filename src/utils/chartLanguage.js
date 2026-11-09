import { translateCopy } from './language.js'

// Translate display fields only: data identities, geographical names and links
// remain unchanged so map matching and click handlers still receive Chinese IDs.
export function localizedChartOption(option, english) {
  if (!english) return option
  function displayFormatter(formatter) {
    return function (...args) {
      let value
      if (typeof formatter === 'function') value = formatter.apply(this, args)
      else if (typeof formatter === 'string') {
        const p = args[0]
        value = typeof p === 'object' ? formatter.replace(/\{([abcd])\}/g, (_, k) => ({a:p.seriesName,b:p.name,c:p.value,d:p.percent})[k] ?? '') : formatter.replace('{value}', p)
      } else value = typeof args[0] === 'object' ? args[0].name : args[0]
      return translateCopy(value)
    }
  }
  function visit(value, key = '') {
    if (Array.isArray(value)) return value.map(v => visit(v, key))
    if (!value || typeof value !== 'object') return value
    const copy = {}
    for (const [k,v] of Object.entries(value)) {
      if (k === 'formatter') copy[k] = displayFormatter(v)
      else if (['text','subtext','nameText','unit'].includes(k) && typeof v === 'string') copy[k] = translateCopy(v)
      else if (k === 'name' && /Axis$/.test(key) && typeof v === 'string') copy[k] = translateCopy(v)
      else if (k === 'fontFamily') copy[k] = 'Times New Roman'
      else if (k === 'fontSize' && typeof v === 'number') copy[k] = Math.max(1,v-1)
      else copy[k] = visit(v,k)
    }
    if (['label','axisLabel','legend'].includes(key) && !('formatter' in copy)) copy.formatter = displayFormatter()
    if (['label','axisLabel'].includes(key)) {
      copy.fontFamily = 'Times New Roman'
      copy.fontSize ??= 11
    }
    if (key === 'legend') copy.textStyle = {...copy.textStyle,fontFamily:'Times New Roman',fontSize:copy.textStyle?.fontSize ?? 11}
    if (key === 'tooltip') copy.textStyle = {...copy.textStyle,fontFamily:'Times New Roman',fontSize:copy.textStyle?.fontSize ?? 13}
    return copy
  }
  const result = visit(option)
  result.textStyle = {...result.textStyle, fontFamily:'Times New Roman',fontSize:result.textStyle?.fontSize ?? 11}
  return result
}

export function setChartLetterSpacing(chart, english) {
  const painter = chart.getZr().painter
  const layers = painter.getLayers?.() || {}
  for (const layer of Object.values(layers)) {
    const ctx = layer.ctx
    if (!ctx || !('letterSpacing' in ctx)) continue
    if (!ctx._teaFillText) {
      ctx._teaFillText = ctx.fillText
      ctx.fillText = function (...args) {
        this.letterSpacing = this._teaEnglish ? `${(Number(this.font.match(/([\d.]+)px/)?.[1]) || 12)*.05}px` : '0px'
        return this._teaFillText(...args)
      }
    }
    ctx._teaEnglish = english
  }
}
