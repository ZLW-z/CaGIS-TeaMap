<template>
  <div id="app-root">
    <!-- 顶部导航栏 -->
    <nav class="top-nav" :class="{ 'english-copy': language === 'en' }">
      <div class="nav-brand keep-chinese">
        <span class="brand-icon">
          <img
            :src="assetUrl('images/site-logo.png')"
            alt="山海一叶"
            class="brand-icon-image"
            width="36"
            height="36"
          />
        </span>
        <span class="brand-text">山海一叶</span>
      </div>
      <div class="nav-track">
        <!-- 章节导航按钮容器：flex 均匀分布
             每个按钮始终占据「胶囊宽度 + 间隙」的一致空间，
             保证圆点态与胶囊态之间的边缘距离自适应且相等 -->
        <div class="nav-chapters-wrap">
          <!-- 虚线连接线：相对于 wrap 定位，端点基于 wrap 坐标系计算 -->
          <svg class="nav-connector" preserveAspectRatio="none">
            <line
              :x1="connectorStart"
              :x2="connectorEnd"
              y1="50%"
              y2="50%"
              class="connector-line"
            />
          </svg>
          <router-link
            v-for="(r, i) in navItems"
            :key="r.path"
            :to="r.path"
            class="nav-chapter"
            :class="{
              'is-active': currentRoute === r.path,
              'is-hover': hoverIdx === i && currentRoute !== r.path,
              'has-deco': i < navItems.length - 1,
              'is-bookend': r.isBookend,
            }"
            @mouseenter="hoverIdx = i"
            @mouseleave="hoverIdx = -1"
          >
            <!-- 胶囊占位符：透明但占据与真实胶囊相同的宽度
                 → 无论显示圆点还是胶囊，按钮都占同样空间
                 → 相邻符号边缘间距离保持一致 -->
            <span class="nav-pill nav-pill--spacer" aria-hidden="true">
              <span v-if="!r.isBookend" class="nav-pill-num">{{ language === 'en' ? ['I', 'II', 'III', 'IV', 'V', 'VI'][i - 1] : r.idx }}</span>
              <span class="nav-pill-label">{{ t(r.label) }}</span>
            </span>

            <!-- 默认态：双描边圆点（位于按钮中心） -->
            <span class="nav-dot">
              <span class="nav-dot-inner"></span>
            </span>
            <!-- 激活/悬浮态：圆角矩形标签（同样位于按钮中心，叠在占位符上） -->
            <span class="nav-pill nav-pill--visible">
              <span v-if="!r.isBookend" class="nav-pill-num">{{ language === 'en' ? ['I', 'II', 'III', 'IV', 'V', 'VI'][i - 1] : r.idx }}</span>
              <span class="nav-pill-label">{{ t(r.label) }}</span>
            </span>

            <!-- 章节间装饰小圆点：定位在当前按钮右外侧（两按钮正中间） -->
            <span v-if="i < navItems.length - 1" class="nav-deco">
              <span class="nav-deco-dot"></span>
              <span class="nav-deco-dot nav-deco-dot--s"></span>
            </span>
          </router-link>
        </div>
      </div>
      <div class="language-switch" role="group" aria-label="语言 / Language">
        <button
          type="button"
          lang="zh-CN"
          :aria-pressed="language === 'zh'"
          @click="setLanguage('zh')"
        >中文</button>
        <button
          type="button"
          lang="en"
          :aria-pressed="language === 'en'"
          @click="setLanguage('en')"
        >EN</button>
      </div>
      <div class="nav-progress">
        <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
    </nav>

    <!-- 路由视图 -->
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- 章节切换底部控制 -->
    <div class="chapter-switch" :class="{ 'english-copy': language === 'en' }">
      <button
        v-if="prevRoute"
        class="switch-btn prev"
        @click="$router.push(prevRoute)"
      >
        ← {{ t(prevLabel) }}
      </button>
      <div v-else class="switch-btn hidden"></div>
      <div class="page-indicator">{{ t(pageIndicatorText) }}</div>
      <button
        v-if="nextRoute"
        class="switch-btn next"
        @click="$router.push(nextRoute)"
      >
        {{ t(nextLabel) }} →
      </button>
      <div v-else class="switch-btn hidden"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { assetUrl } from './utils/base.js'
