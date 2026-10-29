# Regras do Firestore — Olimpo Especiarias

Só é necessário quando sair do **modo demonstração** (preencher `FIREBASE_CONFIG` em `dados.js`).

Console do Firebase → **Firestore Database → Regras** → apague o conteúdo → cole o bloco abaixo → **Publicar**.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Vitrine pública: qualquer visitante lê, só o admin logado altera
    match /produtos/{doc}      { allow read: if true; allow write: if request.auth != null; }
    match /categorias/{doc}    { allow read: if true; allow write: if request.auth != null; }
    match /cupons/{doc}        { allow read: if true; allow write: if request.auth != null; }
    match /configuracoes/{doc} { allow read: if true; allow write: if request.auth != null; }

    // Pedidos do site: a cliente só CRIA o pedido; ler/alterar é só do admin
    match /pedidos/{doc} {
      allow create: if request.resource.data.status == 'novo';
      allow read, update, delete: if request.auth != null;
    }

    // Caixa (entradas e saídas): dado financeiro, só admin
    match /movimentacoes/{doc} { allow read, write: if request.auth != null; }
  }
}
```

## Passo a passo para colocar no ar com Firebase
1. Criar o projeto no Firebase e copiar o `firebaseConfig` para `FIREBASE_CONFIG` em `dados.js`.
2. **Authentication → Sign-in method → E-mail/senha** (ativar) e criar o usuário da Dani em **Users**.
3. Publicar as regras acima.
4. Cadastrar os produtos pelo admin (no Firebase o banco começa vazio — a demonstração só existe no navegador).
