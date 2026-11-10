const products = [
  {id:1,name:'Refrigerante cola 2L',category:'Bebidas',price:11,stock:12},
  {id:2,name:'Refrigerante cola 600ml',category:'Bebidas',price:6,stock:15},
  {id:3,name:'Refrigerante cola lata',category:'Bebidas',price:4.5,stock:20},
  {id:4,name:'Guaraná 2L',category:'Bebidas',price:9,stock:10},
  {id:5,name:'Refrigerante laranja 2L',category:'Bebidas',price:9,stock:8},
  {id:6,name:'Suco 1L',category:'Bebidas',price:7,stock:10},
  {id:7,name:'Água 500ml',category:'Bebidas',price:2.5,stock:30},
  {id:8,name:'Água com gás 500ml',category:'Bebidas',price:3.5,stock:15},
  {id:9,name:'Energético 473ml',category:'Bebidas',price:10,stock:8},
  {id:10,name:'Chá gelado 450ml',category:'Bebidas',price:5.5,stock:10},
  {id:11,name:'Chocolate tipo wafer',category:'Doces',price:6,stock:15},
  {id:12,name:'Barra de chocolate',category:'Doces',price:7.5,stock:12},
  {id:13,name:'Bala de iogurte (unidade)',category:'Doces',price:0.25,stock:60},
  {id:14,name:'Pirulito (unidade)',category:'Doces',price:0.75,stock:40},
  {id:15,name:'Paçoca (unidade)',category:'Doces',price:0.75,stock:40},
  {id:16,name:'Biscoito recheado',category:'Doces',price:3.5,stock:18},
  {id:17,name:'Doce de leite',category:'Doces',price:4.5,stock:10},
  {id:18,name:'Chiclete',category:'Doces',price:1,stock:30},
  {id:19,name:'Jujuba',category:'Doces',price:2.5,stock:15},
  {id:20,name:'Pé de moleque',category:'Doces',price:1.5,stock:25},
  {id:21,name:'Salgadinho de milho',category:'Salgados',price:3.5,stock:20},
  {id:22,name:'Batata chips',category:'Salgados',price:5,stock:15},
  {id:23,name:'Amendoim torrado',category:'Salgados',price:4,stock:12},
  {id:24,name:'Pipoca para micro-ondas',category:'Salgados',price:5.5,stock:10},
  {id:25,name:'Salgadinho de queijo',category:'Salgados',price:3.5,stock:18},
  {id:26,name:'Biscoito salgado',category:'Salgados',price:4,stock:14},
  {id:27,name:'Amendoim japonês',category:'Salgados',price:5,stock:10},
  {id:28,name:'Torresmo em pacote',category:'Salgados',price:6,stock:8},
  {id:29,name:'Salgadinho de cebola',category:'Salgados',price:3.5,stock:15},
  {id:30,name:'Milho torrado',category:'Salgados',price:4,stock:12}
];

const money = value => value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const defaultStock = Object.fromEntries(products.map(p=>[p.id,p.stock]));
let stock = readStorage('vaquinha_stock',defaultStock);
let cart = readStorage('vaquinha_cart',{});
let currentCategory = 'Todos';
let toastTimer;

