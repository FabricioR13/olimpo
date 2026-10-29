// ═════════════════════════════════════════════════════════════════════════════
//  OLIMPO — CAMADA DE DADOS (usada pela loja e pelo admin)
//  Desenvolvido por TF Solutions
//
//  Dois modos de funcionamento:
//   • DEMONSTRAÇÃO (padrão): sem configurar nada, os dados ficam salvos no próprio
//     navegador (localStorage). Ideal para apresentar o sistema à cliente.
//   • FIREBASE: preencha o FIREBASE_CONFIG abaixo e os dados passam a ficar na nuvem
//     (Firestore + login por e-mail/senha). Regras em regras.md.
// ═════════════════════════════════════════════════════════════════════════════

const FIREBASE_CONFIG = null;
// Exemplo:
// const FIREBASE_CONFIG = {
//   apiKey: "...", authDomain: "olimpo-xxxx.firebaseapp.com", projectId: "olimpo-xxxx",
//   storageBucket: "...", messagingSenderId: "...", appId: "..."
// };

// Senha do admin no modo demonstração
const SENHA_DEMO = "1234";

// WhatsApp da TF Solutions (crédito no rodapé)
const TF_SOLUTIONS_WHATSAPP = "5551982165186";

// ─── DADOS INICIAIS DA DEMONSTRAÇÃO ──────────────────────────────────────────
const IMG = "assets/produtos/";

const SEED_CATEGORIAS = [
    { id: "bolos", nome: "Bolos Caseiros", icone: "fa-cake-candles", foto: IMG + "bolo-maracuja.jpg", ordem: 1 },
    { id: "doces-pote", nome: "Doces no Pote", icone: "fa-ice-cream", foto: IMG + "furacao-nutella.jpg", ordem: 2 },
    { id: "tortas", nome: "Tortas e Fatias", icone: "fa-chart-pie", foto: IMG + "torta-olho-de-sogra.jpg", ordem: 3 },
    { id: "cucas", nome: "Cucas", icone: "fa-cookie", foto: IMG + "cucas.jpg", ordem: 4 },
    { id: "paes", nome: "Pães dos Deuses", icone: "fa-bread-slice", foto: IMG + "pao-de-leite.jpg", ordem: 5 },
    { id: "salgados", nome: "Salgados e Congelados", icone: "fa-snowflake", foto: IMG + "escondidinho.jpg", ordem: 6 },
];

const p = (id, categoria, nome, descricao, imagem, preco, estoque, extra = {}) => ({
    id, categoria, nome, descricao, imagem: IMG + imagem, preco,
    estoque, estoqueMinimo: 2, ativo: true, destaque: false, ...extra,
});

