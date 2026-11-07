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

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAU9m89_OAsxJy7MggJkdY88wmvuCISALU",
    authDomain: "mamonas-acai.firebaseapp.com",
    projectId: "mamonas-acai", // projeto reaproveitado (nome no console: Olimpo); o ID não muda
    storageBucket: "mamonas-acai.firebasestorage.app",
    messagingSenderId: "778665319873",
    appId: "1:778665319873:web:bd7b95b2f65f5ac08aa340",
};
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
    { id: "natal", nome: "Especiais de Natal", icone: "fa-gifts", ordem: 1 },
    { id: "paes", nome: "Pães", icone: "fa-bread-slice", ordem: 2 },
    { id: "cuca-alema", nome: "Cuca alemã", icone: "fa-cookie", ordem: 3 },
    { id: "salgados", nome: "Salgados", icone: "fa-burger", ordem: 4 },
    { id: "pastel-de-forno", nome: "Pastel de forno", icone: "fa-pizza-slice", ordem: 5 },
    { id: "paozinho-de-batata", nome: "Pãozinho de batata", icone: "fa-bread-slice", ordem: 6 },
    { id: "bolos", nome: "Bolos", icone: "fa-cake-candles", ordem: 7 },
    { id: "empadas-doces", nome: "Empadas Doces", icone: "fa-cookie-bite", ordem: 8 },
    { id: "bolachinhas-artesanais", nome: "Bolachinhas artesanais", icone: "fa-cookie", ordem: 9 },
    { id: "doces", nome: "Doces", icone: "fa-ice-cream", ordem: 10 },
    { id: "presentes", nome: "Presentes", icone: "fa-gift", ordem: 11 },
    { id: "almondegas-congeladas", nome: "Almôndegas Congeladas", icone: "fa-snowflake", ordem: 12 },
    { id: "congelados", nome: "Congelados", icone: "fa-snowflake", ordem: 13 },
    { id: "escondidinho-congelado", nome: "Escondidinho congelado", icone: "fa-snowflake", ordem: 14 },
    { id: "sopas-e-cremes-congelados", nome: "Sopas e Cremes Congelados", icone: "fa-mug-hot", ordem: 15 },
    { id: "bebidas", nome: "Bebidas", icone: "fa-bottle-water", ordem: 16 },
    { id: "sal-grosso-temperado", nome: "Sal grosso temperado", icone: "fa-jar", ordem: 17 },
];

// Produtos: tudo o que está no iFood da Olimpo (nome, descrição, foto e preço do iFood),
// mais os Especiais de Natal (encomenda). A conferência dos preços é feita pelo painel.
const p = (id, categoria, nome, descricao, imagem, preco, estoque, extra = {}) => ({
    id, categoria, nome, descricao, imagem: IMG + imagem, preco,
    estoque, estoqueMinimo: 2, ativo: true, destaque: false, ...extra,
});

