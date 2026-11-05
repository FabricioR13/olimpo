// ═════════════════════════════════════════════════════════════════════════════
//  OLIMPO — Post do dia
//  A dona só atualiza o que tem hoje (estoque / "acabou") e o painel monta
//  sozinho a imagem para os grupos e o status do WhatsApp, com o texto e o link.
//  TF Solutions
// ═════════════════════════════════════════════════════════════════════════════

const POST_FORMATOS = {
    grupo: { w: 1080, h: 1350, maxPorImagem: 9, rotulo: "Grupos" },
    status: { w: 1080, h: 1920, maxPorImagem: 9, rotulo: "Status" },
};
const CHAVE_POST = "olimpo_post_dia";

let postFormato = "grupo";
let postFiltro = "todos";
let postMostrarPreco = true;
let postMostrarEsgotados = false;
let postFora = new Set();        // produtos que a dona tirou do post de hoje
let postTextoEditado = false;
let postCanvases = [];
let postRenderId = 0;
const postImagens = {};

// ─── Preferências do dia (só neste aparelho) ─────────────────────────────────
function postCarregarPreferencias() {
    try {
        const salvo = JSON.parse(localStorage.getItem(CHAVE_POST) || "null");
        if (!salvo) return;
        if (salvo.dia === hojeStr()) postFora = new Set(salvo.fora || []);
        if (salvo.formato && POST_FORMATOS[salvo.formato]) postFormato = salvo.formato;
        if (typeof salvo.preco === "boolean") postMostrarPreco = salvo.preco;
        if (typeof salvo.esgotados === "boolean") postMostrarEsgotados = salvo.esgotados;
        if (typeof salvo.frase === "string") $("post-frase").value = salvo.frase;
    } catch (e) { /* navegador sem armazenamento: segue com o padrão */ }
}
function postSalvarPreferencias() {
    try {
        localStorage.setItem(CHAVE_POST, JSON.stringify({
            dia: hojeStr(), fora: [...postFora], formato: postFormato,
            preco: postMostrarPreco, esgotados: postMostrarEsgotados, frase: $("post-frase").value,
        }));
    } catch (e) { /* ignora */ }
}

// ─── Regras de disponibilidade ───────────────────────────────────────────────
const postTemHoje = (p) => p.ativo !== false && p.disponibilidade !== "encomenda" && (!controlaEstoque(p) || Number(p.estoque) > 0);
const postEsgotado = (p) => p.ativo !== false && controlaEstoque(p) && Number(p.estoque) <= 0;
const postUltimas = (p) => controlaEstoque(p) && Number(p.estoque) > 0 && Number(p.estoque) <= Number(p.estoqueMinimo ?? 2);
const postNoPost = (p) => postTemHoje(p) && !postFora.has(p.id);

function postOrdenar(lista) {
    const ordemCat = Object.fromEntries(categorias.map((c, i) => [c.id, i]));
    return [...lista].sort((a, b) => (ordemCat[a.categoria] ?? 99) - (ordemCat[b.categoria] ?? 99) || a.id - b.id);
}
function postItens() {
    const disponiveis = postOrdenar(produtos.filter(postNoPost)).map((p) => ({ p, esgotado: false }));
    const esgotados = postMostrarEsgotados ? postOrdenar(produtos.filter(postEsgotado)).map((p) => ({ p, esgotado: true })) : [];
    return [...disponiveis, ...esgotados];
}

function postLinkCatalogo() {
    if (config.linkCatalogo) return config.linkCatalogo;
    try { return new URL("index.html", location.href).href.replace(/index\.html$/, ""); }
    catch (e) { return ""; }
}
const postDataExtenso = () => {
    const t = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    return t.charAt(0).toUpperCase() + t.slice(1);
};
const postPrecoTexto = (p) => (tamanhosDe(p).length > 1 ? "a partir de " : "") + formatarMoeda(precoBase(p));

