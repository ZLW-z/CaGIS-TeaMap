<template>
  <section class="chapter chapter-3" :id="id" ref="sectionEl" :class="{ 'english-copy': language === 'en' }" :lang="language === 'en' ? 'en' : 'zh-CN'">
    <ChapterIntro
      :ch-no="language === 'en' ? 'III' : chapter.number"
      :title="t(chapter.title)"
      :desc="t(chapter.description)"
      :duration="7"
      @done="onIntroDone"
    />

    <div class="map-fullscreen" :class="{ show: introDone }">
      <ChapterCornerIntro chapter-key="ch3" :visible="introDone" />
      <div ref="mapEl" class="map"></div>

      <!-- 图例 -->
      <div class="map-legend">
        <div class="legend-title">{{ t('图例') }}</div>
        <div class="legend-row top10">
          <span class="sw top10-sw"></span>{{ t('十大名茶') }}（{{ top10Count }}）
        </div>
        <div class="legend-row other">
          <span class="sw other-sw"></span>{{ t('其他名茶') }}（{{ otherCount }}）
        </div>
        <div class="legend-hint">{{ t('点击标记查看详情') }}</div>
      </div>

      <!-- 固定信息面板 -->
      <transition name="panel-slide">
        <div
          v-if="selectedTea && !lightboxOpen"
          class="tea-info-panel"
        >
          <div class="panel-header">
            <div class="panel-title-wrap">
              <span class="panel-badge" :class="{ top10: selectedTea.isTop10 }">
                {{ t(selectedTea.isTop10 ? '十大名茶' : '名茶') }}
              </span>
              <h3 class="panel-title">{{ teaText(selectedTea, 'name') }}</h3>
            </div>
            <button class="panel-close" :aria-label="t('关闭信息卡')" @click="closePanel">×</button>
          </div>

          <div class="panel-scroll">
            <div class="panel-image-wrap" @click="openLightbox">
              <img :src="selectedTea.image" :alt="teaText(selectedTea, 'name')" class="panel-image" />
              <div class="panel-image-hint">{{ t('点击查看大图') }}</div>
            </div>

            <div class="panel-meta">
              <span class="meta-type">{{ t(selectedTea.type) }}</span>
              <span class="meta-origin">{{ teaText(selectedTea, 'origin') }}</span>
            </div>

            <div class="panel-section">
              <div class="section-label">{{ t('核心特点') }}</div>
              <p class="section-text">{{ teaText(selectedTea, 'features') }}</p>
            </div>

            <div class="panel-section">
              <div class="section-label">{{ t('故事 / 传说') }}</div>
              <p class="section-text story">{{ teaText(selectedTea, 'story') }}</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- 悬浮预览卡片（鼠标悬浮标签时显示） -->
      <transition name="preview-fade">
        <div
          v-if="hoveredTea && !selectedTea"
          class="tea-preview-card"
          :style="{ left: hoveredPos.x + 'px', top: hoveredPos.y + 'px' }"
        >
          <div class="preview-header">
            <span class="preview-badge" :class="{ top10: hoveredTea.isTop10 }">
              {{ t(hoveredTea.isTop10 ? '十大名茶' : '名茶') }}
            </span>
            <h4 class="preview-title">{{ teaText(hoveredTea, 'name') }}</h4>
          </div>
          <div class="preview-body">
            <div class="preview-tags">
              <span class="preview-type">{{ t(hoveredTea.type) }}</span>
              <span class="preview-origin">{{ teaText(hoveredTea, 'origin') }}</span>
            </div>
            <p class="preview-features">{{ teaText(hoveredTea, 'features') }}</p>
          </div>
        </div>
      </transition>

      <!-- 全屏图片预览 Lightbox（可缩放+拖拽） -->
      <transition name="fade">
        <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
          <!-- 可拖拽/缩放图片视口 -->
          <div
            class="lightbox-viewport"
            ref="lightboxViewportEl"
            @wheel.prevent.stop="onLightboxWheel"
            @dblclick.prevent.stop="onLightboxDblClick"
          >
            <div
              v-if="selectedTea"
              class="lightbox-img-wrap"
              :class="{ 'is-transformed': imgTransformed, 'is-dragging': imgDragging }"
              :style="{
                transform: imgTransformed
                  ? `translate(${imgTx}px, ${imgTy}px) scale(${imgScale})`
                  : 'none',
                transition: imgDragging || !imgTransformed ? 'none' : 'transform 0.2s ease',
              }"
              @pointerdown.prevent="onLightboxPointerDown"
              @click.stop
            >
              <img
                ref="lightboxImgEl"
                :src="selectedTea.image"
                :alt="teaText(selectedTea, 'name')"
                class="lightbox-image"
                draggable="false"
              />
            </div>
          </div>

          <!-- 关闭按钮：放在蓝色框（图片区域范围）的右上角，避开顶部导航栏 -->
          <button
            class="lightbox-close-corner"
            @click="closeLightbox"
            :title="t('关闭 (Esc)')"
          >×</button>

          <div v-if="selectedTea" class="lightbox-caption" style="display: none;">
            <span class="lb-name">{{ teaText(selectedTea, 'name') }}</span>
            <span class="lb-origin">{{ teaText(selectedTea, 'origin') }} · {{ t(selectedTea.type) }}</span>
          </div>

          <div class="lightbox-hint">{{ t('滚轮缩放 · 拖拽平移 · 双击适应屏幕') }}</div>
        </div>
      </transition>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import L from 'leaflet'
