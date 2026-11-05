// ═════════════════════════════════════════════════════════════════════════════
//  OLIMPO — Painel administrativo
//  Início · Vender · Pedidos · Estoque · Post do dia · Caixa (entradas e saídas) · Relatório · Ajustes
//  TF Solutions
// ═════════════════════════════════════════════════════════════════════════════

const $ = (id) => document.getElementById(id);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

// ─── ESTADO ──────────────────────────────────────────────────────────────────
let produtos = [], categorias = [], cupons = [], config = { ...CONFIG_PADRAO }, movs = [], pedidos = [];
let paginaAtual = "inicio";
let cesta = [];
let catVender = "";
let pagamentoCesta = "Pix";
let filtroEstoque = "todos", filtroCaixa = "todos", statusPedidos = "novo";
let mesCaixa = inicioDoMes(new Date());
let mesRel = inicioDoMes(new Date());

const CATEGORIAS_SAIDA = [
    { nome: "Ingredientes", icone: "fa-wheat-awn" },
    { nome: "Embalagens", icone: "fa-box" },
    { nome: "Gás", icone: "fa-fire-flame-simple" },
    { nome: "Luz e água", icone: "fa-lightbulb" },
    { nome: "Entregador", icone: "fa-motorcycle" },
    { nome: "Aluguel", icone: "fa-house" },
    { nome: "Outros", icone: "fa-ellipsis" },
];
const CATEGORIAS_ENTRADA = [
    { nome: "Encomenda", icone: "fa-cake-candles" },
    { nome: "Venda por fora", icone: "fa-hand-holding-dollar" },
    { nome: "Outros", icone: "fa-ellipsis" },
];
const NOMES_DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// ─── DATAS ───────────────────────────────────────────────────────────────────
function inicioDoMes(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
const diaLocal = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; };
const hojeStr = () => diaLocal(new Date());
const noMes = (iso, mes) => { const d = new Date(iso); return d.getFullYear() === mes.getFullYear() && d.getMonth() === mes.getMonth(); };
const nomeMes = (mes) => mes.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
const hora = (iso) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const diaExtenso = (iso) => new Date(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
const tempoAtras = (iso) => {
    const min = Math.round((Date.now() - new Date(iso)) / 60000);
    if (min < 1) return "agora mesmo";
    if (min < 60) return `há ${min} min`;
    if (min < 60 * 24) return `há ${Math.floor(min / 60)}h`;
    return new Date(iso).toLocaleDateString("pt-BR");
};

// ─── AVISOS E JANELAS ────────────────────────────────────────────────────────
function avisar(texto, ok = true) {
    const el = $("aviso");
    el.textContent = texto;
    el.className = "aviso mostrar" + (ok ? " ok" : "");
    clearTimeout(avisar._t);
    avisar._t = setTimeout(() => el.classList.remove("mostrar"), 2800);
}
let janelaAberta = null;
function abrirJanela(id) {
    if (janelaAberta) fecharJanela();
    janelaAberta = $(id);
    janelaAberta.classList.add("aberta");
    $("janela-fundo").classList.add("aberta");
    document.body.classList.add("travado");
}
function fecharJanela() {
    if (!janelaAberta) return;
    janelaAberta.classList.remove("aberta");
    $("janela-fundo").classList.remove("aberta");
    document.body.classList.remove("travado");
    janelaAberta = null;
}
function confirmar(titulo, texto, rotuloSim = "Sim") {
    return new Promise((resolve) => {
        $("jx-titulo").textContent = titulo;
        $("jx-texto").textContent = texto;
        $("jx-sim").textContent = rotuloSim;
        abrirJanela("jn-confirmar");
        $("jx-sim").onclick = () => { fecharJanela(); resolve(true); };
        $("jx-nao").onclick = () => { fecharJanela(); resolve(false); };
    });
}

// ─── CARREGAR DADOS ──────────────────────────────────────────────────────────
async function carregarTudo() {
    const [p, c, cu, conf, m, pe] = await Promise.all([
        Dados.listar("produtos"), Dados.listar("categorias"), Dados.listar("cupons"),
        Dados.obter("configuracoes", "geral"), Dados.listar("movimentacoes"), Dados.listar("pedidos"),
    ]);
    produtos = p.map((x) => ({ ...x, id: Number(x.id) })).sort((a, b) => a.id - b.id);
    categorias = c.sort((a, b) => (a.ordem || 99) - (b.ordem || 99));
    cupons = cu;
    config = { ...CONFIG_PADRAO, ...(conf || {}) };
    movs = m.sort((a, b) => new Date(b.data) - new Date(a.data));
    pedidos = pe.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
}

function atualizarTela() {
    const novos = pedidos.filter((x) => x.status === "novo").length;
    $("badge-pedidos").hidden = !novos;
    $("badge-pedidos").textContent = novos;
    $("atalho-pedidos").textContent = novos || "";
    const render = { inicio: renderInicio, vender: renderVender, pedidos: renderPedidos, estoque: renderEstoque, caixa: renderCaixa, relatorio: renderRelatorio, ajustes: renderAjustes, post: renderPost };
    render[paginaAtual]?.();
}

function irPara(pagina) {
    paginaAtual = pagina;
    $$(".pagina").forEach((s) => s.classList.toggle("ativa", s.id === "pg-" + pagina));
    $$("#menu button").forEach((b) => b.classList.toggle("ativo", b.dataset.pagina === pagina || (pagina === "relatorio" || pagina === "ajustes") && b.dataset.pagina === "mais" && window.innerWidth <= 900));
    window.scrollTo({ top: 0 });
    atualizarTela();
}

// ─── ESTOQUE (núcleo) ────────────────────────────────────────────────────────
const controlaEstoque = (p) => p.estoque !== undefined && p.estoque !== null && p.estoque !== "";
const tamanhosDe = (p) => Array.isArray(p.tamanhos) && p.tamanhos.length ? p.tamanhos : [{ nome: null, preco: Number(p.preco) || 0 }];
const precoBase = (p) => Number(tamanhosDe(p)[0].preco) || 0;

async function mudarEstoque(id, delta) {
    const p = produtos.find((x) => x.id === Number(id));
    if (!p || !controlaEstoque(p)) return;
    p.estoque = Math.max(0, Number(p.estoque) + delta);
    await Dados.salvar("produtos", p.id, { estoque: p.estoque });
}

async function registrarMovimento(dados) {
    const mov = { data: new Date().toISOString(), ...dados, valor: Math.round(Number(dados.valor) * 100) / 100 };
    const id = await Dados.adicionar("movimentacoes", mov);
    movs.unshift({ ...mov, docId: id });
    movs.sort((a, b) => new Date(b.data) - new Date(a.data));
}

// ─── INÍCIO ──────────────────────────────────────────────────────────────────
function htmlMov(m, comApagar = false) {
    const icone = m.tipo === "entrada" ? (m.categoria === "Pedido do site" ? "fa-globe" : "fa-arrow-down") : (CATEGORIAS_SAIDA.find((c) => c.nome === m.categoria)?.icone || "fa-arrow-up");
    return `
        <div class="linha-lista">
            <span class="icone-mov ${m.tipo}"><i class="fa-solid ${icone}"></i></span>
            <div class="info"><strong>${escaparHtml(m.categoria || (m.tipo === "entrada" ? "Entrada" : "Gasto"))}</strong>
            <small>${hora(m.data)}${m.pagamento ? " · " + escaparHtml(m.pagamento) : ""}${m.descricao ? " · " + escaparHtml(m.descricao) : ""}</small></div>
            <span class="valor-mov ${m.tipo}">${m.tipo === "entrada" ? "+" : "−"} ${formatarMoeda(m.valor)}</span>
            ${comApagar ? `<button class="btn-icone" data-apagar-mov="${m.docId}" aria-label="Apagar"><i class="fa-regular fa-trash-can"></i></button>` : ""}
        </div>`;
}

function renderInicio() {
    const h = new Date().getHours();
    const nome = config.nomeDona || "";
    $("saudacao").textContent = `${h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"}${nome ? ", " + nome : ""}!`;
    const deHoje = movs.filter((m) => diaLocal(m.data) === hojeStr());
    const ent = deHoje.filter((m) => m.tipo === "entrada").reduce((a, m) => a + m.valor, 0);
    const sai = deHoje.filter((m) => m.tipo === "saida").reduce((a, m) => a + m.valor, 0);
    $("hoje-entradas").textContent = formatarMoeda(ent);
    $("hoje-saidas").textContent = formatarMoeda(sai);
    $("hoje-saldo").textContent = formatarMoeda(ent - sai);
    $("hoje-saldo").classList.toggle("negativo", ent - sai < 0);

    const mes = inicioDoMes(new Date());
    const doMes = movs.filter((m) => noMes(m.data, mes));
    const entM = doMes.filter((m) => m.tipo === "entrada").reduce((a, m) => a + m.valor, 0);
    const saiM = doMes.filter((m) => m.tipo === "saida").reduce((a, m) => a + m.valor, 0);
    $("linha-mes").innerHTML = `<i class="fa-solid fa-calendar" style="color:var(--ouro)"></i> Neste mês: vendeu <b style="color:var(--verde)">${formatarMoeda(entM)}</b>, gastou <b style="color:var(--vermelho)">${formatarMoeda(saiM)}</b> e sobrou <b>${formatarMoeda(entM - saiM)}</b>.`;

    const produzir = produtos.filter((p) => p.ativo !== false && controlaEstoque(p) && Number(p.estoque) <= Number(p.estoqueMinimo ?? 3))
        .sort((a, b) => a.estoque - b.estoque);
    $("lista-produzir").innerHTML = produzir.length ? produzir.map((p) => `
        <div class="linha-lista">
            <img src="${escaparHtml(p.imagem)}" alt="">
            <div class="info"><strong>${escaparHtml(p.nome)}</strong><small>${Number(p.estoque) === 0 ? '<span class="pilula acabou">Acabou</span>' : `Restam ${p.estoque}`}</small></div>
            <div class="contador"><button data-estoque="${p.id}" data-delta="1" class="mais" aria-label="Produzi mais um">+</button></div>
        </div>`).join("") : `<p class="vazio">Tudo certo! Nenhum produto acabando. 🎉</p>`;

    $("lista-hoje").innerHTML = deHoje.length ? deHoje.slice(0, 8).map((m) => htmlMov(m)).join("") : `<p class="vazio">Nenhum movimento hoje ainda.</p>`;
}

// ─── VENDER (BALCÃO) ─────────────────────────────────────────────────────────
function renderVender() {
    const termo = $("vender-busca").value.trim().toLowerCase();
    $("cat-vender").innerHTML = `<button data-cat="" class="${catVender ? "" : "ativo"}">Tudo</button>` +
        categorias.map((c) => `<button data-cat="${c.id}" class="${catVender === c.id ? "ativo" : ""}">${escaparHtml(c.nome)}</button>`).join("");
    const lista = produtos.filter((p) => p.ativo !== false && (!termo || p.nome.toLowerCase().includes(termo)) && (termo || !catVender || p.categoria === catVender));
    $("grade-vender").innerHTML = lista.map((p) => {
        const naCesta = cesta.filter((i) => i.id === p.id).reduce((a, i) => a + i.quantidade, 0);
        const zerado = controlaEstoque(p) && Number(p.estoque) - naCesta <= 0;
        return `
            <button class="tile${zerado ? " zerado" : ""}${naCesta ? " na-cesta" : ""}" data-vender="${p.id}">
                <img src="${escaparHtml(p.imagem)}" alt="" loading="lazy">
                ${naCesta ? `<b class="tile-qtd">${naCesta}</b>` : ""}
                ${controlaEstoque(p) ? `<b class="tile-estoque">${Math.max(0, p.estoque - naCesta)} disp.</b>` : ""}
                <span>${escaparHtml(p.nome)}</span>
                <em>${formatarMoeda(precoBase(p))}</em>
            </button>`;
    }).join("") || `<p class="vazio">Nenhum produto encontrado.</p>`;
    renderCesta();
}

function totalCesta() { return cesta.reduce((a, i) => a + i.preco * i.quantidade, 0); }

function renderCesta() {
    $("cesta-itens").innerHTML = cesta.length ? cesta.map((i, idx) => `
        <div class="cesta-item">
            <div><strong>${escaparHtml(i.nome)}</strong><small>${i.detalhe ? escaparHtml(i.detalhe) + " · " : ""}${formatarMoeda(i.preco)} cada</small></div>
            <div class="contador">
                <button data-cesta="${idx}" data-delta="-1" aria-label="Menos">−</button>
                <span>${i.quantidade}</span>
                <button data-cesta="${idx}" data-delta="1" aria-label="Mais">+</button>
            </div>
        </div>`).join("") : `<p class="vazio">Toque nos produtos para adicionar.</p>`;
    const total = totalCesta();
    $("cesta-total").textContent = formatarMoeda(total);
    $("cesta-concluir").disabled = !cesta.length;
    $("cesta-troco-campo").hidden = pagamentoCesta !== "Dinheiro";
    const recebido = Number($("cesta-recebido").value);
    $("cesta-troco").textContent = recebido > 0
        ? (recebido >= total ? `Troco: ${formatarMoeda(recebido - total)}` : `Faltam ${formatarMoeda(total - recebido)}`)
        : "";
    const qtd = cesta.reduce((a, i) => a + i.quantidade, 0);
    $("barra-cesta").hidden = !qtd || paginaAtual !== "vender";
    $("barra-cesta-qtd").textContent = `${qtd} ${qtd === 1 ? "item" : "itens"}`;
    $("barra-cesta-total").textContent = formatarMoeda(total);
}

function colocarNaCesta(p, tamanho, opcao) {
    const naCesta = cesta.filter((i) => i.id === p.id).reduce((a, i) => a + i.quantidade, 0);
    if (controlaEstoque(p) && naCesta + 1 > Number(p.estoque)) {
        avisar(`"${p.nome}" está sem estoque. Atualize em Estoque se tiver mais.`, false);
        return;
    }
    const detalhe = [tamanho?.nome, opcao].filter(Boolean).join(" · ");
    const existente = cesta.find((i) => i.id === p.id && i.detalhe === detalhe);
    if (existente) existente.quantidade++;
    else cesta.push({ id: p.id, nome: p.nome, detalhe, preco: Number(tamanho?.preco ?? precoBase(p)), quantidade: 1 });
    renderVender();
}

function escolherOpcao(p) {
    const tam = tamanhosDe(p);
    const ops = p.opcaoInclusa?.opcoes || [];
    let tSel = tam.length > 1 ? null : tam[0];
    let oSel = ops.length ? null : "";
    $("jo-titulo").textContent = p.nome;
    const desenhar = () => {
        $("jo-conteudo").innerHTML = `
            ${tam.length > 1 ? `<p class="rotulo">Tamanho</p><div class="opcao-lista">${tam.map((t, i) => `<button data-t="${i}" style="${tSel === t ? "border-color:var(--ouro);background:#fdf3dc" : ""}"><span>${escaparHtml(t.nome)}</span><b>${formatarMoeda(t.preco)}</b></button>`).join("")}</div>` : ""}
            ${ops.length ? `<p class="rotulo" style="margin-top:1rem">${escaparHtml(p.opcaoInclusa.label || "Opção")}</p><div class="opcao-lista">${ops.map((o) => `<button data-o="${escaparHtml(o)}" style="${oSel === o ? "border-color:var(--ouro);background:#fdf3dc" : ""}"><span>${escaparHtml(o)}</span></button>`).join("")}</div>` : ""}
            <div class="janela-botoes"><button class="btn btn-ouro btn-grande" id="jo-ok" ${tSel && oSel !== null ? "" : "disabled"}><i class="fa-solid fa-plus"></i> Colocar na venda</button></div>`;
    };
    desenhar();
    $("jo-conteudo").onclick = (e) => {
        const bt = e.target.closest("button[data-t]"), bo = e.target.closest("button[data-o]");
        if (bt) { tSel = tam[Number(bt.dataset.t)]; desenhar(); }
        else if (bo) { oSel = bo.dataset.o; desenhar(); }
        else if (e.target.closest("#jo-ok")) { fecharJanela(); colocarNaCesta(p, tSel, oSel); }
    };
    abrirJanela("jn-opcao");
}

async function concluirVenda() {
    if (!cesta.length) return;
    const total = totalCesta();
    const cliente = $("cesta-cliente").value.trim();
    $("cesta-concluir").disabled = true;
    try {
        for (const i of cesta) await mudarEstoque(i.id, -i.quantidade);
        await registrarMovimento({
            tipo: "entrada", categoria: "Venda no balcão", valor: total, pagamento: pagamentoCesta,
            descricao: (cliente ? cliente + ": " : "") + cesta.map((i) => `${i.quantidade}x ${i.nome}${i.detalhe ? " (" + i.detalhe + ")" : ""}`).join(", "),
            itens: cesta.map((i) => ({ id: i.id, nome: i.nome, quantidade: i.quantidade, preco: i.preco })),
        });
        cesta = [];
        $("cesta-cliente").value = ""; $("cesta-recebido").value = "";
        avisar(`Venda de ${formatarMoeda(total)} registrada!`);
        renderVender();
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
        console.error(e); avisar("Não foi possível registrar a venda. Tente de novo.", false);
    } finally { $("cesta-concluir").disabled = !cesta.length; }
}

// ─── PEDIDOS DO SITE ─────────────────────────────────────────────────────────
const ROTULO_STATUS = { novo: "Novo", confirmado: "Fazendo", entregue: "Entregue", cancelado: "Cancelado" };

function linkCliente(p, texto) {
    let num = (p.telefone || "").replace(/\D/g, "");
    if (num.length <= 11) num = "55" + num;
    return `https://wa.me/${num}?text=${encodeURIComponent(texto)}`;
}

function renderPedidos() {
    ["novo", "confirmado"].forEach((s) => { $("qtd-" + s).textContent = pedidos.filter((p) => p.status === s).length || ""; });
    $$("#abas-pedidos button").forEach((b) => b.classList.toggle("ativo", b.dataset.status === statusPedidos));
    const lista = pedidos.filter((p) => p.status === statusPedidos);
    const vazio = { novo: "Nenhum pedido novo agora. Quando chegar, ele aparece aqui.", confirmado: "Nenhum pedido em preparo.", entregue: "Nenhum pedido entregue ainda.", cancelado: "Nenhum pedido cancelado." };
    $("lista-pedidos").innerHTML = lista.length ? lista.map((p) => {
        const partes = (p.cliente || "").split(" ");
        const nome1 = /^(seu|dona|sr\.?|sra\.?)$/i.test(partes[0]) && partes[1] ? partes[0] + " " + partes[1] : partes[0];
        const botoes = {
            novo: `
                <button class="btn btn-verde btn-grande" data-pedido="${p.docId}" data-acao="aceitar"><i class="fa-solid fa-check"></i> Aceitar pedido</button>
                <button class="btn btn-claro btn-perigo" data-pedido="${p.docId}" data-acao="cancelar"><i class="fa-solid fa-xmark"></i> Recusar</button>`,
            confirmado: `
                <button class="btn btn-verde btn-grande" data-pedido="${p.docId}" data-acao="entregar"><i class="fa-solid fa-hand-holding-heart"></i> Entregue e pago</button>
                <button class="btn btn-claro btn-perigo" data-pedido="${p.docId}" data-acao="cancelar"><i class="fa-solid fa-xmark"></i> Cancelar</button>`,
        }[p.status] || "";
        const msgCliente = p.status === "novo"
            ? `Olá, ${nome1}! Aqui é da ${config.nomeLoja}. Recebemos seu pedido nº ${p.codigo} 😊`
            : `Olá, ${nome1}! Seu pedido nº ${p.codigo} da ${config.nomeLoja} ${p.tipoEntrega === "Entrega" ? "já saiu para entrega" : "já está pronto para retirada"}! 🍰`;
        return `
            <article class="pedido ${p.status}">
                <div class="pedido-topo">
                    <div><strong>${escaparHtml(p.cliente)}</strong><small>Pedido ${escaparHtml(p.codigo)} · ${tempoAtras(p.criadoEm)}</small></div>
                    <span class="etiqueta ${p.status}">${ROTULO_STATUS[p.status]}</span>
                </div>
                <div class="pedido-corpo">
                    <ul>${(p.itens || []).map((i) => `<li><span><b>${i.quantidade}x</b> ${escaparHtml(i.nome)}</span><span>${formatarMoeda(i.preco * i.quantidade)}</span></li>`).join("")}</ul>
                    <div class="pedido-info">
                        ${p.tipoEntrega === "Entrega"
                ? `<span><i class="fa-solid fa-motorcycle"></i> Entregar em: <b>${escaparHtml(p.endereco)}</b> — ${escaparHtml(p.bairro)}</span>`
                : `<span><i class="fa-solid fa-house"></i> Vai buscar: <b>${escaparHtml(p.retirada)}</b></span>`}
                        <span><i class="fa-solid fa-wallet"></i> ${escaparHtml(p.pagamento)}</span>
                        <span><i class="fa-solid fa-phone"></i> ${escaparHtml(p.telefone)}</span>
                        ${p.observacao ? `<span><i class="fa-solid fa-comment"></i> ${escaparHtml(p.observacao)}</span>` : ""}
                    </div>
                    ${p.frete ? `<div style="display:flex;justify-content:space-between;margin-top:.5rem;color:var(--suave)"><span>Entrega</span><span>${formatarMoeda(p.frete)}</span></div>` : ""}
                    ${p.desconto ? `<div style="display:flex;justify-content:space-between;color:var(--verde)"><span>Desconto</span><span>- ${formatarMoeda(p.desconto)}</span></div>` : ""}
                    <div class="pedido-total"><span>Total</span><span>${formatarMoeda(p.total)}</span></div>
                </div>
                <div class="pedido-botoes">
                    ${botoes}
                    <a class="btn btn-whats" href="${linkCliente(p, msgCliente)}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Chamar ${escaparHtml(nome1)}</a>
                </div>
            </article>`;
    }).join("") : `<div class="bloco"><p class="vazio">${vazio[statusPedidos]}</p></div>`;
}

async function acaoPedido(docId, acao) {
    const p = pedidos.find((x) => x.docId === docId);
    if (!p) return;
    if (acao === "aceitar") {
        for (const i of p.itens || []) await mudarEstoque(i.id, -i.quantidade);
        p.status = "confirmado"; p.confirmadoEm = new Date().toISOString();
        await Dados.salvar("pedidos", docId, { status: p.status, confirmadoEm: p.confirmadoEm });
        avisar("Pedido aceito! O estoque já foi descontado.");
    } else if (acao === "entregar") {
        p.status = "entregue"; p.entregueEm = new Date().toISOString();
        await Dados.salvar("pedidos", docId, { status: p.status, entregueEm: p.entregueEm });
        await registrarMovimento({
            tipo: "entrada", categoria: "Pedido do site", valor: p.total, pagamento: (p.pagamento || "").split(" (")[0],
            descricao: `${p.cliente} · pedido ${p.codigo}`, itens: p.itens, pedido: p.codigo,
        });
        avisar(`Pronto! ${formatarMoeda(p.total)} entrou no caixa.`);
    } else if (acao === "cancelar") {
        const ok = await confirmar("Cancelar este pedido?", `O pedido de ${p.cliente} vai para "Cancelados".`, "Sim, cancelar");
        if (!ok) return;
        if (p.status === "confirmado") for (const i of p.itens || []) await mudarEstoque(i.id, i.quantidade);
        p.status = "cancelado";
        await Dados.salvar("pedidos", docId, { status: "cancelado" });
        avisar("Pedido cancelado.");
    }
    atualizarTela();
}

// ─── ESTOQUE / PRODUTOS ──────────────────────────────────────────────────────
function renderEstoque() {
    $$("#filtro-estoque button").forEach((b) => b.classList.toggle("ativo", b.dataset.filtro === filtroEstoque));
    const termo = $("estoque-busca").value.trim().toLowerCase();
    let lista = produtos.filter((p) => !termo || p.nome.toLowerCase().includes(termo));
    if (filtroEstoque === "baixo") lista = lista.filter((p) => controlaEstoque(p) && Number(p.estoque) <= Number(p.estoqueMinimo ?? 3));
    if (filtroEstoque === "fora") lista = lista.filter((p) => p.ativo === false);

    const grupos = categorias.map((c) => ({ c, itens: lista.filter((p) => p.categoria === c.id) })).filter((g) => g.itens.length);
    const semCat = lista.filter((p) => !categorias.some((c) => c.id === p.categoria));
    if (semCat.length) grupos.push({ c: { nome: "Sem categoria" }, itens: semCat });

    $("lista-estoque").innerHTML = grupos.length ? grupos.map((g) => `
        <p class="dia-cabecalho"><span>${escaparHtml(g.c.nome)}</span><span>${g.itens.length}</span></p>
        ${g.itens.map((p) => {
        const est = controlaEstoque(p);
        const pilulas = [
            p.ativo === false ? `<span class="pilula fora">Fora do site</span>` : "",
            est && Number(p.estoque) === 0 ? `<span class="pilula acabou">Acabou</span>` : est && Number(p.estoque) <= Number(p.estoqueMinimo ?? 3) ? `<span class="pilula pouco">Acabando</span>` : "",
            p.disponibilidade === "encomenda" ? `<span class="pilula encomenda">Encomenda</span>` : "",
        ].join("");
        return `
            <div class="produto-linha${p.ativo === false ? " fora" : ""}">
                <img src="${escaparHtml(p.imagem)}" alt="" loading="lazy">
                <div>
                    <div class="nome">${escaparHtml(p.nome)}</div>
                    <div class="detalhes"><span class="preco">${formatarMoeda(precoBase(p))}</span>${pilulas}</div>
                </div>
                <div class="estoque-controle">
                    ${est ? `<div class="contador">
                        <button data-estoque="${p.id}" data-delta="-1" aria-label="Tirar um">−</button>
                        <span>${p.estoque}</span>
                        <button data-estoque="${p.id}" data-delta="1" class="mais" aria-label="Pôr mais um">+</button>
                    </div>` : `<small style="color:var(--suave);text-align:center">Não controla<br>quantidade</small>`}
                </div>
                <div class="produto-acoes">
                    <label class="interruptor"><input type="checkbox" data-ativo="${p.id}" ${p.ativo !== false ? "checked" : ""}><span class="trilha"></span><span>No site</span></label>
                    <button class="btn btn-claro btn-editar" data-editar="${p.id}"><i class="fa-solid fa-pen"></i> Editar</button>
                </div>
            </div>`;
    }).join("")}`).join("") : `<div class="bloco"><p class="vazio">Nenhum produto aqui.</p></div>`;
}

let produtoEditando = null, fotoNova = null, fotoArquivo = null;

function abrirProduto(id) {
    produtoEditando = id ? produtos.find((x) => x.id === Number(id)) : null;
    const p = produtoEditando || { ativo: true, estoqueMinimo: 3, categoria: categorias[0]?.id };
    fotoNova = null; fotoArquivo = null;
    $("jp-foto").value = "";
    $("jp-foto-inteira").checked = !!p.fotoInteira;
    $("jp-titulo").textContent = produtoEditando ? "Editar produto" : "Novo produto";
    $("jp-foto-previa").src = p.imagem || "assets/logo-olimpo.png";
    $("jp-nome").value = p.nome || "";
    $("jp-preco").value = p.preco ?? "";
    $("jp-categoria").innerHTML = categorias.map((c) => `<option value="${c.id}">${escaparHtml(c.nome)}</option>`).join("");
    $("jp-categoria").value = p.categoria || "";
    $("jp-descricao").value = p.descricao || "";
    $("jp-estoque").value = controlaEstoque(p) ? p.estoque : "";
    $("jp-minimo").value = p.estoqueMinimo ?? 3;
    $("jp-sabores").value = (p.opcaoInclusa?.opcoes || []).join("\n");
    $("jp-tamanhos").value = (p.tamanhos || []).map((t) => `${t.nome} | ${String(t.preco).replace(".", ",")}`).join("\n");
    $("jp-encomenda").checked = p.disponibilidade === "encomenda";
    $("jp-prazo").value = p.prazoDias || "";
    $("jp-prazo-campo").hidden = !$("jp-encomenda").checked;
    $("jp-destaque").checked = !!p.destaque;
    $("jp-ativo").checked = p.ativo !== false;
    $("jp-excluir").hidden = !produtoEditando;
    abrirJanela("jn-produto");
}

// inteira = true: não corta a foto (artes com preço e escrita). A imagem toda fica
// no centro de um quadrado, e o espaço que sobra é preenchido com a própria foto desfocada.
function reduzirFoto(arquivo, inteira = false) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();
        leitor.onload = () => {
            const img = new Image();
            img.onload = () => {
                const cv = document.createElement("canvas");
                const ctx = cv.getContext("2d");
                if (!inteira) {
                    const lado = Math.min(img.width, img.height);
                    const tam = Math.min(700, lado);
                    cv.width = cv.height = tam;
                    ctx.drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, tam, tam);
                } else {
                    const tam = Math.min(900, Math.max(img.width, img.height));
                    cv.width = cv.height = tam;
                    // Fundo: a foto cobrindo o quadrado, desfocada e um pouco escurecida
                    const borrao = Math.round(tam / 25), folga = borrao * 3; // folga evita borda escura do desfoque
                    const cobre = Math.max((tam + folga * 2) / img.width, (tam + folga * 2) / img.height);
                    ctx.filter = `blur(${borrao}px) brightness(.85)`;
                    ctx.drawImage(img, (tam - img.width * cobre) / 2, (tam - img.height * cobre) / 2, img.width * cobre, img.height * cobre);
                    ctx.filter = "none";
                    // Frente: a foto inteira, sem cortar
                    const cabe = Math.min(tam / img.width, tam / img.height);
                    const w = img.width * cabe, h = img.height * cabe;
                    ctx.drawImage(img, (tam - w) / 2, (tam - h) / 2, w, h);
                }
                resolve(cv.toDataURL("image/jpeg", 0.82));
            };
            img.onerror = reject;
            img.src = leitor.result;
        };
        leitor.onerror = reject;
        leitor.readAsDataURL(arquivo);
    });
}

