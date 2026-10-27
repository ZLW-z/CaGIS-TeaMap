<template>
  <section class="chapter chapter-2" :class="{ 'english-copy': language === 'en' }" :lang="language === 'en' ? 'en' : 'zh-CN'">
    <ChapterIntro
      :ch-no="language === 'en' ? 'II' : chapter.number"
      :title="t(chapter.title)"
      :desc="t(chapter.description)"
      :duration="7"
      @done="onIntroDone"
    />

    <div
      class="chapter-body"
      :class="{ 'ready': layoutReady }"
    >
      <ChapterCornerIntro chapter-key="ch2" :visible="layoutReady" />
      <!-- ========= 左侧：悬浮六宫格（直接叠放在全屏底图上） ========= -->
      <aside ref="leftPanelRef" class="left-panel">
        <div class="six-grid">
          <!-- 槽位 1~5：缩略图卡槽（永远存在 5 个 slot，内部 thumb-card 按是否有内容挂载；用于动画前测量位置） -->
          <div
            v-for="slotIdx in 5"
            :key="'slot-'+slotIdx"
            class="grid-slot thumb-slot"
            :class="'thumb-slot-'+slotIdx"
          >
            <div
              v-if="thumbSlot[slotIdx - 1]"
              class="thumb-card"
              :class="{ 'is-animating-enter': _thumbEnterKey === slotIdx }"
              @click="onThumbClick(thumbSlot[slotIdx - 1])"
            >
              <div class="thumb-img-wrap">
                <div
                  class="thumbnail-map"
                  :data-factor-id="thumbSlot[slotIdx - 1]"
                  :aria-label="language === 'en' ? t(FACTORS[thumbSlot[slotIdx - 1]].name) + ' factor map thumbnail' : FACTORS[thumbSlot[slotIdx - 1]].name + '因子地图缩略图'"
                  :ref="el => setThumbnailMapContainer(thumbSlot[slotIdx - 1], el)"
                ></div>
              </div>
              <div class="thumb-label">
                <span class="thumb-order">{{ slotIdx }}</span>
                <span class="thumb-name">{{ t(FACTORS[thumbSlot[slotIdx - 1]].name) }}</span>
              </div>
            </div>
          </div>

        </div>
      </aside>

      <!-- ========= 全屏主地图区：作为整个页面统一底图 ========= -->
      <main class="main-panel">
        <div
          class="map-title-bar"
          v-if="viewMode === 'composite' || activeFactorId"
        >
          <div v-if="viewMode === 'composite'" class="map-title">
            {{ t('茶树生态适宜性综合评价') }}
          </div>
          <div v-else class="map-title">
            {{ language === 'en' ? t(currentConfig.name) + ' Suitability Analysis' : currentConfig.name + '适宜性分析' }}
          </div>
        </div>

        <div
          class="map-stage"
          :class="{ 'map-fade-in': mapReady }"
        >
          <div ref="mapRef" class="map"></div>

          <div
            class="factor-fade-mask"
            :class="{ show: layerFading }"
          ></div>
        </div>
      </main>

      <!-- ========= 右侧工具组：说明卡（上） + 转盘/溯回（下），固定在右下角 ========= -->
      <div ref="toolGroupRef" class="tool-group">
        <!-- 图例：与说明卡、转盘共用右侧纵向工具列 -->
        <div v-if="showLegend" class="legend-inner">
          <div class="legend-title" style="font-style:normal !important">{{ t(legendTitle) }}</div>
          <div
            v-for="lv in legendLevels"
            :key="lv.value"
            class="legend-row"
          >
            <span class="sw" :style="{ background: lv.color }"></span>
            <div class="legend-row-text">
              <span class="legend-label">{{ t(lv.label) }}</span>
              <span v-if="lv.range" class="legend-range">{{ t(lv.range) }}</span>
            </div>
          </div>
          <!-- 综合评价结论分析：仅在综合评价模式显示 -->
          <div v-if="viewMode === 'composite'" class="composite-conclusion">
            <p>{{ t('本评价综合积温、气温、降水、土壤酸碱度与光照五项关键生态因子，运用层次分析法加权建模，以此解读山川风土与茶树生长之间的契合。') }}</p>
            <p>{{ t('纵观全国，茶树最适宜的生长之地主要集中在江南丘陵与武夷、南岭之间，以及滇南、川南一带——这里气候温润，四季分明，土壤酸度相宜，山间云雾滋养嫩芽，逐渐形成以浙江、福建、云南、四川四省为核心的中华名茶主产区。一方水土养一方茶，茶树择境而生，得天地和气，方成一叶清芳。') }}</p>
          </div>
        </div>

        <!-- 转盘：右下角固定 -->
        <div
          v-if="viewMode === 'detail'"
          class="wheel-area"
        >
          <div class="wheel-wrap">
            <div class="wheel">
              <svg viewBox="-110 -110 220 220" class="wheel-svg">
                <defs>
                  <filter id="ch2-sector-glow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="3" result="b1" />
                    <feMerge>
                      <feMergeNode in="b1" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <radialGradient id="ch2-lock-highlight" cx="50%" cy="50%" r="50%">
                    <stop offset="0%"   stop-color="rgba(255,255,255,0.45)" />
                    <stop offset="60%"  stop-color="rgba(255,245,200,0.12)" />
                    <stop offset="100%" stop-color="rgba(255,245,200,0)" />
                  </radialGradient>
                </defs>
                <circle cx="0" cy="0" r="92" fill="none" stroke="#B2A67D" stroke-width="0.7" opacity="0.7"/>
                <circle cx="0" cy="0" r="60" fill="none" stroke="#B2A67D" stroke-width="0.4" stroke-dasharray="2 3" opacity="0.5"/>
                <g v-for="(fid, i) in WHEEL_ORDER" :key="'sec-'+fid">
                  <path
                    :d="sectorPath(i, 10, 88)"
                    :fill="WHEEL_SECTOR_COLORS[fid]"
                    class="sector"
                    :class="SectorClass(fid)"
                  />
                  <path
                    v-if="lockedFactor === fid"
                    :d="sectorPath(i, 10, 88)"
                    fill="url(#ch2-lock-highlight)"
                    stroke="#EACF78"
                    stroke-width="1.6"
                    class="sector-lock-stroke"
                    filter="url(#ch2-sector-glow)"
                    :style="LockedSectorStyle(i)"
                    pointer-events="none"
                  />
                </g>
                <line
                  v-for="i in 5"
                  :key="'sep'+i"
                  :x1="Math.cos((i*72 - 90) * Math.PI/180) * 10"
                  :y1="Math.sin((i*72 - 90) * Math.PI/180) * 10"
                  :x2="Math.cos((i*72 - 90) * Math.PI/180) * 88"
                  :y2="Math.sin((i*72 - 90) * Math.PI/180) * 88"
                  stroke="rgba(139,125,90,0.5)"
                  stroke-width="0.5"
                />
              </svg>
              <div
                v-for="(fid, i) in WHEEL_ORDER"
                :key="'lbl-'+fid"
                class="factor-label"
                :style="labelStyle(i)"
                :class="{
                  'lbl-scan':   scanIndex === i && drawPhase === 'spinning',
                  'lbl-locked': lockedFactor === fid,
                  'lbl-picked': drawOrder.includes(fid) && lockedFactor !== fid,
                }"
              >
                <span class="label-name">{{ t(FACTORS[fid].name) }}</span>
                <span
                  v-if="drawOrder.includes(fid) && lockedFactor !== fid"
                  class="picked-dot"
                ></span>
              </div>
            </div>
            <button
              class="center-btn"
              :class="{
                'ready-hl': drawPhase === 'complete',
                'busy':     drawPhase === 'spinning' || drawPhase === 'committing',
              }"
              :disabled="btnDisabled"
              @click.stop="onCenterClick"
            >
              <div class="center-text">{{ t(centerText) }}</div>
            </button>
          </div>
        </div>

        <!-- 综合分析状态下的溯回按钮：右下角，取代转盘 -->
        <div v-if="viewMode === 'composite'" class="return-area">
          <button class="return-btn" @click="onReturn">{{ t('再看一遍') }}</button>
        </div>
      </div>

      <!-- ========= 数据与分类依据注解：常驻 i 按钮 + 浮动面板（避开右侧工具列） ========= -->
      <div ref="notesRootRef" class="notes-widget">
        <transition name="notes-fade">
          <div
            v-if="notesOpen && activeNote"
            class="notes-panel"
            role="dialog"
            :aria-label="t('数据与分类依据')"
          >
            <div class="notes-head">
              <div>
                <div class="notes-caption">{{ t('数据与分类依据') }}</div>
                <div class="notes-factor-title">{{ activeNote.title }}</div>
              </div>
              <button
                class="notes-close"
                :aria-label="t('关闭注解面板')"
                @click.stop="notesOpen = false"
              >×</button>
            </div>
            <div class="notes-scroll">
              <div
                v-for="f in noteFields"
                :key="f.key"
                class="note-item"
              >
                <div class="note-item-label">{{ t(f.label) }}</div>
                <div v-if="f.text" class="note-item-text">{{ f.text }}</div>
                <div v-else-if="f.key === 'classification'" class="note-item-text note-levels">
                  <div
                    v-for="lv in noteLevels"
                    :key="lv.value"
                    class="note-level"
                  >
                    <span class="note-level-sw" :style="{ background: lv.color }"></span>
                    <span class="note-level-label">{{ t(lv.label) }}</span>
                    <span v-if="lv.range" class="note-level-range">{{ t(lv.range) }}</span>
                  </div>
                  <div v-if="noteLevelExtra" class="note-level-extra">{{ t(noteLevelExtra) }}</div>
                </div>
              </div>
              <div v-if="activeNote.note" class="note-item">
                <div class="note-item-label">{{ t('说明') }}</div>
                <div class="note-item-text">{{ activeNote.note }}</div>
              </div>
              <div
                v-if="activeNote.sources && activeNote.sources.length"
                class="note-item"
              >
                <div class="note-item-label">{{ t('参考来源') }}</div>
                <div class="note-source-links">
                  <a
                    v-for="s in activeNote.sources"
                    :key="s.url"
                    :href="s.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >{{ t(s.label) }} ↗</a>
                </div>
              </div>
            </div>
          </div>
        </transition>
        <button
          class="notes-trigger"
          :class="{ open: notesOpen }"
          :aria-label="t('数据与分类依据')"
          :title="t('数据与分类依据')"
          @click.stop="notesOpen = !notesOpen"
        >i</button>
      </div>
    </div>

    <!-- 主图↔缩略图使用真实 DOM（Leaflet 容器 / 缩略图卡）做 CSS transform 缩放，
         无 PNG overlay；地图的真实 SVG / tile 元素会跟着 transform 一起缩放。 -->
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick, shallowRef } from 'vue'
import L from 'leaflet'
import ChapterIntro from './ChapterIntro.vue'
import ChapterCornerIntro from './ChapterCornerIntro.vue'
import { CHAPTER_META } from '../data/chapterMeta.js'
import {
  FACTORS, COMPOSITE,
  PROV_BG_URL, PROV_STYLE,
  PROV_FILL_STYLE, PROV_STROKE_STYLE,
  OUTLINE_URL, TENDASH_URL,
  OUTLINE_STYLE, TENDASH_STYLE,
  FULL_CHINA_BOUNDS, THUMBNAIL_DISPLAY_BOUNDS, TOOL_GROUP_SAFE_WIDTH,
  loadFactorBounds,
  BG_IMAGE_FILES,
} from '../config/ch2.js'
import { FACTOR_NOTES, getFactorLevels, CLASSIFICATION_EXTRA } from '../config/ch2Notes.js'
import { getMapOptions } from '../utils/crs.js'
import { useLanguage } from '../utils/language.js'
import { ch2NotesEnglish } from '../data/ch2English.js'

const { language, t } = useLanguage()

