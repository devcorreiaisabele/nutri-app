import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

type ModuloNotificacoes = typeof import('expo-notifications');

const IS_WEB = Platform.OS === 'web';

function carregarModulo(): ModuloNotificacoes | null {
    if (IS_WEB) return null;
    try {
        return require('expo-notifications') as ModuloNotificacoes;
    } catch (err) {
        console.warn('expo-notifications indisponível neste build:', err);
        return null;
    }
}

const Notifications = carregarModulo();

export const notificacoesDisponiveis = Notifications !== null;

export type Lembrete = {
    id: string;
    titulo: string;
    hora: number;
    minuto: number;
    ativo: boolean;
    notificacaoId: string | null;
};

const CHAVE = 'lembretesRefeicoes';
const CANAL = 'refeicoes';

const PADROES: Lembrete[] = [
    { id: 'cafe',         titulo: 'Café da manhã',   hora: 7,  minuto: 0,  ativo: false, notificacaoId: null },
    { id: 'lanche_manha', titulo: 'Lanche da manhã', hora: 10, minuto: 0,  ativo: false, notificacaoId: null },
    { id: 'almoco',       titulo: 'Almoço',          hora: 12, minuto: 30, ativo: false, notificacaoId: null },
    { id: 'lanche_tarde', titulo: 'Lanche da tarde', hora: 16, minuto: 0,  ativo: false, notificacaoId: null },
    { id: 'jantar',       titulo: 'Jantar',          hora: 19, minuto: 30, ativo: false, notificacaoId: null },
];

if (Notifications) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
}

export async function carregarLembretes(): Promise<Lembrete[]> {
    const bruto = await AsyncStorage.getItem(CHAVE);
    if (!bruto) return PADROES;
    try {
        return JSON.parse(bruto) as Lembrete[];
    } catch {
        return PADROES;
    }
}

export async function salvarLembretes(lista: Lembrete[]): Promise<void> {
    await AsyncStorage.setItem(CHAVE, JSON.stringify(lista));
}

export async function garantirPermissao(): Promise<boolean> {
    if (IS_WEB) return true;
    if (!Notifications) return false;
    const atual = await Notifications.getPermissionsAsync();
    if (atual.granted) return true;
    const pedido = await Notifications.requestPermissionsAsync();
    return pedido.granted;
}

async function criarCanalAndroid(): Promise<void> {
    if (!Notifications || Platform.OS !== 'android') return;
    try {
        await Notifications.setNotificationChannelAsync(CANAL, {
            name: 'Lembretes de refeições',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2E7D32',
            sound: 'default',
        });
    } catch (err) {
        console.warn('Não foi possível criar o canal de notificação:', err);
    }
}

async function agendar(lembrete: Lembrete): Promise<string> {
    if (IS_WEB) return `web-${lembrete.id}`;

    if (!Notifications) throw new Error('Notificações indisponíveis neste build');

    await criarCanalAndroid();

    return Notifications.scheduleNotificationAsync({
        content: {
            title: 'Hora da refeição 🍽️',
            body: `Não esqueça do seu ${lembrete.titulo.toLowerCase()} e de registrar no Nutri+.`,
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: lembrete.hora,
            minute: lembrete.minuto,
            channelId: CANAL,
        },
    });
}

async function cancelar(notificacaoId: string | null): Promise<void> {
    if (IS_WEB || !Notifications || !notificacaoId) return;
    await Notifications.cancelScheduledNotificationAsync(notificacaoId);
}

export async function ativarLembrete(lembrete: Lembrete): Promise<Lembrete> {
    await cancelar(lembrete.notificacaoId);
    const notificacaoId = await agendar(lembrete);
    return { ...lembrete, ativo: true, notificacaoId };
}

export async function desativarLembrete(lembrete: Lembrete): Promise<Lembrete> {
    await cancelar(lembrete.notificacaoId);
    return { ...lembrete, ativo: false, notificacaoId: null };
}

export async function alterarHorario(lembrete: Lembrete, deltaMinutos: number): Promise<Lembrete> {
    const total = (lembrete.hora * 60 + lembrete.minuto + deltaMinutos + 1440) % 1440;
    const atualizado: Lembrete = {
        ...lembrete,
        hora: Math.floor(total / 60),
        minuto: total % 60,
    };
    if (!atualizado.ativo) return atualizado;
    return ativarLembrete(atualizado);
}
