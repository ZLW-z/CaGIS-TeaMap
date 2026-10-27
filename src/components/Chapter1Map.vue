<template>
  <section class="page-wrap" :class="{ 'english-copy': language === 'en' }" :lang="language === 'en' ? 'en' : 'zh-CN'">
    <ChapterIntro
      :ch-no="language === 'en' ? 'I' : chapter.number"
      :title="t(chapter.title)"
      :desc="t(chapter.description)"
      :duration="7"
      @done="onIntroDone"
    />

    <!-- 地图全屏 -->
    <div class="map-fullscreen" :class="{ show: introDone }">
      <ChapterCornerIntro chapter-key="ch1" :visible="introDone" />
      <div ref="mapEl" class="map"></div>

      <!-- 右上角图层文字说明 -->
      <div class="layer-text-panel" ref="textPanelEl">
        <div v-if="currentTextItem" class="ltp-inner" :key="'inner-'+currentTextIdx">
          <div class="ltp-tag">
            <span class="ltp-tag-dot"></span>
            <span class="ltp-tag-text">{{ currentTextItem.tag }}</span>
          </div>
          <h2 class="ltp-title">{{ currentTextItem.title }}</h2>
          <p class="ltp-desc">{{ currentTextItem.desc }}</p>
        </div>
        <div
          v-if="currentTextItem && stage < LAYER_TEXTS.length - 1"
          class="layer-scroll-guide"
          role="note"
        >
          <span class="layer-scroll-chevrons" aria-hidden="true">
            <i class="layer-scroll-chevron"></i>
            <i class="layer-scroll-chevron"></i>
            <i class="layer-scroll-chevron"></i>
          </span>
          <span class="layer-scroll-hint">{{ t('滚动查看其他图层') }}</span>
        </div>
      </div>

      <!-- 图例 -->
      <div class="map-legend">
        <div class="legend-title">{{ t('图 例') }}</div>
        <div class="legend-row tang" :class="{ dim: stage < 1 }">
          <span class="sw tang-sw"></span>{{ t('唐代产茶区') }}
        </div>
        <div class="legend-subtitle">{{ t('古茶树 · 现存资源') }}</div>
        <div class="legend-row t1" :class="{ dim: stage < 2 }">
          <span class="sw t-sw"></span>{{ t('野生型') }} <span class="count">（{{ counts[1] }}）</span>
        </div>
        <div class="legend-row t3" :class="{ dim: stage < 3 }">
          <span class="sw t-sw t3"></span>{{ t('栽培型') }} <span class="count">（{{ counts[3] }}）</span>
        </div>
        <div class="legend-row t2" :class="{ dim: stage < 4 }">
          <span class="sw t-sw t2"></span>{{ t('过渡/其他') }} <span class="count">（{{ counts[2] }}）</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, reactive, nextTick } from 'vue'
import { useLanguage } from '../utils/language.js'
const { language, t } = useLanguage()
import L from 'leaflet'
import gsap from 'gsap'
import { createAlbersCRS } from '../utils/crs.js'
import ChapterIntro from './ChapterIntro.vue'
import ChapterCornerIntro from './ChapterCornerIntro.vue'
import { CHAPTER_META } from '../data/chapterMeta.js'
import {
  BG_DEM_IMG, MASK_IMG, DEM_IMG, loadDemBounds, MAP_INIT,
  OUTLINE_URL, TENDASH_URL, TANG_AREAS_URL, TEA_TREES_URL,
  TREE_TYPE_STYLE, OUTLINE_STYLE, TENDASH_STYLE, TANG_STYLE, TANG_BLUR_STYLE
} from '../config/ch1.js'

const props = defineProps({ id: { type: String, default: 'ch1' } })

const mapEl = ref(null)
const textPanelEl = ref(null)
let map = null
let bgDemLayer = null, maskLayer = null, demLayer = null
let outlineLayer = null, tendashLayer = null, tangLayer = null, tangBlurLayer = null
let treeMarkers = []
const chapter = CHAPTER_META.ch1
const stage = ref(0)
const counts = reactive({ 1: 0, 2: 0, 3: 0 })
const introDone = ref(false)
const currentTextIdx = ref(-1)

// 避免 initMap（异步 fetch 数据）和 @done（2.5s 固定）的竞态
// 只有 intro 完成 + 地图全部图层加载完毕 两者同时满足 后 才开始阶段调度
let resolveMapReady = null
const mapReadyPromise = new Promise(res => { resolveMapReady = res })
let introDoneFlag = false
let stageFlowStarted = false