import { createAlbersCRS } from '../utils/crs.js'
import ChapterIntro from './ChapterIntro.vue'
import ChapterCornerIntro from './ChapterCornerIntro.vue'
import { CHAPTER_META } from '../data/chapterMeta.js'
import { useLanguage } from '../utils/language.js'
import { teaEnglish } from '../data/ch3English.js'
import {
  TEAS,
  TEA_TYPE_COLORS,
  TOP10_STYLE,
  OTHER_STYLE,
  PROV_BG_URL,
  PROV_STYLE,
  MAP_INIT,
  TEA_AREA,
} from '../config/ch3.js'

const props = defineProps({ id: { type: String, required: true } })
const { language, t } = useLanguage()

function teaText(tea, field) {
  return language.value === 'en' ? (teaEnglish[tea.name]?.[field] ?? t(tea[field])) : tea[field]
}

const sectionEl = ref(null)
const mapEl = ref(null)
const selectedTea = ref(null)
const activeMarker = ref(null)
const chapter = CHAPTER_META.ch3
const hoveredTea = ref(null)
const hoveredPos = ref({ x: 0, y: 0 })
const introDone = ref(false)
const lightboxOpen = ref(false)
const lightboxViewportEl = ref(null)
const lightboxImgEl = ref(null)
// 缩放/拖拽状态
const imgScale = ref(1)
const imgTx = ref(0)
const imgTy = ref(0)
const imgDragging = ref(false)
const imgTransformed = ref(false)
const dragStart = { x: 0, y: 0, tx: 0, ty: 0 }
let nativeImg = { w: 0, h: 0 }
// 记录首次 fit 后的 scale/translate，用于 reset
let fitScale = 1
let fitTx = 0
let fitTy = 0
let map = null
let markers = []
let io = null
let provinceLayer = null
let introRevealTimer = null
let introCameraTimer = null
let introCameraFrame = null
let provinceLoadFinished = false
let introSequenceRequested = false
let introSequenceStarted = false
let introCameraAnimating = false

const CHINA_OVERVIEW_HOLD_MS = 800
const TEA_AREA_FLY_DURATION_MS = 4500

function getChinaOverviewBounds() {
  const bounds = provinceLayer?.getBounds()
  return bounds?.isValid?.() ? bounds : MAP_INIT.fitBounds
}

function setChinaOverview() {
  if (!map) return
  map.fitBounds(getChinaOverviewBounds(), {
    paddingTopLeft: [48, 48],
    paddingBottomRight: [48, 48],
    animate: false,
  })
}

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2
}

function animateToTeaArea() {
  if (!map) return

  const startCenter = map.getCenter()
  const startZoom = map.getZoom()
  const [targetLat, targetLng] = TEA_AREA.center
  let startedAt = null

  introCameraAnimating = true

  const step = (now) => {
    if (!map) {
      introCameraFrame = null
      introCameraAnimating = false
      return
    }

    if (startedAt == null) startedAt = now
    const progress = Math.min(1, (now - startedAt) / TEA_AREA_FLY_DURATION_MS)

    // 自定义 Albers CRS 下逐帧同步中心和缩放，跟随浏览器刷新率更新。
    const eased = easeInOutCubic(progress)
    map.setView([
      startCenter.lat + (targetLat - startCenter.lat) * eased,
      startCenter.lng + (targetLng - startCenter.lng) * eased,
    ], startZoom + (TEA_AREA.zoom - startZoom) * eased, { animate: false })

    if (progress < 1) {
      introCameraFrame = requestAnimationFrame(step)
      return
    }

    introCameraFrame = null
    introCameraAnimating = false
    map.setView(TEA_AREA.center, TEA_AREA.zoom, { animate: false })
    provinceLayer?.eachLayer(layer => layer.redraw?.())
    requestAnimationFrame(() => layoutLabels())
  }

  introCameraFrame = requestAnimationFrame(step)
}

function startIntroCameraSequence() {
  if (!map || introSequenceStarted || !provinceLoadFinished) return

  introSequenceStarted = true
  map.invalidateSize({ pan: false, animate: false })
  setChinaOverview()
  requestAnimationFrame(() => layoutLabels())

  introCameraTimer = setTimeout(() => {
    introCameraTimer = null
    animateToTeaArea()
  }, CHINA_OVERVIEW_HOLD_MS)
}

function onIntroDone() {
  introDone.value = true
  introRevealTimer = setTimeout(() => {
    introRevealTimer = null
    introSequenceRequested = true
    startIntroCameraSequence()
  }, 300)
}

const top10Count = TEAS.filter(t => t.isTop10).length
const otherCount = TEAS.filter(t => !t.isTop10).length

watch(language, async () => {
  // Update labels in place so selection, ripple animations and map position survive.
  markers.forEach(marker => {
    const tea = marker._teaData
    const el = marker.getElement()
    if (!tea || !el) return
    const name = teaText(tea, 'name')
    const label = el.querySelector('.tea-label-text')
    if (label) label.textContent = name
    el.title = name
    el.setAttribute('aria-label', name)
    marker.options.title = name
  })
  await nextTick()
  layoutLabels()
  if (hoveredTea.value) {
    const marker = markers.find(marker => marker._teaData.name === hoveredTea.value.name)
    if (marker) updatePreviewPos(marker)
  }
})

