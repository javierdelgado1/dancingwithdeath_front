import axios from 'axios';
const api =     axios.create({
    baseURL: window.location.hostname == 'localhost'
    ? "http://dancingwithdeath.test"
    : "http://javierdelgado.com.ve/asimov"
});
export default api;