async function salvarProduto() {
    const nome = $("jp-nome").value.trim();
    const preco = Number(String($("jp-preco").value).replace(",", "."));
    if (!nome) { avisar("Coloque o nome do produto.", false); $("jp-nome").focus(); return; }
    if (!(preco >= 0) || $("jp-preco").value === "") { avisar("Coloque o preço.", false); $("jp-preco").focus(); return; }
    const sabores = $("jp-sabores").value.split("\n").map((s) => s.trim()).filter(Boolean);
    const tamanhos = $("jp-tamanhos").value.split("\n").map((l) => l.split("|")).filter((x) => x.length >= 2 && x[0].trim())
        .map(([n, v]) => ({ nome: n.trim(), preco: Number(v.trim().replace(",", ".")) || 0 }));
    const id = produtoEditando ? produtoEditando.id : Math.max(0, ...produtos.map((x) => x.id)) + 1;
    const dados = {
        id, nome, preco, categoria: $("jp-categoria").value, descricao: $("jp-descricao").value.trim(),
        estoque: $("jp-estoque").value === "" ? null : Math.max(0, Number($("jp-estoque").value)),
        estoqueMinimo: Number($("jp-minimo").value) || 0,
        opcaoInclusa: sabores.length ? { label: produtoEditando?.opcaoInclusa?.label || "Escolha o sabor", opcoes: sabores } : null,
        tamanhos: tamanhos.length > 1 ? tamanhos : null,
        disponibilidade: $("jp-encomenda").checked ? "encomenda" : "pronta",
        prazoDias: $("jp-encomenda").checked ? Number($("jp-prazo").value) || null : null,
        destaque: $("jp-destaque").checked, ativo: $("jp-ativo").checked,
        imagem: fotoNova || produtoEditando?.imagem || "assets/logo-olimpo.png",
        fotoInteira: $("jp-foto-inteira").checked,
    };
    if (dados.tamanhos) dados.preco = dados.tamanhos[0].preco;
    await Dados.salvar("produtos", id, dados);
    const idx = produtos.findIndex((x) => x.id === id);
    if (idx >= 0) produtos[idx] = { ...produtos[idx], ...dados }; else produtos.push(dados);
    fecharJanela();
    avisar(produtoEditando ? "Produto salvo!" : "Produto criado!");
    atualizarTela();
}

