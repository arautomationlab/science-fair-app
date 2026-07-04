import axios from 'axios';

// Use the Render backend URL
const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;