import axios from "axios";


const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '');

const api = axios.create({
    baseURL: `${baseUrl}/api`
})


export default api;