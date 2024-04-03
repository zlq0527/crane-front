import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store= new Vuex.Store({
    state: {
        token:''
    },
    getters: {},
    mutations: {
        set_token(state, token) {
            state.token = token
            sessionStorage.token = token
        },
        del_token(state) {
            state.token = ''
            sessionStorage.removeItem('token')
            localStorage.removeItem('roleId')
        }

    },
    actions: {

    },
    modules: {}
})

export default store
