//
// FASE 1: Modelagem dos dados (Classe Base)
//
class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

//
// FASE 2: Gerenciamento de Estado (Memória e Edição)
//
const listaDeProdutos = [];
let indiceEdicao = null;
const CHAVE_STORAGE = "sistema_estoque_produtos_v5";

// Persistência com localStorage
function salvarNoLocalStorage() {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(listaDeProdutos));
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
// FASE 3: Captura de Elementos do DOM e Manipulação de Interface (UX)
//
const form = document.getElementById("produto-form");
const inputNome = document.getElementById("nome");
const inputPreco = document.getElementById("preco");
const inputQuantidade = document.getElementById("quantidade");
const tabelaCorpo = document.getElementById("tabela-corpo");
const mensagemVazia = document.getElementById("mensagem-vazia");
const totalEstoqueEl = document.getElementById("total-estoque");
const btnLimparTabela = document.getElementById("limpar-tabela");
const btnAcaoForm = document.getElementById("btn-acao-form");
const mensagemErro = document.getElementById("mensagem-erro");

// Modais e Botões de UX
const btnBootstrap = document.getElementById("btn-bootstrap");
const modalBootstrap = document.getElementById("modal-bootstrap");
const modalBsFechar = document.getElementById("modal-bs-fechar");

const modalConfirmacao = document.getElementById("modal-confirmacao");
const modalTexto = document.getElementById("modal-texto");
const modalBtnConfirmar = document.getElementById("modal-btn-confirmar");
const modalBtnCancelar = document.getElementById("modal-btn-cancelar");

let acaoPendenteModal = null;

// Exibir mensagem inline (substitui alert)
function mostrarErro(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.style.display = "block";
}

function limparErro() {
    mensagemErro.textContent = "";
    mensagemErro.style.display = "none";
}

// Abrir Modal de Confirmação personalizado
function abrirModalConfirmacao(texto, callback) {
    modalTexto.textContent = texto;
    modalConfirmacao.style.display = "flex";
    acaoPendenteModal = callback;
}

function fecharModalConfirmacao() {
    modalConfirmacao.style.display = "none";
    acaoPendenteModal = null;
}

modalBtnConfirmar.addEventListener("click", () => {
    if (acaoPendenteModal) {
        acaoPendenteModal();
    }
    fecharModalConfirmacao();
});

modalBtnCancelar.addEventListener("click", () => {
    fecharModalConfirmacao();
});

// Modal Bootstrap
btnBootstrap.addEventListener("click", () => {
    modalBootstrap.style.display = "flex";
});

modalBsFechar.addEventListener("click", () => {
    modalBootstrap.style.display = "none";
});

// Renderizar Tabela e Resumo
function renderizarTabela() {
    tabelaCorpo.innerHTML = "";
    let valorTotalGeral = 0;

    if (listaDeProdutos.length === 0) {
        mensagemVazia.style.display = "block";
    } else {
        mensagemVazia.style.display = "none";
        listaDeProdutos.forEach((produto, index) => {
            const subtotal = produto.calcularSubtotal();
            valorTotalGeral += subtotal;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${produto.nome}</td>
                <td>R$ ${produto.preco.toFixed(2)}</td>
                <td>${produto.quantidade}</td>
                <td>R$ ${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn-editar" onclick="prepararEdicao(${index})">Editar</button>
                    <button class="btn-remover" onclick="solicitarRemocao(${index})">Remover</button>
                </td>
            `;
            tabelaCorpo.appendChild(tr);
        });
    }

    totalEstoqueEl.textContent = `Total em Estoque: R$ ${valorTotalGeral.toFixed(2)}`;
}

// Submissão do Formulário (Adição ou Edição)
form.addEventListener("submit", (e) => {
    e.preventDefault();
    limparErro();

    const nome = inputNome.value.trim();
    const preco = inputPreco.value;
    const quantidade = inputQuantidade.value;

    if (!nome || !preco || !quantidade) {
        mostrarErro("Preencha todos os campos do formulário antes de continuar.");
        return;
    }

    if (parseFloat(preco) < 0 || parseInt(quantidade) < 0) {
        mostrarErro("O preço e a quantidade não podem ser negativos.");
        return;
    }

    if (indiceEdicao === null) {
        // Modo Inclusão
        const novoProduto = new Produto(nome, preco, quantidade);
        listaDeProdutos.push(novoProduto);
    } else {
        // Modo Edição
        listaDeProdutos[indiceEdicao].nome = nome;
        listaDeProdutos[indiceEdicao].preco = parseFloat(preco);
        listaDeProdutos[indiceEdicao].quantidade = parseInt(quantidade);
        indiceEdicao = null;
        btnAcaoForm.textContent = "Adicionar Produto";
    }

    salvarNoLocalStorage();
    renderizarTabela();
    form.reset();
});

// Funções de Ação na Tabela
window.prepararEdicao = function(index) {
    limparErro();
    const produto = listaDeProdutos[index];
    inputNome.value = produto.nome;
    inputPreco.value = produto.preco;
    inputQuantidade.value = produto.quantidade;
    indiceEdicao = index;
    btnAcaoForm.textContent = "Salvar Alterações";
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.solicitarRemocao = function(index) {
    abrirModalConfirmacao("Tem certeza que deseja remover este produto do estoque?", () => {
        listaDeProdutos.splice(index, 1);
        salvarNoLocalStorage();
        renderizarTabela();
    });
};

btnLimparTabela.addEventListener("click", () => {
    if (listaDeProdutos.length === 0) {
        mostrarErro("O estoque já está vazio.");
        return;
    }
    abrirModalConfirmacao("Atenção: Deseja realmente limpar todos os registros do estoque?", () => {
        listaDeProdutos.length = 0;
        salvarNoLocalStorage();
        renderizarTabela();
    });
});

// Inicialização ao carregar a página
carregarDoLocalStorage();
renderizarTabela();
