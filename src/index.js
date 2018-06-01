import axios from 'axios'
const postAPI = axios.create({
  baseURL: process.env.API_URL
});

const templates = {
  login: document.querySelector("#login").content,
  index: document.querySelector("#index").content,
  register: document.querySelector("#register").content,
  item: document.querySelector("#item").content,
  indexItem: document.querySelector("#indexItem").content,
  commentsList: document.querySelector("#comments").content,
  commentsItem: document.querySelector("#comment-item").content,
  cart: document.querySelector("#cart").content,
  itemItem: document.querySelector("#item-item").content,
  cartItem: document.querySelector("#cart-item").content,
};

   function login(token) {
      localStorage.setItem('token', token);
      postAPI.defaults.headers['Authorization'] = `Bearer ${token}`;
    }
  
  function logout() {
      localStorage.removeItem('token');
      delete postAPI.defaults.headers['Authorization'];
    }

const rootEl = document.querySelector(".root");

function render(frag) {
    rootEl.textContent = '';
    rootEl.appendChild(frag);
  }

async function loginPage() {
    const frag = document.importNode(templates.login, true);
    const formEl = frag.querySelector('.login__form');
    
    formEl.addEventListener('submit', async e => {
        e.preventDefault();
        const payload = {
          username: e.target.elements.username.value,
          password: e.target.elements.password.value,
          };
      const res = await postAPI.post('/users/login', payload);
      login(res.data.token)
      alert("로그인에 성공하였습니다 환영합니다!")
      indexPage();
  })
  render(frag)
  document.querySelector(".register__go-btn").addEventListener('click', async e => {
      registerPage();
    });
  }

async function registerPage() {
  const frag = document.importNode(templates.register, true)
  const formEl = frag.querySelector('.register__form')
  formEl.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      username: e.target.elements.username.value,
      password: e.target.elements.password.value,
    };
    const res = await postAPI.post('/users/register', payload);
    login(res.data.token);
    loginPage();
  })
  frag.querySelector(".register__back-btn").addEventListener('click', e => {
    loginPage();
  })
  render(frag)
}

async function indexPage(){
    // const res = await postAPI.get('http://localhost:1234/users?_expand=user');
    const frag = document.importNode(templates.index, true);
  const res = await postAPI.get(`/indexItems/`)
      res.data.forEach(indexItem => {
        const fragItem = document.importNode(templates.indexItem, true)

        fragItem.querySelector(".index__item-img").src = indexItem.Imgurl;
        fragItem.querySelector(".index__item-title").textContent = `상품이름 : ` + indexItem.title
        fragItem.querySelector(".index__item-cost").textContent = `상품 가격 : ` + indexItem.cost
          const selectEl = fragItem.querySelector(".indexItem")
        selectEl.addEventListener('click', e => {
          itemPage(indexItem.id);
        }); 
        frag.querySelector('.index').appendChild(fragItem);
      })
     const logoutBtnEl = frag.querySelector(".index__logout-btn")
    // frag.querySelector(".index__username").textContent = res.data.username;
       logoutBtnEl.addEventListener('click', e => {
            logout();
            loginPage();
          });
      const cartBtn = frag.querySelector(".index__cart-btn")
      cartBtn.addEventListener('click', async e=>{
        cartPage()
      })
  render(frag);
  }