// 创建名茶标签图标：扩散圆为锚点，标签置于扩散圆上方（布局算法处理纵向避让）
function createTeaLabelIcon(tea) {
  const isTop10 = tea.isTop10
  const dotSize = isTop10 ? 22 : 18
  // 标签紧贴扩散圆上方，预留少量空间用于布局避让（约为原来的1/3）
  const labelH = 24
  const layoutRoom = 15
  const placeholderH = dotSize + labelH + layoutRoom
  const placeholderW = 140
  const iconSize = [placeholderW, placeholderH]
  // iconAnchor 定位在扩散圆中心，相对于 iconSize 的左下角区域
  const anchorX = placeholderW / 2
  const anchorY = placeholderH - dotSize / 2 - 2

  const color = isTop10 ? '#B28F4C' : '#5C7C3A'
  const ringColor = isTop10 ? '#D4A85C' : '#7A9E52'

  const labelHtml = `
    <div class="tea-label-wrap tea-label--above ${isTop10 ? 'tea-label--top10' : 'tea-label--other'}" style="--tea-color:${color};--tea-ring:${ringColor}">
      <span class="tea-label-text">${teaText(tea, 'name')}</span>
      <div class="tea-ripple">
        <span class="tea-ripple-dot"></span>
        <span class="tea-ripple-ring"></span>
        <span class="tea-ripple-ring tea-ripple-ring--2"></span>
      </div>
    </div>
  `

  return L.divIcon({
    className: 'tea-marker',
    html: labelHtml,
    iconSize: iconSize,
    iconAnchor: [anchorX, anchorY],
  })
}

onMounted(async () => {
  await nextTick()
  initMap()
})

function initMap() {
  const albersCRS = createAlbersCRS()
  map = L.map(mapEl.value, {
    crs: albersCRS,
    center: MAP_INIT.center,
    zoom: MAP_INIT.zoom,
    minZoom: MAP_INIT.minZoom,
    maxZoom: MAP_INIT.maxZoom,
    // 允许开场镜头使用连续小数缩放，避免每 0.05 级产生一次视觉台阶。
    zoomSnap: 0,
    zoomControl: false,
    attributionControl: false,
  })

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  // 创建省份底图专用 pane，z-index 低于标记所在 overlay pane(400)
  map.createPane('provPane')
  map.getPane('provPane').style.zIndex = 350

  // 省份底图
  fetch(PROV_BG_URL)
    .then(r => r.json())
    .then(geo => {
      provinceLayer = L.geoJSON(geo, {
        pane: 'provPane',
        style: () => ({
          color: PROV_STYLE.color,
          weight: PROV_STYLE.weight,
          fillColor: PROV_STYLE.fillColor,
          fillOpacity: PROV_STYLE.fillOpacity,
        }),
      }).addTo(map)
      provinceLoadFinished = true
      // 使用省界数据的真实范围，而不是预估坐标，保证完整中国居中显示。
      setChinaOverview()
      if (introSequenceRequested) startIntroCameraSequence()
    })
    .catch(err => {
      provinceLoadFinished = true
      console.warn('省份底图加载失败:', err)
      if (introSequenceRequested) startIntroCameraSequence()
    })

  // 添加名茶点（Albers 米坐标: [y_m, x_m]）
  TEAS.forEach(tea => {
    if (tea.y_m == null || tea.x_m == null) return

    const style = tea.isTop10 ? TOP10_STYLE : OTHER_STYLE
    const marker = L.marker([tea.y_m, tea.x_m], {
      icon: createTeaLabelIcon(tea),
      title: teaText(tea, 'name'),
      interactive: true,
    })

    marker.on('mouseover', (e) => {
      if (!selectedTea.value || selectedTea.value.name !== tea.name) {
        const el = marker.getElement()
        if (el) {
          el.classList.add('tea-marker--hover')
          el.style.zIndex = 1000
        }
        hoveredTea.value = tea
        updatePreviewPos(marker)
      }
    })

    marker.on('mousemove', () => {
      if (hoveredTea.value && hoveredTea.value.name === tea.name) {
        updatePreviewPos(marker)
      }
    })

    marker.on('mouseout', () => {
      if (!selectedTea.value || selectedTea.value.name !== tea.name) {
        const el = marker.getElement()
        if (el) {
          el.classList.remove('tea-marker--hover')
          el.style.zIndex = ''
        }
      }
      if (!selectedTea.value) {
        hoveredTea.value = null
      }
    })

    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e)
      selectTea(tea, marker, style)
    })

    marker.addTo(map)
    marker._teaData = tea
    markers.push(marker)
  })

  // 点击地图空白处关闭面板 + 清除悬浮预览
  map.on('click', () => {
    hoveredTea.value = null
    closePanel()
  })

  // 标签布局：避免标签相互遮挡
  map.on('zoomend', () => {
    if (introCameraAnimating) return
    scheduleLayout()
    if (hoveredTea.value) {
      const m = markers.find(m => {
        const el = m.getElement()
        return el && el.classList.contains('tea-marker--hover')
      })
      if (m) updatePreviewPos(m)
    }
  })
  map.on('moveend', () => {
    if (introCameraAnimating) return
    scheduleLayout()
    if (hoveredTea.value) {
      const m = markers.find(m => {
        const el = m.getElement()
        return el && el.classList.contains('tea-marker--hover')
      })
      if (m) updatePreviewPos(m)
    }
  })
  map.on('resize', () => {
    scheduleLayout()
  })

  // 拖动过程中使用节流
  let layoutTimer = null
  function scheduleLayout() {
    if (layoutTimer) return
    layoutTimer = requestAnimationFrame(() => {
      layoutTimer = null
      layoutLabels()
    })
  }

  // 暴露到 window 便于调试
  if (import.meta.env.DEV) {
    window.__ch3map = map
    window.__ch3markers = markers
    window.__ch3layout = layoutLabels
  }
}

