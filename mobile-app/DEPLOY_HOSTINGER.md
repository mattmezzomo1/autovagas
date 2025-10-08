# Deploy do Mobile App na Hostinger

## Instruções para Deploy

### 1. Build da Aplicação

Execute o comando de build:

```bash
# No Windows
npm run build:win

# No Linux/Mac
npm run build
```

### 2. Upload dos Arquivos

1. Acesse o **File Manager** da Hostinger
2. Navegue até a pasta `public_html` do seu domínio
3. **Delete todos os arquivos existentes** na pasta `public_html`
4. **Upload todos os arquivos** da pasta `dist/` para `public_html`
5. Certifique-se de que o arquivo `.htaccess` foi enviado junto

### 3. Estrutura Final na Hostinger

Após o upload, sua pasta `public_html` deve ter esta estrutura:

```
public_html/
├── .htaccess          # IMPORTANTE: Arquivo para roteamento
├── index.html         # Página principal
├── assets/            # CSS, JS e outros recursos
│   ├── index-[hash].css
│   ├── index-[hash].js
│   └── ...
└── vite.svg          # Favicon (se existir)
```

### 4. Configurações Importantes

#### .htaccess
O arquivo `.htaccess` é **ESSENCIAL** para o funcionamento do React Router. Ele:
- Redireciona todas as rotas para `index.html`
- Ativa compressão GZIP
- Define headers de segurança
- Configura cache do browser

#### Verificação
Após o deploy, teste as seguintes URLs:
- `https://seudominio.com/` (página inicial)
- `https://seudominio.com/dashboard` (deve funcionar)
- `https://seudominio.com/jobs` (deve funcionar)
- `https://seudominio.com/robot` (deve funcionar)

### 5. Troubleshooting

#### Erro 404 nas rotas
- **Causa**: Arquivo `.htaccess` não foi enviado ou não está funcionando
- **Solução**: 
  1. Verifique se o `.htaccess` existe em `public_html`
  2. Verifique se o Apache mod_rewrite está ativo (geralmente está na Hostinger)

#### Página em branco
- **Causa**: Caminhos dos assets incorretos
- **Solução**: 
  1. Verifique se todos os arquivos da pasta `assets/` foram enviados
  2. Verifique se não há erros no console do browser (F12)

#### CSS não carrega
- **Causa**: Arquivos CSS não foram enviados ou caminhos incorretos
- **Solução**:
  1. Verifique se a pasta `assets/` foi enviada completamente
  2. Limpe o cache do browser (Ctrl+F5)

### 6. Comandos Úteis

```bash
# Build para produção
npm run build

# Build para produção (Windows)
npm run build:win

# Preview local do build
npm run preview

# Desenvolvimento local
npm run dev
```

### 7. Notas Importantes

- **Sempre faça backup** dos arquivos existentes antes do deploy
- **Delete arquivos antigos** antes de enviar os novos
- **Verifique se o .htaccess foi enviado** - é o arquivo mais importante
- **Teste todas as rotas** após o deploy
- **Use HTTPS** sempre que possível

### 8. Configuração de Domínio

Se você estiver usando um subdomínio ou pasta específica, ajuste o `base` no `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/sua-pasta/', // Para pasta específica
  // ou
  base: '/', // Para domínio principal
})
```

### 9. Suporte

Em caso de problemas:
1. Verifique os logs de erro da Hostinger
2. Use o console do browser (F12) para ver erros JavaScript
3. Teste o `.htaccess` em um validador online
4. Entre em contato com o suporte da Hostinger se necessário
