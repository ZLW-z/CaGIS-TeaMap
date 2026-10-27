<template>
  <transition name="intro-fade">
    <div v-if="visible" class="chapter-intro" ref="introRef">
      <div class="intro-overlay" ref="overlayRef"></div>
      <div class="intro-content">
        <div class="intro-ch-no" ref="chNoRef">{{ chNo }}</div>
        <div class="intro-title-row" ref="titleRowRef">
          <span
            v-for="(ch, i) in titleChars"
            :key="i"
            class="intro-char"
            :ref="el => charRefs[i] = el"
          >{{ ch === ' ' ? '\u00A0' : ch }}</span>
        </div>
        <div class="intro-desc" ref="descRef">
          <span
            v-for="(line, i) in descLines"
            :key="i"
            class="intro-desc-line"
            :ref="el => descLineRefs[i] = el"
          >{{ line }}</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  chNo: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  // 从开场出现到开始切换正文页的时间（秒）
  duration: { type: Number, default: 7 },
})

const emit = defineEmits(['done'])
const CHAPTER_INTRO_HOLD_MS = 2500

const visible = ref(true)
const introRef = ref(null)
const overlayRef = ref(null)
const chNoRef = ref(null)
const titleRowRef = ref(null)
const descRef = ref(null)

const titleChars = computed(() => /[\u4e00-\u9fff]/.test(props.title)
  ? Array.from(props.title)
  : props.title.split(' ').map(word => word + ' '))
const charRefs = []
const descLines = computed(() => props.desc.split(/\r?\n/).filter(Boolean))
const descLineRefs = []

let tl = null
let doneEmitted = false

onMounted(async () => {
  await nextTick()

  // 初始状态
  gsap.set(charRefs, { opacity: 0, y: 32, rotateX: -55, filter: 'blur(3px)' })
  gsap.set(chNoRef.value, { opacity: 0, y: -18, scale: 0.72, filter: 'blur(3px)' })
  gsap.set(descLineRefs, { opacity: 0, y: 18, filter: 'blur(3px)' })

  const charStagger = Math.min(0.13, 0.6 / Math.max(1, titleChars.value.length))

  tl = gsap.timeline({
    onComplete: () => {
      visible.value = false
    }
  })

  // 1. 章节号浮现
  tl.to(chNoRef.value, {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    duration: 0.85,
    ease: 'power3.out'
  })

  // 2. 标题逐字浮现
  tl.to(charRefs, {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: 'blur(0px)',
    duration: 0.8,
    stagger: charStagger,
    ease: 'power3.out'
  }, '-=0.25')

  // 3. 描述按显式分行依次渐显
  tl.to(descLineRefs, {
    opacity: 0.85,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.9,
    stagger: 0.28,
    ease: 'power2.out'
  }, '-=0.1')

  // 4. 最后一行简介完全显现后，静态停留 2.5 秒。
  tl.to({}, { duration: CHAPTER_INTRO_HOLD_MS / 1000 })

  // 在淡出开始时让正文页同步淡入，形成较慢的交叉转场。
  tl.call(() => {
    if (doneEmitted) return
    doneEmitted = true
    emit('done')
  })

  // 5. 整体消散
  tl.to([chNoRef.value, titleRowRef.value, descRef.value], {
    opacity: 0,
    y: -22,
    filter: 'blur(6px)',
    duration: 1.2,
    stagger: 0.08,
    ease: 'power2.inOut'
  })
  tl.to(overlayRef.value, {
    opacity: 0,
    duration: 1.45,
    ease: 'power2.inOut'
  }, '<')
  tl.to(introRef.value, { opacity: 0, duration: 0.25 }, '-=0.2')
})

onBeforeUnmount(() => {
  if (tl) tl.kill()
})
</script>

<style scoped>
.chapter-intro {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.intro-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(247, 244, 235, 0.98) 0%, rgba(239, 233, 218, 0.99) 60%, rgba(221, 213, 192, 1) 100%);
}

.intro-content {
  position: relative;
  text-align: center;
  z-index: 1;
  padding: 0 2rem;
  max-width: 800px;
}

.intro-ch-no {
  font-family: var(--font-kesong, 'Noto Serif SC', serif);
  font-size: 80px;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--c-gold, #B28F4C);
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;
}

.intro-title-row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.intro-char {
  font-family: var(--font-kesong, 'Noto Serif SC', serif);
  font-size: 100px;
  font-weight: 700;
  color: var(--c-olive, #516D33);
  letter-spacing: 0.15em;
  display: inline-block;
  transform-origin: center bottom;
}

.intro-desc {
  font-family: var(--font-huokai, 'Noto Sans SC', sans-serif);
  font-size: 1rem;
  line-height: 1.9;
  color: #6B5F45;
  max-width: 560px;
  margin: 0 auto;
}

.intro-desc-line {
  display: block;
}

/* 过渡 */
.intro-fade-leave-active {
  transition: opacity 0.6s ease;
}
.intro-fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .intro-ch-no {
    font-size: 80px;
  }
  .intro-char {
    font-size: 100px;
  }
  .intro-desc {
    font-size: 0.9rem;
  }
}
</style>
