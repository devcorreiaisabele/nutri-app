import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { registrarConsumo } from '../src/services/consumoservice';
import { getReceitaById } from '../src/services/receitaService_1';

const { width, height } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────
// CONFIG DA API DO CHAT (ajuste conforme o seu api.py)
// ─────────────────────────────────────────────────────────────
const CHAT_API = {
    url: 'https://curso-mini-agente.onrender.com/chat', // use a rota real do seu api.py
};

// Formato do corpo enviado ao backend
function montarPayload(sessionId: string, mensagem: string) {
    return {
        session_id: sessionId,
        mensagem: mensagem,   // era "message"
    };
}

// Como ler o texto da resposta do backend
function extrairResposta(data: any): string {
    return (
        data?.response ??
        data?.resposta ??
        data?.reply ??
        data?.message ??
        (typeof data === 'string' ? data : '')
    );
}
// ─────────────────────────────────────────────────────────────

type ChatMsg = { id: string; role: 'user' | 'ai'; texto: string };

const RECEITAS_DETALHES: Record<string, any> = {
    '1': {
        titulo:      'Strogonoff de Cogumelos com Arroz',
        subtitulo:   'Rico e cremoso, conforto clássico.',
        descricao:   'Rico e cremoso strogonoff de cogumelos, cozido lentamente em um molho clássico com um toque de brandy, servido com arroz branco macio e batata palha crocante. Perfeito para uma refeição aconchegante e confortante.',
        avaliações:  52,
        imagem:      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop',
        ingredientes: [
            '500g de cogumelos variados fatiados',
            '1 cebola média picada',
            '2 dentes de alho picados',
            '2 colheres de manteiga',
            '1 colher de sopa de molho inglês',
            '1 dose de conhaque',
            '1 lata de creme de leite',
            'Sal e pimenta a gosto',
        ],
        preparo: [
            'Refogue a cebola e o alho na manteiga até dourar.',
            'Adicione os cogumelos fatiados e cozinhe até secar a água.',
            '(Opcional) Adicione o conhaque e flambe para sabor profundo.',
            'Junte o molho inglês e temperos.',
            'Desligue o fogo e misture o creme de leite.',
            'Sirva imediatamente acompanhado de arroz e batata palha.',
        ],
        nutri: { proteina: '12 g', calorias: '390 kcal', gordura: '12 g', carboidratos: '58 g' },
    },
    '2': {
        titulo:      'Tofu com Legumes',
        subtitulo:   'Leve, nutritivo e colorido.',
        descricao:   'Tofu grelhado com mix de legumes frescos salteados em azeite e ervas. Uma refeição completa, rica em proteínas vegetais e vitaminas essenciais.',
        avaliações:  34,
        imagem:      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&auto=format&fit=crop',
        ingredientes: [
            '300g de tofu firme',
            '1 abobrinha fatiada',
            '1 cenoura em tiras',
            '1 pimentão vermelho',
            '2 colheres de azeite',
            'Shoyu a gosto',
            'Gengibre ralado',
            'Cebolinha a gosto',
        ],
        preparo: [
            'Corte o tofu em cubos e tempere com shoyu e gengibre.',
            'Grelhe o tofu em frigideira antiaderente até dourar.',
            'Na mesma frigideira, salteie os legumes no azeite.',
            'Misture o tofu com os legumes e finalize com cebolinha.',
        ],
        nutri: { proteina: '18 g', calorias: '220 kcal', gordura: '10 g', carboidratos: '14 g' },
    },
    '6': {
        titulo:      'Smoothie Verde',
        subtitulo:   'Energia e frescor em um copo.',
        descricao:   'Blend nutritivo de espinafre, banana, maçã verde e limão. Rico em fibras, vitaminas e antioxidantes para começar o dia com energia.',
        avaliações:  28,
        imagem:      'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&auto=format&fit=crop',
        ingredientes: [
            '1 xícara de espinafre',
            '1 banana congelada',
            '1 maçã verde',
            'Suco de 1 limão',
            '200ml de água de coco',
            'Gelo a gosto',
        ],
        preparo: [
            'Coloque todos os ingredientes no liquidificador.',
            'Bata por 1 minuto até ficar homogêneo.',
            'Sirva imediatamente com gelo.',
        ],
        nutri: { proteina: '3 g', calorias: '120 kcal', gordura: '1 g', carboidratos: '28 g' },
    },
    '7': {
        titulo:      'Avocado Toast',
        subtitulo:   'Simples, delicioso e nutritivo.',
        descricao:   'Torrada integral com pasta cremosa de abacate temperada com limão, pimenta e azeite. Um clássico moderno cheio de gorduras boas.',
        avaliações:  41,
        imagem:      'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&auto=format&fit=crop',
        ingredientes: [
            '2 fatias de pão integral',
            '1 abacate maduro',
            'Suco de 1/2 limão',
            'Azeite a gosto',
            'Pimenta vermelha em flocos',
            'Sal e pimenta do reino',
        ],
        preparo: [
            'Torre o pão até ficar crocante.',
            'Amasse o abacate com o limão e tempere com sal e pimenta.',
            'Espalhe a pasta sobre as torradas.',
            'Finalize com azeite e pimenta em flocos.',
        ],
        nutri: { proteina: '6 g', calorias: '280 kcal', gordura: '18 g', carboidratos: '24 g' },
    },
};

