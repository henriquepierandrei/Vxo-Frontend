// Ranking.tsx
import React, { useState, useMemo } from 'react';
import { Eye, Coins, Clock, TrendingUp, Trophy, Medal, Award, Sparkles, Zap, Crown } from 'lucide-react';

// Types
interface User {
  id: string;
  username: string;
  avatar: string;
  views: number;
  coins: number;
  joinedDate: Date;
  level: number;
}

type FilterType = 'views' | 'coins' | 'oldest' | 'level';

interface FilterOption {
  id: FilterType;
  label: string;
  icon: React.ReactNode;
}

// Mock Data
const generateMockUsers = (): User[] => {
  const users: User[] = [];
  const names = [
    'ShadowGamer', 'NeonKnight', 'CyberMage', 'PixelHunter', 'DarkPhoenix',
    'StormBreaker', 'MysticWarrior', 'CrystalDragon', 'VoidWalker', 'StarChaser',
    'ThunderBolt', 'FrostByte', 'BlazeFury', 'EchoNinja', 'LunarEclipse',
    'SolarFlare', 'CosmicRider', 'QuantumLeap', 'NeonSamurai', 'VaporWave'
  ];

  for (let i = 0; i < 100; i++) {
    users.push({
      id: `user-${i}`,
      username: `${names[i % names.length]}${i > 19 ? i : ''}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      views: Math.floor(Math.random() * 1000000) + 1000,
      coins: Math.floor(Math.random() * 50000) + 100,
      joinedDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
      level: Math.floor(Math.random() * 100) + 1,
    });
  }
  return users;
};

const Ranking: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('views');
  const [users] = useState<User[]>(generateMockUsers());

  const filters: FilterOption[] = [
    { id: 'views', label: 'Mais Views', icon: <Eye className="w-4 h-4" /> },
    { id: 'coins', label: 'Mais Moedas', icon: <Coins className="w-4 h-4" /> },
    { id: 'oldest', label: 'Mais Antigos', icon: <Clock className="w-4 h-4" /> },
    { id: 'level', label: 'Top Level', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const sortedUsers = useMemo(() => {
    const sorted = [...users];
    switch (activeFilter) {
      case 'views':
        return sorted.sort((a, b) => b.views - a.views);
      case 'coins':
        return sorted.sort((a, b) => b.coins - a.coins);
      case 'oldest':
        return sorted.sort((a, b) => a.joinedDate.getTime() - b.joinedDate.getTime());
      case 'level':
        return sorted.sort((a, b) => b.level - a.level);
      default:
        return sorted;
    }
  }, [users, activeFilter]);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return (
          <div className="relative">
            <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-primary)]" style={{ filter: 'drop-shadow(0 0 12px var(--color-primary))' }} />
            <Crown className="w-4 h-4 text-[var(--color-primary)] absolute -top-2 -right-1 animate-pulse" />
          </div>
        );
      case 2:
        return <Medal className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-secondary)]" style={{ filter: 'drop-shadow(0 0 12px var(--color-secondary))' }} />;
      case 3:
        return <Award className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-primary-dark)]" style={{ filter: 'drop-shadow(0 0 12px var(--color-primary-dark))' }} />;
      default:
        return null;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'short'
    }).format(date);
  };

  const getStatValue = (user: User): string => {
    switch (activeFilter) {
      case 'views':
        return formatNumber(user.views);
      case 'coins':
        return formatNumber(user.coins);
      case 'oldest':
        return formatDate(user.joinedDate);
      case 'level':
        return `Nv ${user.level}`;
      default:
        return '';
    }
  };

  const getStatLabel = (): string => {
    switch (activeFilter) {
      case 'views':
        return 'Views';
      case 'coins':
        return 'Moedas';
      case 'oldest':
        return 'Membro desde';
      case 'level':
        return 'Nível';
      default:
        return '';
    }
  };

  const getStatIcon = () => {
    switch (activeFilter) {
      case 'views':
        return <Eye className="w-4 h-4" />;
      case 'coins':
        return <Coins className="w-4 h-4" />;
      case 'oldest':
        return <Clock className="w-4 h-4" />;
      case 'level':
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] relative overflow-hidden">
      <br /><br />
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 -left-4 w-96 h-96 rounded-full blur-[128px] animate-pulse" 
          style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}
        />
        <div 
          className="absolute bottom-0 -right-4 w-96 h-96 rounded-full blur-[128px] animate-pulse" 
          style={{ backgroundColor: 'var(--color-secondary)', opacity: 0.1, animationDelay: '1s' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[128px]" 
          style={{ backgroundColor: 'var(--color-primary-dark)', opacity: 0.05 }}
        />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 sm:mb-12 text-center">
            <div 
              className="inline-flex items-center gap-3 mb-4 px-6 py-3 border rounded-[var(--border-radius-xl)]"
              style={{
                backgroundColor: 'var(--card-background-glass)',
                backdropFilter: 'blur(var(--blur-amount))',
                borderColor: 'var(--color-border)'
              }}
            >
              <Sparkles className="w-5 h-5 text-[var(--color-primary)] animate-pulse" />
              <span className="text-sm font-medium text-[var(--color-text-muted)]">Ranking Global</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              <span 
                className="bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
                style={{
                  backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-secondary), var(--color-primary-dark), var(--color-primary))'
                }}
              >
                Top 100 Usuários
              </span>
            </h1>
            
            <p className="text-[var(--color-text-muted)] text-base sm:text-lg max-w-2xl mx-auto">
              Confira os melhores jogadores da plataforma e conquiste seu lugar no topo
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-3 min-w-max sm:min-w-0 sm:grid sm:grid-cols-4">
              {filters.map((filter) => {
                const isActive = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className="group relative flex items-center justify-center gap-1.5 px-6 sm:px-6 py-3.5 sm:py-4 font-semibold text-sm sm:text-base transition-all duration-500 ease-out"
                    style={{
                      backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: isActive ? 'white' : 'var(--color-text)',
                      borderRadius: 'var(--border-radius-lg)',
                      border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      boxShadow: isActive ? '0 0 30px rgba(143, 124, 255, 0.4)' : 'none',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.color = 'var(--color-text)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.color = 'var(--color-text-muted)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {filter.icon}
                    </div>
                    <span className="whitespace-nowrap">{filter.label}</span>

                    {isActive && (
                      <div 
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 rounded-full"
                        style={{
                          backgroundImage: 'linear-gradient(to right, transparent, var(--color-primary), transparent)'
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Podium - Top 3 (Desktop) */}
          <div className="mb-8 hidden lg:grid grid-cols-3 gap-6 items-end max-w-4xl mx-auto">
            {[1, 0, 2].map((idx) => {
              const user = sortedUsers[idx];
              if (!user) return null;
              const actualPosition = idx === 1 ? 1 : idx === 0 ? 2 : 3;
              const heights = ['h-64', 'h-72', 'h-56'];
              
              const podiumColors = {
                1: { main: 'var(--color-primary)', opacity: 0.3 },
                2: { main: 'var(--color-secondary)', opacity: 0.2 },
                3: { main: 'var(--color-primary-dark)', opacity: 0.2 }
              };

              const color = podiumColors[actualPosition as keyof typeof podiumColors];
              
              return (
                <div
                  key={user.id}
                  className={`relative ${idx === 1 ? 'order-2' : idx === 0 ? 'order-1' : 'order-3'}`}
                  style={{ 
                    animation: 'slideUp 0.6s ease-out forwards',
                    animationDelay: `${idx * 150}ms`,
                    opacity: 0
                  }}
                >
                  <div 
                    className={`${heights[idx]} border p-6 flex flex-col items-center justify-end transition-all duration-500 hover:scale-105 relative overflow-hidden`}
                    style={{
                      backgroundColor: 'var(--card-background-glass)',
                      backdropFilter: 'blur(var(--blur-amount))',
                      borderColor: actualPosition === 1 ? 'var(--color-primary)' : 'var(--color-border)',
                      borderRadius: 'var(--border-radius-lg)',
                      boxShadow: `0 0 ${actualPosition === 1 ? 40 : 30}px rgba(143, 124, 255, ${color.opacity})`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                      if (actualPosition !== 1) {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                      }
                    }}
                  >
                    {/* Glow Effect */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `linear-gradient(to top, ${color.main}, transparent)`,
                        opacity: 0.2
                      }}
                    />
                    
                    {/* Rank Icon */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                      {getRankIcon(actualPosition)}
                    </div>

                    {/* Avatar */}
                    <div className="relative mb-4 mt-8 z-10">
                      <div 
                        className="w-24 h-24 rounded-full overflow-hidden ring-4 transition-all duration-300 ring-[var(--color-border)]"
                        style={{
                          boxShadow: `0 0 20px ${color.main}`
                        }}
                      >
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Level Badge */}
                      <div 
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 border rounded-full text-xs font-bold shadow-lg"
                        style={{
                          backgroundColor: 'var(--color-accent)',
                          borderColor: 'var(--color-primary)',
                          color: 'var(--color-primary)'
                        }}
                      >
                        Nv {user.level}
                      </div>
                    </div>

                    {/* Username */}
                    <h3 className="text-lg font-bold text-[var(--color-text)] mb-2 text-center truncate w-full px-2 z-10">
                      {user.username}
                    </h3>

                    {/* Stats */}
                    <div 
                      className="flex items-center gap-2 font-bold text-xl mb-1 z-10"
                      style={{ color: color.main }}
                    >
                      {getStatIcon()}
                      <span>{getStatValue(user)}</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] z-10">{getStatLabel()}</p>

                    {/* Position Badge */}
                    <div 
                      className="absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border"
                      style={{
                        backgroundColor: `${color.main}33`,
                        borderColor: color.main,
                        color: color.main,
                        boxShadow: `0 0 20px ${color.main}66`
                      }}
                    >
                      #{actualPosition}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ranking List */}
          <div className="space-y-3">
            {sortedUsers.map((user, index) => {
              const position = index + 1;
              const isTopThree = position <= 3;

              return (
                <div
                  key={user.id}
                  className="ranking-card relative group p-4 sm:p-5 transition-all duration-300 ease-out border"
                  style={{
                    backgroundColor: 'var(--card-background-glass)',
                    backdropFilter: 'blur(var(--blur-amount))',
                    borderColor: isTopThree ? 'var(--color-primary)' : 'var(--color-border)',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: isTopThree ? '0 0 20px rgba(143, 124, 255, 0.1)' : 'none',
                    animation: 'slideIn 0.5s ease-out forwards',
                    animationDelay: `${index * 20}ms`,
                    opacity: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(143, 124, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--card-background-glass)';
                    e.currentTarget.style.borderColor = isTopThree ? 'var(--color-primary)' : 'var(--color-border)';
                    e.currentTarget.style.boxShadow = isTopThree ? '0 0 20px rgba(143, 124, 255, 0.1)' : 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Top 3 Glow */}
                  {isTopThree && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-secondary), var(--color-primary-dark))',
                        opacity: 0.05,
                        borderRadius: 'var(--border-radius-lg)'
                      }}
                    />
                  )}

                  <div className="relative flex items-center gap-3 sm:gap-5">
                    {/* Rank Position */}
                    <div className="flex-shrink-0">
                      <div 
                        className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-bold text-base sm:text-lg border-2 transition-all duration-300"
                        style={{
                          backgroundColor: isTopThree ? `var(--color-${position === 1 ? 'primary' : position === 2 ? 'secondary' : 'primary-dark'})33` : 'var(--color-surface)',
                          borderColor: isTopThree ? `var(--color-${position === 1 ? 'primary' : position === 2 ? 'secondary' : 'primary-dark'})` : 'var(--color-border)',
                          color: isTopThree ? `var(--color-${position === 1 ? 'primary' : position === 2 ? 'secondary' : 'primary-dark'})` : 'var(--color-text-muted)',
                          borderRadius: 'var(--border-radius-md)',
                          boxShadow: isTopThree ? `0 0 20px var(--color-${position === 1 ? 'primary' : position === 2 ? 'secondary' : 'primary-dark'})66` : 'none'
                        }}
                      >
                        {isTopThree ? getRankIcon(position) : `#${position}`}
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div 
                        className="relative w-12 h-12 sm:w-14 sm:h-14 overflow-hidden ring-2 transition-all duration-300 ring-[var(--color-border)]"
                        style={{
                          borderRadius: 'var(--border-radius-md)'
                        }}
                      >
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                        />
                        {isTopThree && (
                          <div 
                            className="absolute inset-0"
                            style={{
                              backgroundImage: 'linear-gradient(to top, var(--color-primary), transparent)',
                              opacity: 0.2
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-[var(--color-text)] truncate">
                          {user.username}
                        </h3>
                        {isTopThree && (
                          <Sparkles className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0 animate-pulse" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs sm:text-sm text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Nv {user.level}
                        </span>
                        {activeFilter !== 'coins' && (
                          <span className="hidden sm:flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            {formatNumber(user.coins)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-shrink-0 text-right">
                      <div 
                        className="flex items-center justify-end gap-2 mb-1 text-lg sm:text-xl lg:text-2xl font-bold"
                        style={{ color: isTopThree ? 'var(--color-primary)' : 'var(--color-text)' }}
                      >
                        <div className="hidden sm:block text-[var(--color-text-muted)] opacity-50">
                          {getStatIcon()}
                        </div>
                        <span>{getStatValue(user)}</span>
                      </div>
                      
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {getStatLabel()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <div 
              className="inline-flex items-center gap-3 px-6 py-3 border"
              style={{
                backgroundColor: 'var(--card-background-glass)',
                backdropFilter: 'blur(var(--blur-amount))',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--border-radius-xl)'
              }}
            >
              <div 
                className="w-2 h-2 rounded-full animate-pulse" 
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  boxShadow: '0 0 8px var(--color-primary)'
                }}
              />
              <p className="text-sm text-[var(--color-text-muted)]">
                Atualizado em tempo real • <span className="text-[var(--color-text)] font-semibold">{sortedUsers.length}</span> usuários
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progressBar {
          from {
            width: 0%;
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .ranking-card {
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Ranking;