const WHEEL_ORDER = ['ph', 'precip', 'temp', 'accum', 'rad']
const WHEEL_SECTOR_COLORS = {
  // 低饱和自然色：保持茶系页面气质，同时用色相建立因子语义。
  ph:     '#6E6B70', // 冷灰紫：土壤酸碱度
  precip: '#708A91', // 茶灰蓝：降水与水分
  temp:   '#9A6657', // 砖陶赭：气温
  accum:  '#A88B55', // 柔茶金：积温累积
  rad:    '#7C895C', // 灰橄榄绿：光照与植被生长
}

/* =========================================================
 * 章节状态
 * ========================================================= */
const chapter = CHAPTER_META.ch2
const introDone   = ref(false)
const layoutReady = ref(false)
const mapReady    = ref(false)

function onIntroDone() {
  introDone.value = true
  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        await initMapAndFit()
        layoutReady.value = true
        nextTick(() => { if (map) map.invalidateSize(false) })
      })
    })
  })
}

/* =========================================================
 * 有限状态机
 * ========================================================= */
const drawPhase = ref(/** @type {'idle'|'ready'|'spinning'|'committing'|'complete'|'comprehensive'} */ ('idle'))
const drawOrder = ref([])
const archivedFactorIds = ref([])
const selectedFactors = ref(new Set())
const activeFactorId = ref(null)
const lastDrawnFactorId = ref(null)
const viewMode = ref(/** @type {'detail'|'composite'} */ ('detail'))

const isVisualLocked = ref(false)

const isDrawComplete = computed(() => drawOrder.value.length >= 5)

const remainingFactors = computed(() => {
  const set = new Set(drawOrder.value)
  return WHEEL_ORDER.filter(f => !set.has(f))
})

// 新 thumbSlot 规则：detail 模式下 = drawOrder 中除 activeFactorId 外按顺序；
//                  composite 模式下 = 全部 5 张
const thumbSlot = computed(() => {
  if (viewMode.value === 'composite') return [...drawOrder.value]
  return drawOrder.value.filter(fid => archivedFactorIds.value.includes(fid))
})

const currentConfig = computed(() => {
  if (viewMode.value === 'composite') return COMPOSITE
  if (!activeFactorId.value) return null
  return FACTORS[activeFactorId.value]
})

const showLegend = computed(() => {
  if (viewMode.value === 'composite') return true
  return !!activeFactorId.value
})
const legendTitle = computed(() => {
  if (viewMode.value === 'composite') return '综合分级'
  return currentConfig.value?.name ?? ''
})
const legendLevels = computed(() => {
  if (viewMode.value === 'composite') return COMPOSITE.levels
  return currentConfig.value?.levels ?? []
})

const btnDisabled = computed(() => {
  return drawPhase.value === 'spinning'
      || drawPhase.value === 'committing'
      || isVisualLocked.value
})
const centerText = computed(() => {
  if (drawPhase.value === 'spinning' || drawPhase.value === 'committing') return '抽取中'
  if (viewMode.value === 'composite') return '综合分析'
  if (drawPhase.value === 'complete') return '综合分析'
  if (drawOrder.value.length === 0) return '开始'
  return '继续抽取'
})

/* =========================================================
 * 主图背景图（淡入淡出切换）+ 浅米色蒙版
 *   - 位置: .leaflet-container 内部, 在 leaflet-map-pane / leaflet-control-container 之前
 *           z-index 低于 Leaflet 各 pane, 背景真正位于行政区填充、边界、因子数据之下
 *           只出现在地图矩形区域内部，被 .map-stage overflow 裁切
 *   - 背景图 opacity 0.18, 再覆盖浅米色蒙版 rgba(239,233,218,0.48), 保持淡雅青绿米白风格
 *   - object-fit: cover (不变形，可裁切边缘)
 *   - 双固定 DOM 节点 ch2-bgimg-A/B, 交叉淡入淡出 750ms
 *   - 运行时用 resolveBgUrl 根据 BASE_URL 拼绝对路径, 兼容 vite base='./' / Vercel / 本地
 *   - operationId 处理快速点击（连续点击缩略图时旧回调不得覆盖新状态）
 *   - 空闲预加载 6 张背景图，避免首次切换闪烁
 * ========================================================= */
const _bgImgs = { A: null, B: null }        // HTMLImageElement
const _bgKeyOf = { A: null, B: null }       // 每个槽位对应因子 key
const bgActiveSlot = ref(null)              // 'A' | 'B' | null
const BG_TARGET_OPACITY = 0.18              // 只作用于背景图层，不影响真实地图图层
const BG_TRANSITION_MS = 750
let _bgSwitchTimers = []
let _bgOpSeq = 0                            // 每次切换 +1，过期回调被直接忽略

// 文件名 -> 浏览器绝对 URL（public/data/2/images 下）
function resolveBgUrl(fileName) {
  const base = (import.meta.env && import.meta.env.BASE_URL) || '/'
  const normalized = base.endsWith('/') ? base : base + '/'
  const suffix = 'data/2/images/' + encodeURIComponent(fileName)
  try {
    return new URL(normalized + suffix, window.location.href).href
  } catch(e) {
    return normalized + suffix
  }
}

// 在 .leaflet-container 内部插入两张背景图 + 一层蒙版，均在各 Leaflet pane 之前
function initBgLayer(m) {
  const lc = m && typeof m.getContainer === 'function' ? m.getContainer() : null
  if (!lc) return
  // 浅米色蒙版（在两张背景之上、leaflet pane 之下）
  let mask = lc.querySelector('div.ch2-bg-mask')
  if (!mask) {
    mask = document.createElement('div')
    mask.className = 'ch2-bg-mask'
    const first = lc.firstChild
    if (first) lc.insertBefore(mask, first)
    else lc.appendChild(mask)
  }
  for (const slot of ['A', 'B']) {
    let img = lc.querySelector('img.ch2-bgimg-' + slot)
    if (!img) {
      img = document.createElement('img')
      img.className = 'ch2-bgimg ch2-bgimg-' + slot
      img.setAttribute('data-slot', slot)
      img.alt = ''
      if (lc.contains(mask)) lc.insertBefore(img, mask)
      else { const first = lc.firstChild; lc.insertBefore(img, first) }
    }
    _bgImgs[slot] = img
    _bgKeyOf[slot] = null
    img.style.opacity = '0'
    if (img._onloadFn) img.removeEventListener('load', img._onloadFn)
    if (img._onerrFn)  img.removeEventListener('error', img._onerrFn)
    const opSeedRef = { seq: 0 }
    img._opSeed = opSeedRef
    img._onloadFn = () => onBgLoad(slot, opSeedRef)
    img._onerrFn  = () => onBgError(slot, opSeedRef)
    img.addEventListener('load', img._onloadFn)
    img.addEventListener('error', img._onerrFn)
  }
}

// 背景 key = activeFactorId / viewMode 的派生状态，不单独维护业务变量
const currentBgKey = computed(() => {
  if (viewMode.value === 'composite') return 'composite'
  if (activeFactorId.value && FACTORS[activeFactorId.value]) return activeFactorId.value
  // 尚未抽取任何因子时，也保持完整的页面氛围；复用综合评价背景，
  // 后续抽中因子后仍由既有双缓冲逻辑平滑切换到对应背景。
  return 'composite'
})

const _bgPreloadDone = { v: false }
function preloadAllBgImages() {
  if (_bgPreloadDone.v) return
  _bgPreloadDone.v = true
  const keys = ['precip','temp','accum','rad','ph','composite']
  const run = () => keys.forEach(k => {
    const file = BG_IMAGE_FILES[k]
    if (!file) return
    try {
      const img = new Image()
      img.onerror = () => console.warn('[ch2-bg] preload failed:', k, file)
      img.src = resolveBgUrl(file)
    } catch(e) {}
  })
  if (typeof requestIdleCallback === 'function') {
    try { requestIdleCallback(run, { timeout: 3000 }) } catch(e) { setTimeout(run, 1500) }
  } else {
    setTimeout(run, 1500)
  }
}

// 切换背景，带 operationId；快速点击只保留最后一次
function applyBgForKey(key, forceReload = false) {
  _bgSwitchTimers.forEach(h => clearTimeout(h))
  _bgSwitchTimers = []

  if (!key || !BG_IMAGE_FILES[key]) {
    for (const s of ['A', 'B']) {
      if (_bgImgs[s]) _bgImgs[s].style.opacity = '0'
      _bgKeyOf[s] = null
    }
    bgActiveSlot.value = null
    return
  }

  const opId = ++_bgOpSeq
  const url = resolveBgUrl(BG_IMAGE_FILES[key])
  const curKey = bgActiveSlot.value ? _bgKeyOf[bgActiveSlot.value] : null

  // 已经是正确 key → 仅保证 src / opacity 即可，不做动画重启
  if (!forceReload && curKey === key) {
    const img = bgActiveSlot.value ? _bgImgs[bgActiveSlot.value] : null
    if (img && img.src !== url) img.src = url
    if (img) img.style.opacity = String(BG_TARGET_OPACITY)
    return
  }

  const target = (!bgActiveSlot.value ? 'A' : (bgActiveSlot.value === 'A' ? 'B' : 'A'))
  const img = _bgImgs[target]
  if (!img) return

  _bgKeyOf[target] = key
  if (img._opSeed) img._opSeed.seq = opId
  img.style.opacity = '0'
  img.src = url

  const commit = () => {
    if (opId !== _bgOpSeq) return
    if (_bgKeyOf[target] !== key) return
    _swapActive(target)
  }

  if (img.complete && img.naturalWidth > 0) {
    commit()
  } else {
    const h = setTimeout(commit, 3500)
    _bgSwitchTimers.push(h)
  }
}

function _swapActive(slot) {
  bgActiveSlot.value = slot
  const img = _bgImgs[slot]
  const other = (slot === 'A' ? 'B' : 'A')
  const oImg = _bgImgs[other]
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (img)  img.style.opacity  = String(BG_TARGET_OPACITY)
      if (oImg) oImg.style.opacity = '0'
    })
  })
  const h = setTimeout(() => {
    if (bgActiveSlot.value !== slot) return
    // 旧槽位不清 src，保留在内存里便于快速切回
  }, BG_TRANSITION_MS + 80)
  _bgSwitchTimers.push(h)
}

function onBgLoad(slot, opSeedRef) {
  if (!opSeedRef || opSeedRef.seq !== _bgOpSeq) return
  const slotKey = _bgKeyOf[slot]
  const expected = currentBgKey.value
  const img = _bgImgs[slot]
  if (!img || !slotKey || slotKey !== expected) return
  if (bgActiveSlot.value !== slot) _swapActive(slot)
  else img.style.opacity = String(BG_TARGET_OPACITY)
}
function onBgError(slot, opSeedRef) {
  const slotKey = _bgKeyOf[slot]
  if (opSeedRef && opSeedRef.seq === _bgOpSeq && slotKey) {
    console.warn('[ch2-bg] load failed slot=' + slot + ' key=' + slotKey + ' file=' + (BG_IMAGE_FILES[slotKey] || ''))
  }
  const img = _bgImgs[slot]
  if (img) img.style.opacity = '0'
}

watch(mapReady, (ready) => {
  if (ready && map) {
    try { initBgLayer(map) } catch(e) { console.warn('[ch2-bg] initBgLayer error', e) }
    nextTick(() => {
      preloadAllBgImages()
      const key = currentBgKey.value
      if (key) applyBgForKey(key)
    })
  }
}, { immediate: true })

watch([activeFactorId, viewMode], () => {
  if (!mapReady.value) return
  applyBgForKey(currentBgKey.value)
})

/* =========================================================
 * 转盘扫描 & 动画控制
 * ========================================================= */
const scanIndex    = ref(-1)
const lockedFactor = ref(null)
const layerFading  = ref(false)
const _thumbEnterKey = ref(0)

let _opId = 0
let _currentOpId = 0
let _spinTimers = []
let _hardKillTimer = null
let _resizeTimer = null

function clearSpinTimers() {
  _spinTimers.forEach(t => clearTimeout(t))
  _spinTimers = []
}
function addTimer(fn, ms) {
  const h = setTimeout(fn, ms)
  _spinTimers.push(h)
  return h
}
function clearHardKill() {
  if (_hardKillTimer) { clearTimeout(_hardKillTimer); _hardKillTimer = null }
}

