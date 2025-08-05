# Integração com LinkedIn - AutoVagas

Este documento descreve a implementação da integração com o LinkedIn no projeto AutoVagas, incluindo autenticação OAuth 2.0, uso da API oficial e implementação de scraper como fallback.

## 1. Visão Geral

A integração com o LinkedIn permite:
- Autenticar usuários usando suas contas do LinkedIn
- Buscar vagas de emprego no LinkedIn
- Aplicar para vagas de emprego no LinkedIn

A implementação utiliza duas abordagens:
1. **API Oficial do LinkedIn**: Método preferencial, mais estável e confiável
2. **Web Scraping**: Método de fallback quando a API não está disponível ou o usuário não autorizou o acesso

## 2. Pré-requisitos

### 2.1. Registro do Aplicativo no LinkedIn

1. Acesse o [Portal de Desenvolvedores do LinkedIn](https://www.linkedin.com/developers/)
2. Crie um novo aplicativo com as seguintes configurações:
   - Nome do aplicativo: AutoVagas
   - URL do site: https://autovagas.com.br
   - Logo do aplicativo: Logo da AutoVagas
   - Descrição: Plataforma de busca e aplicação automatizada em vagas de emprego
3. Solicite as seguintes permissões:
   - `r_emailaddress`: Para acessar o email do usuário
   - `r_liteprofile`: Para acessar informações básicas do perfil
   - `r_fullprofile`: Para acessar o perfil completo (requer aprovação)
   - `w_member_social`: Para aplicações em vagas (requer aprovação)
4. Configure as URLs de redirecionamento:
   - https://autovagas.com.br/auth/linkedin/callback
   - http://localhost:3000/auth/linkedin/callback (para desenvolvimento)

### 2.2. Configuração do Ambiente

Crie um arquivo `.env` baseado no `.env.example` e preencha as seguintes variáveis:

```
LINKEDIN_CLIENT_ID=seu_client_id
LINKEDIN_CLIENT_SECRET=seu_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
LINKEDIN_TEST_USERNAME=seu_username_linkedin
LINKEDIN_TEST_PASSWORD=sua_senha_linkedin
```

## 3. Estrutura da Implementação

### 3.1. Autenticação OAuth 2.0

- **LinkedInAuthService**: Serviço para autenticação com o LinkedIn
- **TokenStorage**: Serviço para armazenamento seguro de tokens
- **LinkedInAuthController**: Controlador para rotas de autenticação
- **linkedinAuth.routes.ts**: Rotas para autenticação

### 3.2. API Oficial do LinkedIn

- **LinkedInApiService**: Serviço para interagir com a API oficial do LinkedIn
- **LinkedInJobsController**: Controlador para busca e aplicação em vagas
- **linkedinJobs.routes.ts**: Rotas para busca e aplicação em vagas

### 3.3. Scraper como Fallback

- **LinkedInScraperService**: Serviço de webscraping específico para o LinkedIn
- **WebScraperService**: Classe base para serviços de webscraping

## 4. Fluxo de Autenticação

1. O usuário clica em "Conectar com LinkedIn"
2. O sistema redireciona para a URL de autorização do LinkedIn
3. O usuário autoriza o aplicativo
4. O LinkedIn redireciona de volta para a aplicação com um código de autorização
5. O sistema troca o código por tokens de acesso
6. Os tokens são armazenados para uso futuro

## 5. Fluxo de Busca de Vagas

1. O usuário define parâmetros de busca (palavras-chave, localização, etc.)
2. O sistema tenta usar a API oficial do LinkedIn
3. Se a API falhar, o sistema usa o scraper como fallback
4. Os resultados são retornados para o usuário

## 6. Fluxo de Aplicação em Vagas

1. O usuário seleciona uma vaga para aplicar
2. O sistema tenta usar a API oficial do LinkedIn
3. Se a API falhar, o sistema usa o scraper como fallback
4. O sistema preenche automaticamente o formulário de aplicação
5. O resultado da aplicação é retornado para o usuário

## 7. Manutenção e Considerações

### 7.1. Limitações da API

- A API do LinkedIn tem limites de taxa de requisições
- Algumas permissões requerem aprovação da LinkedIn
- A API pode mudar sem aviso prévio

### 7.2. Limitações do Scraper

- O scraper pode quebrar se o LinkedIn mudar a estrutura do site
- O LinkedIn pode detectar e bloquear scraping automatizado
- O scraper pode ser mais lento que a API

### 7.3. Manutenção

- Monitore regularmente o funcionamento da integração
- Atualize o scraper quando o LinkedIn mudar a estrutura do site
- Mantenha os tokens de acesso atualizados

## 8. Testes

Para testar a integração, execute:

```bash
npm run test:linkedin
```

Isso executará testes automatizados para verificar:
- Autenticação OAuth 2.0
- Busca de vagas
- Aplicação em vagas

## 9. Documentação Adicional

- [Documentação da API do LinkedIn](https://docs.microsoft.com/en-us/linkedin/)
- [Políticas de Uso da API do LinkedIn](https://docs.microsoft.com/en-us/linkedin/compliance/developer-policies)
- [Termos de Serviço do LinkedIn](https://www.linkedin.com/legal/user-agreement)