const SEED_PRODUTOS = [
    // Bolos
    p(1, "bolos", "Bolo de Maracujá com Fruta Fresca", "Massa fofinha com cobertura de maracujá fresco e geleia artesanal. Aprox. 600g.", "bolo-maracuja.jpg", 28, 4, { destaque: true }),
    p(2, "bolos", "Bolo Mesclado Chocolate e Baunilha", "Metade chocolate 50%, metade baunilha. Aprox. 600g.", "bolo-mesclado.jpg", 26, 5),
    p(3, "bolos", "Bolo de Milho Verde com Goiabada", "Milho verde com corações de goiabada. Sem lactose. Aprox. 670g.", "bolo-milho-goiabada.jpg", 27, 3, { tags: ["Sem lactose"] }),
    p(4, "bolos", "Bolo de Milho Verde com Coco", "Úmido e cremoso, coberto com coco. Sem lactose. Aprox. 610g.", "bolo-milho-coco.jpg", 23.5, 2, { tags: ["Sem lactose"] }),
    p(5, "bolos", "Bolo Fit de Aveia com Cacau", "Feito com aveia e cacau, sem glúten. Ótimo para o café da tarde.", "bolo-fit.jpg", 28, 6, { tags: ["Sem glúten"] }),
    p(6, "bolos", "Bolo de Maçã com Canela", "Com pedaços de maçã e aquele cheirinho de canela. Aprox. 650g.", "bolo-maca.jpg", 25, 4),
    p(7, "bolos", "Bolo de Milho Tradicional", "Receita de vó, fofinho e caseiro. Aprox. 600g.", "bolo-milho.jpg", 22, 0),

    // Doces no pote
    p(8, "doces-pote", "Furacão de Nutella", "Mousse de Nutella original, Ouro Branco e creme de ninho. 250ml.", "furacao-nutella.jpg", 17.5, 8, { destaque: true }),
    p(9, "doces-pote", "Sabedoria da Atena", "Brownie, creme de ninho e ganache de chocolate. 250ml.", "sabedoria-atena.jpg", 16, 7),
    p(10, "doces-pote", "Bolo de Pote", "Massa pão de ló com recheio cremoso. Escolha o sabor.", "bolo-pote-morango.jpg", 15, 12, {
        opcaoInclusa: { label: "Escolha o sabor", opcoes: ["Morango com ninho", "Choconinho", "Prestígio", "Ninho com Nutella"] },
    }),
    p(11, "doces-pote", "Pavê de Brigadeiro", "Creme branco trufado com brigadeiros e granulado. Marmita 500g.", "pave-brigadeiro.jpg", 24, 3),
    p(12, "doces-pote", "Duo Chocolate", "Metade chocolate ao leite, metade branco. Marmita 500g.", "duo-chocolate.jpg", 24, 2),

    // Tortas e fatias
    p(13, "tortas", "Fatia de Torta Olho de Sogra", "Mousse de mumu, beijinho e ameixa. Fatia generosa.", "olho-de-sogra-fatia.jpg", 13, 6),
    p(14, "tortas", "Slice Cake Chiffon com Nutella", "Massa chiffon de chocolate, branquinho trufado de ninho e Nutella original. Aprox. 350g.", "slice-cake.jpg", 19, 5, { destaque: true }),
    p(15, "tortas", "Tortinha de Limão", "Base de farofa crocante e mousse de limão.", "torta-limao.jpg", 9, 10),
    p(16, "tortas", "Empada de Leite Condensado", "Recheio de ninho com Nutella por cima.", "empada-nutella.jpg", 8, 9),
    p(17, "tortas", "Torta Olho de Sogra Inteira", "Torta inteira para festas e aniversários. Serve 15 pessoas.", "torta-olho-de-sogra.jpg", 110, null, { disponibilidade: "encomenda", prazoDias: 2 }),

    // Cucas
    p(18, "cucas", "Cuca Média (600g)", "Cuca caseira com farofa crocante. Escolha o sabor.", "cucas.jpg", 18, 6, {
        opcaoInclusa: { label: "Escolha o sabor", opcoes: ["Duo chocolate com Nutella", "Banana com canela", "Ouro Branco", "Morango com chocolate"] },
    }),
    p(19, "cucas", "Cuca de Branquinho", "Branquinho com M&M's ou duo chocolate com Nutella.", "cuca-duo.jpg", 12.5, 4),

    // Pães
    p(20, "paes", "Pão de Leite", "O pão mais fofinho do Campo Belo! Aprox. 550g.", "pao-de-leite.jpg", 12, 8, { destaque: true }),
    p(21, "paes", "Pão Recheado", "Aprox. 500g. Escolha o recheio.", "pao-recheado.jpg", 17, 5, {
        opcaoInclusa: { label: "Escolha o recheio", opcoes: ["Frango com requeijão", "Calabresa com queijo", "Carne de panela com cheddar", "Presunto com 4 queijos"] },
    }),
    p(22, "paes", "Pastel de Forno", "Massa leve assada. Também na versão integral.", "pastel-forno.jpg", 7, 15, {
        opcaoInclusa: { label: "Escolha o recheio", opcoes: ["Frango com requeijão", "Carne de panela com cheddar", "Brócolis com ricota", "Calabresa com requeijão", "Integral de frango", "Integral de brócolis com ricota"] },
    }),
    p(23, "paes", "Pão de Aipim", "Sem lactose. Aprox. 500g.", "pao-aipim.jpg", 12, 4, { tags: ["Sem lactose"] }),

    // Salgados e congelados
    p(24, "salgados", "Tortinha Salgada na Marmita", "Recheio de brócolis com ricota. Pronta para assar.", "tortinha-salgada.jpg", 22, 3),
    p(25, "salgados", "Escondidinho", "Congelado. Escolha o tamanho e o sabor.", "escondidinho.jpg", 20, 6, {
        tamanhos: [{ nome: "450g", preco: 20 }, { nome: "790g", preco: 26.5 }],
        opcaoInclusa: { label: "Escolha o sabor", opcoes: ["Guisado com queijo", "Carne de panela com queijo", "Frango com queijo"] },
    }),
    p(26, "salgados", "Escondidinho Fit", "Batata doce ou mandioquinha, com frango ou brócolis e ricota. 450g.", "escondidinho-fit.jpg", 22, 4),
    p(27, "salgados", "Panquecas (4 unidades)", "Mista, calabresa, carne de panela, frango ou brócolis com ricota.", "panquecas.jpg", 13, 8),
    p(28, "salgados", "Feijoada", "Somente com carnes nobres.", "feijoada.jpg", 25, 5, {
        tamanhos: [{ nome: "500ml", preco: 25 }, { nome: "Mais de 1kg", preco: 50 }],
    }),
    p(29, "salgados", "Almôndegas", "Frango com bacon, carne com bacon ou soja.", "almondegas.jpg", 22, 2, {
        tamanhos: [{ nome: "9 unidades", preco: 22 }, { nome: "15 unidades", preco: 28 }],
    }),
];

