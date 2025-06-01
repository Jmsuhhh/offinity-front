import { createRouter, createWebHistory } from "vue-router";
import MainPage from "@/pages/MainPage.vue";
import EventPage from "@/pages/EventPage.vue";
import LeaveHome from "@/pages/LeaveHome.vue";
import LeaveApprovalPage from "@/pages/LeaveApprovalPage.vue";
import LogInPage from "@/pages/LogInPage.vue";
import SignUpPage from "@/pages/SignUpPage.vue";
import FindEmailPage from "@/pages/FindEmailPage.vue";
import EmployeeList from "@/pages/EmployeeList.vue";
import SuggestionBoardPage from "@/pages/SuggestionBoardPage.vue";
import SuggestionCreatePage from "@/pages/SuggestionCreatePage.vue";
import SuggestionUpdatePage from "@/pages/SuggestionUpdatePage.vue";
import SuggestionDetailPage from "@/pages/SuggestionDetailPage.vue";

const routes = [ 
    { path: '/', component: MainPage },
    { path: '/event', component: EventPage },
    { path: '/leave/:id', component: LeaveHome },
    { path: '/leave/:id/approval', component: LeaveApprovalPage },
    { path: '/login', component: LogInPage },
    { path: '/signup', component: SignUpPage },
    {path: '/find-email', component : FindEmailPage},
    { path: '/emp-list', component : EmployeeList},
    { path: '/board/suggestion', component : SuggestionBoardPage},
    { path: '/board/suggestion/:id', component : SuggestionDetailPage},
    { path: '/board/suggestion/:id/update', component : SuggestionUpdatePage},
    { path: '/board/create-suggestion', component : SuggestionCreatePage}
];

const router = createRouter({
    history: createWebHistory(),
    routes: routes
});

export default router;