// ─── Tela ────────────────────────────────────────────────────────────────────
function renderPost() {
    $$("#post-filtro button").forEach((b) => b.classList.toggle("ativo", b.dataset.filtro === postFiltro));
    $$("#post-formato button").forEach((b) => b.classList.toggle("ativo", b.dataset.formato === postFormato));
    $("post-preco").checked = postMostrarPreco;
    $("post-esgotados").checked = postMostrarEsgotados;
    if (document.activeElement !== $("post-link")) $("post-link").value = config.linkCatalogo || "";
    $("post-link").placeholder = postLinkCatalogo() || "https://...";

    const total = produtos.filter(postNoPost).length;
    $("post-contagem").textContent = total === 1 ? "1 produto no post" : `${total} produtos no post`;
    $("post-ir-qtd").textContent = $("post-contagem").textContent;

    let lista = produtos.filter((p) => p.ativo !== false);
    if (postFiltro === "post") lista = lista.filter(postNoPost);
    if (postFiltro === "esgotados") lista = lista.filter(postEsgotado);

    const grupos = categorias.map((c) => ({ c, itens: lista.filter((p) => p.categoria === c.id) })).filter((g) => g.itens.length);
    const semCat = lista.filter((p) => !categorias.some((c) => c.id === p.categoria));
    if (semCat.length) grupos.push({ c: { nome: "Outros" }, itens: semCat });

    $("post-lista").innerHTML = grupos.length ? grupos.map((g) => `
        <p class="dia-cabecalho"><span>${escaparHtml(g.c.nome)}</span><span>${g.itens.filter(postNoPost).length}/${g.itens.length}</span></p>
        ${g.itens.map((p) => {
        const est = controlaEstoque(p);
        const tem = postTemHoje(p);
        const noPost = postNoPost(p);
        const status = p.disponibilidade === "encomenda" ? `<span class="pilula encomenda">Encomenda</span>`
            : !tem ? `<span class="pilula acabou">Esgotado</span>`
                : postUltimas(p) ? `<span class="pilula pouco">Últimas</span>` : "";
        return `
            <div class="post-linha${noPost ? " no-post" : ""}${!tem ? " sem" : ""}">
                <button class="post-marcar" data-post-marcar="${p.id}" aria-pressed="${noPost}" aria-label="${noPost ? "Tirar do post" : "Colocar no post"}: ${escaparHtml(p.nome)}">
                    <span class="post-check"><i class="fa-solid fa-check"></i></span>
                    <img src="${escaparHtml(p.imagem)}" alt="" loading="lazy">
                    <span class="post-info">
                        <span class="nome">${escaparHtml(p.nome)}</span>
                        <span class="detalhes"><span class="preco">${postPrecoTexto(p)}</span>${status}</span>
                    </span>
                </button>
                <div class="post-controle">
                    ${est ? `<div class="contador">
                        <button data-estoque="${p.id}" data-delta="-1" aria-label="Tirar um">−</button>
                        <span>${p.estoque}</span>
                        <button data-estoque="${p.id}" data-delta="1" class="mais" aria-label="Pôr mais um">+</button>
                    </div>
                    ${tem ? `<button class="btn btn-claro post-acabou" data-post-acabou="${p.id}">Acabou</button>` : ""}` : ""}
                </div>
            </div>`;
    }).join("")}`).join("") : `<div class="bloco"><p class="vazio">${postFiltro === "esgotados" ? "Nada esgotado. 🎉" : "Nenhum produto aqui."}</p></div>`;

    postAtualizarTexto();
    postDesenharLogo();
}

let postTimer = null;
function postDesenharLogo() {
    clearTimeout(postTimer);
    postTimer = setTimeout(postDesenhar, 120);
}