// Frete: Campo Belo e região (valores de exemplo — editáveis no admin)
const SEED_FRETE = [
    { bairro: "Campo Belo", valor: 0 },
    { bairro: "Girassóis", valor: 4 },
    { bairro: "Vista Alegre", valor: 5 },
    { bairro: "Parque da Matriz", valor: 6 },
    { bairro: "Granja Esperança", valor: 6 },
    { bairro: "Jardim Betânia", valor: 7 },
    { bairro: "Vila Imbuí", valor: 7 },
    { bairro: "Centro (Cachoeirinha)", valor: 8 },
    { bairro: "Parque Marechal Rondon", valor: 9 },
    { bairro: "Gravataí (próximo à divisa)", valor: 12 },
];

const SEED_CONFIG = {
    nomeLoja: "Olimpo Especiarias",
    nomeDona: "Dani",
    whatsapp: "5551999999999",
    heroTag: "Feito em casa, com carinho",
    heroTitulo: "Bolos, doces e pães caseiros",
    heroSubtitulo: "Escolha, coloque no carrinho e receba em casa no Campo Belo e região",
    aviso: "Tele grátis no Campo Belo até às 19h • Em dia de chuva, até às 18h",
    lojaAberta: true,
    entregaDisponivel: true,
    retiradaDisponivel: true,
    endereco: "Bairro Campo Belo — Cachoeirinha/RS",
    retiradaDias: [1, 2, 3, 4, 5, 6],
    retiradaHoraInicio: "09:00",
    retiradaHoraFim: "19:00",
    retiradaIntervalo: 60,
    pedidoMinimo: 10,
    freteGratisAcima: 80,
    fretes: SEED_FRETE,
    instagram: "",
    sobreTexto: "Na Olimpo cada receita é feita em casa, em pequenas fornadas, com ingredientes escolhidos a dedo. Do pão de leite fofinho ao bolo de pote, tudo sai do forno direto para a sua mesa.",
};

const SEED_CUPONS = [
    { id: "BEMVINDO", codigo: "BEMVINDO", tipo: "percentual", valor: 10, valorMinimo: 30, ativo: true },
];

