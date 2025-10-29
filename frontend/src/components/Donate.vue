<script setup>
import DonatePartners from './DonatePartners.vue'
import DonateCarousel from './DonateCarousel.vue'
// import Common from './Common.vue'
import Footer from './Footer.vue'
import Impact from './Impact.vue'

// If images are in public
let slide1 = '../src/public/assets/carousel1.png' 
let slide2 = '../src/public/assets/carousel2.jpg'
let slide3 = '../src/public/assets/carousel3.jpg'

const slides = [slide1, slide2, slide3]
</script>

<template>
        <div id="topBanner">
      <header class="text-center mb-2">
        <h1> Donate to Our Partners </h1>
      </header>
    </div>
    <div>
        <section class="container my-4">
            <DonateCarousel :slides="slides" id="donateHero" />
            <div class="mx-auto px-3">
                <h2 class="fw-bold text-success mt-4">About The Campaigns</h2>
          <p>
                    Every year, countless wild animals in Singapore are injured or displaced due to <b>urban
                        development,
                        road accidents, or human-wildlife conflict.</b>
                </p>

                <p>
                    Your donation will directly support <b>rescues, rehabilitation, and awareness programmes</b> that
                    gives our wildlife a second chance to return to the wild where they belong.
                </p>

                <p>
                    Together, we can make Singapore a <b>safer home</b> for everyone.
                </p>
            </div>
            <!-- your partner cards go here below -->
            <Impact
          :goal="50000"
          :raised="31250"
          :counters="{ rescues: 168, treatments: 342, training: 890 }"
        />
            <DonatePartners />
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
    <Footer />

</template>

