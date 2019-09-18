/**
 * Auth Module
 */
import Vue from 'vue'
import Nprogress from 'nprogress';
import router from '../../../router';
import api from '../../../api/apibackend.js';

const state = {
    user: localStorage.getItem('user'),
    isUserSigninWithAuth0: Boolean(localStorage.getItem('isUserSigninWithAuth0'))
}

// getters
const getters = {
    getUser: state => {
        return state.user;
    },
    isUserSigninWithAuth0: state => {
        return state.isUserSigninWithAuth0;
    }
}

// actions
const actions = {
    signinUserInApi(context, payload) {
        const { user } = payload;
        context.commit('loginUser');

        
        var config = {
            headers: {'Content-Type': 'application/json; charset=utf-8'}
        };
        api.post("signin", {
            username : payload.user.email,
            password : payload.user.password,
        }, config)
        .then(function(response) {
               //console.log(response.data)
                var res= response.data;
               
                if(res.status != "error"){
                    Nprogress.done();
                    setTimeout(() => {
                        context.commit('loginUserSuccess', res);
                    }, 500)
                }
                else{
                    setTimeout(() => {
                        context.commit('loginUserFailure', res);
                    }, 500)
                }

        })
        .catch(function(error) {
          //console.log("error" + error);
          context.commit('loginUserFailure', error);
        });
      
    },
    logoutUserFromFirebase(context) {
        Nprogress.start();
                setTimeout(() => {
                    context.commit('logoutUser');
                }, 500)

    },

    signInUserWithAuth0(context, payload) {
        context.commit('signInUserWithAuth0Success', payload);
    },
    signOutUserFromAuth0(context) {
        context.commit('signOutUserFromAuth0Success');
    }
}

// mutations
const mutations = {
    loginUser(state) {
        Nprogress.start();
    },
    loginUserSuccess(state, user) {
        state.user = user;
        localStorage.setItem('user',JSON.stringify(user));
        state.isUserSigninWithAuth0 = false
        router.push("/booking");
        setTimeout(function(){
            Vue.notify({
                group: 'loggedIn',
                type: 'success',
                text: 'User Logged In Success!'
            });
       },1500);
    },
    loginUserFailure(state, error) {
        Nprogress.done();
        Vue.notify({
            group: 'loggedIn',
            type: 'error',
            text: error.message
        });
    },
    logoutUser(state) {
        state.user = null
        localStorage.removeItem('user');
        router.push("/session/login");
    },
    signUpUser(state) {
        Nprogress.start();
    },
    signUpUserSuccess(state, user) {
        state.user = localStorage.setItem('user', user);
        router.push("/dashboard");
        Vue.notify({
            group: 'loggedIn',
            type: 'success',
            text: 'Account Created!'
        });
    },
    signUpUserFailure(state, error) {
        Nprogress.done();
         Vue.notify({
            group: 'loggedIn',
            type: 'error',
            text: error.message
        });
    },
    signInUserWithAuth0Success(state, user) {
        state.user = user;
        localStorage.setItem('user',JSON.stringify(user));
        state.isUserSigninWithAuth0 = true;
    },
    signOutUserFromAuth0Success(state) {
        state.user = null
        localStorage.removeItem('user')
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
