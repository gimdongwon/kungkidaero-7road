import axios from 'axios'
const postAPI = axios.create({
  baseURL: 'http://localhost:3000'  //process.env.API_URL
});

const templates = {
  login: document.querySelector("#login").content,
  index: document.querySelector("#index").content,
  register: document.querySelector("#register").content,
  item: document.querySelector("#item").content,
  indexItem: document.querySelector("#indexItem").content,
  commentsList: document.querySelector("#comments").content,
  commentsItem: document.querySelector("#comment-itme").content
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
      login(res.data.token);
      indexPage();
    })
  render(frag)
  document.querySelector(".register__go-btn").addEventListener('click', async e => {
      registerPage();
    });
  }

async function indexPage(){
    // const res = await postAPI.get('http://localhost:1234/users?_expand=user');
    const frag = document.importNode(templates.index, true);
     const res = await postAPI.get('/indexItem/')
      res.data.forEach(indexItem => {
        const fragItem = document.importNode(templates.indexItem, true)
        fragItem.querySelector(".index__item-img").src = indexItem.Imgurl;
        fragItem.querySelector(".index__item-title").textContent = indexItem.title
        fragItem.querySelector(".index__item-cost").textContent = indexItem.cost
        console.log(indexItem)
          const selectEl = fragItem.querySelector(".indexItem")
        selectEl.addEventListener('click', e => {
          itemPage();
        }); 
        frag.querySelector('.index').appendChild(fragItem);
      })
     const logoutBtnEl = frag.querySelector(".index__logout-btn")
    // frag.querySelector(".index__username").textContent = res.data.username;
       logoutBtnEl.addEventListener('click', e => {
            logout();
            loginPage();
          });
  render(frag);
  }





async function registerPage(){
  const frag = document.importNode(templates.register,true)
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
frag.querySelector(".register__back-btn").addEventListener('click', e=>{
  loginPage();
})
render(frag)
}

async function itemPage(){
  const frag = document.importNode(templates.item, true)
  const buyEl = frag.querySelector('.item__buy-btn')
  buyEl.addEventListener('click', async e=>{

  })
  frag.querySelector(".item__back-btn").addEventListener('click', e=>{
    indexPage();
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