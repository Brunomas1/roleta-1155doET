# 🎡 Roleta 1155 do ET - Windows XP Edition

Uma aplicação de sorteios moderna envolta em uma experiência nostálgica e autêntica do **Windows XP Luna**. Este sistema combina tecnologia de ponta com o design clássico dos anos 2000, oferecendo sorteios legítimos e uma interface extremamente rica em detalhes.

---

## 🌟 Características e Estilo

### 🖥️ Interface Windows XP Autêntica
- **Barra de Tarefas Funcional**: Inclui o menu Iniciar clássico, relógio estático em 11:55 e suporte total para minimizar e restaurar janelas.
- **Janelas Arrastáveis**: Todo o painel de controle e o histórico estão dentro de uma janela XP unificada que pode ser movida livremente pela tela.
- **Instalador Nostálgico**: Ao realizar um sorteio, a animação da roleta é substituída por uma barra de progresso de instalação do Windows XP, com nomes de arquivos sendo extraídos em tempo real.
- **Desktop Interativo**: Atalhos de área de trabalho para Lixeira, YouTube e GitHub, completos com as icônicas setas de atalho.
- **Backgrounds Dinâmicos**: O papel de parede muda automaticamente a cada 60 segundos com transições suaves.

### 🛠️ Aplicativos de Monitoramento (Fake)
A barra de tarefas conta com atalhos para ferramentas clássicas de hardware, exibindo especificações personalizadas:
- **CPU-Z**: Exibe detalhes de um **Intel Core i3-2100**.
- **GPU-Z**: Exibe detalhes de uma **AMD Radeon RX 580**.
- **HWMonitor**: Monitoramento em tempo real de temperaturas e carga.

---

## 🚀 Funcionalidades Principais

- **Modos de Sorteio Dual**:
  - **Texto**: Insira uma lista de opções (uma por linha).
  - **Números**: Defina um intervalo (ex: 1 a 100).
- **Sistema de "Blacklist" (Sorteio Único)**:
  - Os itens são removidos automaticamente do pool após serem sorteados, garantindo que ninguém ganhe duas vezes seguidas no mesmo sorteio.
- **Gestão de Áudio Inteligente**:
  - Sons de vitória e "ticks" de progresso sincronizados.
  - O sistema impede a sobreposição de áudios ao reiniciar sorteios rapidamente.
  - Controle de Mute diretamente no ícone de volume da System Tray.
- **Histórico Persistente**:
  - Os últimos 50 resultados são salvos localmente, incluindo o hash de legitimidade de cada sorteio.

---

## ⚖️ Legitimidade (Provably Fair)

A **Roleta 1155 do ET** utiliza um sistema de **Provably Fair (Provavelmente Justo)** para garantir que nenhum resultado seja manipulado:

1. **Server Seed**: Uma string aleatória gerada no servidor (ou localmente).
2. **Client Seed**: Uma semente que o usuário pode personalizar para influenciar o sorteio.
3. **Nonce**: Um número que incrementa a cada sorteio, garantindo que sementes repetidas gerem resultados diferentes.
4. **Criptografia SHA-256**: Combinamos esses dados em um hash criptográfico. O índice do vencedor é derivado matematicamente deste hash, tornando o resultado **100% verificável e impossível de prever** antes do sorteio.

---

## 🛠️ Tecnologias Utilizadas

- **React + TypeScript**: Para uma interface robusta e tipagem segura.
- **Vite**: Build tool ultrarrápida para desenvolvimento moderno.
- **Framer Motion**: Responsável pelas animações de janelas, minimização e transições de background.
- **XP.css**: Todo o tema base e recortes visuais do Windows XP foram gentilmente providenciados por [XP.css (botoxparty)](https://github.com/botoxparty/XP.css), garantindo a fidelidade nostálgica 100%.
- **Vanilla CSS**: Refinamentos, overrides e layouts customizados construídos sobre a base do xp.css.
- **Web Audio API**: Para síntese e controle preciso dos efeitos sonoros.
- **Canvas Confetti**: Celebrações visuais de alta performance.

---

## 📦 Como Rodar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/Brunomas1/roleta-1155doET.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

---

Desenvolvido com 💙 para a comunidade **1155 do ET**.