/* =========================================================
 * GeoJSON 数据缓存（避免重复 fetch）
 * ========================================================= */
let _provDataCache = null
let _outlineDataCache = null
let _tendashDataCache = null

async function _getProvData() {
  if (!_provDataCache) {
    const res = await fetch(PROV_BG_URL)
    _provDataCache = await res.json()
  }
  return _provDataCache
}
async function _getOutlineData() {
  if (!_outlineDataCache) {
    try {
      const res = await fetch(OUTLINE_URL)
      _outlineDataCache = await res.json()
    } catch (e) {
      console.warn('[ch2] outline data fetch failed:', e)
      _outlineDataCache = null
    }
  }
  return _outlineDataCache
}
async function _getTendashData() {
  if (!_tendashDataCache) {
    try {
      const res = await fetch(TENDASH_URL)
      _tendashDataCache = await res.json()
    } catch (e) {
      console.warn('[ch2] tendash data fetch failed:', e)
      _tendashDataCache = null
    }
  }
  return _tendashDataCache
}

/* =========================================================
 * 共享图层添加函数（主图和缩略图渲染器共用）
 *
 * 图层顺序（从下到上）：
 *   1. ch2Base pane  (zIndex 200) → 省级行政区底图（fill）
 *   2. overlayPane   (zIndex 400) → 因子重分类 ImageOverlay
 *   3. ch2Border pane(zIndex 450) → 省级边界线 + 国界 + 九段线
 * ========================================================= */
const COORDS_TO_LATLNG = coords => new L.LatLng(coords[1], coords[0], true)

function getFactorLayerConfig(factorKey) {
  const config = factorKey === 'composite' ? COMPOSITE : FACTORS[factorKey]
  if (!config) return null
  return {
    factorKey,
    dataUrl: config.png,
    boundsUrl: config.boundsUrl,
    opacity: 1,
  }
}

async function _addProvFillLayer(m) {
  const data = await _getProvData()
  return L.geoJSON(data, {
    pane: 'ch2Base',
    style: () => ({ ...PROV_FILL_STYLE }),
    coordsToLatLng: COORDS_TO_LATLNG,
    interactive: false,
  }).addTo(m)
}
async function _addProvStrokeLayer(m) {
  const data = await _getProvData()
  return L.geoJSON(data, {
    pane: 'ch2Border',
    style: () => ({ ...PROV_STROKE_STYLE }),
    coordsToLatLng: COORDS_TO_LATLNG,
    interactive: false,
  }).addTo(m)
}
async function _addOutlineLayer(m) {
  const data = await _getOutlineData()
  if (!data) return null
  return L.geoJSON(data, {
    pane: 'ch2Border',
    style: () => ({ ...OUTLINE_STYLE }),
    coordsToLatLng: COORDS_TO_LATLNG,
    interactive: false,
  }).addTo(m)
}
async function _addTendashLayer(m) {
  const data = await _getTendashData()
  if (!data) return null
  return L.geoJSON(data, {
    pane: 'ch2Border',
    style: () => ({ ...TENDASH_STYLE }),
    coordsToLatLng: COORDS_TO_LATLNG,
    interactive: false,
  }).addTo(m)
}
async function _addFactorOverlay(m, fid) {
  const cfg = getFactorLayerConfig(fid)
  if (!cfg) return null
  const bounds = await loadFactorBounds(fid)
  const layer = L.imageOverlay(cfg.dataUrl, bounds, {
    opacity: 1, interactive: false, crossOrigin: true,
  })
  // 等待真实的图像加载事件，不用固定延迟猜测资源是否就绪。
  const loaded = new Promise(resolve => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      layer.off('load', finish)
      layer.off('error', onError)
      resolve()
    }
    const onError = error => {
      console.warn('[ch2-thumb] factor image failed:', fid, error)
      finish()
    }
    layer.on('load', finish)
    layer.on('error', onError)
  })
  layer.addTo(m)
  const img = layer.getElement()
  if (img && img.complete && img.naturalWidth > 0) {
    layer.fire('load')
  }
  await loaded
  return layer
}

/* =========================================================
 * 地图安全区宽度计算
 * ========================================================= */
const leftPanelRef = ref(null)
const toolGroupRef = ref(null)

function _getSafetyLeft() {
  const rect = leftPanelRef.value?.getBoundingClientRect()
  if (rect && rect.width > 0) return Math.ceil(rect.right + 24)
  const vw = window.innerWidth
  if (vw <= 900) return 320
  if (vw <= 1200) return 390
  return 500
}

function _getSafetyRight() {
  const rect = toolGroupRef.value?.getBoundingClientRect()
  if (rect && rect.width > 0) return Math.ceil(window.innerWidth - rect.left + 24)
  const vw = window.innerWidth
  if (vw <= 900) return 260
  if (vw <= 1200) return 300
  return TOOL_GROUP_SAFE_WIDTH
}

/* =========================================================
 * Leaflet 主地图
 * ========================================================= */
const mapRef = ref(null)
let map = null
let provFillLayer = null
let provStrokeLayer = null
let outlineLayer = null
let tendashLayer = null
let factorLayer = null

async function initMapAndFit() {
  if (map) return
  const opts = getMapOptions()
  map = L.map(mapRef.value, { ...opts, zoomControl: true, attributionControl: false })

  // 创建自定义 pane：ch2Base (省填充) 在因子图层下方，ch2Border (省界+国界+九段线) 在因子图层上方
  map.createPane('ch2Base')
  map.getPane('ch2Base').style.zIndex = 200
  map.createPane('ch2Border')
  map.getPane('ch2Border').style.zIndex = 450

  // 省级填充（因子图层下方）
  try {
    provFillLayer = await _addProvFillLayer(map)
  } catch (e) { console.warn('[ch2] province fill failed:', e) }

  // 省级边界 + 国界 + 九段线（因子图层上方）
  try { provStrokeLayer = await _addProvStrokeLayer(map) } catch (e) { console.warn('[ch2] province stroke failed:', e) }
  try { outlineLayer = await _addOutlineLayer(map) } catch (e) { console.warn('[ch2] outline failed:', e) }
  try { tendashLayer = await _addTendashLayer(map) } catch (e) { console.warn('[ch2] tendash failed:', e) }

  map.invalidateSize(false)
  // 使用统一全国范围，并为底图上的左右悬浮控件预留安全区。
  map.fitBounds(FULL_CHINA_BOUNDS, {
    paddingTopLeft: [_getSafetyLeft(), 64],
    paddingBottomRight: [_getSafetyRight(), 72],
    animate: false,
  })
  setTimeout(() => { mapReady.value = true }, 80)

  // 窗口尺寸变化时重新计算安全区域
  window.addEventListener('resize', _onResize)
}

function _onResize() {
  if (_resizeTimer) clearTimeout(_resizeTimer)
  _resizeTimer = setTimeout(() => {
    if (!map) return
    map.invalidateSize(false)
    map.fitBounds(FULL_CHINA_BOUNDS, {
      paddingTopLeft: [_getSafetyLeft(), 64],
      paddingBottomRight: [_getSafetyRight(), 72],
      animate: false,
    })
  }, 250)
}

async function updateFactorLayer() {
  if (!map) return
  if (factorLayer) { map.removeLayer(factorLayer); factorLayer = null }
  layerFading.value = false

  if (viewMode.value === 'composite') {
    layerFading.value = true
    await new Promise(r => setTimeout(r, 30))
    try {
      const bounds = await loadFactorBounds('composite')
      factorLayer = L.imageOverlay(COMPOSITE.png, bounds, {
        opacity: 0, interactive: false, crossOrigin: true,
      }).addTo(map)
animateOpacity(factorLayer, 450)
  } catch (e) {
    console.warn('[ch2] composite overlay failed:', e)
    layerFading.value = false
  }
  return
}
const fid = activeFactorId.value
if (!fid) return
layerFading.value = true
await new Promise(r => setTimeout(r, 30))
try {
  const cfg = FACTORS[fid]
  const bounds = await loadFactorBounds(fid)
  factorLayer = L.imageOverlay(cfg.png, bounds, {
    opacity: 0, interactive: false, crossOrigin: true,
  }).addTo(map)
  animateOpacity(factorLayer, 450)
} catch (e) {
  console.warn('[ch2] factor overlay failed:', e)
  layerFading.value = false
}
}

function animateOpacity(layer, dur) {
  const t0 = performance.now()
  const step = () => {
    if (!layer) return
    const p = Math.min(1, (performance.now() - t0) / dur)
    layer.setOpacity(p)
    if (p < 1) requestAnimationFrame(step)
    else layerFading.value = false
  }
  requestAnimationFrame(step)
}

watch([activeFactorId, viewMode], () => {
  if (mapReady.value) nextTick(updateFactorLayer)
})

/* =========================================================
 * 左侧因子缩略图地图
 *   每个可见因子拥有独立 Leaflet 实例；卡片不再显示 Canvas 截图。
 *   坐标、图片、Bounds 与主图共用同一配置和 Albers CRS。
 * ========================================================= */
const THUMBNAIL_PADDING = 4
const THUMBNAIL_ZOOM_BOOST = 0.78
const THUMBNAIL_OUTLINE_STYLE = {
  color: '#66784D', weight: 0.9, opacity: 0.9,
  fillOpacity: 0, interactive: false,
}
const THUMBNAIL_TENDASH_STYLE = {
  color: '#66784D', weight: 0.7, opacity: 0.82,
  dashArray: '3,2', fillOpacity: 0, interactive: false,
}

const thumbnailMapInstances = new Map()
const thumbnailContainers = new Map()
const thumbnailResizeObservers = new Map()
const thumbnailInitPending = new Set()
let thumbnailSyncRaf = 0
let thumbnailSystemActive = true

function scheduleThumbnailFit(record) {
  if (!record || !record.map || !record.viewBounds) return
  if (record.fitRaf) cancelAnimationFrame(record.fitRaf)
  record.fitRaf = requestAnimationFrame(() => {
    record.fitRaf = 0
    if (!record.map || !record.container?.isConnected) return
    const rect = record.container.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    record.map.invalidateSize({ pan: false, animate: false })
    record.map.fitBounds(record.viewBounds, {
      paddingTopLeft: [THUMBNAIL_PADDING, THUMBNAIL_PADDING],
      paddingBottomRight: [THUMBNAIL_PADDING, THUMBNAIL_PADDING],
      animate: false,
    })
    // 在仍以中国全域中心为基准的前提下略微放大，提升缩略图辨识度。
    const fittedZoom = record.map.getZoom()
    record.map.setZoom(
      Math.min(record.map.getMaxZoom(), fittedZoom + THUMBNAIL_ZOOM_BOOST),
      { animate: false },
    )
  })
}

function attachThumbnailResizeObserver(factorKey, container) {
  const previous = thumbnailResizeObservers.get(factorKey)
  if (previous) previous.observer.disconnect()

  const state = { observer: null, width: -1, height: -1, raf: 0 }
  state.observer = new ResizeObserver(entries => {
    const entry = entries[entries.length - 1]
    const width = entry?.contentRect?.width || 0
    const height = entry?.contentRect?.height || 0
    if (width <= 0 || height <= 0) return
    if (Math.abs(width - state.width) < 0.5 && Math.abs(height - state.height) < 0.5) return
    state.width = width
    state.height = height
    if (state.raf) cancelAnimationFrame(state.raf)
    state.raf = requestAnimationFrame(() => {
      state.raf = 0
      const record = thumbnailMapInstances.get(factorKey)
      if (record) scheduleThumbnailFit(record)
      else scheduleThumbnailInitialization(factorKey)
    })
  })
  state.observer.observe(container)
  thumbnailResizeObservers.set(factorKey, state)
}