async function excluirProduto() {
    if (!produtoEditando) return;
    const ok = await confirmar("Apagar produto?", `"${produtoEditando.nome}" some do site e do painel. Se for só por uns dias, prefira desligar "No site".`, "Sim, apagar");
    if (!ok) { abrirJanela("jn-produto"); return; }
    await Dados.excluir("produtos", produtoEditando.id);
    produtos = produtos.filter((x) => x.id !== produtoEditando.id);
    avisar("Produto apagado.");
    atualizarTela();
}

// ─── CAIXA ───────────────────────────────────────────────────────────────────
function renderCaixa() {
    $("caixa-mes-nome").textContent = nomeMes(mesCaixa);
    $$("#filtro-caixa button").forEach((b) => b.classList.toggle("ativo", b.dataset.filtro === filtroCaixa));
    const doMes = movs.filter((m) => noMes(m.data, mesCaixa));
    const ent = doMes.filter((m) => m.tipo === "entrada").reduce((a, m) => a + m.valor, 0);
    const sai = doMes.filter((m) => m.tipo === "saida").reduce((a, m) => a + m.valor, 0);
    $("caixa-entradas").textContent = formatarMoeda(ent);
    $("caixa-saidas").textContent = formatarMoeda(sai);
    $("caixa-saldo").textContent = formatarMoeda(ent - sai);
    $("caixa-saldo").classList.toggle("negativo", ent - sai < 0);

    const lista = doMes.filter((m) => filtroCaixa === "todos" || m.tipo === filtroCaixa);
    const porDia = {};
    lista.forEach((m) => { (porDia[diaLocal(m.data)] = porDia[diaLocal(m.data)] || []).push(m); });
    const dias = Object.keys(porDia).sort().reverse();
    $("lista-caixa").innerHTML = dias.length ? dias.map((d) => {
        const itens = porDia[d];
        const saldoDia = itens.reduce((a, m) => a + (m.tipo === "entrada" ? m.valor : -m.valor), 0);
        return `
            <p class="dia-cabecalho"><span>${d === hojeStr() ? "Hoje" : diaExtenso(itens[0].data)}</span><span>${filtroCaixa === "todos" ? "Sobrou " : ""}${formatarMoeda(Math.abs(saldoDia))}</span></p>
            <div class="bloco" style="padding:.3rem 1rem">${itens.map((m) => htmlMov(m, true)).join("")}</div>`;
    }).join("") : `<div class="bloco"><p class="vazio">Nada anotado neste mês.</p></div>`;
}