// Gera um histórico de vendas e gastos dos últimos 45 dias (só na demonstração),
// para o admin já abrir com relatórios preenchidos.
function gerarHistoricoDemo() {
    let semente = 42;
    const rnd = () => { semente = (semente * 9301 + 49297) % 233280; return semente / 233280; };
    const movs = [];
    const hoje = new Date();
    const pagamentos = ["Pix", "Pix", "Dinheiro", "Cartão"];
    const vendaveis = SEED_PRODUTOS.filter((x) => x.preco < 60);
    for (let d = 44; d >= 0; d--) {
        const dia = new Date(hoje); dia.setDate(hoje.getDate() - d);
        if (dia.getDay() === 0 && d !== 0) continue; // domingo fechado
        const qtdVendas = d === 0 ? 3 : 3 + Math.floor(rnd() * 6);
        for (let v = 0; v < qtdVendas; v++) {
            const itens = [];
            const nItens = 1 + Math.floor(rnd() * 2);
            for (let i = 0; i < nItens; i++) {
                const prod = vendaveis[Math.floor(rnd() * vendaveis.length)];
                const qtd = rnd() > 0.75 ? 2 : 1;
                itens.push({ id: prod.id, nome: prod.nome, quantidade: qtd, preco: prod.preco });
            }
            const valor = itens.reduce((a, i) => a + i.preco * i.quantidade, 0);
            const hora = new Date(dia); hora.setHours(9 + Math.floor(rnd() * 10), Math.floor(rnd() * 60), 0, 0);
            if (d === 0 && hora > hoje) hora.setTime(hoje.getTime() - (v + 1) * 40 * 60000);
            movs.push({
                tipo: "entrada", categoria: rnd() > 0.45 ? "Venda no balcão" : "Pedido do site",
                descricao: itens.map((i) => `${i.quantidade}x ${i.nome}`).join(", "),
                valor: Math.round(valor * 100) / 100, pagamento: pagamentos[Math.floor(rnd() * pagamentos.length)],
                itens, data: hora.toISOString(),
            });
        }
        // Gastos
        const dataGasto = new Date(dia); dataGasto.setHours(8, 30, 0, 0);
        if (dia.getDay() === 1) movs.push({ tipo: "saida", categoria: "Ingredientes", descricao: "Compra no atacado (farinha, açúcar, ovos, leite)", valor: 290 + Math.round(rnd() * 140), data: dataGasto.toISOString() });
        if (dia.getDay() === 4) movs.push({ tipo: "saida", categoria: "Ingredientes", descricao: "Chocolate, Nutella e leite condensado", valor: 160 + Math.round(rnd() * 90), data: dataGasto.toISOString() });
        if (dia.getDay() === 3 && rnd() > 0.3) movs.push({ tipo: "saida", categoria: "Embalagens", descricao: "Potes, marmitas e sacolas", valor: 70 + Math.round(rnd() * 40), data: dataGasto.toISOString() });
        if (dia.getDate() === 10) movs.push({ tipo: "saida", categoria: "Gás", descricao: "Botijão de gás", valor: 125, data: dataGasto.toISOString() });
        if (dia.getDate() === 15) movs.push({ tipo: "saida", categoria: "Luz e água", descricao: "Conta de luz", valor: 210, data: dataGasto.toISOString() });
        if (dia.getDay() === 6) movs.push({ tipo: "saida", categoria: "Entregador", descricao: "Tele terceirizada da semana", valor: 40 + Math.round(rnd() * 20), data: dataGasto.toISOString() });
    }
    return movs;
}

function gerarPedidosDemo() {
    const agora = Date.now();
    return [
        {
            codigo: "OL7K2M", status: "novo", criadoEm: new Date(agora - 12 * 60000).toISOString(),
            cliente: "Maria Aparecida Souza", telefone: "(51) 99876-5432",
            tipoEntrega: "Entrega", bairro: "Campo Belo", endereco: "Rua das Flores, 120 — casa dos fundos",
            pagamento: "Pix", frete: 0, desconto: 0,
            itens: [
                { id: 20, nome: "Pão de Leite", quantidade: 2, preco: 12 },
                { id: 8, nome: "Furacão de Nutella", quantidade: 1, preco: 17.5 },
            ],
            total: 41.5,
        },
        {
            codigo: "OL3PQ8", status: "novo", criadoEm: new Date(agora - 45 * 60000).toISOString(),
            cliente: "Seu João Pereira", telefone: "(51) 98123-4567",
            tipoEntrega: "Retirada", retirada: "Hoje às 17:00",
            pagamento: "Dinheiro (troco para R$ 50)", frete: 0, desconto: 0,
            itens: [{ id: 1, nome: "Bolo de Maracujá com Fruta Fresca", quantidade: 1, preco: 28 }],
            total: 28,
        },
    ];
}

// ─── IMPLEMENTAÇÃO ───────────────────────────────────────────────────────────
const CHAVE_DEMO = "olimpo_demo_v1";

