import MainPage from "@/pages/MainPage.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [ 
    {path:'/' ,  component : MainPage } ,
];
const router = createRouter({
    history : createWebHistory() , 
    routes : routes
});

export default router;