/**
 * 重新布局所有标签，避免相互遮挡（标签全部置于扩散圆上方）
 * 策略：
 *  1. 将地理上接近的点位（扩散圆心间距 < 阈值）归为一组
 *  2. 每组内按纬度从北到南排序
 *  3. 组内标签按行堆叠：第一行贴圆点上方，第二行再往上推 (labelH + gap)，依此类推
 *  4. 非组内标签仍用迭代推开策略
 */
function layoutLabels() {
  if (!map || markers.length === 0) return
  const mapContainer = mapEl.value
  if (!mapContainer) return
  const mapRect = mapContainer.getBoundingClientRect()

  const items = []
  markers.forEach(marker => {
    const el = marker.getElement()
    if (!el) return
    const wrap = el.querySelector('.tea-label-wrap')
    const text = el.querySelector('.tea-label-text')
    const ripple = el.querySelector('.tea-ripple')
    if (!wrap || !text || !ripple) return

    wrap.style.transform = ''

    const labelRect = text.getBoundingClientRect()
    const rippleRect = ripple.getBoundingClientRect()

    const textL = labelRect.left - mapRect.left
    const textT = labelRect.top - mapRect.top
    const textW = labelRect.width
    const textH = labelRect.height

    const dotCX = rippleRect.left + rippleRect.width / 2 - mapRect.left
    const dotCY = rippleRect.top + rippleRect.height / 2 - mapRect.top

    items.push({
      marker,
      el,
      wrap,
      text,
      dotCX,
      dotCY,
      x: textL,
      y: textT,
      w: textW,
      h: textH,
      offsetX: 0,
      offsetY: 0,
      clusterId: -1,
    })
  })

  if (items.length === 0) return

  // === 步骤 1：聚类（地理相近的点位归组） ===
  // 阈值：当两个扩散圆心间距 < 80px 时视为一组，采用并查集传递性聚类
  const PROX_THRESHOLD = 80
  const parent = items.map((_, i) => i)
  function find(i) {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]]
      i = parent[i]
    }
    return i
  }
  function union(i, j) {
    const ri = find(i)
    const rj = find(j)
    if (ri !== rj) parent[rj] = ri
  }

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const dx = items[i].dotCX - items[j].dotCX
      const dy = items[i].dotCY - items[j].dotCY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < PROX_THRESHOLD) union(i, j)
    }
  }

  // 收集各组
  const groupsMap = new Map()
  items.forEach((it, i) => {
    const root = find(i)
    if (!groupsMap.has(root)) groupsMap.set(root, [])
    groupsMap.get(root).push(it)
    it.clusterId = root
  })

  // === 步骤 2：组内标签纵向堆叠 ===
  const LABEL_GAP = 6 // 标签之间的最小垂直间距

  groupsMap.forEach(group => {
    if (group.length < 2) return // 单独一个，无需处理

    // 按纬度从北到南排序
    group.sort((a, b) => a.dotCY - b.dotCY)

    // 计算组内所有标签的最大高度，统一用这个做堆叠间距
    const maxH = Math.max(...group.map(g => g.h))
    const rowStep = maxH + LABEL_GAP

    // 第一行 (row=0) 直接贴在圆点上方（offsetY=0）
    // 第二行 (row=1) 向上推 1 倍 rowStep，标签底部仍在 dotCY 附近
    // 更稳妥的做法：每个标签的 bottom（y+h）距离 dotCY 至少 rowStep * row
    // 由于标签默认在圆点上方 (labelBottom ≈ dotCY)，向上推 = 增加 offsetY 负值

    // 策略：row=0 保持默认位置；row=1 上移 1*rowStep；row=2 上移 2*rowStep
    // 但为了不让标签离圆点太远，改用「底部对齐」方式：
    // 第 k 行标签的 y = 第 0 行标签的 y - k * rowStep
    // 即 offsetY = -k * rowStep

    // 找到该组内 "基准" 标签（row=0，dotCY 最小那个）
    const baseY = group[0].y

    group.forEach((it, idx) => {
      if (idx === 0) return // 第一行不动
      const targetY = baseY - idx * rowStep
      const delta = targetY - it.y
      it.offsetY += delta
      it.y = targetY
    })
  })

  // === 步骤 3：非组内标签（或组内标签堆叠后）仍可能有跨组重叠，做横向推开 ===
  for (let pass = 0; pass < 6; pass++) {
    let moved = false
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i]
        const b = items[j]
        const ax1 = a.x
        const ay1 = a.y
        const ax2 = a.x + a.w
        const ay2 = a.y + a.h
        const bx1 = b.x
        const by1 = b.y
        const bx2 = b.x + b.w
        const by2 = b.y + b.h

        const overlapX = ax1 < bx2 && ax2 > bx1
        const overlapY = ay1 < by2 && ay2 > by1

        if (overlapX && overlapY) {
          const aCenterX = ax1 + a.w / 2
          const bCenterX = bx1 + b.w / 2
          const overlapH = Math.min(ax2, bx2) - Math.max(ax1, bx1)

          // 横向推开（让两个标签左右错开）
          const push = Math.ceil(overlapH / 2) + 4
          if (push > 0) {
            if (bCenterX > aCenterX) {
              b.offsetX += push
              b.x += push
            } else {
              b.offsetX -= push
              b.x -= push
            }
            moved = true
          }
        }
      }
    }
    if (!moved) break
  }

  // === 步骤 4：边界夹取 ===
  items.forEach(it => {
    const maxX = mapRect.width - it.w - 4
    const minX = 4
    if (it.x < minX) {
      it.offsetX += (minX - it.x)
      it.x = minX
    } else if (it.x > maxX) {
      it.offsetX -= (it.x - maxX)
      it.x = maxX
    }
    const minY = 4
    const maxY = mapRect.height - it.h - 4
    if (it.y < minY) {
      it.offsetY += (minY - it.y)
      it.y = minY
    } else if (it.y > maxY) {
      it.offsetY -= (it.y - maxY)
      it.y = maxY
    }
  })

  // === 步骤 5：应用偏移量 ===
  items.forEach(it => {
    if (it.offsetX !== 0 || it.offsetY !== 0) {
      it.wrap.style.transform = `translate(${it.offsetX}px, ${it.offsetY}px)`
    } else {
      it.wrap.style.transform = ''
    }
  })
}

