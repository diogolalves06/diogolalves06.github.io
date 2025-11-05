// lista global com todos os produtos recebidos da API
let produtosTodos = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
    exibirCarrinho();
});

async function carregarProdutos() {
    try {
        
        const response = await fetch("https://deisishop.pythonanywhere.com/products");
        const dados = await response.json();

        // guarda os produtos na variável produtosTodos
        produtosTodos = dados || [];

        // atualiza a visualização aplicando filtros
        atualizarListaProdutos();

        // seleciona a secção de produtos e limpa antes de popular
        const secaoProdutos = document.querySelector("#produtos");
        secaoProdutos.innerHTML = "";

        // percorre cada produto e cria um artigo para o DOM
        produtosTodos.forEach(itemProduto => {
            const artigo = criarCardProduto(itemProduto);
            secaoProdutos.appendChild(artigo);
        });

    } catch (error) {
        // se ocorrer erro ao carregar mostra mensagem de erro na secção de produtos
        const secaoProdutos = document.querySelector("#produtos");
        secaoProdutos.innerHTML = "<p>Não foi possível carregar os produtos.</p>";
        console.error("Erro ao carregar produtos:", error);
    }
}

function criarCardProduto(item) {
    const artigo = document.createElement("article");

    const titulo = document.createElement("h3");
    titulo.textContent = item.title;

    const imagem = document.createElement("img");
    imagem.src = item.image;
    imagem.alt = item.title;

    const descricao = document.createElement("p");
    descricao.textContent = item.description;

    const preco = document.createElement("p");
    preco.textContent = `Preço: €${item.price}`;

    const botao = document.createElement("button");
    botao.textContent = "Adicionar ao Carrinho";
    botao.addEventListener("click", () => adicionarNoCarrinho(item));

    artigo.appendChild(titulo);
    artigo.appendChild(imagem);
    artigo.appendChild(descricao);
    artigo.appendChild(preco);
    artigo.appendChild(botao);

    return artigo;
}

function adicionarNoCarrinho(item) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    carrinho.push(item);

    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    exibirCarrinho();
}

function exibirCarrinho() {
    const secaoCarrinho = document.querySelector("#cesto"); 
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    secaoCarrinho.innerHTML = "";

    const tituloSecao = document.createElement("h2");
    tituloSecao.textContent = "Produtos Selecionados";
    secaoCarrinho.appendChild(tituloSecao);

    carrinho.forEach((produtoCarrinho, indice) => {
        const item = document.createElement("article");

        const titulo = document.createElement("h3");
        titulo.textContent = produtoCarrinho.title;

        const imagem = document.createElement("img");
        imagem.src = produtoCarrinho.image;
        imagem.alt = produtoCarrinho.title;

        const preco = document.createElement("p");
        preco.textContent = `Preço: €${produtoCarrinho.price}`;

        const botaoRemover = document.createElement("button");
        botaoRemover.textContent = "Remover do Carrinho";
        botaoRemover.addEventListener("click", () => removerDoCarrinho(indice));

        item.append(titulo, imagem, preco, botaoRemover);
        secaoCarrinho.append(item);
    });

    mostrarCaixaCompraNoFinal(carrinho)
}

function removerDoCarrinho(indice) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    carrinho.splice(indice, 1);

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    exibirCarrinho();
}

