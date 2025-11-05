<template>
    <!-- Otter Cursor -->
    <OtterCursor animal="🦦" :speed="0.08"/>

    <!--Back to top -->
    <BackToTop/>

    <!-- Floating animals -->
     <FloatingBackground/>

    <div class="bannerTitles">
      <header class="text-center mb-2">
        <h1>🌿 Support Our Partners 🌿</h1>
        <p> Discover how you can help our cause </p>
      </header>
    </div>
    
    <section class="container my-4">
        <div class="row">
            <div class="donationWrapper">
                <!-- Left Column: Text Content -->
                <div class="mx-auto col-lg-6 helpColumn">
                    <div>
                        <h2 class="helpTitle">Make a Difference<br></h2>

                        <p class="helpDescription">
                            Every year, countless wild animals in Singapore are injured or displaced due to <b>urban
                                development, road accidents, or human-wildlife conflict.</b>
                            <br><br>
                            Your donation will directly support <b>rescues, rehabilitation, and awareness programmes</b>
                            that gives our wildlife a second chance to return to the wild where they belong.
                            <br><br>
                            Together, we can make Singapore a <b>safer home</b> for everyone.
                            Support our mission to connect both the rescue organisation and the public!
                        </p>
                    </div>

                    <!-- Button at bottom left -->
                    <div class="mt-4">
                        <router-link to="/learn-more" class="btn green-btn-lg">
                            More about CritterConnect
                        </router-link>
                    </div>
                </div>

                <!-- Right Column: Carousel -->
                <div class="d-flex justify-content-center col-lg-6">
                    <div class="about-image" style="width: 100%; max-width: 100%;">
                        <div class="carousel-wrapper" @mouseenter="pauseCarousel" @mouseleave="resumeCarousel">
                            <div class="carousel-container" style="overflow: hidden; border-radius: 20px;">
                                <div class="carousel-track">
                                    <div v-for="(slide, index) in carouselImages" :key="index" class="carousel-slide"
                                        :class="{ active: index === currentSlide }">
                                        <img :src="slide.src" :alt="slide.alt" class="carousel-img"
                                            style="width: 100%; height: 100%; object-fit: cover;" />
                                        <div class="image-overlay">
                                            <span class="image-caption">{{ slide.emoji }} {{ slide.caption }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Navigation arrows -->
                                <button class="carousel-btn prev" @click="prevSlide">❮</button>
                                <button class="carousel-btn next" @click="nextSlide">❯</button>

                                <!-- Dots -->
                                <div class="carousel-dots">
                                    <span v-for="(slide, index) in carouselImages" :key="'dot-' + index" class="dot"
                                        :class="{ active: index === currentSlide }" @click="goToSlide(index)"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- your partner cards go here below -->
        <DonatePartners />

        <section class="testimonial-section">
            <div ref="slider" class="testimonial-slider" @mouseenter="pauseAuto" @mouseleave="resumeAuto"
                @touchstart.passive="pauseAuto" @touchend.passive="resumeAuto">
                <div v-for="(testimonial, index) in testimonials" :key="index" class="testimonial-card">
                    <div class="avatar-container">
                        <img :src="testimonial.image" :alt="testimonial.name + ' Avatar'" class="avatar-img" />
                    </div>
                    <h3 class="name">{{ testimonial.name }}</h3>
                    <span class="check-mark">Donated {{ testimonial.amount }}</span>
                    <p class="quote">{{ testimonial.quote }}</p>
                </div>
            </div>
        </section>

        <Impact :goal="50000" :raised="31250" :counters="{ rescues: 168, treatments: 342, training: 890 }" />

    </section>
</template>

<script setup>
import OtterCursor from './OtterCursor.vue';
import '../../pages/css/common.css'
import '../../pages/css/donate.css'
import BackToTop from './BackToTop.vue';
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import DonatePartners from './DonatePartners.vue'
import Impact from './Impact.vue'
import FloatingBackground from './FloatingBackground.vue';
import { getAssetUrl } from '../utils/getAssetUrl.js';


const testimonials = ref([
    {
        name: 'Charlize',
        amount: '$50',
        image: new URL('../public/assets/Charlize.png', import.meta.url).href,
        quote:
            'I love animals and I feel good knowing my contribution directly helps local wildlife!',
    },
    {
        name: 'Amelia Soh',
        amount: '$20',
        image: new URL('../public/assets/Amelia.png', import.meta.url).href,
        quote:
            'A small donation can go a long way. This website makes it simple to support the organisation that helps the local wildlife. Thank you :D',
    },
    {
        name: 'Rui Xuan',
        amount: '$40',
        image: new URL('../public/assets/Ruixuan.png', import.meta.url).href,
        quote:
            "These animals deserve a second chance. I am happy to support Critterconnect's mission and seeing the rescued birds are heartwarming.",
    },
    {
        name: 'Ryan',
        amount: '$30',
        image: new URL('../public/assets/Ryan.png', import.meta.url).href,
        quote:
            "I used to be overwhelmed on what to do when I witness a distress animal. With Critterconnect, I know what to do now!",
    },
    {
        name: 'Haoyue',
        amount: '$60',
        image: new URL('../public/assets/Haoyue.png', import.meta.url).href,
        quote:
            "I reported a case and was glad to be notified of the status of the animal I rescued.",
    },
    {
        name: 'Jessica',
        amount: '$40',
        image: new URL('../public/assets/Jessica.png', import.meta.url).href,
        quote:
            "Critterconnect is amazing and I'm motivated to help out more animals!",
    },
])

const slider = ref(null)
let autoTimer = null
let paused = false

function autoAdvance() {
    const el = slider.value
    if (!el) return
    const card = el.querySelector('.testimonial-card')
    if (!card) return
    const gap = parseFloat(getComputedStyle(el).gap || 0)
    const scrollAmount = card.offsetWidth + gap
    const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - scrollAmount
    const nextLeft = nearEnd ? 0 : el.scrollLeft + scrollAmount
    el.scrollTo({ left: nextLeft, behavior: 'smooth' })
}

function startAuto() {
    autoTimer = setInterval(() => {
        if (!paused) autoAdvance()
    }, 4000)
}
function stopAuto() {
    clearInterval(autoTimer)
    autoTimer = null
}
function pauseAuto() {
    paused = true
}
function resumeAuto() {
    paused = false
}

onMounted(() => startAuto())
onBeforeUnmount(() => stopAuto())


const carouselImages = [
    { src: getAssetUrl('otter.jpg'), alt: 'Otter', caption: "Otters", emoji: '🦦' },
    { src: getAssetUrl('carousel2.jpg'), alt: 'Cat', caption: 'Community Cats', emoji: '🐱' },
    { src: getAssetUrl('carousel3.jpg'), alt: 'Turtle', caption: 'Turtles', emoji: '🐢' },
]

const currentSlide = ref(0);
const isTransitioning = ref(false);
let autoRotateInterval = null;

// ======================== Carousel Controls ========================
function nextSlide() {
    if (isTransitioning.value) return;
    isTransitioning.value = true;
    currentSlide.value = (currentSlide.value + 1) % carouselImages.length;
    setTimeout(() => { isTransitioning.value = false; }, 500);
}

function prevSlide() {
    if (isTransitioning.value) return;
    isTransitioning.value = true;
    currentSlide.value = currentSlide.value === 0 ? carouselImages.length - 1 : currentSlide.value - 1;
    setTimeout(() => { isTransitioning.value = false; }, 500);
}

function goToSlide(index) {
    if (isTransitioning.value) return;
    isTransitioning.value = true;
    currentSlide.value = index;
    setTimeout(() => { isTransitioning.value = false; }, 500);
}


// ======================== Auto-rotate ========================

function startAutoRotate() {
    autoRotateInterval = setInterval(() => {
        nextSlide();
    }, 4000);
}

function pauseCarousel() {
    clearInterval(autoRotateInterval);
}

function resumeCarousel() {
    startAutoRotate();
}

onMounted(() => {
    startAutoRotate();
});

onUnmounted(() => {
    clearInterval(autoRotateInterval);
});
const goToDashboard = () => {
    // If using a router:
    // router.push('/dashboard'); 

    // If using simple state management (e.g., in a single file app):
    // emit('change-page', 'Dashboard'); 

    // If using plain JavaScript for a multi-page site:
    window.location.href = '/home';
    //change later 

    console.log("Navigating to resources...");
};

</script>