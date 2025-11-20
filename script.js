// Student Name: Tashay Dorma
//Student ID: 2409683
//Assignment: Graded Lab 3
//Module Code: CIT2011
//Date: November 21, 2025 
const TAX_RATE = 0.10;

let cart = []; 

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const cartToggle = $('#cartToggle');
const cartCount = $('#cartCount');
const cartPanel = $('#cartPanel');
const cartBody = $('#cartBody');
const cartSubtotalEl = $('#cartSubtotal');
const cartTaxEl = $('#cartTax');
const cartTotalEl = $('#cartTotal');
const clearCartBtn = $('#clearCart');
const checkoutBtn = $('#checkoutBtn');

const checkoutSection = $('#checkout');
const checkoutForm = $('#checkoutForm');
const invoiceSection = $('#invoice');
const invoiceNumberEl = $('#invoiceNumber');
const invoiceDateEl = $('#invoiceDate');
const invoiceNameEl = $('#invoiceName');
const invoiceBody = $('#invoiceBody');
const invSubtotalEl = $('#invSubtotal');
const invTaxEl = $('#invTax');
const invTotalEl = $('#invTotal');
const printInvoiceBtn = $('#printInvoice');
const backToShopBtn = $('#backToShop');

function formatJMD(n){ return Number(n).toLocaleString('en-JM'); }

function findCartItem(name){ return cart.find(i => i.name === name); }

function addToCartFromCard(cardEl){
  const name = cardEl.dataset.name;
  const price = Number(cardEl.dataset.price);
  addToCart(name, price);
}

function addToCart(name, price){
  const existing = findCartItem(name);
  if(existing){
    existing.qty += 1;
  } else {
    cart.push({name, price, qty:1});
  }
  updateCartUI();
  showCartPanel(true);
}

function removeCartItem(name){
  cart = cart.filter(i => i.name !== name);
  updateCartUI();
}

function changeQty(name, delta){
  const it = findCartItem(name);
  if(!it) return;
  it.qty += delta;
  if(it.qty < 1) removeCartItem(name);
  updateCartUI();
}

function clearCart(){
  cart = [];
  updateCartUI();
}

function updateCartUI(){
  const totalItems = cart.reduce((s,i)=>s+i.qty,0);
  cartCount.textContent = totalItems;

  cartBody.innerHTML = '';
  let subtotal = 0;
  cart.forEach(item => {
    const row = document.createElement('tr');

    const sub = item.price * item.qty;
    subtotal += sub;

    row.innerHTML = `
      <td>${item.name}</td>
      <td>JMD ${formatJMD(item.price)}</td>
      <td>
        <button class="qtyBtn" data-action="dec" data-name="${item.name}">-</button>
        <span class="qty">${item.qty}</span>
        <button class="qtyBtn" data-action="inc" data-name="${item.name}">+</button>
      </td>
      <td>JMD ${formatJMD(sub)}</td>
      <td><button class="removeBtn" data-name="${item.name}">Remove</button></td>
    `;
    cartBody.appendChild(row);
  });

  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  cartSubtotalEl.textContent = formatJMD(subtotal);
  cartTaxEl.textContent = formatJMD(tax);
  cartTotalEl.textContent = formatJMD(total);

  $$('.qtyBtn').forEach(btn => btn.addEventListener('click', (e)=>{
    const name = e.currentTarget.dataset.name;
    const action = e.currentTarget.dataset.action;
    changeQty(name, action === 'inc' ? 1 : -1);
  }));
  $$('.removeBtn').forEach(btn => btn.addEventListener('click', (e)=>{
    removeCartItem(e.currentTarget.dataset.name);
  }));
}

function showCartPanel(open){
  if(open){
    cartPanel.classList.remove('hidden');
    cartToggle.setAttribute('aria-expanded','true');
  } else {
    cartPanel.classList.add('hidden');
    cartToggle.setAttribute('aria-expanded','false');
  }
}

function attachAddButtons(){
  $$('.product-card .addBtn').forEach(btn => {
    btn.addEventListener('click', (e)=>{
      const card = e.currentTarget.closest('.product-card');
      addToCartFromCard(card);
    });
  });
}

function startCheckout(){
  if(cart.length === 0){
    alert('Your cart is empty.');
    return;
  }
  checkoutSection.classList.remove('hidden');
  checkoutSection.scrollIntoView({behavior:'smooth'});
}

function generateInvoice(customer){
  const orderNum = 'MS' + Date.now().toString().slice(-6);
  invoiceNumberEl.textContent = orderNum;
  invoiceDateEl.textContent = new Date().toLocaleString();
  invoiceNameEl.textContent = customer.name;

  invoiceBody.innerHTML = '';
  let subtotal = 0;
  cart.forEach(item => {
    const sub = item.price * item.qty;
    subtotal += sub;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${item.name}</td><td>JMD ${formatJMD(item.price)}</td><td>${item.qty}</td><td>JMD ${formatJMD(sub)}</td>`;
    invoiceBody.appendChild(tr);
  });

  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  invSubtotalEl.textContent = formatJMD(subtotal);
  invTaxEl.textContent = formatJMD(tax);
  invTotalEl.textContent = formatJMD(total);

  invoiceSection.classList.remove('hidden');
  invoiceSection.scrollIntoView({behavior:'smooth'});
}

document.addEventListener('DOMContentLoaded', ()=>{
  attachAddButtons();
  updateCartUI();

  cartToggle.addEventListener('click', ()=> {
    const isOpen = !cartPanel.classList.contains('hidden');
    showCartPanel(isOpen ? false : true);
  });

  clearCartBtn.addEventListener('click', ()=>{
    if(confirm('Clear all items from cart?')) clearCart();
  });

  checkoutBtn.addEventListener('click', startCheckout);

  checkoutForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const customer = {
      name: $('#custName').value.trim(),
      email: $('#custEmail').value.trim(),
      address: $('#custAddress').value.trim(),
      amountPaid: Number($('#custAmount').value)
    };

    const total = Number(cartTotalEl.textContent.replace(/,/g,'')) || 0;
    const amountPaid = customer.amountPaid || 0;
    if(amountPaid < total){
      if(!confirm('Amount paid is less than total. Continue and record invoice as partial payment?')) return;
    }

    generateInvoice(customer);
    clearCart();
    checkoutSection.classList.add('hidden');
  });

  $('#cancelCheckout').addEventListener('click', ()=>{
    checkoutSection.classList.add('hidden');
  });

  printInvoiceBtn.addEventListener('click', ()=> window.print());

  backToShopBtn.addEventListener('click', ()=>{
    invoiceSection.classList.add('hidden');
    window.location.href = '#shop';
  });

});