// 图层文字说明内容（来自茶生山水间.docx，5 段对应 5 个图层，已删除过渡型单独说明）
// 图层出现顺序：地形图 → 唐代产茶区 → 野生型古茶树 → 栽培型古茶树 → 其他古茶树
const LAYER_TEXTS = [
  // Stage 0 → 地形图
  {
    tag: '图 层 · 壹',
    title: '山河底色 · 地形铺展',
    desc: '山河起伏铺展大地底色，视线就此收拢于华夏这片孕育茶叶的土地。起伏的山川肌理静静诉说：群山、河谷与海拔，正是茶树故事开始的地理舞台。'
  },
  // Stage 1 → 唐代产茶区
  {
    tag: '图 层 · 贰',
    title: '唐风茶兴 · 盛世茶香',
    desc: '千年前陆羽落笔《茶经》，记下大唐大地处处飘起的茶香。茶叶的种植顺着山水蔓延开来，片片茶区在山林间次第兴起，饮茶之风浸润盛世山河，属于茶的时代，就此缓缓铺开。'
  },
  // Stage 2 → 野生型古茶树（type=1）
  {
    tag: '图 层 · 叁',
    title: '野生古茶 · 原初印记',
    desc: '野生型古茶树扎根西南深山，在云雾缭绕的原始森林中独自生长。它们是地球上最古老的茶树种质资源，未经人工选育便保持着最原始的生命形态，静静伫立在崇山峻岭间，记录着茶树起源之初的古老印记。'
  },
  // Stage 3 → 栽培型古茶树（type=3）
  {
    tag: '图 层 · 肆',
    title: '栽培古茶 · 人工风物',
    desc: '先民走入云雾群山，从山野之间遴选茶株，移栽于村寨周遭，开启代代耕耘培育的历程。历经漫长岁月的人工选育与管护，古茶树扎根山间，顺应人世烟火生长。一树树新芽岁岁萌发，将山林草木的禀赋，化作可被世人品味的人间风物，承载起千百年来种茶制茶的人文记忆。'
  },
  // Stage 4 → 其他古茶树（type=2：过渡型等其他散落古木）
  {
    tag: '图 层 · 伍',
    title: '其他古茶 · 散点遗珍',
    desc: '华夏各处山谷还散落着许多不知名的古老茶树，它们远离主脉，或藏身于人迹罕至的深山幽谷，或静立在村寨边的无名坡地。这一株株散落的古木，作为历史遗珍静静守望，记录着茶树迁徙与岁月流逝的别样印记，也补足了从野生茶树走向人工名茶的完整演化脉络。'
  },
]

watch(language, async () => {
  await nextTick()
  const regionTooltip = tangLayer?.getTooltip?.()
  if (regionTooltip?.isOpen()) regionTooltip.update()
  if (tangLayer) tangLayer.eachLayer(layer => {
    const tooltip = layer.getTooltip?.()
    if (tooltip?.isOpen()) tooltip.update()
  })
  treeMarkers.forEach(marker => {
    const popup = marker.getPopup()
    if (popup?.isOpen()) popup.update()
  })
})

const MIN_ZOOM_EPSILON = 0.001
const LAYER_WHEEL_THRESHOLD = 36
const LAYER_WHEEL_IDLE_MS = 220
let layerWheelAccumulator = 0
let layerWheelGestureTriggered = false
let layerWheelIdleTimer = null
let mapWheelTarget = null

function resetLayerWheelGesture() {
  layerWheelAccumulator = 0
  layerWheelGestureTriggered = false
  if (layerWheelIdleTimer) {
    clearTimeout(layerWheelIdleTimer)
    layerWheelIdleTimer = null
  }
}

function scheduleLayerWheelReset() {
  if (layerWheelIdleTimer) clearTimeout(layerWheelIdleTimer)
  layerWheelIdleTimer = setTimeout(() => {
    layerWheelAccumulator = 0
    layerWheelGestureTriggered = false
    layerWheelIdleTimer = null
  }, LAYER_WHEEL_IDLE_MS)
}

function onMapWheel(event) {
  if (!map) return

  const atMinZoom = map.getZoom() <= map.getMinZoom() + MIN_ZOOM_EPSILON
  const scrollingDown = event.deltaY > 0

  // 未到最小缩放时不接管滚轮，继续使用 Leaflet 原有的放大/缩小交互。
  // 最小缩放下向上滚动同样交给 Leaflet，以便重新放大地图。
  if (!atMinZoom || !scrollingDown) {
    resetLayerWheelGesture()
    return
  }

  // 最小缩放后继续向下滚动：阻止 Leaflet 的鼠标定点缩放和页面滚动，避免地图位移。
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()
  scheduleLayerWheelReset()

  if (!stageFlowStarted || layerWheelGestureTriggered) return
  if (stage.value >= LAYER_TEXTS.length - 1) return

  const deltaScale = event.deltaMode === 1
    ? 16
    : event.deltaMode === 2
      ? Math.max(mapEl.value?.clientHeight || 1, 1)
      : 1
  layerWheelAccumulator += Math.abs(event.deltaY) * deltaScale
  if (layerWheelAccumulator < LAYER_WHEEL_THRESHOLD) return

  layerWheelAccumulator = 0
  layerWheelGestureTriggered = true
  const nextStage = stage.value + 1
  applyStage(nextStage)
  switchTextTo(nextStage)
}

