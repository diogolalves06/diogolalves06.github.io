// lista global com todos os produtos recebidos da API
let produtosTodos = [];

document.addEventListener("DOMContentLoaded", () => {
    // Quando a página termina de carregar:
    // - carrega os produtos da API
    // - atualiza a visualização do carrinho (se já houver itens no localStorage)
    carregarProdutos();
    exibirCarrinho();
});

async function carregarProdutos() {
    try {
        // Faz um GET para a API que devolve os produtos
        const response = await fetch("https://deisishop.pythonanywhere.com/products");
        const dados = await response.json();

        // Guarda os produtos na variável global (garante array vazio se for undefined)
        produtosTodos = dados || [];

        // Aplica filtros/ordenação/ pesquisa e atualiza a lista visível
        atualizarListaProdutos();

        // Seleciona a secção do DOM onde os produtos são exibidos e limpa-a
        const secaoProdutos = document.querySelector("#produtos");
        secaoProdutos.innerHTML = "";

        // Percorre cada produto e cria um "card" (article) para o DOM
        produtosTodos.forEach(itemProduto => {
            const artigo = criarCardProduto(itemProduto);
            secaoProdutos.appendChild(artigo);
        });

    } catch (error) {
        // Se ocorrer erro na fetch ou no JSON, mostra uma mensagem de erro ao utilizador
        const secaoProdutos = document.querySelector("#produtos");
        secaoProdutos.innerHTML = "<p>Não foi possível carregar os produtos.</p>";
        console.error("Erro ao carregar produtos:", error);
    }
}

function criarCardProduto(item) {
    // Cria os elementos DOM necessários para mostrar um produto
    const artigo = document.createElement("article");

    const titulo = document.createElement("h3");
    titulo.textContent = item.title; // título do produto

    const imagem = document.createElement("img");
    imagem.src = item.image; // url da imagem
    imagem.alt = item.title;

    const descricao = document.createElement("p");
    descricao.textContent = item.description; // descrição do produto

    const preco = document.createElement("p");
    preco.textContent = `Preço: €${item.price}`; // preço

    const botao = document.createElement("button");
    botao.textContent = "Adicionar ao Carrinho";
    // Ao clicar, adiciona o produto ao carrinho (localStorage)
    botao.addEventListener("click", () => adicionarNoCarrinho(item));

    // Monta a estrutura do artigo
    artigo.appendChild(titulo);
    artigo.appendChild(imagem);
    artigo.appendChild(descricao);
    artigo.appendChild(preco);
    artigo.appendChild(botao);

    return artigo;
}

function adicionarNoCarrinho(item) {
    // Lê o carrinho do localStorage (se não existir, usa array vazio)
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    // Adiciona o produto recebido ao array
    carrinho.push(item);

    // Guarda novamente no localStorage
    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    // Atualiza a vista do carrinho para mostrar a adição
    exibirCarrinho();
}

function exibirCarrinho() {
    // Seleciona a secção do DOM onde o carrinho é mostrado
    const secaoCarrinho = document.querySelector("#cesto"); 
    // Lê o carrinho do localStorage
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    // Limpa a secção antes de popular
    secaoCarrinho.innerHTML = "";

    // Título do carrinho
    const tituloSecao = document.createElement("h2");
    tituloSecao.textContent = "Produtos Selecionados";
    secaoCarrinho.appendChild(tituloSecao);

    // Para cada item no carrinho cria um artigo com info e botão remover
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
        // Remove o item com base no índice do array
        botaoRemover.addEventListener("click", () => removerDoCarrinho(indice));

        // Adiciona tudo ao artigo e depois ao secaoCarrinho
        item.append(titulo, imagem, preco, botaoRemover);
        secaoCarrinho.append(item);
    });

    // Adiciona a caixa de compra (total, cupão, checkbox estudante, botão comprar)
    mostrarCaixaCompraNoFinal(carrinho)
}

function removerDoCarrinho(indice) {
    // Lê o carrinho
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    // Remove 1 item a partir do índice (splice altera o array)
    carrinho.splice(indice, 1);

    // Guarda o carrinho atualizado no localStorage e atualiza a vista
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    exibirCarrinho();
}

