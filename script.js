document.addEventListener('DOMContentLoaded', () => {

  const avisoLgpd = document.getElementById('banner-lgpd');
  const botaoAceitarLgpd = document.getElementById('aceitar-lgpd');
  const privacidadeAceita = localStorage.getItem('lgpd_aceito');

  if (!privacidadeAceita && avisoLgpd) {
    avisoLgpd.style.display = 'block';
  }

  if (botaoAceitarLgpd) {
    botaoAceitarLgpd.addEventListener('click', () => {
      localStorage.setItem('lgpd_aceito', 'true');
      if (avisoLgpd) avisoLgpd.style.display = 'none';
    });
  }

  const botoesAbas = document.querySelectorAll('.botao-aba');
  const paineisConteudo = document.querySelectorAll('.conteudo-aba');

  botoesAbas.forEach((aba, posicao) => {
    aba.addEventListener('click', () => {
      botoesAbas.forEach(b => b.classList.remove('ativo'));
      paineisConteudo.forEach(painel => painel.classList.remove('ativo'));

      aba.classList.add('ativo');
      if (paineisConteudo[posicao]) {
        paineisConteudo[posicao].classList.add('ativo');
      }

      if (posicao === 2) {
        let saldoAtual = localStorage.getItem('pontos_fidelidade') || '0';
        let campoPontos = document.getElementById('pontos-usuario');
        if (campoPontos) campoPontos.innerText = saldoAtual;
      }
    });
  });

  const gavetaCarrinho = document.getElementById('painel-carrinho');
  const acionarCarrinho = document.getElementById('carrinho-botao');
  const fecharCarrinho = document.getElementById('fechar-carrinho');
  const listaItensComanda = document.getElementById('itens-carrinho');
  const totalComandaValor = document.getElementById('preco-total-carrinho');
  const contadorBadge = document.querySelector('.contador-carrinho');
  const botoesAdicionarProduto = document.querySelectorAll('.adicionar-botao');

  let comandaItens = [];

  if (acionarCarrinho && gavetaCarrinho) {
    acionarCarrinho.addEventListener('click', () => gavetaCarrinho.classList.add('aberto'));
  }
  
  if (fecharCarrinho && gavetaCarrinho) {
    fecharCarrinho.addEventListener('click', () => gavetaCarrinho.classList.remove('aberto'));
  }
  
  if (gavetaCarrinho) {
    gavetaCarrinho.addEventListener('click', (evt) => {
      if (evt.target === gavetaCarrinho) gavetaCarrinho.classList.remove('aberto');
    });
  }

  botoesAdicionarProduto.forEach((btn) => {
    btn.addEventListener('click', (evento) => {
      let blocoProduto = evento.target.closest('.cartao-produto');
      let nomeProduto = blocoProduto.querySelector('h3').innerText;
      let precoTexto = blocoProduto.querySelector('.preco').innerText;
      let valorUnitario = parseFloat(precoTexto.replace('R$', '').replace(',', '.').trim());

      inserirNaComanda(nomeProduto, valorUnitario);
    });
  });

  function inserirNaComanda(titulo, preco) {
    let jaTemNoCarrinho = comandaItens.find(item => item.titulo === titulo);

    if (jaTemNoCarrinho) {
      jaTemNoCarrinho.quantidade += 1;
    } else {
      comandaItens.push({ titulo, preco, quantidade: 1 });
    }

    refrescarCarrinho();
  }

  function refrescarCarrinho() {
    if (!listaItensComanda) return;

    listaItensComanda.innerHTML = '';

    if (comandaItens.length === 0) {
      listaItensComanda.innerHTML = '<p class="mensagem-carrinho-vazio">A sua comanda ainda está vazia.</p>';
      if (totalComandaValor) totalComandaValor.innerText = 'R$ 0,00';
      if (contadorBadge) contadorBadge.innerText = '0';
      return;
    }

    let somaTotal = 0;
    let qtdItensTotal = 0;

    comandaItens.forEach((artigo, idx) => {
      somaTotal += artigo.preco * artigo.quantidade;
      qtdItensTotal += artigo.quantidade;

      let linhaItem = document.createElement('div');
      linhaItem.classList.add('item-carrinho');
      linhaItem.innerHTML = `
        <div>
          <div class="titulo-item-carrinho">${artigo.titulo}</div>
          <div class="preco-item-carrinho">R$ ${artigo.preco.toFixed(2).replace('.', ',')}</div>
        </div>
        <div class="controles-item-carrinho">
          <button class="botao-qtd" onclick="alterarQuantidade(${idx}, -1)">-</button>
          <span>${artigo.quantidade}</span>
          <button class="botao-qtd" onclick="alterarQuantidade(${idx}, 1)">+</button>
        </div>
      `;
      listaItensComanda.appendChild(linhaItem);
    });

    if (totalComandaValor) totalComandaValor.innerText = `R$ ${somaTotal.toFixed(2).replace('.', ',')}`;
    if (contadorBadge) contadorBadge.innerText = qtdItensTotal;
  }

  window.alterarQuantidade = (index, variacao) => {
    comandaItens[index].quantidade += variacao;
    if (comandaItens[index].quantidade <= 0) {
      comandaItens.splice(index, 1);
    }
    refrescarCarrinho();
  };

  const formFinalizacao = document.getElementById('formulario-pedido');

  if (formFinalizacao) {
    formFinalizacao.addEventListener('submit', (e) => {
      e.preventDefault();

      if (comandaItens.length === 0) {
        alert('Atenção: a comanda ainda está vazia!');
        return;
      }

      let campoNome = document.getElementById('nome-cliente');
      let nomeCliente = campoNome ? campoNome.value : 'Cliente';

      let valorGeral = comandaItens.reduce((acumulado, produto) => acumulado + (produto.preco * produto.quantidade), 0);
      let pontosGuardados = parseInt(localStorage.getItem('pontos_fidelidade') || '0');
      let pontosAdicionados = parseInt(valorGeral);
      
      localStorage.setItem('pontos_fidelidade', pontosGuardados + pontosAdicionados);

      let avisoStatus = document.getElementById('mensagem-status');
      if (avisoStatus) {
        avisoStatus.innerText = `Pedido de ${nomeCliente} enviado para a cozinha! Total: R$ ${valorGeral.toFixed(2).replace('.', ',')}`;
      }

      alert(`Pedido enviado com sucesso!\nGanhaste +${pontosAdicionados} pontos no clube de fidelidade.`);

      comandaItens = [];
      refrescarCarrinho();
      formFinalizacao.reset();
      if (gavetaCarrinho) gavetaCarrinho.classList.remove('aberto');
    });
  }

});