async function initializeThumbnailMap(factorKey, container) {
  if (!thumbnailSystemActive || !container?.isConnected) return
  if (thumbnailMapInstances.has(factorKey) || thumbnailInitPending.has(factorKey)) return
  const rect = container.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return

  thumbnailInitPending.add(factorKey)
  let thumbnailMap = null
  try {
    const opts = getMapOptions()
    thumbnailMap = L.map(container, {
      ...opts,
      // 主地图 minZoom 为 4；缩略图必须允许继续缩小，才能完整容纳中国全域。
      minZoom: 0.8,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      tap: false,
      touchZoom: false,
      preferCanvas: true,
      zoomSnap: 0.1,
      zoomDelta: 0.1,
      fadeAnimation: false,
      zoomAnimation: false,
      markerZoomAnimation: false,
    })

    // 与主图保持一致：浅米色中国区域位于因子栅格下方，
    // 既明确完整版图轮廓，也不会遮盖缩略图中的因子数据。
    thumbnailMap.createPane('thumbnailBase')
    thumbnailMap.getPane('thumbnailBase').style.zIndex = 350
    thumbnailMap.createPane('thumbnailFactor')
    thumbnailMap.getPane('thumbnailFactor').style.zIndex = 400
    thumbnailMap.createPane('thumbnailOutline')
    thumbnailMap.getPane('thumbnailOutline').style.zIndex = 460

    const [provinceData, outlineData, tendashData, factorBounds] = await Promise.all([
      _getProvData(),
      _getOutlineData(),
      _getTendashData(),
      loadFactorBounds(factorKey),
    ])
    if (!thumbnailSystemActive || thumbnailContainers.get(factorKey) !== container) {
      thumbnailMap.remove()
      return
    }

    const factorConfig = getFactorLayerConfig(factorKey)
    if (!factorConfig) throw new Error('未知因子配置: ' + factorKey)

    const chinaFillLayer = L.geoJSON(provinceData, {
      pane: 'thumbnailBase',
      style: () => ({ ...PROV_FILL_STYLE }),
      coordsToLatLng: COORDS_TO_LATLNG,
      interactive: false,
    }).addTo(thumbnailMap)

    const factorOverlay = L.imageOverlay(factorConfig.dataUrl, factorBounds, {
      pane: 'thumbnailFactor',
      opacity: factorConfig.opacity,
      interactive: false,
      crossOrigin: true,
    })
    factorOverlay.on('error', error => {
      console.warn('[ch2-thumb] factor layer failed:', factorKey, error)
    })
    factorOverlay.addTo(thumbnailMap)

    if (outlineData) {
      L.geoJSON(outlineData, {
        pane: 'thumbnailOutline',
        style: () => ({ ...THUMBNAIL_OUTLINE_STYLE }),
        coordsToLatLng: COORDS_TO_LATLNG,
        interactive: false,
      }).addTo(thumbnailMap)
    }
    if (tendashData) {
      L.geoJSON(tendashData, {
        pane: 'thumbnailOutline',
        style: () => ({ ...THUMBNAIL_TENDASH_STYLE }),
        coordsToLatLng: COORDS_TO_LATLNG,
        interactive: false,
      }).addTo(thumbnailMap)
    }

    // 缩略图只显示浅米色国土填充与国界，不绘制省级边界。
    const chinaBounds = chinaFillLayer.getBounds()
    const viewBounds = L.latLngBounds(THUMBNAIL_DISPLAY_BOUNDS)
    const record = {
      factorKey,
      container,
      map: thumbnailMap,
      chinaFillLayer,
      factorOverlay,
      chinaBounds,
      viewBounds,
      fitRaf: 0,
    }
    thumbnailMapInstances.set(factorKey, record)
    scheduleThumbnailFit(record)
  } catch (error) {
    console.error('[ch2-thumb] initialize failed:', factorKey, error)
    if (thumbnailMap) thumbnailMap.remove()
  } finally {
    thumbnailInitPending.delete(factorKey)
  }
}

function scheduleThumbnailInitialization(factorKey) {
  if (!factorKey || thumbnailInitPending.has(factorKey)) return
  nextTick(() => {
    requestAnimationFrame(() => {
      if (!thumbnailSystemActive || thumbnailMapInstances.has(factorKey)) return
      const container = thumbnailContainers.get(factorKey)
      if (container) initializeThumbnailMap(factorKey, container)
    })
  })
}

function destroyThumbnailMap(factorKey) {
  const resizeState = thumbnailResizeObservers.get(factorKey)
  if (resizeState) {
    resizeState.observer.disconnect()
    if (resizeState.raf) cancelAnimationFrame(resizeState.raf)
    thumbnailResizeObservers.delete(factorKey)
  }
  const record = thumbnailMapInstances.get(factorKey)
  if (record) {
    if (record.fitRaf) cancelAnimationFrame(record.fitRaf)
    record.map.off()
    record.map.remove()
    thumbnailMapInstances.delete(factorKey)
  }
}

function setThumbnailMapContainer(factorKey, element) {
  if (!factorKey || !thumbnailSystemActive) return
  if (element) {
    const previous = thumbnailContainers.get(factorKey)
    if (previous === element) return
    if (previous && previous !== element) destroyThumbnailMap(factorKey)
    thumbnailContainers.set(factorKey, element)
    attachThumbnailResizeObserver(factorKey, element)
    scheduleThumbnailInitialization(factorKey)
    return
  }

  requestAnimationFrame(() => {
    if (!thumbnailSystemActive) return
    const replacement = document.querySelector('.thumbnail-map[data-factor-id="' + factorKey + '"]')
    if (replacement) {
      setThumbnailMapContainer(factorKey, replacement)
      return
    }
    thumbnailContainers.delete(factorKey)
    destroyThumbnailMap(factorKey)
  })
}

function syncThumbnailMaps() {
  if (!thumbnailSystemActive) return
  const visible = new Set(thumbSlot.value.filter(Boolean))
  Array.from(thumbnailMapInstances.keys()).forEach(factorKey => {
    if (!visible.has(factorKey)) {
      thumbnailContainers.delete(factorKey)
      destroyThumbnailMap(factorKey)
    }
  })
  visible.forEach(factorKey => {
    const element = document.querySelector('.thumbnail-map[data-factor-id="' + factorKey + '"]')
    if (element) setThumbnailMapContainer(factorKey, element)
  })
}

watch(thumbSlot, () => {
  nextTick(() => {
    if (thumbnailSyncRaf) cancelAnimationFrame(thumbnailSyncRaf)
    thumbnailSyncRaf = requestAnimationFrame(() => {
      thumbnailSyncRaf = 0
      syncThumbnailMaps()
    })
  })
}, { flush: 'post' })

async function waitForThumbnailFirstFrame(factorKey) {
  await nextTick()
  for (let attempt = 0; attempt < 90 && thumbnailSystemActive; attempt++) {
    await new Promise(resolve => requestAnimationFrame(resolve))
    const container = document.querySelector(
      '.thumbnail-map[data-factor-id="' + factorKey + '"]'
    )
    if (!container) continue
    const rect = container.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) continue
    setThumbnailMapContainer(factorKey, container)
    const record = thumbnailMapInstances.get(factorKey)
    if (!record) continue
    record.map.invalidateSize({ pan: false, animate: false })
    scheduleThumbnailFit(record)
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    return true
  }
  return false
}

async function commitArchivedThumbnail(snapshot) {
  const factorKey = snapshot?.factorKey
  if (!factorKey || !thumbnailSystemActive) return false
  if (archivedFactorIds.value.includes(factorKey)) {
    return waitForThumbnailFirstFrame(factorKey)
  }

  const committed = new Set([...archivedFactorIds.value, factorKey])
  archivedFactorIds.value = drawOrder.value.filter(fid => committed.has(fid))
  return waitForThumbnailFirstFrame(factorKey)
}

/* =========================================================
 * 主图↔缩略图动画：
 *   不生成 PNG。直接对"真实地图元素"做 fixed-position + CSS transform 缩放：
 *     - 主图：用 .map 内部的 .leaflet-container（含 SVG path、tile pane、九段线、因子图层）
 *             —— 而不是整个 .map-stage（.map-stage 还含 .ch2-bgimg 全屏背景艺术图、
 *                .factor-fade-mask 等"非地图元素"，它们留在原位不缩放）
 *     - 缩略图：用 .thumbnail-map 元素本身（内含缩略图 Leaflet 实例的三个 pane）
 *                —— 而不是整个 .thumb-card（thumb-card 外框 + thumb-label 留在原位）
 *   Leaflet 内部所有 SVG path、tile pane、九段线、imageOverlay 都是真实 DOM 节点，
 *   会跟随 transform 一起被缩放——用户看到的就是真实地图在缩放，且只有"地图"
 *   的范围在动，背景艺术图、米色蒙版、缩略图卡框等都保持原状。
 * ========================================================= */

/** 把 el 临时改为 fixed 定位 + 设到 sourceRect。返回一个 restore() 把所有样式还原。*/
function _pinElForAnim(el, rect, zIndex) {
  if (!el) return () => {}
  const prev = {
    position: el.style.position,
    left: el.style.left,
    top: el.style.top,
    width: el.style.width,
    height: el.style.height,
    transform: el.style.transform,
    transformOrigin: el.style.transformOrigin,
    transition: el.style.transition,
    opacity: el.style.opacity,
    willChange: el.style.willChange,
    zIndex: el.style.zIndex,
    classList: el.className,
  }
  el.style.position = 'fixed'
  el.style.left = rect.left + 'px'
  el.style.top = rect.top + 'px'
  el.style.width = rect.width + 'px'
  el.style.height = rect.height + 'px'
  el.style.transformOrigin = '0 0'
  el.style.transform = 'none'
  el.style.transition = 'none'
  el.style.opacity = '1'
  el.style.willChange = 'transform, opacity'
  el.style.zIndex = String(zIndex)
  el.classList.add('animating')
  return () => {
    el.style.position = prev.position
    el.style.left = prev.left
    el.style.top = prev.top
    el.style.width = prev.width
    el.style.height = prev.height
    el.style.transform = prev.transform
    el.style.transformOrigin = prev.transformOrigin
    el.style.transition = prev.transition
    el.style.opacity = prev.opacity
    el.style.willChange = prev.willChange
    el.style.zIndex = prev.zIndex
    el.classList.remove('animating')
  }
}

/** 用 CSS transition 把 el 从 sourceRect 形变到 targetRect。
 *  options: durationMs、fadeOut（末段淡出，淡出开始时间 fadeStartMs、淡出时长 fadeDurationMs）。*/
function _animateDomToRect(el, sourceRect, targetRect, {
  durationMs = 1400,
  fadeOut = false,
  fadeStartMs = 950,
  fadeDurationMs = 500,
  ease = 'cubic-bezier(0.45, 0.05, 0.35, 0.95)',
} = {}) {
  if (!el || !sourceRect || !targetRect) return
  const sx = targetRect.width / sourceRect.width
  const sy = targetRect.height / sourceRect.height
  const tx = targetRect.left - sourceRect.left
  const ty = targetRect.top - sourceRect.top
  // transform-origin: 0 0; 复合矩阵作用顺序：先 scale 再 translate，但
  // CSS transform 列表是 reverse application: 'translate(...) scale(...)' 表示
  // 先 scale 后 translate；最右边的先生效。所以 translate 在后意为位移是
  // 在缩放后的坐标系内做平移，刚好让 fixed 坐标原 rect → targetRect 的形变
  // 可以看作"先把 rect 缩放到 target 矩形大小，再把原点位移到 target.left-top"。
  // 我们的写法是先 translate 后 scale，浏览器解析时是反着的：先 scale 再 translate。
  const finalTransform = `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`

  let transitionCss = `transform ${durationMs}ms ${ease}`
  if (fadeOut) {
    transitionCss += `, opacity ${fadeDurationMs}ms ease-out ${fadeStartMs}ms`
  }
  el.style.transition = transitionCss
  // 强制 reflow 让 transition 从当前 transform="none" 开始
  void el.getBoundingClientRect()
  el.style.transform = finalTransform
  if (fadeOut) {
    requestAnimationFrame(() => {
      if (el) el.style.opacity = '0'
    })
  }
}

