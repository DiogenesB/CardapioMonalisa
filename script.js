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

// Número do WhatsApp
const WHATSAPP_NUMBER = '5555999999999';

// Carrega produtos
fetch('produtos.json')
  .then(response => response.json())
  .then(data => {
    produtosData = data.categorias;
    renderizarCategorias(produtosData);
    renderizarCardapio(produtosData);
  })
  .catch(error => {
    console.error('Erro:', error);
    document.getElementById('cardapio-container').innerHTML = 
      '<p style="text-align: center; color: #9B5A5A; padding: 2rem;">Erro ao carregar o cardápio</p>';
  });

// Renderiza categorias
function renderizarCategorias(categorias) {
  const lista = document.getElementById('categoria-lista');
  lista.innerHTML = '';
  
  categorias.forEach((cat, index) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#cat-${index}`;
    link.className = 'categoria-link';
    link.innerHTML = `<i class="fas ${cat.icone || 'fa-tag'}"></i> ${cat.nome}`;
    
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
      }
    });
    
    li.appendChild(link);
    lista.appendChild(li);
  });
}

// Renderiza cardápio
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
  
  // Adiciona eventos aos botões
  adicionarEventosBotoes();
}

function adicionarEventosBotoes() {
  document.querySelectorAll('.btn-add-carrinho').forEach(btn => {
    btn.removeEventListener('click', handleAddToCart);
    btn.addEventListener('click', handleAddToCart);
  });
}

function handleAddToCart(e) {
  e.preventDefault();
  const btn = e.currentTarget;
  const nome = btn.dataset.nome;
  const preco = parseFloat(btn.dataset.preco);
  
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

// Funções do carrinho
function adicionarAoCarrinho(nome, preco) {
  const itemExistente = carrinho.find(item => item.nome === nome);
  
  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({ nome, preco, quantidade: 1 });
  }
  
  atualizarCarrinho();
  
  carrinhoCount.classList.add('update');
  setTimeout(() => {
    carrinhoCount.classList.remove('update');
  }, 300);
}

function removerDoCarrinho(nome) {
  carrinho = carrinho.filter(item => item.nome !== nome);
  atualizarCarrinho();
}

function atualizarQuantidade(nome, novaQuantidade) {
  if (novaQuantidade <= 0) {
    removerDoCarrinho(nome);
    return;
  }
  
  const item = carrinho.find(item => item.nome === nome);
  if (item) item.quantidade = novaQuantidade;
  
  atualizarCarrinho();
}

function calcularTotal() {
  return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

function atualizarCarrinho() {
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  carrinhoCount.textContent = totalItens;
  
  const total = calcularTotal();
  carrinhoTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  
  renderizarItensCarrinho();
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
      <div class="carrinho-item">
        <div class="carrinho-item-info">
          <div class="carrinho-item-nome">${item.nome}</div>
          <div class="carrinho-item-preco">R$ ${precoFormatado} | R$ ${subtotal}</div>
        </div>
        <div class="carrinho-item-quantidade">
          <button class="quantidade-btn" onclick="window.alterarQuantidade('${item.nome}', ${item.quantidade - 1})">−</button>
          <span class="quantidade-numero">${item.quantidade}</span>
          <button class="quantidade-btn" onclick="window.alterarQuantidade('${item.nome}', ${item.quantidade + 1})">+</button>
        </div>
        <button class="carrinho-item-remove" onclick="window.removerItem('${item.nome}')">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
  });
  
  carrinhoBody.innerHTML = html;
}

// Funções globais
window.alterarQuantidade = atualizarQuantidade;
window.removerItem = removerDoCarrinho;

// Eventos do carrinho
abrirCarrinhoBtn.addEventListener('click', () => {
  carrinhoModal.classList.add('active');
  document.body.style.overflow = 'hidden';
});

fecharCarrinhoBtn.addEventListener('click', () => {
  carrinhoModal.classList.remove('active');
  document.body.style.overflow = '';
});

carrinhoModal.addEventListener('click', (e) => {
  if (e.target === carrinhoModal) {
    carrinhoModal.classList.remove('active');
    document.body.style.overflow = '';
  }
});

function limparCarrinho() {
  carrinho = [];
  atualizarCarrinho();
  carrinhoModal.classList.remove('active');
  document.body.style.overflow = '';
}

// Finalizar pedido
finalizarBtn.addEventListener('click', () => {
  if (carrinho.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }
  
  let mensagem = 'Olá! Gostaria de fazer um pedido:%0A%0A';
  
  carrinho.forEach(item => {
    const precoFormatado = item.preco.toFixed(2).replace('.', ',');
    const subtotal = (item.preco * item.quantidade).toFixed(2).replace('.', ',');
    mensagem += `• ${item.quantidade}x ${item.nome} - R$ ${precoFormatado} (R$ ${subtotal})%0A`;
  });
  
  const total = calcularTotal().toFixed(2).replace('.', ',');
  mensagem += `%0A*Total: R$ ${total}*`;
  
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensagem}`, '_blank');
  limparCarrinho();
});

// Back to top
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 300);
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Carrega carrinho salvo
try {
  const carrinhoSalvo = localStorage.getItem('carrinho');
  if (carrinhoSalvo) {
    carrinho = JSON.parse(carrinhoSalvo);
    atualizarCarrinho();
  }
} catch (e) {
  localStorage.removeItem('carrinho');
}