// ─── Texto da mensagem ───────────────────────────────────────────────────────
function postMontarTexto() {
    const itens = postOrdenar(produtos.filter(postNoPost));
    const nomeLoja = config.nomeLoja || "Olimpo";
    const linhas = [`✨ *${nomeLoja} — ${$("post-frase").value.trim() || "Disponível hoje"}* ✨`, `📅 ${postDataExtenso()}`, ""];
    if (!itens.length) linhas.push("Hoje estamos sem produtos a pronta entrega. Faça sua encomenda! 💛", "");
    categorias.concat([{ id: null, nome: "Outros" }]).forEach((c) => {
        const daCat = itens.filter((p) => c.id === null ? !categorias.some((x) => x.id === p.categoria) : p.categoria === c.id);
        if (!daCat.length) return;
        linhas.push(`*${c.nome}*`);
        daCat.forEach((p) => linhas.push(`▫️ ${p.nome}${postMostrarPreco ? ` — ${postPrecoTexto(p)}` : ""}${postUltimas(p) ? " _(últimas!)_" : ""}`));
        linhas.push("");
    });
    if (postMostrarEsgotados) {
        const esg = postOrdenar(produtos.filter(postEsgotado));
        if (esg.length) linhas.push(`❌ Já esgotou: ${esg.map((p) => p.nome).join(", ")}`, "");
    }
    if (config.aviso) linhas.push(`🛵 ${config.aviso}`);
    const link = postLinkCatalogo();
    linhas.push(`👉 *Faça seu pedido pelo catálogo:*`, link || "(link do catálogo)");
    linhas.push("", "É só escolher, colocar no carrinho e o pedido chega prontinho no meu WhatsApp 💛");
    return linhas.join("\n");
}
function postAtualizarTexto() {
    if (!postTextoEditado) $("post-texto").value = postMontarTexto();
}

// ─── Desenho da imagem (canvas) ──────────────────────────────────────────────
function postCarregarImagem(src) {
    if (!src) return Promise.resolve(null);
    if (postImagens[src]) return postImagens[src];
    postImagens[src] = new Promise((ok) => {
        const img = new Image();
        img.onload = () => ok(img);
        img.onerror = () => ok(null);
        img.src = src;
    });
    return postImagens[src];
}

function postRetangulo(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}
function postImagemCobrindo(ctx, img, x, y, w, h) {
    const escala = Math.max(w / img.width, h / img.height);
    const sw = w / escala, sh = h / escala;
    ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}
// Para fotos marcadas "Foto inteira": fundo desfocado + a arte toda no centro, sem cortar o preço e a escrita
function postImagemInteira(ctx, img, x, y, w, h) {
    const borrao = Math.round(Math.max(w, h) / 22), folga = borrao * 3; // folga evita borda escura do desfoque
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.filter = `blur(${borrao}px) brightness(.85)`;
    postImagemCobrindo(ctx, img, x - folga, y - folga, w + folga * 2, h + folga * 2);
    ctx.restore();
    const cabe = Math.min(w / img.width, h / img.height);
    const iw = img.width * cabe, ih = img.height * cabe;
    ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}
function postQuebrarTexto(ctx, texto, larguraMax, maxLinhas) {
    const palavras = texto.split(/\s+/);
    const linhas = [];
    let atual = "";
    for (const pal of palavras) {
        const teste = atual ? atual + " " + pal : pal;
        if (ctx.measureText(teste).width <= larguraMax || !atual) atual = teste;
        else { linhas.push(atual); atual = pal; }
    }
    if (atual) linhas.push(atual);
    if (linhas.length > maxLinhas) {
        const cortadas = linhas.slice(0, maxLinhas);
        let ultima = cortadas[maxLinhas - 1];
        while (ctx.measureText(ultima + "…").width > larguraMax && ultima.length > 1) ultima = ultima.slice(0, -1);
        cortadas[maxLinhas - 1] = ultima.trimEnd() + "…";
        return cortadas;
    }
    return linhas;
}
function postDourado(ctx, y0, y1) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, "#f5dc8e");
    g.addColorStop(0.5, "#e2b54f");
    g.addColorStop(1, "#b9852a");
    return g;
}