function _sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function _waitForTransformEnd(el, durationMs) {
  return new Promise(resolve => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      el?.removeEventListener('transitionend', onEnd)
      clearTimeout(fallback)
      resolve()
    }
    const onEnd = event => {
      if (event.target === el && event.propertyName === 'transform') finish()
    }
    el?.addEventListener('transitionend', onEnd)
    const fallback = setTimeout(finish, durationMs + 180)
  })
}

/** 空卡槽在业务状态提交前还没有 .thumbnail-map，因此按卡槽中实际的地图图片区
 *  计算动画终点（排除底部 32px 标签栏）。归档动画只落入地图图片区。 */
function _getThumbMapRect(slotIndex0Based) {
  const slot = document.querySelector('.thumb-slot-' + (slotIndex0Based + 1))
  if (!slot) return null
  const mapEl = slot.querySelector('.thumbnail-map, .thumb-img-wrap')
  if (mapEl) return mapEl.getBoundingClientRect()
  const rect = slot.getBoundingClientRect()
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom - 32,
    width: rect.width,
    height: Math.max(1, rect.height - 32),
    x: rect.x,
    y: rect.y,
  }
}

let _activeMapFlight = null
let _activeMapFlightTimer = null

function _cleanupMapFlight(flight = _activeMapFlight) {
  if (!flight) return
  if (flight._cleanupOnTransitionEnd) {
    flight.removeEventListener('transitionend', flight._cleanupOnTransitionEnd)
    flight._cleanupOnTransitionEnd = null
  }
  if (_activeMapFlightTimer) {
    clearTimeout(_activeMapFlightTimer)
    _activeMapFlightTimer = null
  }
  flight.remove()
  if (_activeMapFlight === flight) _activeMapFlight = null
}

function _scheduleMapFlightCleanup(flight, durationMs) {
  if (!flight) return
  const onTransitionEnd = event => {
    if (event.target === flight && event.propertyName === 'transform') {
      _cleanupMapFlight(flight)
    }
  }
  flight._cleanupOnTransitionEnd = onTransitionEnd
  flight.addEventListener('transitionend', onTransitionEnd)
  _activeMapFlightTimer = setTimeout(() => _cleanupMapFlight(flight), durationMs + 180)
}

/** 在切换 activeFactorId 之前冻结当前主图的 Leaflet 图层快照。
 *  快照只复制 leaflet-map-pane，不复制背景图、纯色蒙版、缩放控件或主图容器，
 *  因此后续新因子渲染不会把飞行动画的内容替换成新图。 */
function _createMainMapLayerSnapshot(sourceRect, zIndex = 99999) {
  const root = mapRef.value
  const livePane = root?.querySelector?.('.leaflet-map-pane')
  if (!root || !livePane || !sourceRect) return null

  // 任一时刻只保留一个归档飞行层，避免快速交互留下重叠快照。
  _cleanupMapFlight()

  const flight = document.createElement('div')
  flight.className = 'ch2-map-flight leaflet-container'
  Object.assign(flight.style, {
    position: 'fixed',
    left: sourceRect.left + 'px',
    top: sourceRect.top + 'px',
    width: sourceRect.width + 'px',
    height: sourceRect.height + 'px',
    overflow: 'hidden',
    pointerEvents: 'none',
    background: 'transparent',
    transformOrigin: '0 0',
    transform: 'none',
    transition: 'none',
    opacity: '1',
    willChange: 'transform, opacity',
    zIndex: String(zIndex),
  })
  // 全局 Leaflet 样式给 .leaflet-container 设置了带 !important 的米色背景。
  // 飞行层挂在 body 下，不命中组件内 .map 的透明规则，因此必须在运行时
  // 以同等优先级清除背景；这里只保留地图 pane 本身参与 FLIP 动画。
  flight.style.setProperty('background', 'transparent', 'important')
  flight.style.setProperty('background-color', 'transparent', 'important')
  flight.style.setProperty('border', 'none', 'important')
  flight.style.setProperty('border-radius', '0', 'important')
  flight.style.setProperty('box-shadow', 'none', 'important')

  const paneClone = livePane.cloneNode(true)
  paneClone.querySelectorAll(
    '.ch2-bgimg, .ch2-bg-mask, .factor-fade-mask, .leaflet-control-container'
  ).forEach(el => el.remove())
  // cloneNode 不复制 canvas 像素；若以后某因子改用 Canvas renderer，仍保留旧图。
  const sourceCanvases = livePane.querySelectorAll('canvas')
  const clonedCanvases = paneClone.querySelectorAll('canvas')
  sourceCanvases.forEach((canvas, index) => {
    const cloned = clonedCanvases[index]
    if (!cloned) return
    cloned.width = canvas.width
    cloned.height = canvas.height
    try { cloned.getContext('2d')?.drawImage(canvas, 0, 0) } catch (e) {}
  })
  flight.appendChild(paneClone)
  document.body.appendChild(flight)
  _activeMapFlight = flight
  return flight
}

/** 主图地图范围。动画快照以这个视口为裁切边界。 */
function _getMainMapRect() {
  const el = mapRef.value
  if (!el) return null
  return el.getBoundingClientRect()
}

/** 主图 Leaflet 容器（动画的真实目标元素）——即 .map 本身。*/
function _getMainLcEl() {
  return mapRef.value || null
}

/** 主图归档到第 N 个缩略图卡槽：在状态切换前冻结上一因子的 Leaflet 图层快照。
 *   - 动画主体始终是上一因子，而不会被 activeFactorId 更新为新抽中因子
 *   - 快照只含 leaflet-map-pane，背景艺术图、纯色蒙版和控件均不参与动画
 *   - 动画抵达后保持在终点，等真实缩略图首帧就绪后再销毁，终点不跳变
 *   - 动画结束：仅销毁临时快照，不触碰真实主地图和背景层
 *   - fid 仅作为语义说明：被归档的因子 id（即上一个 activeFactorId） */
async function playArchiveAnimation({ fid, targetSlotIndex0Based, onArrive }) {
  const sourceRect = _getMainMapRect()
  const targetRect = _getThumbMapRect(targetSlotIndex0Based)
  if (!sourceRect || !targetRect) return { ok: false }

  const snapshot = _createMainMapLayerSnapshot(sourceRect, 99999)
  if (!snapshot) return { ok: false }
  try {
    // 快照已在 activeFactorId 提交前生成，后续主地图更新不会改变动画内容。
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

    _animateDomToRect(snapshot, sourceRect, targetRect, {
      durationMs: 1400,
      ease: 'cubic-bezier(0.45, 0.05, 0.35, 0.95)',
      fadeOut: false,
    })
    // 飞行层抵达目标位置后仍保持可见，直到真实 Leaflet 缩略图完成首帧。
    await _waitForTransformEnd(snapshot, 1400)
    if (typeof onArrive === 'function') await onArrive()
  } finally {
    _cleanupMapFlight(snapshot)
  }
  return { ok: true }
}

/** 缩略图点击 → 主图放大；同时把原主图（currentActiveFid）归档到 futureThumb 对应卡槽。
 *   Layer A (放大)：被点击的 .thumbnail-map（缩略图内真实 Leaflet DOM）fixed 到缩略图位后 transform scale-up 到主图位
 *                   —— 只缩地图元素，thumb-card 外框和 thumb-label 留在原位不参与动画
 *   Layer B (归档)：主图 .leaflet-container fixed 在主图位后 transform scale-down 到 futureThumb 对应缩略图位（淡出）
 *                   —— 只缩主图内真实地图元素，背景艺术图/米色蒙版留在原位不参与动画
 *   被归档的 currentActiveFid 是被点击切换前的 activeFactorId（"上一个因子"），
 *   正是用户期望的"变成缩略图的是上一个因子，而不是新抽出的因子"。*/
async function playThumbToMainAnimations({ clickedFid, currentActiveFid, futureDrawOrder, futureView }) {
  const futureThumb = futureView === 'composite'
    ? [...futureDrawOrder]
    : futureDrawOrder.filter(x => x !== clickedFid)

  const clickedSourceIdx = thumbSlot.value.indexOf(clickedFid)
  const currentActiveTargetIdx = futureThumb.indexOf(currentActiveFid)

  const mainRect = _getMainMapRect()
  if (!mainRect) return null

  const lcEl = _getMainLcEl()
  if (!lcEl) return null

  const restores = []
  let archiveSnapshot = null

  try {
    // === Layer A：被点击缩略图内的真实 Leaflet DOM 放大到主图位置 ===
    if (clickedSourceIdx >= 0) {
      const mapEl = document.querySelector(
        '.thumb-slot-' + (clickedSourceIdx + 1) + ' .thumbnail-map'
      )
      if (mapEl) {
        // 起始矩形用元素自身的实际 rect（比 slot 小——不含 thumb-label 高度），
        // 避免 pin 瞬间出现尺寸跳变
        const srcRect = mapEl.getBoundingClientRect()
        const r = _pinElForAnim(mapEl, srcRect, 99998)
        restores.push(r)
        // Layer A 只缩 .thumbnail-map，thumb-card 外框 + thumb-label 留在原位——不需要再隐藏 label

        await new Promise(rs => requestAnimationFrame(() => requestAnimationFrame(rs)))

        _animateDomToRect(mapEl, srcRect, mainRect, {
          durationMs: 1400,
          ease: 'cubic-bezier(0.45, 0.05, 0.35, 0.95)',
          fadeOut: false, // Layer A 不淡出，让真实主图最终接管显示
        })
      }
    }

    // === Layer B：主图（.map = .leaflet-container）缩到 futureThumb 对应卡槽（"上一个因子"位，末段淡出） ===
    if (currentActiveTargetIdx >= 0 && currentActiveFid && currentActiveFid !== clickedFid) {
      const targetRect = _getThumbMapRect(currentActiveTargetIdx)
      if (targetRect) {
        // 在切换 activeFactorId 前冻结当前主图；背景层和纯色底不进入快照。
        archiveSnapshot = _createMainMapLayerSnapshot(mainRect, 99997)

        await new Promise(rs => requestAnimationFrame(() => requestAnimationFrame(rs)))

        _animateDomToRect(archiveSnapshot, mainRect, targetRect, {
          durationMs: 1400,
          ease: 'cubic-bezier(0.45, 0.05, 0.35, 0.95)',
          fadeOut: true,
          fadeStartMs: 950,
          fadeDurationMs: 500,
        })
        _scheduleMapFlightCleanup(archiveSnapshot, 1400)
      }
    }

    await _sleep(1500)
  } finally {
    restores.forEach(r => { try { r() } catch (e) {} })
    _cleanupMapFlight(archiveSnapshot)
    if (map) {
      try { map.invalidateSize(false) } catch (e) {}
    }
  }
  return true
}

/* =========================================================
 * 转盘 SVG 几何
 * ========================================================= */
function sectorPath(index, innerR, outerR) {
  const startAngle = index * 72 - 90 + 1.2
  const endAngle   = startAngle + 72 - 2.4
  const toRad = d => d * Math.PI / 180
  const s1 = { x: Math.cos(toRad(startAngle)) * outerR, y: Math.sin(toRad(startAngle)) * outerR }
  const e1 = { x: Math.cos(toRad(endAngle))   * outerR, y: Math.sin(toRad(endAngle))   * outerR }
  const e2 = { x: Math.cos(toRad(endAngle))   * innerR, y: Math.sin(toRad(endAngle))   * innerR }
  const s2 = { x: Math.cos(toRad(startAngle)) * innerR, y: Math.sin(toRad(startAngle)) * innerR }
  return `M ${s1.x} ${s1.y} A ${outerR} ${outerR} 0 0 1 ${e1.x} ${e1.y} L ${e2.x} ${e2.y} A ${innerR} ${innerR} 0 0 0 ${s2.x} ${s2.y} Z`
}
function sectorCenterAngle(index) { return (index * 72 - 90 + 36) * Math.PI / 180 }
function SectorClass(fid) {
  const isScan = drawPhase.value === 'spinning' && WHEEL_ORDER[scanIndex.value] === fid
  const isLocked = lockedFactor.value === fid
  const isPicked = drawOrder.value.includes(fid)
  return {
    'sec-scan':   isScan,
    'sec-locked': isLocked,
    'sec-picked': isPicked && lockedFactor.value !== fid,
  }
}
function LockedSectorStyle() {
  return {
    transform: 'none',
    transformOrigin: '0 0',
    animation: 'sector-lock-fade 0.26s ease-out both',
  }
}
function labelStyle(index) {
  const ang = sectorCenterAngle(index)
  const r = 70
  const x = Math.cos(ang) * r
  const y = Math.sin(ang) * r
  const pctX = 50 + (x / 110) * 50
  const pctY = 50 + (y / 110) * 50
  return { left: `${pctX}%`, top: `${pctY}%`, transform: 'translate(-50%, -50%)' }
}

