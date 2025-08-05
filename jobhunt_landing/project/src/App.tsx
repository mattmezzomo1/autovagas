import React, { useEffect } from 'react';
import { Bot, CheckCircle2, ChevronDown, Star, Users, Search, MessageSquareText, Target, Brain, TrendingUp, BarChart, Briefcase, UserSearch, Clock, Award, Building } from 'lucide-react';
import SEO, { seoConfigs } from './components/SEO';

function App() {
  // Efeito para ativar o bypass escondido
  useEffect(() => {
    let clickCount = 0;

    const handleLogoClick = () => {
      clickCount++;
      if (clickCount >= 5) {
        const bypassButton = document.getElementById('bypass-trigger');
        if (bypassButton) {
          bypassButton.classList.remove('opacity-0', 'pointer-events-none');
          bypassButton.classList.add('opacity-100');
          console.log('🚀 Bypass ativado! Clique em "Acesso Direto" no footer.');
        }
      }
    };

    // Adicionar event listener após um pequeno delay para garantir que o DOM está carregado
    const timer = setTimeout(() => {
      const logo = document.querySelector('#footer-logo');
      if (logo) {
        logo.addEventListener('click', handleLogoClick);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      const logo = document.querySelector('#footer-logo');
      if (logo) {
        logo.removeEventListener('click', handleLogoClick);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* SEO Component */}
      <SEO {...seoConfigs.home} />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(29,78,216,0.05),transparent)] pointer-events-none" style={{height: '100vh'}} />
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-16 md:px-8 md:pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="relative z-10 mx-auto max-w-3xl transform transition-all hover:scale-[1.01] duration-300 animate-fade-in">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Pare de procurar emprego.{' '}
                <span className="text-blue-600">Deixe a IA aplicar por você.</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 font-normal leading-relaxed">
                A AutoVagas é a primeira plataforma que encontra vagas compatíveis com seu perfil e aplica automaticamente todos os dias. Você só precisa subir seu currículo. A IA faz o resto.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <a href="https://cn2aktbl.forms.app/formulario-de-registro-plataforma-de-ia-de-emprego" className="rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                  Subir Currículo e Começar Agora
                </a>
                <p className="mt-2 text-sm text-gray-500 animate-fade-in animate-delay-200">Leva menos de 2 minutos.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section - Logo abaixo da chamada principal */}
      <section className="mx-auto mt-16 max-w-4xl px-6 md:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl animate-fade-in">
            Veja a AutoVagas em ação
          </h2>
          <p className="mt-4 text-lg text-gray-600 font-normal leading-relaxed animate-fade-in animate-delay-100">
            Descubra como nossa IA encontra e aplica em vagas automaticamente
          </p>
        </div>
        <div className="rounded-xl overflow-hidden shadow-2xl w-full h-[400px] md:h-[500px] animate-fade-in animate-delay-200">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/7k4NFYFy-ec"
            title="AutoVagas em ação - Como funciona a aplicação automática em vagas"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </section>

      {/* Logos Section */}
      <section className="relative mt-20 overflow-hidden py-12">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight text-blue-700 mb-6 animate-fade-in">
            <span className="relative inline-block">
              <span className="relative z-10">Nossos usuários já conseguiram entrevistas em empresas como:</span>
              <span className="absolute bottom-0 left-0 right-0 h-3 bg-blue-100 opacity-30 -z-10 transform -rotate-1"></span>
            </span>
          </h2>
          <div className="relative mt-8 mx-auto overflow-hidden w-full">
            <div className="flex animate-scroll space-x-8 whitespace-nowrap">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex space-x-8">
                  {[
                    'Google',
                    'Nubank',
                    'iFood',
                    'XP Inc',
                    'Meta',
                    'Amazon',
                    'Microsoft',
                    'Itaú',
                    'Bradesco',
                    'Magazine Luiza'
                  ].map((company) => (
                    <div key={company} className="flex justify-center grayscale transition-all duration-300 hover:grayscale-0 hover:scale-110 px-6 py-3">
                      <span className="text-lg font-bold text-gray-500">{company}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-[#F4F9FF] via-[#F4F9FF] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[30%] bg-gradient-to-l from-white via-white to-transparent" />
          </div>
        </div>
      </section>

      {/* Problem + Solution */}
      <section className="mx-auto mt-20 max-w-7xl px-6 md:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl animate-fade-in">
            Cansado de mandar currículos e nunca receber resposta?
          </h2>
          <p className="mt-6 text-lg text-gray-600 font-normal leading-relaxed">
            Você já perdeu horas aplicando em vagas, preenchendo formulários e esperando um retorno que nunca veio?
            A maioria das oportunidades nem chega até você — e quando chega, você está competindo com centenas de pessoas.
          </p>
          <div className="mt-8 bg-blue-50 p-8 rounded-xl animate-fade-in animate-delay-100 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-blue-900 animate-pulse">Com a AutoVagas, você vira o jogo.</h3>
            <p className="mt-2 text-blue-700">
              A IA aplica em dezenas de vagas certas todos os dias, mesmo enquanto você dorme.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="mx-auto mt-20 max-w-7xl px-6 md:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Como funciona em 4 passos simples:
        </h2>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Envie seu currículo',
              description: 'Você envia seu currículo ou conecta o LinkedIn',
              icon: Users,
            },
            {
              title: 'IA analisa seu perfil',
              description: 'A IA analisa seu perfil e identifica seus pontos fortes',
              icon: Bot,
            },
            {
              title: 'Aplicação automática',
              description: 'Ela busca e aplica em vagas compatíveis todos os dias',
              icon: CheckCircle2,
            },
            {
              title: 'Acompanhamento',
              description: 'Você acompanha tudo pelo painel de controle',
              icon: ChevronDown,
            },
          ].map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center text-center transform transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg">
                <step.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto mt-20 max-w-7xl px-6 md:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Tecnologia de ponta ao seu favor 🚀
        </h2>
        <p className="mt-4 text-center text-lg text-gray-600 font-normal leading-relaxed max-w-2xl mx-auto">
          Nossa plataforma utiliza inteligência artificial avançada para maximizar suas chances de sucesso na busca por emprego
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Busca Inteligente',
              description: 'Busca vagas em dezenas de sites automaticamente usando IA para encontrar as melhores correspondências',
              icon: Search,
              gradient: 'from-purple-500 to-indigo-500',
              image: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&q=80',
            },
            {
              title: 'Aplicação Automática',
              description: 'Aplica com seus dados e responde questionários automaticamente, economizando seu tempo precioso',
              icon: MessageSquareText,
              gradient: 'from-blue-500 to-cyan-500',
              image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80',
            },
            {
              title: 'Otimização de Keywords',
              description: 'Detecta e otimiza palavras-chave para aumentar sua visibilidade para recrutadores',
              icon: Target,
              gradient: 'from-emerald-500 to-teal-500',
              image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
            },
            {
              title: 'Treinamento com IA',
              description: 'Treina você para entrevistas usando simulações realistas baseadas em IA',
              icon: Brain,
              gradient: 'from-orange-500 to-pink-500',
              image: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&q=80',
            },
            {
              title: 'Otimização de Currículo',
              description: 'Otimiza seu currículo automaticamente com base nas últimas tendências do mercado',
              icon: TrendingUp,
              gradient: 'from-red-500 to-rose-500',
              image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80',
            },
            {
              title: 'Analytics em Tempo Real',
              description: 'Acompanhamento detalhado de todas as suas aplicações e resultados',
              icon: BarChart,
              gradient: 'from-yellow-500 to-orange-500',
              image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative z-10">
                <div className={`inline-flex rounded-2xl p-4 bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600 font-normal leading-relaxed">{feature.description}</p>
              </div>
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto mt-20 max-w-7xl px-6 md:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Resultados que falam por si:
        </h2>
        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {[
            {
              content: "Fui contratado em menos de um mês. A IA aplicou para mais de 50 vagas enquanto eu cuidava da minha filha.",
              author: "Mariana Souza",
              role: "Analista de Marketing",
            },
            {
              content: "Recebi 5 entrevistas em 10 dias. Nem sabia que existiam tantas vagas com o meu perfil.",
              author: "Lucas Martins",
              role: "Desenvolvedor Fullstack",
            },
          ].map((testimonial, index) => (
            <div key={index} className="rounded-2xl glass-effect p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={`${index}-${i}`} className="h-5 w-5 text-yellow-400" fill="currentColor" />
                ))}
              </div>
              <p className="mt-4 text-lg text-gray-600 font-normal leading-relaxed">{testimonial.content}</p>
              <div className="mt-6">
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-gray-600 font-normal">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto mt-20 max-w-7xl px-6 md:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Escolha o plano ideal pra você
        </h2>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:max-w-4xl lg:mx-auto">
          {[
            {
              name: 'Básico',
              price: '54',
              features: [
                '100 aplicações/mês',
                'Análise otimizada por IA',
                'Painel de controle',
                'Suporte por email',
                'Relatórios semanais',
              ],
              cta: 'Assinar Plano Básico',
              featured: false,
            },
            {
              name: 'Plus',
              price: '97',
              features: [
                '500 aplicações/mês',
                'Análise avançada por IA',
                'Entrevistas simuladas',
                'Respostas automáticas',
                'Suporte prioritário 24/7',
                'Relatórios detalhados',
              ],
              cta: 'Assinar Plano Plus',
              featured: true,
            },
            {
              name: 'Premium',
              price: '147',
              features: [
                '1000 aplicações/mês',
                'Análise personalizada por IA',
                'Treinamento de entrevistas',
                'Respostas automáticas',
                'Suporte prioritário 24/7',
                'Relatórios detalhados',
              ],
              cta: 'Assinar Plano Premium',
            }
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 ring-1 ring-gray-200 ${
                plan.featured ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ring-blue-600 shadow-xl' : 'glass-effect'
              }`}
            >
              <h3 className="text-2xl font-semibold">{plan.name}</h3>
              <p className="mt-4 text-4xl font-bold">
                R$ {plan.price}
                <span className="text-lg font-normal">/mês</span>
              </p>
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckCircle2 className={`h-5 w-5 ${plan.featured ? 'text-white' : 'text-blue-600'}`} />
                    <span className="ml-3">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://cn2aktbl.forms.app/formulario-de-registro-plataforma-de-ia-de-emprego"
                className={`mt-8 block w-full rounded-full px-6 py-4 text-center text-base font-semibold ${
                  plan.featured
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* AutoVagas para Empresas */}
      <section className="mx-auto mt-20 max-w-7xl px-6 md:px-8">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-50 shadow-xl">
          <div className="px-6 py-12 sm:px-12 sm:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                <span className="block text-blue-600 text-4xl md:text-5xl mb-2">AutoVagas para Empresas:</span>
                Encontre os melhores talentos com IA
              </h2>
              <p className="mt-6 text-lg text-gray-600 font-normal leading-relaxed">
                Revolucione seu processo de recrutamento com nossa plataforma de IA. Encontre candidatos qualificados mais rápido, reduza custos e elimine o viés inconsciente na seleção.
              </p>
              <div className="mt-12 grid gap-8 sm:grid-cols-3">
                {[
                  {
                    title: 'Matching inteligente',
                    description: 'Nossa IA encontra os candidatos mais compatíveis com suas vagas',
                    icon: UserSearch,
                  },
                  {
                    title: 'Economia de tempo',
                    description: 'Reduza em até 70% o tempo gasto no processo de recrutamento',
                    icon: Clock,
                  },
                  {
                    title: 'Qualidade superior',
                    description: 'Aumente a taxa de retenção com contratações mais precisas',
                    icon: Award,
                  },
                ].map((benefit, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="flex-shrink-0">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
                        <benefit.icon className="h-8 w-8" />
                      </div>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-gray-900">{benefit.title}</h3>
                    <p className="mt-2 text-gray-600">{benefit.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                <a
                  href="https://cn2aktbl.forms.app/formulario-de-registro-plataforma-de-ia-de-emprego"
                  className="rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Começar em 3 minutos
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-20 max-w-3xl px-6 md:px-8 relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(29,78,216,0.05),transparent)]" />
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Perguntas Frequentes
        </h2>
        <dl className="mt-16 space-y-6">
          {[
            {
              question: 'Isso realmente funciona?',
              answer: 'Sim! Nossa IA foi treinada para identificar e aplicar em vagas compatíveis com seu perfil, aumentando significativamente suas chances de conseguir entrevistas.',
            },
            {
              question: 'A IA aplica mesmo quando estou offline?',
              answer: 'Sim, a IA trabalha 24/7 buscando e aplicando em vagas que correspondam ao seu perfil, mesmo quando você não está online.',
            },
            {
              question: 'E se eu não gostar? Tem reembolso?',
              answer: 'Oferecemos garantia de 7 dias. Se você não estiver satisfeito, devolvemos 100% do seu dinheiro.',
            },
            {
              question: 'Posso cancelar a qualquer momento?',
              answer: 'Sim, você pode cancelar sua assinatura quando quiser, sem multa ou burocracia.',
            },
            {
              question: 'E se eu não tiver experiência?',
              answer: 'Nossa IA adapta a busca ao seu perfil, encontrando vagas adequadas para todos os níveis de experiência, incluindo estágios e posições júnior.',
            },
          ].map((faq, faqIndex) => (
            <div
              key={faq.question}
              className="group rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${faqIndex * 100}ms` }}
            >
              <dt className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                <div className="h-8 w-8 rounded-full bg-blue-50 p-1.5 text-blue-600 transition-transform duration-300 group-hover:bg-blue-100 group-hover:rotate-180">
                  <ChevronDown className="h-full w-full" />
                </div>
              </dt>
              <dd className="mt-4 text-gray-600 border-t border-gray-100 pt-4">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Final CTA */}
      <section className="mx-auto mt-20 max-w-7xl px-6 pb-20 md:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-6 py-20 text-center sm:px-16 shadow-2xl transform transition-all duration-500 hover:shadow-blue-500/20">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Sua próxima vaga já está esperando.<br />
            Deixe a AutoVagas encontrá-la por você.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 font-normal leading-relaxed">
            Não desperdice mais horas do seu tempo. Suba seu currículo, ative sua IA e dê o próximo passo na sua carreira agora mesmo.
          </p>
          <a
            href="https://cn2aktbl.forms.app/formulario-de-registro-plataforma-de-ia-de-emprego"
            className="mt-8 inline-block rounded-full bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-sm hover:bg-blue-50"
          >
            COMEÇAR AGORA
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo e Descrição */}
            <div className="md:col-span-2">
              <div id="footer-logo" className="flex items-center space-x-2 mb-4 cursor-pointer select-none">
                <Bot className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">AutoVagas</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                A primeira plataforma que usa IA para encontrar e aplicar automaticamente em vagas compatíveis com seu perfil.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.864 3.708 13.713 3.708 12.416s.49-2.448 1.297-3.323C5.832 8.218 6.983 7.728 8.28 7.728s2.448.49 3.323 1.297c.827.827 1.297 1.978 1.297 3.275s-.49 2.448-1.297 3.323c-.875.827-2.026 1.297-3.323 1.297zm7.598 0c-1.297 0-2.448-.49-3.323-1.297-.827-.827-1.297-1.978-1.297-3.275s.49-2.448 1.297-3.323c.875-.827 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.827.827 1.297 1.978 1.297 3.275s-.49 2.448-1.297 3.323c-.875.827-2.026 1.297-3.323 1.297z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Links Úteis */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Suporte</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contato</a></li>
                {/* Bypass escondido - só aparece quando clicado 5 vezes no logo */}
                <li>
                  <button
                    id="bypass-trigger"
                    className="text-gray-300 hover:text-white transition-all duration-300 opacity-0 pointer-events-none"
                    onClick={() => {
                      window.open('https://app.autovagas.com.br/login', '_blank');
                    }}
                    title="Acesso direto à plataforma"
                  >
                    🚀 Acesso Direto
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 AutoVagas. Todos os direitos reservados.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Feito com ❤️ para revolucionar sua busca por emprego
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;