import AsyncStorage from '@react-native-async-storage/async-storage';

export type Consumo = {
    idReceita: number;
    titulo:    string;
    calorias:  number;
    proteinas: number;
    carbos:    number;
    gorduras:  number;
};

function dataHoje() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

async function chave() {
    const id = await AsyncStorage.getItem('usuarioId');
    return `refeicoes_${id ?? 'local'}_${dataHoje()}`;
}

export async function refeicoesDeHoje(): Promise<Consumo[]> {
    const bruto = await AsyncStorage.getItem(await chave());
    return bruto ? JSON.parse(bruto) : [];
}

export async function registrarRefeicao(r: Consumo): Promise<void> {
    const lista = await refeicoesDeHoje();
    await AsyncStorage.setItem(await chave(), JSON.stringify([...lista, r]));
}

export function totais(lista: Consumo[]) {
    return lista.reduce(
        (t, r) => ({
            calorias:  t.calorias  + (r.calorias  || 0),
            proteinas: t.proteinas + (r.proteinas || 0),
            carbos:    t.carbos    + (r.carbos    || 0),
            gorduras:  t.gorduras  + (r.gorduras  || 0),
        }),
        { calorias: 0, proteinas: 0, carbos: 0, gorduras: 0 }
    );
}