function selectTea(tea, marker, style) {
  // 恢复之前激活的标记
  if (activeMarker.value && activeMarker.value !== marker) {
    const prevEl = activeMarker.value.getElement()
    if (prevEl) {
      prevEl.classList.remove('tea-marker--active')
      prevEl.style.zIndex = ''
    }
  }

  selectedTea.value = tea
  activeMarker.value = marker
  hoveredTea.value = null

  const el = marker.getElement()
  if (el) {
    el.classList.add('tea-marker--active')
    el.style.zIndex = 1000
  }

  // 平移地图使标记可见
  map.panTo([tea.y_m, tea.x_m], { animate: true, duration: 0.4 })
}

function closePanel() {
  if (activeMarker.value) {
    const el = activeMarker.value.getElement()
    if (el) {
      el.classList.remove('tea-marker--active')
      el.style.zIndex = ''
    }
  }
  selectedTea.value = null
  activeMarker.value = null
  lightboxOpen.value = false
}

function updatePreviewPos(marker) {
  if (!map || !mapEl.value) return
  const latlng = marker.getLatLng()
  const point = map.latLngToContainerPoint(latlng)
  const mapRect = mapEl.value.getBoundingClientRect()
  const x = point.x + 28
  const y = point.y - 20
  hoveredPos.value = {
    x: Math.min(x, mapRect.width - 280),
    y: Math.max(y, 10),
  }
}

function openLightbox() {
  if (!selectedTea.value) return
  // 重置缩放状态
  imgScale.value = 1
  imgTx.value = 0
  imgTy.value = 0
  imgDragging.value = false
  imgTransformed.value = false
  nativeImg = { w: 0, h: 0 }
  fitScale = 1
  fitTx = 0
  fitTy = 0

  lightboxOpen.value = true
  window.addEventListener('keydown', onLightboxKeydown)
  window.addEventListener('pointermove', onLightboxPointerMove)
  window.addEventListener('pointerup', onLightboxPointerUp)

  // 图片加载完成后，测量原生尺寸，记录 fit 参数
  nextTick(() => {
    const el = lightboxImgEl.value
    if (!el) return
    const doMeasure = () => {
      nativeImg.w = el.naturalWidth
      nativeImg.h = el.naturalHeight
      // 测量当前 viewport 尺寸，计算 fit 参数
      const viewport = lightboxViewportEl.value
      if (!viewport) return
      const rect = viewport.getBoundingClientRect()
      const padding = 60
      const availW = rect.width - padding
      const availH = rect.height - padding
      const fit = Math.min(availW / nativeImg.w, availH / nativeImg.h, 1)
      fitScale = fit > 0 ? fit : 1
      fitTx = (rect.width - nativeImg.w * fitScale) / 2
      fitTy = (rect.height - nativeImg.h * fitScale) / 2
    }
    if (el.complete && el.naturalWidth) {
      doMeasure()
    } else {
      el.addEventListener('load', doMeasure, { once: true })
    }
  })
}

function closeLightbox() {
  lightboxOpen.value = false
  window.removeEventListener('keydown', onLightboxKeydown)
  window.removeEventListener('pointermove', onLightboxPointerMove)
  window.removeEventListener('pointerup', onLightboxPointerUp)
}