/* =========================================================
 * 抽取流程
 * ========================================================= */
function pickRandomTargetIndex() {
  const remain = remainingFactors.value
  if (remain.length === 0) return -1
  const targetFid = remain[Math.floor(Math.random() * remain.length)]
  return WHEEL_ORDER.indexOf(targetFid)
}
function buildScanSequence(targetIndex) {
  const steps = []
  let cur = 0
  for (let i = 0; i < 14; i++) { steps.push({ idx: cur, delay: 80 }); cur = (cur + 1) % 5 }
  for (let i = 0; i < 6; i++)  { steps.push({ idx: cur, delay: 135 }); cur = (cur + 1) % 5 }
  const phase3Delays = [180, 240, 320, 420, 520, 640]
  let remainingSteps = (targetIndex - cur + 5) % 5
  if (remainingSteps < 5) remainingSteps += 5
  let p3i = 0
  for (let i = 0; i < remainingSteps; i++) {
    steps.push({ idx: cur, delay: phase3Delays[Math.min(p3i, phase3Delays.length - 1)] })
    cur = (cur + 1) % 5
    p3i++
  }
  if (steps.length) steps[steps.length - 1].idx = targetIndex
  return steps
}
async function runSpinSequence(steps, myOpId) {
  let acc = 0
  for (let s = 0; s < steps.length; s++) {
    acc += steps[s].delay
    const sIdx = s
    addTimer(() => {
      if (_currentOpId !== myOpId) return
      if (drawPhase.value !== 'spinning') return
      scanIndex.value = steps[sIdx].idx
    }, acc)
  }
  await new Promise(res => {
    acc += 80
    addTimer(() => { if (_currentOpId === myOpId) res(true); else res(false) }, acc)
  })
}

/* FLIP PNG 覆盖层已删除：本文件靠 _pinElForAnim + _animateDomToRect + playArchiveAnimation/playThumbToMainAnimations 实现真 DOM 缩放。 */

/* =========================================================
 * 抽取主流程（状态机保持稳定）
 * ========================================================= */
async function runSpinAnimation() {
  if (drawPhase.value === 'spinning' || drawPhase.value === 'committing') return
  if (isDrawComplete.value) return
  if (viewMode.value === 'composite') return
  if (isVisualLocked.value) return

  const targetIndex = pickRandomTargetIndex()
  if (targetIndex < 0) return

  const myOpId = ++_opId
  _currentOpId = myOpId
  clearSpinTimers(); clearHardKill()

  const newFid = WHEEL_ORDER[targetIndex]
  const previousActive = activeFactorId.value

  // “继续抽取”一经点击就冻结当前因子，动画到达卡槽时独立提交缩略图；
  // 后续转盘只负责确定新主图，不再承担上一张缩略图的写入。
  if (previousActive && previousActive !== newFid) {
    const targetSlotIdx = drawOrder.value.indexOf(previousActive)
    if (targetSlotIdx >= 0) {
      const archiveSnapshot = Object.freeze({
        factorKey: previousActive,
        targetSlotIndex0Based: targetSlotIdx,
        operationId: myOpId,
      })
      playArchiveAnimation({
        fid: archiveSnapshot.factorKey,
        targetSlotIndex0Based: targetSlotIdx,
        onArrive: () => commitArchivedThumbnail(archiveSnapshot),
      }).catch(() => {})
    }
  }

  drawPhase.value = 'spinning'
  scanIndex.value = -1
  lockedFactor.value = null
  isVisualLocked.value = true

  try {
    const steps = buildScanSequence(targetIndex)
    // 减速段会因目标扇区不同而改变总时长。保护时限必须跟随真实
    // 动画时长，否则较远目标会在扫描结束前被提前提交，形成跳格。
    const spinDuration = steps.reduce((sum, step) => sum + step.delay, 0) + 80
    const hardKillDelay = Math.max(5500, spinDuration + 1200)
    const hardKillPromise = new Promise(res => {
      _hardKillTimer = setTimeout(() => {
        if (_currentOpId === myOpId) { console.warn('[ch2] draw hard-kill: force commit'); res('timeout') }
      }, hardKillDelay)
    })
    const raceRes = await Promise.race([runSpinSequence(steps, myOpId), hardKillPromise])
    if (_currentOpId !== myOpId) return
    clearHardKill()

    // 正常路径中扫描已经精确落在 targetIndex；仅在异常保护触发时
    // 才兜底对齐，避免提交到错误扇区。
    if (raceRes === 'timeout') {
      clearSpinTimers()
      scanIndex.value = targetIndex
      await new Promise(r => setTimeout(r, 180))
    }

    drawPhase.value = 'committing'
    lockedFactor.value = newFid
    scanIndex.value = -1

    // 提交业务状态（原子化，同步）
    selectedFactors.value = new Set([...selectedFactors.value, newFid])
    drawOrder.value = [...drawOrder.value, newFid]
    lastDrawnFactorId.value = newFid
    activeFactorId.value = newFid
    if (map) map.invalidateSize(false)

    if (isDrawComplete.value) drawPhase.value = 'complete'
    else drawPhase.value = 'ready'
  } catch (e) {
    console.error('[ch2] draw error:', e)
    if (_currentOpId === myOpId) {
      if (!drawOrder.value.includes(newFid)) {
        selectedFactors.value = new Set([...selectedFactors.value, newFid])
        drawOrder.value = [...drawOrder.value, newFid]
        lastDrawnFactorId.value = newFid
        activeFactorId.value = newFid
        if (map) map.invalidateSize(false)
      }
      if (isDrawComplete.value) drawPhase.value = 'complete'
      else drawPhase.value = 'ready'
    }
  } finally {
    if (_currentOpId === myOpId) {
      setTimeout(() => {
        if (_currentOpId === myOpId) {
          clearHardKill(); clearSpinTimers()
          isVisualLocked.value = false
          if (drawPhase.value === 'spinning' || drawPhase.value === 'committing') {
            drawPhase.value = isDrawComplete.value ? 'complete' : 'ready'
          }
        }
      }, 1420)
    }
  }
}

/* =========================================================
 * 缩略图点击（双向动画）
 * ========================================================= */
async function onThumbClick(targetFid) {
  if (btnDisabled.value) return
  if (viewMode.value !== 'detail') return
  if (targetFid === activeFactorId.value) return
  if (!drawOrder.value.includes(targetFid)) return

  const myOpId = ++_opId
  _currentOpId = myOpId
  clearSpinTimers(); clearHardKill()

  isVisualLocked.value = true

  const currentActive = activeFactorId.value
  const futureDrawOrder = [...drawOrder.value]

  // 触发主图归档 + 缩略图放大双向真 DOM 缩放动画（fire-and-forget，不阻塞后续状态提交——
  //   动画层状态在两个 rAF 后已稳定，主图 activeFactorId 提交后会立即接管）。
  playThumbToMainAnimations({
    clickedFid: targetFid,
    currentActiveFid: currentActive,
    futureDrawOrder,
    futureView: 'detail',
  }).catch(() => {})

  // 点击缩略图切换主图时，原主图立即成为已归档项；被点击项转为主图。
  archivedFactorIds.value = futureDrawOrder.filter(fid => fid !== targetFid)

  // 保持原有 220ms 的最小节奏。
  const startedAt = performance.now()
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  const elapsed = performance.now() - startedAt
  if (elapsed < 220) await _sleep(220 - elapsed)
  if (_currentOpId !== myOpId) return

  activeFactorId.value = targetFid
  if (map) map.invalidateSize(false)

  setTimeout(() => {
    if (_currentOpId !== myOpId) return
    isVisualLocked.value = false
  }, 1500)
}

/* =========================================================
 * 中心按钮 & 综合分析 & 溯回
 * ========================================================= */
function onCenterClick() {
  if (btnDisabled.value) return
  if (viewMode.value === 'composite') return
  if (isDrawComplete.value) { enterComposite(); return }
  runSpinAnimation()
}

async function enterComposite() {
  if (drawOrder.value.length < 5) return
  const myOpId = ++_opId
  _currentOpId = myOpId
  isVisualLocked.value = true

  try {
    drawPhase.value = 'comprehensive'

    // 在切换 viewMode/activeFactorId 之前，播放第五个因子主图 → thumb5 归档动画
    const fifthFid = activeFactorId.value
    if (fifthFid) {
      const targetSlotIdx = drawOrder.value.indexOf(fifthFid)
      if (targetSlotIdx === 4) {
        // 真 DOM 缩放：等图钉状态生效（两个 rAF）后再提交状态，避免起始跳变
        playArchiveAnimation({
          fid: fifthFid,
          targetSlotIndex0Based: 4,
        }).catch(() => {})
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
      }
    }

    viewMode.value = 'composite'
    activeFactorId.value = null
    nextTick(() => {
      if (_currentOpId !== myOpId) return
      if (map) map.invalidateSize(false)
      setTimeout(() => {
        if (_currentOpId !== myOpId) return
        isVisualLocked.value = false
      }, 420)
    })
  } catch (e) {
    console.error('[ch2] enterComposite error:', e)
    isVisualLocked.value = false
  }
}

function onReturn() {
  if (drawOrder.value.length < 5) return
  const fifthFid = drawOrder.value[4]
  viewMode.value = 'detail'
  activeFactorId.value = fifthFid
  archivedFactorIds.value = drawOrder.value.filter(fid => fid !== fifthFid)
  drawPhase.value = 'complete'
  nextTick(() => { if (map) map.invalidateSize(false) })
}

/* =========================================================
 * 数据与分类依据注解面板
 *   - 内容随当前主图因子实时联动（activeFactorId / viewMode）
 *   - 分级阈值直接读取 ch2.js levels，与图例同源
 *   - 不参与任何地图计算与布局
 * ========================================================= */
const notesOpen = ref(false)
const notesRootRef = ref(null)

const activeNoteKey = computed(() => {
  if (viewMode.value === 'composite') return 'composite'
  if (activeFactorId.value && FACTOR_NOTES[activeFactorId.value]) return activeFactorId.value
  return 'composite'
})
const activeNote = computed(() => {
  const note = FACTOR_NOTES[activeNoteKey.value]
  if (!note) return null
  return language.value === 'en' ? { ...note, ...ch2NotesEnglish[activeNoteKey.value] } : note
})

const noteLevels = computed(() => getFactorLevels(activeNoteKey.value))
const noteLevelExtra = computed(() => CLASSIFICATION_EXTRA[activeNoteKey.value] || '')

const noteFields = computed(() => {
  const n = activeNote.value
  if (!n) return []
  return [
    { key: 'dataName',     label: '数据名称',   text: n.dataName },
    { key: 'dataSource',   label: '数据来源',   text: n.dataSource },
    { key: 'timeRange',    label: '时间范围',   text: n.timeRange },
    { key: 'resolution',   label: '空间分辨率', text: n.resolution },
    { key: 'unit',         label: '原始单位',   text: n.unit },
    { key: 'processing',   label: '处理方法',   text: n.processing },
    { key: 'classification', label: '当前地图分级', text: '' },
    { key: 'basis',        label: '分类依据',   text: n.basis },
  ]
})

// 点击面板/按钮外部关闭
function _onNotesDocMousedown(e) {
  if (!notesOpen.value) return
  if (e.target.closest?.('.language-switch')) return
  const root = notesRootRef.value
  if (root && !root.contains(e.target)) notesOpen.value = false
}
onMounted(() => {
  document.addEventListener('mousedown', _onNotesDocMousedown)
})

