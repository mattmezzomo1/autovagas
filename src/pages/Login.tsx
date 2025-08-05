import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { useAuthStore } from '../store/auth';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { setMockProfile, setAdminProfile } = useAuthStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica se deve entrar como admin ou usuário normal
    if (isAdmin) {
      setAdminProfile();
      navigate('/admin');
    } else {
      setMockProfile();
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Bem-vindo de volta
          </h2>
          <p className="mt-4 text-lg text-purple-200">
            Entre para continuar sua busca por oportunidades
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="seu.email@exemplo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-purple-200">
                  Lembrar-me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-purple-300 hover:text-purple-200">
                  Esqueceu sua senha?
                </a>
              </div>
            </div>

            {/* Opção de login como administrador */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsAdmin(!isAdmin)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm w-full justify-center transition-colors ${
                  isAdmin
                    ? 'bg-purple-500/30 text-white border border-purple-500/50'
                    : 'bg-black/20 text-purple-200 border border-white/10 hover:bg-black/30'
                }`}
              >
                <Shield className="w-4 h-4" />
                {isAdmin ? 'Modo Administrador Ativado' : 'Entrar como Administrador'}
              </button>
            </div>

            <button
              type="submit"
              className="w-full btn-primary mt-6"
            >
              Entrar
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="text-center mt-4">
              <span className="text-purple-200">Ainda não tem uma conta? </span>
              <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
                Cadastre-se
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};