let tipoMov = "saida", categoriaMov = null;
function abrirMovimento(tipo) {
    tipoMov = tipo; categoriaMov = null;
    $("jm-titulo").textContent = tipo === "saida" ? "Anotar gasto" : "Anotar entrada";
    $("jm-valor").value = ""; $("jm-descricao").value = "";
    $("jm-data").value = hojeStr();
    $("jm-salvar").className = "btn btn-grande " + (tipo === "saida" ? "btn-vermelho" : "btn-verde");
    const cats = tipo === "saida" ? CATEGORIAS_SAIDA : CATEGORIAS_ENTRADA;
    $("jm-categorias").innerHTML = cats.map((c) => `<button type="button" data-cat="${c.nome}"><i class="fa-solid ${c.icone}"></i>${c.nome}</button>`).join("");
    abrirJanela("jn-movimento");
    setTimeout(() => $("jm-valor").focus(), 250);
}
async function salvarMovimento() {
    const valor = Number(String($("jm-valor").value).replace(",", "."));
    if (!(valor > 0)) { avisar("Digite o valor.", false); $("jm-valor").focus(); return; }
    if (!categoriaMov) { avisar("Toque em uma das opções (com o quê?).", false); return; }
    const [a, m, d] = $("jm-data").value.split("-").map(Number);
    const agora = new Date();
    const data = $("jm-data").value === hojeStr() ? agora : new Date(a, m - 1, d, 12, 0);
    await registrarMovimento({ tipo: tipoMov, categoria: categoriaMov, descricao: $("jm-descricao").value.trim(), pagamento: $("jm-pagamento").value, valor, data: data.toISOString() });
    fecharJanela();
    avisar(tipoMov === "saida" ? `Gasto de ${formatarMoeda(valor)} anotado.` : `Entrada de ${formatarMoeda(valor)} anotada.`);
    atualizarTela();
}
async function apagarMovimento(docId) {
    const m = movs.find((x) => x.docId === docId);
    if (!m) return;
    const ok = await confirmar("Apagar este movimento?", `${m.categoria}: ${formatarMoeda(m.valor)}. Use só se foi anotado errado.`, "Sim, apagar");
    if (!ok) return;
    await Dados.excluir("movimentacoes", docId);
    movs = movs.filter((x) => x.docId !== docId);
    avisar("Movimento apagado.");
    atualizarTela();
}