function atualizarListaProdutos() {
    const secaoProdutos = document.querySelector("#produtos");
    if (!secaoProdutos) return;

    // cria uma cópia dos produtos originais para poder filtrar sem alterar o original
    let listaFiltrada = JSON.parse(JSON.stringify(produtosTodos));

    // obter valores dos controlos
    const filtroEl = document.querySelector("#categoria");
    const ordenarEl = document.querySelector("#ordenacao");
    const procurarEl = document.querySelector("#busca");

    const categoriaSelecionada = (filtroEl && filtroEl.value) || "";
    const termoBusca = (procurarEl && procurarEl.value.trim().toLowerCase()) || "";
    const ordenacao = (ordenarEl && ordenarEl.value) || "";

    // Filtrar por categoria
    if (categoriaSelecionada) {
        listaFiltrada = listaFiltrada.filter(p => {
            const cat = (p.category || p.categoria || p.type || "").toString().toLowerCase();
            return cat === categoriaSelecionada.toString().toLowerCase();
        });
    }

    // Filtrar por termo de pesquisa no título/nome
    if (termoBusca) {
        listaFiltrada = listaFiltrada.filter(p => {
            const title = (p.title || p.name || "").toString().toLowerCase();
            return title.includes(termoBusca);
        });
    }

    // Ordenar por preço (crescente ou decrescente)
    if (ordenacao === "precoCrescente") {
        listaFiltrada.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (ordenacao === "precoDecrescente") {
        listaFiltrada.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }

    // Limpa a secção e renderiza a lista resultante
    secaoProdutos.innerHTML = "";
    listaFiltrada.forEach(produto => {
        const artigo = criarCardProduto(produto);
        secaoProdutos.appendChild(artigo);
    });

    // Se não houver produtos para mostrar informa o utilizador
    if (listaFiltrada.length === 0) {
        secaoProdutos.innerHTML = "<p>Nenhum produto encontrado.</p>";
    }
}

// opcional: adiciona listeners para atualizar automaticamente quando os controlos mudarem
document.addEventListener("change", (e) => {
    if (["categoria", "ordenacao"].includes(e.target?.id)) atualizarListaProdutos();
});
document.addEventListener("input", (e) => {
    if (e.target?.id === "busca") atualizarListaProdutos();
});

function mostrarCaixaCompraNoFinal(carrinho) {
    const secaoCesto = document.querySelector("#cesto") || document.body;

    const antiga = document.querySelector("#caixa-compra");
    if (antiga) antiga.remove();

    if (!Array.isArray(carrinho) || carrinho.length === 0) return;

    const total = carrinho.reduce((soma, p) => soma + Number(p.price || 0), 0);

    const caixa = document.createElement("section");
    caixa.id = "caixa-compra";

    const titulo = document.createElement("h3");
    titulo.textContent = `Total: €${total.toFixed(2)}`;
    caixa.appendChild(titulo);

    const labelEstudante = document.createElement("label");
    const checkEstudante = document.createElement("input");
    checkEstudante.type = "checkbox";
    labelEstudante.appendChild(checkEstudante);
    labelEstudante.appendChild(document.createTextNode(" És estudante do DEISI?"));
    caixa.appendChild(labelEstudante);

    // --- CUPÃO + BOTÃO NA MESMA LINHA ---
    const labelCupao = document.createElement("label");
    labelCupao.setAttribute("for", "cupao");
    labelCupao.textContent = "Cupão: ";

    const inputCupao = document.createElement("input");
    inputCupao.id = "cupao";
    inputCupao.placeholder = "Insere o código";

    const botao = document.createElement("button");
    botao.textContent = "Comprar";

    // botão fica dentro do label -> alinha ao lado sem div
    labelCupao.appendChild(inputCupao);
    labelCupao.appendChild(botao);
    caixa.appendChild(labelCupao);

    // mensagem
    const msg = document.createElement("p");
    caixa.appendChild(msg);

    botao.addEventListener("click", async () => {
        const products = carrinho.map(p => p.id);
        const student = checkEstudante.checked;
        const coupon = inputCupao.value;
        const dados = { products, student, coupon };

        const url = "https://deisishop.pythonanywhere.com/buy/";

        try {
            const resposta = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });

            if (!resposta.ok) {
                let mensagem = `Erro ${resposta.status}`;
                try {
                    const errJson = await resposta.json();
                    if (errJson.message) mensagem = errJson.message;
                } catch {}
                throw new Error(mensagem);
            }

            const data = await resposta.json();
            msg.textContent = `Valor final a pagar: ${data.totalCost}€ | Referência: ${data.reference}`;
        } catch (err) {
            msg.textContent = `Erro ao efetuar compra: ${err.message}`;
        }
    });

    secaoCesto.appendChild(caixa);
}





