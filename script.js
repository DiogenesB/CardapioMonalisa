// Estado do carrinho
let carrinho = [];
let produtosData = [];

// Elementos DOM
const carrinhoModal = document.getElementById('carrinho-modal');
const carrinhoBody = document.getElementById('carrinho-body');
const carrinhoCount = document.getElementById('carrinho-count');
const carrinhoTotal = document.getElementById('carrinho-total');
const abrirCarrinhoBtn = document.getElementById('abrir-carrinho');
const fecharCarrinhoBtn = document.getElementById('fechar-carrinho');
const finalizarBtn = document.getElementById('finalizar-pedido');
const backToTop = document.getElementById('backToTop');

// Número do WhatsApp (substitua pelo número real)
const WHATSAPP_NUMBER = '5555991871850';

// Carrega os produtos do JSON
fetch('produtos.json')
  .then(response => response.json())
  .then(data => {
    produtosData = data.categorias;
    renderizarCategorias(produtosData);
    renderizarCardapio(produtosData);
  })
  .catch(error => {
    console.error('Erro ao carregar cardápio:', error);
    document.getElementById('cardapio-container').innerHTML = 
      '<p style="text-align: center; color: #9B5A5A; padding: 3rem;">Erro ao carregar o cardápio. Tente novamente mais tarde.</p>';
  });

// Renderiza as categorias na navegação
function renderizarCategorias(categorias) {
  const lista = document.getElementById('categoria-lista');
  lista.innerHTML = '';
  
  categorias.forEach((cat, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#cat-${index}" class="categoria-link" data-categoria="${index}"><i class="fas ${cat.icone || 'fa-tag'}"></i> ${cat.nome}</a>`;
    lista.appendChild(li);
  });
}

// Renderiza o cardápio completo
function renderizarCardapio(categorias) {
  const container = document.getElementById('cardapio-container');
  container.innerHTML = '';
  
  categorias.forEach((categoria, idx) => {
    const secao = document.createElement('section');
    secao.className = 'categoria-section';
    secao.id = `cat-${idx}`;
    
    const titulo = document.createElement('h2');
    titulo.innerHTML = `<i class="fas ${categoria.icone || 'fa-tag'}"></i> ${categoria.nome}`;
    secao.appendChild(titulo);
    
    const grid = document.createElement('div');
    grid.className = 'itens-grid';
    
    categoria.itens.forEach(item => {
      const card = document.createElement('div');
      card.className = 'item-card';
      
      const precoFormatado = item.preco.toFixed(2).replace('.', ',');
      
      card.innerHTML = `
        <div class="item-header">
          <h3>${item.nome}</h3>
          <span class="item-preco">R$ ${precoFormatado}</span>
        </div>
        ${item.descricao ? `<p class="item-desc">${item.descricao}</p>` : ''}
        <button class="btn-add-carrinho" data-nome="${item.nome}" data-preco="${item.preco}">
          <i class="fas fa-plus"></i> Adicionar
        </button>
      `;
      
      grid.appendChild(card);
    });
    
    secao.appendChild(grid);
    container.appendChild(secao);
  });
  
  // Adiciona eventos aos botões de adicionar
  document.querySelectorAll('.btn-add-carrinho').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const nome = this.dataset.nome;
      const preco = parseFloat(this.dataset.preco);
      adicionarAoCarrinho(nome, preco);
      
      // Feedback visual no botão
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-check"></i> Adicionado';
      this.style.background = '#5D4037';
      this.style.transform = 'scale(0.98)';
      this.disabled = true;
      
      setTimeout(() => {
        this.innerHTML = originalText;
        this.style.background = '';
        this.style.transform = '';
        this.disabled = false;
      }, 800);
    });
  });
}

// Funções do carrinho
function adicionarAoCarrinho(nome, preco) {
  const itemExistente = carrinho.find(item => item.nome === nome);
  
  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({
      nome: nome,
      preco: preco,
      quantidade: 1
    });
  }
  
  atualizarCarrinho();
  
  // Animação no contador
  carrinhoCount.classList.add('update');
  setTimeout(() => {
    carrinhoCount.classList.remove('update');
  }, 300);
  
  // Feedback visual no celular (vibração se suportado)
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(50);
  }
}

function removerDoCarrinho(nome) {
  carrinho = carrinho.filter(item => item.nome !== nome);
  atualizarCarrinho();
  
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(30);
  }
}

function atualizarQuantidade(nome, novaQuantidade) {
  if (novaQuantidade <= 0) {
    removerDoCarrinho(nome);
    return;
  }
  
  const item = carrinho.find(item => item.nome === nome);
  if (item) {
    item.quantidade = novaQuantidade;
  }
  
  atualizarCarrinho();
}

