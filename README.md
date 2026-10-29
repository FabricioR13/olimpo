# Olimpo Especiarias — Catálogo + Painel

Catálogo online para a **Olimpo — Delícias de Sabores** (bolos, doces, pães caseiros e congelados), desenvolvido pela **TF Solutions** a partir da estrutura do catálogo Mamona's Açaí.

## Loja (`index.html`)
- Cardápio por categoria com fotos, busca e "Os mais pedidos"
- Sabores/recheios e tamanhos (ex: Escondidinho 450g/790g)
- Selos: sem lactose, sem glúten, sob encomenda, últimas unidades, acabou
- Carrinho em 3 passos (Itens → Entrega → Pagamento) com cupom
- **Frete por bairro** — Campo Belo e região, entrega grátis acima de um valor e pedido mínimo
- Pedido enviado pronto para o WhatsApp da loja e registrado no painel

## Painel (`admin.html`) — feito para ser simples
- **Início:** quanto entrou, saiu e sobrou hoje; o que precisa produzir
- **Vender:** balcão/PDV com troco
- **Pedidos:** pedidos do site (Aceitar → Entregue e pago); baixa o estoque e lança no caixa sozinho
- **Estoque:** botões + e − por produto, ligar/desligar do site, cadastro com foto
- **Caixa:** entradas e saídas (ingredientes, embalagens, gás, luz...) por mês
- **Relatório:** lucro do mês, mais vendidos, para onde foi o dinheiro; envio por WhatsApp e PDF
- **Ajustes:** aceitar pedidos hoje, WhatsApp, bairros/fretes, horários, cupons e textos

## Modo demonstração
Sem configurar nada, tudo funciona salvo no navegador (senha do painel: `1234`).
Para usar de verdade, preencha `FIREBASE_CONFIG` em `dados.js` e siga `regras.md`.

---
Desenvolvido por **Fabrício Rodrigues Garcia** — [TF Solutions](https://www.tfsolutions.com.br)
