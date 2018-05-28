import axios from 'axios'
const postAPI = axios.create({
  baseURL: 'http://localhost:3000'  //process.env.API_URL
});

const templates = {
  login: document.querySelector("#login").content,
  index: document.querySelector("#index").content,
  register: document.querySelector("#register").content
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
    const frag = document.importNode(templates.index, true);
    const logoutBtnEl = frag.querySelector(".index__logout-btn")


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
render(frag)
}
const token = localStorage.getItem('token');
if (token) {
    login(token);
     indexPage();
   } else {
    loginPage();
  }