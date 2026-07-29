// Comportamentos compartilhados por todas as páginas.
const corpo = document.body;
const cabecalho = document.querySelector(".cabecalho");
const botaoTema = document.querySelector(".tema-botao");
const iconeTema = document.querySelector(".tema-icone");
const botaoMenu = document.querySelector(".menu-botao");
const menu = document.querySelector(".menu");
const ano = document.querySelector("#ano");

function aplicarTema(tema) {
  const escuro = tema === "dark";
  corpo.classList.toggle("dark", escuro);

  if (iconeTema) iconeTema.textContent = escuro ? "☀" : "☾";
  if (botaoTema) {
    botaoTema.setAttribute("aria-label", escuro ? "Ativar tema claro" : "Ativar tema escuro");
  }
}

const temaSalvo = localStorage.getItem("tema");
aplicarTema(temaSalvo || "dark");

botaoTema?.addEventListener("click", () => {
  const novoTema = corpo.classList.contains("dark") ? "light" : "dark";
  localStorage.setItem("tema", novoTema);
  aplicarTema(novoTema);
});

botaoMenu?.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");
  botaoMenu.setAttribute("aria-expanded", aberto);
  botaoMenu.textContent = aberto ? "✕" : "☰";
});

menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("aberto");
    botaoMenu?.setAttribute("aria-expanded", "false");
    if (botaoMenu) botaoMenu.textContent = "☰";
  });
});

if (ano) ano.textContent = new Date().getFullYear();

// Ações da navbar: busca expansível e perfil.
const folhaPrincipal = document.querySelector('link[href$="style.css"]')?.getAttribute("href") || "style.css";
const caminhoBase = folhaPrincipal.replace("style.css", "");
const acoesNav = document.createElement("div");
acoesNav.className = "nav-acoes";
acoesNav.innerHTML = `
  <div class="busca">
    <label class="sr-only" for="busca-site">Pesquisar conteúdo</label>
    <input class="busca-campo" id="busca-site" type="search" placeholder="Projetos, tecnologias..." autocomplete="off">
    <button class="busca-botao" type="button" aria-label="Abrir pesquisa">⌕</button>
  </div>
  <a class="perfil-mini" href="${caminhoBase}sobre/index.html" aria-label="Abrir perfil">
    <img src="${caminhoBase}assets/foto-github-matheus.png" alt="">
  </a>
`;

if (botaoTema?.parentElement) {
  botaoTema.parentElement.insertBefore(acoesNav, botaoTema);
}

const busca = acoesNav.querySelector(".busca");
const campoBusca = acoesNav.querySelector(".busca-campo");
const botaoBusca = acoesNav.querySelector(".busca-botao");

botaoBusca?.addEventListener("click", () => {
  const aberta = busca.classList.toggle("aberta");
  botaoBusca.setAttribute("aria-label", aberta ? "Fechar pesquisa" : "Abrir pesquisa");
  if (aberta) campoBusca.focus();
});

campoBusca?.addEventListener("input", () => {
  const termo = campoBusca.value.trim().toLocaleLowerCase("pt-BR");
  const itens = document.querySelectorAll(".projeto-card, .blog-card, .tecnologias-grid article, .contato-pagina article");

  itens.forEach((item) => {
    item.hidden = termo !== "" && !item.textContent.toLocaleLowerCase("pt-BR").includes(termo);
  });
});

window.addEventListener("scroll", () => {
  cabecalho?.classList.toggle("rolagem", window.scrollY > 20);
}, { passive: true });

// Modal reutilizável para informações rápidas dos cards.
const modal = document.createElement("div");
modal.className = "modal";
modal.setAttribute("role", "dialog");
modal.setAttribute("aria-modal", "true");
modal.setAttribute("aria-labelledby", "modal-titulo");
modal.innerHTML = `
  <div class="modal-painel">
    <button class="modal-fechar" type="button" aria-label="Fechar informações">✕</button>
    <span class="modal-etiqueta">INFORMAÇÕES</span>
    <h2 id="modal-titulo"></h2>
    <p class="modal-texto"></p>
  </div>
`;
document.body.appendChild(modal);

const fecharModal = () => {
  modal.classList.remove("aberto");
  corpo.style.overflow = "";
};

document.querySelectorAll(".projeto-card, .blog-card").forEach((card) => {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "detalhes-botao";
  botao.textContent = "ⓘ Mais informações";
  card.querySelector(".projeto-conteudo")?.appendChild(botao) || card.appendChild(botao);

  botao.addEventListener("click", () => {
    const titulo = card.querySelector("h2, h3")?.textContent || "Informações";
    const texto = card.querySelector("p")?.textContent || "";
    modal.querySelector("#modal-titulo").textContent = titulo;
    modal.querySelector(".modal-texto").textContent = texto;
    modal.classList.add("aberto");
    corpo.style.overflow = "hidden";
    modal.querySelector(".modal-fechar").focus();
  });
});

modal.querySelector(".modal-fechar").addEventListener("click", fecharModal);
modal.addEventListener("click", (evento) => {
  if (evento.target === modal) fecharModal();
});
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && modal.classList.contains("aberto")) fecharModal();
});

// Skeleton breve evita uma entrada brusca e simula carregamento de catálogo.
const loading = document.createElement("div");
loading.className = "loading-screen";
loading.setAttribute("aria-label", "Carregando conteúdo");
loading.innerHTML = '<div class="skeleton"></div>';
document.body.appendChild(loading);

window.addEventListener("load", () => {
  window.setTimeout(() => loading.classList.add("oculto"), 350);
  window.setTimeout(() => loading.remove(), 800);
});

// Aparição suave conforme os elementos entram na tela.
const itensRevelar = document.querySelectorAll(".projeto-card, .blog-card, .qualidades article, .trajetoria-grid > div, .contato-pagina article");
itensRevelar.forEach((item) => item.classList.add("reveal"));

const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add("visivel");
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.12 });

itensRevelar.forEach((item) => observador.observe(item));

// Som de interface sintetizado; não utiliza arquivos de terceiros.
let contextoAudio;

function tocarClique() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  contextoAudio ||= new AudioContext();

  const oscilador = contextoAudio.createOscillator();
  const ganho = contextoAudio.createGain();
  const agora = contextoAudio.currentTime;
  oscilador.type = "sine";
  oscilador.frequency.setValueAtTime(240, agora);
  oscilador.frequency.exponentialRampToValueAtTime(145, agora + 0.055);
  ganho.gain.setValueAtTime(0.028, agora);
  ganho.gain.exponentialRampToValueAtTime(0.001, agora + 0.06);
  oscilador.connect(ganho);
  ganho.connect(contextoAudio.destination);
  oscilador.start(agora);
  oscilador.stop(agora + 0.06);
}

document.addEventListener("pointerdown", (evento) => {
  if (evento.target.closest("a, button")) tocarClique();
});
