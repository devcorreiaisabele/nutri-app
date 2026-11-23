import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export type ConsumoDia = {
    data: string;
    calorias: number;
    proteinas: number;
    carbos: number;
    gorduras: number;
};

async function obterUsuarioId() {
    const id = await AsyncStorage.getItem('usuarioId');
    if (!id) throw new Error('Usuário não encontrado');
    return id;
}

function normalizar(dados: any): ConsumoDia {
    return {
        data:      dados?.data ?? '',
        calorias:  Number(dados?.calorias)  || 0,
        proteinas: Number(dados?.proteinas) || 0,
        carbos:    Number(dados?.carbos)    || 0,
        gorduras:  Number(dados?.gorduras)  || 0,
    };
}

export async function registrarConsumo(idReceita: number): Promise<ConsumoDia> {
    const usuarioId = await obterUsuarioId();
    const response = await api.post(`/usuario/${usuarioId}/consumo`, { idReceita });
    return normalizar(response.data);
}

export async function getConsumoDeHoje(): Promise<ConsumoDia> {
    const usuarioId = await obterUsuarioId();
    const response = await api.get(`/usuario/${usuarioId}/consumo`);
    return normalizar(response.data);
}