function calcularTotal() {
  return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

function atualizarCarrinho() {
  // Atualiza contador
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  carrinhoCount.textContent = totalItens;
  
  // Atualiza total
  const total = calcularTotal();
  carrinhoTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  
  // Renderiza itens no modal
  renderizarItensCarrinho();
  
  // Salva no localStorage
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function renderizarItensCarrinho() {
  if (carrinho.length === 0) {
    carrinhoBody.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio</p>';
    return;
  }
  
  let html = '';
  
  carrinho.forEach(item => {
    const precoFormatado = item.preco.toFixed(2).replace('.', ',');
    const subtotal = (item.preco * item.quantidade).toFixed(2).replace('.', ',');
    
    html += `
      <div class="carrinho-item" data-nome="${item.nome}">
        <div class="carrinho-item-info">
          <div class="carrinho-item-nome">${item.nome}</div>
          <div class="carrinho-item-preco">R$ ${precoFormatado} · subtotal R$ ${subtotal}</div>
        </div>
        <div class="carrinho-item-quantidade">
          <button class="quantidade-btn" onclick="window.alterarQuantidade('${item.nome}', ${item.quantidade - 1})">−</button>
          <span class="quantidade-numero">${item.quantidade}</span>
          <button class="quantidade-btn" onclick="window.alterarQuantidade('${item.nome}', ${item.quantidade + 1})">+</button>
        </div>
        <button class="carrinho-item-remove" onclick="window.removerItem('${item.nome}')" aria-label="Remover item">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
  });
  
  carrinhoBody.innerHTML = html;
}

// Funções globais para os botões do carrinho
window.alterarQuantidade = function(nome, novaQuantidade) {
  atualizarQuantidade(nome, novaQuantidade);
};

window.removerItem = function(nome) {
  removerDoCarrinho(nome);
};

// Eventos do carrinho
abrirCarrinhoBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  carrinhoModal.classList.add('active');
  document.body.style.overflow = 'hidden';
});

fecharCarrinhoBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  carrinhoModal.classList.remove('active');
  document.body.style.overflow = '';
});

// Fecha o modal ao clicar fora
carrinhoModal.addEventListener('click', (e) => {
  if (e.target === carrinhoModal) {
    carrinhoModal.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Função para limpar o carrinho
function limparCarrinho() {
  carrinho = [];
  atualizarCarrinho();
  carrinhoModal.classList.remove('active');
  document.body.style.overflow = '';
}

// Finalizar pedido no WhatsApp e limpar carrinho - VERSÃO CORRIGIDA
finalizarBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (carrinho.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }
  
  let mensagem = 'Olá! Gostaria de fazer um pedido:%0A%0A';
  
  carrinho.forEach(item => {
    const precoFormatado = item.preco.toFixed(2).replace('.', ',');
    const subtotal = (item.preco * item.quantidade).toFixed(2).replace('.', ',');
    mensagem += `• ${item.quantidade}x ${item.nome} - R$ ${precoFormatado} (subtotal R$ ${subtotal})%0A`;
  });
  
  const total = calcularTotal().toFixed(2).replace('.', ',');
  mensagem += `%0A*Total: R$ ${total}*`;
  
  // Abre o WhatsApp
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensagem}`;
  
  // Tenta abrir o WhatsApp
  window.open(whatsappUrl, '_blank');
  
  // Limpa o carrinho
  limparCarrinho();
  
  // Feedback visual
  setTimeout(() => {
    alert('✅ Pedido enviado! Seu carrinho foi limpo.');
  }, 500);
});

// Scroll suave para âncoras
document.querySelectorAll('.categoria-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const navHeight = document.querySelector('.categoria-nav').offsetHeight;
      const targetPosition = targetElement.offsetTop - navHeight - 10;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Fecha o teclado se estiver aberto no mobile
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }
  });
});

// Botão voltar ao topo
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

backToTop.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Carrega carrinho do localStorage ao iniciar
const carrinhoSalvo = localStorage.getItem('carrinho');
if (carrinhoSalvo) {
  try {
    carrinho = JSON.parse(carrinhoSalvo);
    atualizarCarrinho();
  } catch (e) {
    console.error('Erro ao carregar carrinho:', e);
    localStorage.removeItem('carrinho');
  }
}

// Previne comportamento padrão de toque em botões no mobile
document.addEventListener('touchstart', (e) => {
  if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
    e.preventDefault();
  }
}, { passive: false });

// Adiciona evento de clique global para garantir que os botões funcionem
document.addEventListener('click', (e) => {
  const target = e.target;
  
  // Verifica se é um botão de adicionar
  if (target.classList.contains('btn-add-carrinho') || target.closest('.btn-add-carrinho')) {
    e.preventDefault();
    const btn = target.classList.contains('btn-add-carrinho') ? target : target.closest('.btn-add-carrinho');
    const nome = btn.dataset.nome;
    const preco = parseFloat(btn.dataset.preco);
    
    if (nome && preco) {
      adicionarAoCarrinho(nome, preco);
      
      // Feedback visual
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> Adicionado';
      btn.style.background = '#5D4037';
      btn.disabled = true;
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 800);
    }
  }
});