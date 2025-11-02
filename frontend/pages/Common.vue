<!-- Delete Before Submission, can put in slides if you want -->

<!-- COLOUR GUIDELINES 
 GREEN : #285436
 WHITE YELLOW: rgb(254, 250, 224)
--> 

<script>
//import '../pages/css/common.css'
</script>

<template>
    <div class = "banner">
        <p class="banner-titles"> These are words with banners (usually title) </p>
    </div>

    <div class = "button-styles">
        <button class = "btn green-btn-lg"> Green Filled Large Button </button>
        <button class = "btn unfilled-btn-lg"> Unfilled Large Button </button>
        <br>
        <button class = "btn linear-btn"> Linear Button </button>
        <button class = "btn brown-btn"> Brown buttons </button>
        <p class = "hello-need-to-say-smth"> If your buttons are different, please use the 'Learn More' button convention in guidebook.css</p>
        <br>
        ------------------------------------------ Word section ------------------------------------------------------------------------------------
    </div>

    <div class = "word-styles">
        <p class = "words titles">Titles should be 48px, 600 font weight</p>
        <p class = "words subtitles"> Subtitles should be 30px, 400 font weight </p>
        <p class = "words anyotherwords"> Any other words should be between 18-20px</p>
        <p class = "words wordshadows"> These are words with shadows </p>
        <br>
    </div>
        -------------------------------------------CARDS---------------------------------------------------------------------------------------------


    <section class="about-section">
      <div class="container">
        <div class="about-card">
          <div class="about-content">
            <div class="about-text">
              <h2 class="section-title">Some notes</h2>
             
              <p class="about-description">
                If you feel your thing <br>
                look kind of ugly <br>
                just put it in this <br>
                Put your carousel next to words here <br>
                Looks good, if not sure, check Home.vue 
              </p>


            </div>
                </div>
              </div>
            </div>
    </section>
    <!-- Standardising naming conventions 
     CAMEL CASE: helloAllThisIsCamelCase
     Please name all your classes and all in camel casing, change it please
    -->

    <!-- If you want to use otter cursor:
        1. Import OtterCursor in your .vue script
        2. in template add this <OtterCursor animal="🦦" :speed="0.08"/>
    -->

    <!-- MAKE Floating Animals BG
        1. Create this in template
        <div class="home-wrapper">
             <FloatingBackground />
        </div>

        2. import FloatingBackground
        3. export default components: FloatingBackground
    -->

    <!-- Back To Top button 
      1. Import BackToTop from BackToTop.vue
      2. Call this in template <BackToTop/>
      3. add this in components: BackToTop
    -->


</template>

<style scoped>
/* Colour palette
#606C38; Lighter GREEN
#285436; Dark GREEN
rgb(254, 250, 224); WHITE YELLOW
#DDA15E; light brown
#BC6C25; Darker brown
*/

.banner-titles{
    background-color: #285436;
    text-align: center;
    font-size: 48px;
    font-weight: 600;
    color:rgb(254, 250, 224);
    text-shadow: 2px 2px 5px rgb(254, 250, 224);
    padding: 20px;
}
/* MUST FOLLOW Common Button STYLE */
.btn {
    padding: 16px 32px;
    border-radius: 15px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    margin: 12px 12px; /*use margin to change positioning of button (only if need) */
}

/* Green Filled button & HOVER */
.green-btn-lg {
    padding: 16px 32px;
    border-radius: 15px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    background-color: #285436;
    color: rgb(254, 250, 224);
    border: 1px solid #285436;
    min-width: 250px; /*if you have two buttons you want same length, add this */
}

.green-btn-lg:hover {
    background: #606C38;
    color: #fff;
    border: 1px solid #285436;
}

/* Unfilled Button & HOVER */
.unfilled-btn-lg {
    padding: 16px 32px;
    border-radius: 15px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #285436;
    color: #285436;
    background-color: rgb(254, 250, 224);
    min-width: 250px; /* add if you hv 2 buttons uw same size */
}

.unfilled-btn-lg:hover {
    background: #606C38;/*linear-gradient(135deg, #10b981 0%, #059669 100%);*/
    color: #fff;
    border: 1px solid #285436;
}

/* I need to say something */
.hello-need-to-say-smth {
    color:red;
    font-size: 20px;
    font-weight: 600;
}

/* Linear Btn & HOVER */
.linear-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #fff;
}

.linear-btn:hover {
    background: linear-gradient(135deg, #10b981 30%, #059669 70%);
    color: white;
}

/* Brown btn & hover */
.brown-btn {
    background-color: #BC6C25;
    color: rgb(254, 250, 224);
}

.brown-btn:hover {
    background-color: #DDA15E;
}

.words {
    font-family: Georgia, 'Times New Roman', Times, serif;
}

.titles {
    font-size: 48px;
    font-weight: 600;
}

.subtitles {
    font-size: 30px;
    font-weight: 400;
}

.anyotherwords {
    font-size: 20px;
}

.wordshadows {
    font-size: 40px;
    font-weight: 600;
    color:#285436;
    text-shadow: 0 4px 20px rgba(11, 155, 23, 0.3);
}

</style>