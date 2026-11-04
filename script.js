//
// FASE 1: Modelagem dos dados (Classe Base)
//
class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    // Método que calcula o subtotal do produto
    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

//
// FASE 2: Gerenciamento de Estado (Memória e Edição)
//
const listaDeProdutos = [];

// Estado auxiliar: null indica "Modo Inclusão", número indica "Modo Edição"
let indiceEdicao = null;

// Chave para persistência no navegador
const CHAVE_STORAGE = "sistema_estoque_produtos";

//
// FASE 2.1: Persistência com localStorage
//
function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeProdutos);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (dadosSalvos) {
        const produtosObjetos = JSON.parse(dadosSalvos);

        produtosObjetos.forEach((prod) => {
            const produtoInstanciado = new Produto(prod.nome, prod.preco, prod.quantidade);
            listaDeProdutos.push(produtoInstanciado);
        });
    }
}

//
// FASE 3: Captura de Elementos do DOM
//
const formProduto = document.getElementById("produto-form");
const btnSubmit = formProduto.querySelector("button[type='submit']");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");

//
// FASE 4: Função para Transferir Estado para Modo Edição
//
function prepararEdicao(index) {
    const produto = listaDeProdutos[index];

    // 1. Preenche os campos do formulário com os dados do registro selecionado
    document.getElementById("nome").value = produto.nome;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;

    // 2. Atualiza a variável global de controle e altera o texto do botão
    indiceEdicao = index;
    btnSubmit.textContent = "Salvar Alterações";
    btnSubmit.classList.add("btn-warning");
}

//
// FASE 5: Escuta de Eventos
//

// 1. Evento Submit do Formulário com Validações (Guard Clauses) e Fluxo Update
formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    // Sanitização e Captura dos Valores
    const nome = document.getElementById("nome").value.trim();
    const preco = parseFloat(document.getElementById("preco").value);
    const quantidade = parseInt(document.getElementById("quantidade").value);

    // Guard Clause 1: Validação do nome
    if (!nome) {
        alert("Por favor, informe um nome válido para o produto.");
        return;
    }

    // Guard Clause 2: Checagem de Limites Numéricos
    if (isNaN(preco) || preco <= 0 || isNaN(quantidade) || quantidade <= 0) {
        alert("O preço e a quantidade devem ser valores numéricos maiores que zero.");
        return;
    }

    // Instancia o novo produto com dados validados
    const produtoValido = new Produto(nome, preco, quantidade);

    // Lógica de Persistência em Memória: Inclusão vs. Alteração (Update)
    if (indiceEdicao === null) {
        // Modo Inclusão
        listaDeProdutos.push(produtoValido);
    } else {
        // Modo Edição (Update)
        listaDeProdutos[indiceEdicao] = produtoValido;

        // Restaura o estado original de cadastro
        indiceEdicao = null;
        btnSubmit.textContent = "Adicionar Produto";
        btnSubmit.classList.remove("btn-warning");
    }

    // Sincroniza com localStorage, limpa o formulário e atualiza a interface
    salvarNoLocalStorage();
    formProduto.reset();
    atualizarInterface();
});

// 2. Limpar Toda a Tabela
btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        alert("A tabela já está vazia!");
        return;
    }

    if (confirm("Tem certeza que deseja remover todos os produtos?")) {
        listaDeProdutos.length = 0;
        localStorage.removeItem(CHAVE_STORAGE);

        // Restaura estado se estivesse editando
        indiceEdicao = null;
        btnSubmit.textContent = "Adicionar Produto";
        btnSubmit.classList.remove("btn-warning");

        formProduto.reset();
        atualizarInterface();
    }
});

//
// FASE 6: Funções de Atualização e Renderização da Interface
//
function removerProduto(index) {
    listaDeProdutos.splice(index, 1);

    // Caso o item excluído seja o que estava em edição, reseta o estado
    if (indiceEdicao === index) {
        indiceEdicao = null;
        btnSubmit.textContent = "Adicionar Produto";
        btnSubmit.classList.remove("btn-warning");
        formProduto.reset();
    }

    salvarNoLocalStorage();
    atualizarInterface();
}

function atualizarTotalEstoque() {
    const total = listaDeProdutos.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent = `Total em Estoque: R$ ${total.toFixed(2)}`;
}

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    tabelaBody.innerHTML = "";

    listaDeProdutos.forEach((produto, index) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-editar">Editar</button>
                <button class="btn-remover">Remover</button>
            </td>
        `;

        // Eventos dos botões da coluna de ações
        const btnEditar = linha.querySelector(".btn-editar");
        btnEditar.addEventListener("click", () => prepararEdicao(index));

        const btnRemover = linha.querySelector(".btn-remover");
        btnRemover.addEventListener("click", () => removerProduto(index));

        tabelaBody.appendChild(linha);
    });
}

function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
}

//
// FASE 7: Inicialização da Aplicação
//
carregarDoLocalStorage();
atualizarInterface();
