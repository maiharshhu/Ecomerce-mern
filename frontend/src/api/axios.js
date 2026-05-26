import axios from "axios";
import { auth } from "../firebase";


const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '');

const api = axios.create({
    baseURL: `${baseUrl}/api`
})

api.interceptors.request.use((config) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        return currentUser.getIdToken().then((token) => {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
        });
    }
    return config;
});


export default api;