// ─── RELATÓRIO ───────────────────────────────────────────────────────────────
function dadosRelatorio(mes) {
    const doMes = movs.filter((m) => noMes(m.data, mes));
    const entradas = doMes.filter((m) => m.tipo === "entrada");
    const saidas = doMes.filter((m) => m.tipo === "saida");
    const ent = entradas.reduce((a, m) => a + m.valor, 0);
    const sai = saidas.reduce((a, m) => a + m.valor, 0);
    const top = {};
    entradas.forEach((m) => (m.itens || []).forEach((i) => {
        const chave = i.nome.split(" (")[0];
        top[chave] = top[chave] || { nome: chave, qtd: 0, valor: 0 };
        top[chave].qtd += i.quantidade; top[chave].valor += i.quantidade * i.preco;
    }));
    const gastos = {}; saidas.forEach((m) => { gastos[m.categoria] = (gastos[m.categoria] || 0) + m.valor; });
    const pags = {}; entradas.forEach((m) => { const k = m.pagamento || "Outro"; pags[k] = (pags[k] || 0) + m.valor; });
    const diasNoMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    const porDia = Array.from({ length: diasNoMes }, (_, i) => ({ dia: i + 1, e: 0, s: 0 }));
    doMes.forEach((m) => { const d = new Date(m.data).getDate() - 1; porDia[d][m.tipo === "entrada" ? "e" : "s"] += m.valor; });
    return {
        ent, sai, lucro: ent - sai, qtdVendas: entradas.length,
        top: Object.values(top).sort((a, b) => b.qtd - a.qtd).slice(0, 8),
        gastos: Object.entries(gastos).sort((a, b) => b[1] - a[1]),
        pags: Object.entries(pags).sort((a, b) => b[1] - a[1]),
        porDia,
    };
}

