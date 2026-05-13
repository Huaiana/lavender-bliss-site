import api from './services/api';

async function buscarDados() {
  try {
    const response = await api.get('/usuarios'); // Substitua pela rota do repo
    console.log(response.data);
  } catch (error) {
    console.error("Erro ao conectar com a API", error);
  }
}

import axios from 'axios';

const api = axios.create({
 
  baseURL: 'http://localhost:3012', 
});

export default api;

buscarDados();