function listaDeTexto(valor?: string) {
    return (valor ?? '')
        .split(/\n|;/)
        .map(item => item.trim())
        .filter(Boolean);
}

function removerNumeracao(texto: string) {
    return texto.replace(/^\d+[\.\)]\s*/, '').trim();
}

function listaDePassos(valor?: string) {
    const texto = (valor ?? '').trim();
    if (!texto) return [];

    const linhas = texto
        .split(/\n|;/)
        .map(item => item.trim())
        .filter(Boolean);

    if (linhas.length > 1) {
        return linhas.map(removerNumeracao);
    }

    const passos = texto
        .split(/(?=\d+[\.\)]\s)/)
        .map(item => removerNumeracao(item.trim()))
        .filter(Boolean);

    return passos.length > 1 ? passos : [removerNumeracao(texto)];
}

function montarDetalheReceita(dados: any, fallback: any) {
    if (!dados) return fallback;

    const ingredientes = listaDeTexto(dados.ingredientes);
    const preparo = listaDePassos(dados.modoPreparo);

    return {
        titulo: dados.titulo ?? fallback.titulo,
        subtitulo: dados.tags ?? fallback.subtitulo ?? 'Receita nutritiva',
        descricao: dados.observacoes || dados.modoPreparo || fallback.descricao,
        avaliacoes: dados.avaliacoes ?? dados.avaliacaoMedia ?? 0,
        imagem: dados.imagemUrl || dados.imagem_url || fallback.imagem,
        ingredientes: ingredientes.length > 0 ? ingredientes : fallback.ingredientes,
        preparo: preparo.length > 0 ? preparo : fallback.preparo,
        nutri: {
            proteina: `${dados.proteinas ?? 0} g`,
            calorias: `${dados.calorias ?? 0} kcal`,
            gordura: `${dados.gorduras ?? 0} g`,
            carboidratos: `${dados.carbos ?? 0} g`,
        },
    };
}

function numeroDoTexto(texto?: string) {
    return parseFloat(texto ?? '') || 0;
}