import { useLanguage } from './utils/language.js'

const { language, setLanguage, t } = useLanguage()

const route = useRoute()
const router = useRouter()

const navItems = [
  { path: '/prologue', idx: '序', label: '序言',  isBookend: true },
  { path: '/ch1',      idx: '壹', label: '茶生山水间' },
  { path: '/ch2',      idx: '贰', label: '何以生茶' },
  { path: '/ch3',      idx: '叁', label: '云雾深处' },
  { path: '/ch4',      idx: '肆', label: '一叶行远' },
  { path: '/ch5',      idx: '伍', label: '今日茶境' },
  { path: '/ch6',      idx: '陆', label: '世界共饮' },
  { path: '/epilogue', idx: '终', label: '结语',  isBookend: true },
]

const currentRoute = computed(() => route.path)

watch([() => route.path, language], () => {
  const current = navItems.find(item => item.path === route.path)
  if (current) document.title = `山海一叶 · ${t(current.label)}`
}, { immediate: true })

// 底部显示的章节序号/计数：仅6个正文章节算入章节编号，序言结语作为首尾不计入
const currentIdx = computed(() => {
  const i = navItems.findIndex(n => n.path === route.path)
  if (i === -1) return 0
  if (navItems[i].isBookend) return i === 0 ? 0 : 7
  return i
})
const currentIndicator = computed(() => currentIdx.value === 0 ? '序' : currentIdx.value > 6 ? '终' : currentIdx.value)
const totalIndicator = computed(() => 6) // 始终 6 章主内容，序言与结语是首尾
const pageIndicatorText = computed(() => {
  if (currentIdx.value === 0) return '序'
  if (currentIdx.value > totalIndicator.value) return '结语'
  return `${currentIndicator.value} / ${totalIndicator.value}`
})

const prevRoute = computed(() => {
  const i = navItems.findIndex(n => n.path === route.path)
  return i > 0 ? navItems[i - 1].path : null
})
const nextRoute = computed(() => {
  const i = navItems.findIndex(n => n.path === route.path)
  return i < navItems.length - 1 ? navItems[i + 1].path : null
})
const prevLabel = computed(() => {
  const i = navItems.findIndex(n => n.path === route.path)
  if (i <= 0) return ''
  const p = navItems[i - 1]
  return p.isBookend ? p.label : p.label
})
const nextLabel = computed(() => {
  const i = navItems.findIndex(n => n.path === route.path)
  if (i < 0 || i >= navItems.length - 1) return ''
  const p = navItems[i + 1]
  return p.isBookend ? p.label : p.label
})

const progressPct = ref(0)
const hoverIdx = ref(-1)

// 虚线起止：从第一章按钮中心到第六章按钮中心
// 通过动态测量各章节按钮中心位置来连线
const connectorStart = ref('0%')
const connectorEnd = ref('100%')

function updateConnectorRange() {
  const wrap = document.querySelector('.nav-chapters-wrap')
  const chapters = document.querySelectorAll('.nav-chapter')
  if (!wrap || chapters.length < 2) return
  const wrapRect = wrap.getBoundingClientRect()
  const firstRect = chapters[0].getBoundingClientRect()
  const lastRect = chapters[chapters.length - 1].getBoundingClientRect()
  const firstCx = (firstRect.left + firstRect.right) / 2 - wrapRect.left
  const lastCx = (lastRect.left + lastRect.right) / 2 - wrapRect.left
  const wrapW = wrapRect.width
  connectorStart.value = (firstCx / wrapW * 100).toFixed(2) + '%'
  connectorEnd.value = (lastCx / wrapW * 100).toFixed(2) + '%'
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', updateConnectorRange)
  updateConnectorRange()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', updateConnectorRange)
})