function readStorage(key,fallback){
  try { const value=localStorage.getItem(key); return value?JSON.parse(value):structuredClone(fallback); }
  catch { return structuredClone(fallback); }
}
function save(){localStorage.setItem('vaquinha_stock',JSON.stringify(stock));localStorage.setItem('vaquinha_cart',JSON.stringify(cart));}
function showToast(message){
  const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400);
}
function showPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(name+'Page').classList.add('active');
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===name || (name==='products' && b.dataset.category===currentCategory)));
  document.getElementById('sidebar').classList.remove('open');
  if(name==='products')renderProducts();
  if(name==='stock')renderStock();
  if(name==='cart')renderCart();
}
function showCategory(category){
  currentCategory=category;
  document.getElementById('productsTitle').textContent=category==='Todos'?'Todos os produtos':category;
  document.getElementById('productSearch').value='';
  showPage('products');
}
function renderProducts(){
  const query=document.getElementById('productSearch').value.trim().toLocaleLowerCase('pt-BR');
  const list=products.filter(p=>(currentCategory==='Todos'||p.category===currentCategory)&&p.name.toLocaleLowerCase('pt-BR').includes(query));
  const grid=document.getElementById('productGrid');grid.innerHTML='';
  if(!list.length){grid.innerHTML='<div class="empty-state">Nenhum produto encontrado.</div>';return;}
  list.forEach(p=>{
    const qty=Number(stock[p.id]??0);
    const card=document.createElement('article');card.className='product-card';
    card.innerHTML=`<span class="product-category">${p.category}</span><h3>${p.name}</h3><div class="product-price">${money(p.price)}</div><span class="product-stock">${qty>0?`${qty} unidade(s) disponível(is)`:'Fora de estoque'}</span><button ${qty<=0?'disabled':''}>${qty>0?'Adicionar ao carrinho':'Indisponível'}</button>`;
    card.querySelector('button').addEventListener('click',()=>addToCart(p.id));
    grid.appendChild(card);
  });
}
function addToCart(id){
  const available=Number(stock[id]??0), current=Number(cart[id]??0);
  if(current>=available){showToast('Quantidade máxima disponível atingida.');return;}
  cart[id]=current+1;save();updateCounts();renderProducts();showToast('Produto adicionado ao carrinho.');
}
function changeQuantity(id,delta){
  const next=(Number(cart[id])||0)+delta;
  if(next<=0)delete cart[id];
  else if(next>Number(stock[id]??0)){showToast('Não há estoque suficiente.');return;}
  else cart[id]=next;
  save();updateCounts();renderCart();
}
function removeFromCart(id){delete cart[id];save();updateCounts();renderCart();showToast('Produto removido.');}
function updateCounts(){
  const count=Object.values(cart).reduce((sum,n)=>sum+Number(n),0);
  document.getElementById('headerCartCount').textContent=count;
  document.getElementById('sideCartCount').textContent=count;
}
function renderCart(){
  const container=document.getElementById('cartItems');container.innerHTML='';
  const entries=Object.entries(cart).filter(([,q])=>Number(q)>0);
  if(!entries.length)container.innerHTML='<div class="empty-state">Seu carrinho está vazio. Escolha alguns produtos para começar.</div>';
  let total=0,units=0;
  entries.forEach(([id,quantity])=>{
    const p=products.find(item=>item.id===Number(id));if(!p)return;
    const q=Number(quantity);total+=p.price*q;units+=q;
    const item=document.createElement('article');item.className='cart-item';
    item.innerHTML=`<div><h3>${p.name}</h3><p>${money(p.price)} por unidade</p><div class="quantity"><button aria-label="Diminuir quantidade">−</button><strong>${q}</strong><button aria-label="Aumentar quantidade">+</button></div></div><div><button class="remove-button">Remover</button><p><strong>${money(p.price*q)}</strong></p></div>`;
    const buttons=item.querySelectorAll('.quantity button');
    buttons[0].addEventListener('click',()=>changeQuantity(p.id,-1));
    buttons[1].addEventListener('click',()=>changeQuantity(p.id,1));
    item.querySelector('.remove-button').addEventListener('click',()=>removeFromCart(p.id));
    container.appendChild(item);
  });
  document.getElementById('cartUnits').textContent=units;
  document.getElementById('cartTotal').textContent=money(total);
}
function renderStock(){
  const query=document.getElementById('stockSearch').value.trim().toLocaleLowerCase('pt-BR');
  const filter=document.getElementById('stockFilter').value;
  const list=products.filter(p=>p.name.toLocaleLowerCase('pt-BR').includes(query)).filter(p=>{
    const available=Number(stock[p.id]??0)>0;
    return filter==='all'||(filter==='available'&&available)||(filter==='unavailable'&&!available);
  });
  const container=document.getElementById('stockList');container.innerHTML='';
  if(!list.length){container.innerHTML='<div class="empty-state">Nenhum produto encontrado.</div>';return;}
  list.forEach(p=>{
    const qty=Number(stock[p.id]??0),row=document.createElement('div');row.className='stock-row';
    row.innerHTML=`<div><strong>${p.name}</strong><small>${p.category} · ${qty} unidade(s)</small></div><span class="status ${qty<=0?'out':''}">${qty>0?'Disponível':'Fora de estoque'}</span>`;
    container.appendChild(row);
  });
}
document.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>showPage(button.dataset.page)));
document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>showCategory(button.dataset.category)));
document.getElementById('productSearch').addEventListener('input',renderProducts);
document.getElementById('stockSearch').addEventListener('input',renderStock);
document.getElementById('stockFilter').addEventListener('change',renderStock);
document.getElementById('menuToggle').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
document.getElementById('checkoutButton').addEventListener('click',()=>{
  if(!Object.keys(cart).length){showToast('Seu carrinho está vazio.');return;}
  alert('Consulta do carrinho:\n\n'+Object.entries(cart).map(([id,q])=>{const p=products.find(x=>x.id===Number(id));return `${p.name} - ${q} x ${money(p.price)} = ${money(p.price*q)}`;}).join('\n')+'\n\nTotal estimado: '+document.getElementById('cartTotal').textContent+'\n\nPagamento e retirada presencial na loja. Esta consulta não confirma reserva nem venda.');
});
updateCounts();renderProducts();renderCart();