const barraH = (rotulo, valorTxt, pct, vermelha = false) => `
    <div class="barra-h${vermelha ? " vermelha" : ""}"><div class="topo-barra"><span>${escaparHtml(rotulo)}</span><b>${valorTxt}</b></div>
    <div class="fundo"><div class="cheio" style="width:${Math.max(2, pct)}%"></div></div></div>`;

function renderRelatorio() {
    $("rel-mes-nome").textContent = nomeMes(mesRel);
    const r = dadosRelatorio(mesRel);
    $("rel-entradas").textContent = formatarMoeda(r.ent);
    $("rel-saidas").textContent = formatarMoeda(r.sai);
    $("rel-lucro").textContent = formatarMoeda(r.lucro);
    $("rel-lucro").classList.toggle("negativo", r.lucro < 0);
    $("rel-frase").innerHTML = r.qtdVendas
        ? `<i class="fa-solid fa-lightbulb" style="color:var(--ouro)"></i> Foram <b>${r.qtdVendas} vendas</b>, em média <b>${formatarMoeda(r.ent / r.qtdVendas)}</b> cada. ${r.ent > 0 ? `De cada R$ 10 que entraram, sobraram <b>${formatarMoeda(Math.max(0, r.lucro) / r.ent * 10)}</b>.` : ""}`
        : "Ainda não há vendas neste mês.";

    const max = Math.max(1, ...r.porDia.map((d) => Math.max(d.e, d.s)));
    $("rel-grafico").innerHTML = r.porDia.map((d) => `
        <div class="dia" title="Dia ${d.dia}: entrou ${formatarMoeda(d.e)}, saiu ${formatarMoeda(d.s)}">
            <div class="barras"><div class="b e" style="height:${d.e / max * 100}%"></div><div class="b s" style="height:${d.s / max * 100}%"></div></div>
            ${d.dia % 5 === 1 ? `<span class="rot">${d.dia}</span>` : ""}
        </div>`).join("") ;
    $("rel-grafico").insertAdjacentHTML("afterend", $("rel-grafico").nextElementSibling?.classList.contains("grafico-espaco") ? "" : `<div class="grafico-espaco"></div>`);

    const maxTop = Math.max(1, ...r.top.map((t) => t.qtd));
    $("rel-top").innerHTML = r.top.length ? r.top.map((t) => barraH(t.nome, `${t.qtd} un.`, t.qtd / maxTop * 100)).join("") : `<p class="vazio">Sem vendas no mês.</p>`;
    const maxG = Math.max(1, ...r.gastos.map((g) => g[1]));
    $("rel-gastos").innerHTML = r.gastos.length ? r.gastos.map(([c, v]) => barraH(c, formatarMoeda(v), v / maxG * 100, true)).join("") : `<p class="vazio">Nenhum gasto anotado.</p>`;
    const maxP = Math.max(1, ...r.pags.map((g) => g[1]));
    $("rel-pagamentos").innerHTML = r.pags.length ? r.pags.map(([c, v]) => barraH(c, `${formatarMoeda(v)} (${Math.round(v / r.ent * 100)}%)`, v / maxP * 100)).join("") : `<p class="vazio">Sem vendas no mês.</p>`;
}

function resumoTexto() {
    const r = dadosRelatorio(mesRel);
    let t = `*${config.nomeLoja} — Resumo de ${nomeMes(mesRel)}*\n\n`;
    t += `💰 Vendeu: ${formatarMoeda(r.ent)} (${r.qtdVendas} vendas)\n🧾 Gastou: ${formatarMoeda(r.sai)}\n✨ Lucro: ${formatarMoeda(r.lucro)}\n\n`;
    if (r.top.length) t += `*Mais vendidos:*\n${r.top.slice(0, 5).map((x, i) => `${i + 1}. ${x.nome} — ${x.qtd} un.`).join("\n")}\n\n`;
    if (r.gastos.length) t += `*Gastos:*\n${r.gastos.map(([c, v]) => `• ${c}: ${formatarMoeda(v)}`).join("\n")}`;
    return t;
}

function imprimirRelatorio() {
    const r = dadosRelatorio(mesRel);
    const linhas = movs.filter((m) => noMes(m.data, mesRel)).slice().reverse();
    $("area-impressao").innerHTML = `
        <h1>${escaparHtml(config.nomeLoja)} — Relatório de ${nomeMes(mesRel)}</h1>
        <p>Vendeu: <b>${formatarMoeda(r.ent)}</b> · Gastou: <b>${formatarMoeda(r.sai)}</b> · Lucro: <b>${formatarMoeda(r.lucro)}</b> · ${r.qtdVendas} vendas</p>
        <h3 style="margin-top:14px">Mais vendidos</h3>
        <table><tr><th>Produto</th><th class="v">Qtd.</th><th class="v">Valor</th></tr>${r.top.map((t) => `<tr><td>${escaparHtml(t.nome)}</td><td class="v">${t.qtd}</td><td class="v">${formatarMoeda(t.valor)}</td></tr>`).join("")}</table>
        <h3>Gastos por tipo</h3>
        <table>${r.gastos.map(([c, v]) => `<tr><td>${escaparHtml(c)}</td><td class="v">${formatarMoeda(v)}</td></tr>`).join("")}</table>
        <h3>Todos os movimentos</h3>
        <table><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th class="v">Valor</th></tr>
        ${linhas.map((m) => `<tr><td>${new Date(m.data).toLocaleDateString("pt-BR")}</td><td>${escaparHtml(m.categoria)}</td><td>${escaparHtml(m.descricao || "")}</td><td class="v">${m.tipo === "entrada" ? "+" : "−"} ${formatarMoeda(m.valor)}</td></tr>`).join("")}</table>
        <p style="margin-top:10px;color:#666">Gerado em ${new Date().toLocaleString("pt-BR")} · Sistema TF Solutions</p>`;
    window.print();
}

