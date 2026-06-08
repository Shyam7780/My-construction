import axios from 'axios';
// src/api.js में यह होना चाहिए
const API = axios.create({ 
  baseURL: 'https://chhotan-ram-api1.onrender.com/api' 
});


export const loginAdmin = (data) => API.post('/auth/login', data);
export const getRates = () => API.get('/data/rates');
export const getOffers = () => API.get('/data/offers');
