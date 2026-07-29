// Versão final do portfólio.
const corpo = document.body;
const botaoTema = document.querySelector(".tema-botao");
const iconeTema = document.querySelector(".tema-icone");
const botaoMenu = document.querySelector(".menu-botao");
const menu = document.querySelector(".menu");
const ano = document.querySelector("#ano");

// Aplica o tema e preserva a escolha do visitante.
function aplicarTema(tema) {
  const escuro = tema === "dark";
  corpo.classList.toggle("dark", escuro);

  if (iconeTema) {
    iconeTema.textContent = escuro ? "☀" : "☾";
  }

  if (botaoTema) {
    botaoTema.setAttribute("aria-label", escuro ? "Ativar tema claro" : "Ativar tema escuro");
  }
}

const temaSalvo = localStorage.getItem("tema");
const prefereEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
aplicarTema(temaSalvo || (prefereEscuro ? "dark" : "light"));

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

if (ano) {
  ano.textContent = new Date().getFullYear();
}

// HUD apenas decorativo, criado uma vez e compartilhado por todas as páginas.
const hud = document.createElement("aside");
hud.className = "game-hud";
hud.setAttribute("aria-label", "Painel decorativo de jogo");
hud.innerHTML = `
  <div class="hud-coracoes" aria-label="Dez corações de vida">♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥</div>
  <div class="hud-xp" aria-label="Barra de experiência decorativa"></div>
  <div class="hud-slots" aria-hidden="true">
    <span class="hud-slot ativo">⌂</span>
    <span class="hud-slot">◆</span>
    <span class="hud-slot">✦</span>
    <span class="hud-slot">▣</span>
    <span class="hud-slot">✉</span>
    <span class="hud-slot">⚒</span>
    <span class="hud-slot">?</span>
  </div>
`;
document.body.appendChild(hud);

// Som curto sintetizado pelo navegador; nenhum arquivo de áudio externo é usado.
let contextoAudio;

function tocarCliquePixel() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  contextoAudio ||= new AudioContext();
  if (contextoAudio.state === "suspended") {
    contextoAudio.resume();
  }

  const oscilador = contextoAudio.createOscillator();
  const ganhoTom = contextoAudio.createGain();
  const filtro = contextoAudio.createBiquadFilter();
  const ganhoRuido = contextoAudio.createGain();
  const agora = contextoAudio.currentTime;

  // Estalo grave e curto, semelhante a um botão de menu de jogo.
  oscilador.type = "square";
  oscilador.frequency.setValueAtTime(190, agora);
  oscilador.frequency.exponentialRampToValueAtTime(75, agora + 0.075);
  ganhoTom.gain.setValueAtTime(0.055, agora);
  ganhoTom.gain.exponentialRampToValueAtTime(0.001, agora + 0.08);

  oscilador.connect(ganhoTom);
  ganhoTom.connect(contextoAudio.destination);
  oscilador.start(agora);
  oscilador.stop(agora + 0.08);

  // Pequeno ruído filtrado cria a sensação de impacto de um bloco.
  const tamanhoRuido = Math.floor(contextoAudio.sampleRate * 0.055);
  const bufferRuido = contextoAudio.createBuffer(1, tamanhoRuido, contextoAudio.sampleRate);
  const dadosRuido = bufferRuido.getChannelData(0);

  for (let i = 0; i < tamanhoRuido; i += 1) {
    dadosRuido[i] = (Math.random() * 2 - 1) * (1 - i / tamanhoRuido);
  }

  const fonteRuido = contextoAudio.createBufferSource();
  fonteRuido.buffer = bufferRuido;
  filtro.type = "lowpass";
  filtro.frequency.value = 950;
  ganhoRuido.gain.setValueAtTime(0.07, agora);
  ganhoRuido.gain.exponentialRampToValueAtTime(0.001, agora + 0.055);
  fonteRuido.connect(filtro);
  filtro.connect(ganhoRuido);
  ganhoRuido.connect(contextoAudio.destination);
  fonteRuido.start(agora);
}

// pointerdown toca antes que um link carregue a próxima página.
document.addEventListener("pointerdown", (evento) => {
  if (evento.target.closest("a, button")) {
    tocarCliquePixel();
  }
});

// Mantém o som para quem navega pelo teclado.
document.addEventListener("keydown", (evento) => {
  if ((evento.key === "Enter" || evento.key === " ") && evento.target.closest("a, button")) {
    tocarCliquePixel();
  }
});