// ─── AJUSTES ─────────────────────────────────────────────────────────────────
let fretesEdit = [];
function renderAjustes() {
    $("aj-aberta").checked = config.lojaAberta !== false;
    $("aj-nome").value = config.nomeLoja || "";
    $("aj-dona").value = config.nomeDona || "";
    $("aj-whats").value = config.whatsapp || "";
    $("aj-endereco").value = config.endereco || "";
    $("aj-aviso").value = config.aviso || "";
    $("aj-entrega").checked = config.entregaDisponivel !== false;
    $("aj-retirada").checked = config.retiradaDisponivel !== false;
    $("aj-minimo").value = config.pedidoMinimo ?? 0;
    $("aj-gratis").value = config.freteGratisAcima ?? 0;
    $("aj-hora-ini").value = config.retiradaHoraInicio || "09:00";
    $("aj-hora-fim").value = config.retiradaHoraFim || "18:00";
    $("aj-titulo").value = config.heroTitulo || "";
    $("aj-subtitulo").value = config.heroSubtitulo || "";
    $("aj-sobre").value = config.sobreTexto || "";
    $("aj-natal").checked = config.vitrineNatal !== false;
    $("aj-natal-titulo").value = config.natalTitulo || "";
    $("aj-natal-aviso").value = config.natalAviso || "";
    $("aj-dias").innerHTML = NOMES_DIAS.map((n, i) => `<label><input type="checkbox" value="${i}" ${(config.retiradaDias || []).includes(i) ? "checked" : ""}><span>${n}</span></label>`).join("");
    fretesEdit = (config.fretes || []).map((f) => ({ ...f }));
    renderFretes();
    renderCupons();
    $("aj-resetar").hidden = !MODO_DEMO;
}
function renderFretes() {
    $("aj-fretes").innerHTML = fretesEdit.map((f, i) => `
        <div class="frete-linha">
            <input type="text" value="${escaparHtml(f.bairro)}" data-frete="${i}" data-campo="bairro" placeholder="Bairro" aria-label="Bairro">
            <input type="number" value="${f.valor}" data-frete="${i}" data-campo="valor" min="0" step="0.5" inputmode="decimal" aria-label="Valor da entrega">
            <button class="btn-icone" data-remover-frete="${i}" aria-label="Remover bairro"><i class="fa-regular fa-trash-can"></i></button>
        </div>`).join("");
}
function renderCupons() {
    $("aj-cupons").innerHTML = cupons.length ? cupons.map((c) => `
        <div class="linha-lista">
            <span class="icone-mov entrada"><i class="fa-solid fa-ticket"></i></span>
            <div class="info"><strong>${escaparHtml(c.codigo)}</strong><small>${c.tipo === "fixo" ? formatarMoeda(c.valor) : c.valor + "%"} de desconto${c.valorMinimo ? ` · pedidos a partir de ${formatarMoeda(c.valorMinimo)}` : ""}${c.validade ? ` · até ${new Date(c.validade + "T12:00").toLocaleDateString("pt-BR")}` : ""}</small></div>
            <button class="btn btn-claro btn-editar" data-cupom="${c.docId}"><i class="fa-solid fa-pen"></i></button>
        </div>`).join("") : `<p class="vazio">Nenhum cupom criado.</p>`;
}
async function salvarAjustes() {
    const whats = $("aj-whats").value.replace(/\D/g, "");
    if (whats.length < 12) { avisar("Confira o WhatsApp: precisa ter 55 + DDD + número.", false); $("aj-whats").focus(); return; }
    if (!$("aj-entrega").checked && !$("aj-retirada").checked) { avisar("Deixe pelo menos entrega ou retirada ligada.", false); return; }
    const novo = {
        lojaAberta: $("aj-aberta").checked,
        nomeLoja: $("aj-nome").value.trim() || CONFIG_PADRAO.nomeLoja,
        nomeDona: $("aj-dona").value.trim(), whatsapp: whats,
        endereco: $("aj-endereco").value.trim(), aviso: $("aj-aviso").value.trim(),
        entregaDisponivel: $("aj-entrega").checked, retiradaDisponivel: $("aj-retirada").checked,
        pedidoMinimo: Number($("aj-minimo").value) || 0, freteGratisAcima: Number($("aj-gratis").value) || 0,
        retiradaHoraInicio: $("aj-hora-ini").value, retiradaHoraFim: $("aj-hora-fim").value,
        retiradaDias: $$("#aj-dias input:checked").map((x) => Number(x.value)),
        heroTitulo: $("aj-titulo").value.trim() || CONFIG_PADRAO.heroTitulo,
        heroSubtitulo: $("aj-subtitulo").value.trim(), sobreTexto: $("aj-sobre").value.trim(),
        vitrineNatal: $("aj-natal").checked,
        natalTitulo: $("aj-natal-titulo").value.trim() || "Especiais de Natal",
        natalAviso: $("aj-natal-aviso").value.trim(),
        fretes: fretesEdit.filter((f) => f.bairro.trim()).map((f) => ({ bairro: f.bairro.trim(), valor: Number(f.valor) || 0 })),
    };
    await Dados.salvar("configuracoes", "geral", novo);
    config = { ...config, ...novo };
    avisar("Ajustes salvos! O site já está atualizado.");
    renderAjustes();
}

let cupomEditando = null;
function abrirCupom(docId) {
    cupomEditando = docId ? cupons.find((c) => c.docId === docId) : null;
    const c = cupomEditando || { tipo: "percentual" };
    $("jc-codigo").value = c.codigo || "";
    $("jc-tipo").value = c.tipo;
    $("jc-valor").value = c.valor ?? "";
    $("jc-minimo").value = c.valorMinimo ?? "";
    $("jc-validade").value = c.validade || "";
    $("jc-excluir").hidden = !cupomEditando;
    abrirJanela("jn-cupom");
}
async function salvarCupom() {
    const codigo = $("jc-codigo").value.trim().toUpperCase().replace(/\s+/g, "");
    const valor = Number($("jc-valor").value);
    if (!codigo || !(valor > 0)) { avisar("Preencha a palavra do cupom e o valor.", false); return; }
    const dados = { codigo, tipo: $("jc-tipo").value, valor, valorMinimo: Number($("jc-minimo").value) || 0, validade: $("jc-validade").value || "", ativo: true };
    const id = cupomEditando?.docId || codigo;
    await Dados.salvar("cupons", id, dados);
    cupons = cupons.filter((c) => c.docId !== id).concat({ ...dados, docId: id });
    fecharJanela(); avisar("Cupom salvo!"); renderCupons();
}
async function excluirCupom() {
    if (!cupomEditando) return;
    await Dados.excluir("cupons", cupomEditando.docId);
    cupons = cupons.filter((c) => c.docId !== cupomEditando.docId);
    fecharJanela(); avisar("Cupom apagado."); renderCupons();
}