/* =========================================================
 * 生命周期
 * ========================================================= */
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', _onNotesDocMousedown)
  clearSpinTimers(); clearHardKill()
  _cleanupMapFlight()
  _bgSwitchTimers.forEach(h => clearTimeout(h))
  _bgSwitchTimers = []
  if (_resizeTimer) { clearTimeout(_resizeTimer); _resizeTimer = null }
  window.removeEventListener('resize', _onResize)
  thumbnailSystemActive = false
  if (thumbnailSyncRaf) { cancelAnimationFrame(thumbnailSyncRaf); thumbnailSyncRaf = 0 }
  Array.from(new Set([
    ...thumbnailMapInstances.keys(),
    ...thumbnailResizeObservers.keys(),
  ])).forEach(destroyThumbnailMap)
  thumbnailContainers.clear()
  thumbnailInitPending.clear()
  if (map) { map.remove(); map = null }
})
</script>

<style scoped>
/* =========================================================
 * 章节整体：主地图底图铺满页面，其余组件作为悬浮层叠放其上
 * ========================================================= */
.chapter-2 { position: relative; background: #EFE9DA; }

.chapter-body {
  --ch2-page-edge: clamp(16px, 2vw, 28px);
  --ch2-left-panel-width: clamp(572px, 32.5vw, 728px);
  --ch2-right-safe-width: clamp(300px, 19vw, 360px);
  position: fixed;
  top: 60px;
  left: 0; right: 0; bottom: 0;
  display: block;
  padding: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 1.45s ease-in-out;
  background: #EFE9DA;
  overflow: hidden;
}
.chapter-body.ready { opacity: 1; pointer-events: auto; }

/* ===== 左侧悬浮层：六宫格直接位于底图上，不再划分独立栏区 ===== */
.left-panel {
  position: absolute;
  top: auto;
  bottom: 8px;
  left: calc(var(--ch2-page-edge) + 25px);
  width: var(--ch2-left-panel-width);
  z-index: 700;
  min-width: 0;
  padding: 0;
}
.six-grid {
  width: 100%;
  display: grid;
  /* 六等分网格让两行卡片保持同宽：首行两张居中，次行三张铺开。 */
  grid-template-columns: repeat(6, minmax(0, 1fr));
  grid-auto-rows: auto;
  column-gap: 14px;
  row-gap: 14px;
  align-content: end;
  justify-content: start;
}
.grid-slot {
  position: relative;
  min-width: 0;
  width: 100%;
  /* 高宽约 4:3，显著增加地图画面的纵向空间。 */
  aspect-ratio: 3 / 4;
}
.thumb-slot-1 { grid-column: 1 / span 2; grid-row: 1; }
.thumb-slot-2 { grid-column: 3 / span 2; grid-row: 1; }
.thumb-slot-3 { grid-column: 1 / span 2; grid-row: 2; }
.thumb-slot-4 { grid-column: 3 / span 2; grid-row: 2; }
.thumb-slot-5 { grid-column: 5 / span 2; grid-row: 2; }

/* 缩略图卡片（地图区域 16:10 + 名称栏 32px） */
.thumb-card {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: rgba(255, 253, 247, 0.78);
  border: 1px solid rgba(81, 109, 51, 0.16);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
  box-shadow: 0 3px 12px rgba(81,109,51,0.09);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}
.thumb-card:hover {
  transform: translateY(-1px);
  border-color: rgba(81, 109, 51, 0.32);
  background: rgba(255, 253, 247, 0.62);
  box-shadow: 0 4px 10px rgba(81,109,51,0.12);
}
/* 地图图像区域（thumbnail-map-viewport）：严格水平+垂直居中，不裁切 */
.thumb-img-wrap {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: rgba(239, 233, 218, 0.76);
}
.thumbnail-map {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
  cursor: pointer;
}
.thumbnail-map:deep(.leaflet-container),
.thumbnail-map :deep(.leaflet-container) {
  background: transparent;
}
.thumb-label {
  flex: 0 0 32px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  background: rgba(255, 253, 247, 0.8);
  border-top: 1px solid rgba(81, 109, 51, 0.06);
}
.thumb-order {
  font-size: 10px;
  color: #6b5d3c;
  font-weight: 700;
  width: 14px; height: 14px;
  line-height: 14px;
  text-align: center;
  border-radius: 50%;
  background: rgba(81, 109, 51, 0.11);
}
.thumb-name {
  font-size: 11.5px;
  color: #4e4328;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 图例：右侧工具列最上方的独立悬浮卡片 */
.legend-inner {
  position: relative;
  width: clamp(270px, 15.5vw, 320px);
  min-width: 270px;
  max-width: 320px;
  box-sizing: border-box;
  padding: 16px 20px;
  background: rgba(255, 253, 247, 0.84);
  border: 1px solid rgba(81, 109, 51, 0.16);
  border-radius: 15px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-shadow: 0 3px 12px rgba(81,109,51,0.09);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  font-family: var(--font-body), KaiTi, STKaiti, serif;
  font-style: normal;
}
.legend-title {
  font-family: inherit;
  font-style: normal;
  font-size: 14px;
  font-weight: 700;
  color: #4b5d2b;
  letter-spacing: 1px;
  margin-bottom: 8px;
}
.legend-row {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  font-size: 13px;
  color: #5a4f38;
  margin-bottom: 8px;
  line-height: 1.4;
  font-family: inherit;
  font-style: normal;
}
.legend-row .sw {
  flex: none;
  width: 14px;
  height: 10px;
  margin-top: 4px;
  border-radius: 2px;
  border: 0.5px solid rgba(0,0,0,0.06);
}
.legend-row-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1 1 auto;
}
.legend-label {
  color: #4b5d2b;
  font-weight: 600;
  font-size: 13.5px;
  font-family: inherit;
  font-style: normal;
  letter-spacing: 0.02em;
}
.legend-range {
  color: #7a6f55;
  font-size: 11.5px;
  line-height: 1.4;
  font-family: inherit;
  font-style: normal;
  letter-spacing: 0;
  word-break: break-all;
}

/* ===== 主地图：填满整个章节内容区，作为所有组件共同底图 ===== */
.main-panel {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: block;
  min-width: 0;
  min-height: 0;
  background: transparent;
}

.map-title-bar {
  position: absolute;
  top: 14px;
  left: calc(var(--ch2-page-edge) + var(--ch2-left-panel-width) + 24px);
  right: calc(var(--ch2-right-safe-width) + 24px);
  z-index: 720;
  padding: 0;
  text-align: center;
  background: transparent;
  pointer-events: none;
}
.map-title {
  font-size: 20px;
  color: #4b5d2b;
  font-weight: 400;
  letter-spacing: 2px;
  text-shadow: 0 1px 8px rgba(247, 244, 235, 0.95);
}
.map-title strong { font-weight: 400; color: inherit; }

.map-stage {
  position: absolute;
  inset: 0;
  border-radius: 0;
  overflow: hidden;
  background: transparent;
  border: none;
  box-shadow: none;
  opacity: 0;
  transition: opacity 200ms ease-out;
  min-height: 0;
  min-width: 0;
}
.map-stage.map-fade-in { opacity: 1; }

/* 临时归档层挂载在 body，需使用全局选择器覆盖 Leaflet 的全局米色底。
 * 它只承载克隆的地图 pane，不承载背景图、蒙版、卡片或控件。 */
:global(.ch2-map-flight),
:global(.ch2-map-flight.leaflet-container) {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  pointer-events: none !important;
  will-change: transform, opacity;
}

.map {
  position: relative;
  width: 100%;
  height: 100%;
  background: transparent;
}

/* ---- 背景图: 插入在 .leaflet-container 内部，位于所有 Leaflet pane / control 之前（DOM 顺序）----
 * 配合 :deep(.leaflet-container { background: transparent })，才能看到这些层
 * object-fit: cover 保证不变形；750ms ease-in-out 交叉淡入淡出
 * 目标透明度 0.18，再叠加浅米色蒙版使色彩统一
 * 注意：主图↔缩略图动画期间，这些背景节点会被临时 reparent 到 .map-stage 下
 * .map-stage 规则保留用于背景层初始化阶段，正式归档动画只复制地图 pane。
 */
.map :deep(img.ch2-bgimg),
.map-stage :deep(img.ch2-bgimg) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  opacity: 0;
  transition: opacity 750ms ease-in-out;
  pointer-events: none;
  will-change: opacity;
  z-index: 0;
}
/* 浅米色蒙版 (位于背景 A/B 之上、真实地图 pane 之下) —— 统一不同图片明暗，保持淡雅 */
.map :deep(div.ch2-bg-mask),
.map-stage :deep(div.ch2-bg-mask) {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: rgba(239, 233, 218, 0.48);
  z-index: 1;
  user-select: none;
}
.map :deep(.leaflet-container) {
  background: transparent !important;
  outline: none !important;
}
.map :deep(.leaflet-container .leaflet-map-pane),
.map :deep(.leaflet-container .leaflet-control-container) {
  /* 让行政区/因子/边界/控件天然盖在背景和蒙版之上（DOM 顺序 + z-index 默认） */
  position: relative;
  z-index: 2;
}

/* 主图铺满页面后，将缩放控件移到左侧缩略图安全区之外。 */
.map :deep(.leaflet-top.leaflet-left) {
  top: 46px;
  left: calc(var(--ch2-page-edge) + var(--ch2-left-panel-width) + 12px);
}

.factor-fade-mask {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;        /* 叠在 map 之上 */
  background: #EFE9DA;
  opacity: 0;
  transition: opacity 420ms ease-out;
}
.factor-fade-mask.show { opacity: 0.30; }

/* 地图本身使用 CSS transform 做缩放过渡：will-change 提示浏览器开启层 */
.map-stage.animating,
.thumb-card.animating {
  will-change: transform, opacity;
  backface-visibility: hidden;
}

/* ===== 右侧工具组：图例、说明卡、转盘/溯回纵向同列 ===== */
.tool-group {
  position: absolute;
  top: clamp(24px, 3vw, 42px);
  right: clamp(28px, 3vw, 48px);
  bottom: clamp(28px, 3vw, 44px);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
  pointer-events: none;
  z-index: 700;
}

/* 综合评价结论分析：仅综合模式下在图例下方显示 */
.composite-conclusion {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed rgba(81, 109, 51, 0.18);
  font-family: var(--font-body), KaiTi, STKaiti, serif;
  font-style: normal;
  font-size: 13.5px;
  line-height: 1.85;
  color: #5a4f38;
  text-align: justify;
}
.composite-conclusion p {
  margin: 0 0 8px;
  text-indent: 0;
}
.composite-conclusion p:last-child {
  margin-bottom: 0;
}

/* 没有说明卡时，转盘/溯回仍固定在工具列底部。 */
.tool-group > .legend-inner + .wheel-area,
.tool-group > .legend-inner + .return-area,
.tool-group > .wheel-area:first-child,
.tool-group > .return-area:first-child {
  margin-top: auto;
}

/* 转盘：工具组底部 */
.wheel-area {
  pointer-events: auto;
  position: relative;
  padding: 12px;
  overflow: visible;
}
.wheel-wrap {
  position: relative;
  width: clamp(250px, 16vw, 300px);
  height: clamp(250px, 16vw, 300px);
  user-select: none;
  touch-action: none;
}
.wheel { position: absolute; inset: 0; overflow: visible; }
.wheel-svg { width: 100%; height: 100%; display: block; overflow: visible; }

/* 扇区 */
.sector {
  opacity: 0.82;
  stroke: rgba(139, 125, 90, 0.55);
  stroke-width: 0.55;
  transition: opacity 0.15s ease, filter 0.15s ease;
  transform-origin: 0 0;
  transform-box: fill-box;
}
.sector.sec-picked {
  opacity: 0.92;
  stroke: rgba(212, 180, 76, 0.5);
  stroke-width: 0.8;
}
.sector.sec-scan,
.sector.sec-locked {
  opacity: 1;
  filter: brightness(1.22) saturate(1.3) drop-shadow(0 0 4px rgba(255,228,140,0.7)) drop-shadow(0 0 8px rgba(255,210,120,0.42));
  stroke: rgba(255, 230, 160, 0.95);
  stroke-width: 1.2;
}
.sector-lock-stroke { transform-origin: 0 0; }
@keyframes sector-lock-fade {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}

