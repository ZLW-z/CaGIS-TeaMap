import { watch } from 'vue'
import { useLanguage } from './language.js'

// Leaflet and D3 own these nodes; retain their source text for language round trips.
export function observeMapLanguage(root) {
  const { language, t } = useLanguage()
  const originals = new WeakMap()
  const attributes = new WeakMap()
  let observer
  function update() {
    observer?.disconnect()
    root.querySelectorAll('.leaflet-container, .globe-tooltip, .globe-svg').forEach(container => {
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
      let node
      while ((node = walker.nextNode())) {
        if (node.parentElement?.closest('.keep-chinese, script, style')) continue
        const cached = originals.get(node)
        const source = cached && node.data === cached.rendered ? cached.source : node.data
        const rendered = language.value === 'en' ? t(source) : source
        if (node.data !== rendered) node.data = rendered
        originals.set(node, { source, rendered })
      }
      container.querySelectorAll('[title],[aria-label],[alt]').forEach(el => {
        const cached = attributes.get(el) || {}
        for (const name of ['title','aria-label','alt']) {
          const current = el.getAttribute(name)
          if (current === null) continue
          const source = cached[name] && current === cached[name].rendered ? cached[name].source : current
          const rendered = language.value === 'en' ? t(source) : source
          if (current !== rendered) el.setAttribute(name, rendered)
          cached[name] = {source, rendered}
        }
        attributes.set(el,cached)
      })
    })
    observer.observe(root, {childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','alt']})
  }
  observer = new MutationObserver(update)
  const stop = watch(language, update, {flush:'post'})
  update()
  return () => { stop(); observer.disconnect() }
}
