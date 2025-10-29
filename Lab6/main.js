document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos(produtos);
    mostrarCarrinho(); 
});

function carregarProdutos(produtos) {
    const prod = document.querySelector("#produtos");
    prod.innerHTML = ""; 

    produtos.forEach(produto => {
        const artigo = criarProduto(produto);
        prod.appendChild(artigo);
    });
}

function criarProduto(produto) {
    const article = document.createElement("article");

    const titulo = document.createElement("h3");
    titulo.textContent = produto.title;

    const imagem = document.createElement("img");
    imagem.src = produto.image;
    imagem.alt = produto.title;

    const descricao = document.createElement("p");
    descricao.textContent = produto.description;

    const preco = document.createElement("p");
    preco.textContent = `Preço: €${produto.price}`;

    const botao = document.createElement("button");
    botao.textContent = "Adicionar ao Carrinho";
    botao.addEventListener("click", () => adicionarAoCarrinho(produto));

    article.appendChild(titulo);
    article.appendChild(imagem);
    article.appendChild(descricao);
    article.appendChild(preco);
    article.appendChild(botao);

    return article;
}

function adicionarAoCarrinho(produto) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    carrinho.push(produto);

    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    mostrarCarrinho();
}

function mostrarCarrinho() {
    const secCarrinho = document.querySelector("#carrinho");
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    secCarrinho.innerHTML = "";

    carrinho.forEach(p => {
        const item = document.createElement("article");

        const titulo = document.createElement("h3");
        titulo.textContent = p.title;

        const imagem = document.createElement("img");
        imagem.src = p.image;
        imagem.alt = p.title;

        const preco = document.createElement("p");
        preco.textContent = `Preço: €${p.price}`;

        const botaoRemover = document.createElement("button");
        botaoRemover.textContent = "Remover do Carrinho";
        botaoRemover.addEventListener("click", () => removerDoCarrinho(p));

        item.append(titulo, imagem, preco, botaoRemover);
        secCarrinho.append(item);
    });

    const total = carrinho.reduce((soma, p) => soma + p.price, 0);
    const totalEl = document.createElement("p");
    totalEl.textContent = `Total: €${total}`;
    secCarrinho.append(totalEl);
}

function removerDoCarrinho(produto) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    carrinho = carrinho.filter(p => p.id !== produto.id);

    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    mostrarCarrinho();
}