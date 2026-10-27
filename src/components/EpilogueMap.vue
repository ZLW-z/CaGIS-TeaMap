<template>
  <section class="epilogue-wrap chapter" :id="id" :class="{ 'english-copy': language === 'en' }" :lang="language === 'en' ? 'en' : 'zh-CN'">
    <!-- 背景图（带模糊+透明度） -->
    <div class="ep-bg">
      <img class="ep-bg-img" :src="bgImageUrl" alt="" />
      <div class="ep-bg-overlay"></div>
      <div class="ep-bg-vignette"></div>
    </div>

    <!-- 视差装饰层 -->
    <div class="ep-parallax ep-parallax-1" ref="px1Ref"></div>
    <div class="ep-parallax ep-parallax-2" ref="px2Ref"></div>

    <!-- 内容层 -->
    <div class="epilogue-inner" ref="contentRef">
      <header class="ep-header" ref="headerRef">
        <div class="ep-kicker" ref="kickerRef">{{ t('结 · 语') }}</div>
        <h1 class="ep-title" ref="titleRef">
          <span v-for="(ch, i) in titleChars" :key="'t'+i" class="ep-title-ch" :ref="el => titleCharRefs[i] = el">{{ ch }}</span>
        </h1>
        <div class="ep-divider" ref="dividerRef">
          <span class="ep-dline left"></span>
          <span class="ep-dot"></span>
          <span class="ep-dline right"></span>
        </div>
        <div class="ep-subtitle" ref="subRef">{{ t('山水孕育名茶 · 古道承载流通 · 山海联结世界') }}</div>
      </header>

      <div class="ep-body" ref="bodyRef">
        <div class="ep-para-box">
          <p v-for="(p, i) in paragraphs" :key="'p'+i" class="ep-para" :ref="el => paraRefs[i] = el">
            <span class="ep-quote-qu" v-if="i === 0">『</span>
            {{ p }}
            <span class="ep-quote-qu end" v-if="i === paragraphs.length - 1">』</span>
          </p>
        </div>
      </div>

      <!-- 结语底部提示 -->
      <div class="ep-hint" ref="hintRef">
        <span class="ep-hint-text">{{ t('旅程至此，愿茶香常伴') }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '../utils/language.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { assetUrl } from '../utils/base.js'

gsap.registerPlugin(ScrollTrigger)
const { language, t } = useLanguage()

defineProps({ id: { type: String, required: true } })

const router = useRouter()

const bgImageUrl = assetUrl('data/peggy_marco-tea-1028741_1920.jpg')

const titleChars = computed(() => language.value === 'en'
  ? t('茶香万里').split(' ').map(word => word + ' ')
  : Array.from(t('茶香万里')))
const titleCharRefs = []

const sourceParagraphs = [
  '一程茶旅至此落幕，山水孕育名茶，古道承载流通，山海联结世界，六个篇章串联起中国茶叶从古至今的发展全貌。从山野间初生的嫩芽，到历代名士追捧的传世名茶，再到规模化种植、远销海外的现代产业，茶叶早已超越饮品本身，成为串联自然地理、人文历史与跨国交流的特殊纽带。',
  '一方水土养一方好茶，云雾山间的坚守延续着传统制茶技艺，规模化茶园与外贸渠道赋予茶业全新活力，漂洋过海之后，中式饮茶习惯落地生根，融合各地风俗演变出多元茶文化，让清醇茶香成为全人类共赏的美好滋味。',
  '地图的刻度记录着茶区的变迁，这趟线上茶史漫游，既是回望先辈依山种茶、以茶通商的过往，也是看见当代茶业蓬勃生长的新生。茶文化从未止步于历史，它始终在传承中创新，在开放中交融。愿这片小小茶叶承载的从容雅致，能伴随日常烟火延续下去，期待未来茶香继续跨越山海，书写更多文明互通、风味共享的崭新篇章。',
]
const paragraphs = computed(() => sourceParagraphs.map(t))
const paraRefs = []

const px1Ref = ref(null)
const px2Ref = ref(null)
const contentRef = ref(null)
const headerRef = ref(null)
const kickerRef = ref(null)
const titleRef = ref(null)
const dividerRef = ref(null)
const subRef = ref(null)
const bodyRef = ref(null)
const hintRef = ref(null)

let mouseMoveHandler = null
let scrollTrigger = null

function goBack() { router.push('/ch1') }
function goTop() { router.push('/prologue') }

onMounted(async () => {
  await nextTick()

  gsap.set(kickerRef.value, { opacity: 0, y: 24, scale: 0.88 })
  gsap.set(titleCharRefs, { opacity: 0, y: 70, rotateX: -90 })
  gsap.set(dividerRef.value, { opacity: 0, scaleX: 0 })
  gsap.set(subRef.value, { opacity: 0, y: 30, letterSpacing: 0 })
  gsap.set(paraRefs, { opacity: 0, y: 55 })
  gsap.set(hintRef.value, { opacity: 0, y: 35 })
  gsap.set([px1Ref.value, px2Ref.value], { opacity: 0 })

  const tl = gsap.timeline()

  tl.to(px1Ref.value, { opacity: 1, duration: 1.6, ease: 'power2.out' })
  tl.to(px2Ref.value, { opacity: 1, duration: 1.4, ease: 'power2.out' }, '-=1.4')

  tl.to(kickerRef.value, {
    opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'power3.out'
  }, '-=1')

  tl.to(titleCharRefs, {
    opacity: 1, y: 0, rotateX: 0,
    duration: 0.9, stagger: 0.15, ease: 'back.out(1.4)'
  }, '-=0.4')

  tl.to(dividerRef.value, {
    opacity: 1, scaleX: 1, duration: 0.9, ease: 'power3.out'
  }, '-=0.3')

  tl.to(subRef.value, {
    opacity: 1, y: 0, letterSpacing: '0.4em', duration: 1.0, ease: 'power2.out'
  }, '-=0.3')

  paraRefs.forEach((p, i) => {
    tl.to(p, {
      opacity: 1, y: 0,
      duration: 1.1,
      ease: 'power2.out'
    }, `-=${0.6}`)
  })

  tl.to(hintRef.value, {
    opacity: 1, y: 0, duration: 0.9, ease: 'power3.out'
  }, '-=0.35')

  // 鼠标视差：装饰层随鼠标轻微移动
  mouseMoveHandler = (e) => {
    const rect = document.documentElement
    const cx = (e.clientX / rect.clientWidth) - 0.5
    const cy = (e.clientY / rect.clientHeight) - 0.5
    gsap.to(px1Ref.value, {
      x: cx * 30, y: cy * 30, rotate: cx * 2,
      duration: 1.4, ease: 'power2.out'
    })
    gsap.to(px2Ref.value, {
      x: -cx * 50, y: -cy * 50,
      duration: 1.8, ease: 'power2.out'
    })
  }
  window.addEventListener('mousemove', mouseMoveHandler)

  // 滚动视差
  scrollTrigger = ScrollTrigger.create({
    trigger: contentRef.value,
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
    onUpdate: (self) => {
      const p = self.progress
      gsap.set(headerRef.value, { y: -p * 100, opacity: Math.max(0.25, 1 - p * 1.2) })
      gsap.set(bodyRef.value, { y: -p * 140 })
      gsap.set(hintRef.value, { y: -p * 180, opacity: Math.max(0, 1 - p * 2.2) })
    }
  })
})

onBeforeUnmount(() => {
  if (mouseMoveHandler) window.removeEventListener('mousemove', mouseMoveHandler)
  if (scrollTrigger) scrollTrigger.kill()
  ScrollTrigger.getAll().forEach(t => t.kill())
})
</script>

<style scoped>
.english-copy .ep-header { width: 100%; }
.english-copy .ep-title { max-width: 100%; flex-wrap: wrap; }
.english-copy .ep-title-ch { white-space: nowrap; }
.english-copy .ep-subtitle { white-space: normal; }

.epilogue-wrap {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #1a1a1a;
  color: var(--c-paper, #F7F4EB);
}

/* ============ 背景层 ============ */
.ep-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}
.ep-bg-img {
  position: absolute;
  inset: -6% -4%;
  width: 108%;
  height: 112%;
  object-fit: cover;
  opacity: 0.4;                /* 要求：透明度40% */
  filter: blur(6px) saturate(0.78) contrast(0.95) brightness(0.72);  /* 要求：高斯模糊 */
  transform: scale(1.04);
}
.ep-bg-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 50% 45%, rgba(61, 84, 40, 0.35), transparent 70%),
    linear-gradient(180deg, rgba(27, 34, 22, 0.55) 0%, rgba(20, 24, 18, 0.72) 50%, rgba(14, 18, 12, 0.85) 100%);
}
.ep-bg-vignette {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 80% at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.6) 100%);
}

