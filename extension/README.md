# AutoVagas Chrome Extension

Esta extensão do Chrome permite que usuários do plano básico do AutoVagas realizem scraping de vagas de emprego diretamente de seus navegadores, utilizando seus próprios recursos computacionais em vez dos servidores do AutoVagas.

## Funcionalidades

- Scraping de vagas de emprego de várias plataformas:
  - LinkedIn
  - Indeed
  - InfoJobs
  - Catho
- Execução de tarefas em segundo plano
- Sincronização com o servidor AutoVagas
- Interface de usuário para monitoramento de atividades

## Instalação

### Para Usuários

1. Faça o download do arquivo ZIP da extensão na área de membros do AutoVagas
2. Descompacte o arquivo em uma pasta de sua escolha
3. Abra o Chrome e navegue para `chrome://extensions/`
4. Ative o "Modo do desenvolvedor" no canto superior direito
5. Clique em "Carregar sem compactação" e selecione a pasta onde você descompactou a extensão
6. A extensão será instalada e aparecerá na barra de ferramentas do Chrome

### Para Desenvolvedores

1. Clone este repositório
2. Instale as dependências com `npm install`
3. Execute `npm run build` para gerar a versão de produção
4. Siga os passos 3-5 da seção "Para Usuários" para instalar a extensão

## Uso

1. Clique no ícone da extensão na barra de ferramentas do Chrome
2. Faça login com suas credenciais do AutoVagas
3. A extensão começará a receber tarefas do servidor e executá-las automaticamente
4. Você pode pausar ou retomar o processamento de tarefas a qualquer momento

## Privacidade e Segurança

- A extensão só acessa as plataformas de emprego quando está executando tarefas
- Suas credenciais são armazenadas localmente e transmitidas de forma segura
- A extensão não coleta dados pessoais além dos necessários para o funcionamento do serviço
- Todo o tráfego entre a extensão e o servidor é criptografado

## Requisitos do Sistema

- Google Chrome versão 88 ou superior
- Conexão estável com a internet
- Pelo menos 4GB de RAM disponível
- Processador dual-core ou superior

## Solução de Problemas

### A extensão não está recebendo tarefas

- Verifique se você está logado corretamente
- Certifique-se de que sua assinatura do AutoVagas está ativa
- Verifique sua conexão com a internet

### A extensão está consumindo muitos recursos

- Reduza o número de abas abertas no Chrome
- Reinicie o navegador
- Verifique se não há outras extensões conflitantes

### Erros de scraping

- Algumas plataformas podem mudar seu layout, causando falhas temporárias
- A equipe do AutoVagas atualiza a extensão regularmente para corrigir esses problemas
- Você pode reportar erros específicos através do painel do usuário

## Suporte

Se você encontrar problemas ou tiver dúvidas sobre a extensão, entre em contato com o suporte do AutoVagas:

- Email: suporte@autovagas.com
- Chat: Disponível no painel do usuário
- Horário de atendimento: Segunda a sexta, das 9h às 18h

## Licença

Esta extensão é propriedade do AutoVagas e seu uso é restrito aos assinantes do serviço. A redistribuição ou modificação não autorizada é proibida.
