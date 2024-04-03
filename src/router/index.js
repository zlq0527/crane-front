import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    {
        path: '/index',
        name: 'index',
        component: () => import('../views/index.vue'),
        children: [
            {
                path: '/craneData', name: 'Elderly', component: () => import('../views/EL/craneData.vue')
            },
            {
                path: '/craneInfo', name: 'Dormitory', component: () => import('../views/EL/craneInfo.vue')
            },
            {
                path: '/dataDetail', name: 'dataDetail', component: () => import('../views/EL/dataDetail.vue')
            },
            {
                path: '/user', name: 'user', component: () => import('../views/EL/User.vue')
            },
            {
                path: '/permissions', name: 'permissions', component: () => import('../views/EL/permissions.vue')
            },
            {
                path: '/OutArchives', name: 'OutArchives', component: () => import('../views/EL/OutArchives.vue')
            }
        ]
    },
    {
        path: "/home",
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: "/",
        alias: '/login',
        name: 'Login',
        component: () => import('../views/login.vue')
    }
]

const router = new VueRouter({
    mode: 'hash',
    base: process.env.BASE_URL,
    routes
})

router.beforeEach((to,from,next)=>{
    const token=sessionStorage.getItem('token')
    if(to.name!=='Login'&&!token){
        next({name:'Login'})
    }else{
        next();
    }
}

)

export default router
