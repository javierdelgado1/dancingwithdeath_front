import axios from "axios";
import api from ".";
import router from '../router';

export default {
  data() {
    return {
      baseUrlApi: window.location.hostname == 'localhost'
        ? "http://dancingwithdeath.test/api/v1/"
        : "http://javierdelgado.com.ve/asimov/api/v1/",
      baseUrl: window.location.hostname == 'localhost'
        ? "dancingwithdeath.test"
        : "http://javierdelgado.com.ve/asimov",
      user: {
        name: "",
        email: "",
        role: ""
      }
    };
  },
  created() {
    //console.log(process.env);
    var currentUrl = window.location.hostname;
    /*console.log(currentUrl);
    console.log(window.location.hostname == 'localhost');
    console.log(this.baseUrlApi);
    console.log(this.baseUrl);*/


    var user = JSON.parse(localStorage.getItem("user"));
    if (user != "" && user != null) {
      this.user.name = user.user.name;
      this.user.email = user.user.email;
      this.user.role = user.user.roles;
    }
  },
  methods: {
    apiConexion() {
      return axios.create({
        baseURL: this.baseUrl + "/"
      });
    },
    api(isfile = null) {
      var user = JSON.parse(localStorage.getItem("user"));
      if (user != "" && user != null) {
        var access_token = user.token.access_token;

        if (isfile != null) {
          return axios.create({
            baseURL: this.baseUrlApi,
            headers: {
              Accept: "application/json",
              Authorization: "Bearer " + access_token,
              "Content-Type": "multipart/form-data"
            }
          });
        }
        return axios.create({
          baseURL: this.baseUrlApi,
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + access_token
          }
        });
      }
      return axios.create({
        baseURL: baseUrlApi
      });
    },
    code401(error){
      try {
        if(error.response.status == 401 ){
                router.push("/session/login");
        }
      } catch (error) {
        //router.push("/session/login");
      }
    }
  }
};
