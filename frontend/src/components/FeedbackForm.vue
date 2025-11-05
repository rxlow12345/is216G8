<template>
  <section class="feedback-card card shadow-sm">
    <div class="card-body">
      <!-- <h5 class="card-title mb-3">Send us feedback or a question</h5> -->

      <form @submit.prevent="submitForm" novalidate>
        <!-- Type -->
        <div class="mb-3">
          <label class="form-label">Type</label>
          <select v-model="form.type" class="form-select" required>
            <option value="feedback">Feedback</option>
            <option value="question">Question</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Subject (optional)</label>
          <input
            v-model.trim="form.subject"
            type="text"
            class="form-control"
            placeholder="Short summary"
            maxlength="120"
          />
        </div>

        <!-- Email handling -->
        <div class="mb-3" v-if="!auth.uid">
          <label class="form-label">Your email</label>
          <input
            v-model.trim="form.email"
            type="email"
            class="form-control"
            placeholder="name@example.com"
            required
          />
          <div class="form-text">We’ll use this to get back to you.</div>
        </div>
        <div class="mb-2 d-flex align-items-center gap-2" v-else>
          <span class="badge bg-success">Logged in</span>
          <span class="text-muted small">Submitting as {{ auth.email }}</span>
        </div>

        <!-- Message -->
        <div class="mb-3">
          <label class="form-label">Message (Length ≥ 10 characters)</label>
          <textarea
            v-model.trim="form.message"
            class="form-control"
            rows="5"
            placeholder="Tell us more…"
            required
            minlength="10"
            maxlength="2000"
          ></textarea>
          <div class="form-text">{{ form.message.length }}/2000</div>
        </div>

        <!-- Submit -->
        <div class="d-flex align-items-center gap-3">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="submitting || !isValid"
          >
            <span v-if="!submitting">Send</span>
            <span v-else class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-if="submitting" class="ms-2">Sending…</span>
          </button>

          <span v-if="sent" class="text-success">Thanks! We’ve received your {{ form.type }}.</span>
          <span v-if="error" class="text-danger">{{ error }}</span>
        </div>
      </form>
    </div>
  </section>
</template>

<script>
// Uses your existing auth helpers
import { getCurrentUser, onAuthStateChange } from '../api/auth.js';

// Firestore
// Adjust the import path if your firebase export lives elsewhere.
import { db } from '../firebase.js'; // <-- make sure this exports a Firestore instance
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import '../../pages/css/common.css'

export default {
  name: 'FeedbackForm',
  data() {
    return {
      auth: { uid: null, email: null, role: null, username: null },
      form: {
        type: 'feedback',
        subject: '',
        email: '',
        message: '',
      },
      submitting: false,
      sent: false,
      error: '',
    };
  },
  computed: {
    isValid() {
      const hasMessage = this.form.message && this.form.message.length >= 10;
      const hasEmail = this.auth.uid ? true : this.validEmail(this.form.email);
      return hasMessage && hasEmail && !!this.form.type;
    },
  },
  methods: {
    validEmail(val) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val || '');
    },
    async primeAuth() {
      try {
        const user = await getCurrentUser();
        if (user) {
          this.auth = { ...this.auth, ...user };
        }
      } catch (e) {
        // non-fatal
        console.error('auth fetch failed', e);
      }
      // live updates
      onAuthStateChange(async (user) => {
        if (user) {
          const fresh = await getCurrentUser().catch(() => null);
          this.auth = fresh || { uid: user.uid, email: user.email };
        } else {
          this.auth = { uid: null, email: null, role: null, username: null };
        }
      });
    },
    async submitForm() {
      this.error = '';
      this.sent = false;

      if (!this.isValid) {
        this.error = 'Please fill out the required fields.';
        return;
      }

      const payload = {
        type: this.form.type,                                 // 'feedback' | 'question'
        subject: this.form.subject || null,
        message: this.form.message,
        email: this.auth.uid ? this.auth.email : this.form.email,
        uid: this.auth.uid || null,
        route: this.$route?.fullPath || null,
        userAgent: navigator.userAgent,
        createdAt: serverTimestamp(),
      };

      this.submitting = true;
      try {
        await addDoc(collection(db, 'feedback'), payload);
        this.sent = true;
        // Reset message & subject; keep email so they can send more quickly
        this.form.subject = '';
        this.form.message = '';
      } catch (e) {
        console.error(e);
        this.error = 'Failed to send. Please try again.';
      } finally {
        this.submitting = false;
      }
    },
  },
  created() {
    this.primeAuth();
  },
};
</script>

<style scoped>
.feedback-card {
  width: 100%;
  margin: 0;
  border: none;
  box-shadow: 0 0.25rem 0.75rem rgba(0,0,0,0.05);
  border-radius: 1rem;
}
</style>
