<template>
    <OtterCursor animal="🦦" :speed="0.08"/>
    <div id="topBanner">
      <header class="text-center mb-2">
        <h1>Donate</h1>
        <p>To Our Partners 💌</p>
      </header>
    </div>
    <div>
        <section class="container my-4">
            <div class="row">

                <!-- <DonateCarousel :slides="slides" id="donateHero" /> -->
                <!-- Carousel inside About Image -->
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

                <div class="mx-auto col-lg-6">
                    <h2 class="fw-bold text-center text-success mt-4">Why Should You Help?</h2>

                    <p>
                        Every year, countless wild animals in Singapore are injured or displaced due to <b>urban
                            development, road accidents, or human-wildlife conflict.</b>
                    </p>

                    <!-- <div class="text-center-custom mb-3 px-4">
                        <button type="button" class="custom-collapse-btn" @click="toggleCollapse">
                            {{ isContentVisible ? 'Show Less' : 'Learn More' }}
                        </button>
                    </div> -->

                    <!-- <div class="collapse-content" :class="{ 'visible': isContentVisible }"> -->

                    <p>
                        Your donation will directly support <b>rescues, rehabilitation, and awareness programmes</b>
                        that gives our wildlife a second chance to return to the wild where they belong.
                    </p>
                    <p>
                        Together, we can make Singapore a <b>safer home</b> for everyone.
                        Support our mission to connect both the rescue organisation and the public!
                    </p>
                </div>

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

                <!-- <button link> -->
                <div class="text-center-custom mb-3 px-4">
                    <!-- Changed type from 'button' to 'a' or kept as 'button' for Vue navigation -->
                    <router-link to="/learn-more" class="btn custom-collapse-btn">
                        Learn More?
                    </router-link>
                </div>
            </div>

            <!-- your partner cards go here below -->
            <DonatePartners />
            <Impact :goal="50000" :raised="31250" :counters="{ rescues: 168, treatments: 342, training: 890 }" />
        </section>


    </div>
    <!-- <Footer :emergency="{
        title: 'Emergency / Life Threatening?',
        primaryLabel: 'Police',
        primaryNumber: '999',
        secondaryLabel: 'Ambulance/Fire',
        secondaryNumber: '995',
        wildlifeLabel: 'Wildlife Hotline',
        wildlifeNumber: '' // put your partner hotline here if applicable
        }" :contact="{
            email: 'contact@critterconnect.org',
            phone: '+65 6201 1026',
            address: '123 Green Street, Singapore',
            hours: 'Mon–Sun, 9am–6pm'
            }" :socials="{
                instagram: 'https://instagram.com/yourhandle',
                facebook: 'https://facebook.com/yourpage',
                tiktok: 'https://tiktok.com/yourpage'
                
                }" /> -->
    <!-- <Footer /> -->

</template>

<script setup>
import OtterCursor from './OtterCursor.vue';
import '../../pages/css/common.css'

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

import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import DonatePartners from './DonatePartners.vue'
// import Common from './Common.vue'
// import Footer from './Footer.vue'
import Impact from './Impact.vue'
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
    { src: '../src/public/assets/carousel1.png', alt: 'Otter', caption: "Otters", emoji: '🦦' },
    { src: '../src/public/assets/carousel2.jpg', alt: 'Cat', caption: 'Community Cats', emoji: '🐱' },
    { src: '../src/public/assets/carousel3.jpg', alt: 'Turtle', caption: 'Turtles', emoji: '🐢' },
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

<style>
.carousel-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.carousel-wrapper,
.carousel-container {
    position: relative;
    overflow: hidden;
    border-radius: 20px;
    width: 100%;
    object-fit: cover;
}

.about-image {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
}

/* Inside your <style scoped> block */
.collapse-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.5s ease-in-out;
}

.collapse-content.visible {
    max-height: 700px;
    /* Needs to be larger than the content */
}

/* Replace the existing .custom-collapse-btn styles with these */
.custom-collapse-btn {
    /* Color Properties (Matching your image) */
    background-color: #5a511e;
    /* Light tan/khaki background */
    color: #ffffff;
    /* Darker olive text color */

    /* Shape and Sizing */
    border: none;
    padding: 15px 30px;
    /* Increased horizontal padding for the pill shape */
    font-size: 1.25rem;
    font-weight: bold;
    border-radius: 50px;
    /* Large border-radius creates the pill shape */

    /* Interaction & Display */
    cursor: pointer;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
    display: inline-block;
}

.custom-collapse-btn:hover {
    background-color: #d1ccb0;
    /* Slightly darker background on hover */
    /* Optional: Add a subtle shadow on hover */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* --- 1. SLIDER CONTAINER (The Scrolling Viewport) --- */
.testimonial-slider {
    /* Enables horizontal scrolling and hides scrollbar */
    display: flex;
    overflow-x: scroll;
    padding: 50px 0;
    /* Vertical padding */
    gap: 20px;
    /* Space between cards */

    /* Scroll Snap Properties: Essential for the "slide" effect */
    scroll-snap-type: x mandatory;
    /* Forces scroll to stop only on snap points */
    -webkit-overflow-scrolling: touch;
    /* Better scrolling on iOS */
    scroll-behavior: smooth;
}

.testimonial-slider {
    display: flex;
    overflow-x: auto;
    gap: 20px;
    padding: 50px 0;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    /* smooth snapping */
}



/* Hide Scrollbar (Optional, but common for sliders) */
.testimonial-slider::-webkit-scrollbar {
    display: none;
}

.testimonial-slider {
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}

/* --- 2. INDIVIDUAL CARDS --- */
.testimonial-card {
    /* Define size and prevent shrinking */
    flex: 0 0 80vw;
    /* Take 80% of the viewport width */
    max-width: 350px;
    /* Maximum width for larger screens */
    height: auto;
    /* Example fixed height */

    /* Styling to match the image */
    background-color: #fcfcfc;
    /* Very light, off-white background */
    border-radius: 20px;
    /* Rounded corners */
    padding: 30px;

    /* Snap point: Locks the card to the start of the viewport when scrolling stops */
    scroll-snap-align: center;

    /* Shadow/Subtle Border (Based on the image) */
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);

    text-align: center;
    transition: transform 0.3s ease;
}

/* --- 3. CENTERED CARD STYLES --- */
.centered-card {
    /* Specific styles for the card in the middle of the view */
    background-color: #fefefe;
    /* Slightly whiter background for contrast */
}

/* Avatar and Text Styling */
.avatar-container {
    padding-bottom: 10px;
}

.avatar-img {
    width: 60px;
    height: 60px;
    border-radius: 10px;
    /* Rounded square corners */
    object-fit: cover;
    margin-bottom: 10px;
}

.name {
    font-size: 1.2em;
    font-weight: 600;
    margin: 5px 0 5px 0;
}

.check-mark {
    color: #6d6943;
    /* Similar olive tone from the button image */
    font-size: 1.5em;
    display: block;
    margin-bottom: 15px;
}

.quote {
    font-size: 1em;
    line-height: 1.5;
    color: #333;
}
</style>
