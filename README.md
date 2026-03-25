# Jogo de Memória por Posição - Vovô & Vovó

Um jogo acessível e estimulante projetado especificamente para idosos, focado no treino de memória espacial e reconhecimento de imagens.

## 🚀 Como Executar

Basta abrir o arquivo `index.html` em qualquer navegador moderno. O jogo é 100% offline após o carregamento inicial.

## 📁 Estrutura de Pastas

- `index.html`: Estrutura principal do jogo.
- `styles.css`: Estilização com foco em alto contraste e acessibilidade.
- `app.js`: Lógica do jogo, cronômetros e persistência de dados.
- `images/`: Coloque aqui suas imagens personalizadas (`.png`, `.jpg`).
- `audio/`: Sons de feedback.
  - `success.wav` ou `success.mp3`: Tocado ao acertar (Bi-bi!).
  - `error.wav` ou `error.mp3`: Tocado ao errar (Bóóó...).

## 🛠️ Personalização

### Adicionando Imagens
O código atual utiliza imagens aleatórias (via placeholder) para demonstração. Para usar suas próprias imagens:
1. Adicione as imagens na pasta `images/`.
2. No arquivo `app.js`, altere a função `setupGrid()` para listar os caminhos dos seus arquivos locais.

### Ajustando Tempos
Através do menu **Configurações** no próprio jogo, você pode ajustar:
- Tempo de memorização (padrão 15s).
- Tempo total da partida (padrão 120s).
- Quantidade de cartas (6, 8 ou 12).

## ♿ Acessibilidade

- **Fontes Ampliadas:** Opções de texto grande e muito grande.
- **Alto Contraste:** Tema especial com cores saturadas para facilitar a leitura.
- **Navegação por Teclado:** Suporte total a `Tab` e `Enter`.
- **Feedbacks Visuais e Sonoros:** Mensagens claras na tela e sons distintos para acertos e erros.

## 📝 Regras de Pontuação
- **Acerto:** +1 ponto.
- **Erro:** -1 ponto (mínimo de 0).
- A melhor pontuação é salva automaticamente em seu navegador.
