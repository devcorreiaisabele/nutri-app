import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    alterarHorario,
    ativarLembrete,
    carregarLembretes,
    desativarLembrete,
    garantirPermissao,
    Lembrete,
    notificacoesDisponiveis,
    salvarLembretes,
} from '../src/services/lembreteService';

const PASSO_MINUTOS = 1;

function formatarHorario(hora: number, minuto: number) {
    const h = hora < 10 ? `0${hora}` : `${hora}`;
    const m = minuto < 10 ? `0${minuto}` : `${minuto}`;
    return `${h}:${m}`;
}

export default function Lembretes() {
    const [lembretes, setLembretes] = useState<Lembrete[]>([]);
    const [loading, setLoading]     = useState(true);
    const [processando, setProcessando] = useState<string | null>(null);

    useEffect(() => {
        async function iniciar() {
            try {
                const lista = await carregarLembretes();
                setLembretes(lista);
            } catch (err) {
                console.warn('Erro ao carregar lembretes:', err);
            } finally {
                setLoading(false);
            }
        }
        iniciar();
    }, []);

    async function aplicarMudanca(id: string, acao: (item: Lembrete) => Promise<Lembrete>) {
        const item = lembretes.find(l => l.id === id);
        if (!item) return;
        setProcessando(id);
        try {
            const atualizado = await acao(item);
            const novaLista = lembretes.map(l => (l.id === id ? atualizado : l));
            setLembretes(novaLista);
            await salvarLembretes(novaLista);
        } catch (err) {
            console.error('Erro ao atualizar lembrete:', err);
            Alert.alert('Erro', 'Não foi possível atualizar o lembrete. Tente novamente.');
        } finally {
            setProcessando(null);
        }
    }

    async function handleAlternar(id: string, valor: boolean) {
        if (valor) {
            if (!notificacoesDisponiveis && Platform.OS !== 'web') {
                Alert.alert(
                    'Notificações indisponíveis',
                    'Esta versão do app não tem o módulo de notificações. Gere um novo build do app para usar os lembretes.'
                );
                return;
            }
            const permitido = await garantirPermissao();
            if (!permitido) {
                Alert.alert(
                    'Permissão necessária',
                    'Ative as notificações do Nutri+ nas configurações do celular para receber os lembretes.'
                );
                return;
            }
            await aplicarMudanca(id, ativarLembrete);
            return;
        }
        await aplicarMudanca(id, desativarLembrete);
    }

    async function handleAjustar(id: string, delta: number) {
        await aplicarMudanca(id, item => alterarHorario(item, delta));
    }

    const totalAtivos = lembretes.filter(l => l.ativo).length;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.btnVoltar}>
                    <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitulo}>Lembretes</Text>
                <View style={{ width: 38 }} />
            </View>

            {loading ? (
                <ActivityIndicator color={VERDE} style={{ marginTop: 40 }} />
            ) : (
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    <View style={styles.cardResumo}>
                        <View style={styles.cardResumoRow}>
                            <MaterialCommunityIcons name="bell-ring-outline" size={20} color="#fff" />
                            <Text style={styles.cardResumoTitulo}>Horários das refeições</Text>
                        </View>
                        <Text style={styles.cardResumoHint}>
                            {totalAtivos === 0
                                ? 'Nenhum lembrete ativo'
                                : totalAtivos === 1
                                    ? '1 lembrete ativo'
                                    : `${totalAtivos} lembretes ativos`}
                        </Text>
                    </View>

                    {totalAtivos === 0 && (
                        <View style={styles.vazio}>
                            <MaterialCommunityIcons name="bell-off-outline" size={36} color="#bbb" />
                            <Text style={styles.vazioTitulo}>Você ainda não ativou nenhum lembrete</Text>
                            <Text style={styles.vazioTexto}>
                                Ligue o botão de uma refeição abaixo para receber um aviso todos os dias no horário escolhido.
                            </Text>
                        </View>
                    )}

                    <Text style={styles.secaoTitulo}>Suas refeições</Text>

                    {lembretes.map(item => (
                        <View key={item.id} style={styles.cardLembrete}>
                            <View style={styles.cardTopo}>
                                <View style={styles.cardIcone}>
                                    <MaterialCommunityIcons name="silverware-fork-knife" size={22} color={VERDE} />
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.cardTitulo}>{item.titulo}</Text>
                                    <Text style={[styles.cardSub, item.ativo ? styles.subAtivo : styles.subInativo]}>
                                        {item.ativo ? 'Lembrete ativo' : 'Desativado'}
                                    </Text>
                                </View>
                                {processando === item.id ? (
                                    <ActivityIndicator color={VERDE} />
                                ) : (
                                    <Switch
                                        value={item.ativo}
                                        onValueChange={valor => handleAlternar(item.id, valor)}
                                        trackColor={{ false: '#ddd', true: VERDE_CLARO }}
                                        thumbColor={item.ativo ? VERDE : '#f4f4f4'}
                                    />
                                )}
                            </View>

                            <View style={styles.seletorRow}>
                                <TouchableOpacity
                                    style={styles.btnAjuste}
                                    onPress={() => handleAjustar(item.id, -PASSO_MINUTOS)}
                                    disabled={processando !== null}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.btnAjusteTexto}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.horario}>{formatarHorario(item.hora, item.minuto)}</Text>
                                <TouchableOpacity
                                    style={styles.btnAjuste}
                                    onPress={() => handleAjustar(item.id, PASSO_MINUTOS)}
                                    disabled={processando !== null}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.btnAjusteTexto}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const VERDE       = '#2E7D32';
const VERDE_CLARO = '#A5D6A7';
const FUNDO       = '#f5f5f5';

const styles = StyleSheet.create({
    root:             { flex: 1, backgroundColor: FUNDO },
    header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 54, paddingBottom: 16, backgroundColor: FUNDO },
    btnVoltar:        { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e8e8e8', justifyContent: 'center', alignItems: 'center' },
    headerTitulo:     { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
    scroll:           { paddingHorizontal: 20, paddingBottom: 40 },
    cardResumo:       { backgroundColor: VERDE, borderRadius: 22, padding: 20, marginBottom: 20, elevation: 4, shadowColor: VERDE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10 },
    cardResumoRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    cardResumoTitulo: { fontSize: 16, fontWeight: '700', color: '#fff' },
    cardResumoHint:   { fontSize: 22, fontWeight: '800', color: '#fff' },
    vazio:            { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
    vazioTitulo:      { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginTop: 10, textAlign: 'center' },
    vazioTexto:       { fontSize: 13, color: '#999', marginTop: 6, textAlign: 'center' },
    secaoTitulo:      { fontSize: 18, fontWeight: '800', color: '#1a1a1a', marginBottom: 14 },
    cardLembrete:     { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
    cardTopo:         { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    cardIcone:        { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    cardInfo:         { flex: 1 },
    cardTitulo:       { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
    cardSub:          { fontSize: 12, fontWeight: '500' },
    subAtivo:         { color: VERDE },
    subInativo:       { color: '#999' },
    seletorRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
    btnAjuste:        { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e8e8e8', justifyContent: 'center', alignItems: 'center' },
    btnAjusteTexto:   { fontSize: 24, fontWeight: '300', color: VERDE, lineHeight: 28 },
    horario:          { fontSize: 34, fontWeight: '800', color: '#1a1a1a', minWidth: 110, textAlign: 'center' },
});
