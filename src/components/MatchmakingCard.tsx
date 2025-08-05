import React, { useState } from 'react';
import { Users, UserPlus, X, Check, MessageCircle } from 'lucide-react';

interface MatchUser {
  id: string;
  fullName: string;
  title: string;
  location: string;
  profileImage?: string;
  skills: string[];
  experience: number;
}

interface Match {
  id: string;
  user: MatchUser;
  score: number;
  matchReasons: string[];
  status: 'pending' | 'accepted' | 'rejected';
}

const MatchmakingCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([
    {
      id: '1',
      user: {
        id: '101',
        fullName: 'Ana Silva',
        title: 'UX/UI Designer',
        location: 'São Paulo, SP',
        profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
        skills: ['UI Design', 'User Research', 'Figma', 'Adobe XD', 'Prototyping'],
        experience: 4,
      },
      score: 85,
      matchReasons: [
        'Compartilham 3 habilidades, incluindo UI Design, Figma, Prototyping',
        'Habilidades complementares: você tem React, JavaScript e Ana tem User Research, Adobe XD',
        'Localizações em comum: São Paulo',
      ],
      status: 'pending',
    },
    {
      id: '2',
      user: {
        id: '102',
        fullName: 'Carlos Mendes',
        title: 'Backend Developer',
        location: 'Remoto',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        skills: ['Node.js', 'Express', 'MongoDB', 'AWS', 'Docker'],
        experience: 6,
      },
      score: 78,
      matchReasons: [
        'Habilidades complementares: você tem React, JavaScript e Carlos tem Node.js, Express',
        'Interesse em indústrias similares: Tecnologia, E-commerce',
      ],
      status: 'pending',
    },
  ]);

  const handleFindConnections = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const handleAcceptMatch = (matchId: string) => {
    setMatches(matches.map(match => 
      match.id === matchId 
        ? { ...match, status: 'accepted' as const } 
        : match
    ));
  };

  const handleRejectMatch = (matchId: string) => {
    setMatches(matches.map(match => 
      match.id === matchId 
        ? { ...match, status: 'rejected' as const } 
        : match
    ));
  };

  const handleMessageUser = (userId: string) => {
    console.log(`Open chat with user ${userId}`);
    // This would open a chat with the user
  };

  return (
    <div className="space-y-6">
      {/* Matchmaking Card */}
      <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 backdrop-blur-xl rounded-3xl border border-green-500/20 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Matchmaking</h3>
        </div>
        <p className="text-purple-200 mb-4">
          Encontre profissionais com objetivos similares e skills complementares
        </p>
        <button
          onClick={handleFindConnections}
          className={`w-full btn-primary bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Buscando...
            </>
          ) : (
            <>
              <Users className="w-5 h-5 mr-2" />
              Encontrar Conexões
            </>
          )}
        </button>
      </div>

      {/* Matches List */}
      {matches.length > 0 && (
        <div className="bg-gradient-to-br from-green-500/5 to-teal-500/5 backdrop-blur-xl rounded-3xl border border-green-500/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Conexões Sugeridas</h3>
          <div className="space-y-4">
            {matches.map((match) => (
              <div 
                key={match.id} 
                className={`bg-white/5 rounded-xl p-4 transition-all ${
                  match.status === 'accepted' 
                    ? 'border border-green-500/30' 
                    : match.status === 'rejected' 
                      ? 'opacity-50' 
                      : 'hover:bg-white/10'
                }`}
              >
                <div className="flex gap-4">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      {match.user.profileImage ? (
                        <img 
                          src={match.user.profileImage} 
                          alt={match.user.fullName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">
                            {match.user.fullName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-sm font-medium text-green-400">{match.score}% match</span>
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{match.user.fullName}</h4>
                    <p className="text-sm text-purple-200">{match.user.title}</p>
                    <p className="text-xs text-purple-300 mt-1">{match.user.location}</p>
                    
                    {/* Skills */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {match.user.skills.slice(0, 3).map((skill, index) => (
                        <span 
                          key={index} 
                          className="text-xs bg-white/10 text-purple-200 px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {match.user.skills.length > 3 && (
                        <span className="text-xs text-purple-300">+{match.user.skills.length - 3}</span>
                      )}
                    </div>
                    
                    {/* Match Reasons */}
                    <div className="mt-3">
                      <p className="text-xs text-purple-200 font-medium">Por que vocês combinam:</p>
                      <ul className="mt-1 space-y-1">
                        {match.matchReasons.map((reason, index) => (
                          <li key={index} className="text-xs text-purple-300">• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  {match.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleAcceptMatch(match.id)}
                        className="flex-1 btn-primary bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Aceitar
                      </button>
                      <button
                        onClick={() => handleRejectMatch(match.id)}
                        className="flex-1 btn-secondary"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Recusar
                      </button>
                    </>
                  ) : match.status === 'accepted' ? (
                    <button
                      onClick={() => handleMessageUser(match.user.id)}
                      className="w-full btn-primary bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Enviar Mensagem
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAcceptMatch(match.id)}
                      className="w-full btn-secondary"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Reconsiderar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchmakingCard;
