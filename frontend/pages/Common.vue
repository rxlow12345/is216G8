<!-- Delete Before Submission, can put in slides if you want -->

<!-- COLOUR GUIDELINES 
 GREEN : #285436
 WHITE YELLOW: rgb(254, 250, 224)
--> 

<script>
//import '../pages/css/common.css'
</script>

<template>
    <div class = "button-styles">
        <button class = "btn green-btn-lg"> Green Filled Large Button </button>
        <button class = "btn unfilled-btn-lg"> Unfilled Large Button </button>
        <br>
        <button class = "btn linear-btn"> Linear Button </button>
        <p class = "hello-need-to-say-smth"> If your buttons are different, please use the 'Learn More' button convention in guidebook.css</p>
        <br>
        ------------------------------------------ Word section ------------------------------------------------------------------------------------
    </div>

    <div class = "word-styles">
        <p class = "words titles">Titles should be 40px, 600 font weight</p>
        <p class = "words subtitles"> Subtitles should be 26px, 400 font weight </p>
        <p class = "words anyotherwords"> Any other words should be between 18-20px</p>
        <p class = "words wordshadows"></p>
    </div>
    <!-- Standardising naming conventions 
     CAMEL CASE: helloAllThisIsCamelCase
     Please name all your classes and all in camel casing, change it please
    -->

    <!-- If you want to use otter cursor:
        1. Import OtterCursor in your .vue script
        2. in template add this <OtterCursor animal="🦦" :speed="0.08"/>
    -->

    <!-- MAKE MOVING BG-->


</template>

<style scoped>
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
    border: none;
    min-width: 250px; /*if you have two buttons you want same length, add this */
}

.green-btn-lg:hover {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);;
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
    border: 2px solid #285436;
    color: #285436;
    background-color: rgb(254, 250, 224);
    min-width: 250px; /* add if you hv 2 buttons uw same size */
}

.unfilled-btn-lg:hover {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);;
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
    background: rgb(254, 250, 224);
    color: #285436;
    border: 2px solid #285436;
}

.words {
    font-family: Georgia, 'Times New Roman', Times, serif;
}

.titles {
    font-size: 40px;
    font-weight: 600;
}

.subtitles {
    font-size: 26px;
    font-weight: 400;
}

.anyotherwords {
    font-size: 18px;
}

</style>