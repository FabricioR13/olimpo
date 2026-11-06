// ═════════════════════════════════════════════════════════════════════════════
//  OLIMPO ESPECIARIAS — Loja (catálogo, carrinho, frete por bairro e WhatsApp)
//  Base: catálogo Mamona's Açaí — TF Solutions
// ═════════════════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", async () => {
    const $ = (id) => document.getElementById(id);

    // ─── CARREGAR DADOS ──────────────────────────────────────────────────────
    let produtos = [], categorias = [], cupons = [], config = { ...CONFIG_PADRAO };
    try {
        const [prods, cats, cups, conf] = await Promise.all([
            Dados.listar("produtos"), Dados.listar("categorias"), Dados.listar("cupons"), Dados.obter("configuracoes", "geral"),
        ]);
        produtos = prods.filter((x) => x.ativo !== false).map((x) => ({ ...x, id: Number(x.id) }));
        categorias = cats.sort((a, b) => (a.ordem || 99) - (b.ordem || 99));
        cupons = cups;
        if (conf) config = { ...CONFIG_PADRAO, ...conf };
    } catch (e) {
        console.error("Erro ao carregar dados da loja:", e);
    }
    const fretes = Array.isArray(config.fretes) ? config.fretes : [];

    // ─── ESTADO ──────────────────────────────────────────────────────────────
    let carrinho = [];
    let etapa = 1;
    let tipoEntrega = config.entregaDisponivel !== false ? "entrega" : "retirada";
    let cupomAplicado = null;
    let categoriaAtiva = null;
    let termoBusca = "";

    // ─── UTILITÁRIOS ─────────────────────────────────────────────────────────
    const linkWhats = (msg) => `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(msg)}`;
    const avisar = (texto) => {
        const el = $("aviso-flutuante");
        el.textContent = texto;
        el.classList.add("mostrar");
        clearTimeout(avisar._t);
        avisar._t = setTimeout(() => el.classList.remove("mostrar"), 2600);
    };
    const travar = () => document.body.classList.add("travado");
    const destravar = () => document.body.classList.remove("travado");
    const tamanhosDe = (prod) =>
        Array.isArray(prod.tamanhos) && prod.tamanhos.length ? prod.tamanhos : [{ nome: null, preco: Number(prod.preco) || 0 }];
    const temEstoque = (prod) => prod.estoque !== undefined && prod.estoque !== null && prod.estoque !== "";
    const acabou = (prod) => temEstoque(prod) && Number(prod.estoque) <= 0;
    const qtdNoCarrinho = (id) => carrinho.filter((i) => i.id === id).reduce((a, i) => a + i.quantidade, 0);
    const precisaEscolher = (prod) => tamanhosDe(prod).length > 1 || (prod.opcaoInclusa?.opcoes?.length > 0);

    // ─── CONFIGURAÇÕES DA LOJA NA TELA ───────────────────────────────────────
    const aplicarConfig = () => {
        document.title = `${config.nomeLoja} — Delícias de Sabores`;
        $("aviso-texto").textContent = config.aviso || "";
        $("aviso-topo").hidden = !config.aviso;
        $("hero-tag").textContent = config.heroTag;
        $("hero-titulo").textContent = config.heroTitulo;
        $("hero-subtitulo").textContent = config.heroSubtitulo;
        const nomeDona = config.nomeDona || "a gente";
        $("hero-whatsapp").innerHTML = `<i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Falar com ${escaparHtml(config.nomeDona ? "a " + nomeDona : nomeDona)}`;
        $("hero-whatsapp").href = linkWhats(`Olá, ${nomeDona}! Vi o cardápio da ${config.nomeLoja} e gostaria de fazer um pedido.`);
        $("link-outro-bairro").href = linkWhats("Olá! Meu bairro não está na lista de entrega. Vocês entregam em: ");
        $("loja-fechada").hidden = config.lojaAberta !== false;
        $("sobre-texto").textContent = config.sobreTexto || "";
        $("sobre-endereco").textContent = config.endereco || "";
        $("rodape-texto").textContent = `© ${new Date().getFullYear()} ${config.nomeLoja} · ${config.endereco || ""}`;
        $("link-tf").href = `https://wa.me/${TF_SOLUTIONS_WHATSAPP}?text=${encodeURIComponent("Olá! Vi o site da " + config.nomeLoja + " e queria saber mais sobre esse site/sistema.")}`;
        $("info-retirada").textContent = `Retirada em: ${config.endereco || "combinar pelo WhatsApp"}`;

        // Tabela de frete
        const regraGratis = Number(config.freteGratisAcima) > 0
            ? `Entrega grátis em compras acima de ${formatarMoeda(config.freteGratisAcima)}.`
            : "";
        $("entrega-regra").textContent = `Confira o valor da entrega no seu bairro. ${regraGratis}`.trim();
        $("tabela-frete").innerHTML = fretes.map((f) => `
            <li class="${Number(f.valor) === 0 ? "gratis" : ""}">
                <span>${escaparHtml(f.bairro)}</span>
                <strong>${Number(f.valor) === 0 ? "Grátis" : formatarMoeda(f.valor)}</strong>
            </li>`).join("");
        $("entrega").hidden = config.entregaDisponivel === false || !fretes.length;

        // Bairros no carrinho
        $("bairro").innerHTML = `<option value="">Escolha seu bairro</option>` +
            fretes.map((f, i) => `<option value="${i}">${escaparHtml(f.bairro)} — ${Number(f.valor) === 0 ? "Grátis" : formatarMoeda(f.valor)}</option>`).join("");

        // Entrega / retirada disponíveis
        document.querySelector('.alternar-btn[data-tipo="entrega"]').hidden = config.entregaDisponivel === false;
        document.querySelector('.alternar-btn[data-tipo="retirada"]').hidden = config.retiradaDisponivel === false;

        // Horários de retirada
        const dataInput = $("retirada-data");
        const hoje = new Date();
        dataInput.min = new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000).toISOString().split("T")[0];
        const [hI, mI] = (config.retiradaHoraInicio || "09:00").split(":").map(Number);
        const [hF, mF] = (config.retiradaHoraFim || "18:00").split(":").map(Number);
        const passo = Number(config.retiradaIntervalo) || 60;
        let opcoes = `<option value="">Escolha</option>`;
        for (let m = hI * 60 + mI; m <= hF * 60 + mF; m += passo) {
            const h = String(Math.floor(m / 60)).padStart(2, "0"), mm = String(m % 60).padStart(2, "0");
            opcoes += `<option value="${h}:${mm}">${h}:${mm}</option>`;
        }
        $("retirada-hora").innerHTML = opcoes;
    };

    // ─── CATÁLOGO ────────────────────────────────────────────────────────────
    const htmlSelos = (prod) => {
        const selos = [];
        if (acabou(prod)) selos.push(`<span class="selo selo-acabou">Acabou por hoje</span>`);
        else if (prod.disponibilidade === "encomenda") selos.push(`<span class="selo selo-encomenda"><i class="fa-regular fa-calendar"></i> Encomenda${prod.prazoDias ? ` · ${prod.prazoDias} dias` : ""}</span>`);
        else if (temEstoque(prod) && Number(prod.estoque) <= 2) selos.push(`<span class="selo selo-pouco">Últimas unidades</span>`);
        (prod.tags || []).forEach((t) => selos.push(`<span class="selo selo-dieta">${escaparHtml(t)}</span>`));
        return selos.join("");
    };

    const htmlCard = (prod) => {
        const tam = tamanhosDe(prod);
        const menor = Math.min(...tam.map((t) => Number(t.preco) || 0));
        const preco = tam.length > 1 ? `<small>a partir de</small>${formatarMoeda(menor)}` : formatarMoeda(menor);
        const esgot = acabou(prod);
        const rotulo = esgot ? "Acabou" : precisaEscolher(prod) ? `<i class="fa-solid fa-hand-pointer"></i> Escolher` : `<i class="fa-solid fa-plus"></i> Adicionar`;
        return `
            <article class="card${esgot ? " acabou" : ""}" data-id="${prod.id}">
                <div class="card-foto" data-abrir="${prod.id}">
                    <img src="${escaparHtml(prod.imagem)}" alt="${escaparHtml(prod.nome)}" loading="lazy">
                    <div class="card-selos">${htmlSelos(prod)}</div>
                </div>
                <div class="card-corpo">
                    <h3 class="card-nome" data-abrir="${prod.id}">${escaparHtml(prod.nome)}</h3>
                    <p class="card-desc">${escaparHtml(prod.descricao || "")}</p>
                    <div class="card-rodape">
                        <span class="card-preco">${preco}</span>
                        <button class="card-botao" data-add="${prod.id}" ${esgot ? "disabled" : ""}>${rotulo}</button>
                    </div>
                </div>
            </article>`;
    };

    const renderChips = () => {
        $("chips").innerHTML =
            `<button class="chip ${categoriaAtiva ? "" : "ativo"}" data-cat="">Tudo</button>` +
            categorias.map((c) => `<button class="chip ${categoriaAtiva === c.id ? "ativo" : ""}" data-cat="${c.id}"><i class="fa-solid ${c.icone || "fa-tag"}" aria-hidden="true"></i> ${escaparHtml(c.nome)}</button>`).join("");
    };

    const renderCatalogo = () => {
        const termo = termoBusca.trim().toLowerCase();
        const filtra = (lista) => termo
            ? lista.filter((x) => (x.nome + " " + (x.descricao || "")).toLowerCase().includes(termo))
            : lista;

        // Destaques (só sem busca e sem categoria escolhida)
        const destaques = produtos.filter((x) => x.destaque && !acabou(x));
        $("secao-destaques").hidden = !!termo || !!categoriaAtiva || !destaques.length;
        $("trilho-destaques").innerHTML = destaques.map(htmlCard).join("");

        let total = 0;
        $("lista-categorias").innerHTML = categorias
            .filter((c) => !categoriaAtiva || c.id === categoriaAtiva)
            .map((c) => {
                // Disponíveis primeiro, os que acabaram vão pro fim
                const semFoto = (x) => /foto-em-breve/.test(x.imagem || "") ? 1 : 0;
                const lista = filtra(produtos.filter((x) => x.categoria === c.id))
                    .sort((a, b) => (acabou(a) ? 1 : 0) - (acabou(b) ? 1 : 0) || semFoto(a) - semFoto(b));
                total += lista.length;
                if (!lista.length) return "";
                return `
                    <section class="secao-categoria" id="cat-${c.id}">
                        <h2 class="titulo-secao"><i class="fa-solid ${c.icone || "fa-tag"}" aria-hidden="true"></i> ${escaparHtml(c.nome)}</h2>
                        ${c.id === "natal" && config.natalAviso ? `<p class="aviso-categoria"><i class="fa-regular fa-calendar-check" aria-hidden="true"></i> ${escaparHtml(config.natalAviso)}</p>` : ""}
                        <div class="grade">${lista.map(htmlCard).join("")}</div>
                    </section>`;
            }).join("");
        $("sem-resultado").hidden = total > 0;
    };

    // ─── VITRINE DE NATAL ────────────────────────────────────────────────────
    // Só fotos dos doces de Natal, passando devagar na horizontal. Tocar abre o produto.
    const FOTOS_EXTRAS_NATAL = {
        "Panetone trufado": ["natal-panetone-trufado-3.jpg", "natal-panetone-trad-3.jpg", "natal-panetone-trad-2.jpg"],
        "Panetone tradicional": ["natal-panetone-trad-1.jpg"],
    };
    const renderVitrineNatal = () => {
        const daCategoria = produtos.filter((x) => x.categoria === "natal" && x.imagem && !/foto-em-breve/.test(x.imagem));
        const ligada = config.vitrineNatal !== false && daCategoria.length > 0;
        $("vitrine-natal").hidden = !ligada;
        if (!ligada) return;
        $("vn-titulo").textContent = config.natalTitulo || "Especiais de Natal";
        $("vn-aviso").textContent = config.natalAviso || "";
        $("vn-aviso").hidden = !config.natalAviso;
        const fotos = [];
        daCategoria.forEach((prod) => {
            fotos.push({ id: prod.id, nome: prod.nome, src: prod.imagem });
            (FOTOS_EXTRAS_NATAL[prod.nome] || []).forEach((f) => fotos.push({ id: prod.id, nome: prod.nome, src: IMG + f }));
        });
        // Embaralha de leve para não ficar tudo do mesmo tipo junto
        for (let i = fotos.length - 1; i > 0; i -= 3) { const j = (i * 7) % (i + 1); [fotos[i], fotos[j]] = [fotos[j], fotos[i]]; }
        const html = fotos.map((f) => `
            <button class="vn-foto" type="button" data-abrir="${f.id}" aria-label="${escaparHtml(f.nome)}">
                <img src="${escaparHtml(f.src)}" alt="${escaparHtml(f.nome)}" loading="lazy" draggable="false">
            </button>`).join("");
        // Duas cópias seguidas para a rolagem nunca acabar
        $("vn-faixa").innerHTML = html + html.replace(/<button class="vn-foto"/g, '<button class="vn-foto" tabindex="-1" aria-hidden="true"');
        iniciarRolagemNatal();
    };

    let rolagemNatalLigada = false;
    const iniciarRolagemNatal = () => {
        if (rolagemNatalLigada) return;
        rolagemNatalLigada = true;
        const trilho = $("vn-trilho");
        const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (semMovimento) return;
        const VELOCIDADE = 16; // pixels por segundo — bem devagar
        let pausadoAte = 0, anterior = null, posicao = 0;
        const pausar = (ms = 2500) => { pausadoAte = performance.now() + ms; };
        trilho.addEventListener("pointerdown", () => pausar(4000));
        trilho.addEventListener("wheel", () => pausar(3000), { passive: true });
        trilho.addEventListener("touchstart", () => pausar(4000), { passive: true });
        trilho.addEventListener("mouseenter", () => pausar(60 * 60 * 1000));
        trilho.addEventListener("mouseleave", () => pausar(800));
        trilho.addEventListener("focusin", () => pausar(60 * 60 * 1000));
        trilho.addEventListener("focusout", () => pausar(800));
        const passo = (agora) => {
            if (anterior === null) anterior = agora;
            const dt = Math.min(0.1, (agora - anterior) / 1000);
            anterior = agora;
            const metade = trilho.scrollWidth / 2;
            if (agora < pausadoAte || document.hidden) {
                posicao = trilho.scrollLeft; // acompanha o que a pessoa arrastou
            } else if (metade > trilho.clientWidth) {
                posicao += VELOCIDADE * dt;
                if (posicao >= metade) posicao -= metade;
                trilho.scrollLeft = posicao;
            }
            if (trilho.scrollLeft >= metade) { trilho.scrollLeft -= metade; posicao = trilho.scrollLeft; }
            requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
    };

    $("vn-ver").addEventListener("click", () => {
        categoriaAtiva = "natal";
        termoBusca = ""; $("busca").value = "";
        renderChips();
        renderCatalogo();
        $("cardapio").scrollIntoView({ behavior: "smooth" });
    });

    // ─── MODAL DO PRODUTO ────────────────────────────────────────────────────
    let mpProduto = null, mpTamanho = 0, mpOpcao = null, mpQtd = 1;

    const atualizarModal = () => {
        const preco = Number(tamanhosDe(mpProduto)[mpTamanho].preco) || 0;
        $("mp-qtd").textContent = mpQtd;
        $("mp-preco").textContent = formatarMoeda(preco * mpQtd);
        document.querySelectorAll("#mp-tamanhos .opcao").forEach((el, i) => el.classList.toggle("marcada", i === mpTamanho));
        document.querySelectorAll("#mp-opcoes .opcao").forEach((el) => el.classList.toggle("marcada", el.dataset.valor === mpOpcao));
    };

    const abrirProduto = (id) => {
        const prod = produtos.find((x) => x.id === id);
        if (!prod) return;
        mpProduto = prod; mpTamanho = 0; mpOpcao = null; mpQtd = 1;
        $("mp-foto").src = prod.imagem; $("mp-foto").alt = prod.nome;
        $("mp-foto").classList.toggle("inteira", !!prod.fotoInteira);
        $("mp-nome").textContent = prod.nome;
        $("mp-descricao").textContent = prod.descricao || "";
        $("mp-tags").innerHTML = htmlSelos(prod);

        const tam = tamanhosDe(prod);
        $("mp-grupo-tamanho").hidden = tam.length < 2;
        $("mp-tamanhos").innerHTML = tam.map((t, i) => `
            <label class="opcao"><input type="radio" name="mp-tamanho" value="${i}" ${i === 0 ? "checked" : ""}>
            <span>${escaparHtml(t.nome)}</span><span>${formatarMoeda(t.preco)}</span></label>`).join("");

        const ops = prod.opcaoInclusa?.opcoes || [];
        $("mp-grupo-opcao").hidden = !ops.length;
        $("mp-rotulo-opcao").textContent = prod.opcaoInclusa?.label || "Escolha uma opção";
        $("mp-opcoes").innerHTML = ops.map((o) => `
            <label class="opcao" data-valor="${escaparHtml(o)}"><input type="radio" name="mp-opcao" value="${escaparHtml(o)}"><span>${escaparHtml(o)}</span></label>`).join("");

        const esgot = acabou(prod);
        $("mp-adicionar").disabled = esgot;
        $("mp-adicionar").innerHTML = esgot ? "Acabou por hoje" : `Adicionar <span id="mp-preco"></span>`;
        atualizarModal();
        $("modal-produto").classList.add("aberto");
        $("fundo-produto").classList.add("aberto");
        travar();
    };
    const fecharProduto = () => {
        $("modal-produto").classList.remove("aberto");
        $("fundo-produto").classList.remove("aberto");
        destravar();
    };

    $("mp-tamanhos").addEventListener("change", (e) => { mpTamanho = Number(e.target.value); atualizarModal(); });
    $("mp-opcoes").addEventListener("change", (e) => { mpOpcao = e.target.value; atualizarModal(); });
    $("mp-menos").addEventListener("click", () => { if (mpQtd > 1) { mpQtd--; atualizarModal(); } });
    $("mp-mais").addEventListener("click", () => {
        if (temEstoque(mpProduto) && qtdNoCarrinho(mpProduto.id) + mpQtd + 1 > Number(mpProduto.estoque)) {
            avisar(`Temos só ${mpProduto.estoque} disponível(is) hoje.`); return;
        }
        mpQtd++; atualizarModal();
    });
    $("mp-adicionar").addEventListener("click", () => {
        if (!mpProduto || acabou(mpProduto)) return;
        if (mpProduto.opcaoInclusa?.opcoes?.length && !mpOpcao) {
            avisar(`${mpProduto.opcaoInclusa.label || "Escolha uma opção"} antes de adicionar.`);
            $("mp-grupo-opcao").scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        if (adicionar(mpProduto.id, mpTamanho, mpOpcao, mpQtd)) fecharProduto();
    });
    $("mp-fechar").addEventListener("click", fecharProduto);
    $("fundo-produto").addEventListener("click", fecharProduto);

    // ─── CARRINHO ────────────────────────────────────────────────────────────
    const adicionar = (id, idxTamanho = 0, opcao = null, qtd = 1) => {
        if (config.lojaAberta === false) {
            avisar("Hoje não estamos recebendo pedidos pelo site. Chame no WhatsApp!");
            return false;
        }
        const prod = produtos.find((x) => x.id === id);
        if (!prod) return false;
        if (temEstoque(prod) && qtdNoCarrinho(id) + qtd > Number(prod.estoque)) {
            avisar(`Temos só ${prod.estoque} unidade(s) de "${prod.nome}" hoje.`);
            return false;
        }
        const tam = tamanhosDe(prod)[idxTamanho];
        const chave = `${id}|${tam.nome || ""}|${opcao || ""}`;
        const existente = carrinho.find((i) => i.chave === chave);
        if (existente) existente.quantidade += qtd;
        else carrinho.push({ chave, id, nome: prod.nome, imagem: prod.imagem, tamanho: tam.nome, opcao, preco: Number(tam.preco) || 0, quantidade: qtd });
        atualizarCarrinho();
        const cont = $("carrinho-contador");
        cont.classList.remove("pulo"); void cont.offsetWidth; cont.classList.add("pulo");
        avisar(`✓ ${prod.nome} no carrinho`);
        return true;
    };

    const detalheItem = (i) => [i.tamanho, i.opcao].filter(Boolean).join(" · ");

    const calcular = () => {
        const subtotal = carrinho.reduce((a, i) => a + i.preco * i.quantidade, 0);
        let desconto = 0;
        if (cupomAplicado) {
            desconto = cupomAplicado.tipo === "fixo" ? Math.min(Number(cupomAplicado.valor), subtotal) : subtotal * Number(cupomAplicado.valor) / 100;
        }
        let frete = 0, freteDefinido = false;
        if (tipoEntrega === "entrega") {
            const idx = $("bairro").value;
            if (idx !== "") {
                freteDefinido = true;
                frete = Number(fretes[idx]?.valor) || 0;
                if (Number(config.freteGratisAcima) > 0 && subtotal - desconto >= Number(config.freteGratisAcima)) frete = 0;
            }
        }
        return { subtotal, desconto, frete, freteDefinido, total: Math.max(0, subtotal - desconto + frete) };
    };

    const atualizarCarrinho = () => {
        const qtd = carrinho.reduce((a, i) => a + i.quantidade, 0);
        if (!carrinho.length) {
            $("carrinho-itens").innerHTML = `<div class="vazio"><i class="fa-solid fa-basket-shopping"></i>Seu carrinho está vazio.<br>Escolha uma delícia no cardápio!</div>`;
        } else {
            $("carrinho-itens").innerHTML = carrinho.map((i) => `
                <div class="item" data-chave="${escaparHtml(i.chave)}">
                    <img src="${escaparHtml(i.imagem)}" alt="">
                    <div>
                        <div class="item-nome">${escaparHtml(i.nome)}</div>
                        ${detalheItem(i) ? `<div class="item-detalhe">${escaparHtml(detalheItem(i))}</div>` : ""}
                        <div class="item-preco">${formatarMoeda(i.preco * i.quantidade)}</div>
                    </div>
                    <div class="quantidade">
                        <button type="button" data-acao="menos" aria-label="Diminuir">${i.quantidade === 1 ? '<i class="fa-regular fa-trash-can" style="font-size:.9rem"></i>' : "−"}</button>
                        <span>${i.quantidade}</span>
                        <button type="button" data-acao="mais" aria-label="Aumentar">+</button>
                    </div>
                </div>`).join("");
        }
        // Cupom que deixou de valer
        const c0 = calcular();
        if (cupomAplicado && cupomAplicado.valorMinimo && c0.subtotal < Number(cupomAplicado.valorMinimo)) {
            cupomAplicado = null;
            $("cupom-msg").textContent = "Cupom removido: o pedido ficou abaixo do valor mínimo.";
            $("cupom-msg").className = "cupom-msg erro";
        }
        const c = calcular();
        $("t-subtotal").textContent = formatarMoeda(c.subtotal);
        $("linha-desconto").hidden = c.desconto <= 0;
        $("t-desconto").textContent = `- ${formatarMoeda(c.desconto)}`;
        $("linha-frete").hidden = !(tipoEntrega === "entrega" && c.freteDefinido);
        $("t-frete").textContent = c.frete === 0 ? "Grátis" : formatarMoeda(c.frete);
        $("t-total").textContent = formatarMoeda(c.total);
        $("carrinho-contador").textContent = qtd;
        $("carrinho-total-topo").textContent = formatarMoeda(c.total);
        $("barra-qtd").textContent = `${qtd} ${qtd === 1 ? "item" : "itens"}`;
        $("barra-total").textContent = formatarMoeda(c.total);
        $("barra-carrinho").hidden = !carrinho.length || $("carrinho").classList.contains("aberto");
        $("avancar").disabled = !carrinho.length;

        // Dica de frete
        if (tipoEntrega === "entrega" && c.freteDefinido) {
            const faltam = Number(config.freteGratisAcima) - (c.subtotal - c.desconto);
            $("dica-frete").textContent = c.frete === 0
                ? "🎉 Entrega grátis!"
                : (Number(config.freteGratisAcima) > 0 ? `Faltam ${formatarMoeda(faltam)} para a entrega sair grátis.` : "");
        } else {
            $("dica-frete").textContent = "";
        }
        if (etapa === 3) renderResumo();
    };

    $("carrinho-itens").addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-acao]");
        if (!btn) return;
        const item = carrinho.find((i) => i.chave === btn.closest(".item").dataset.chave);
        if (!item) return;
        if (btn.dataset.acao === "mais") {
            const prod = produtos.find((x) => x.id === item.id);
            if (prod && temEstoque(prod) && qtdNoCarrinho(item.id) + 1 > Number(prod.estoque)) {
                avisar(`Temos só ${prod.estoque} unidade(s) hoje.`); return;
            }
            item.quantidade++;
        } else {
            item.quantidade--;
            if (item.quantidade <= 0) carrinho = carrinho.filter((i) => i !== item);
        }
        atualizarCarrinho();
    });

    const abrirCarrinho = () => {
        $("carrinho").classList.add("aberto");
        $("fundo-carrinho").classList.add("aberto");
        $("barra-carrinho").hidden = true;
        travar();
    };
    const fecharCarrinho = () => {
        $("carrinho").classList.remove("aberto");
        $("fundo-carrinho").classList.remove("aberto");
        destravar();
        atualizarCarrinho();
    };

    // Cupom
    $("cupom-aplicar").addEventListener("click", () => {
        const codigo = $("cupom").value.trim().toUpperCase();
        const msg = $("cupom-msg");
        const achado = cupons.find((c) => (c.codigo || "").toUpperCase() === codigo);
        const { subtotal } = calcular();
        cupomAplicado = null;
        if (!codigo) { msg.textContent = ""; }
        else if (!achado || achado.ativo === false) { msg.textContent = "Esse cupom não existe ou não vale mais."; msg.className = "cupom-msg erro"; }
        else if (achado.validade && new Date(`${achado.validade}T23:59:59`) < new Date()) { msg.textContent = "Esse cupom já venceu."; msg.className = "cupom-msg erro"; }
        else if (achado.valorMinimo && subtotal < Number(achado.valorMinimo)) { msg.textContent = `Esse cupom vale para pedidos a partir de ${formatarMoeda(achado.valorMinimo)}.`; msg.className = "cupom-msg erro"; }
        else {
            cupomAplicado = achado;
            msg.textContent = `Cupom aplicado: ${achado.tipo === "fixo" ? formatarMoeda(achado.valor) : achado.valor + "%"} de desconto!`;
            msg.className = "cupom-msg ok";
        }
        atualizarCarrinho();
    });

    // Entrega x retirada
    document.querySelectorAll(".alternar-btn").forEach((btn) => btn.addEventListener("click", () => {
        tipoEntrega = btn.dataset.tipo;
        document.querySelectorAll(".alternar-btn").forEach((b) => b.classList.toggle("ativo", b === btn));
        $("campos-entrega").hidden = tipoEntrega !== "entrega";
        $("campos-retirada").hidden = tipoEntrega !== "retirada";
        atualizarCarrinho();
    }));
    $("bairro").addEventListener("change", atualizarCarrinho);

    // Pagamento
    document.querySelectorAll('input[name="pagamento"]').forEach((r) => r.addEventListener("change", () => {
        document.querySelectorAll(".pagamento").forEach((l) => l.classList.toggle("selecionado", l.contains(r) && r.checked));
        $("campo-troco").hidden = r.value !== "Dinheiro";
        renderResumo();
    }));
    $("troco").addEventListener("input", renderResumoDepois);
    function renderResumoDepois() { renderResumo(); }

    // Máscara do telefone
    $("cliente-telefone").addEventListener("input", (e) => {
        let v = e.target.value.replace(/\D/g, "").slice(0, 11);
        if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
        else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
        else if (v.length) v = `(${v}`;
        e.target.value = v;
    });
    document.querySelectorAll(".campo input, .campo select").forEach((el) =>
        el.addEventListener("input", () => el.classList.remove("erro")));

    // ─── ETAPAS ──────────────────────────────────────────────────────────────
    const exigir = (ids) => {
        let ok = true;
        ids.forEach((id) => {
            const el = $(id);
            const vazio = !el.value.trim();
            el.classList.toggle("erro", vazio);
            if (vazio && ok) { el.focus(); ok = false; }
        });
        if (!ok) avisar("Preencha os campos marcados em vermelho.");
        return ok;
    };

    const validarEtapa = () => {
        if (etapa === 1) {
            if (!carrinho.length) { avisar("Seu carrinho está vazio."); return false; }
            return true;
        }
        if (etapa === 2) {
            if (tipoEntrega === "entrega") {
                if (!exigir(["bairro", "endereco"])) return false;
                const { subtotal } = calcular();
                if (Number(config.pedidoMinimo) > 0 && subtotal < Number(config.pedidoMinimo)) {
                    avisar(`O pedido mínimo para entrega é ${formatarMoeda(config.pedidoMinimo)}.`); return false;
                }
            } else {
                if (!exigir(["retirada-data", "retirada-hora"])) return false;
                const [a, m, d] = $("retirada-data").value.split("-").map(Number);
                const dia = new Date(a, m - 1, d).getDay();
                if (Array.isArray(config.retiradaDias) && !config.retiradaDias.includes(dia)) {
                    $("retirada-data").classList.add("erro");
                    avisar("Nesse dia não abrimos para retirada. Escolha outro dia."); return false;
                }
            }
            if (!exigir(["cliente-nome", "cliente-telefone"])) return false;
            if ($("cliente-telefone").value.replace(/\D/g, "").length < 10) {
                $("cliente-telefone").classList.add("erro"); avisar("Confira o número do WhatsApp."); return false;
            }
            return true;
        }
        return true;
    };

    const mostrarEtapa = (n) => {
        etapa = n;
        document.querySelectorAll(".etapa[data-etapa]").forEach((s) => { s.hidden = Number(s.dataset.etapa) !== n; });
        document.querySelectorAll("#etapas li").forEach((li) => {
            const k = Number(li.dataset.etapa);
            li.classList.toggle("ativa", k === n);
            li.classList.toggle("feita", k < n);
        });
        $("voltar").hidden = n === 1;
        $("avancar").hidden = n === 3;
        $("enviar").hidden = n !== 3;
        if (n === 3) renderResumo();
        $("carrinho-conteudo").scrollTop = 0;
    };

    const textoEntrega = () => {
        if (tipoEntrega === "entrega") {
            const f = fretes[$("bairro").value];
            const ref = $("referencia").value.trim();
            return { titulo: "Entrega", linhas: [`${$("endereco").value.trim()}`, `Bairro: ${f ? f.bairro : ""}`, ...(ref ? [`Referência: ${ref}`] : [])] };
        }
        const [a, m, d] = ($("retirada-data").value || "--").split("-");
        return { titulo: "Retirada", linhas: [`${d}/${m}/${a} às ${$("retirada-hora").value}`] };
    };

    const textoPagamento = () => {
        const forma = document.querySelector('input[name="pagamento"]:checked').value;
        if (forma !== "Dinheiro") return forma;
        const troco = $("troco").value;
        return troco ? `Dinheiro (troco para ${formatarMoeda(Number(troco))})` : "Dinheiro (sem troco)";
    };

    function renderResumo() {
        const c = calcular();
        const ent = textoEntrega();
        $("resumo").innerHTML = `
            <h5>Itens</h5>
            <ul>${carrinho.map((i) => `<li><span>${i.quantidade}x ${escaparHtml(i.nome)}${detalheItem(i) ? ` <small>(${escaparHtml(detalheItem(i))})</small>` : ""}</span><span>${formatarMoeda(i.preco * i.quantidade)}</span></li>`).join("")}</ul>
            <h5>${ent.titulo}</h5>
            <p>${ent.linhas.map(escaparHtml).join("<br>")}</p>
            <h5>Para</h5>
            <p>${escaparHtml($("cliente-nome").value)} · ${escaparHtml($("cliente-telefone").value)}</p>
            <h5>Pagamento</h5>
            <p>${escaparHtml(textoPagamento())}${cupomAplicado ? `<br>Cupom ${escaparHtml(cupomAplicado.codigo)}: - ${formatarMoeda(c.desconto)}` : ""}</p>
            ${$("observacoes").value.trim() ? `<h5>Observação</h5><p>${escaparHtml($("observacoes").value.trim())}</p>` : ""}`;
    }

    const gerarCodigo = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let s = "OL";
        for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
        return s;
    };

    const enviarPedido = async () => {
        if (!carrinho.length) return;
        const c = calcular();
        const codigo = gerarCodigo();
        const ent = textoEntrega();
        const pagamento = textoPagamento();
        const obs = $("observacoes").value.trim();
        const itensTxt = carrinho.map((i) => `• ${i.quantidade}x ${i.nome}${detalheItem(i) ? ` (${detalheItem(i)})` : ""} — ${formatarMoeda(i.preco * i.quantidade)}`).join("\n");

        let msg = `*NOVO PEDIDO — ${config.nomeLoja}*\n*Pedido nº ${codigo}*\n\n${itensTxt}\n\n`;
        msg += `Subtotal: ${formatarMoeda(c.subtotal)}\n`;
        if (c.desconto > 0) msg += `Desconto (${cupomAplicado.codigo}): - ${formatarMoeda(c.desconto)}\n`;
        if (tipoEntrega === "entrega") msg += `Entrega: ${c.frete === 0 ? "Grátis" : formatarMoeda(c.frete)}\n`;
        msg += `*Total: ${formatarMoeda(c.total)}*\n\n`;
        msg += `*${ent.titulo}:*\n${ent.linhas.join("\n")}\n\n`;
        msg += `*Cliente:* ${$("cliente-nome").value.trim()}\n*WhatsApp:* ${$("cliente-telefone").value}\n*Pagamento:* ${pagamento}`;
        if (obs) msg += `\n*Observação:* ${obs}`;

        // Abre o WhatsApp primeiro (alguns celulares bloqueiam se demorar)
        window.open(linkWhats(msg), "_blank");

        // Registra o pedido para aparecer no painel da Dani
        try {
            await Dados.salvar("pedidos", codigo, {
                codigo, status: "novo", criadoEm: new Date().toISOString(),
                cliente: $("cliente-nome").value.trim(), telefone: $("cliente-telefone").value,
                tipoEntrega: ent.titulo,
                bairro: tipoEntrega === "entrega" ? (fretes[$("bairro").value]?.bairro || "") : "",
                endereco: tipoEntrega === "entrega" ? [$("endereco").value.trim(), $("referencia").value.trim()].filter(Boolean).join(" — ") : "",
                retirada: tipoEntrega === "retirada" ? ent.linhas[0] : "",
                pagamento, observacao: obs,
                itens: carrinho.map((i) => ({ id: i.id, nome: i.nome + (detalheItem(i) ? ` (${detalheItem(i)})` : ""), quantidade: i.quantidade, preco: i.preco })),
                subtotal: c.subtotal, desconto: c.desconto, frete: c.frete, total: c.total,
            });
        } catch (e) {
            console.warn("Pedido enviado pelo WhatsApp, mas não foi registrado no painel:", e);
        }

        document.querySelectorAll(".etapa[data-etapa]").forEach((s) => { s.hidden = true; });
        $("etapas").hidden = true;
        $("carrinho-totais").hidden = true;
        $("carrinho-botoes").hidden = true;
        $("codigo-pedido").textContent = codigo;
        $("etapa-sucesso").hidden = false;
    };

    const novoPedido = () => {
        carrinho = []; cupomAplicado = null;
        $("cupom").value = ""; $("cupom-msg").textContent = ""; $("observacoes").value = "";
        $("etapa-sucesso").hidden = true;
        $("etapas").hidden = false; $("carrinho-totais").hidden = false; $("carrinho-botoes").hidden = false;
        mostrarEtapa(1);
        fecharCarrinho();
    };

    // ─── EVENTOS GERAIS ──────────────────────────────────────────────────────
    $("botao-carrinho").addEventListener("click", abrirCarrinho);
    $("barra-carrinho").addEventListener("click", abrirCarrinho);
    $("carrinho-fechar").addEventListener("click", fecharCarrinho);
    $("fundo-carrinho").addEventListener("click", fecharCarrinho);
    $("avancar").addEventListener("click", () => { if (validarEtapa() && etapa < 3) mostrarEtapa(etapa + 1); });
    $("voltar").addEventListener("click", () => { if (etapa > 1) mostrarEtapa(etapa - 1); });
    $("enviar").addEventListener("click", enviarPedido);
    $("novo-pedido").addEventListener("click", novoPedido);
    $("etapas").addEventListener("click", (e) => {
        const li = e.target.closest("li");
        if (li && Number(li.dataset.etapa) < etapa) mostrarEtapa(Number(li.dataset.etapa));
    });

    document.addEventListener("click", (e) => {
        const add = e.target.closest("[data-add]");
        if (add) {
            const id = Number(add.dataset.add);
            const prod = produtos.find((x) => x.id === id);
            if (prod && precisaEscolher(prod)) abrirProduto(id);
            else adicionar(id);
            return;
        }
        const abrir = e.target.closest("[data-abrir]");
        if (abrir) abrirProduto(Number(abrir.dataset.abrir));
    });

    $("chips").addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        categoriaAtiva = chip.dataset.cat || null;
        renderChips();
        renderCatalogo();
        document.getElementById("cardapio").scrollIntoView({ behavior: "smooth" });
    });

    $("busca").addEventListener("input", (e) => {
        termoBusca = e.target.value;
        if (termoBusca) { categoriaAtiva = null; renderChips(); }
        renderCatalogo();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        if ($("modal-produto").classList.contains("aberto")) fecharProduto();
        else if ($("carrinho").classList.contains("aberto")) fecharCarrinho();
    });

    // ─── INICIAR ─────────────────────────────────────────────────────────────
    aplicarConfig();
    if (tipoEntrega === "retirada") document.querySelector('.alternar-btn[data-tipo="retirada"]').click();
    renderChips();
    renderCatalogo();
    renderVitrineNatal();
    atualizarCarrinho();
    mostrarEtapa(1);
});
