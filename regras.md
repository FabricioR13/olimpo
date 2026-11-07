# Regras do Firestore — Olimpo

Console do Firebase → **Firestore Database → Regras** → apague o conteúdo → cole o bloco abaixo → **Publicar**.

> **Antes de publicar**, crie a lista de acesso (`admins`) — veja abaixo. Se publicar antes, ninguém consegue mexer no painel até a lista existir.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Quem pode mexer no painel: só os e-mails que estão na coleção "admins"
    // (um documento por e-mail, com o e-mail em letras minúsculas como ID).
    function isAdmin() {
      return request.auth != null
        && request.auth.token.email != null
        && exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }

    // A lista de acesso: cada pessoa logada só consegue ver o PRÓPRIO item (para o painel
    // saber se ela tem acesso). Ninguém altera pelo site — só pelo Console do Firebase.
    match /admins/{email} {
      allow read: if request.auth != null && request.auth.token.email == email;
      allow write: if false;
    }

    // Vitrine pública: qualquer visitante lê; só quem está na lista "admins" altera
    match /produtos/{doc}      { allow read: if true; allow write: if isAdmin(); }
    match /categorias/{doc}    { allow read: if true; allow write: if isAdmin(); }
    match /cupons/{doc}        { allow read: if true; allow write: if isAdmin(); }
    match /configuracoes/{doc} { allow read: if true; allow write: if isAdmin(); }

    // Pedidos do site: o cliente só CRIA o pedido, com formato conferido;
    // ver, aceitar, marcar como entregue ou apagar é só do admin.
    match /pedidos/{doc} {
      allow create: if isAdmin();
      allow create: if request.resource.data.status == 'novo'
                    && request.resource.data.codigo == doc
                    && request.resource.data.total is number
                    && request.resource.data.total >= 0 && request.resource.data.total < 5000
                    && request.resource.data.itens is list
                    && request.resource.data.itens.size() > 0 && request.resource.data.itens.size() <= 60;
      allow read, update, delete: if isAdmin();
    }

    // Caixa (entradas e saídas): dado financeiro, só admin
    match /movimentacoes/{doc} { allow read, write: if isAdmin(); }
  }
}
```

## O que essas regras fazem

- **admins**: a lista de quem entra no painel. Ter usuário e senha no Authentication **não basta** — o e-mail precisa estar nesta lista. Quem não está nela é deslogado na hora e não consegue gravar nada no banco.
- **produtos, categorias, cupons, configuracoes**: qualquer visitante da loja pode *ler* (o site precisa disso), mas só os e-mails da lista `admins` podem *escrever*.
- **pedidos**: o site só cria o pedido (com status "novo", total e itens conferidos); só o admin vê, muda e apaga.
- **movimentacoes** (caixa): só o admin.

## Lista de acesso ao painel (admins)

Devem estar na lista: o e-mail da dona da loja e **tf.solutions@outlook.com.br** (suporte TF Solutions, para conseguirmos entrar se ela tiver algum problema).

**Liberar alguém** (no Console do Firebase):
1. **Authentication → Usuários → Adicionar usuário**: e-mail e uma senha provisória (a pessoa troca depois pelo "Esqueci minha senha" da tela de login).
2. **Firestore Database → Iniciar coleção** (ou abrir a coleção `admins`) → **ID da coleção** = `admins` → **ID do documento** = o e-mail, **todo em minúsculas** → adicione um campo, por exemplo `nome` (string) = nome da pessoa → **Salvar**.

**Tirar o acesso**: apague o documento do e-mail na coleção `admins`.

**Importante**: em **Authentication → Configurações → Ações do usuário**, deixe **desmarcado** "Ativar criação (inscrição)". Assim ninguém cria conta sozinho.

## Passo a passo para colocar no ar com Firebase
1. Criar o projeto no Firebase e copiar o `firebaseConfig` para `FIREBASE_CONFIG` em `dados.js`.
2. **Authentication → Sign-in method → E-mail/senha** (ativar) e desmarcar "Ativar criação (inscrição)".
3. Criar os usuários em **Authentication → Users** e os documentos da coleção `admins`.
4. Publicar as regras acima.
5. Entrar no painel → **Estoque → Carregar cardápio inicial** (no Firebase o banco começa vazio).
