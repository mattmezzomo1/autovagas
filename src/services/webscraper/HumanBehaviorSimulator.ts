/**
 * Classe utilitária para simular comportamentos humanos durante o webscraping
 * 
 * Esta classe fornece métodos para adicionar atrasos realistas, simular movimentos
 * de mouse, padrões de digitação humanos e comportamentos aleatórios para evitar
 * detecção por sistemas anti-bot.
 */
export class HumanBehaviorSimulator {
  /**
   * Adiciona um atraso aleatório dentro de um intervalo
   * 
   * @param minMs Tempo mínimo em milissegundos
   * @param maxMs Tempo máximo em milissegundos
   * @returns Promise que resolve após o atraso
   */
  static async randomDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Simula um atraso humano entre ações
   * 
   * Diferentes tipos de ações têm diferentes tempos de espera típicos:
   * - 'navigation': Espera entre navegações de página (1-3s)
   * - 'click': Espera entre cliques (0.3-1.5s)
   * - 'typing': Espera entre pressionamentos de tecla (0.05-0.2s)
   * - 'thinking': Pausa para "pensar" antes de uma ação importante (1-5s)
   * - 'reading': Tempo para "ler" o conteúdo da página (2-10s)
   * 
   * @param actionType Tipo de ação
   * @returns Promise que resolve após o atraso
   */
  static async humanDelay(actionType: 'navigation' | 'click' | 'typing' | 'thinking' | 'reading'): Promise<void> {
    switch (actionType) {
      case 'navigation':
        return this.randomDelay(1000, 3000);
      case 'click':
        return this.randomDelay(300, 1500);
      case 'typing':
        return this.randomDelay(50, 200);
      case 'thinking':
        return this.randomDelay(1000, 5000);
      case 'reading':
        return this.randomDelay(2000, 10000);
      default:
        return this.randomDelay(500, 2000);
    }
  }

  /**
   * Simula digitação humana com velocidade variável
   * 
   * @param page Objeto de página do Puppeteer
   * @param selector Seletor do elemento para digitar
   * @param text Texto a ser digitado
   */
  static async humanTyping(page: any, selector: string, text: string): Promise<void> {
    // Primeiro, clica no campo
    await page.click(selector);
    await this.humanDelay('click');
    
    // Digita o texto caractere por caractere com velocidade variável
    for (const char of text) {
      // Digita um caractere
      await page.type(selector, char, { delay: 0 });
      
      // Adiciona um atraso variável entre os caracteres
      // Pessoas digitam em "rajadas" com pausas ocasionais
      if (Math.random() < 0.2) {
        // Pausa mais longa ocasional (como se estivesse pensando)
        await this.randomDelay(200, 500);
      } else {
        // Velocidade de digitação normal
        await this.randomDelay(30, 150);
      }
      
      // Ocasionalmente simula um erro de digitação e correção
      if (Math.random() < 0.05 && text.length > 5) {
        // Pressiona backspace
        await page.keyboard.press('Backspace');
        await this.randomDelay(200, 400);
        
        // Digita o caractere novamente
        await page.type(selector, char, { delay: 0 });
        await this.randomDelay(100, 300);
      }
    }
    
    // Pausa após terminar de digitar
    await this.humanDelay('thinking');
  }

