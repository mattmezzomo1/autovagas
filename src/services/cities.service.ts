/**
 * Serviço para buscar cidades usando APIs públicas
 */

interface City {
  name: string;
  state: string;
  country: string;
  fullName: string;
}

interface IBGECity {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
        nome: string;
      };
    };
  };
}

class CitiesService {
  private readonly IBGE_API_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios';
  private cache = new Map<string, City[]>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Busca cidades brasileiras usando a API do IBGE
   * @param query Termo de busca
   * @returns Lista de cidades encontradas
   */
  async searchBrazilianCities(query: string): Promise<City[]> {
    if (query.length < 2) return [];

    const cacheKey = `br_${query.toLowerCase()}`;
    
    // Verificar cache
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey) || [];
    }

    try {
      const response = await fetch(this.IBGE_API_URL);
      if (!response.ok) {
        throw new Error('Erro ao buscar cidades');
      }

      const cities: IBGECity[] = await response.json();
      
      // Filtrar cidades que correspondem à busca
      const filteredCities = cities
        .filter(city => 
          city.nome.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10) // Limitar resultados
        .map(city => ({
          name: city.nome,
          state: city.microrregiao.mesorregiao.UF.sigla,
          country: 'Brasil',
          fullName: `${city.nome}, ${city.microrregiao.mesorregiao.UF.sigla}`
        }));

      // Salvar no cache
      this.cache.set(cacheKey, filteredCities);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      return filteredCities;
    } catch (error) {
      console.error('Erro ao buscar cidades brasileiras:', error);
      return this.getFallbackCities(query);
    }
  }

  /**
   * Busca cidades usando múltiplas fontes
   * @param query Termo de busca
   * @returns Lista de cidades encontradas
   */
  async searchCities(query: string): Promise<City[]> {
    if (query.length < 2) return [];

    // Primeiro, tentar buscar cidades brasileiras
    const brazilianCities = await this.searchBrazilianCities(query);
    
    // Se não encontrar muitas cidades brasileiras, adicionar cidades internacionais
    if (brazilianCities.length < 5) {
      const internationalCities = this.getInternationalCities(query);
      return [...brazilianCities, ...internationalCities].slice(0, 8);
    }

    return brazilianCities;
  }

  /**
   * Retorna cidades internacionais populares (fallback)
   * @param query Termo de busca
   * @returns Lista de cidades internacionais
   */
  private getInternationalCities(query: string): City[] {
    const internationalCities: City[] = [
      { name: 'Nova York', state: 'NY', country: 'Estados Unidos', fullName: 'Nova York, NY, Estados Unidos' },
      { name: 'Los Angeles', state: 'CA', country: 'Estados Unidos', fullName: 'Los Angeles, CA, Estados Unidos' },
      { name: 'Londres', state: '', country: 'Reino Unido', fullName: 'Londres, Reino Unido' },
      { name: 'Paris', state: '', country: 'França', fullName: 'Paris, França' },
      { name: 'Berlim', state: '', country: 'Alemanha', fullName: 'Berlim, Alemanha' },
      { name: 'Tóquio', state: '', country: 'Japão', fullName: 'Tóquio, Japão' },
      { name: 'Toronto', state: 'ON', country: 'Canadá', fullName: 'Toronto, ON, Canadá' },
      { name: 'Sydney', state: 'NSW', country: 'Austrália', fullName: 'Sydney, NSW, Austrália' },
      { name: 'Barcelona', state: '', country: 'Espanha', fullName: 'Barcelona, Espanha' },
      { name: 'Amsterdam', state: '', country: 'Holanda', fullName: 'Amsterdam, Holanda' },
      { name: 'Dublin', state: '', country: 'Irlanda', fullName: 'Dublin, Irlanda' },
      { name: 'Zurich', state: '', country: 'Suíça', fullName: 'Zurich, Suíça' },
      { name: 'Remoto', state: '', country: '', fullName: 'Remoto' }
    ];

    return internationalCities.filter(city =>
      city.name.toLowerCase().includes(query.toLowerCase()) ||
      city.fullName.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Retorna cidades brasileiras populares como fallback
   * @param query Termo de busca
   * @returns Lista de cidades brasileiras
   */
  private getFallbackCities(query: string): City[] {
    const fallbackCities: City[] = [
      { name: 'São Paulo', state: 'SP', country: 'Brasil', fullName: 'São Paulo, SP' },
      { name: 'Rio de Janeiro', state: 'RJ', country: 'Brasil', fullName: 'Rio de Janeiro, RJ' },
      { name: 'Belo Horizonte', state: 'MG', country: 'Brasil', fullName: 'Belo Horizonte, MG' },
      { name: 'Brasília', state: 'DF', country: 'Brasil', fullName: 'Brasília, DF' },
      { name: 'Salvador', state: 'BA', country: 'Brasil', fullName: 'Salvador, BA' },
      { name: 'Fortaleza', state: 'CE', country: 'Brasil', fullName: 'Fortaleza, CE' },
      { name: 'Curitiba', state: 'PR', country: 'Brasil', fullName: 'Curitiba, PR' },
      { name: 'Recife', state: 'PE', country: 'Brasil', fullName: 'Recife, PE' },
      { name: 'Porto Alegre', state: 'RS', country: 'Brasil', fullName: 'Porto Alegre, RS' },
      { name: 'Manaus', state: 'AM', country: 'Brasil', fullName: 'Manaus, AM' },
      { name: 'Campinas', state: 'SP', country: 'Brasil', fullName: 'Campinas, SP' },
      { name: 'Santos', state: 'SP', country: 'Brasil', fullName: 'Santos, SP' },
      { name: 'São Bernardo do Campo', state: 'SP', country: 'Brasil', fullName: 'São Bernardo do Campo, SP' },
      { name: 'Guarulhos', state: 'SP', country: 'Brasil', fullName: 'Guarulhos, SP' },
      { name: 'Osasco', state: 'SP', country: 'Brasil', fullName: 'Osasco, SP' },
      { name: 'Niterói', state: 'RJ', country: 'Brasil', fullName: 'Niterói, RJ' },
      { name: 'Duque de Caxias', state: 'RJ', country: 'Brasil', fullName: 'Duque de Caxias, RJ' },
      { name: 'Contagem', state: 'MG', country: 'Brasil', fullName: 'Contagem, MG' },
      { name: 'Uberlândia', state: 'MG', country: 'Brasil', fullName: 'Uberlândia, MG' },
      { name: 'Sorocaba', state: 'SP', country: 'Brasil', fullName: 'Sorocaba, SP' },
      { name: 'Remoto', state: '', country: '', fullName: 'Remoto' }
    ];

    return fallbackCities.filter(city =>
      city.name.toLowerCase().includes(query.toLowerCase()) ||
      city.fullName.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Verifica se o cache é válido
   * @param key Chave do cache
   * @returns True se o cache é válido
   */
  private isValidCache(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry) return false;
    
    if (Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return false;
    }
    
    return this.cache.has(key);
  }

  /**
   * Limpa o cache expirado
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }
}

// Exportar instância singleton
export const citiesService = new CitiesService();

// Limpar cache expirado a cada 10 minutos
setInterval(() => {
  citiesService.clearExpiredCache();
}, 10 * 60 * 1000);

export default citiesService;
