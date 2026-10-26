import React from 'react';
import { Settings as SettingsIcon, Volume2, Monitor, MousePointer, Crosshair, ArrowLeft, RotateCcw } from 'lucide-react';
import { GameSettings } from '../types';

interface SettingsPageProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdateSettings, onBack }) => {
  const update = (partial: Partial<GameSettings>) => {
    onUpdateSettings({ ...settings, ...partial });
  };

  const crosshairColors = [
    { name: 'Neon Cyan', hex: '#00f0ff' },
    { name: 'Laser Pink', hex: '#ff0055' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Gold', hex: '#f59e0b' },
    { name: 'Bright White', hex: '#ffffff' },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] p-4 md:p-8 max-w-4xl mx-auto w-full">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-orbitron text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>RETURN TO DASHBOARD</span>
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-orbitron font-extrabold text-white flex items-center justify-center gap-2">
          <SettingsIcon className="w-7 h-7 text-arena-neon" />
          <span>SYSTEM & COMBAT SETTINGS</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">Configure peripherals, audio mix, and display performance</p>
      </div>

      <div className="space-y-6">
        {/* Controls & Mouse Sensitivity */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <h2 className="text-lg font-orbitron font-bold text-white mb-4 flex items-center gap-2">
            <MousePointer className="w-5 h-5 text-arena-neon" />
            <span>INPUT & AIM SENSITIVITY</span>
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300">Aim Sensitivity</span>
              <span className="text-arena-neon font-bold">{settings.mouseSensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={settings.mouseSensitivity}
              onChange={(e) => update({ mouseSensitivity: parseFloat(e.target.value) })}
              className="w-full accent-arena-neon cursor-pointer"
            />
          </div>
        </div>

        {/* Graphics Quality */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <h2 className="text-lg font-orbitron font-bold text-white mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-purple-400" />
            <span>GRAPHICS & RENDERING</span>
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {(['low', 'medium', 'high'] as const).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => update({ graphicsQuality: q })}
                className={`py-3 rounded-2xl font-orbitron text-xs font-bold uppercase border transition-all ${
                  settings.graphicsQuality === q
                    ? 'bg-purple-600/20 text-purple-300 border-purple-500 shadow-neon'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            High enables full antialiasing and PCF soft shadow maps. Low optimizes for mobile browsers.
          </p>
        </div>

        {/* Audio Mixing */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <h2 className="text-lg font-orbitron font-bold text-white mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            <span>AUDIO MIXER</span>
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-2">
                <span className="text-slate-300">Combat Sound Effects</span>
                <span className="text-emerald-400 font-bold">{Math.round(settings.soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => update({ soundVolume: parseFloat(e.target.value) })}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-2">
                <span className="text-slate-300">Music & Stems</span>
                <span className="text-emerald-400 font-bold">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => update({ musicVolume: parseFloat(e.target.value) })}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Crosshair Customization */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <h2 className="text-lg font-orbitron font-bold text-white mb-4 flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-arena-laser" />
            <span>OPTICAL RETICLE (CROSSHAIR)</span>
          </h2>

          <div className="space-y-4">
            {/* Style */}
            <div>
              <span className="block text-xs font-mono text-slate-400 mb-2">Reticle Style</span>
              <div className="grid grid-cols-2 gap-3">
                {(['classic', 'dot'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update({ crosshairStyle: s })}
                    className={`py-2.5 rounded-xl font-orbitron text-xs font-bold uppercase border transition-all ${
                      settings.crosshairStyle === s
                        ? 'bg-arena-laser/20 text-arena-laser border-arena-laser shadow-laser'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <span className="block text-xs font-mono text-slate-400 mb-2">Reticle Color</span>
              <div className="flex flex-wrap gap-3">
                {crosshairColors.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => update({ crosshairColor: c.hex })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono border transition-all ${
                      settings.crosshairColor === c.hex
                        ? 'bg-slate-800 border-white text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