  /**
   * Simula movimento de mouse humano para um elemento
   * 
   * @param page Objeto de página do Puppeteer
   * @param selector Seletor do elemento para mover o mouse
   */
  static async humanMouseMovement(page: any, selector: string): Promise<void> {
    // Obtém a posição do elemento
    const element = await page.$(selector);
    if (!element) return;
    
    const box = await element.boundingBox();
    if (!box) return;
    
    // Posição inicial aleatória na tela
    const startX = Math.random() * page.viewport().width;
    const startY = Math.random() * page.viewport().height;
    
    // Posição alvo (centro do elemento com um pouco de aleatoriedade)
    const targetX = box.x + box.width / 2 + (Math.random() * 10 - 5);
    const targetY = box.y + box.height / 2 + (Math.random() * 10 - 5);
    
    // Número de etapas para o movimento (mais etapas = movimento mais suave)
    const steps = 10 + Math.floor(Math.random() * 15);
    
    // Simula uma curva de movimento natural usando curva de Bezier
    // Adiciona um ponto de controle aleatório para tornar o movimento mais natural
    const controlX = (startX + targetX) / 2 + (Math.random() * 100 - 50);
    const controlY = (startY + targetY) / 2 + (Math.random() * 100 - 50);
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      
      // Fórmula da curva de Bezier quadrática
      const x = Math.pow(1 - t, 2) * startX + 
                2 * (1 - t) * t * controlX + 
                Math.pow(t, 2) * targetX;
      
      const y = Math.pow(1 - t, 2) * startY + 
                2 * (1 - t) * t * controlY + 
                Math.pow(t, 2) * targetY;
      
      // Move o mouse para a posição calculada
      await page.mouse.move(x, y);
      
      // Adiciona um pequeno atraso entre os movimentos
      await this.randomDelay(10, 30);
    }
  }

  /**
   * Simula um clique humano em um elemento
   * 
   * @param page Objeto de página do Puppeteer
   * @param selector Seletor do elemento para clicar
   */
  static async humanClick(page: any, selector: string): Promise<void> {
    // Primeiro move o mouse de forma humana
    await this.humanMouseMovement(page, selector);
    
    // Pequena pausa antes de clicar (como um humano faria)
    await this.randomDelay(100, 300);
    
    // Clica no elemento
    await page.click(selector);
    
    // Pausa após o clique
    await this.humanDelay('click');
  }

  /**
   * Simula rolagem de página humana
   * 
   * @param page Objeto de página do Puppeteer
   * @param direction Direção da rolagem ('down' ou 'up')
   * @param distance Distância aproximada para rolar (opcional)
   */
  static async humanScroll(page: any, direction: 'down' | 'up', distance?: number): Promise<void> {
    // Se a distância não for especificada, usa um valor aleatório
    const scrollDistance = distance || Math.floor(Math.random() * 500) + 100;
    
    // Determina a direção da rolagem
    const scrollValue = direction === 'down' ? scrollDistance : -scrollDistance;
    
    // Número de etapas para a rolagem (mais etapas = rolagem mais suave)
    const steps = 5 + Math.floor(Math.random() * 10);
    const scrollPerStep = scrollValue / steps;
    
    for (let i = 0; i < steps; i++) {
      // Rola um pouco
      await page.evaluate((scrollStep: number) => {
        window.scrollBy(0, scrollStep);
      }, scrollPerStep);
      
      // Adiciona um pequeno atraso entre as etapas de rolagem
      await this.randomDelay(50, 150);
    }
    
    // Pausa após a rolagem
    await this.humanDelay('click');
  }

  /**
   * Simula comportamento de leitura humana
   * 
   * @param page Objeto de página do Puppeteer
   */
  static async simulateReading(page: any): Promise<void> {
    // Determina quanto tempo "ler" com base no conteúdo da página
    const contentLength = await page.evaluate(() => {
      return document.body.innerText.length;
    });
    
    // Tempo base de leitura: 1s por 100 caracteres + variação aleatória
    const baseReadingTime = contentLength / 100 * 1000;
    const readingTime = Math.min(
      baseReadingTime + (Math.random() * 2000 - 1000),
      15000 // Máximo de 15 segundos
    );
    
    // Simula rolagem lenta durante a leitura
    const scrolls = Math.floor(readingTime / 2000) + 1; // Aproximadamente uma rolagem a cada 2s
    
    for (let i = 0; i < scrolls; i++) {
      // Espera um pouco antes de rolar (como se estivesse lendo)
      await this.randomDelay(1000, 3000);
      
      // Rola um pouco para baixo
      await this.humanScroll(page, 'down', 200 + Math.floor(Math.random() * 300));
    }
    
    // Pausa final após a leitura
    await this.humanDelay('thinking');
  }

  /**
   * Executa uma ação aleatória ocasional para parecer mais humano
   * 
   * @param page Objeto de página do Puppeteer
   */
  static async randomHumanAction(page: any): Promise<void> {
    // Executa uma ação aleatória com 20% de chance
    if (Math.random() < 0.2) {
      const action = Math.floor(Math.random() * 5);
      
      switch (action) {
        case 0:
          // Rola a página para cima ou para baixo aleatoriamente
          await this.humanScroll(page, Math.random() < 0.7 ? 'down' : 'up');
          break;
        case 1:
          // Move o mouse para uma posição aleatória
          const x = Math.floor(Math.random() * page.viewport().width);
          const y = Math.floor(Math.random() * page.viewport().height);
          await page.mouse.move(x, y);
          break;
        case 2:
          // Pausa como se estivesse pensando
          await this.humanDelay('thinking');
          break;
        case 3:
          // Redimensiona a janela ligeiramente
          const currentViewport = page.viewport();
          const newWidth = currentViewport.width + (Math.random() * 100 - 50);
          const newHeight = currentViewport.height + (Math.random() * 100 - 50);
          await page.setViewport({
            width: Math.max(800, Math.floor(newWidth)),
            height: Math.max(600, Math.floor(newHeight))
          });
          break;
        case 4:
          // Simula pressionar a tecla Tab algumas vezes
          const tabCount = Math.floor(Math.random() * 5) + 1;
          for (let i = 0; i < tabCount; i++) {
            await page.keyboard.press('Tab');
            await this.randomDelay(100, 500);
          }
          break;
      }
    }
  }

  /**
   * Navega para uma URL de forma humana
   * 
   * @param page Objeto de página do Puppeteer
   * @param url URL para navegar
   * @param options Opções adicionais
   */
  static async humanNavigation(page: any, url: string, options?: any): Promise<void> {
    // Navega para a URL
    await page.goto(url, options);
    
    // Espera um tempo como se estivesse carregando e processando a página
    await this.humanDelay('navigation');
    
    // Ocasionalmente simula leitura da página
    if (Math.random() < 0.7) {
      await this.simulateReading(page);
    }
  }

  /**
   * Preenche um formulário de forma humana
   * 
   * @param page Objeto de página do Puppeteer
   * @param formData Objeto com seletores e valores para preencher
   */
  static async humanFillForm(page: any, formData: Record<string, string>): Promise<void> {
    for (const [selector, value] of Object.entries(formData)) {
      // Adiciona um atraso antes de focar no próximo campo
      await this.humanDelay('click');
      
      // Digita o valor no campo
      await this.humanTyping(page, selector, value);
      
      // Ocasionalmente executa uma ação aleatória entre os campos
      await this.randomHumanAction(page);
    }
  }
}
