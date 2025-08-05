import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  MessageSquare,
  FileQuestion,
  Brain,
  Target,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  idealAnswer: string;
  weight: number;
  category: 'technical' | 'behavioral' | 'general';
}

interface TechnicalTest {
  id: string;
  name: string;
  description: string;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: string[];
}

interface PsychologicalTest {
  id: string;
  name: string;
  description: string;
  traits: string[];
  timeLimit: number;
}

interface AIInterviewConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
  initialConfig?: any;
}

export const AIInterviewConfig: React.FC<AIInterviewConfigProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'technical' | 'psychological'>('questions');
  
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      return initialConfig?.questions || [
        {
          id: '1',
          question: 'Conte-me sobre sua experiência com desenvolvimento web',
          idealAnswer: 'Experiência sólida com tecnologias modernas, projetos práticos, capacidade de resolver problemas complexos',
          weight: 8,
          category: 'technical'
        }
      ];
    } catch (error) {
      console.error('Erro ao inicializar questions:', error);
      return [];
    }
  });

  const [technicalTests, setTechnicalTests] = useState<TechnicalTest[]>(() => {
    try {
      return initialConfig?.technicalTests || [
        {
          id: '1',
          name: 'Teste de Lógica de Programação',
          description: 'Avalia capacidade de resolver problemas algorítmicos',
          timeLimit: 60,
          difficulty: 'medium',
          questions: ['Implemente um algoritmo de ordenação', 'Resolva problema de estrutura de dados']
        }
      ];
    } catch (error) {
      console.error('Erro ao inicializar technicalTests:', error);
      return [];
    }
  });

  const [psychologicalTests, setPsychologicalTests] = useState<PsychologicalTest[]>(() => {
    try {
      return initialConfig?.psychologicalTests || [
        {
          id: '1',
          name: 'Perfil Comportamental',
          description: 'Avalia características de personalidade e comportamento profissional',
          traits: ['Liderança', 'Trabalho em equipe', 'Comunicação', 'Adaptabilidade'],
          timeLimit: 30
        }
      ];
    } catch (error) {
      console.error('Erro ao inicializar psychologicalTests:', error);
      return [];
    }
  });

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    idealAnswer: '',
    weight: 5,
    category: 'general' as const
  });

  const [newTechnicalTest, setNewTechnicalTest] = useState({
    name: '',
    description: '',
    timeLimit: 60,
    difficulty: 'medium' as const,
    questions: ['']
  });

  const [newPsychTest, setNewPsychTest] = useState({
    name: '',
    description: '',
    traits: [''],
    timeLimit: 30
  });

  if (!isOpen) return null;

  // Verificação de segurança para evitar erros
  if (!questions || !technicalTests || !psychologicalTests) {
    return null;
  }

  const addQuestion = () => {
    if (newQuestion.question && newQuestion.idealAnswer) {
      setQuestions([...questions, {
        id: Date.now().toString(),
        ...newQuestion
      }]);
      setNewQuestion({
        question: '',
        idealAnswer: '',
        weight: 5,
        category: 'general'
      });
    }
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addTechnicalTest = () => {
    if (newTechnicalTest.name && newTechnicalTest.description) {
      setTechnicalTests([...technicalTests, {
        id: Date.now().toString(),
        ...newTechnicalTest,
        questions: newTechnicalTest.questions.filter(q => q.trim())
      }]);
      setNewTechnicalTest({
        name: '',
        description: '',
        timeLimit: 60,
        difficulty: 'medium',
        questions: ['']
      });
    }
  };

  const addPsychTest = () => {
    if (newPsychTest.name && newPsychTest.description) {
      setPsychologicalTests([...psychologicalTests, {
        id: Date.now().toString(),
        ...newPsychTest,
        traits: newPsychTest.traits.filter(t => t.trim())
      }]);
      setNewPsychTest({
        name: '',
        description: '',
        traits: [''],
        timeLimit: 30
      });
    }
  };

  const handleSave = () => {
    const config = {
      questions,
      technicalTests,
      psychologicalTests,
      enabled: true
    };
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-3xl border border-white/10 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Configuração da Entrevista com IA</h2>
              <p className="text-white/60 text-sm">Configure perguntas, testes técnicos e avaliações comportamentais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-6 py-4 transition-colors ${
              activeTab === 'questions'
                ? 'bg-purple-500/20 text-purple-200 border-b-2 border-purple-500'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Perguntas da Entrevista
          </button>
          <button
            onClick={() => setActiveTab('technical')}
            className={`flex items-center gap-2 px-6 py-4 transition-colors ${
              activeTab === 'technical'
                ? 'bg-purple-500/20 text-purple-200 border-b-2 border-purple-500'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            Testes Técnicos
          </button>
          <button
            onClick={() => setActiveTab('psychological')}
            className={`flex items-center gap-2 px-6 py-4 transition-colors ${
              activeTab === 'psychological'
                ? 'bg-purple-500/20 text-purple-200 border-b-2 border-purple-500'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-4 h-4" />
            Testes Psicológicos
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-medium text-white mb-4">Adicionar Nova Pergunta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Pergunta</label>
                    <textarea
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                      placeholder="Digite a pergunta da entrevista..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Resposta Ideal</label>
                    <textarea
                      value={newQuestion.idealAnswer}
                      onChange={(e) => setNewQuestion({...newQuestion, idealAnswer: e.target.value})}
                      placeholder="Descreva a resposta ideal esperada..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Categoria</label>
                    <select
                      value={newQuestion.category}
                      onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="general">Geral</option>
                      <option value="technical">Técnica</option>
                      <option value="behavioral">Comportamental</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Peso (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newQuestion.weight}
                      onChange={(e) => setNewQuestion({...newQuestion, weight: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <button
                  onClick={addQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Pergunta
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Perguntas Configuradas ({questions.length})</h3>
                {questions.map((question) => (
                  <div key={question.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            question.category === 'technical' ? 'bg-blue-500/20 text-blue-400' :
                            question.category === 'behavioral' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {question.category === 'technical' ? 'Técnica' :
                             question.category === 'behavioral' ? 'Comportamental' : 'Geral'}
                          </span>
                          <span className="text-yellow-400 text-xs">Peso: {question.weight}</span>
                        </div>
                        <h4 className="text-white font-medium mb-2">{question.question}</h4>
                        <p className="text-white/60 text-sm">{question.idealAnswer}</p>
                      </div>
                      <button
                        onClick={() => removeQuestion(question.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-medium text-white mb-4">Adicionar Novo Teste Técnico</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Nome do Teste</label>
                    <input
                      type="text"
                      value={newTechnicalTest.name}
                      onChange={(e) => setNewTechnicalTest({...newTechnicalTest, name: e.target.value})}
                      placeholder="Ex: Teste de Algoritmos"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Tempo Limite (minutos)</label>
                    <input
                      type="number"
                      min="15"
                      max="180"
                      value={newTechnicalTest.timeLimit}
                      onChange={(e) => setNewTechnicalTest({...newTechnicalTest, timeLimit: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Descrição</label>
                    <textarea
                      value={newTechnicalTest.description}
                      onChange={(e) => setNewTechnicalTest({...newTechnicalTest, description: e.target.value})}
                      placeholder="Descreva o que será avaliado..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Dificuldade</label>
                    <select
                      value={newTechnicalTest.difficulty}
                      onChange={(e) => setNewTechnicalTest({...newTechnicalTest, difficulty: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="easy">Fácil</option>
                      <option value="medium">Médio</option>
                      <option value="hard">Difícil</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-white font-medium mb-2">Questões/Exercícios</label>
                  {newTechnicalTest.questions.map((question, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => {
                          const updated = [...newTechnicalTest.questions];
                          updated[index] = e.target.value;
                          setNewTechnicalTest({...newTechnicalTest, questions: updated});
                        }}
                        placeholder={`Questão ${index + 1}`}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      {newTechnicalTest.questions.length > 1 && (
                        <button
                          onClick={() => {
                            const updated = newTechnicalTest.questions.filter((_, i) => i !== index);
                            setNewTechnicalTest({...newTechnicalTest, questions: updated});
                          }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setNewTechnicalTest({...newTechnicalTest, questions: [...newTechnicalTest.questions, '']})}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Questão
                  </button>
                </div>
                <button
                  onClick={addTechnicalTest}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Teste Técnico
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Testes Técnicos Configurados ({technicalTests.length})</h3>
                {technicalTests.map((test) => (
                  <div key={test.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            test.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                            test.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {test.difficulty === 'easy' ? 'Fácil' :
                             test.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                          </span>
                          <span className="text-blue-400 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {test.timeLimit} min
                          </span>
                        </div>
                        <h4 className="text-white font-medium mb-2">{test.name}</h4>
                        <p className="text-white/60 text-sm mb-2">{test.description}</p>
                        <div className="text-white/40 text-xs">
                          {test.questions.length} questão(ões) configurada(s)
                        </div>
                      </div>
                      <button
                        onClick={() => setTechnicalTests(technicalTests.filter(t => t.id !== test.id))}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'psychological' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-medium text-white mb-4">Adicionar Novo Teste Psicológico</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Nome do Teste</label>
                    <input
                      type="text"
                      value={newPsychTest.name}
                      onChange={(e) => setNewPsychTest({...newPsychTest, name: e.target.value})}
                      placeholder="Ex: Perfil Comportamental DISC"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Tempo Limite (minutos)</label>
                    <input
                      type="number"
                      min="10"
                      max="60"
                      value={newPsychTest.timeLimit}
                      onChange={(e) => setNewPsychTest({...newPsychTest, timeLimit: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-white font-medium mb-2">Descrição</label>
                  <textarea
                    value={newPsychTest.description}
                    onChange={(e) => setNewPsychTest({...newPsychTest, description: e.target.value})}
                    placeholder="Descreva o que será avaliado no teste psicológico..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white font-medium mb-2">Características Avaliadas</label>
                  {newPsychTest.traits.map((trait, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={trait}
                        onChange={(e) => {
                          const updated = [...newPsychTest.traits];
                          updated[index] = e.target.value;
                          setNewPsychTest({...newPsychTest, traits: updated});
                        }}
                        placeholder={`Característica ${index + 1}`}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      {newPsychTest.traits.length > 1 && (
                        <button
                          onClick={() => {
                            const updated = newPsychTest.traits.filter((_, i) => i !== index);
                            setNewPsychTest({...newPsychTest, traits: updated});
                          }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setNewPsychTest({...newPsychTest, traits: [...newPsychTest.traits, '']})}
                    className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Característica
                  </button>
                </div>
                <button
                  onClick={addPsychTest}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Teste Psicológico
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Testes Psicológicos Configurados ({psychologicalTests.length})</h3>
                {psychologicalTests.map((test) => (
                  <div key={test.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-purple-400 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {test.timeLimit} min
                          </span>
                        </div>
                        <h4 className="text-white font-medium mb-2">{test.name}</h4>
                        <p className="text-white/60 text-sm mb-2">{test.description}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {test.traits.map((trait, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-200 rounded text-xs">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setPsychologicalTests(psychologicalTests.filter(t => t.id !== test.id))}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <div className="text-white/60 text-sm">
            {questions.length} pergunta(s), {technicalTests.length} teste(s) técnico(s), {psychologicalTests.length} teste(s) psicológico(s)
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200"
            >
              <CheckCircle className="w-4 h-4" />
              Salvar Configuração
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
