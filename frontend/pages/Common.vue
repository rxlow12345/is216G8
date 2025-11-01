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
        <button class = "green-btn-lg"> Green Filled Button </button>
        <button class = "unfilled-btn-lg"> Unfilled Button </button>
    </div>
</template>

<style scoped>
.button-styles {
    gap: 20px;
}

/* MUST FOLLOW Common Button STYLE */
.button-styles {
    padding: 16px 32px;
    border-radius: 15px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
}

/* Green Filled button & HOVER */
.button-styles .green-btn-lg {
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

.button-styles .green-btn-lg:hover {
    background-color: rgb(254, 250, 224);
    color: #285436;
    border: 1px solid #285436;
}

/* Unfilled Button & HOVER */
.button-styles .unfilled-btn-lg {
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

.button-styles .unfilled-btn-lg:hover {
    background-color: #285436;
    color: rgb(254, 250, 224);
    border: none;
}
</style>