/* 视差装饰层（茶纹/叶片光斑） */
.ep-parallax {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  will-change: transform;
}
.ep-parallax-1 {
  background:
    radial-gradient(circle at 20% 30%, rgba(178, 143, 76, 0.18), transparent 30%),
    radial-gradient(circle at 78% 72%, rgba(92, 124, 58, 0.22), transparent 28%);
  filter: blur(8px);
  mix-blend-mode: screen;
}
.ep-parallax-2 {
  background:
    radial-gradient(circle at 65% 18%, rgba(255, 245, 215, 0.10), transparent 24%),
    radial-gradient(circle at 35% 85%, rgba(255, 245, 215, 0.08), transparent 30%);
  mix-blend-mode: soft-light;
}

/* ============ 内容层 ============ */
.epilogue-inner {
  position: relative;
  z-index: 5;
  max-width: 860px;
  margin: 0 auto;
  padding: 8vh 32px 14vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #FBF6E8;
}

/* Header */
.ep-header {
  text-align: center;
  margin-top: 4vh;
  margin-bottom: 60px;
  perspective: 1000px;
}
.ep-kicker {
  font-family: var(--font-qiji, var(--serif));
  font-size: clamp(0.95rem, 1.4vw, 1.1rem);
  letter-spacing: 0.8em;
  padding-left: 0.8em;
  color: var(--c-gold-light, #C5A66A);
  margin-bottom: 26px;
  font-weight: 500;
}
.ep-title {
  font-family: var(--font-kesong, var(--serif));
  font-weight: 700;
  font-size: clamp(3.2rem, 9vw, 6.2rem);
  line-height: 1.1;
  color: #FFF4D8;
  letter-spacing: 0.2em;
  padding-left: 0.2em;
  margin: 0 0 28px;
  display: inline-flex;
  justify-content: center;
  gap: 0.02em;
  transform-style: preserve-3d;
}
.ep-title-ch {
  display: inline-block;
  transform-origin: 50% 100%;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
}
.ep-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 22px;
  transform-origin: 50% 50%;
}
.ep-dline {
  display: inline-block;
  width: clamp(80px, 18vw, 180px);
  height: 1px;
}
.ep-dline.left  { background: linear-gradient(90deg, transparent, rgba(197, 166, 106, 0.85)); }
.ep-dline.right { background: linear-gradient(90deg, rgba(197, 166, 106, 0.85), transparent); }
.ep-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--c-gold-light, #C5A66A);
  box-shadow: 0 0 12px rgba(197, 166, 106, 0.7);
}
.ep-subtitle {
  font-family: var(--font-qiji, var(--serif));
  font-size: clamp(0.9rem, 1.3vw, 1.05rem);
  letter-spacing: 0.4em;
  padding-left: 0.4em;
  color: rgba(251, 246, 232, 0.65);
  white-space: nowrap;
}