// ─── EVENTOS ─────────────────────────────────────────────────────────────────
function ligarEventos() {
    $("menu").addEventListener("click", (e) => { const b = e.target.closest("button[data-pagina]"); if (b) irPara(b.dataset.pagina); });
    document.addEventListener("click", async (e) => {
        const ir = e.target.closest("[data-ir]");
        if (ir) { irPara(ir.dataset.ir); return; }
        const est = e.target.closest("[data-estoque]");
        if (est) { await mudarEstoque(est.dataset.estoque, Number(est.dataset.delta)); atualizarTela(); return; }
        const ed = e.target.closest("[data-editar]");
        if (ed) { abrirProduto(ed.dataset.editar); return; }
        const ap = e.target.closest("[data-apagar-mov]");
        if (ap) { apagarMovimento(ap.dataset.apagarMov); return; }
        const pe = e.target.closest("[data-pedido]");
        if (pe) { pe.disabled = true; await acaoPedido(pe.dataset.pedido, pe.dataset.acao); return; }
        const cu = e.target.closest("[data-cupom]");
        if (cu) { abrirCupom(cu.dataset.cupom); return; }
        if (e.target.closest("[data-fechar]")) fecharJanela();
    });
    document.addEventListener("change", async (e) => {
        const at = e.target.closest("[data-ativo]");
        if (!at) return;
        const p = produtos.find((x) => x.id === Number(at.dataset.ativo));
        p.ativo = at.checked;
        await Dados.salvar("produtos", p.id, { ativo: p.ativo });
        avisar(p.ativo ? `"${p.nome}" voltou para o site.` : `"${p.nome}" saiu do site.`);
        renderEstoque();
    });
    $("janela-fundo").addEventListener("click", () => { if (janelaAberta?.id !== "jn-confirmar") fecharJanela(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharJanela(); });

    // Início
    $("atalho-gasto").addEventListener("click", () => abrirMovimento("saida"));

    // Vender
    $("vender-busca").addEventListener("input", renderVender);
    $("cat-vender").addEventListener("click", (e) => { const b = e.target.closest("button[data-cat]"); if (b) { catVender = b.dataset.cat; renderVender(); } });
    $("grade-vender").addEventListener("click", (e) => {
        const t = e.target.closest("[data-vender]");
        if (!t) return;
        const p = produtos.find((x) => x.id === Number(t.dataset.vender));
        if (tamanhosDe(p).length > 1 || p.opcaoInclusa?.opcoes?.length) escolherOpcao(p);
        else colocarNaCesta(p);
    });
    $("cesta-itens").addEventListener("click", (e) => {
        const b = e.target.closest("[data-cesta]");
        if (!b) return;
        const i = cesta[Number(b.dataset.cesta)];
        const delta = Number(b.dataset.delta);
        if (delta > 0) {
            const p = produtos.find((x) => x.id === i.id);
            const total = cesta.filter((c) => c.id === i.id).reduce((a, c) => a + c.quantidade, 0);
            if (p && controlaEstoque(p) && total + 1 > Number(p.estoque)) { avisar("Não tem mais no estoque.", false); return; }
        }
        i.quantidade += delta;
        if (i.quantidade <= 0) cesta.splice(Number(b.dataset.cesta), 1);
        renderVender();
    });
    $("cesta-pagamento").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-valor]");
        if (!b) return;
        pagamentoCesta = b.dataset.valor;
        $$("#cesta-pagamento button").forEach((x) => x.classList.toggle("ativo", x === b));
        renderCesta();
    });
    $("cesta-recebido").addEventListener("input", renderCesta);
    $("cesta-concluir").addEventListener("click", concluirVenda);
    $("cesta-limpar").addEventListener("click", () => { cesta = []; renderVender(); });
    $("barra-cesta").addEventListener("click", () => $("cesta").scrollIntoView({ behavior: "smooth" }));

    // Pedidos
    $("abas-pedidos").addEventListener("click", (e) => { const b = e.target.closest("button[data-status]"); if (b) { statusPedidos = b.dataset.status; renderPedidos(); } });

    // Estoque
    $("estoque-busca").addEventListener("input", renderEstoque);
    $("filtro-estoque").addEventListener("click", (e) => { const b = e.target.closest("button[data-filtro]"); if (b) { filtroEstoque = b.dataset.filtro; renderEstoque(); } });
    $("novo-produto").addEventListener("click", () => abrirProduto(null));
    $("jp-foto").addEventListener("change", async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        fotoArquivo = f;
        try { fotoNova = await reduzirFoto(f, $("jp-foto-inteira").checked); $("jp-foto-previa").src = fotoNova; }
        catch { avisar("Não consegui abrir essa foto.", false); }
    });
    // Marcou/desmarcou "Foto inteira": refaz a foto escolhida agora; se for uma foto antiga, pede para escolher de novo
    $("jp-foto-inteira").addEventListener("change", async () => {
        if (fotoArquivo) {
            try { fotoNova = await reduzirFoto(fotoArquivo, $("jp-foto-inteira").checked); $("jp-foto-previa").src = fotoNova; }
            catch { avisar("Não consegui abrir essa foto.", false); }
        } else if (produtoEditando?.imagem && $("jp-foto-inteira").checked !== !!produtoEditando.fotoInteira) {
            avisar("Toque em \"Trocar foto\" e escolha a foto de novo para aplicar.", true);
        }
    });
    $("jp-encomenda").addEventListener("change", () => { $("jp-prazo-campo").hidden = !$("jp-encomenda").checked; });
    $("jp-salvar").addEventListener("click", salvarProduto);
    $("jp-excluir").addEventListener("click", excluirProduto);

    // Caixa
    $("nova-entrada").addEventListener("click", () => abrirMovimento("entrada"));
    $("nova-saida").addEventListener("click", () => abrirMovimento("saida"));
    $("filtro-caixa").addEventListener("click", (e) => { const b = e.target.closest("button[data-filtro]"); if (b) { filtroCaixa = b.dataset.filtro; renderCaixa(); } });
    $("caixa-mes-ant").addEventListener("click", () => { mesCaixa = new Date(mesCaixa.getFullYear(), mesCaixa.getMonth() - 1, 1); renderCaixa(); });
    $("caixa-mes-prox").addEventListener("click", () => { mesCaixa = new Date(mesCaixa.getFullYear(), mesCaixa.getMonth() + 1, 1); renderCaixa(); });
    $("jm-categorias").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-cat]");
        if (!b) return;
        categoriaMov = b.dataset.cat;
        $$("#jm-categorias button").forEach((x) => x.classList.toggle("ativo", x === b));
    });
    $("jm-salvar").addEventListener("click", salvarMovimento);

    // Relatório
    $("rel-mes-ant").addEventListener("click", () => { mesRel = new Date(mesRel.getFullYear(), mesRel.getMonth() - 1, 1); renderRelatorio(); });
    $("rel-mes-prox").addEventListener("click", () => { mesRel = new Date(mesRel.getFullYear(), mesRel.getMonth() + 1, 1); renderRelatorio(); });
    $("rel-whats").addEventListener("click", () => window.open(`https://wa.me/?text=${encodeURIComponent(resumoTexto())}`, "_blank"));
    $("rel-imprimir").addEventListener("click", imprimirRelatorio);

    // Ajustes
    $("aj-fretes").addEventListener("input", (e) => {
        const el = e.target.closest("[data-frete]");
        if (el) fretesEdit[Number(el.dataset.frete)][el.dataset.campo] = el.value;
    });
    $("aj-fretes").addEventListener("click", (e) => {
        const b = e.target.closest("[data-remover-frete]");
        if (b) { fretesEdit.splice(Number(b.dataset.removerFrete), 1); renderFretes(); }
    });
    $("aj-add-bairro").addEventListener("click", () => {
        fretesEdit.push({ bairro: "", valor: 5 }); renderFretes();
        const inputs = $$("#aj-fretes input[data-campo='bairro']"); inputs[inputs.length - 1].focus();
    });
    $("aj-salvar").addEventListener("click", salvarAjustes);
    $("aj-add-cupom").addEventListener("click", () => abrirCupom(null));
    $("jc-salvar").addEventListener("click", salvarCupom);
    $("jc-excluir").addEventListener("click", excluirCupom);
    $("aj-suporte").href = `https://wa.me/${TF_SOLUTIONS_WHATSAPP}?text=${encodeURIComponent("Olá! Preciso de ajuda com o painel da Olimpo.")}`;
    $("aj-resetar").addEventListener("click", async () => {
        const ok = await confirmar("Voltar aos dados de demonstração?", "Tudo o que foi alterado neste navegador será apagado.", "Sim, voltar");
        if (!ok) return;
        Dados.resetar(); await carregarTudo(); avisar("Dados de demonstração restaurados."); atualizarTela();
    });

    // Sair
    const sair = async () => { await Dados.sair(); location.reload(); };
    $("sair").addEventListener("click", sair);
    $("mais-sair").addEventListener("click", sair);

    // Novos pedidos chegando: no modo demonstração, a loja aberta em outra aba
    // grava no mesmo navegador; no Firebase, confere a cada 30 segundos.
    window.addEventListener("storage", async (e) => {
        if (e.key !== CHAVE_DEMO) return;
        const antes = pedidos.filter((p) => p.status === "novo").length;
        await carregarTudo();
        if (pedidos.filter((p) => p.status === "novo").length > antes) avisar("🔔 Chegou um pedido novo pelo site!");
        atualizarTela();
    });
    if (!MODO_DEMO) setInterval(async () => {
        const antes = pedidos.filter((p) => p.status === "novo").length;
        pedidos = (await Dados.listar("pedidos")).sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
        if (pedidos.filter((p) => p.status === "novo").length > antes) avisar("🔔 Chegou um pedido novo pelo site!");
        atualizarTela();
    }, 30000);
}

// ─── LOGIN E INÍCIO ──────────────────────────────────────────────────────────
async function abrirApp() {
    $("tela-login").hidden = true;
    $("app").hidden = false;
    $("topo-data").textContent = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    try { await carregarTudo(); }
    catch (e) { console.error(e); avisar("Erro ao carregar os dados. Verifique a internet.", false); }
    irPara("inicio");
}

document.addEventListener("DOMContentLoaded", () => {
    $("campo-email").hidden = MODO_DEMO;
    $("login-dica").hidden = !MODO_DEMO;
    $("login-tf").href = `https://wa.me/${TF_SOLUTIONS_WHATSAPP}`;
    ligarEventos();
    const entrar = async () => {
        $("login-erro").hidden = true;
        try { await Dados.entrar($("login-email").value.trim(), $("login-senha").value); abrirApp(); }
        catch { $("login-erro").hidden = false; $("login-senha").select(); }
    };
    $("login-entrar").addEventListener("click", entrar);
    $("login-senha").addEventListener("keydown", (e) => { if (e.key === "Enter") entrar(); });
    let jaAbriu = false;
    Dados.estaLogado((logado) => { if (logado && !jaAbriu) { jaAbriu = true; abrirApp(); } });
});