const SEED_PRODUTOS = [
    // Especiais de Natal
    p(1, "natal", "Panetone trufado", "Panetone artesanal trufado, recheado e decorado. Consulte os sabores de recheio.", "natal-panetone-trufado-1.jpg", 70, undefined, { disponibilidade: "encomenda" }),
    p(2, "natal", "Panetone tradicional", "Panetone artesanal fofinho, com frutas cristalizadas ou gotas de chocolate.", "natal-panetone-trufado-2.jpg", 30, undefined, { opcaoInclusa: { label: "Escolha a versão", opcoes: ["Frutas cristalizadas", "Gotas de chocolate"] }, disponibilidade: "encomenda" }),
    p(3, "natal", "Rocambole", "Rocambole festivo. Consulte os sabores.", "natal-rocambole.jpg", 55, undefined, { tamanhos: [{ nome: "Aprox. 1kg", preco: 55 }, { nome: "Aprox. 1,5kg", preco: 95 }], disponibilidade: "encomenda" }),
    p(4, "natal", "Bolo de festas", "Bolos decorados para as festas, a partir de R$ 50,00. Consulte os sabores e tamanhos.", "natal-bolos.jpg", 50, undefined, { disponibilidade: "encomenda" }),
    p(5, "natal", "Salada de fruta gourmet", "Salada de frutas com mousse de Ninho.", "natal-salada-fruta.jpg", 45, undefined, { tamanhos: [{ nome: "600ml", preco: 45 }, { nome: "2 litros", preco: 80 }], disponibilidade: "encomenda" }),
    p(6, "natal", "Deusa de morango", "Nata, leite condensado, merengue crocante, morangos e raspas de chocolate meio amargo. Aprox. 1,3kg.", "natal-deusa-morango.jpg", 85, undefined, { disponibilidade: "encomenda" }),
    p(7, "natal", "Tempestade de stikadinho", "Creme de stikadinho, Oreo, creme de Ninho e pedaços de stikadinho.", "natal-tempestade.jpg", 45, undefined, { tamanhos: [{ nome: "Média", preco: 45 }, { nome: "Grande", preco: 80 }], disponibilidade: "encomenda" }),
    p(8, "natal", "Torta de limão", "Torta de limão com base de farofa amanteigada e mousse de limão.", "natal-tortinha-limao.jpg", 40, undefined, { disponibilidade: "encomenda" }),
    p(9, "natal", "Torta Ouro Branco", "Torta com bombom Ouro Branco e cobertura de chocolate.", "natal-tortinha-ouro-branco.jpg", 46, undefined, { disponibilidade: "encomenda" }),
    p(10, "natal", "Slice cake", "Ninho com Nutella original OU branquinho trufado de maracujá com ganache real com chocolate meio amargo.", "natal-slice-cake.jpg", 90, undefined, { tamanhos: [{ nome: "Meia", preco: 90 }, { nome: "Inteira", preco: 170 }], opcaoInclusa: { label: "Escolha o sabor", opcoes: ["Ninho com Nutella original", "Branquinho trufado de maracujá com ganache"] }, disponibilidade: "encomenda" }),
    p(11, "natal", "Torta fria", "Torta fria salgada. Aprox. 2,3kg.", "natal-torta-fria.jpg", 115, undefined, { opcaoInclusa: { label: "Escolha o sabor", opcoes: ["Frango", "Atum", "Legumes"] }, disponibilidade: "encomenda" }),
    p(12, "natal", "Quiche", "Quiche artesanal. Aprox. 600g. Consulte os sabores.", "natal-quiche.jpg", 42, undefined, { disponibilidade: "encomenda" }),
    p(13, "natal", "Mousse", "Mousse cremoso para as festas.", "natal-mousse.jpg", 40, undefined, { tamanhos: [{ nome: "Média", preco: 40 }, { nome: "Grande", preco: 80 }], opcaoInclusa: { label: "Escolha o sabor", opcoes: ["Chocolate", "Morango", "Limão", "Maracujá"] }, disponibilidade: "encomenda" }),
    p(14, "natal", "Arroz doce", "Arroz doce com leite condensado.", "natal-arroz-doce.jpg", 38, undefined, { tamanhos: [{ nome: "Média", preco: 38 }, { nome: "Grande", preco: 70 }], disponibilidade: "encomenda" }),
    p(15, "natal", "Torta triplo mousse", "Branquinho trufado, base de farofa de Oreo, mousse de chocolate trufado, ganache real com chocolate meio amargo e mousse de Oreo trufado.", "natal-torta-triplo-mousse.jpg", 85, undefined, { disponibilidade: "encomenda" }),
    p(16, "natal", "Cassata - torta de sorvete", "A legítima torta de sorvete. Aprox. 1,2kg. Consulte os sabores disponíveis.", "natal-cassata.jpg", 75, undefined, { disponibilidade: "encomenda" }),
    p(17, "natal", "Banoffe Olimpo", "Base de farofa crocante de bolacha, bananas, mumu, chantininho, Ninho e raspas de chocolate meio amargo.", "natal-banoffe.jpg", 85, undefined, { disponibilidade: "encomenda" }),
    p(18, "natal", "Travessa da felicidade", "Morango, uva, branquinho trufado e brigadeiro trufado.", "natal-travessa-felicidade.jpg", 95, undefined, { disponibilidade: "encomenda" }),
    p(19, "natal", "Torta Oreo", "Farofa crocante de Oreo, branquinho trufado e ganache real com chocolate meio amargo. Aprox. 1kg.", "natal-torta-oreo.jpg", 80, undefined, { disponibilidade: "encomenda" }),
    p(20, "natal", "Torta de bolacha Olimpo", "Bolacha maisena, nata, leite condensado, Ouro Branco picado e ganache real meio amargo.", "natal-torta-bolacha.jpg", 45, undefined, { tamanhos: [{ nome: "Média", preco: 45 }, { nome: "Grande", preco: 90 }], disponibilidade: "encomenda" }),
    p(21, "natal", "Torta chapinha", "Torta chapinha. Aprox. 1kg. Consulte os sabores.", "natal-torta-chapinha.jpg", 70, undefined, { disponibilidade: "encomenda" }),
    p(22, "natal", "Sabedoria de Atena", "Ganache real com chocolate meio amargo, brownie e creme de Ninho.", "natal-sabedoria-atena.jpg", 48, undefined, { tamanhos: [{ nome: "Aprox. 600g", preco: 48 }, { nome: "Aprox. 1,2kg", preco: 95 }], disponibilidade: "encomenda" }),
    p(23, "natal", "Ambrosia", "Ambrosia portuguesa, sem glúten. Aprox. 660g.", "if-ambrosia-tamanho-familia.jpg", 40, undefined, { tags: ["Sem glúten"], disponibilidade: "encomenda" }),
    p(24, "natal", "Furacão de Nutella", "Mousse de Nutella original, Ouro Branco e creme de Ninho. Aprox. 1kg.", "furacao-nutella.jpg", 110, undefined, { disponibilidade: "encomenda" }),
    p(25, "natal", "Cheesecake Olimpo", "Cheesecake da casa. Consulte os sabores disponíveis.", "foto-em-breve.jpg", 75, undefined, { disponibilidade: "encomenda" }),
    p(26, "natal", "Torta de paçoca", "Nata, leite condensado, Oreo e paçoquinha.", "if-torta-de-pacoquinha.jpg", 70, undefined, { disponibilidade: "encomenda" }),
    p(27, "natal", "Pudim de claras", "Pudim de claras, leve como uma nuvem. Calda opcional: frutas vermelhas, ameixa, creme de Ninho ou Nutella (diga qual nas observações).", "if-pudim-de-claras.jpg", 27, undefined, { tamanhos: [{ nome: "Sem calda", preco: 27 }, { nome: "Com calda (+R$ 10)", preco: 37 }], disponibilidade: "encomenda" }),
    p(28, "natal", "Nevasca de abacaxi", "Creme belga, abacaxi, bolacha champanhe, ganache de chocolate branco e raspas de chocolate meio amargo. Aprox. 800g.", "foto-em-breve.jpg", 70, undefined, { disponibilidade: "encomenda" }),
    p(29, "natal", "Profecia de Apolo", "Bolacha champanhe, ganache real com chocolate meio amargo e branquinho trufado. Aprox. 1,2kg.", "foto-em-breve.jpg", 85, undefined, { disponibilidade: "encomenda" }),
    p(30, "natal", "Duelo de Titãs", "Branquinho trufado, morangos frescos, brigadeiro trufado, Ninho e granulé Melken. Aprox. 900g.", "if-duelo-de-titas.jpg", 85, undefined, { disponibilidade: "encomenda" }),
    p(31, "natal", "Suspiro de Afrodite", "Branquinho trufado, chantininho, raspas de chocolate meio amargo, Ninho e Ouro Branco. Aprox. 900g.", "foto-em-breve.jpg", 85, undefined, { disponibilidade: "encomenda" }),
    p(32, "natal", "Torta Holandesa", "Base de farofa crocante de bolacha, nata, leite condensado, ganache real com chocolate meio amargo e bolachas tortinhas. Aprox. 1,2kg.", "foto-em-breve.jpg", 88, undefined, { disponibilidade: "encomenda" }),
    p(33, "natal", "Pudim", "Calda opcional: frutas vermelhas, ameixa, creme de Ninho ou Nutella (diga qual nas observações).", "if-pudim-de-leite-condensado-com-baunilha.jpg", 48, undefined, { tamanhos: [{ nome: "Sem calda", preco: 48 }, { nome: "Com calda (+R$ 10)", preco: 58 }], opcaoInclusa: { label: "Escolha o sabor", opcoes: ["Tradicional", "Chocolate branco", "Negrinho", "Café", "Milho verde", "Coco", "Mumu"] }, disponibilidade: "encomenda" }),
    // Pães
    p(34, "paes", "Pão caseiro de leite", "O pão caseiro de leite, quentinho e mais fofinho que você irá provar, o único pão que você vai provar que fica uma semana como se tivesse saído do forno, muito fofinho", "if-pao-caseiro-de-leite.jpg", 20.5, 4),
    p(35, "paes", "Pão de aipim", "Um fantástico pão caseiro de aipim fofinho como vc nunca viu, uma tentação para seu café", "if-pao-de-aipim.jpg", 20.5, 4),
    p(36, "paes", "Pão integral com aveia e grãos", "Pão integral com aveia, chia e linhaça, seu pãozinho saudável e sem perder os sabor.", "if-pao-integral-com-aveia-e-graos.jpg", 20, 4),
    p(37, "paes", "Pão recheado de carne de panela com cheddar", "Reveja seu conceito de pão recheado, pão todo com chimichuri e orégano e recheio de carne de panela com cheddar com mais de meio kg", "if-pao-recheado-de-carne-de-panela-com-cheddar.jpg", 27.8, 4),
    p(38, "paes", "Pão recheado com frango e requeijão", "Reveja seu conceito de pão recheado, pão todo com chimichuri e orégano e recheio de frango e requeijão com mais de meio kg", "if-pao-recheado-com-frango-e-requeijao.jpg", 27.8, 4),
    p(39, "paes", "Pão recheado de calabresa com queijo", "Reveja seu conceito de pão recheado, pão todo com chimichuri e orégano e calabresa picada , recheado com queijo com mais de meio kg", "if-pao-recheado-de-calabresa-com-queijo.jpg", 27.8, 4),
    // Cuca alemã
    p(40, "cuca-alema", "Cuca Duo chocolate com creme de avelã (Nutella)", "A verdadeira cuca alemã, cobertura decorativa de creme de avelã (Nutella) e explodindo recheio de chocolate branco e preto", "if-cuca-duo-chocolate-com-creme-de-avela-nutella.jpg", 19.5, 4),
    p(41, "cuca-alema", "Cuca de mumu", "Cuca receita Original alemã, explodindo recheio de mumu, de pura tentação", "if-cuca-de-mumu.jpg", 19, 4),
    p(42, "cuca-alema", "Cuca média duo chocolate com creme de avelã (Nutella)", "A verdadeira cuca alemã, decoração com cobertura de creme de avelã (Nutella) e explodindo recheio de chocolate branco e preto", "if-cuca-media-duo-chocolate-com-creme-de-avela-nutella.jpg", 28.5, 4),
    p(43, "cuca-alema", "Cuca média de abacaxi", "Cuca alemã de abacaxi com leite condensado, explodindo recheio", "if-cuca-media-de-abacaxi.jpg", 28.5, 4),
    p(44, "cuca-alema", "Cuca média de Ouro Branco", "Cuca de Ouro Branco com chocolate branco, receita Original alemã, explodindo recheio ( recheio cremoso diferente das cucas normais).", "if-cuca-media-de-ouro-branco.jpg", 28.5, 4),
    p(45, "cuca-alema", "Cuca média de beijinho", "A verdadeira cuca alemã, explodindo recheio de beijinho com puro Leite condensado com coco", "if-cuca-media-de-beijinho.jpg", 28.5, 4),
    p(46, "cuca-alema", "Cuca média de banana com Nutella", "A verdadeira cuca alemã, explodindo recheio de banana com Nutella Original", "if-cuca-media-de-banana-com-nutella.jpg", 28.5, 4),
    // Salgados
    p(47, "salgados", "Enroladão de presunto e queijo", "Salgado assado enorme do tamanho da sua fome, enroladao super fofinho de presunto e queijo, com chimichuri", "if-enroladao-de-presunto-e-queijo.jpg", 10, 4),
    p(48, "salgados", "Esfiha de frango", "Esfiha de frango do tamanho da sua fome, super recheada, com molho e recheio artesanal", "if-esfiha-de-frango.jpg", 11, 4),
    p(49, "salgados", "Hambúrguer de forno gigante", "Hambúrguer de forno, com um hambúrguer de carne feito totalmente artesanal e muito queijo e requeijão, salgado do tamanho da sua fome", "if-hamburguer-de-forno-gigante.jpg", 14.5, 4),
    p(50, "salgados", "Torta salgada de carne de panela com cheddar", "Torta salgada, tipo um bolo salgado, recheado de carne de panela com cheddar, massa fofinha e leve com um recheio totalmente artesanal", "if-torta-salgada-de-carne-de-panela-com-cheddar.jpg", 17, 4),
    // Pastel de forno
    p(51, "pastel-de-forno", "Pastel de forno de Frango com requeijão", "Pastel de forno de frango com requeijão", "if-pastel-de-forno-de-frango-com-requeijao.jpg", 10, 4),
    p(52, "pastel-de-forno", "Pastel de forno de Brócolis com ricota", "", "if-pastel-de-forno-de-brocolis-com-ricota.jpg", 10, 4),
    p(53, "pastel-de-forno", "Pastel de forno integral de carne de panela", "Pastel de forno integral totalmente artesanal com recheio feito de carne de panela com molho fresco de tomate e ervas frescas", "if-pastel-de-forno-integral-de-carne-de-panela.jpg", 10.5, 4),
    // Pãozinho de batata
    p(54, "paozinho-de-batata", "Pão de batata com Frango e requeijão", "Pão de batata recheado com frango e requeijão, molho artesanal, explodindo recheio", "if-pao-de-batata-com-frango-e-requeijao.jpg", 10, 4),
    p(55, "paozinho-de-batata", "Pão de batata de Brócolis com ricota", "Pão de batata recheado com brócolis, ricota e molho artesanal.", "if-pao-de-batata-de-brocolis-com-ricota.jpg", 10, 4),
    // Bolos
    p(56, "bolos", "Bolo de maracujá com fruta fresca", "Bolo de maracujá, feito com a fruta fresca, uma delícia, super fofinho e molhadinho, sem lactose", "if-bolo-de-maracuja-com-fruta-fresca.jpg", 18.5, 4),
    p(57, "bolos", "Cookie na marmita recheado com Nutella", "Cookie quentinho, totalmente artesanal na marmita recheado com Nutella Original e cheio de gotas de chocolate,", "if-cookie-na-marmita-recheado-com-nutella.jpg", 27, 4),
    p(58, "bolos", "Fatia de bolo gelado avalanche de Ninho", "Bolo gelado com a massa sabor Ninho, calda de Ninho com leite condensado e cobertura de creme de Ninho com Ninho, chega ser uma afronta de tanto Ninho", "if-fatia-de-bolo-gelado-avalanche-de-ninho.jpg", 15.5, 4),
    p(59, "bolos", "Bolo de chocolate com creme de avelã (Nutella) e chocolate branco", "Bolo de chocolate 50%com cobertura de creme de avelã (Nutella) com chocolate branco, bem fofinha", "if-bolo-de-chocolate-com-creme-de-avela-nutella-e-chocolate-bra.jpg", 20.5, 4),
    p(60, "bolos", "Bolo de maracujá com geléia artesanal de maracujá", "Bolo de maracujá, feito com a fruta fresca, com uma deliciosa cobertura de geleia artesanal de maracujá, uma delícia, super fofinho e molhadinho, sem lactose", "if-bolo-de-maracuja-com-geleia-artesanal-de-maracuja.jpg", 42, 4),
    p(61, "bolos", "Bolo Médio de chocolate com creme de avelã (Nutella) e chocolate branco", "Bolo de chocolate com cacau 50% com cobertura de creme de avelã (\"Nutella\") com chocolate branco bem fofinho e molhadinho", "if-bolo-medio-de-chocolate-com-creme-de-avela-nutella-e-chocola.jpg", 30, 4),
    p(62, "bolos", "Fatia de Bolo gelado de abacaxi com coco", "Fatia incrível de bolo gelado de abacaxi com coco e cobertura de branquinho trufado, bolo macio e molhadinho que derrete na boca, combinação perfeita e equilíbrio de sabores", "if-fatia-de-bolo-gelado-de-abacaxi-com-coco.jpg", 17.5, 4),
    p(63, "bolos", "Fatia de torta olho de sogra", "Fatia de torta amanteigada estilo torta anos 80 olho de sogra, recheado com mousse doce de leite, ameixa , beijinho e cobertura de chantininho", "if-fatia-de-torta-olho-de-sogra.jpg", 18.9, 4),
    p(64, "bolos", "Bolo de chocolate com branquinho e brigadeiro", "Bolo de chocolate com cobertura de branquinho trufado, e brigadeiros", "if-bolo-de-chocolate-com-branquinho-e-brigadeiro.jpg", 18, 4),
    p(65, "bolos", "Bolo mesclado com baunilha e cacau 50%", "Bolo mesclado de baunilha com chocolate 50%, aquele bolo fofinho com sabor de comida de vó", "if-bolo-mesclado-com-baunilha-e-cacau-50.jpg", 42, 4),
    p(66, "bolos", "Mini bolo vulcão de iogurte com Ninho", "Mini bolo vulcão de iogurte natural com cobertura de creme de Ninho e Ninho, uma delicadeza, uma delícia para adoçar seu café.", "if-mini-bolo-vulcao-de-iogurte-com-ninho.jpg", 12, 4, { destaque: true }),
    p(67, "bolos", "Bolo vulcão de chocolate com Nutella Original e Ninho", "Bolo vulcão de chocolate 50% com recheio de Nutella Original e creme de Ninho, uma tentação a cada pedaço", "if-bolo-vulcao-de-chocolate-com-nutella-original-e-ninho.jpg", 70, 4),
    p(68, "bolos", "Bolo de nozes", "Bolo de nozes com cobertura de branquinho com nozes", "if-bolo-de-nozes.jpg", 21, 4),
    p(69, "bolos", "Bolo piscininha de stikadinho", "Bolo piscininha de cacau 50% com cobertura de creme de stikadinho, Nutella (creme de avelã) nas bordas com raspas de chocolate meio amargo e pedaços de stikadinho", "if-bolo-piscininha-de-stikadinho.jpg", 68, 4),
    p(70, "bolos", "Bolo de chocolate recheado com brigadeiro e Ouro Branco", "Bolo de chocolate 50% com recheio de brigadeiro, Ouro Branco e cobertura de branquinho trufado com brigadeiros", "if-bolo-de-chocolate-recheado-com-brigadeiro-e-ouro-branco.jpg", 76, 4),
    p(71, "bolos", "Bolo cremoso de aipim", "Bolo cremoso de aipim com leite condensado sem farinha de trigo", "if-bolo-cremoso-de-aipim.jpg", 18.5, 4),
    p(72, "bolos", "Bolo piscininha de milho verde com coco", "Bolo piscininha de Ninho verde com coco e cobertura de beijinho trufado, mega fofinho e cheio de recheio cremoso", "if-bolo-piscininha-de-milho-verde-com-coco.jpg", 40, 4, { destaque: true }),
    p(73, "bolos", "Bolo de cenoura com Nutella Original", "Delicioso bolo de cenoura e cobertura de Nutella Original, super fofinho", "if-bolo-de-cenoura-com-nutella-original.jpg", 57, 4),
    p(74, "bolos", "Bolo de paçoquinha com cobertura de branquinho trufado", "Bolo de paçoquinha com cobertura de branquinho trufado com paçoquinha, doçura na medida certa com aquela crocancia que só a paçoquinha tem", "if-bolo-de-pacoquinha-com-cobertura-de-branquinho-trufado.jpg", 19.5, 4),
    p(75, "bolos", "Bolo de maçã com canela", "Bolo de maçã com canela, massa amanteigada bem fofinho", "if-bolo-de-maca-com-canela.jpg", 35, 4),
    p(76, "bolos", "Bolo pequeno de maçã com canela", "Bolo de maçã com canela, massa amanteigada bem fofinho", "if-bolo-pequeno-de-maca-com-canela.jpg", 16.4, 4),
    p(77, "bolos", "Queijadinha na marmita", "Deliciosa queijadinha cremosa com coco e queijo na marmita", "if-queijadinha-na-marmita.jpg", 16.99, 4),
    p(78, "bolos", "Torta Oreo", "Torta Oreo, impossível resistir a essa delícia dos Deuses, branquinho trufado, base de farofa de Oreo, branquinho trufado, ganache real com chocolate meio amargo, e Granule Melken", "if-torta-oreo.jpg", 130, 4),
    p(79, "bolos", "Meia torta de chocolate com Ouro Branco", "Incrível torta de chocolate 50% bem molhadinha e geladinha, recheada com branquinho trufado e Ouro Branco e cobertura de ganache real com chocolate meio amargo com raspas de chocolate, chega a ser um desaforo", "if-meia-torta-de-chocolate-com-ouro-branco.jpg", 66, 4),
    p(80, "bolos", "Bolo de milho verde com goiabada", "Charmoso Bolo de milho verde com corações de goiabada, aquele sabor de casa de vó, super fofinho e molhadinho", "if-bolo-de-milho-verde-com-goiabada.jpg", 45, 4),
    p(81, "bolos", "Fatia bolo de banana", "Fatia de Bolo de banana caramelizada, uma delícia para seu café", "if-fatia-bolo-de-banana.jpg", 11.5, 4),
    p(82, "bolos", "Meia torta de cenoura com brigadeiro", "Meia torta , Bolo de cenoura com cobertura de brigadeiro, e recheio de brigadeiro super fofinho e molhadinho", "if-meia-torta-de-cenoura-com-brigadeiro.jpg", 53, 4),
    p(83, "bolos", "Bolo Fit de aveia com cacau", "Bolo fit de aveia com cacau 50%, molhadinho e docinho sem ser calórico. Sem farinha de trigo", "if-bolo-fit-de-aveia-com-cacau.jpg", 40, 4),
    p(84, "bolos", "Meia torta de nozes", "Deliciosa torta tipo chapinha de bolo de nozes, recheada com branquinho trufado e nozes e cobertura de branquinho trufado com nozes, uma tentação a cada fatia", "if-meia-torta-de-nozes.jpg", 66, 4),
    // Empadas Doces
    p(85, "empadas-doces", "Empada Leite condensado e Ninho", "Empada doce de leite condensado, Ninho e creme de avelã (Nutella) na decoração, uma completa tentação em forma de doce. Aproximadamente 120gr", "if-empada-leite-condensado-e-ninho.jpg", 14, 4),
    // Bolachinhas artesanais
    p(86, "bolachinhas-artesanais", "Pastelzinho suíço de goiabada", "Pastelzinho suíço de goiabada, amanteigado, se desmancha na boca, Bandeja com 9 unidades", "if-pastelzinho-suico-de-goiabada.jpg", 22, 4),
    // Doces
    p(87, "doces", "Ambrosia", "Ambrosia portuguesa receita Original, pote de 250ml.", "if-ambrosia.jpg", 18.5, 4),
    p(88, "doces", "Duelo de Titãs", "Copo contendo a felicidade digna de deuses do Olimpo, brigadeiro cremoso trufado, morangos frescos cobertos por branquinho trufado com chocolate branco, um toque de Ninho e Granule melken, chega ser um absurdo de tão perfeito", "if-duelo-de-titas.jpg", 24.5, 4),
    p(89, "doces", "Pudim de leite condensado com baunilha", "Pudim de leite condensado com baunilha, mais de 1kg de pura felicidade", "if-pudim-de-leite-condensado-com-baunilha.jpg", 67, 4),
    p(90, "doces", "Ambrosia tamanho família", "Ambrosia receita Original portuguesa, pote tamanho família de muito sabor", "if-ambrosia-tamanho-familia.jpg", 52, 4),
    p(91, "doces", "Banoffe Olimpo", "Banoffe no pote na versão Dos Deuses do Olimpo, bolachas crocantes, mumu, banana, chantinho com raspas de chocolate meio amargo, impossível resistir.", "if-banoffe-olimpo.jpg", 20, 4),
    p(92, "doces", "Brownie com Nutella da Rê", "Os mais famosos brownies da região, brownie com gotas de Nutella, com aquela fantástica casquinha crocante, Nutella Original agregada na massa e aquele estonteante recheio cremoso que só um bronwie feito com cacau 50% e chocolate nobre é capaz de proporcionar. Vem se lambuzar com essa tentação da nossa parceira Brownie da Rê! Tamanho 6x6cm", "if-brownie-com-nutella-da-re.jpg", 9, 4),
    p(93, "doces", "Fatia de rocambole de morango com Ninho", "Fatia de Rocambole de morango, nata, chantinho e Ninho, suavidade e sabor inigualável num doce só, não perca tempo e peça já sua fatia do céu .", "if-fatia-de-rocambole-de-morango-com-ninho.jpg", 18, 4),
    p(94, "doces", "Pudim de claras", "Pudim de claras, suave e leve como uma nuvem, se desmancha na boca.", "if-pudim-de-claras.jpg", 32, 4),
    p(95, "doces", "Brownie de stikadinho da Rê", "Os mais famosos brownies da região, brownie de sticadinho, com aquela fantástica casquinha crocante e aquele estonteante recheio cremoso que só um bronwie feito com cacau 50% e chocolate nobre é capaz de proporcionar. Vem se lambuzar com essa tentação da nossa parceira Brownie da Rê!Tamanho 6x6cm", "if-brownie-de-stikadinho-da-re.jpg", 9, 4),
    p(96, "doces", "Cassata - Torta de sorvete individual", "Cassata , a legitima torta de sorvete, creme belga, merengue crocante, com uma cobertura de chocolate com Ouro Branco, Sonho de Valsa, Oreo, mms ou Ninho, a cobertura de cima conforme disponibilidade em estoque", "if-cassata-torta-de-sorvete-individual.jpg", 20.5, 4),
    p(97, "doces", "Brownie de Ninho com Nutella", "Os mais famosos brownies da região, brownie de Ninho com gotas de Nutella, com aquela fantástica casquinha crocante, Nutella Original agregada na massa e aquele estonteante recheio cremoso que só um bronwie feito verdadeiro Ninho em pó e chocolate nobre é capaz de proporcionar. Vem se lambuzar com essa tentação da nossa parceira Brownie da Rê! Tamanho 6x6cm", "if-brownie-de-ninho-com-nutella.jpg", 9, 4),
    p(98, "doces", "Cassata - Torta de sorvete média", "Cassata , a legitima torta de sorvete, creme belga, merengue crocante, com uma cobertura de chocolate com Ouro Branco, Sonho de Valsa, Oreo, mms ou Ninho, a cobertura de cima conforme disponibilidade em estoque", "if-cassata-torta-de-sorvete-media.jpg", 40, 4),
    p(99, "doces", "Brownie de Ouro Branco", "Os mais famosos brownies da região, brownie de Ouro Branco com aquela fantástica casquinha crocante e aquele estonteante recheio cremoso que só um bronwie feito com cacau 50% e chocolate nobre é capaz de proporcionar. Vem se lambuzar com essa tentação da nossa parceira Brownie da Rê!Tamanho 6x6cm", "if-brownie-de-ouro-branco.jpg", 9, 4),
    p(100, "doces", "Brownie de Kit Kat", "Os mais famosos brownies da região, brownie de Kit Kat, com aquela fantástica casquinha crocante e aquele estonteante recheio cremoso que só um bronwie feito com cacau 50% e chocolate nobre é capaz de proporcionar. Vem se lambuzar com essa tentação da nossa parceira Brownie da Rê!Tamanho 6x6cm", "if-brownie-de-kit-kat.jpg", 9, 4),
    p(101, "doces", "Pudim cremoso de pote", "Deliciosa versão do tão amado pudim de leite condensado com baunilha, cremoso mesclado com a calda de caramelo, sem gelatina e sem maisena", "if-pudim-cremoso-de-pote.jpg", 18.5, 4),
    p(102, "doces", "Brownie da Rê de Mms Original", "Os mais famosos brownies da região, brownie da Rê, com aquela fantástica casquinha crocante e aquele estonteante recheio cremoso que só um bronwie feito com cacau 50% , Mms e chocolate nobre é capaz de proporcionar. Vem se lambuzar com essa tentação da nossa parceira Brownie da Rê! Tamanho 6x6cm", "if-brownie-da-re-de-mms-original.jpg", 9, 4),
    p(103, "doces", "Mousse de maracujá", "Mousse de maracujá com fruta fresca,nata, leite condensado e geleia artesanal de maracujá pote de 250 ml.", "if-mousse-de-maracuja.jpg", 19, 4),
    p(104, "doces", "Fatia de Slice cake de Ninho com Nutella", "Fatia de torta, famosa slice cake com massa chiffon de cacau 50%, recheada com branquinho trufado de Ninho, e Nutella Original, cobertura de ganache real com chocolate meio amargo e brigadeiros , bem molhadinha e com muitoooo recheio,", "if-fatia-de-slice-cake-de-ninho-com-nutella.jpg", 26, 4),
    p(105, "doces", "Torta de paçoquinha", "A clássica torta de bolacha, em um formato sofisticado, juntando a paçoquinha, a crocância do amendoim, leite condensado, nata e bolacha Oreo na medida certa. Pote de 250ml.", "if-torta-de-pacoquinha.jpg", 19.5, 4),
    p(106, "doces", "Trufas sabores diversos", "Trufas tamanho padrão, com chocolate meio amargo nobre, sabores diversos, conforme disponibilidade em estoque. Chocolate, mumu, branquinho, charge, morango, Ninho, maracujá, negrinho, Oreo, meio a meio", "if-trufas-sabores-diversos.jpg", 5.98, 4),
    p(107, "doces", "Pipoca gourmet", "Pipoca gourmet, crocante igual de cinema, com chocolate, Ninho e leite condensado(não é permitido retirar o Ninho) Pacote sugerido para uma pessoa", "if-pipoca-gourmet.jpg", 17.6, 4),
    p(108, "doces", "Cassata - Torta de sorvete família de Ouro Branco", "Cassata, a legítima torta de sorvete sabor Ouro Branco, base de creme belga, merengues crocantes, cobertura de chocolate branco com bombom Ouro Branco, uma explosão de sabor.", "if-cassata-torta-de-sorvete-familia-de-ouro-branco.jpg", 107, 4),
    p(109, "doces", "Cassata - Torta de sorvete família de Ninho com Oreo", "Cassata, a legítima torta de sorvete sabor Oreo com Ninho, base de creme belga, merengues crocantes, cobertura de creme de Ninho com Oreo, uma explosão de sabor.", "if-cassata-torta-de-sorvete-familia-de-ninho-com-oreo.jpg", 107, 4),
    p(110, "doces", "Sabedoria de Atena", "A delicadeza do creme de Ninho e crocancia do brownie, com a intensidade do ganache real com chocolate meio amargo, venha entorpecer seus sentidos com esse doce fantástico.", "if-sabedoria-de-atena.jpg", 19.9, 4),
    p(111, "doces", "Mousse de chocolate média", "Mousse de chocolate com bombom Ouro Branco e raspas de chocolate meio amargo, receita Original francesa, aerado e incrivelmente saboroso.", "if-mousse-de-chocolate-media.jpg", 42, 4),
    p(112, "doces", "Mousse de chocolate família", "Mousse de chocolate com bombom Ouro Branco e raspas de chocolate meio amargo, aerado e incrivelmente saboroso, receita Original francesa", "if-mousse-de-chocolate-familia.jpg", 113, 4),
    p(113, "doces", "Torta de bolacha Olimpo Família", "Uma torta de bolacha que chega ser um desaforo de tão deliciosa, nata, leite condensado, bolacha maria, bombom Ouro Branco coberto por ganache real com chocolate meio amargo, receita Original Olímpo, vindo direto dos deuses do Olimpo.", "if-torta-de-bolacha-olimpo-familia.jpg", 138, 4),
    p(114, "doces", "Arroz de leite médio", "Arroz de leite condensado, receita Original portuguesa, super cremoso e lanhado no leite condensado, uma tentação a cada colherada", "if-arroz-de-leite-medio.jpg", 54, 4),
    p(115, "doces", "Bolo no pote de Ninho com Nutella Original", "Bolo no pote contendo a felicidade digna de deuses do Olimpo, pedaços de bolo pão de ló ( massa branca) creme de Ninho, cobertos por branquinho trufado com chocolate branco, Nutella Original, e um toque de Ninho chega ser um absurdo de tão perfeito", "if-bolo-no-pote-de-ninho-com-nutella-original.jpg", 23.2, 4),
    p(116, "doces", "Merengue crocante artesanal", "Pacote com merengues grandes crocantes totalmente artesanal, opção sem lactose e sem glúten", "if-merengue-crocante-artesanal.jpg", 11, 4, { destaque: true }),
    p(117, "doces", "Bolo no pote de choconinho", "Bolo no pote contendo a felicidade digna de deuses do Olimpo, bolo de chocolate ganache real com chocolate meio amargo cremoso, cobertos por creme de Ninho trufado e Ninho, chega ser um absurdo de tão perfeito.", "if-bolo-no-pote-de-choconinho.jpg", 20, 4),
    p(118, "doces", "Tempestade de stikadinho média", "Tempestade de stikadinho média, com um incrível creme de stikadinho, uma camada de bolacha Oreo picada coberto por um delicioso creme de Ninho, Ninho e pedaços de stikadinho", "if-tempestade-de-stikadinho-media.jpg", 64, 4),
    p(119, "doces", "Tortinha de limão", "Fantástica tortinha de limão no pote , com base de farofa amanteigada e delicado mousse de limão feito com fruta fresca, um tapa na sua larica", "if-tortinha-de-limao.jpg", 17, 4),
    p(120, "doces", "Brownie com coco ralado", "Os mais famosos brownies da região, brownie da Rê, com aquela fantástica casquinha crocante e aquele estonteante recheio cremoso que só um bronwie feito com cacau 50% e chocolate nobre é capaz de proporcionar. Vem se lambuzar com essa tentação da nossa parceira Brownie da Rê! Tamanho 6x6cm", "if-brownie-com-coco-ralado.jpg", 9, 4),
    p(121, "doces", "Bolo no pote morango com Ninho", "Bolo no pote contendo a felicidade digna de deuses do Olimpo, pedaços de bolo pão de ló ( massa branca) creme de Ninho, geleia artesanal de morango,um toque de Ninho e Granule melken chega ser um absurdo de tão perfeito", "if-bolo-no-pote-morango-com-ninho.jpg", 19.5, 4),
    p(122, "doces", "Sabedoria da Atena média", "A delicadeza do creme de Ninho e crocancia do brownie, com a intensidade do ganache real com chocolate meio amargo, venha entorpecer seus sentidos com esse doce fantástico.", "if-sabedoria-da-atena-media.jpg", 73, 4),
    // Presentes
    p(123, "presentes", "Maletinha de trufa mãe", "Um lindo mimo para sua mãe, uma maletinha contendo dentro uma deliciosa trufa recheada, sabores variados, confirme disponibilidade.", "if-maletinha-de-trufa-mae.jpg", 9.89, 4),
    p(124, "presentes", "Ovo coelho", "Ovo de Páscoa com um mini coelho e mini coração de chocolate dentro, totalmente artesanal", "if-ovo-coelho.jpg", 14, 4, { destaque: true }),
    p(125, "presentes", "Pirulito de pepeca", "Pirulito de pepeca, com chocolate nobre meio amargo, uma ideia criativa de apimentar seu relacionamento", "if-pirulito-de-pepeca.jpg", 15, 4),
    p(126, "presentes", "Pirulito de pinto de chocolate recheado", "Pinto de chocolate meio amargo recheado com um delicioso creme de Ninho, venha se lambuzar com essa delícia", "if-pirulito-de-pinto-de-chocolate-recheado.jpg", 19, 4),
    p(127, "presentes", "Vela de aniversário", "Uma vela de aniversário para seu bolo", "if-vela-de-aniversario.jpg", 4, 4),
    p(128, "presentes", "Vela de aniversário azul", "01 unidade de vela de aniversário azul", "if-vela-de-aniversario-azul.jpg", 4.5, 4),
    p(129, "presentes", "Vela de aniversário rosa", "Uma vela de aniversário rosa", "if-vela-de-aniversario-rosa.jpg", 4.5, 4),
    p(130, "presentes", "Vela ponto de interrogação", "Vela prateada ponto de interrogação", "if-vela-ponto-de-interrogacao.jpg", 16, 4),
    p(131, "presentes", "Caixa de corações lapidados", "Caixa decorada com três corações lapidados grandes recheados com creme de Ninho, feito com chocolate nobre, uma delicadeza de presente para vc dar a quem ama", "if-caixa-de-coracoes-lapidados.jpg", 53, 4),
    p(132, "presentes", "Caixa de trufas love com visor", "Caixa de trufas grandes recheadas com sabores mistos e um coração de chocolate, totalmente artesanal", "if-caixa-de-trufas-love-com-visor.jpg", 34, 4),
    p(133, "presentes", "Caixa de trufas mãe mas é o meu mundo", "Caixa de trufas com 3 trufas grandes recheadas recheios mistos e 3 corações de chocolate", "if-caixa-de-trufas-mae-mas-e-o-meu-mundo.jpg", 34, 4),
    p(134, "presentes", "Caixa de trufas mãe nem o Google acha", "Caixa de trufas com 3 trufas grandes recheadas recheios mistos e 3 corações de chocolate", "if-caixa-de-trufas-mae-nem-o-google-acha.jpg", 34, 4),
    p(135, "presentes", "Caixa de trufas pai sem limites", "Caixa com 3 trufas e 3 corações de chocolate nobre e recheios totalmente artesanais", "if-caixa-de-trufas-pai-sem-limites.jpg", 34, 4),
    p(136, "presentes", "Caixa de trufas Todinho seu", "Caixa com 3 trufas e 3 corações de chocolate nobre e recheios totalmente artesanais", "if-caixa-de-trufas-todinho-seu.jpg", 34, 4),
    p(137, "presentes", "Caixa de trufas Vozão", "Caixa com trufas e corações de chocolate nobre e recheios totalmente artesanais . Embalagens de trufas com desenhos variados, conforme disponibilidade no estoque. Sabores mistos. Foto meramente ilustrativa", "if-caixa-de-trufas-vozao.jpg", 34, 4),
    p(138, "presentes", "Caixa (branca) de trufas te amo, do tamanho da dificuldade que você é!", "Caixa com trufas e corações de chocolate nobre e recheios totalmente artesanais . Embalagens de trufas com desenhos variados, conforme disponibilidade no estoque. Sabores mistos. Foto meramente ilustrativa", "if-caixa-branca-de-trufas-te-amo-do-tamanho-da-dificuldade-que-.jpg", 34, 4),
    p(139, "presentes", "Caixa (preta) de trufas te amo do tamanho da dificuldade que vc é!", "Caixa com 3 trufas e 3 corações de chocolate nobre e recheios totalmente artesanais", "if-caixa-preta-de-trufas-te-amo-do-tamanho-da-dificuldade-que-v.jpg", 34, 4),
    p(140, "presentes", "Caixa trufas curto vc", "Caixa de trufas com duas trufas grandes recheadas mistas e um coração de chocolate, totalmente artesanal", "if-caixa-trufas-curto-vc.jpg", 24, 4),
    p(141, "presentes", "Caixa trufas Feliz aniversário", "Caixa com trufas e corações de chocolate nobre e recheios totalmente artesanais .", "if-caixa-trufas-feliz-aniversario.jpg", 36, 4),
    p(142, "presentes", "Caixa trufas o pai tá On", "Caixa de trufas recheadas, sabores diversos, com 4 trufas e 3 corações de chocolate, um delicioso e divertido presente para seu pai", "if-caixa-trufas-o-pai-ta-on.jpg", 34, 4),
    p(143, "presentes", "Caixa trufas chocolate já que é cedo pra cerveja", "Uma divertida caixa de trufas recheadas totalmente artesanal, com 4 trufas de sabores variados e 3 corações de chocolate", "if-caixa-trufas-chocolate-ja-que-e-cedo-pra-cerveja.jpg", 34, 4),
    p(144, "presentes", "Caixa de barra de chocolate amo você recheada com Ninho", "Uma deliciosa barra de chocolate preto recheada com creme de Ninho artesanal, uma tentação a cada mordida", "if-caixa-de-barra-de-chocolate-amo-voce-recheada-com-ninho.jpg", 42, 4),
    p(145, "presentes", "Caixa de coração lapidado dourado", "Um lindo coração dourado de chocolate recheado com creme de Ninho artesanal para presentear seu amor ️", "if-caixa-de-coracao-lapidado-dourado.jpg", 51, 4),
    p(146, "presentes", "Caixa meu amor é igual seu bumbum", "Uma divertida caixa com 8 mini corações lapidados de chocolate totalmente artesanal", "if-caixa-meu-amor-e-igual-seu-bumbum.jpg", 21, 4),
    p(147, "presentes", "Caixa de trufas super namorados", "Caixa com 3 trufas recheadas totalmente artesanal sabores mistos e 3 corações de chocolate, um presente divertido para seu amor", "if-caixa-de-trufas-super-namorados.jpg", 34, 4),
    p(148, "presentes", "Caixa de trufas parabéns", "Uma delicada caixa com 3 trufas recheadas sabores diversos totalmente artesanal e 3 corações de chocolate", "if-caixa-de-trufas-parabens.jpg", 34, 4),
    p(149, "presentes", "Caixa trufas super pai", "Linda caixa com uma trufa recheada e 2 corações de chocolate, totalmente artesanal.", "if-caixa-trufas-super-pai.jpg", 24, 4),
    p(150, "presentes", "Caixa de trufa Super Pai", "Linda caixa com uma trufa recheada e 2 corações de chocolate, totalmente artesanal", "if-caixa-de-trufa-super-pai.jpg", 24, 4),
    p(151, "presentes", "Caixa de trufa feliz paizão", "Linda caixa de trufas com 3 trufas recheadas e 3 corações de chocolate, totalmente artesanal", "if-caixa-de-trufa-feliz-paizao.jpg", 34, 4),
    p(152, "presentes", "Caixa vermelha coração dourado recheado com Ninho", "Um lindo coração dourado de chocolate recheado com creme de Ninho artesanal para presentear seu amor ️", "if-caixa-vermelha-coracao-dourado-recheado-com-ninho.jpg", 52, 4),
    p(153, "presentes", "Caixa com Pintão recheado", "Caixa com um delicioso pintão recheado de creme de Ninho, feito com chocolate nobre, venha se lambuzar com essa delícia", "if-caixa-com-pintao-recheado.jpg", 54, 4),
    p(154, "presentes", "Caixa de trufas coloque chocolate", "Caixa com trufas e corações de chocolate nobre e recheios totalmente artesanais", "if-caixa-de-trufas-coloque-chocolate.jpg", 34, 4),
    p(155, "presentes", "Caixa de trufas Kitkero", "Caixa de trufas com 3 trufas grandes recheadas recheios mistos e 3 corações de chocolate", "if-caixa-de-trufas-kitkero.jpg", 31, 4),
    p(156, "presentes", "Caixa de trufas mãe maravilha", "Caixa com 3 trufas e 3 corações de chocolate nobre e recheios totalmente artesanais", "if-caixa-de-trufas-mae-maravilha.jpg", 31, 4),
    p(157, "presentes", "Caixa de trufas meu amor por vc é maior que minha dívida no serasa", "Caixa de trufas com 3 trufas grandes recheadas recheios mistos e 3 corações de chocolate", "if-caixa-de-trufas-meu-amor-por-vc-e-maior-que-minha-divida-no-.jpg", 31, 4),
    p(158, "presentes", "Caixa de trufas obrigado por me aturar", "Caixa com trufas e corações de chocolate nobre e recheios totalmente artesanais", "if-caixa-de-trufas-obrigado-por-me-aturar.jpg", 36, 4),
    p(159, "presentes", "Caixa de trufas paizão exemplo de vida", "Caixa com trufas e corações de chocolate nobre e recheios totalmente artesanais . Embalagens de trufas com desenhos variados, conforme disponibilidade no estoque. Sabores mistos. Foto meramente ilustrativa", "if-caixa-de-trufas-paizao-exemplo-de-vida.jpg", 31, 4),
    p(160, "presentes", "Caixa de trufas sonho de mãe", "Caixa de trufas com 3 trufas grandes recheadas recheios mistos e 3 corações de chocolate", "if-caixa-de-trufas-sonho-de-mae.jpg", 31, 4),
    p(161, "presentes", "Caixa de trufas super mãe", "Caixa com 3 trufas e 3 corações de chocolate nobre e recheios totalmente artesanais", "if-caixa-de-trufas-super-mae.jpg", 31, 4),
    p(162, "presentes", "Caixa de trufas super pai", "Caixa com 3 trufas e 3 corações de chocolate nobre e recheios totalmente artesanais", "if-caixa-de-trufas-super-pai.jpg", 31, 4),
    p(163, "presentes", "Caixa de trufas super pai herói sem capa", "Caixa com trufas e corações de chocolate nobre e recheios totalmente artesanais . Embalagens de trufas com desenhos variados, conforme disponibilidade no estoque. Sabores mistos. Foto meramente ilustrativa", "if-caixa-de-trufas-super-pai-heroi-sem-capa.jpg", 31, 4),
    p(164, "presentes", "Caixa de trufas vale a pena", "Caixa com trufas e corações de chocolate nobre e recheios totalmente artesanais", "if-caixa-de-trufas-vale-a-pena.jpg", 31, 4),
    p(165, "presentes", "Caixa de trufas vou contar até 3", "Caixa de trufas com 3 trufas grandes recheadas com sabores mistos e 3 corações de chocolate", "if-caixa-de-trufas-vou-contar-ate-3.jpg", 30, 4),
    p(166, "presentes", "Cone lápis professor", "Uma delicada lembrancinha para seu professor, lápis em formato de cone com 2 trufas de chocolate recheadas e 2 corações de chocolate, totalmente artesanal", "if-cone-lapis-professor.jpg", 23, 4),
    // Almôndegas Congeladas
    p(167, "almondegas-congeladas", "Almôndegas de carne", "Almôndegas congeladas, de carne com bacon e ervas frescas. Pronta para assar ou fritar. Bandeja com 15 unidades( preparar elas ainda congeladas)", "if-almondegas-de-carne.jpg", 38, 4),
    p(168, "almondegas-congeladas", "Almôndegas de frango", "Almôndegas congeladas, de frango com bacon e ervas frescas. Pronta para assar ou fritar. Bandeja com 15 unidades.", "if-almondegas-de-frango.jpg", 38, 4),
    // Congelados
    p(169, "congelados", "Canelone de frango tamanho familia", "Canelone congelado de frango( feito com sobrecoxa), carregado no queijo, molho branco bechamel, embalagem própria para forno.", "if-canelone-de-frango-tamanho-familia.jpg", 59, 4),
    p(170, "congelados", "Panqueca de Carne de panela", "Bandeja com 4 unidades de panquecas congeladas pesando entre 350/400gr", "if-panqueca-de-carne-de-panela.jpg", 26.5, 4),
    p(171, "congelados", "Canelone de guisado tamanho família", "Canelone congelado de guisado, carregado no queijo e molho branco com queijo embalagem própria para forno.", "if-canelone-de-guisado-tamanho-familia.jpg", 59, 4),
    p(172, "congelados", "Panqueca de Guisado", "Bandeja com 4 unidades de panquecas congeladas pesando entre 350/400gr", "if-panqueca-de-guisado.jpg", 26.5, 4),
    p(173, "congelados", "Canelone frango congelado", "Canelone congelado de frango(feito com sobrecoxa) carregado no queijo, embalagem própria para forno.", "if-canelone-frango-congelado.jpg", 46, 4),
    p(174, "congelados", "Panqueca de Frango com requeijão", "Bandeja com 4 unidades de panquecas congeladas de frango ( feito com sobrecoxa) , molho e massa totalmente artesanal", "if-panqueca-de-frango-com-requeijao.jpg", 25.5, 4),
    p(175, "congelados", "Canelone de guisado congelado", "Canelone congelado de guisado, carregado no queijo, embalagem própria para forno.", "if-canelone-de-guisado-congelado.jpg", 47, 4),
    p(176, "congelados", "Panqueca Calabresa com requeijão", "Bandeja com 4 unidades de panquecas congeladas pesando entre 350/400gr", "if-panqueca-calabresa-com-requeijao.jpg", 25.5, 4),
    p(177, "congelados", "Feijoada congelada grande", "Fantástica feijoada feita somente com carnes nobres e ingredientes frescos, com sabor de comida de vó, uma experiência incrível para sua família. Embalagem própria para microondas.", "if-feijoada-congelada-grande.jpg", 64, 4),
    p(178, "congelados", "Panqueca Mista", "Bandeja com 4 unidades de panquecas , uma de guisado, uma de frango com requeijão, uma de carne de panela e uma de calabresa com requeijão, congeladas pesando entre 350/400gr", "if-panqueca-mista.jpg", 25.5, 4),
    p(179, "congelados", "Panqueca brócolis com ricota", "Bandeja com 4 unidades de panquecas congeladas pesando entre 350/400gr.", "if-panqueca-brocolis-com-ricota.jpg", 25.5, 4),
    p(180, "congelados", "Lasanha de frango", "Lasanha de panquecas, com molho bechamel totalmente artesanal, muito queijo e molho totalmente artesanal , congelado em embalagem própria para microondas", "if-lasanha-de-frango.jpg", 48, 4),
    p(181, "congelados", "Lasanha de guisado", "Lasanha de panquecas, com molho bechamel totalmente artesanal, muito queijo e molho totalmente artesanal , congelado em embalagem própria para microondas", "if-lasanha-de-guisado.jpg", 49, 4),
    // Escondidinho congelado
    p(182, "escondidinho-congelado", "Escondidinho grande carne de panela", "Escondidinho de carne de panela, totalmente artesanal, trabalhado no queijo. Congelado embalagem própria para microondas", "if-escondidinho-grande-carne-de-panela.jpg", 45, 4),
    p(183, "escondidinho-congelado", "Escondidinho grande de frango", "Escondidinho de frango, totalmente artesanal, trabalhado no queijo. Congelado, embalagem própria para microondas", "if-escondidinho-grande-de-frango.jpg", 43, 4),
    p(184, "escondidinho-congelado", "Escondidinho grande de guisado", "Escondidinho de guisado, totalmente artesanal, trabalhado no queijo. Congelado embalagem própria para microondas", "if-escondidinho-grande-de-guisado.jpg", 45, 4),
    p(185, "escondidinho-congelado", "Escondidinho pequeno de carne panela", "Escondidinho de carne de panela, totalmente artesanal, trabalhado no queijo. Congelado embalagem própria para microondas", "if-escondidinho-pequeno-de-carne-panela.jpg", 30, 4),
    p(186, "escondidinho-congelado", "Escondidinho pequeno de frango", "Escondidinho de frango totalmente artesanal, trabalhado no queijo. Congelado embalagem própria para microondas", "if-escondidinho-pequeno-de-frango.jpg", 27, 4),
    p(187, "escondidinho-congelado", "Escondidinho pequeno guisado", "Escondidinho de guisado, totalmente artesanal, trabalhado no queijo. Congelado embalagem própria para microondas", "if-escondidinho-pequeno-guisado.jpg", 30, 4),
    p(188, "escondidinho-congelado", "Escondidinho fit de batata doce com brócolis", "Escondidinho fit de batata doce, ricota e brócolis com ricota totalmente artesanal, congelado com embalagem própria para microondas", "if-escondidinho-fit-de-batata-doce-com-brocolis.jpg", 35, 4),
    p(189, "escondidinho-congelado", "Escondidinho fit de batata doce com frango", "Escondidinho fit de batata doce, frango com ricota totalmente artesanal, congelado com embalagem própria para microondas", "if-escondidinho-fit-de-batata-doce-com-frango.jpg", 35, 4),
    p(190, "escondidinho-congelado", "Escondidinho fit de mandioquinha com brócolis", "Escondidinho fit de mandioquinha, ricota e brócolis com molho totalmente artesanal, congelado com embalagem própria para microondas", "if-escondidinho-fit-de-mandioquinha-com-brocolis.jpg", 35, 4),
    p(191, "escondidinho-congelado", "Escondidinho fit de mandioquinha com frango e ricota", "Escondidinho fit de mandioquinha, ricota e frango com molho totalmente artesanal, congelado com embalagem própria para microondas", "if-escondidinho-fit-de-mandioquinha-com-frango-e-ricota.jpg", 35, 4),
    // Sopas e Cremes Congelados
    p(192, "sopas-e-cremes-congelados", "Creme de batata com bacon", "Delicioso creme de batata, com requeijão e bacon, sopa mega encorpada e temperada, uma refeição que esquenta o coração e a alma. Embalagem própria para uso no microondas", "if-creme-de-batata-com-bacon.jpg", 49, 4),
    // Bebidas
    p(193, "bebidas", "Coca-Cola Lata 350ml", "", "if-coca-cola-lata-350ml.jpg", 8, 4),
    p(194, "bebidas", "Refri Pepsi Twist Black Lt 350ml", "Lata 350ml", "if-refri-pepsi-twist-black-lt-350ml.jpg", 8, 4),
    p(195, "bebidas", "Fanta Laranja Lata 350ml", "Lata 350ml", "if-fanta-laranja-lata-350ml.jpg", 8, 4),
    p(196, "bebidas", "Coca-Cola Zero Lata 350ml", "", "if-coca-cola-zero-lata-350ml.jpg", 8, 4),
    p(197, "bebidas", "Refrigerante Guaraná Antarctica Lata 350ml", "", "if-refrigerante-guarana-antarctica-lata-350ml.jpg", 8, 4),
    p(198, "bebidas", "Refrigerante Guaraná Zero Antarctica 350ml", "Lata 350ml", "if-refrigerante-guarana-zero-antarctica-350ml.jpg", 8, 4),
    p(199, "bebidas", "Coca-Cola 600ml", "Garrafa 600ml", "if-coca-cola-600ml.jpg", 11, 4),
    p(200, "bebidas", "Coca-Cola Zero 600ml", "Garrafa 600ml", "if-coca-cola-zero-600ml.jpg", 11, 4),
    p(201, "bebidas", "Refrigerante Sprite Original 350ml", "Lata 350ml", "if-refrigerante-sprite-original-350ml.jpg", 8, 4),
    p(202, "bebidas", "Schweppes Tônica Sem Açúcar 350ml", "", "if-schweppes-tonica-sem-acucar-350ml.jpg", 8, 4),
    p(203, "bebidas", "Água Tônica Schweppes Lata 350ml", "Lata 350ml", "if-agua-tonica-schweppes-lata-350ml.jpg", 8, 4),
    // Sal grosso temperado
    p(204, "sal-grosso-temperado", "Sal grosso temperado artesanalmente", "Sal grosso temperado artesanalmente, com especiarias e ervas, um toque todo especial para seu churrasco.", "if-sal-grosso-temperado-artesanalmente.jpg", 7, 4),
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
    aviso: "Tele grátis até às 19h • Dia de chuva até às 18h • Depois, tele terceirizada R$ 4",
    // Vitrine de Natal no topo do site (liga/desliga em Ajustes do painel)
    vitrineNatal: true,
    natalTitulo: "Especiais de Natal",
    natalAviso: "Encomendas com 30% de sinal • Somente retirada na Olimpo • Sobremesas grandes servem de 10 a 12 pessoas, médias de 3 a 4",
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
                { id: 34, nome: "Pão caseiro de leite", quantidade: 1, preco: 20.5 },
                { id: 110, nome: "Sabedoria de Atena", quantidade: 1, preco: 19.9 },
            ],
            total: 40.4,
        },
        {
            codigo: "OL3PQ8", status: "novo", criadoEm: new Date(agora - 45 * 60000).toISOString(),
            cliente: "Seu João Pereira", telefone: "(51) 98123-4567",
            tipoEntrega: "Retirada", retirada: "Hoje às 17:00",
            pagamento: "Dinheiro (troco para R$ 50)", frete: 0, desconto: 0,
            itens: [{ id: 56, nome: "Bolo de maracujá com fruta fresca", quantidade: 1, preco: 18.5 }],
            total: 18.5,
        },
    ];
}