async function itemPage(id){
  const res = await postAPI.get(`/indexItems/${id}`)
  const frag = document.importNode(templates.itemItem, true)
  const buyEl = frag.querySelector('.item__buy-btn');
  const formEl = frag.querySelector('.item__form');
    frag.querySelector(".item-img").src = res.data.Imgurl;
    frag.querySelector(".item-title").textContent = res.data.title;
    frag.querySelector(".item-cost").textContent = res.data.cost;
  
  formEl.addEventListener('submit', async e=>{
  e.preventDefault();
  const payload ={
    amount: e.target.elements.amount.value,
    color: e.target.elements.color.value
  }
    const res = await postAPI.post(`indexItems/${id}/carts`, payload)
    cartPage();
  });  
    frag.querySelector(".item__back-btn").addEventListener('click', e=>{
      indexPage();
    })

    if (localStorage.getItem('token')) {
    const commentsFragment = document.importNode(templates.commentsList, true);
    const commentsRes = await postAPI.get(`/indexItem/${id}/comments`);
    commentsRes.data.forEach(comment => {
      const itemFragment = document.importNode(templates.commentsItem, true);
      const bodyEl = itemFragment.querySelector('.comment-item__body');
      const removeButtonEl = itemFragment.querySelector('.comment-item__remove-btn');
      bodyEl.textContent = comment.body;
      // itemFragment.querySelector('.comment-item__body').textContent = comment.body;
      commentsFragment.querySelector('.comments__list').appendChild(itemFragment);
      removeButtonEl.addEventListener('click', async e => {
        // p 태그와 button 태그 삭제
        bodyEl.remove();
        removeButtonEl.remove();  
        // delete 요청 보내기
        const res = await postAPI.delete(`/comments/${comment.id}`)
        // 만약 요청이 실패했을 경우 원상 복구 (생략)
      })
    })
      const formEl = commentsFragment.querySelector('.comments__form');
        formEl.addEventListener('submit', async e => {
          e.preventDefault();
          const payload = {
           body: e.target.elements.body.value
              };
          const res = await postAPI.post(`/indexItem/${id}/comments`, payload);
            itemPage(id);
          });
    frag.appendChild(commentsFragment);
  }
  render(frag)
}


async function cartPage(){
  
  const frag = document.importNode(templates.cart, true)
  const pEl = frag.querySelector(".cart-sum")
  const backEl = frag.querySelector(".cart-back")
  let sum = [];
  let sumCost;
  // if (localStorage.getItem('token')) {
  const res = await postAPI.get(`/carts?_expand=indexItem`)
  backEl.addEventListener("click", e => {
    indexPage();
  }); 
  
    res.data.forEach(cartItem=>{
      
      const fragment = document.importNode(templates.cartItem, true);
      const bodyEl = fragment.querySelector(".cart-item");
      const removeButtonEl = fragment.querySelector(".cart__remove-btn");
      // console.log(bodyEl)
      fragment.querySelector(".cart__item-img").src = cartItem.indexItem.Imgurl;
      fragment.querySelector(".cart__item-title").textContent = "상품 이름 : " + cartItem.indexItem.title;
      fragment.querySelector(".cart__item-color").textContent = "색상 : " + cartItem.color;
      fragment.querySelector(".cart__item-amount").textContent =`수량 : `+ cartItem.amount;
      fragment.querySelector(".cart__item-cost").textContent = `가격 : ` + cartItem.indexItem.cost;
      fragment.querySelector(".cart__item-userId").textContent = `주문 아이디:` + cartItem.userId;
      sumCost = cartItem.indexItem.cost * cartItem.amount;
      sum.push(sumCost);
      sumCost = 0;
      for (let i = 0; i < sum.length; i++) {
        sumCost += sum[i]
      }
      pEl.textContent = `총 결제 금액 : ${sumCost}원`;
      
      frag.querySelector(".cart").appendChild(fragment);
      
      
      removeButtonEl.addEventListener("click", async e => {
        bodyEl.remove();
        removeButtonEl.remove();
        const res = await postAPI.delete(`/carts/${cartItem.id}`)
        cartPage()
        
      });
    
    });
  
  const payBtn = frag.querySelector(".pay")
  payBtn.addEventListener('click', async e=>{
    alert('결제가 완료되었습니다!')
    indexPage()
  })
  render(frag)
}


const token = localStorage.getItem('token');
if (token) {
    login(token);
     indexPage();
   } else {
    loginPage();
  }