export default function DetalheReceita() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const fallback = RECEITAS_DETALHES[id ?? '1'] ?? RECEITAS_DETALHES['1'];
    const [receita, setReceita] = useState<any>(fallback);
    const [consumo, setConsumo] = useState<any>(null);
    const [loading, setLoading] = useState(Boolean(id));
    const [registrado, setRegistrado] = useState(false);

    // ── Chat ──────────────────────────────────────────────
    const [chatAberto, setChatAberto] = useState(false);
    const [mensagens, setMensagens] = useState<ChatMsg[]>([]);
    const [texto, setTexto] = useState('');
    const [digitando, setDigitando] = useState(false);
    const sessionIdRef = useRef<string | null>(null);
    const primeiraMsgEnviadaRef = useRef(false);
    const listRef = useRef<FlatList<ChatMsg>>(null);

    useEffect(() => {
        async function carregarReceita() {
            if (!id) return;
            try {
                const dados = await getReceitaById(id);
                setReceita(montarDetalheReceita(dados, fallback));
                if (dados) {
                    setConsumo({
                        idReceita: Number(id),
                        titulo:    dados.titulo,
                        calorias:  Number(dados.calorias)  || 0,
                        proteinas: Number(dados.proteinas) || 0,
                        carbos:    Number(dados.carbos)    || 0,
                        gorduras:  Number(dados.gorduras)  || 0,
                    });
                }
            } catch (err) {
                console.log('Erro ao carregar detalhe da receita:', err);
                setReceita(fallback);
            } finally {
                setLoading(false);
            }
        }

        carregarReceita();
    }, [id]);

    async function comerReceita() {
        const idReceita = Number(id ?? 0);

        if (!idReceita) {
            Alert.alert('Erro', 'Receita inválida.');
            return;
        }

        try {
            const total = await registrarConsumo(idReceita);
            setRegistrado(true);
            Alert.alert(
                'Registrado!',
                `Total hoje: ${Math.round(total.calorias)} kcal\n` +
                `P ${Math.round(total.proteinas)}g · C ${Math.round(total.carbos)}g · G ${Math.round(total.gorduras)}g`
            );
        } catch (err) {
            console.log('Erro ao registrar refeição:', err);
            Alert.alert('Erro', 'Não foi possível registrar a refeição.');
        }
    }

    // ── Funções do chat ───────────────────────────────────
    function abrirChat() {
        // session_id único por conversa nesta receita (id/título + timestamp)
        if (!sessionIdRef.current) {
            const base = String(id ?? receita.titulo).replace(/\s+/g, '-');
            sessionIdRef.current = `${base}-${Date.now()}`;
        }
        // Mensagem de boas-vindas na primeira abertura
        if (mensagens.length === 0) {
            setMensagens([
                {
                    id: 'welcome',
                    role: 'ai',
                    texto: `Olá! 👋 Eu sou o Nutri IA. O que você gostaria de saber ou adaptar na receita "${receita.titulo}"? Posso sugerir substituições, ajustar porções, adaptar para dietas específicas e muito mais.`,
                },
            ]);
        }
        setChatAberto(true);
    }

    function rolarParaFim() {
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }

    async function enviarMensagem() {
        const msg = texto.trim();
        if (!msg || digitando) return;

        setTexto('');
        setMensagens(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', texto: msg }]);
        setDigitando(true);
        rolarParaFim();

        
        let mensagemParaApi = msg;
        if (!primeiraMsgEnviadaRef.current) {
            const citouReceita = msg.toLowerCase().includes(String(receita.titulo).toLowerCase());
            if (!citouReceita) {
                const ingredientes = (receita.ingredientes ?? []).join(', ');
                mensagemParaApi =
                    `[Contexto: o usuário está vendo a receita "${receita.titulo}". ` +
                    `Ingredientes: ${ingredientes}.] ${msg}`;
            }
        }

        try {
            const resp = await fetch(CHAT_API.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(montarPayload(sessionIdRef.current as string, mensagemParaApi)),
            });

            if (!resp.ok) {
    const corpo = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${corpo}`);
}

            const data = await resp.json();
            const textoIA = extrairResposta(data) || 'Desculpe, não consegui gerar uma resposta agora.';

            primeiraMsgEnviadaRef.current = true;
            setMensagens(prev => [...prev, { id: `a-${Date.now()}`, role: 'ai', texto: textoIA }]);
        } catch (err) {
            console.log('Erro no chat Nutri IA:', err);
            setMensagens(prev => [
                ...prev,
                {
                    id: `e-${Date.now()}`,
                    role: 'ai',
                    texto: 'Ops, não consegui falar com o servidor. Tente novamente em instantes.',
                },
            ]);
        } finally {
            setDigitando(false);
            rolarParaFim();
        }
    }

    if (loading) {
        return (
            <View style={s.loadingBox}>
                <ActivityIndicator size="large" color="#2E7D32" />
            </View>
        );
    }

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" />

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <View style={s.heroBox}>
                    <Image source={{ uri: receita.imagem }} style={s.heroImg} resizeMode="cover" />
                    <View style={s.heroOverlay} />

                    <View style={s.heroHeader}>
                        <TouchableOpacity style={s.btnVoltar} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={22} color="#111" />
                        </TouchableOpacity>
                        <Text style={s.heroHeaderTitulo}>Detalhes</Text>
                        <TouchableOpacity style={s.btnVoltar}>
                            <Ionicons name="share-social-outline" size={22} color="#111" />
                        </TouchableOpacity>
                    </View>

                    <View style={s.heroInfo}>
                        <Text style={s.heroTitulo}>{receita.titulo}</Text>
                        <Text style={s.heroSub}>{receita.subtitulo}</Text>
                        <View style={s.dotsRow}>
                            <View style={[s.dot, s.dotAtivo]} />
                            <View style={s.dot} />
                            <View style={s.dot} />
                        </View>
                    </View>
                </View>

                <View style={s.corpo}>
                    <View style={[s.card, { marginTop: 4 }]}>
                        <Text style={s.cardSub}>{receita.subtitulo}</Text>
                        <Text style={s.cardDesc}>{receita.descricao}</Text>
                    </View>

                    <Text style={s.secaoTitulo}>Ingredientes</Text>
                    <View style={s.card}>
                        {receita.ingredientes.map((ing: string, i: number) => (
                            <View key={i} style={s.itemRow}>
                                <View style={s.bullet} />
                                <Text style={s.itemTexto}>{ing}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={s.secaoTitulo}>Modo de Preparo</Text>
                    <View style={s.card}>
                        {receita.preparo.map((passo: string, i: number) => (
                            <View key={i} style={s.passoRow}>
                                <View style={s.passoNumBox}>
                                    <Text style={s.passoNum}>{i + 1}</Text>
                                </View>
                                <Text style={s.passoTexto}>{passo}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={s.secaoTitulo}>Ficha Nutricional</Text>
                    <View style={s.nutriGrid}>
                        {[
                            { label: 'Proteína',      valor: receita.nutri.proteina },
                            { label: 'Calorias',      valor: receita.nutri.calorias },
                            { label: 'Gordura',       valor: receita.nutri.gordura },
                            { label: 'Carboidratos',  valor: receita.nutri.carboidratos },
                        ].map((item, i) => (
                            <View key={i} style={s.nutriCard}>
                                <Text style={s.nutriLabel}>{item.label}</Text>
                                <Text style={s.nutriValor}>{item.valor}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            
            <TouchableOpacity style={s.fab} activeOpacity={0.85} onPress={abrirChat}>
                <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
            </TouchableOpacity>

            <View style={s.rodape}>
                <TouchableOpacity
                    style={[s.btnSalvar, registrado && s.btnSalvarAtivo]}
                    activeOpacity={0.85}
                    onPress={comerReceita}
                    disabled={registrado}
                >
                    {registrado && (
                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    )}
                    <Text style={s.btnSalvarTexto}>
                        {registrado ? 'Receita registrada' : 'Comi esta receita'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Modal / Bottom sheet do chat */}
            <Modal
                visible={chatAberto}
                transparent
                animationType="slide"
                onRequestClose={() => setChatAberto(false)}
            >
                <KeyboardAvoidingView
                    style={s.chatOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <TouchableOpacity
                        style={s.chatBackdrop}
                        activeOpacity={1}
                        onPress={() => setChatAberto(false)}
                    />

                    <View style={s.chatSheet}>
                        {/* Cabeçalho */}
                        <View style={s.chatHeader}>
                            <View style={s.chatAvatar}>
                                <Ionicons name="leaf" size={18} color="#fff" />
                            </View>
                            <Text style={s.chatHeaderTitulo} numberOfLines={1}>
                                Nutri IA · Assistente da Receita
                            </Text>
                            <TouchableOpacity
                                style={s.chatBtnFechar}
                                onPress={() => setChatAberto(false)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="close" size={20} color="#111" />
                            </TouchableOpacity>
                        </View>

        
                        <FlatList
                            ref={listRef}
                            data={mensagens}
                            keyExtractor={item => item.id}
                            contentContainerStyle={s.chatLista}
                            showsVerticalScrollIndicator={false}
                            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                            renderItem={({ item }) => (
                                <View
                                    style={[
                                        s.balao,
                                        item.role === 'user' ? s.balaoUser : s.balaoAi,
                                    ]}
                                >
                                    <Text style={item.role === 'user' ? s.balaoTextoUser : s.balaoTextoAi}>
                                        {item.texto}
                                    </Text>
                                </View>
                            )}
                            ListFooterComponent={
                                digitando ? (
                                    <View style={[s.balao, s.balaoAi, s.balaoDigitando]}>
                                        <ActivityIndicator size="small" color="#2E7D32" />
                                        <Text style={s.digitandoTexto}>Digitando...</Text>
                                    </View>
                                ) : undefined
                            }
                        />

                        {/* Campo de texto */}
                        <View style={s.chatInputRow}>
                            <TextInput
                                style={s.chatInput}
                                placeholder="Pergunte sobre esta receita..."
                                placeholderTextColor="#999"
                                value={texto}
                                onChangeText={setTexto}
                                multiline
                                maxLength={500}
                                onSubmitEditing={enviarMensagem}
                            />
                            <TouchableOpacity
                                style={[
                                    s.chatBtnEnviar,
                                    (!texto.trim() || digitando) && s.chatBtnEnviarOff,
                                ]}
                                onPress={enviarMensagem}
                                disabled={!texto.trim() || digitando}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="send" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    root:           { flex: 1, backgroundColor: '#F5F5F5' },
    loadingBox:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
    scroll:         { paddingBottom: 0 },
    heroBox:        { height: 320, position: 'relative' },
    heroImg:        { width: '100%', height: '100%' },
    heroOverlay:    { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.28)' },
    heroHeader:     { position: 'absolute', top: 52, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 },
    btnVoltar:      { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    heroHeaderTitulo: { fontSize: 17, fontWeight: '700', color: '#fff' },
    heroInfo:       { position: 'absolute', bottom: 24, left: 20 },
    heroTitulo:     { fontSize: 26, fontWeight: '800', color: '#fff', maxWidth: width * 0.75, lineHeight: 32, marginBottom: 6 },
    heroSub:        { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 12 },
    dotsRow:        { flexDirection: 'row', gap: 6 },
    dot:            { width: 24, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' },
    dotAtivo:       { backgroundColor: '#fff', width: 32 },
    corpo:          { backgroundColor: '#F5F5F5', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24, paddingHorizontal: 20, paddingTop: 24 },
    avalRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
    avalAvatares:   { flexDirection: 'row' },
    avalAvatar:     { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F5F5F5' },
    avalTexto:      { fontSize: 14, color: '#555', fontWeight: '600', flex: 1 },
    starsRow:       { flexDirection: 'row', gap: 2 },
    card:           { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    cardTitulo:     { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 4 },
    cardSub:        { fontSize: 13, color: '#888', marginBottom: 10 },
    cardDesc:       { fontSize: 14, color: '#555', lineHeight: 22 },
    secaoTitulo:    { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 12 },
    itemRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
    bullet:         { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2E7D32', marginTop: 6 },
    itemTexto:      { fontSize: 14, color: '#333', flex: 1, lineHeight: 22 },
    passoRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
    passoNumBox:    { width: 26, height: 26, borderRadius: 13, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', marginTop: 1 },
    passoNum:       { color: '#fff', fontWeight: '800', fontSize: 13 },
    passoTexto:     { flex: 1, fontSize: 14, color: '#333', lineHeight: 22 },
    nutriGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
    nutriCard:      { width: (width - 52) / 2, backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    nutriLabel:     { fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 4 },
    nutriValor:     { fontSize: 14, color: '#888' },
    rodape:         { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12, backgroundColor: '#F5F5F5' },
    btnSalvar:      { backgroundColor: '#2E7D32', borderRadius: 16, paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    btnSalvarAtivo: { backgroundColor: '#1B5E20' },
    btnSalvarTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // ── FAB ──
    fab:            { position: 'absolute', right: 20, bottom: 110, width: 58, height: 58, borderRadius: 29, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },

    // ── Chat ──
    chatOverlay:    { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    chatBackdrop:   { flex: 1 },
    chatSheet:      { height: height * 0.75, backgroundColor: '#F5F5F5', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
    chatHeader:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    chatAvatar:     { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center' },
    chatHeaderTitulo: { flex: 1, fontSize: 15, fontWeight: '800', color: '#111' },
    chatBtnFechar:  { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
    chatLista:      { padding: 16, paddingBottom: 8 },
    balao:          { maxWidth: '82%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10 },
    balaoUser:      { alignSelf: 'flex-end', backgroundColor: '#2E7D32', borderBottomRightRadius: 4 },
    balaoAi:        { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    balaoTextoUser: { color: '#fff', fontSize: 14, lineHeight: 20 },
    balaoTextoAi:   { color: '#333', fontSize: 14, lineHeight: 20 },
    balaoDigitando: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    digitandoTexto: { color: '#888', fontSize: 13, fontStyle: 'italic' },
    chatInputRow:   { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 14, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 28 : 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EEE' },
    chatInput:      { flex: 1, maxHeight: 100, minHeight: 42, backgroundColor: '#F5F5F5', borderRadius: 21, paddingHorizontal: 16, paddingTop: 11, paddingBottom: 11, fontSize: 14, color: '#111' },
    chatBtnEnviar:  { width: 42, height: 42, borderRadius: 21, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center' },
    chatBtnEnviarOff: { backgroundColor: '#A5C8A7' },
});