// ─── IMPLEMENTAÇÃO ───────────────────────────────────────────────────────────
const CHAVE_DEMO = "olimpo_demo_v3"; // v3: cardápio do iFood + Especiais de Natal

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
    async redefinirSenha() {},
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
    // Só entra no painel quem está na coleção "admins" (um documento por e-mail, em
    // minúsculas, criado pelo Console do Firebase). As regras do banco (regras.md) fazem
    // a mesma conferência, então mesmo burlando esta tela não dá para mexer em nada.
    async _temAcesso(user) {
        try {
            const d = await this._db.collection("admins").doc(String(user.email || "").toLowerCase()).get();
            return d.exists;
        } catch (e) {
            // Regras antigas (sem a lista "admins") recusam a leitura: segue liberado até
            // as regras novas serem publicadas. Com elas, quem não está na lista lê "não existe".
            return !!e && e.code === "permission-denied";
        }
    },
    async entrar(email, senha) {
        this._init();
        const cred = await firebase.auth().signInWithEmailAndPassword(email, senha);
        if (!(await this._temAcesso(cred.user))) {
            await firebase.auth().signOut();
            const erro = new Error("Sem acesso ao painel"); erro.code = "sem-acesso"; throw erro;
        }
        return true;
    },
    async sair() { this._init(); await firebase.auth().signOut(); },
    estaLogado(cb) {
        this._init();
        firebase.auth().onAuthStateChanged(async (u) => {
            if (!u) return cb(false);
            if (await this._temAcesso(u)) return cb(true);
            await firebase.auth().signOut();
            cb(false);
        });
    },
    async redefinirSenha(email) { this._init(); await firebase.auth().sendPasswordResetEmail(email); },
    resetar() {},
};

const MODO_DEMO = !FIREBASE_CONFIG;
const Dados = MODO_DEMO ? DadosDemo : DadosFirebase;

// Valores padrão (usados quando a configuração salva não tem algum campo)
const CONFIG_PADRAO = SEED_CONFIG;

// Utilitários compartilhados
const formatarMoeda = (v) => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const escaparHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