const DadosDemo = {
    _ler() {
        let banco = null;
        try { banco = JSON.parse(localStorage.getItem(CHAVE_DEMO)); } catch (e) { banco = null; }
        if (!banco) banco = this._criarBancoInicial();
        return banco;
    },
    _gravar(banco) {
        try { localStorage.setItem(CHAVE_DEMO, JSON.stringify(banco)); }
        catch (e) { console.warn("Não foi possível salvar no navegador:", e); alert("Atenção: o navegador está sem espaço para salvar. Tente usar fotos menores."); }
    },
    _criarBancoInicial() {
        const idx = (lista, campo) => Object.fromEntries(lista.map((x, i) => [String(x[campo] ?? i), x]));
        const comId = (lista, prefixo) => lista.map((x, i) => ({ ...x, docId: `${prefixo}${String(i).padStart(4, "0")}` }));
        const banco = {
            produtos: idx(SEED_PRODUTOS, "id"),
            categorias: idx(SEED_CATEGORIAS, "id"),
            cupons: idx(SEED_CUPONS, "id"),
            configuracoes: { geral: SEED_CONFIG },
            movimentacoes: idx(comId(gerarHistoricoDemo(), "m"), "docId"),
            pedidos: idx(gerarPedidosDemo(), "codigo"),
        };
        this._gravar(banco);
        return banco;
    },
    async listar(col) {
        const banco = this._ler();
        return Object.entries(banco[col] || {}).map(([docId, d]) => ({ ...d, docId }));
    },
    async obter(col, id) {
        const banco = this._ler();
        const d = (banco[col] || {})[String(id)];
        return d ? { ...d, docId: String(id) } : null;
    },
    async salvar(col, id, dados) {
        const banco = this._ler();
        banco[col] = banco[col] || {};
        const limpo = { ...dados }; delete limpo.docId;
        banco[col][String(id)] = { ...(banco[col][String(id)] || {}), ...limpo };
        this._gravar(banco);
    },
    async adicionar(col, dados) {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        await this.salvar(col, id, dados);
        return id;
    },
    async excluir(col, id) {
        const banco = this._ler();
        if (banco[col]) delete banco[col][String(id)];
        this._gravar(banco);
    },
    async entrar(_email, senha) {
        if (senha === SENHA_DEMO) { sessionStorage.setItem("olimpo_logado", "1"); return true; }
        throw new Error("Senha incorreta");
    },
    async sair() { sessionStorage.removeItem("olimpo_logado"); },
    estaLogado(cb) { cb(sessionStorage.getItem("olimpo_logado") === "1"); },
    resetar() { localStorage.removeItem(CHAVE_DEMO); },
};

const DadosFirebase = {
    _db: null,
    _init() {
        if (this._db) return;
        firebase.initializeApp(FIREBASE_CONFIG);
        this._db = firebase.firestore();
    },
    async listar(col) {
        this._init();
        const snap = await this._db.collection(col).get();
        return snap.docs.map((d) => ({ ...d.data(), docId: d.id }));
    },
    async obter(col, id) {
        this._init();
        const d = await this._db.collection(col).doc(String(id)).get();
        return d.exists ? { ...d.data(), docId: d.id } : null;
    },
    async salvar(col, id, dados) {
        this._init();
        const limpo = { ...dados }; delete limpo.docId;
        await this._db.collection(col).doc(String(id)).set(limpo, { merge: true });
    },
    async adicionar(col, dados) {
        this._init();
        const ref = await this._db.collection(col).add(dados);
        return ref.id;
    },
    async excluir(col, id) {
        this._init();
        await this._db.collection(col).doc(String(id)).delete();
    },
    async entrar(email, senha) {
        this._init();
        await firebase.auth().signInWithEmailAndPassword(email, senha);
        return true;
    },
    async sair() { this._init(); await firebase.auth().signOut(); },
    estaLogado(cb) { this._init(); firebase.auth().onAuthStateChanged((u) => cb(!!u)); },
    resetar() {},
};

const MODO_DEMO = !FIREBASE_CONFIG;
const Dados = MODO_DEMO ? DadosDemo : DadosFirebase;

// Valores padrão (usados quando a configuração salva não tem algum campo)
const CONFIG_PADRAO = SEED_CONFIG;

// Utilitários compartilhados
const formatarMoeda = (v) => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const escaparHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
