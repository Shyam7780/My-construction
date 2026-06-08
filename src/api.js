import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const loginAdmin = (data) => API.post('/auth/login', data);
export const getRates = () => API.get('/data/rates');
export const getOffers = () => API.get('/data/offers');