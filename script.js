class Produto {
    #nome;
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {
        if (!nome || nome.trim() === "") {
            throw new Error("O nome do produto não pode estar em branco");
        }
        if (Number(preco) <= 0) {
            throw new Error("O preço deve ser maior que zero");
        }
        if (Number(quantidade) <= 0) {
            throw new Error("A quantidade deve ser maior que zero");
        }

        this.#nome = nome;
        this.#preco = Number(preco);
        this.#quantidade = Number(quantidade);
    }

    get nome() {
        return this.#nome;
    }

    get preco() {
        return this.#preco;
    }

    get quantidade() {
        return this.#quantidade;
    }

    calcularSubtotal() {
        return this.#preco * this.#quantidade;
    }
}

const listaDeProdutos = [];
const formProduto = document.getElementById("produto-form");
const btnLimparTabela = document.getElementById("limpar-tabela");

formProduto.addEventListener("submit", function (event) {
    event.preventDefault();
    
    const nomeInput = document.getElementById("nome").value;
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;

    try {
        const novoProduto = new Produto(nomeInput, precoInput, quantidadeInput);
        listaDeProdutos.push(novoProduto);
        renderizarTabela();
        formProduto.reset();
    } catch (erro) {
        alert(erro.message);
    }
});

function atualizarTotalEstoque() {
    const total = listaDeProdutos.reduce((acumulador, produto) => acumulador + produto.calcularSubtotal(), 0);
    
    const totalFormatado = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById("total-estoque").innerText = `Total em Estoque: ${totalFormatado}`;
}

function removerProduto(index) {
    listaDeProdutos.splice(index, 1);
    renderizarTabela();
}

btnLimparTabela.addEventListener("click", function() {
    listaDeProdutos.length = 0;
    renderizarTabela();
});

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    tabelaBody.innerHTML = "";

    listaDeProdutos.forEach((produto, index) => {
        const linha = document.createElement("tr");

        const precoFormatado = produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const subtotalFormatado = produto.calcularSubtotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>${precoFormatado}</td>
            <td>${produto.quantidade}</td>
            <td>${subtotalFormatado}</td>
            <td><button class="btn-remover" onclick="removerProduto(${index})">Remover</button></td>
        `;

        tabelaBody.appendChild(linha);
    });

    atualizarTotalEstoque();
}