function onLightboxKeydown(e) {
  if (e.key === 'Escape') closeLightbox()
  else if (e.key === '+' || e.key === '=') zoomBy(1.25)
  else if (e.key === '-' || e.key === '_') zoomBy(1 / 1.25)
  else if (e.key === '1') resetZoom()
  else if (e.key.toLowerCase() === 'f') fitToScreen()
  else if (e.key === '0') resetZoom()
}

// === 缩放 / 平移 ===
const MIN_SCALE = 0.1
const MAX_SCALE = 8

function clampScale(s) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))
}

function zoomBy(factor, cx, cy) {
  const viewport = lightboxViewportEl.value
  if (!viewport) return
  const rect = viewport.getBoundingClientRect()
  const pivotX = cx != null ? cx : rect.width / 2
  const pivotY = cy != null ? cy : rect.height / 2

  const oldImgScale = imgScale.value
  const newImgScale = clampScale(oldImgScale * factor)
  if (newImgScale === oldImgScale) return

  const effTxOld = fitTx + (imgTransformed.value ? imgTx.value : 0)
  const effTyOld = fitTy + (imgTransformed.value ? imgTy.value : 0)
  const effScaleOld = fitScale * oldImgScale
  const effScaleNew = fitScale * newImgScale
  const r = effScaleNew / effScaleOld

  const newEffTx = pivotX - (pivotX - effTxOld) * r
  const newEffTy = pivotY - (pivotY - effTyOld) * r
  imgTx.value = newEffTx - fitTx
  imgTy.value = newEffTy - fitTy
  imgScale.value = newImgScale
  imgTransformed.value = true
}

function resetZoom() {
  // 重置为适应屏幕（即 imgScale=1, imgTx=0, imgTy=0, imgTransformed=false）
  imgScale.value = 1
  imgTx.value = 0
  imgTy.value = 0
  imgTransformed.value = false
}

function fitToScreen() {
  // 重置为适应屏幕状态
  imgScale.value = 1
  imgTx.value = 0
  imgTy.value = 0
  imgTransformed.value = false
}

function onLightboxWheel(e) {
  const viewport = lightboxViewportEl.value
  if (!viewport) return
  const rect = viewport.getBoundingClientRect()
  const cx = e.clientX - rect.left
  const cy = e.clientY - rect.top
  const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
  zoomBy(factor, cx, cy)
}

function onLightboxDblClick(e) {
  const viewport = lightboxViewportEl.value
  if (!viewport) return
  const rect = viewport.getBoundingClientRect()
  const cx = e.clientX - rect.left
  const cy = e.clientY - rect.top

  // 如果当前是 fit 状态 → 1:1 以光标为中心
  if (!imgTransformed.value) {
    // 1:1 scale = fitScale（保持与屏幕一致的像素密度）
    // 真实显示 scale 变为 1，即 imgScale = 1/fitScale？不，让我重新想
    // 1:1 意味着图片以原始像素显示，即 effectiveScale = 1
    // effectiveScale = fitScale * imgScale_target => imgScale_target = 1 / fitScale
    const targetImgScale = clampScale(1 / fitScale)
    const newEffScale = fitScale * targetImgScale
    // 当前 effectiveScale = fitScale (因为 imgScale=1)
    const r = newEffScale / fitScale
    const newEffTx = cx - (cx - fitTx) * r
    const newEffTy = cy - (cy - fitTy) * r
    imgTx.value = newEffTx - fitTx
    imgTy.value = newEffTy - fitTy
    imgScale.value = targetImgScale
    imgTransformed.value = true
  } else {
    // 已缩放 → 回到 fit
    imgScale.value = 1
    imgTx.value = 0
    imgTy.value = 0
    imgTransformed.value = false
  }
}

function onLightboxPointerDown(e) {
  // 只有 transformed 状态允许拖拽
  if (!imgTransformed.value) return
  imgDragging.value = true
  dragStart.x = e.clientX
  dragStart.y = e.clientY
  dragStart.tx = imgTx.value
  dragStart.ty = imgTy.value
}

function onLightboxPointerMove(e) {
  if (!imgDragging.value) return
  imgTx.value = dragStart.tx + (e.clientX - dragStart.x)
  imgTy.value = dragStart.ty + (e.clientY - dragStart.y)
}

function onLightboxPointerUp(e) {
  if (!imgDragging.value) return
  imgDragging.value = false
}

onBeforeUnmount(() => {
  if (introRevealTimer) { clearTimeout(introRevealTimer); introRevealTimer = null }
  if (introCameraTimer) { clearTimeout(introCameraTimer); introCameraTimer = null }
  if (introCameraFrame) { cancelAnimationFrame(introCameraFrame); introCameraFrame = null }
  introCameraAnimating = false
  if (io) { io.disconnect(); io = null }
  if (map) { map.stop(); map.remove(); map = null }
  provinceLayer = null
  window.removeEventListener('keydown', onLightboxKeydown)
  window.removeEventListener('pointermove', onLightboxPointerMove)
  window.removeEventListener('pointerup', onLightboxPointerUp)
})
</script>

<style scoped>
.chapter-3 {
  position: relative;
  background: var(--c-paper);
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
  background: var(--c-paper-2);
}

/* 南海九段线插图已移除 */

/* 图例 */
.map-legend {
  position: absolute;
  top: auto;
  bottom: 16px;
  left: 16px;
  z-index: 800;
  background: rgba(247, 244, 235, 0.92);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  font-size: 0.85rem;
}