/* Body */
.ep-body {
  width: 100%;
  max-width: 780px;
  margin-bottom: 80px;
}
.ep-para-box {
  background: rgba(20, 24, 18, 0.3);
  border: 1px solid rgba(197, 166, 106, 0.15);
  backdrop-filter: blur(4px);
  border-radius: 16px;
  padding: 22px 26px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  position: relative;
}
.ep-para-box .ep-para + .ep-para {
  margin-top: 18px;
}
.ep-para {
  font-family: var(--font-dzji, var(--serif));
  font-size: clamp(0.98rem, 1.3vw, 1.12rem);
  line-height: 2.2;
  color: rgba(251, 246, 232, 0.92);
  margin: 0;
  text-indent: 2em;
  letter-spacing: 0.05em;
}
.ep-quote-qu {
  display: inline-block;
  font-family: var(--font-kesong, var(--serif));
  font-size: 2em;
  color: var(--c-gold-light, #C5A66A);
  line-height: 0;
  vertical-align: -0.1em;
  margin-right: 0.1em;
}
.ep-quote-qu.end {
  margin: 0 0 0 0.1em;
}

/* Hint */
.ep-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding-top: 10px;
}
.ep-hint-text {
  font-family: var(--font-qiji, var(--serif));
  font-size: 0.92rem;
  letter-spacing: 0.5em;
  padding-left: 0.5em;
  color: rgba(251, 246, 232, 0.5);
}
.ep-btn-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
}
.ep-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 26px;
  border-radius: 40px;
  border: 1px solid rgba(197, 166, 106, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-qiji, var(--serif));
  letter-spacing: 0.15em;
  padding-left: calc(26px + 0.15em);
  font-size: 0.92rem;
}
.ep-btn-secondary {
  background: rgba(251, 246, 232, 0.05);
  color: rgba(251, 246, 232, 0.82);
}
.ep-btn-secondary:hover {
  background: rgba(251, 246, 232, 0.12);
  border-color: rgba(197, 166, 106, 0.7);
  transform: translateY(-2px);
}
.ep-btn-primary {
  background: linear-gradient(135deg, var(--c-gold, #B28F4C), var(--c-olive-mid, #5C7C3A));
  color: #FFF8E8;
  border-color: transparent;
  box-shadow: 0 6px 20px -4px rgba(0, 0, 0, 0.4), 0 0 18px rgba(197, 166, 106, 0.15);
}
.ep-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px -6px rgba(0, 0, 0, 0.5), 0 0 22px rgba(197, 166, 106, 0.3);
  filter: brightness(1.05);
}
.ep-btn-arrow {
  font-family: var(--font-dzji, var(--serif));
  font-weight: 700;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .epilogue-inner { padding: 4vh 18px 12vh; }
  .ep-kicker { letter-spacing: 0.5em; }
  .ep-title { letter-spacing: 0.12em; }
  .ep-subtitle { white-space: normal; letter-spacing: 0.2em; }
  .ep-para { padding: 18px 18px; line-height: 2.0; }
  .ep-btn-row { flex-direction: column; width: 100%; }
  .ep-btn { justify-content: center; }
}
</style>
