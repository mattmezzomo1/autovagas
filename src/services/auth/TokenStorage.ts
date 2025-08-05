/**
 * Serviço para armazenamento seguro de tokens
 * Em uma aplicação real, você deve usar métodos mais seguros de armazenamento
 * como cookies HttpOnly ou armazenamento no servidor
 */
export class TokenStorage {
  /**
   * Armazena tokens de forma segura
   */
  static storeTokens(userId: string, platform: string, tokens: any): void {
    // Em uma aplicação real, você deve criptografar os tokens antes de armazená-los
    localStorage.setItem(`${platform}_tokens_${userId}`, JSON.stringify(tokens));
    
    // Armazena a data de expiração
    if (tokens.expiresIn) {
      const expiresAt = Date.now() + tokens.expiresIn * 1000;
      localStorage.setItem(`${platform}_expires_${userId}`, expiresAt.toString());
    }
  }
  
  /**
   * Recupera tokens armazenados
   */
  static getTokens(userId: string, platform: string): any | null {
    const tokensStr = localStorage.getItem(`${platform}_tokens_${userId}`);
    if (!tokensStr) return null;
    
    try {
      return JSON.parse(tokensStr);
    } catch (error) {
      console.error('Error parsing tokens:', error);
      return null;
    }
  }
  
  /**
   * Verifica se os tokens estão expirados
   */
  static areTokensExpired(userId: string, platform: string): boolean {
    const expiresAtStr = localStorage.getItem(`${platform}_expires_${userId}`);
    if (!expiresAtStr) return true;
    
    const expiresAt = parseInt(expiresAtStr, 10);
    // Considera expirado 5 minutos antes para dar margem de segurança
    return Date.now() > expiresAt - 5 * 60 * 1000;
  }
  
  /**
   * Remove tokens armazenados
   */
  static removeTokens(userId: string, platform: string): void {
    localStorage.removeItem(`${platform}_tokens_${userId}`);
    localStorage.removeItem(`${platform}_expires_${userId}`);
  }
}
