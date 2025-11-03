<template>
  <div v-if="visible" class="overlay" @click.self="close" @keydown.esc.prevent="close" tabindex="-1" ref="overlayRef">
    <div
      class="modal-content"
      ref="modalRef"
      style="position: relative !important; display: block !important; z-index: 10000 !important;"
      role="dialog" aria-modal="true" :aria-label="title"
    >
      <header class="header">
        <h3 class="title">{{ title }}</h3>
        <button class="close" aria-label="Close" @click="close">×</button>
      </header>

      <section class="body">
        <div v-if="warning" class="warning">{{ warning }}</div>

        <form @submit.prevent="submit">
          <div v-for="f in fields" :key="f.key" class="field">
            <label class="label">{{ f.label }} <span v-if="f.required" class="req">*</span></label>

            <textarea
              v-if="f.type === 'textarea'"
              v-model="form[f.key]"
              class="input textarea"
              :placeholder="f.placeholder || ''"
              :rows="f.rows || 3"
              :disabled="submitting"
            />

            <input
              v-else-if="f.type === 'text'"
              v-model="form[f.key]"
              class="input"
              :placeholder="f.placeholder || ''"
              type="text"
              :disabled="submitting"
            />

            <select
              v-else-if="f.type === 'select'"
              v-model="form[f.key]"
              class="input"
              :disabled="submitting"
            >
              <option value="" disabled>Select...</option>
              <option
                v-for="opt in (f.options || [])"
                :key="typeof opt === 'string' ? opt : opt.value"
                :value="typeof opt === 'string' ? opt : opt.value"
              >{{ typeof opt === 'string' ? opt : opt.label }}</option>
            </select>

            <div v-if="errors[f.key]" class="error">{{ errors[f.key] }}</div>
          </div>
        </form>

      </section>

      <div
        style="
          display:flex !important;
          visibility:visible !important;
          opacity:1 !important;
          justify-content:space-between !important;
          padding:24px 0 0 0 !important;
          margin-top:24px !important;
          border-top:1px solid #eee !important;
          gap:12px !important;
          background:#ffffff !important;
        "
      >
        <button
          type="button"
          @click="close"
          :disabled="submitting"
          style="
            display:inline-block !important;
            visibility:visible !important;
            padding:12px 24px !important;
            background:#f0f0f0 !important;
            border:1px solid #ddd !important;
            border-radius:6px !important;
            cursor:pointer !important;
            color:#333 !important;
          "
        >
          {{ cancelText }}
        </button>

        <button
          type="button"
          @click="submit"
          :disabled="!isFormValid || submitting"
          style="
            display:inline-block !important;
            visibility:visible !important;
            padding:12px 32px !important;
            background:#5a7a5a !important;
            color:#ffffff !important;
            border:none !important;
            border-radius:6px !important;
            font-weight:500 !important;
            cursor:pointer !important;
          "
        >
          <span v-if="submitting" class="spinner"></span>
          {{ submitting ? 'Submitting...' : confirmText }}
        </button>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { reactive, watch, toRefs, ref, nextTick, onMounted } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  fields: { type: Array, default: () => [] },
  warning: { type: String, default: '' },
  confirmText: { type: String, default: 'Submit' },
  cancelText: { type: String, default: 'Cancel' },
  submitting: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'close'])

const form = reactive({})
const errors = reactive({})
const isFormValid = ref(false)
const overlayRef = ref(null)
const modalRef = ref(null)

watch(() => props.visible, (v) => {
  if (v) {
    resetForm()
    nextTick(() => {
      const el = modalRef.value?.querySelector('textarea, input, select, button')
      el?.focus?.()
    })
  }
})

watch(() => props.fields, () => {
  if (props.visible) {
    resetForm()
  }
}, { deep: true })

watch(() => form, () => {
  validate()
}, { deep: true })

function resetForm(){
  Object.keys(form).forEach(k => delete form[k])
  Object.keys(errors).forEach(k => delete errors[k])
  for (const f of props.fields){
    form[f.key] = f.default ?? ''
  }
  validate()
}

function validate(){
  let ok = true
  for (const f of props.fields){
    const value = String(form[f.key] ?? '').trim()
    if (f.required && !value){
      errors[f.key] = 'Required'
      ok = false
    } else {
      delete errors[f.key]
    }
  }
  isFormValid.value = ok
  return ok
}

function submit(){
  if (!validate()) return
  emit('submit', { ...form })
}

function close(){
  emit('close')
}

onMounted(() => {})
</script>

<style scoped>
.overlay{ position: fixed; inset:0; background: rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999 !important; }
.modal-content{ background:#fff; width:min(560px, 92vw); max-width:90%; max-height:90vh; overflow-y:auto; border-radius:12px; border:1px solid #ddd; padding:30px; box-shadow:0 20px 40px rgba(0,0,0,0.2); animation:pop .16s ease-out; }
.header{ padding:0 0 16px 0; border-bottom:1px solid #eef3ee; background:#ffffff; display:flex; align-items:center; gap:8px; position:sticky; top:0; }
.title{ margin:0; color:#285436; font-size:24px; font-weight:600; }
.close{ background:transparent; border:none; color:#285436; font-size:24px; cursor:pointer; margin-left:auto; }
.body{ padding:20px 0 0 0; }
.warning{ background:#fff7ed; color:#9a3412; border:1px solid #fed7aa; padding:10px 12px; border-radius:8px; margin-bottom:12px; font-weight:600; }
.field{ display:flex; flex-direction:column; gap:8px; margin-bottom:20px; }
.label{ font-weight:600; color:#285436; font-size:14px; }
.req{ color:#dc2626; margin-left:4px; }
.input{ border:1px solid #ddd; border-radius:6px; padding:12px; font-size:15px; outline:none; transition: border-color .15s ease, box-shadow .15s ease; }
.input:focus{ border-color:#5a7a5a; box-shadow:0 0 0 3px rgba(90,122,90,0.25); }
.textarea{ resize:vertical; min-height:100px; }
.error{ color:#dc2626; font-size:12px; }
.modal-footer{ display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:24px; padding-top:24px; border-top:1px solid #eee; }
.btn{ padding:12px 20px; border-radius:8px; cursor:pointer; font-weight:600; border:1px solid transparent; font-size:15px; transition: background-color .2s ease, border-color .2s ease; }
.btn.submit{ background:#5a7a5a; color:#FEFAE0; border-color:#5a7a5a; }
.btn.submit:hover:not(:disabled){ background:#4a6a4a; border-color:#4a6a4a; }
.btn.cancel{ background:#ccc; color:#333; border-color:#ccc; }
.btn.cancel:hover:not(:disabled){ background:#bbb; border-color:#bbb; }
.btn[disabled]{ background:#ccc !important; color:#999 !important; border-color:#ccc !important; opacity:0.6; cursor:not-allowed; }
.spinner{ width:14px; height:14px; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; display:inline-block; margin-right:6px; animation:spin .7s linear infinite; }
@keyframes spin{ to { transform: rotate(360deg);} }
@keyframes pop{ from { transform: scale(.98); opacity:.6 } to { transform: scale(1); opacity:1 } }
</style>


