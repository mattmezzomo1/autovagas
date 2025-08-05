import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Star, Book, Briefcase, FileText, Sparkles, ArrowRight, Bot, Upload, X, ExternalLink, BookOpen, GraduationCap, Award, Zap, Tag, Clock } from 'lucide-react';
import { DocumentUpload } from '../components/dashboard/DocumentUpload';

interface SuggestionItem {
  id: number;
  title: string;
  description: string;
  originalPrice?: number;
  discountPrice?: number;
  discountPercentage?: number;
  relevance: number; // 1-5
  type: 'course' | 'book' | 'training' | 'certification' | 'skill';
  provider?: string;
  duration?: string;
  link?: string;
  image?: string;
  tags?: string[];
}

const Suggestions: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'courses' | 'books' | 'skills' | 'certifications'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = (file: File) => {
    setCurrentFile(file);
  };

  const handleGenerateCV = () => {
    setIsAnalyzing(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  const suggestions: SuggestionItem[] = [
    {
      id: 1,
      title: 'AWS Certified Solutions Architect',
      description: 'Certificação essencial para complementar suas habilidades em cloud e aumentar sua empregabilidade.',
      originalPrice: 299,
      discountPrice: 199,
      discountPercentage: 33,
      relevance: 5,
      type: 'certification',
      provider: 'AWS Training',
      duration: '3 meses',
      link: 'https://aws.amazon.com/pt/certification/certified-solutions-architect-associate/',
      tags: ['Cloud', 'AWS', 'Certificação'],
      image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=500&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Curso Completo de React & Node.js',
      description: 'Aprofunde seus conhecimentos em React e Node.js com este curso completo e prático.',
      originalPrice: 499.90,
      discountPrice: 299.90,
      discountPercentage: 40,
      relevance: 5,
      type: 'course',
      provider: 'TechAcademy',
      duration: '40 horas',
      link: 'https://example.com/curso-react-nodejs',
      tags: ['React', 'Node.js', 'JavaScript'],
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Arquitetura de Microsserviços',
      description: 'Aprenda a projetar, implementar e gerenciar arquiteturas baseadas em microsserviços.',
      originalPrice: 399,
      discountPrice: 279,
      discountPercentage: 30,
      relevance: 4,
      type: 'course',
      provider: 'Alura',
      duration: '30 horas',
      link: 'https://example.com/curso-microsservicos',
      tags: ['Arquitetura', 'Microsserviços', 'DevOps'],
      image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=500&h=300&fit=crop'
    },
    {
      id: 4,
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      description: 'Livro essencial para desenvolvedores que desejam escrever código limpo e manutenível.',
      originalPrice: 120,
      discountPrice: 89.90,
      discountPercentage: 25,
      relevance: 4,
      type: 'book',
      provider: 'Amazon',
      link: 'https://example.com/clean-code-book',
      tags: ['Livro', 'Boas Práticas', 'Código Limpo'],
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&h=300&fit=crop'
    },
    {
      id: 5,
      title: 'Liderança Técnica para Desenvolvedores',
      description: 'Desenvolva habilidades de liderança técnica para avançar na sua carreira como desenvolvedor.',
      originalPrice: 349,
      discountPrice: 249,
      discountPercentage: 29,
      relevance: 4,
      type: 'training',
      provider: 'Tech Leadership Academy',
      duration: '20 horas',
      link: 'https://example.com/lideranca-tecnica',
      tags: ['Liderança', 'Soft Skills', 'Carreira'],
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop'
    },
    {
      id: 6,
      title: 'Docker & Kubernetes: O Guia Completo',
      description: 'Domine a conteinerização e orquestração com Docker e Kubernetes.',
      originalPrice: 399.90,
      discountPrice: 249.90,
      discountPercentage: 38,
      relevance: 5,
      type: 'course',
      provider: 'Udemy',
      duration: '35 horas',
      link: 'https://example.com/docker-kubernetes',
      tags: ['Docker', 'Kubernetes', 'DevOps'],
      image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=500&h=300&fit=crop'
    },
    {
      id: 7,
      title: 'Portfólio de Projetos',
      description: 'Adicione um portfólio com seus projetos para destacar suas habilidades práticas.',
      relevance: 5,
      type: 'skill',
      tags: ['Portfólio', 'Projetos', 'GitHub'],
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&h=300&fit=crop'
    },
    {
      id: 8,
      title: 'Experiência com Liderança Técnica',
      description: 'Destaque sua experiência com liderança técnica no seu currículo e LinkedIn.',
      relevance: 4,
      type: 'skill',
      tags: ['Liderança', 'Currículo', 'LinkedIn'],
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500&h=300&fit=crop'
    },
    {
      id: 9,
      title: 'Patterns of Enterprise Application Architecture',
      description: 'Livro de Martin Fowler sobre padrões de arquitetura para aplicações empresariais.',
      originalPrice: 150,
      discountPrice: 119.90,
      discountPercentage: 20,
      relevance: 3,
      type: 'book',
      provider: 'Amazon',
      link: 'https://example.com/patterns-book',
      tags: ['Livro', 'Arquitetura', 'Padrões de Projeto'],
      image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=500&h=300&fit=crop'
    },
    {
      id: 10,
      title: 'GraphQL Masterclass',
      description: 'Aprenda a criar APIs eficientes e flexíveis com GraphQL.',
      originalPrice: 299,
      discountPrice: 199,
      discountPercentage: 33,
      relevance: 3,
      type: 'course',
      provider: 'Udemy',
      duration: '25 horas',
      link: 'https://example.com/graphql-masterclass',
      tags: ['GraphQL', 'API', 'Backend'],
      image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=500&h=300&fit=crop'
    },
    {
      id: 11,
      title: 'Certificação MongoDB Developer',
      description: 'Torne-se um desenvolvedor certificado MongoDB e destaque-se no mercado.',
      originalPrice: 249,
      discountPrice: 199,
      discountPercentage: 20,
      relevance: 3,
      type: 'certification',
      provider: 'MongoDB University',
      duration: '2 meses',
      link: 'https://example.com/mongodb-certification',
      tags: ['MongoDB', 'NoSQL', 'Certificação'],
      image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=500&h=300&fit=crop'
    },
    {
      id: 12,
      title: 'Inglês Técnico para Desenvolvedores',
      description: 'Aprimore seu inglês técnico para comunicação eficaz em ambientes de tecnologia.',
      originalPrice: 199,
      discountPrice: 149,
      discountPercentage: 25,
      relevance: 4,
      type: 'course',
      provider: 'TechEnglish',
      duration: '3 meses',
      link: 'https://example.com/tech-english',
      tags: ['Inglês', 'Comunicação', 'Carreira'],
      image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500&h=300&fit=crop'
    }
  ];

  const filteredSuggestions = suggestions.filter(suggestion => {
    // Filter by category
    if (activeCategory !== 'all') {
      if (activeCategory === 'courses' && suggestion.type !== 'course') return false;
      if (activeCategory === 'books' && suggestion.type !== 'book') return false;
      if (activeCategory === 'skills' && suggestion.type !== 'skill') return false;
      if (activeCategory === 'certifications' && suggestion.type !== 'certification') return false;
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        suggestion.title.toLowerCase().includes(searchLower) ||
        suggestion.description.toLowerCase().includes(searchLower) ||
        suggestion.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <GraduationCap className="w-6 h-6 text-purple-400" />;
      case 'book':
        return <BookOpen className="w-6 h-6 text-purple-400" />;
      case 'training':
        return <Briefcase className="w-6 h-6 text-purple-400" />;
      case 'certification':
        return <Award className="w-6 h-6 text-purple-400" />;
      case 'skill':
        return <Zap className="w-6 h-6 text-purple-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-purple-400" />;
    }
  };

  const getRelevanceStars = (relevance: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < relevance ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}`}
      />
    ));
  };

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'courses':
        return 'from-blue-500/10 to-indigo-500/10 border-blue-500/20';
      case 'books':
        return 'from-green-500/10 to-teal-500/10 border-green-500/20';
      case 'skills':
        return 'from-pink-500/10 to-purple-500/10 border-pink-500/20';
      case 'certifications':
        return 'from-amber-500/10 to-orange-500/10 border-amber-500/20';
      default:
        return 'from-purple-500/10 to-indigo-500/10 border-purple-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-purple-100 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Dashboard
          </Link>

          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Sugestões Personalizadas</h1>
                <p className="text-purple-200">Recomendações para melhorar seu currículo e aumentar suas chances de contratação</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-purple-200">Sugestões disponíveis</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">5</div>
                <div className="text-purple-200">Altamente relevantes</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">40%</div>
                <div className="text-purple-200">Desconto médio</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Filters and Upload */}
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input
                type="text"
                placeholder="Buscar sugestões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 pl-12 pr-4 py-3 text-purple-100"
              />
            </div>

            {/* Category Filters */}
            <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Categorias</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${activeCategory === 'all' ? 'bg-purple-500 text-white' : 'text-purple-200 hover:bg-white/5'}`}
                >
                  Todas as sugestões
                </button>
                <button
                  onClick={() => setActiveCategory('courses')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${activeCategory === 'courses' ? 'bg-blue-500 text-white' : 'text-purple-200 hover:bg-white/5'}`}
                >
                  Cursos e Treinamentos
                </button>
                <button
                  onClick={() => setActiveCategory('books')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${activeCategory === 'books' ? 'bg-green-500 text-white' : 'text-purple-200 hover:bg-white/5'}`}
                >
                  Livros e Recursos
                </button>
                <button
                  onClick={() => setActiveCategory('skills')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${activeCategory === 'skills' ? 'bg-pink-500 text-white' : 'text-purple-200 hover:bg-white/5'}`}
                >
                  Habilidades a Desenvolver
                </button>
                <button
                  onClick={() => setActiveCategory('certifications')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${activeCategory === 'certifications' ? 'bg-amber-500 text-white' : 'text-purple-200 hover:bg-white/5'}`}
                >
                  Certificações
                </button>
              </div>
            </div>

            {/* CV Upload */}
            <div>
              <DocumentUpload
                title="Atualize seu Currículo"
                description="Envie seu currículo atualizado para receber sugestões mais precisas"
                onUpload={handleFileUpload}
                currentFile={currentFile}
                showAIGeneration={true}
                onGenerate={handleGenerateCV}
              />
            </div>

            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-xl border border-indigo-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Assistente de Carreira</h3>
              </div>
              <p className="text-purple-200 mb-4">
                Converse com nosso assistente de IA para receber orientações personalizadas sobre sua carreira
              </p>
              <button className="w-full btn-primary bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                <Bot className="w-5 h-5" />
                Iniciar Conversa
              </button>
            </div>
          </div>

          {/* Right Column - Suggestions */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Sugestões para você</h2>
              <div className="text-purple-200">
                {filteredSuggestions.length} {filteredSuggestions.length === 1 ? 'resultado' : 'resultados'}
              </div>
            </div>

            {filteredSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {filteredSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`bg-gradient-to-br ${getCategoryGradient(suggestion.type)} backdrop-blur-xl rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col`}
                  >
                    {/* Imagem do card */}
                    {suggestion.image && (
                      <div className="relative w-full h-48 overflow-hidden">
                        <img
                          src={suggestion.image}
                          alt={suggestion.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        {suggestion.discountPercentage && (
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg transform rotate-2">
                            {suggestion.discountPercentage}% OFF
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1">
                          {getRelevanceStars(suggestion.relevance)}
                        </div>
                      </div>
                    )}

                    {/* Conteúdo do card */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                          {getTypeIcon(suggestion.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{suggestion.title}</h3>
                          {suggestion.provider && (
                            <div className="text-purple-200 text-sm">{suggestion.provider}</div>
                          )}
                        </div>
                      </div>

                      <p className="text-purple-200 mb-4">{suggestion.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {suggestion.tags?.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 rounded-full text-xs text-purple-200"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        {suggestion.duration && (
                          <div className="flex items-center gap-1 text-purple-200 text-sm">
                            <Clock className="w-4 h-4" />
                            {suggestion.duration}
                          </div>
                        )}
                      </div>

                      {/* Preço e desconto */}
                      {suggestion.discountPrice && (
                        <div className="flex items-center justify-between mb-4 mt-auto">
                          <div>
                            <span className="text-lg font-bold text-white">R$ {suggestion.discountPrice.toFixed(2)}</span>
                            {suggestion.originalPrice && (
                              <span className="text-purple-300 line-through ml-2">R$ {suggestion.originalPrice.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Botão de ação */}
                      {suggestion.link ? (
                        <a
                          href={suggestion.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {suggestion.type === 'course' || suggestion.type === 'training' ? 'Ver Curso' :
                           suggestion.type === 'book' ? 'Ver Livro' :
                           suggestion.type === 'certification' ? 'Ver Certificação' : 'Saiba Mais'}
                        </a>
                      ) : (
                        <button className="w-full py-3 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2 transform hover:scale-[1.02]">
                          <ArrowRight className="w-4 h-4" />
                          Implementar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Nenhuma sugestão encontrada</h3>
                <p className="text-purple-200 mb-4">Tente ajustar seus filtros ou termos de busca</p>
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchTerm('');
                  }}
                  className="btn-secondary px-4 py-2"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suggestions;
