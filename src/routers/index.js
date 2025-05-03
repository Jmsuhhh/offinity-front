import MainPage from "@/pages/MainPage.vue";
import EventPage from "@/pages/EventPage.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [ 
    {path:'/' ,  component : MainPage } ,
    {path:'/event' ,  component : EventPage } ,
];
const router = createRouter({
    history : createWebHistory() , 
    routes : routes
});

export default router;