.legend-title {
  font-weight: 700;
  color: var(--c-olive);
  margin-bottom: 8px;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  color: var(--c-beige-dark);
}

.legend-row .sw {
  display: inline-block;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.top10-sw {
  width: 16px;
  height: 16px;
  background: var(--c-gold);
}

.other-sw {
  width: 12px;
  height: 12px;
  background: var(--c-olive-mid);
}

.legend-hint {
  margin-top: 8px;
  font-size: 0.72rem;
  color: var(--c-beige);
  font-style: normal;
}

/* 固定信息面板 */
.tea-info-panel {
  position: absolute;
  top: 16px;
  right: 16px;
  bottom: 16px;
  width: 360px;
  max-width: 40%;
  z-index: 900;
  background: rgba(247, 244, 235, 0.97);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(81, 109, 51, 0.18);
  border: 1px solid rgba(178, 143, 76, 0.15);
  display: flex;
  flex-direction: column;
  font-family: var(--font-body), KaiTi, STKaiti, serif;
  font-style: normal;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(178, 143, 76, 0.12);
  flex-shrink: 0;
}

.panel-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.panel-badge {
  display: inline-block;
  background: var(--c-olive-mid);
  color: #fff;
  font-size: 0.7rem;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  width: fit-content;
}

.panel-badge.top10 {
  background: var(--c-gold);
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--c-olive);
  margin: 0;
  letter-spacing: 0.05em;
  font-family: inherit;
  font-style: normal;
}

.panel-close {
  width: 28px;
  height: 28px;
  border: none;
  background: var(--c-paper-3);
  color: var(--c-beige-dark);
  font-size: 1.2rem;
  line-height: 1;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.panel-close:hover {
  background: var(--c-gold);
  color: #fff;
}

.panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px 20px;
}

.panel-scroll::-webkit-scrollbar {
  width: 6px;
}

.panel-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.panel-scroll::-webkit-scrollbar-thumb {
  background: rgba(178, 143, 76, 0.3);
  border-radius: 3px;
}

.panel-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(178, 143, 76, 0.5);
}

.panel-image-wrap {
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--c-paper-2);
  margin-bottom: 12px;
  cursor: zoom-in;
  position: relative;
}

.panel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.panel-image-wrap:hover .panel-image { transform: scale(1.05); }

.panel-image-hint {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 3px 8px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 11px;
  border-radius: 4px;
  letter-spacing: 0.05em;
  backdrop-filter: blur(4px);
  opacity: 0.85;
  font-family: var(--font-body), KaiTi, STKaiti, serif;
  font-style: normal;
}
.panel-image-wrap:hover .panel-image-hint { opacity: 1; background: rgba(81, 109, 51, 0.75); }

.panel-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 0.78rem;
  flex-wrap: wrap;
}

.meta-type {
  background: var(--c-paper-2);
  color: var(--c-gold-deep);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  white-space: nowrap;
}

.meta-origin {
  color: var(--c-beige-dark);
}

.panel-section {
  margin-bottom: 14px;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--c-gold);
  letter-spacing: 0.1em;
  margin-bottom: 5px;
}

.section-text {
  font-size: 0.85rem;
  line-height: 1.65;
  color: #555;
  margin: 0;
}

/* 面板滑入动画 */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.3s ease;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* ===== 名茶标签标记 ===== */
:deep(.leaflet-marker-icon.tea-marker) {
  background: transparent;
  border: none;
}

/* 扩散圆 + 标签整体容器：标签在上，扩散圆在下 */
:deep(.tea-label-wrap) {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 1px;
  transform: translate(0, 0);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
:deep(.tea-label-wrap > *) {
  pointer-events: auto;
}

/* 扩散圆容器（位于下方，底部对齐） */
:deep(.tea-ripple) {
  position: relative;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: auto;
}

:deep(.tea-ripple-dot) {
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--tea-color);
  border: 1.5px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  z-index: 2;
}

:deep(.tea-ripple-ring) {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid var(--tea-ring);
  opacity: 0.6;
  animation: tea-ripple-pulse 2.2s ease-out infinite;
}

:deep(.tea-ripple-ring--2) {
  animation-delay: 1.1s;
}

@keyframes tea-ripple-pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}

/* 标签文字容器（圆角矩形，在扩散圆上方） */
:deep(.tea-label-text) {
  background: rgba(250, 247, 239, 0.92);
  backdrop-filter: blur(4px);
  color: #3A4D38;
  font-family: var(--font-dzji, var(--serif));
  font-size: 0.8rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
  border: 1px solid rgba(178, 143, 76, 0.35);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  line-height: 1.3;
  letter-spacing: 0.02em;
  margin: 0;
}

/* 十大名茶：标签更醒目 */
:deep(.tea-label--top10 .tea-ripple) {
  width: 22px;
  height: 22px;
}

:deep(.tea-label--top10 .tea-ripple-dot) {
  inset: 3px;
  border-width: 2px;
}

:deep(.tea-label--top10 .tea-label-text) {
  font-family: var(--font-dzji, var(--serif));
  background: rgba(250, 247, 239, 0.95);
  border-color: rgba(178, 143, 76, 0.55);
  color: #5C4A1F;
  box-shadow: 0 2px 10px rgba(178, 143, 76, 0.2);
}