function atualizarListaProdutos() {
    const secaoProdutos = document.querySelector("#produtos");
    if (!secaoProdutos) return; // se não existir, sai (proteção)

    // cria uma cópia profunda dos produtos para filtrar sem mexer no original
    let listaFiltrada = JSON.parse(JSON.stringify(produtosTodos));

    // obter valores dos controlos do DOM (categoria, ordenação, busca)
    const filtroEl = document.querySelector("#categoria");
    const ordenarEl = document.querySelector("#ordenacao");
    const procurarEl = document.querySelector("#busca");

    const categoriaSelecionada = (filtroEl && filtroEl.value) || "";
    const termoBusca = (procurarEl && procurarEl.value.trim().toLowerCase()) || "";
    const ordenacao = (ordenarEl && ordenarEl.value) || "";

    // Filtrar por categoria — suporta várias propriedades (category, categoria, type)
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

    // Ordenar por preço (cres/decres)
    if (ordenacao === "precoCrescente") {
        listaFiltrada.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (ordenacao === "precoDecrescente") {
        listaFiltrada.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }

    // Limpa a secção e renderiza a lista resultante (cards)
    secaoProdutos.innerHTML = "";
    listaFiltrada.forEach(produto => {
        const artigo = criarCardProduto(produto);
        secaoProdutos.appendChild(artigo);
    });

    // Se não houver produtos para mostrar, informa o utilizador
    if (listaFiltrada.length === 0) {
        secaoProdutos.innerHTML = "<p>Nenhum produto encontrado.</p>";
    }
}

// opcional: adiciona listeners para atualizar automaticamente quando os controlos mudarem
document.addEventListener("change", (e) => {
    // se mudar a categoria ou ordenacao, atualiza a lista
    if (["categoria", "ordenacao"].includes(e.target?.id)) atualizarListaProdutos();
});
document.addEventListener("input", (e) => {
    // enquanto o utilizador escreve na busca, atualiza a lista
    if (e.target?.id === "busca") atualizarListaProdutos();
});

function mostrarCaixaCompraNoFinal(carrinho) {
    // local onde a caixa será inserida (cesto ou body como fallback)
    const secaoCesto = document.querySelector("#cesto") || document.body;

    // Remove uma caixa de compra antiga se já existir (evita duplicados)
    const antiga = document.querySelector("#caixa-compra");
    if (antiga) antiga.remove();

    // Se não houver itens no carrinho, não mostra nada
    if (!Array.isArray(carrinho) || carrinho.length === 0) return;

    // Calcula o total (soma dos preços)
    const total = carrinho.reduce((soma, p) => soma + Number(p.price || 0), 0);

    // Cria a secção da caixa de compra
    const caixa = document.createElement("section");
    caixa.id = "caixa-compra";

    // Mostra o total formatado com 2 casas decimais
    const titulo = document.createElement("h3");
    titulo.textContent = `Total: €${total.toFixed(2)}`;
    caixa.appendChild(titulo);

    // Checkbox "És estudante do DEISI?"
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

    // botão fica dentro do label -> alinha ao lado sem div extra
    labelCupao.appendChild(inputCupao);
    labelCupao.appendChild(botao);
    caixa.appendChild(labelCupao);

    // Parágrafo para mensagens de feedback (erro/sucesso)
    const msg = document.createElement("p");
    caixa.appendChild(msg);

    // Ao clicar em Comprar faz POST para a API /buy/ com dados do pedido
    botao.addEventListener("click", async () => {
        // Envia só os ids dos produtos no pedido
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

            // Se o status da resposta não for 200..299 lança erro com mensagem apropriada
            if (!resposta.ok) {
                let mensagem = `Erro ${resposta.status}`;
                try {
                    const errJson = await resposta.json();
                    if (errJson.message) mensagem = errJson.message;
                } catch {}
                throw new Error(mensagem);
            }

            // Se correu bem, mostra o total final e a referência devolvida pela API
            const data = await resposta.json();
            msg.textContent = `Valor final a pagar: ${data.totalCost}€ | Referência: ${data.reference}`;
        } catch (err) {
            // Em caso de erro mostra a mensagem de erro
            msg.textContent = `Erro ao efetuar compra: ${err.message}`;
        }
    });

    // Adiciona a caixa de compra ao DOM (por exemplo dentro de #cesto)
    secaoCesto.appendChild(caixa);
}
