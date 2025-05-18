import MainPage from "@/pages/MainPage.vue";
import EventPage from "@/pages/EventPage.vue";
import { createRouter, createWebHistory } from "vue-router";
import LogInPage from "@/pages/LogInPage.vue";
import SignUpPage from "@/pages/SignUpPage.vue";
import FindEmailPage from "@/pages/FindEmailPage.vue";

const routes = [ 
    {path:'/' ,  component : MainPage } ,
    {path:'/event' ,  component : EventPage } ,
    {path: '/login' , component : LogInPage} ,
    {path: '/signup' , component : SignUpPage},
    {path: '/find-email', component : FindEmailPage}
];
const router = createRouter({
    history : createWebHistory() , 
    routes : routes
});

export default router;