.factor-label {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 5px;
  pointer-events: none;
  padding: 3px 7px;
  border-radius: 6px;
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}
.label-name {
  font-size: 15px;
  color: #FBF8EF;
  font-weight: 600;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(30,40,20,0.55);
  white-space: nowrap;
}
.picked-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #EACF78;
  box-shadow: 0 0 3px rgba(234, 207, 120, 0.7);
}
.factor-label.lbl-scan {
  background: rgba(255, 248, 225, 0.96);
  box-shadow: 0 2px 8px rgba(212, 180, 76, 0.45);
  transform: translate(-50%, -50%) scale(1.1);
}
.factor-label.lbl-scan .label-name { color: #5A4A15; text-shadow: none; font-weight: 700; }
.factor-label.lbl-locked {
  background: rgba(255, 252, 238, 0.98);
  box-shadow: 0 2px 10px rgba(212, 180, 76, 0.55), 0 0 0 1.3px rgba(234, 207, 120, 0.75);
  transform: translate(-50%, -50%) scale(1.1);
}
.factor-label.lbl-locked .label-name { color: #3E4F26; text-shadow: none; font-weight: 800; }
.factor-label.lbl-picked { filter: drop-shadow(0 0 2px rgba(234, 207, 120, 0.42)); }

/* 中心按钮 */
.center-btn {
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  width: 72px; height: 72px;
  border-radius: 50%;
  background: linear-gradient(145deg, #FBF7EA 0%, #F0EAD6 100%);
  border: 1.5px solid #516D33;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.3s, background 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s, opacity 0.25s;
  box-shadow: 0 3px 10px rgba(81, 109, 51, 0.22), 0 0 16px rgba(255, 230, 160, 0.22);
  padding: 0;
  font-family: inherit;
}
.center-btn:hover:not(:disabled) {
  background: #516D33;
  transform: translate(-50%, -50%) scale(1.08);
  color: #FBF8EF;
  box-shadow: 0 4px 14px rgba(81, 109, 51, 0.42), 0 0 24px rgba(255, 230, 160, 0.55);
}
.center-btn:disabled { cursor: not-allowed; opacity: 0.62; }
.center-btn.busy {
  color: #7C6C3A;
  border-color: #D4B44C;
  box-shadow: 0 3px 10px rgba(212, 180, 76, 0.32), 0 0 22px rgba(255, 230, 160, 0.55);
}
.center-btn.ready-hl {
  border-color: #B28F4C;
  background: linear-gradient(145deg, #FFF2C2 0%, #F3D97E 100%);
  color: #5A4A15;
  animation: composite-btn-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  box-shadow: 0 3px 12px rgba(178, 143, 76, 0.38), 0 0 26px rgba(255, 220, 130, 0.7);
}
.center-btn.ready-hl:hover:not(:disabled) {
  background: linear-gradient(145deg, #EFD26B 0%, #D4B44C 100%);
  color: #3A2E10;
}
@keyframes composite-btn-in {
  0%   { transform: translate(-50%, -50%) scale(0.86); opacity: 0; }
  60%  { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
}
.center-text {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 1.4px;
  line-height: 1;
}

/* 溯回按钮：右下角，取代转盘位置 */
.return-area {
  pointer-events: auto;
  position: relative;
  width: clamp(250px, 16vw, 300px);
  height: clamp(250px, 16vw, 300px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.return-btn {
  padding: 12px 32px;
  background: rgba(81, 109, 51, 0.92);
  color: #FBF8EF;
  border: none;
  border-radius: 22px;
  font-family: var(--font-body), KaiTi, STKaiti, serif;
  font-style: normal;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 2px;
  cursor: pointer;
  transition: transform 0.25s, box-shadow 0.25s, background 0.25s;
  box-shadow: 0 3px 10px rgba(81, 109, 51, 0.28);
}
.return-btn:hover {
  transform: translateY(-1px);
  background: #516D33;
  box-shadow: 0 4px 14px rgba(81, 109, 51, 0.45);
}

/* ===== 数据与分类依据注解：i 按钮 + 浮动面板（固定在页面右下角） ===== */
.notes-widget {
  position: absolute;
  right: 16px;
  bottom: clamp(24px, 2.6vw, 40px);
  z-index: 710;
  pointer-events: none;
}
#app-root .notes-trigger {
  pointer-events: auto;
  width: 50px;
  height: 50px;
  box-sizing: border-box;
  border-radius: 50%;
  border: none;
  padding: 0;
  background: #516D33;
  color: #FFFFFF;
  font-family: Georgia, 'Times New Roman', serif !important;
  font-style: normal;
  font-weight: 700;
  font-size: 27px !important;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  box-shadow: 0 4px 12px rgba(56, 72, 39, 0.22);
  transition: transform 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
}
#app-root .notes-trigger:hover {
  background: #5C7C3A;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(56, 72, 39, 0.28);
}
#app-root .notes-trigger:active {
  transform: translateY(0) scale(0.96);
}
#app-root .notes-trigger:focus-visible {
  outline: 3px solid rgba(178, 143, 76, 0.55);
  outline-offset: 3px;
}
#app-root .notes-trigger.open { background: #5C7C3A; }

.notes-panel {
  pointer-events: auto;
  position: absolute;
  right: 0;
  bottom: calc(100% + 12px);
  width: 400px;
  max-width: calc(100vw - 32px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  max-height: 60vh;
  background: rgba(255, 253, 247, 0.94);
  border: 1px solid rgba(81, 109, 51, 0.16);
  border-radius: 15px;
  box-shadow: 0 6px 24px rgba(81, 109, 51, 0.16);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  font-family: var(--font-body), serif !important;
  font-style: normal;
  overflow: hidden;
}
.notes-head {
  flex: none;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px 10px 20px;
  border-bottom: 1px solid rgba(81, 109, 51, 0.12);
}
#app-root .notes-caption {
  font-size: 11.5px;
  letter-spacing: 2px;
  color: #7a6f55;
  margin-bottom: 3px;
  font-family: var(--font-body), serif !important;
}
#app-root .notes-factor-title {
  font-size: 15.5px;
  font-weight: 700;
  color: #4b5d2b;
  letter-spacing: 1px;
  font-family: var(--font-body), serif !important;
}
.notes-close {
  flex: none;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(81, 109, 51, 0.10);
  color: #4b5d2b;
  font-size: 15px;
  line-height: 24px;
  padding: 0;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}
.notes-close:hover {
  background: rgba(81, 109, 51, 0.22);
}
.notes-scroll {
  min-height: 0;
  overflow-y: auto;
  padding: 12px 20px 16px;
}
.note-item {
  margin-bottom: 11px;
}
.note-item:last-child {
  margin-bottom: 0;
}
.note-item-label {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #4b5d2b;
  margin-bottom: 3px;
}
.note-item-text {
  font-size: 13px;
  line-height: 1.65;
  color: #5a4f38;
  text-align: justify;
}
.note-levels {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.note-level {
  display: flex;
  align-items: baseline;
  gap: 7px;
  font-size: 13px;
  color: #5a4f38;
  line-height: 1.5;
}
.note-level-sw {
  flex: none;
  width: 14px;
  height: 10px;
  border-radius: 2px;
  border: 0.5px solid rgba(0, 0, 0, 0.06);
  align-self: center;
}
.note-level-label {
  flex: none;
  font-weight: 600;
  color: #4b5d2b;
}
.note-level-range {
  font-size: 11.5px;
  color: #7a6f55;
}
.note-level-extra {
  margin-top: 6px;
  font-size: 11.5px;
  line-height: 1.6;
  color: #7a6f55;
}
.note-source-links {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.note-source-links a {
  font-size: 12.5px;
  color: #516D33;
  text-decoration: none;
  line-height: 1.5;
  word-break: break-all;
  transition: color 0.2s ease;
  width: fit-content;
}
.note-source-links a:hover {
  color: #3d5426;
  text-decoration: underline;
}

/* 面板淡入淡出 + 轻微位移动画 */
.notes-fade-enter-active,
.notes-fade-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}
.notes-fade-enter-from,
.notes-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}


/* 响应式 */
@media (max-width: 1200px) {
  .chapter-body {
    --ch2-page-edge: 14px;
    --ch2-left-panel-width: clamp(468px, 44.2vw, 559px);
    --ch2-right-safe-width: 300px;
  }
  .six-grid { column-gap: 10px; row-gap: 10px; }
  .legend-inner { width: 250px; min-width: 250px; max-width: 250px; }
  .wheel-wrap { width: 230px; height: 230px; }
  .return-area { width: 230px; height: 230px; }
  .center-btn { width: 62px; height: 62px; }
  .center-text { font-size: 11px; letter-spacing: 1px; }
  .label-name { font-size: 13.5px; }
}
@media (max-width: 900px) {
  .chapter-body {
    --ch2-page-edge: 10px;
    --ch2-left-panel-width: clamp(364px, 53.3vw, 442px);
    --ch2-right-safe-width: 250px;
  }
  .six-grid { column-gap: 8px; row-gap: 8px; }
  .map-title-bar {
    left: calc(var(--ch2-page-edge) + var(--ch2-left-panel-width) + 12px);
    right: calc(var(--ch2-right-safe-width) + 12px);
  }
  .legend-inner { width: 230px; min-width: 230px; max-width: 230px; padding: 14px 16px; }
  .wheel-wrap { width: 180px; height: 180px; }
  .return-area { width: 180px; height: 180px; }
  .legend-title { font-size: 14px; }
  .legend-row { font-size: 13.5px; gap: 8px; margin-bottom: 5px; line-height: 1.45; }
  .legend-row .sw { width: 12px; height: 9px; }
  .composite-conclusion { font-size: 13.5px; line-height: 1.8; }
  .thumb-name { font-size: 11px; }
  .label-name { font-size: 12.5px; }
  .notes-widget {
    right: calc(var(--ch2-page-edge) + var(--ch2-right-safe-width) + 10px);
    bottom: 20px;
  }
  .notes-panel { width: 340px; }
}
@media (max-width: 600px) {
  .notes-panel {
    position: fixed;
    left: 16px;
    right: 16px;
    bottom: 76px;
    width: auto;
    max-width: none;
  }
}
/* English copy uses the same controls and geometry, with whole-word wrapping. */
#app-root .chapter-2:not(.english-copy) .legend-title {
  font-family: var(--font-body), KaiTi, STKaiti, serif !important;
}
.english-copy .thumb-order { font-size: 9px; }
.english-copy .thumb-name { font-size: 10.5px; }
.english-copy .label-name { font-size: 14px; }
.english-copy .center-text { font-size: 11.5px; max-width: 65px; line-height: 1.2; }
#app-root .chapter-2.english-copy .notes-caption { font-size: 10.5px; }
#app-root .chapter-2.english-copy .notes-factor-title { font-size: 14.5px; }
.english-copy .note-item-label { font-size: 10.5px; }
.english-copy :is(.note-item-text, .note-level) { font-size: 12px; }
.english-copy :is(.note-level-range, .note-level-extra) { font-size: 10.5px; }
.english-copy .note-source-links a { font-size: 11.5px; }
.english-copy .note-level { flex-wrap: wrap; }
.english-copy .note-level-label { flex: 1 1 auto; min-width: 0; }
.english-copy .note-level-range { flex-basis: 100%; }
.english-copy .legend-inner {
  overflow-y: auto;
  pointer-events: auto;
  min-height: 0;
}
@media (max-width: 1200px) {
  .english-copy .center-text { font-size: 10px; }
  .english-copy .label-name { font-size: 12.5px; }
}
@media (max-width: 900px) {
  .english-copy .thumb-name { font-size: 10px; }
  .english-copy .label-name { font-size: 11.5px; }
}
</style>