const currentTextItem = computed(() => {
  if (currentTextIdx.value < 0 || currentTextIdx.value >= LAYER_TEXTS.length) return null
  const item = LAYER_TEXTS[currentTextIdx.value]
  return { tag: t(item.tag), title: t(item.title), desc: t(item.desc) }
})

// 播放图层文字浮现动画（参考 GSAP）
let textTL = null
function playLayerTextAnim(idx) {
  // 因为 :key="'inner-'+idx" 会重建 inner DOM，nextTick 后 ref 可能仍指向旧容器
  // 所以这里直接通过外层选择器找最新的 panel/inner，保证一定取到新建节点
  let panel = textPanelEl.value
  if (!panel) panel = document.querySelector('.layer-text-panel')
  if (!panel) return
  const inner = panel.querySelector('.ltp-inner')
  if (!inner) return

  // 清理之前的 timeline
  if (textTL) { textTL.kill(); textTL = null }

  // 重置状态
  gsap.set(panel, { clearProps: 'all' })
  gsap.set(inner, { clearProps: 'all' })

  const tag = inner.querySelector('.ltp-tag')
  const title = inner.querySelector('.ltp-title')
  const desc = inner.querySelector('.ltp-desc')

  const tl = gsap.timeline()

  // 面板淡入（从透明到完全显示；位移极小，避免突兀）
  tl.fromTo(panel,
    { opacity: 0, y: 8 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
  )

  // 内层卡片从轻微缩放与模糊淡入
  tl.fromTo(inner,
    { y: 18, filter: 'blur(8px)', opacity: 0, scale: 0.97 },
    { y: 0, filter: 'blur(0px)', opacity: 1, scale: 1, duration: 0.65, ease: 'expo.out' },
    '-=0.5'
  )

  // 标签点弹跳 + 标签文字滑入
  if (tag) {
    const dot = tag.querySelector('.ltp-tag-dot')
    const txt = tag.querySelector('.ltp-tag-text')
    if (dot) {
      tl.fromTo(dot,
        { scale: 0 },
        { scale: 1, duration: 0.4, ease: 'back.out(1.8)' },
        '-=0.45'
      )
    }
    if (txt) {
      tl.fromTo(txt,
        { x: -10, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
        '-=0.32'
      )
    }
  }

  // 标题字符逐字浮现（像 GSAP SplitText）
  if (title) {
    // 因为 inner 使用 :key 重建，无需判断 dataset.split，每次都可安全拆分
    const text = title.textContent
    const splitChars = text => Array.from(text).map(ch => `<span class="ch">${ch}</span>`).join('')
    title.innerHTML = language.value === 'en'
      ? text.split(/\s+/).map(word => `<span class="english-word">${splitChars(word)}</span>`).join(' ')
      : splitChars(text)
    const chs = title.querySelectorAll('.ch')
    if (chs && chs.length) {
      tl.fromTo(chs,
        { y: 20, opacity: 0, rotationX: -30 },
        { y: 0, opacity: 1, rotationX: 0, duration: 0.5, stagger: 0.025, ease: 'back.out(1.4)' },
        '-=0.22'
      )
    }
  }

  // 描述文字淡入
  if (desc) {
    tl.fromTo(desc,
      { y: 12, opacity: 0, filter: 'blur(3px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' },
      '-=0.18'
    )
  }

  textTL = tl
}

// 退出动画（切换阶段时，旧文字先离场再进场）
// 根据需求：文字框消失动画改为"淡入"（此处为淡出，即 opacity 1→0，无任何位移滑出）
function playLayerTextExit(cb) {
  if (!textPanelEl.value || !currentTextItem.value) {
    cb && cb()
    return
  }
  const panel = textPanelEl.value
  gsap.to(panel, {
    opacity: 0, duration: 0.6, ease: 'power2.inOut',
    onComplete: () => { cb && cb() }
  })
}
// SVG <defs> 高斯模糊滤镜引用 id (保证唯一)
const TANG_BLUR_FILTER_ID = 'tang-blur-filter-' + Math.random().toString(36).slice(2, 8)

function onIntroDone() {
  introDone.value = true
  introDoneFlag = true
  // Intro 完成后立刻显示地图容器（introDone.value 生效），但 stage 调度必须等
  // initMap 异步加载完成。调用 startStageFlow 做"双 ready"检查。
  setTimeout(() => {
    if (map) map.invalidateSize()
    startStageFlow()
  }, 300)
}

// 只有 Intro 完成且地图图层全部加载完成后，才启用滚轮驱动的五阶段流程。
// 防止 initMap 比 intro duration 慢时，setTimeout 已经触发但图层还没加载 → 看起来卡住
function startStageFlow() {
  if (stageFlowStarted) return
  // Intro 必须 done + tangLayer/treeMarkers 都加载完成
  const mapReady = (tangLayer !== null && tangBlurLayer !== null)
  if (!introDoneFlag || !mapReady) {
    // 未 ready：再等待。因为 initMap 结束时也会重新调用一次 startStageFlow，所以
    // 这里最多等 mapReadyPromise 即可（Intro 已 done，但 initMap 还在 fetch）
    if (introDoneFlag && !mapReady && resolveMapReady) {
      mapReadyPromise.then(() => { nextTick(() => startStageFlow()) })
    }
    return
  }

  stageFlowStarted = true

  applyStage(0, true)
  nextTick(() => switchTextTo(0, true))
}

// 切换右上角图层文字：先退出再进入
function switchTextTo(idx, immediate = false) {
  if (idx === currentTextIdx.value) return
  const enterNew = () => {
    currentTextIdx.value = idx
    nextTick(() => playLayerTextAnim(idx))
  }
  if (immediate) {
    enterNew()
    return
  }
  playLayerTextExit(enterNew)
}

let animRAF = null
let tangRAF = null
let maskRAF = null

// ----------- 初始化地图 -----------
async function initMap() {
  const albersCRS = createAlbersCRS()
  // 使用 SVG renderer (默认就是 SVG), 稍后给 SVG <defs> 注入高斯模糊滤镜
  const svgRenderer = L.svg({ padding: 2 })
  map = L.map(mapEl.value, {
    crs: albersCRS,
    center: MAP_INIT.center,
    zoom: MAP_INIT.minZoom,
    minZoom: MAP_INIT.minZoom,
    maxZoom: MAP_INIT.maxZoom,
    // 第一章使用 0.5 级缩放，确保配置中的最小等级 3.5 能被准确采用。
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    // 围绕地图中心缩放，不再根据鼠标所在位置向东或向西偏移地图。
    scrollWheelZoom: 'center',
    zoomControl: false,
    attributionControl: false,
    dragging: true,
    doubleClickZoom: false,
    touchZoom: true,
    keyboard: false,
    renderer: svgRenderer
  })

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  // 捕获阶段优先于 Leaflet 处理滚轮，确保最小缩放时不会再产生地图位移。
  mapWheelTarget = map.getContainer()
  mapWheelTarget.addEventListener('wheel', onMapWheel, { capture: true, passive: false })

  // 注入 SVG <defs> 高斯模糊滤镜: 两个 blur radius
  // 1. tang-blur-big:   σ=14px —— 模糊扩展的底晕 (向外扩张大)
  // 2. tang-blur-small: σ=7px  —— 顶部轻微软化边缘
  setTimeout(installSvgFilters, 50)

  const demBounds = await loadDemBounds()

  // === Layer 0: 背景全球 DEM (淡色, 底层, 一直可见) ===
  bgDemLayer = L.imageOverlay(BG_DEM_IMG, demBounds, {
    opacity: 0.78, interactive: false
  }).addTo(map)

  // === Layer 1: 遮罩层 (中国外半透明白, 聚焦) ===
  // 在 Stage 0 为不透明，Stage>=1 时淡出到 0（产茶区、茶树点叠加上来时移除遮罩）
  maskLayer = L.imageOverlay(MASK_IMG, demBounds, {
    opacity: 0, interactive: false
  }).addTo(map)

  // === Layer 2: 中国 DEM + 下沉投影阴影 (主要视觉层) ===
  demLayer = L.imageOverlay(DEM_IMG, demBounds, {
    opacity: 1, interactive: false
  }).addTo(map)

  // === Layer 3: 轮廓线 + 十段线 (线画层面) ===
  try {
    const ro = await fetch(OUTLINE_URL)
    const outlineData = await ro.json()
    outlineLayer = L.geoJSON(outlineData, {
      style: () => ({ ...OUTLINE_STYLE }),
      interactive: false
    }).addTo(map)
  } catch (e) { console.warn('load outline failed:', e) }

  try {
    const rt = await fetch(TENDASH_URL)
    const tendashData = await rt.json()
    tendashLayer = L.geoJSON(tendashData, {
      style: () => ({ ...TENDASH_STYLE }),
      interactive: false
    }).addTo(map)
  } catch (e) { console.warn('load tendash failed:', e) }

  // === Layer 4: 唐代茶区 (初始隐藏) —— 双层: 底层模糊扩张 + 顶层轻微柔边 ===
  // 效果: 没有清晰的边界线, 填充向外有高斯模糊扩展, 像模糊区划
  try {
    const r1 = await fetch(TANG_AREAS_URL)
    const tangData = await r1.json()

    // Layer 4a: 模糊扩张底层 (先渲染, 在最下面)
    tangBlurLayer = L.geoJSON(tangData, {
      style: () => ({
        ...TANG_BLUR_STYLE,
        opacity: 0,
        fillOpacity: 0,
        filter: `url(#${TANG_BLUR_FILTER_ID}-big)`
      }),
      interactive: false
    })
    tangBlurLayer.addTo(map)

    // Layer 4b: 轻微柔边的主填充层 (在上面)
    tangLayer = L.geoJSON(tangData, {
      style: () => ({
        ...TANG_STYLE,
        opacity: 0,
        fillOpacity: 0,
        filter: `url(#${TANG_BLUR_FILTER_ID}-small)`
      }),
      interactive: true
    })
    tangLayer.bindTooltip(layer => {
      const p = layer.feature.properties
      return `<div style="font-family:${language.value === 'en' ? "Times New Roman" : "var(--font-body),KaiTi,STKaiti,serif"};font-style:normal;color:#516D33;padding:2px 4px">
        <b>${t(p.name || '')}</b><br/><span style="font-size:11px;color:#8a8478">${t(p.areaLabel || '')}</span></div>`
    }, { direction: 'top', sticky: true, offset: [0, -6] })
    tangLayer.addTo(map)
  } catch (e) { console.warn('load tang areas failed:', e) }

  // === Layer 5: 古茶树点 (Albers坐标: [x_meter, y_meter]) ===
  try {
    const r2 = await fetch(TEA_TREES_URL)
    const treeData = await r2.json()
    treeData.features.forEach(f => {
      const g = f && f.geometry
      if (!g || !Array.isArray(g.coordinates) || g.coordinates.length < 2) return
      const [x_m, y_m] = g.coordinates
      if (typeof x_m !== 'number' || typeof y_m !== 'number' || !isFinite(x_m) || !isFinite(y_m)) return
      const treeType = (f.properties && (f.properties.type || 2)) || 2
      const s = TREE_TYPE_STYLE[treeType]
      counts[treeType] = (counts[treeType] || 0) + 1
      // Leaflet [lat, lng] = [y_meter, x_meter]
      const m = L.circleMarker([y_m, x_m], {
        radius: 7,
        color: '#fff',
        weight: 1.5,
        fillColor: s.fill,
        fillOpacity: 0, opacity: 0
      })
      const props = f.properties || {}
      const name = props.name || '古茶树'
      const province = props.province
      const species = props.species
      const tn = s.label
      m.bindPopup(() =>
        `<div style="font-family:${language.value === 'en' ? "Times New Roman" : "var(--font-body),KaiTi,STKaiti,serif"};font-style:normal;min-width:170px">
          <b style="color:${s.color};font-family:inherit;font-style:normal">${t(name)}</b><br/>
          <span style="font-size:12px;color:#4a4a40">${language.value === 'en' ? 'Type: ' : '类型：'}${t(tn)}</span><br/>
          ${province ? `<span style="font-size:12px;color:#4a4a40">${language.value === 'en' ? 'Province: ' : '省份：'}${t(province)}</span><br/>` : ''}
          ${species ? `<span style="font-size:12px;color:#4a4a40;font-style:normal">${language.value === 'en' ? 'Species: ' : '学名：'}${t(species)}</span><br/>` : ''}
          <span style="font-size:11px;color:#8a8478">${language.value === 'en' ? 'Coordinates: ' : '坐标：'}${(y_m/1000).toFixed(1)}km, ${(x_m/1000).toFixed(1)}km</span>
        </div>`
      )
      m._teaType = treeType
      m._targetFO = 0.92
      treeMarkers.push(m)
    })
  } catch (e) { console.warn('load tea trees failed:', e) }

  // 页面首次进入时明确保持最小缩放等级，不再由 fitBounds 重新计算缩放值。
  map.setView(MAP_INIT.center, MAP_INIT.minZoom, { animate: false })
  setTimeout(() => map && map.invalidateSize(), 300)

  // 地图所有图层（轮廓/十段线/唐代茶区/古茶树点）均已加载完成
  if (resolveMapReady) {
    resolveMapReady()
    resolveMapReady = null
  }
  // 如果 Intro 比 initMap 先触发，则立刻尝试启动阶段流程
  if (introDoneFlag && !stageFlowStarted) startStageFlow()
}

// --- Mask 淡入淡出动画 (Stage 切换遮罩用) ---
function animateMaskOpacity(target, immediate) {
  if (!maskLayer) return
  if (immediate) {
    maskLayer.setOpacity(target)
    return
  }
  cancelAnimationFrame(maskRAF)
  const cur = maskLayer.options && typeof maskLayer.options.opacity === 'number'
    ? maskLayer.options.opacity : 0
  let start = null, DUR = 900
  const tick = ts => {
    if (start === null) start = ts
    const e = Math.min(1, (ts - start) / DUR)
    const k = e < 1 ? 1 - Math.pow(1 - e, 3) : 1
    maskLayer.setOpacity(cur + (target - cur) * k)
    if (e < 1) maskRAF = requestAnimationFrame(tick)
  }
  maskRAF = requestAnimationFrame(tick)
}

// --- 给 Leaflet 渲染的 SVG 注入 <defs> 高斯模糊滤镜 ---
//   σ=14 用于底层向外扩散晕染, σ=6 用于顶层轻微柔边去硬边
function installSvgFilters() {
  if (!map) return
  const svg = mapEl.value && mapEl.value.querySelector('svg')
  if (!svg) { setTimeout(installSvgFilters, 100); return }
  // 避免重复注入
  if (svg.querySelector('#' + CSS.escape(TANG_BLUR_FILTER_ID + '-big'))) return
  let defs = svg.querySelector('defs')
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    svg.insertBefore(defs, svg.firstChild)
  }
  defs.insertAdjacentHTML('beforeend', `
    <filter id="${TANG_BLUR_FILTER_ID}-big" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur14"/>
      <feGaussianBlur in="blur14" stdDeviation="8" result="blur22"/>
      <feMerge>
        <feMergeNode in="blur22"/>
        <feMergeNode in="blur14"/>
      </feMerge>
    </filter>
    <filter id="${TANG_BLUR_FILTER_ID}-small" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="5.5"/>
    </filter>
  `)
}

function setTangOpacity(layer, targetOp, targetFOp, immediate) {
  if (!layer) return
  if (immediate) {
    layer.eachLayer(p => p.setStyle({ opacity: targetOp, fillOpacity: targetFOp }))
    return
  }
  cancelAnimationFrame(tangRAF)
  const layers = []
  layer.eachLayer(p => {
    const sty = p.options || {}
    layers.push({
      p,
      a0: typeof sty.opacity === 'number' ? sty.opacity : 0,
      f0: typeof sty.fillOpacity === 'number' ? sty.fillOpacity : 0,
    })
  })
  let start = null, DUR = 900
  const tick = ts => {
    if (start === null) start = ts
    const e = Math.min(1, (ts - start) / DUR)
    const k = e < 1 ? 1 - Math.pow(1 - e, 3) : 1
    layers.forEach(({ p, a0, f0 }) => {
      p.setStyle({ opacity: a0 + (targetOp - a0) * k, fillOpacity: f0 + (targetFOp - f0) * k })
    })
    if (e < 1) tangRAF = requestAnimationFrame(tick)
  }
  tangRAF = requestAnimationFrame(tick)
}

function applyStage(next, immediate = false) {
  if (next === stage.value && !immediate) return
  stage.value = next

  // Stage 定义（共 5 个）:
  // 0 — 仅 DEM 展示 (背景DEM + 遮罩 + 中国DEM + 轮廓 + 十段线): 遮罩打开 = 聚焦中国
  // 1 — 产茶区淡入; 遮罩淡出为 0
  // 2 — 野生型古茶树点 (type=1) 淡入
  // 3 — 栽培型古茶树点 (type=3) 淡入
  // 4 — 其他/过渡型古茶树点 (type=2) 淡入

  // === 背景 DEM 透明度: 全程略低, 保持"底色感" ===
  const bgStage0 = 0.78
  const bgStage1 = 0.70
  const bgStage2 = 0.65
  const bgStage3 = 0.62
  const bgStage4 = 0.60
  const bgOp = [bgStage0, bgStage1, bgStage2, bgStage3, bgStage4][next]
  if (bgDemLayer) bgDemLayer.setOpacity(bgOp)

  // === 中国 DEM 透明度 (顶层): 略有弱化, 让位给上层数据 ===
  const demStage0 = 1.00
  const demStage1 = 0.90
  const demStage2 = 0.84
  const demStage3 = 0.81
  const demStage4 = 0.78
  const demOp = [demStage0, demStage1, demStage2, demStage3, demStage4][next]
  if (demLayer) demLayer.setOpacity(demOp)

  // === 遮罩: Stage 0 显示, Stage 1+ 关闭 ===
  const maskOp = next === 0 ? 0.65 : 0.0
  animateMaskOpacity(maskOp, immediate)

  // === 唐代茶区: Stage>=1 淡入 —— 双层: 底层模糊更淡、范围更大; 顶层更清晰 ===
  let tang
  if (next === 0) {
    tang = { o: 0, f: 0, bo: 0, bf: 0 }
  } else if (next === 1) {
    tang = { o: 0.95, f: 0.68, bo: 0.95, bf: 0.48 }
  } else {
    // Stage 2+ 茶树点叠加上来后让渡视觉
    tang = { o: 0.80, f: 0.52, bo: 0.75, bf: 0.38 }
  }
  setTangOpacity(tangLayer, tang.o, tang.f, immediate)
  setTangOpacity(tangBlurLayer, tang.bo, tang.bf, immediate)

  // === 古茶树点: 按类型分阶段逐次淡入 ===
  // Stage 2: type 1（野生型）淡入
  // Stage 3: type 3（栽培型）淡入
  // Stage 4: type 2（其他/过渡型）淡入
  const activeTypeSet = new Set()
  if (next >= 2) activeTypeSet.add(1)  // 野生
  if (next >= 3) activeTypeSet.add(3)  // 栽培
  if (next >= 4) activeTypeSet.add(2)  // 其他/过渡

  // 1. 将所有已激活类型的 marker 添加到地图（未激活的还未出现则不添加）
  treeMarkers.forEach(m => {
    if (activeTypeSet.has(m._teaType)) {
      if (!map.hasLayer(m)) m.addTo(map)
    }
  })

  // 2. 移除不应该出现的类型（如果之前 add 了就移除）
  treeMarkers.forEach(m => {
    if (!activeTypeSet.has(m._teaType) && map.hasLayer(m)) {
      map.removeLayer(m)
      m.setStyle({ fillOpacity: 0, opacity: 0 })
    }
  })

  // 3. 按当前 stage 决定要淡入的类型
  let fadeInTypes = []
  if (next === 2) fadeInTypes.push(1)  // 野生型
  if (next === 3) fadeInTypes.push(3)  // 栽培型
  if (next === 4) fadeInTypes.push(2)  // 其他/过渡型

  if (fadeInTypes.length > 0) {
    animateTreesInByTypes(fadeInTypes, immediate)
  } else if (immediate) {
    // 即时模式下：保证所有当前类型直接达到目标透明度
    treeMarkers.forEach(m => {
      if (activeTypeSet.has(m._teaType)) {
        m.setStyle({ fillOpacity: m._targetFO, opacity: m._targetFO })
      }
    })
  }
}

function animateTreesIn(immediate) {
  animateTreesInByTypes([1, 2, 3], immediate)
}

// 按指定茶树类型逐个淡入（配合 6 个 stage 分阶段使用）
function animateTreesInByTypes(types, immediate) {
  if (!types || !types.length) return
  cancelAnimationFrame(animRAF)
  const typeSet = new Set(types)
  if (immediate) {
    treeMarkers.forEach(m => {
      if (typeSet.has(m._teaType)) {
        m.setStyle({ fillOpacity: m._targetFO, opacity: m._targetFO })
      }
    })
    return
  }
  // 先将目标类型初始化为 0，保证淡入干净
  treeMarkers.forEach(m => {
    if (typeSet.has(m._teaType)) {
      m.setStyle({ fillOpacity: 0, opacity: 0 })
    }
  })
  // 对同一类型内部 marker 基于地理坐标引入轻微 stagger，避免一起弹出
  let start = null, DURATION = 900
  const tick = ts => {
    if (start === null) start = ts
    const e = (ts - start) / DURATION
    treeMarkers.forEach(m => {
      if (!typeSet.has(m._teaType)) return
      const staggerSeed = (typeof m._lat === 'number')
        ? (Math.abs(m._lat) % 1)
        : (Math.abs((m._lng || 0)) % 1)
      const stagger = 0.25 * staggerSeed
      const local = Math.max(0, Math.min(1, (e - stagger) / (1 - stagger)))
      const eased = local < 1 ? 1 - Math.pow(1 - local, 3) : 1
      m.setStyle({ fillOpacity: eased * m._targetFO, opacity: eased * m._targetFO })
    })
    if (e < 1.3) animRAF = requestAnimationFrame(tick)
  }
  animRAF = requestAnimationFrame(tick)
}

onMounted(async () => {
  await initMap()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animRAF)
  cancelAnimationFrame(tangRAF)
  cancelAnimationFrame(maskRAF)
  resetLayerWheelGesture()
  if (mapWheelTarget) {
    mapWheelTarget.removeEventListener('wheel', onMapWheel, true)
    mapWheelTarget = null
  }
  if (textTL) { textTL.kill(); textTL = null }
  if (map) { map.remove(); map = null }
})
</script>