async function postDesenhar() {
    const id = ++postRenderId;
    const fmt = POST_FORMATOS[postFormato];
    const itens = postItens();
    const paginas = [];
    for (let i = 0; i < Math.max(itens.length, 1); i += fmt.maxPorImagem) paginas.push(itens.slice(i, i + fmt.maxPorImagem));

    try {
        await Promise.all([
            document.fonts.load('700 60px "Cinzel"'), document.fonts.load('800 30px "Nunito"'),
            document.fonts.load('600 30px "Nunito"'), document.fonts.load('700 30px "Nunito"'),
        ]);
    } catch (e) { /* segue com a fonte que tiver */ }
    const [logo, ...fotos] = await Promise.all([postCarregarImagem("assets/logo-olimpo.png"), ...itens.map((x) => postCarregarImagem(x.p.imagem))]);
    if (id !== postRenderId) return; // já pediram outro desenho
    const fotoDe = new Map(itens.map((x, i) => [x.p.id, fotos[i]]));

    postCanvases = paginas.map((pag, n) => {
        const cv = document.createElement("canvas");
        cv.width = fmt.w; cv.height = fmt.h;
        postDesenharPagina(cv.getContext("2d"), fmt, pag, fotoDe, logo, n, paginas.length);
        return cv;
    });

    const area = $("post-previa");
    area.innerHTML = "";
    postCanvases.forEach((cv, n) => {
        const caixa = document.createElement("figure");
        caixa.className = "post-previa-item formato-" + postFormato;
        caixa.appendChild(cv);
        if (postCanvases.length > 1) {
            const leg = document.createElement("figcaption");
            leg.textContent = `Imagem ${n + 1} de ${postCanvases.length}`;
            caixa.appendChild(leg);
        }
        area.appendChild(caixa);
    });
    $("post-aviso-paginas").hidden = postCanvases.length < 2;
    $("post-aviso-paginas").textContent = `Como são muitos produtos, o painel separou em ${postCanvases.length} imagens (até ${fmt.maxPorImagem} por imagem). Todas vão juntas ao compartilhar.`;
}

