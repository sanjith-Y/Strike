import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { LobbyPage } from './pages/LobbyPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { GameCanvas } from './game/GameCanvas';
import { getCurrentUser, signOutUser, signInAsGuest } from './services/supabase';
import { socketService } from './services/socket';
import { GameSettings, RoomSettings, RoomState, UserProfile } from './types';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [currentRoom, setCurrentRoom] = useState<RoomState | null>(null);
  const [lobbyError, setLobbyError] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    mouseSensitivity: 1.0,
    graphicsQuality: 'medium',
    soundVolume: 0.8,
    musicVolume: 0.5,
    crosshairColor: '#00f0ff',
    crosshairStyle: 'classic',
  });

  // 1. Initial Session Check & URL Invite Code Detection
  useEffect(() => {
    getCurrentUser()
      .then(async (user) => {
        if (user) {
          setCurrentUser(user);
          await socketService.connect();

          // Check if URL contains ?room=CODE
          const params = new URLSearchParams(window.location.search);
          const roomCode = params.get('room');
          if (roomCode) {
            socketService.joinRoom(roomCode);
          } else {
            setCurrentTab('dashboard');
          }
        } else {
          // If URL contains room code, allow quick guest play directly into room
          const params = new URLSearchParams(window.location.search);
          const roomCode = params.get('room');
          if (roomCode) {
            const guest = signInAsGuest();
            setCurrentUser(guest);
            await socketService.connect();
            socketService.joinRoom(roomCode);
          } else {
            setCurrentTab('landing');
          }
        }
      })
      .finally(() => setLoadingInitial(false));
  }, []);

  // 2. Global Socket Event Subscriptions
  useEffect(() => {
    const handleRoomCreated = (room: RoomState) => {
      setCurrentRoom(room);
      setCurrentTab('lobby');
      setLobbyError(null);
    };

    const handleRoomState = (room: RoomState) => {
      setCurrentRoom(room);
      if (room.status === 'active') {
        setCurrentTab('game');
      } else {
        setCurrentTab('lobby');
      }
    };

    const handleMatchStarted = () => {
      setCurrentTab('game');
    };

    const handleError = (data: { message: string }) => {
      setLobbyError(data?.message || 'An error occurred');
    };

    const socket = socketService.socket;
    if (socket) {
      socket.on('room_created', handleRoomCreated);
      socket.on('room_state', handleRoomState);
      socket.on('match_started', handleMatchStarted);
      socket.on('error', handleError);
    }

    return () => {
      if (socket) {
        socket.off('room_created', handleRoomCreated);
        socket.off('room_state', handleRoomState);
        socket.off('match_started', handleMatchStarted);
        socket.off('error', handleError);
      }
    };
  });

  // Handlers
  const handleAuthSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    await socketService.connect();

    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get('room');
    if (roomCode) {
      socketService.joinRoom(roomCode);
    } else {
      setCurrentTab('dashboard');
    }
  };

  const handleLogout = async () => {
    socketService.leaveRoom();
    socketService.disconnect();
    await signOutUser();
    setCurrentUser(null);
    setCurrentRoom(null);
    setCurrentTab('landing');
  };

  const handleCreateRoom = (roomSettings?: Partial<RoomSettings>) => {
    socketService.createRoom(roomSettings);
  };

  const handleJoinRoom = (code: string) => {
    socketService.joinRoom(code);
  };

  const handleToggleReady = (isReady: boolean) => {
    socketService.toggleReady(isReady);
  };

  const handleUpdateRoomSettings = (newSettings: Partial<RoomSettings>) => {
    socketService.updateSettings(newSettings);
  };

  const handleStartMatch = () => {
    socketService.startMatch();
  };

  const handleLeaveRoom = () => {
    socketService.leaveRoom();
    setCurrentRoom(null);
    setCurrentTab('dashboard');
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-arena-neon border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-orbitron font-bold text-sm tracking-widest text-slate-300">
          INITIALIZING ARENA STRIKE...
        </span>
      </div>
    );
  }

  // Active 3D Game Canvas
  if (currentTab === 'game' && currentUser) {
    return (
      <GameCanvas
        currentUserId={currentUser.id}
        username={currentUser.username}
        settings={settings}
        onExit={handleLeaveRoom}
        onPlayAgain={() => {
          if (currentRoom) {
            socketService.joinRoom(currentRoom.code);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col text-slate-100">
      <Navbar
        user={currentUser}
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col">
        {currentTab === 'landing' && (
          <LandingPage
            onPlayNow={() => {
              if (currentUser) {
                setCurrentTab('dashboard');
              } else {
                const guest = signInAsGuest();
                handleAuthSuccess(guest);
              }
            }}
            onSignIn={() => setCurrentTab('auth_login')}
            onSignUp={() => setCurrentTab('auth_register')}
            onJoinRoomDirect={(code) => {
              if (!currentUser) {
                const guest = signInAsGuest();
                handleAuthSuccess(guest).then(() => {
                  handleJoinRoom(code);
                });
              } else {
                handleJoinRoom(code);
              }
            }}
            onOpenLeaderboard={() => setCurrentTab('leaderboard')}
            onOpenSettings={() => setCurrentTab('settings')}
          />
        )}

        {currentTab === 'auth_login' && (
          <AuthPage
            initialMode="login"
            onAuthSuccess={handleAuthSuccess}
            onBack={() => setCurrentTab('landing')}
          />
        )}

        {currentTab === 'auth_register' && (
          <AuthPage
            initialMode="register"
            onAuthSuccess={handleAuthSuccess}
            onBack={() => setCurrentTab('landing')}
          />
        )}

        {currentTab === 'dashboard' && currentUser && (
          <DashboardPage
            user={currentUser}
            onCreateRoom={() => handleCreateRoom()}
            onJoinRoom={handleJoinRoom}
            onOpenLeaderboard={() => setCurrentTab('leaderboard')}
            onOpenSettings={() => setCurrentTab('settings')}
          />
        )}

        {currentTab === 'lobby' && currentRoom && currentUser && (
          <LobbyPage
            room={currentRoom}
            currentUser={currentUser}
            onToggleReady={handleToggleReady}
            onUpdateSettings={handleUpdateRoomSettings}
            onStartMatch={handleStartMatch}
            onLeaveRoom={handleLeaveRoom}
            error={lobbyError}
          />
        )}

        {currentTab === 'profile' && currentUser && (
          <ProfilePage
            user={currentUser}
            onBack={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onUpdateSettings={setSettings}
            onBack={() => setCurrentTab(currentUser ? 'dashboard' : 'landing')}
          />
        )}

        {currentTab === 'leaderboard' && (
          <LeaderboardPage
            onBack={() => setCurrentTab(currentUser ? 'dashboard' : 'landing')}
          />
        )}
      </main>
    </div>
  );
};