<style scoped>
.page-wrap {
  min-height: 100vh;
  background: linear-gradient(180deg, #F7F4EB 0%, #EFE9DA 100%);
}

.map-fullscreen {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 1.45s ease-in-out;
}
.map-fullscreen.show {
  opacity: 1;
}

.map {
  width: 100%;
  height: 100%;
  /* 匹配背景DEM的米纸色，让无数据处颜色一致 */
  background: #EDE9DE;
}

/* 图例 */
.map-legend {
  position: absolute;
  left: 16px;
  bottom: 18px;
  background: rgba(247, 244, 235, 0.94);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 14px 16px;
  font: 400 12px/1.5 var(--sans);
  color: var(--ink-soft);
  min-width: 218px;
  backdrop-filter: blur(4px);
  z-index: 500;
  box-shadow: 0 4px 20px rgba(81, 109, 51, 0.08);
}
.legend-title {
  font: 600 13px/1 var(--serif);
  color: var(--c-olive);
  letter-spacing: 0.15em;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(81, 109, 51, 0.15);
}
.legend-subtitle {
  font: 500 11px/1 var(--sans);
  color: #8a8478;
  letter-spacing: 0.05em;
  margin: 10px 0 6px;
}
.legend-row {
  display: flex; align-items: center; gap: 9px; margin: 5px 0;
  transition: opacity 0.5s ease;
}
.legend-row.dim { opacity: 0.25; }
.legend-row .count {
  color: #8a8478;
  margin-left: auto;
  font-variant-numeric: tabular-nums;
  font-size: 11px;
}
.legend-row .sw {
  width: 14px; height: 14px; border-radius: 3px; flex: 0 0 auto;
  border: 1px solid rgba(0,0,0,0.12);
}

/* 产茶区 swatch */
.legend-row .tang-sw {
  background: #D4B44C;
  border: 1.5px solid #8E6F38;
  border-radius: 2px;
}

/* 茶树点 swatch: 圆形, 白边 */
.legend-row .t-sw {
  width: 13px; height: 13px;
  border-radius: 50%;
  background: #C8462E;
  border: 1.5px solid #fff;
  box-shadow: 0 0 0 1px rgba(200, 70, 46, 0.25);
}
.legend-row .t-sw.t2 {
  background: #B28F4C;
  box-shadow: 0 0 0 1px rgba(178, 143, 76, 0.25);
}
.legend-row .t-sw.t3 {
  background: #2F5D3A;
  box-shadow: 0 0 0 1px rgba(47, 93, 58, 0.25);
}

/* ================================================================
   右上角图层文字说明面板
   ================================================================ */
.layer-text-panel {
  position: absolute;
  top: 24px;
  right: 24px;
  width: min(380px, 42vw);
  z-index: 800;
  pointer-events: none;
}

.ltp-inner {
  background: rgba(247, 244, 235, 0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(178, 143, 76, 0.42);
  border-left: 3px solid #B28F4C;
  border-radius: 12px;
  padding: 22px 26px 24px;
  box-shadow: 0 10px 40px rgba(81, 109, 51, 0.12),
              0 2px 10px rgba(178, 143, 76, 0.15);
}

.ltp-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 10px;
  background: rgba(92, 124, 58, 0.1);
  border-radius: 20px;
  margin-bottom: 14px;
}

.ltp-tag-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #516D33;
  box-shadow: 0 0 0 3px rgba(81, 109, 51, 0.18);
}

