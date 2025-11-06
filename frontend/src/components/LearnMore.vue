<template>
    <FloatingBackground/>
    <OtterCursor animal="🦦" :speed="0.08" />
    <div class="bannerTitles">
        <header class="text-center mb-2">
            <h1>📝 Resources 📝</h1>
            <p> Learn More about CritterConnect</p>
        </header>
    </div>
    <div>
        <!-- Latest News Section -->
        <section class="py-5">
            <div class="container">
                <h2 class="textHeader fw-bold text-center mb-4">News & Updates</h2>
                <div class="row g-4">
                    <div class="col-md-6 col-lg-4" v-for="news in latestNews" :key="news.id">
                        <div class="card h-100 border-0 shadow-sm rounded-4">
                            <img :src="news.image" class="card-img-top" :alt="news.title"
                                style="height: 200px; object-fit: cover;">
                            <div class="card-body">
                                <span class="badge bg-success mb-2">{{ news.category }}</span>
                                <h5 class="card-title fw-bold">{{ news.title }}</h5>
                                <p class="card-text text-muted">{{ news.excerpt }}</p>
                                <p class="text-muted">{{ news.date }}</p>
                                <div class="mt-auto">
                                    <a :href="news.link" target="_blank" class="btn custom-collapse-btn">
                                        Read More →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- FAQ + Feedback in a single card -->
        <section class="container my-5">
            <!-- Header -->
            <h2 class="textHeader fw-bold text-center mb-4">
                Got Questions or Feedback? We’re Here to Help!
            </h2>
            <div class="card border-0 shadow-sm rounded-4 p-4">

                <div class="row g-5">
                    <!-- FAQ Section -->
                    <div class="col-12 col-lg-7">
                        <h4 class="fw-bold mb-4">Frequently Asked Questions</h4>

                        <div class="accordion" id="faqAccordion">
                            <div class="accordion-item" v-for="(faq, index) in faqs" :key="index">
                                <h2 class="accordion-header">
                                    <button class="accordion-button" :class="{ collapsed: index !== 0 }" type="button"
                                        data-bs-toggle="collapse" :data-bs-target="`#faq${index}`"
                                        :aria-expanded="index === 0 ? 'true' : 'false'">
                                        {{ faq.question }}
                                    </button>
                                </h2>
                                <div :id="`faq${index}`" class="accordion-collapse collapse"
                                    :class="{ show: index === 0 }" data-bs-parent="#faqAccordion">
                                    <div class="accordion-body">
                                        {{ faq.answer }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Feedback Form -->
                    <div class="col-12 col-lg-5">
                        <h4 class="fw-bold mb-4">Send Us Feedback</h4>
                        <FeedbackForm />
                    </div>
                </div>
            </div>
        </section>



        <!-- Contact Section -->
        <section class="container my-5">

            <h2 class="textHeader fw-bold text-center mb-4">Get In Touch</h2>
            <!-- Contact Info -->

            <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
                <div class="row g-4">
                    <h4 class="fw-bold mb-4">📍 Visit Us</h4>

                    <div class="mb-4 col-12 col-sm-6">
                        <h6 class="fw-bold text-success">Address</h6>
                        <p class="mb-1">CritterConnect Wildlife Rescue Centre</p>
                        <p class="mb-1">123 Wildlife Drive, Singapore 456789</p>
                        <p class="text-muted small">Open: Mon-Fri, 9AM - 6PM</p>
                    </div>

                    <div class="mb-4 col-12 col-sm-6">
                        <h6 class="fw-bold text-success">Emergency Hotline</h6>
                        <p class="mb-1">
                            <a href="tel:1800123456" class="text-decoration-none text-dark">
                                📞 1800-123-WILD (9453)
                            </a>
                        </p>
                        <p class="text-muted small">24/7 for wildlife emergencies</p>
                    </div>

                    <div class="mb-4 col-12 col-sm-6">
                        <h6 class="fw-bold text-success">General Inquiries</h6>
                        <p class="mb-1">
                            <a href="tel:+6512345678" class="text-decoration-none text-dark">
                                📱 +65 1234 5678
                            </a>
                        </p>
                        <p class="mb-4 ">
                            <a href="mailto:info@critterconnect.sg" class="text-decoration-none text-dark">
                                ✉️ info@critterconnect.sg
                            </a>
                        </p>
                    </div>

                    <div class="mb-4 col-12 col-sm-6">
                        <h6 class="fw-bold text-success mb-3">Follow Us</h6>
                        <div class="d-flex flex-wrap gap-3">
                            <a href="https://facebook.com/facebook" target="_blank" class="social-link">
                                <div class="social-icon">
                                    <img :src="facebookIcon" alt="Facebook">
                                </div>
                            </a>
                            <a href="https://instagram.com/instagram" target="_blank" class="social-link">
                                <div class="social-icon">
                                    <img :src="instagramIcon" alt="Instagram">
                                </div>
                            </a>
                            <a href="https://x.com/x" target="_blank" class="social-link">
                                <div class="social-icon">
                                    <img :src="twitterIcon" alt="Twitter/X">
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section text-white text-center py-3">
            <div class="container">
                <h3 class="textSub fw-bold mb-3">Ready to Make a Difference?</h3>
                <p class="textSub lead mb-4">Join us in protecting Singapore's precious wildlife</p>
                <div class="d-flex gap-3 justify-content-center flex-wrap">
                    <a href="/donate" class="btn linear-btn custom-linear-btn">Donate Now</a>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import OtterCursor from './OtterCursor.vue';
import FeedbackForm from './FeedbackForm.vue';
import '../../pages/css/common.css'
import FloatingBackground from './FloatingBackground.vue';
import facebookIcon from '../public/assets/facebook.png';
import instagramIcon from '../public/assets/instagram.png';
import twitterIcon from '../public/assets/twitter.png';


const faqs = ref([
    {
        question: "How are donations used?",
        answer: "Donations fund everything from emergency medical supplies and specialized food to habitat restoration and community education programs."
    },
    {
        question: "Can I volunteer at CritterConnect?",
        answer: "Yes! We welcome volunteers for various roles including animal care, education programs, and administrative support. Visit our Volunteer page or email volunteer@critterconnect.sg to learn more about opportunities."
    },
    {
        question: "What animals does CritterConnect rescue?",
        answer: "We rescue all native Singapore wildlife including birds, mammals, reptiles, and amphibians. Common rescues include monitor lizards, pythons, civets, otters, hornbills, and more."
    },
    {
        question: "How can I report wildlife sightings?",
        answer: "You can report sightings through our website. For emergency sightings, call  1800-123-WILD (9453) with the location and incident details."
    },
    {
        question: "Does CritterConnect accept donations of supplies?",
        answer: "Yes! We accept donations of medical supplies, animal food, and equipment. Please contact us at donations@critterconnect.sg for our current needs list before dropping off items."
    }
])

const latestNews = ref([
    {
        id: 1,
        title: "Acres hopes to send 30 endangered freshwater turtles back to Indonesia",
        excerpt: "Wildlife rescue group Acres is looking to send 30 endangered pig-nosed turtles, seized from the wildlife trade in Singapore, back to Indonesia in January 2026, The Straits Times has learnt.",
        image: "https://cassette.sphdigital.com.sg/image/straitstimes/f900ec197bd9ab3dd337fe87101565427ae86f24642771c68fe2b6ae8e0738fd?w=900",
        category: "Conservation",
        date: "Aug 16, 2025",
        link: "https://www.straitstimes.com/singapore/environment/wildlife-rescue-group-acres-hopes-to-send-30-endangered-freshwater-turtles-back-to-indonesia"
    },
    {
        id: 2,
        title: "New Wildlife Education Program Launched",
        excerpt: "SINGAPORE- Starting in June, children aged three to 12 will meet animals up close and develop life skills through a new programme at Mandai Wildlife Reserve aimed at fostering a deeper appreciation for nature.",
        image: "https://cassette.sphdigital.com.sg/image/straitstimes/b547f17658828c3b76abc5df9e3b213428027c60f9d3c0680f178ac0fad96d00?w=900",
        category: "Education",
        date: "May 16, 2025",
        link: "https://www.straitstimes.com/singapore/animal-interactions-and-outdoor-adventure-camps-new-zooschool-for-children-opens-in-june-2025"
    },
    {
        id: 3,
        title: "Animal interactions and outdoor adventure camps",
        excerpt: "Acres rescues baby sambar deer in S'pore, reunites it with its family after 2 days. The fawn was rescued after it was found in the drain by a member of volunteer wildlife rescue group Acres on the evening of August 27.",
        image: "https://cassette.sphdigital.com.sg/image/straitstimes/088065472505b302d0ee1d509d02c8914a1a67d68b8b2dbdb2b5f3d89cddb36a?w=900",
        category: "Success Story",
        date: "Aug 29, 2025",
        link: "https://www.straitstimes.com/singapore/baby-sambar-deer-rescued-from-drain-and-reunited-with-herd-after-two-day-search"
    }
])
</script>

<style scoped>
.textHeader {
    font-size: 40px;
    font-weight: 600;
    color:#285436;
    text-shadow: 0 4px 20px rgba(11, 155, 23, 0.3);
}

.textSub {
    color: rgb(254, 250, 224);
}

.custom-linear-btn {
    padding-left:100px;
    padding-right:100px;
}

.cta-section {
    background: #064301;
    /* fallback */
}

.accordion-button {
    font-weight: 600;
    background-color: #f8f9fa;
}

.accordion-button:not(.collapsed) {
    background-color: #d4edda;
    color: #155724;
}

.accordion-button:focus {
    box-shadow: none;
    border-color: #5a7c5e;
}

.card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-body {
    display: flex;
    flex-direction: column;
}

.card-body .mt-auto {
    margin-top: auto;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
}

.social-link {
    text-decoration: none;
}

.social-icon img{
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    transition: all 0.3s ease;
}

.social-icon:hover {
    background-color: #5a7c5e;
    transform: scale(1.1);
}

.badge {
    font-size: 0.75rem;
    padding: 0.35rem 0.65rem;
}

@media (max-width: 768px) {
    .hero-section {
        border-radius: 0 0 20px 20px;
    }

    .cta-section {
        border-radius: 20px 20px 0 0;
    }
}

@media (max-width: 576px) {
  .social-icon {
    width: 35px;
    height: 35px;
    font-size: 1.3rem;
  }
}


.custom-collapse-btn {
    background-color: #285436;
    color: rgb(254, 250, 224);
    border: none;
    padding: 16px 32px;
    font-size: 1rem;
    font-weight: bold;
    border-radius: 50px;
    cursor: pointer;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
    display: inline-block;
}

.custom-collapse-btn:hover {
    background-color: #d1ccb0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