function postDesenharPagina(ctx, fmt, itens, fotoDe, logo, nPagina, totalPaginas) {
    const W = fmt.w, H = fmt.h;
    const status = postFormato === "status";

    // Fundo
    const fundo = ctx.createRadialGradient(W / 2, H * 0.32, 80, W / 2, H * 0.5, H * 0.85);
    fundo.addColorStop(0, "#33261f");
    fundo.addColorStop(1, "#120d0a");
    ctx.fillStyle = fundo;
    ctx.fillRect(0, 0, W, H);
    // Moldura dourada
    ctx.strokeStyle = "rgba(226, 181, 79, .55)";
    ctx.lineWidth = 3;
    postRetangulo(ctx, 26, 26, W - 52, H - 52, 30);
    ctx.stroke();
    ctx.strokeStyle = "rgba(226, 181, 79, .2)";
    ctx.lineWidth = 1.5;
    postRetangulo(ctx, 38, 38, W - 76, H - 76, 24);
    ctx.stroke();

    // Cabeçalho
    let y = status ? 150 : 56;
    const tamLogo = status ? 190 : 136;
    if (logo) {
        ctx.save();
        ctx.shadowColor = "rgba(226, 181, 79, .35)";
        ctx.shadowBlur = 30;
        ctx.drawImage(logo, (W - tamLogo) / 2, y, tamLogo, tamLogo);
        ctx.restore();
    }
    y += tamLogo + (status ? 70 : 54);

    const frase = ($("post-frase").value.trim() || "Disponível hoje").toUpperCase();
    let tamTitulo = status ? 76 : 64;
    ctx.font = `700 ${tamTitulo}px "Cinzel", Georgia, serif`;
    while (ctx.measureText(frase).width > W - 160 && tamTitulo > 34) { tamTitulo -= 2; ctx.font = `700 ${tamTitulo}px "Cinzel", Georgia, serif`; }
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = postDourado(ctx, y - tamTitulo, y);
    ctx.fillText(frase, W / 2, y);

    y += status ? 58 : 46;
    ctx.font = `600 ${status ? 36 : 31}px "Nunito", sans-serif`;
    ctx.fillStyle = "#f2e7d3";
    const sub = postDataExtenso() + (totalPaginas > 1 ? `  ·  ${nPagina + 1}/${totalPaginas}` : "");
    ctx.fillText(sub, W / 2, y);

    // Enfeite
    y += status ? 40 : 28;
    ctx.strokeStyle = "rgba(226, 181, 79, .7)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2 - 150, y); ctx.lineTo(W / 2 - 18, y); ctx.moveTo(W / 2 + 18, y); ctx.lineTo(W / 2 + 150, y); ctx.stroke();
    ctx.fillStyle = "#e2b54f";
    ctx.save(); ctx.translate(W / 2, y); ctx.rotate(Math.PI / 4); ctx.fillRect(-6, -6, 12, 12); ctx.restore();

    // Rodapé (calcula primeiro, de baixo para cima, para saber o espaço da grade)
    const tamAviso = status ? 30 : 26, passoAviso = status ? 40 : 34;
    ctx.font = `700 ${tamAviso}px "Nunito", sans-serif`;
    const linhasAviso = config.aviso ? postQuebrarTexto(ctx, config.aviso, W - 180, 2) : [];
    const tamBotao = status ? 42 : 36;
    const alturaBotao = tamBotao * 2.1;
    const margemBaixo = status ? 170 : 74;   // no status, o WhatsApp cobre a parte de baixo
    const alturaRodape = (linhasAviso.length ? linhasAviso.length * passoAviso + 16 : 0) + alturaBotao + (status ? 56 : 0) + margemBaixo;
    const topoRodape = H - alturaRodape;
    const topoGrade = y + (status ? 50 : 32);
    const baseGrade = topoRodape - (status ? 30 : 18);

    // Grade de produtos
    const n = itens.length;
    if (!n) {
        ctx.font = `700 ${status ? 46 : 40}px "Nunito", sans-serif`;
        ctx.fillStyle = "#f2e7d3";
        ctx.fillText("Hoje só sob encomenda!", W / 2, (topoGrade + baseGrade) / 2);
        ctx.font = `600 ${status ? 32 : 28}px "Nunito", sans-serif`;
        ctx.fillStyle = "rgba(242, 231, 211, .7)";
        ctx.fillText("Peça pelo catálogo e combine a data", W / 2, (topoGrade + baseGrade) / 2 + 52);
    } else {
        const cols = n === 1 ? 1 : n <= 4 ? 2 : 3;
        const linhas = Math.ceil(n / cols);
        const margem = 70, gap = status ? 26 : 22;
        const larguraCartao = Math.min((W - margem * 2 - gap * (cols - 1)) / cols, cols === 1 ? 560 : 9999);
        const alturaDisp = (baseGrade - topoGrade - gap * (linhas - 1)) / linhas;
        const alturaCartao = Math.min(alturaDisp, larguraCartao * (cols === 1 ? 1.1 : 1.32));
        const alturaTotal = alturaCartao * linhas + gap * (linhas - 1);
        let yCartao = topoGrade + (baseGrade - topoGrade - alturaTotal) / 2;

        const tamNome = Math.max(22, Math.min(38, larguraCartao * 0.078));
        const tamPreco = tamNome * 1.1;
        const alturaTexto = postMostrarPreco ? tamNome * 2.4 + tamPreco * 1.35 : tamNome * 2.6;

        for (let l = 0; l < linhas; l++) {
            const daLinha = itens.slice(l * cols, l * cols + cols);
            const larguraLinha = daLinha.length * larguraCartao + (daLinha.length - 1) * gap;
            let xCartao = (W - larguraLinha) / 2;
            daLinha.forEach(({ p, esgotado }) => {
                postDesenharCartao(ctx, p, esgotado, fotoDe.get(p.id), xCartao, yCartao, larguraCartao, alturaCartao, alturaTexto, tamNome, tamPreco);
                xCartao += larguraCartao + gap;
            });
            yCartao += alturaCartao + gap;
        }
    }

    // Rodapé: aviso + chamada para o link
    let yr = topoRodape;
    ctx.textAlign = "center";
    if (linhasAviso.length) {
        ctx.font = `700 ${tamAviso}px "Nunito", sans-serif`;
        ctx.fillStyle = "#f2e7d3";
        linhasAviso.forEach((t) => { ctx.fillText(t, W / 2, yr + tamAviso); yr += passoAviso; });
        yr += 16;
    }
    ctx.font = `800 ${tamBotao}px "Nunito", sans-serif`;
    const textoBotao = "PEÇA PELO LINK DO CATÁLOGO";
    const larguraBotao = Math.min(W - 140, ctx.measureText(textoBotao).width + 120);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
    ctx.fillStyle = postDourado(ctx, yr, yr + alturaBotao);
    postRetangulo(ctx, (W - larguraBotao) / 2, yr, larguraBotao, alturaBotao, alturaBotao / 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#1c1512";
    ctx.textBaseline = "middle";
    ctx.fillText(textoBotao, W / 2, yr + alturaBotao / 2 + 2);
    ctx.textBaseline = "alphabetic";
    if (status) {
        yr += alturaBotao + 50;
        ctx.font = `600 28px "Nunito", sans-serif`;
        ctx.fillStyle = "rgba(242, 231, 211, .78)";
        ctx.fillText("O link está na mensagem 👇", W / 2, yr);
    }
}

function postDesenharCartao(ctx, p, esgotado, foto, x, y, w, h, alturaTexto, tamNome, tamPreco) {
    const r = 22;
    // Sombra + cartão
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8;
    ctx.fillStyle = "#faf5ec";
    postRetangulo(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.restore();

    // Foto
    const alturaFoto = Math.max(60, h - alturaTexto);
    ctx.save();
    postRetangulo(ctx, x, y, w, h, r);
    ctx.clip();
    if (foto && p.fotoInteira) postImagemInteira(ctx, foto, x, y, w, alturaFoto);
    else if (foto) postImagemCobrindo(ctx, foto, x, y, w, alturaFoto);
    else {
        ctx.fillStyle = "#e9dcc3";
        ctx.fillRect(x, y, w, alturaFoto);
        ctx.fillStyle = "#c9972e";
        ctx.font = `700 ${Math.round(alturaFoto * 0.32)}px "Cinzel", serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("O", x + w / 2, y + alturaFoto / 2);
        ctx.textBaseline = "alphabetic";
    }
    // Filete dourado entre foto e texto
    ctx.fillStyle = "#c9972e";
    ctx.fillRect(x, y + alturaFoto - 3, w, 3);
    ctx.restore();

    // Nome
    ctx.textAlign = "center";
    ctx.font = `800 ${tamNome}px "Nunito", sans-serif`;
    ctx.fillStyle = "#2b211c";
    const linhas = postQuebrarTexto(ctx, p.nome, w - 28, 2);
    const blocoTexto = linhas.length * tamNome * 1.18 + (postMostrarPreco ? tamPreco * 1.25 : 0);
    let ty = y + alturaFoto + (h - alturaFoto - blocoTexto) / 2 + tamNome * 0.95;
    linhas.forEach((t) => { ctx.fillText(t, x + w / 2, ty); ty += tamNome * 1.18; });

    // Preço
    if (postMostrarPreco) {
        const multi = tamanhosDe(p).length > 1;
        const valor = formatarMoeda(precoBase(p));
        ty += tamPreco * 0.12;
        if (multi) {
            ctx.font = `700 ${tamPreco * 0.62}px "Nunito", sans-serif`;
            const pre = "a partir de ";
            const lp = ctx.measureText(pre).width;
            ctx.font = `800 ${tamPreco}px "Nunito", sans-serif`;
            const lv = ctx.measureText(valor).width;
            const x0 = x + w / 2 - (lp + lv) / 2;
            ctx.textAlign = "left";
            ctx.font = `700 ${tamPreco * 0.62}px "Nunito", sans-serif`;
            ctx.fillStyle = "#6b5a4f";
            ctx.fillText(pre, x0, ty);
            ctx.font = `800 ${tamPreco}px "Nunito", sans-serif`;
            ctx.fillStyle = "#8f6818";
            ctx.fillText(valor, x0 + lp, ty);
            ctx.textAlign = "center";
        } else {
            ctx.font = `800 ${tamPreco}px "Nunito", sans-serif`;
            ctx.fillStyle = "#8f6818";
            ctx.fillText(valor, x + w / 2, ty);
        }
    }

    // Selos
    const tags = Array.isArray(p.tags) ? p.tags : [];
    const tamSelo = Math.max(17, tamNome * 0.62);
    if (!esgotado && postUltimas(p)) postSelo(ctx, "ÚLTIMAS!", x + 14, y + 14, tamSelo, "#b8392a", "#fff");
    else if (!esgotado && p.destaque) postSelo(ctx, "MAIS PEDIDO", x + 14, y + 14, tamSelo, "#1c1512", "#e9c66b");
    if (!esgotado && tags.length) {
        ctx.font = `800 ${tamSelo}px "Nunito", sans-serif`;
        const t = tags[0].toUpperCase();
        const lw = ctx.measureText(t).width + tamSelo * 1.2;
        postSelo(ctx, t, x + w - 14 - lw, y + alturaFoto - 14 - tamSelo * 1.7, tamSelo, "rgba(255,255,255,.92)", "#1e8a4c");
    }

    // Esgotado: escurece e carimba
    if (esgotado) {
        ctx.save();
        postRetangulo(ctx, x, y, w, h, r);
        ctx.clip();
        ctx.fillStyle = "rgba(18, 13, 10, .62)";
        ctx.fillRect(x, y, w, h);
        ctx.translate(x + w / 2, y + alturaFoto / 2);
        ctx.rotate(-0.22);
        const tam = Math.max(26, w * 0.13);
        ctx.font = `800 ${tam}px "Nunito", sans-serif`;
        const lw = ctx.measureText("ESGOTADO").width + tam;
        ctx.strokeStyle = "#ff6b57"; ctx.lineWidth = 5;
        postRetangulo(ctx, -lw / 2, -tam * 0.85, lw, tam * 1.7, 12);
        ctx.stroke();
        ctx.fillStyle = "#ff6b57";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("ESGOTADO", 0, 2);
        ctx.restore();
    }
}

function postSelo(ctx, texto, x, y, tam, fundo, cor) {
    ctx.font = `800 ${tam}px "Nunito", sans-serif`;
    const w = ctx.measureText(texto).width + tam * 1.2;
    const h = tam * 1.7;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.3)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
    ctx.fillStyle = fundo;
    postRetangulo(ctx, x, y, w, h, h / 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = cor;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(texto, x + tam * 0.6, y + h / 2 + 1);
    ctx.textBaseline = "alphabetic"; ctx.textAlign = "center";
}

// ─── Exportar / compartilhar ─────────────────────────────────────────────────
function postArquivos() {
    const dia = hojeStr();
    return Promise.all(postCanvases.map((cv, i) => new Promise((ok, erro) => {
        try {
            cv.toBlob((blob) => blob ? ok(new File([blob], `olimpo-${postFormato}-${dia}${postCanvases.length > 1 ? "-" + (i + 1) : ""}.png`, { type: "image/png" })) : erro(new Error("vazio")), "image/png");
        } catch (e) { erro(e); }
    })));
}
function postErroExportar(e) {
    console.error(e);
    if (e && e.name === "SecurityError") {
        avisar("O navegador bloqueou a imagem porque o painel foi aberto direto do arquivo. Abra pelo site publicado (ou Live Server).", false);
    } else avisar("Não consegui gerar a imagem. Tente de novo.", false);
}
async function postCopiarTexto(silencioso = false) {
    const texto = $("post-texto").value;
    try { await navigator.clipboard.writeText(texto); if (!silencioso) avisar("Texto copiado! É só colar no grupo."); return true; }
    catch (e) {
        $("post-texto").select();
        try { document.execCommand("copy"); if (!silencioso) avisar("Texto copiado! É só colar no grupo."); return true; } catch (e2) { return false; }
    }
}
async function postBaixar() {
    try {
        const arquivos = await postArquivos();
        arquivos.forEach((f, i) => setTimeout(() => {
            const url = URL.createObjectURL(f);
            const a = document.createElement("a");
            a.href = url; a.download = f.name;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 4000);
        }, i * 400));
        avisar(arquivos.length > 1 ? `${arquivos.length} imagens salvas!` : "Imagem salva!");
    } catch (e) { postErroExportar(e); }
}
async function postCompartilhar() {
    let arquivos;
    try { arquivos = await postArquivos(); } catch (e) { postErroExportar(e); return; }
    const texto = $("post-texto").value;
    if (navigator.canShare && navigator.canShare({ files: arquivos })) {
        await postCopiarTexto(true); // garante o texto na área de transferência caso o app ignore a legenda
        try { await navigator.share({ files: arquivos, text: texto }); return; }
        catch (e) { if (e.name === "AbortError") return; }
    }
    // Computador ou navegador sem compartilhamento: baixa a imagem e abre o WhatsApp com o texto
    await postBaixar();
    await postCopiarTexto(true);
    avisar("Imagem salva e texto copiado. Abrindo o WhatsApp…");
    setTimeout(() => window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank"), 900);
}

// ─── Eventos ─────────────────────────────────────────────────────────────────
function ligarEventosPost() {
    postCarregarPreferencias();
    $("post-lista").addEventListener("click", async (e) => {
        const ac = e.target.closest("[data-post-acabou]");
        if (ac) {
            const p = produtos.find((x) => x.id === Number(ac.dataset.postAcabou));
            p.estoque = 0;
            await Dados.salvar("produtos", p.id, { estoque: 0 });
            avisar(`"${p.nome}" marcado como esgotado (no site também).`);
            renderPost();
            return;
        }
        const m = e.target.closest("[data-post-marcar]");
        if (!m) return;
        const p = produtos.find((x) => x.id === Number(m.dataset.postMarcar));
        if (!postTemHoje(p)) {
            avisar(p.disponibilidade === "encomenda" ? "Esse produto é sob encomenda, não entra no post do dia." : "Está esgotado. Toque em + para dizer quantos tem hoje.", false);
            return;
        }
        if (postFora.has(p.id)) postFora.delete(p.id); else postFora.add(p.id);
        postSalvarPreferencias();
        renderPost();
    });
    $("post-filtro").addEventListener("click", (e) => { const b = e.target.closest("button[data-filtro]"); if (b) { postFiltro = b.dataset.filtro; renderPost(); } });
    $("post-formato").addEventListener("click", (e) => { const b = e.target.closest("button[data-formato]"); if (b) { postFormato = b.dataset.formato; postSalvarPreferencias(); renderPost(); } });
    $("post-todos").addEventListener("click", () => { postFora.clear(); postSalvarPreferencias(); renderPost(); });
    $("post-nenhum").addEventListener("click", () => { produtos.filter(postTemHoje).forEach((p) => postFora.add(p.id)); postSalvarPreferencias(); renderPost(); });
    $("post-preco").addEventListener("change", (e) => { postMostrarPreco = e.target.checked; postSalvarPreferencias(); renderPost(); });
    $("post-esgotados").addEventListener("change", (e) => { postMostrarEsgotados = e.target.checked; postSalvarPreferencias(); renderPost(); });
    $("post-frase").addEventListener("input", () => { postSalvarPreferencias(); postAtualizarTexto(); postDesenharLogo(); });
    $("post-texto").addEventListener("input", () => { postTextoEditado = true; $("post-texto-refazer").hidden = false; });
    $("post-texto-refazer").addEventListener("click", () => { postTextoEditado = false; $("post-texto-refazer").hidden = true; postAtualizarTexto(); });
    $("post-link").addEventListener("change", async (e) => {
        const link = e.target.value.trim();
        config.linkCatalogo = link;
        await Dados.salvar("configuracoes", "geral", { linkCatalogo: link });
        avisar("Link do catálogo salvo.");
        renderPost();
    });
    $("post-ir-imagem").addEventListener("click", () => $("post-direita").scrollIntoView({ behavior: "smooth" }));
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(([e]) => $("post-ir-imagem").classList.toggle("escondida", e.isIntersecting), { rootMargin: "0px 0px -40% 0px" }).observe($("post-direita"));
    }
    $("post-compartilhar").addEventListener("click", postCompartilhar);
    $("post-baixar").addEventListener("click", postBaixar);
    $("post-copiar").addEventListener("click", () => postCopiarTexto());
}
document.addEventListener("DOMContentLoaded", ligarEventosPost);