.ltp-tag-text {
  font: 600 11px/1 var(--serif);
  color: #516D33;
  letter-spacing: 0.18em;
  color: #516D33;
}

.ltp-title {
  font: 700 22px/1.3 var(--serif);
  color: #3A4A2A;
  letter-spacing: 0.04em;
  margin: 0 0 14px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(178, 143, 76, 0.3);
  transform-style: preserve-3d;
  perspective: 800px;
}

.ltp-title .ch {
  display: inline-block;
  will-change: transform, opacity;
}

.ltp-desc {
  font: 500 13px/1.9 var(--font-body);
  color: #4A5A3A;
  margin: 0;
  letter-spacing: 0.02em;
  text-align: justify;
}

.layer-scroll-guide {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: fit-content;
  max-width: 100%;
  margin: 14px 8px 0 auto;
}

.layer-scroll-hint {
  display: block;
  padding: 8px 16px 8px 11px;
  border: 1px solid rgba(178, 143, 76, 0.32);
  border-radius: 999px;
  background: rgba(247, 244, 235, 0.9);
  box-shadow: 0 5px 18px rgba(81, 109, 51, 0.1);
  color: #516D33;
  font: 500 15px/1.2 var(--font-body);
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.layer-scroll-chevrons {
  display: flex;
  flex: 0 0 22px;
  height: 32px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.layer-scroll-chevron {
  display: block;
  width: 9px;
  height: 9px;
  margin-top: -3px;
  border-right: 2px solid #B28F4C;
  border-bottom: 2px solid #B28F4C;
  opacity: 0.2;
  transform: translateY(-2px) rotate(45deg);
  animation: layer-scroll-chevron-pulse 1.35s ease-in-out infinite;
  will-change: opacity, transform;
}

.layer-scroll-chevron:first-child { margin-top: 0; }
.layer-scroll-chevron:nth-child(2) { animation-delay: 0.16s; }
.layer-scroll-chevron:nth-child(3) { animation-delay: 0.32s; }

@keyframes layer-scroll-chevron-pulse {
  0%, 62%, 100% {
    opacity: 0.18;
    transform: translateY(-2px) rotate(45deg);
  }
  28% {
    opacity: 1;
    transform: translateY(2px) rotate(45deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .layer-scroll-chevron {
    animation: none;
    opacity: 0.8;
  }
}

@media (max-width: 880px) {
  .layer-text-panel {
    top: 12px;
    right: 8px;
    width: min(290px, 56vw);
  }
  .ltp-inner {
    padding: 14px 18px 16px;
    border-radius: 10px;
  }
  .ltp-title {
    font-size: 17px;
    margin-bottom: 10px;
    padding-bottom: 8px;
  }
  .ltp-desc {
    font-size: 12px;
    line-height: 1.8;
  }
  .layer-scroll-guide {
    gap: 8px;
    margin-top: 10px;
  }
  .layer-scroll-hint {
    padding: 6px 12px 6px 8px;
    font-size: 12px;
  }
  .layer-scroll-chevrons {
    flex-basis: 18px;
    height: 27px;
  }
  .layer-scroll-chevron {
    width: 7px;
    height: 7px;
    border-width: 0 1.5px 1.5px 0;
  }
}

@media (max-width: 880px) {
  .map-legend { left: 8px; bottom: 8px; min-width: 190px; padding: 10px 12px; font-size: 11px; }
  .legend-title { font-size: 12px; }
}
</style>