/* Hover 状态 */
:deep(.tea-marker--hover .tea-ripple-dot) {
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.5), 0 1px 4px rgba(0, 0, 0, 0.25);
}

:deep(.tea-marker--hover .tea-label-text) {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  filter: brightness(1.03);
}

/* Active/Selected 状态 */
:deep(.tea-marker--active .tea-ripple-dot) {
  box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.6), 0 0 12px 3px var(--tea-color), 0 2px 6px rgba(0, 0, 0, 0.3);
}

:deep(.tea-marker--active .tea-ripple-ring) {
  animation-duration: 1.2s;
  border-color: var(--tea-color);
  opacity: 0.9;
}

:deep(.tea-marker--active .tea-label-text) {
  background: var(--tea-color);
  color: #fff;
  border-color: var(--tea-color);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 768px) {
  .tea-info-panel {
    position: absolute;
    top: auto;
    right: 8px;
    bottom: 8px;
    left: 8px;
    width: auto;
    max-width: none;
    max-height: 50%;
  }
}

/* ===== Lightbox 全屏大图预览 ===== */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(20, 18, 12, 0.74);
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

/* 视口：占满整个 lightbox，居中显示图片 */
.lightbox-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 100px 120px;
  box-sizing: border-box;
}
.lightbox-viewport:active {
  cursor: grabbing;
}

/* 图片包装：fit 状态下用 CSS object-fit 居中；transform 状态用 translate+scale */
.lightbox-img-wrap {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.2s ease;
  transform-origin: center center;
  display: block;
  margin: 0 auto;
}
.lightbox-img-wrap.is-transformed {
  transition: transform 0.2s ease;
}
.lightbox-img-wrap.is-dragging {
  transition: none;
  cursor: grabbing;
}

/* 关闭按钮：放在蓝色框（图片区域范围）的右上角，避开顶部导航栏 */
.lightbox-close-corner {
  position: absolute;
  top: 72px;
  right: 28px;
  width: 44px;
  height: 44px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #555;
  font-size: 34px;
  font-weight: 300;
  line-height: 1;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-family: system-ui, -apple-system, sans-serif;
}
.lightbox-close-corner:hover {
  color: #b94949;
  transform: rotate(90deg) scale(1.08);
}

/* 缩放控制条：已删除，保留占位样式避免后续引用警告 */

.zoom-btn { display: none; }
.zoom-level { display: none; }
.lightbox-zoom-controls { display: none; }

.lightbox-image {
  max-width: 100%;
  max-height: calc(100vh - 180px);
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
  user-select: none;
  -webkit-user-drag: none;
  display: block;
  will-change: transform;
}
.lightbox-img-wrap.is-transformed .lightbox-image {
  max-width: none;
  max-height: none;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.15);
}

.lightbox-caption {
  position: absolute;
  left: 50%;
  bottom: 60px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #F2EFE3;
  padding: 10px 22px;
  background: rgba(81, 109, 51, 0.7);
  border-radius: 24px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  z-index: 100;
  pointer-events: none;
  font-family: var(--font-body), KaiTi, STKaiti, serif;
  font-style: normal;
}
.lb-name {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.1em;
  color: var(--c-gold-soft)
}
.lb-origin {
  font-size: 12px;
  opacity: 0.9;
  letter-spacing: 0.05em;
}

.lightbox-hint {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.65);
  font-size: 11px;
  letter-spacing: 0.15em;
  z-index: 100;
  pointer-events: none;
  font-family: var(--font-body), KaiTi, STKaiti, serif;
  font-style: normal;
}

/* fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ===== 悬浮预览卡片 ===== */
.tea-preview-card {
  position: absolute;
  z-index: 850;
  width: 260px;
  background: rgba(247, 244, 235, 0.97);
  backdrop-filter: blur(12px);
  border-radius: 10px;
  border: 1px solid rgba(178, 143, 76, 0.25);
  box-shadow: 0 8px 28px rgba(81, 109, 51, 0.2);
  padding: 12px 14px;
  pointer-events: none;
  transform: translateY(-4px);
  font-family: var(--font-body), KaiTi, STKaiti, serif;
  font-style: normal;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(178, 143, 76, 0.15);
}

.preview-badge {
  display: inline-block;
  background: var(--c-olive-mid);
  color: #fff;
  font-size: 0.62rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.preview-badge.top10 {
  background: var(--c-gold);
}

.preview-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--c-olive);
  margin: 0;
  letter-spacing: 0.03em;
  font-family: var(--font-body), KaiTi, STKaiti, serif;
  font-style: normal;
}

.preview-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preview-type {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--c-gold-deep);
  background: rgba(178, 143, 76, 0.12);
  padding: 2px 7px;
  border-radius: 4px;
}

.preview-origin {
  font-size: 0.68rem;
  color: var(--c-beige-dark);
}

.preview-features {
  font-size: 0.75rem;
  line-height: 1.55;
  color: #555;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.english-copy :deep(.tea-label-text) { font-size: calc(.8rem - 1px); }
.english-copy .lightbox-hint { font-size: 10px; }
.english-copy .lb-name { font-size: 14px; }
.english-copy .lb-origin { font-size: 11px; }
.english-copy .preview-header { flex-wrap: wrap; }
.english-copy .preview-title { min-width: 0; max-width: 100%; }
</style>
