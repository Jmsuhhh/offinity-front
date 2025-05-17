import { createRouter, createWebHistory } from "vue-router";
import MainPage from "@/pages/MainPage.vue";
import EventPage from "@/pages/EventPage.vue";
import LeaveHome from "@/pages/LeaveHome.vue";
import LeaveApprovalPage from "@/pages/LeaveApprovalPage.vue";

const routes = [ 
    {path:'/' ,  component : MainPage } ,
    {path:'/event' ,  component : EventPage } ,
    {path:'/leave/:id', component : LeaveHome},
    {path:'/leave/:id/approval', component : LeaveApprovalPage},
];
const router = createRouter({
    history : createWebHistory() , 
    routes : routes
});

export default router;