function onScroll() {
  const h = document.documentElement
  const max = Math.max(1, h.scrollHeight - h.clientHeight)
  progressPct.value = Math.round((h.scrollTop / max) * 1000) / 10
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
#app-root {
  min-height: 100vh;
  background: var(--c-paper-2, #F7F4EB);
}

/* ===== 顶部导航 ===== */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(247, 244, 235, 0.96);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line, rgba(81,109,51,.18));
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 60px;
  box-shadow: 0 2px 16px -8px rgba(61, 84, 40, 0.15);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.brand-icon {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: block;
  border-radius: 50%;
  overflow: hidden;
}
.brand-icon-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  user-select: none;
  pointer-events: none;
}
.brand-text {
  font: 700 20px var(--font-qiji, var(--serif));
  color: var(--c-olive, #516D33);
  letter-spacing: 0.05em;
}

.nav-track {
  position: relative;
  display: flex;
  align-items: stretch;
  margin-left: 32px;
  flex: 1;
  height: 100%;
  overflow: visible;
  padding: 0 4px;
  box-sizing: border-box;
}

/* ===== 章节按钮容器：Grid 8 等分 =====
   列宽相等 → 章中心距离永远相等，随容器宽度自适应变化 ✓ */
.nav-chapters-wrap {
  position: relative;
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  align-items: stretch;
  width: 100%;
  height: 100%;
  z-index: 2;
}

/* 虚线连接线 */
.nav-connector {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
  z-index: 1;
}
.connector-line {
  stroke: rgba(81, 109, 51, 0.28);
  stroke-width: 1.2;
  stroke-dasharray: 2 3;
  vector-effect: non-scaling-stroke;
}

/* ===== 章节按钮：占满整列宽度（关键！）
   这样：
   - 装饰点放在 right:0 + translate(50%) → 正好是两列中心的正中点 ✓
   - 圆点/胶囊绝对定位在 50% 50% → 正好是列中心 ✓
   - 无论胶囊如何展开，都在列内居中，列宽大于胶囊宽度 → 不会和邻居拥挤 ✓
   - 列中心距 = 列宽 = 相等 → 章与章"中心距离"永远相等 ✓
*/
.nav-chapter {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 2;
  text-decoration: none;
  overflow: visible;
}

/* 胶囊占位符：占空间但透明，作为可点击区域宽度参考（同时防止Grid列过窄） */
.nav-pill--spacer {
  visibility: hidden;
  display: flex;
  align-items: center;
  gap: 1em;
  padding: 5px 12px;
  border-radius: 14px;
  font: 500 14px var(--sans);
  white-space: nowrap;
  pointer-events: none;
}
.nav-pill--spacer .nav-pill-num { font-weight: 600; font-size: 13px; }
.nav-pill--spacer .nav-pill-label { letter-spacing: 0.03em; }

/* 双描边圆点：绝对定位在列中心 */
.nav-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid var(--c-olive, #516D33);
  background: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}
.nav-dot-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--c-olive, #516D33);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===== 圆角矩形标签（可见版）：绝对定位在同一中心 ===== */
.nav-pill--visible {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.6);
  display: flex;
  align-items: center;
  gap: 1em;
  padding: 5px 12px;
  border-radius: 14px;
  background: var(--c-olive, #516D33);
  color: var(--c-paper, #EFE9DA);
  font: 500 14px var(--sans);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 10px -2px rgba(61, 84, 40, 0.3);
  z-index: 3;
}
.nav-pill-num {
  font-family: var(--font-qiji, var(--serif));
  font-weight: 600;
  font-size: 14px;
  opacity: 0.85;
}
.nav-pill-label {
  font-family: var(--font-qiji, var(--serif));
  letter-spacing: 0.03em;
}

/* 激活态（胶囊完全不透明） */
.nav-chapter.is-active .nav-dot {
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
}
.nav-chapter.is-active .nav-pill--visible {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  pointer-events: auto;
  box-shadow: 0 4px 16px -4px rgba(61, 84, 40, 0.4);
}

/* 悬浮态（非激活）：80% 透明度 + 发光 */
.nav-chapter.is-hover .nav-dot {
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
}
.nav-chapter.is-hover .nav-pill--visible {
  opacity: 0.8;
  transform: translate(-50%, -50%) scale(1);
  pointer-events: auto;
  box-shadow:
    0 0 0 2px rgba(139, 160, 106, 0.45),
    0 0 14px 2px rgba(139, 160, 106, 0.55),
    0 0 28px 6px rgba(139, 160, 106, 0.25);
}

/* 装饰小圆点：定位在当前按钮右边缘 → 正好是两按钮之间间隙的中点 */
.nav-deco {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translate(50%, -50%);
  display: flex;
  align-items: center;
  gap: 6px;
  pointer-events: none;
  z-index: 1;
}
.nav-deco-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(81, 109, 51, 0.4);
  flex-shrink: 0;
}
.nav-deco-dot--s {
  width: 2px;
  height: 2px;
  background: rgba(81, 109, 51, 0.28);
}

/* 序言 / 结语 节点：用金色区分，呼应首尾 */
.nav-chapter.is-bookend .nav-dot {
  border-color: var(--c-gold, #B28F4C);
}
.nav-chapter.is-bookend .nav-dot-inner {
  background: var(--c-gold, #B28F4C);
}
.nav-chapter.is-bookend .nav-pill--visible,
.nav-chapter.is-bookend .nav-pill--spacer {
  border-color: var(--c-gold, #B28F4C);
}
.nav-chapter.is-bookend .nav-pill--visible {
  background: var(--c-gold-deep, #8E6F38);
}
.nav-chapter.is-bookend .nav-pill-num {
  opacity: 1;
}

.language-switch {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 2px;
  margin-left: 18px;
  padding: 3px;
  border: 1px solid var(--line, rgba(81, 109, 51, .18));
  border-radius: 18px;
}
.language-switch button {
  border: none;
  border-radius: 14px;
  padding: 5px 9px;
  background: transparent;
  color: var(--c-olive, #516D33);
  font: 500 13px var(--sans);
  line-height: 18px;
  cursor: pointer;
  transition: background-color .2s ease, color .2s ease;
}
.language-switch button[lang="en"] {
  font-family: "Times New Roman", serif;
}
.language-switch button:hover {
  background: rgba(81, 109, 51, .1);
}
.language-switch button[aria-pressed="true"] {
  background: var(--c-olive, #516D33);
  color: var(--c-paper, #EFE9DA);
}
.language-switch button:focus-visible {
  outline: 2px solid var(--c-gold, #B28F4C);
  outline-offset: 2px;
}

.nav-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: var(--c-paper, #EFE9DA);
  width: 100%;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-olive, #516D33), var(--c-gold, #B28F4C));
  transition: width 0.15s ease;
}

/* ===== 章节切换 ===== */
.chapter-switch {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(247, 244, 235, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--line, rgba(81,109,51,.18));
  border-radius: 40px;
  padding: 8px 12px;
  box-shadow: 0 8px 32px -8px rgba(61, 84, 40, 0.25);
}
.switch-btn {
  background: transparent;
  border: none;
  padding: 8px 16px;
  color: var(--ink-soft, #4a4a40);
  font: 500 14px var(--sans);
  cursor: pointer;
  border-radius: 24px;
  transition: all 0.3s ease;
}
.switch-btn:hover:not(.hidden) {
  background: var(--c-olive, #516D33);
  color: #fff;
}
.switch-btn.hidden {
  visibility: hidden;
}
.page-indicator {
  font: 600 13px var(--sans);
  color: var(--c-olive, #516D33);
  padding: 0 8px;
}

/* ===== 页面切换过渡 ===== */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* 为页面内容留出顶部导航和底部切换栏空间 */
:deep(.chapter),
:deep(.page-wrap) {
  padding-top: 80px;
  padding-bottom: 80px;
}

@media (max-width: 880px) {
  .nav-brand .brand-text { display: none; }
  .nav-track { margin-left: 12px; }
  .language-switch { margin-left: 8px; }
  .language-switch button { padding: 5px 6px; }
  .nav-dot { width: 14px; height: 14px; }
  /* 小屏：胶囊只显示序号，占位符和可见版都要改 */
  .nav-pill--spacer,
  .nav-pill--visible {
    font-size: 13px;
    padding: 4px 10px;
  }
  .nav-pill--spacer .nav-pill-label,
  .nav-pill--visible .nav-pill-label {
    display: none;
  }
}
</style>
