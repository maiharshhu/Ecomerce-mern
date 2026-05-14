import axios from "axios";


const baseUrl = (import.meta.env.VITE_API_URL).replace(/\/$/, '');

const api = axios.create({
    baseURL: `${baseUrl}/api`
})


export default api;