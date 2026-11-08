'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  Mail,
  Shield,
  Swords,
  Copy,
  Check,
  Trash2,
  Edit3,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
  RefreshCw,
  Lock,
  X
} from 'lucide-react';
import { CAMPAIGN_CHARACTERS } from '@/lib/campaign/characters';
import type { AdminPlayerItem } from '@/app/api/admin/invitations/route';

interface DmInvitationsConsoleProps {
  currentDmId: string;
  initialPlayers?: AdminPlayerItem[];
}

export function DmInvitationsConsole({ currentDmId, initialPlayers = [] }: DmInvitationsConsoleProps) {
  const [players, setPlayers] = useState<AdminPlayerItem[]>(initialPlayers);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [assignedCharacterSlug, setAssignedCharacterSlug] = useState('');
  const [role, setRole] = useState<'player' | 'dm'>('player');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<{ message: string; invitationLink: string } | null>(null);

  // Copy Feedback State
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<string | null>(null);

  // Revoke Modal State
  const [playerToRevoke, setPlayerToRevoke] = useState<AdminPlayerItem | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  // Recargar la lista desde la API
  const refreshPlayers = async () => {
    try {
      setIsLoadingList(true);
      const res = await fetch('/api/admin/invitations');
      if (res.ok) {
        const data = await res.json();
        if (data.players) {
          setPlayers(data.players);
        }
      }
    } catch (err) {
      console.error('Error al recargar aventureros:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  // Enviar formulario (Crear o Actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim(),
          email: email.trim(),
          assignedCharacterSlug: assignedCharacterSlug || null,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Ocurrió un error al autorizar al aventurero.');
        return;
      }

      setFormSuccess({
        message: data.message || `¡Aventurero ${displayName} autorizado con éxito!`,
        invitationLink: data.invitationLink || `${window.location.origin}/login?invited=true`,
      });

      // Limpiar formulario tras éxito
      setDisplayName('');
      setEmail('');
      setAssignedCharacterSlug('');
      setRole('player');

      // Actualizar lista
      await refreshPlayers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado de conexión.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copiar enlace al portapapeles
  const handleCopyLink = (linkToCopy: string, identifier: string) => {
    navigator.clipboard.writeText(linkToCopy);
    setCopiedLinkIndex(identifier);
    setTimeout(() => {
      setCopiedLinkIndex(null);
    }, 2500);
  };

  // Seleccionar jugador para editar en el formulario
  const handleEditPlayer = (p: AdminPlayerItem) => {
    setDisplayName(p.display_name);
    setEmail(p.email);
    setAssignedCharacterSlug(p.assigned_character_slug || '');
    setRole(p.role);
    setFormError(null);
    setFormSuccess(null);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Confirmar revocación de acceso
  const handleConfirmRevoke = async () => {
    if (!playerToRevoke) return;
    setIsRevoking(true);
    setRevokeError(null);

    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: playerToRevoke.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRevokeError(data.error || 'No se pudo revocar el acceso del aventurero.');
        return;
      }

      setPlayerToRevoke(null);
      await refreshPlayers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado de red.';
      setRevokeError(msg);
    } finally {
      setIsRevoking(false);
    }
  };

  // Estadísticas rápidas
  const totalAdventurers = players.length;
  const activeCount = players.filter(p => p.status === 'active').length;
  const pendingCount = players.filter(p => p.status === 'pending').length;

  return (
    <section className="space-y-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-dnd-card via-slate-900 to-slate-950 border border-amber-900/40 shadow-2xl relative overflow-hidden">
      {/* Resplandor decorativo arcano */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Encabezado de la Consola DM */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-dnd-border/80 pb-6 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-red-300 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-red-400" />
            Consola Exclusiva del Dungeon Master
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-fantasy tracking-wide">
            Administración de Aventureros &amp; Invitaciones
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Autoriza cuentas de Google para ingresar a la mesa de <strong className="text-slate-200">Segadores de Orcos</strong>, asigna sus héroes oficiales de campaña o gestiona sus permisos.
          </p>
        </div>

        {/* Métricas rápidas */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-dnd-surface border border-dnd-border text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Mesa Total</span>
            <span className="text-base font-bold text-dnd-gold">{totalAdventurers}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-center">
            <span className="text-[10px] uppercase tracking-wider text-emerald-300 block font-medium">Activos</span>
            <span className="text-base font-bold text-emerald-400">{activeCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-amber-950/40 border border-amber-800/40 text-center">
            <span className="text-[10px] uppercase tracking-wider text-amber-300 block font-medium">Pendientes</span>
            <span className="text-base font-bold text-amber-400">{pendingCount}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* Formulario de Invitación / Autorización (Columna Izquierda: 5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-dnd-surface/90 border border-dnd-border space-y-5 shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-dnd-border/60 pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-dnd-gold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-fantasy font-bold text-base text-slate-100">
                Invitar / Autorizar Aventurero
              </h3>
              <p className="text-[11px] text-slate-400">
                Concede acceso a la lista blanca vinculada a Google
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Nombre del Jugador */}
            <div className="space-y-1.5">
              <label htmlFor="display_name" className="font-semibold text-slate-200 block">
                Nombre del Jugador <span className="text-amber-400">*</span>
              </label>
              <input
                id="display_name"
                type="text"
                required
                placeholder="ej: Carlos Gómez o Skelly"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-dnd-border text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-dnd-gold focus:ring-1 focus:ring-dnd-gold transition"
              />
            </div>

            {/* Correo de Google */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="font-semibold text-slate-200 block">
                Correo de Google <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="aventurero@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-dnd-border text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-dnd-gold focus:ring-1 focus:ring-dnd-gold transition"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Debe ser la cuenta Google con la que el jugador iniciará sesión.
              </p>
            </div>

            {/* Personaje Asignado */}
            <div className="space-y-1.5">
              <label htmlFor="character" className="font-semibold text-slate-200 block">
                Personaje Asignado (Campaña)
              </label>
              <div className="relative">
                <Swords className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <select
                  id="character"
                  value={assignedCharacterSlug}
                  onChange={e => setAssignedCharacterSlug(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-dnd-border text-slate-100 focus:outline-none focus:border-dnd-gold focus:ring-1 focus:ring-dnd-gold transition"
                >
                  <option value="">Ninguno / Creación libre a futuro</option>
                  {CAMPAIGN_CHARACTERS.map(c => (
                    <option key={c.slug} value={c.slug}>
                      {c.name} &bull; {c.characterClass} (Nv. {c.level} - {c.race})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rol en la Mesa */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200 block">
                Rol en la Mesa de Juego
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('player')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-medium transition ${
                    role === 'player'
                      ? 'bg-amber-950/60 border-dnd-gold text-dnd-gold shadow-sm'
                      : 'bg-slate-900 border-dnd-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Jugador (player)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('dm')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-medium transition ${
                    role === 'dm'
                      ? 'bg-red-950/60 border-red-600 text-red-300 shadow-sm'
                      : 'bg-slate-900 border-dnd-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Co-DM / Máster
                </button>
              </div>
            </div>

            {/* Error en Formulario */}
            {formError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Éxito y Retroalimentación con Botón de Copiar Enlace */}
            {formSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs space-y-2.5 animate-in fade-in">
                <div className="flex items-center gap-2 font-semibold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{formSuccess.message}</span>
                </div>
                <div className="pt-1 border-t border-emerald-900/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={formSuccess.invitationLink}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-emerald-800/40 text-[11px] font-mono text-slate-300 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLink(formSuccess.invitationLink, 'form_success')}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-[11px] transition shrink-0"
                  >
                    {copiedLinkIndex === 'form_success' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-200" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copiar Enlace
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-dnd-gold to-amber-700 text-slate-950 font-bold hover:brightness-110 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Registrando en el tomo de la mesa...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Autorizar Aventurero
                </>
              )}
            </button>
          </form>
        </div>

        {/* Lista de Aventureros Autorizados (Columna Derecha: 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-dnd-gold" />
              <h3 className="font-fantasy font-bold text-base text-slate-100">
                Aventureros Registrados ({players.length})
              </h3>
            </div>
            <button
              onClick={refreshPlayers}
              disabled={isLoadingList}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dnd-surface border border-dnd-border text-slate-400 hover:text-slate-100 text-xs transition"
              title="Refrescar lista desde la base de datos"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingList ? 'animate-spin' : ''}`} />
              Sincronizar
            </button>
          </div>

          {/* Tarjetas / Tabla de Jugadores */}
          <div className="space-y-3">
            {players.length === 0 ? (
              <div className="p-8 rounded-2xl bg-dnd-surface/50 border border-dnd-border text-center space-y-2">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No hay aventureros registrados en la lista blanca aún.</p>
              </div>
            ) : (
              players.map(p => {
                const isSelf = p.id === currentDmId;
                const char = CAMPAIGN_CHARACTERS.find(c => c.slug === p.assigned_character_slug);
                const invitationUrl = typeof window !== 'undefined'
                  ? `${window.location.origin}/login?invited=true`
                  : '/login?invited=true';

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-dnd-surface/90 border border-dnd-border hover:border-slate-700 transition space-y-3 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {/* Avatar y Datos Principales */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-bold text-dnd-gold text-xs shadow-inner">
                          {p.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-100 text-sm">
                              {p.display_name}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                                Tú
                              </span>
                            )}
                            {p.role === 'dm' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800/40 text-red-300 font-semibold">
                                <Lock className="w-2.5 h-2.5 text-red-400" /> DM
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-950/50 border border-amber-800/40 text-dnd-gold-light font-medium">
                                <Shield className="w-2.5 h-2.5 text-dnd-gold" /> Jugador
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-mono block">
                            {p.email}
                          </span>
                        </div>
                      </div>

                      {/* Estado de Conexión */}
                      <div className="shrink-0">
                        {p.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Activo (Google)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-300 font-medium">
                            <Clock className="w-3 h-3 text-amber-400" />
                            Invitación pendiente
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fila de Personaje Asignado y Acciones */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2 border-t border-dnd-border/60 text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Swords className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Héroe:</span>
                        {char ? (
                          <span className="font-semibold text-dnd-gold">
                            {char.name} <span className="text-slate-400 font-normal">({char.characterClass})</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">
                            Sin asignar (Creación libre a futuro)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        {/* Copiar enlace individual */}
                        <button
                          type="button"
                          onClick={() => handleCopyLink(invitationUrl, p.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-dnd-border text-slate-300 hover:text-slate-100 text-[11px] transition"
                          title="Copiar enlace directo de invitación"
                        >
                          {copiedLinkIndex === p.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-300">¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              Enlace
                            </>
                          )}
                        </button>

                        {/* Editar asignación */}
                        <button
                          type="button"
                          onClick={() => handleEditPlayer(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-dnd-border text-slate-300 hover:text-slate-100 text-[11px] transition"
                          title="Modificar asignación o rol en el formulario"
                        >
                          <Edit3 className="w-3 h-3 text-slate-400" />
                          Editar
                        </button>

                        {/* Revocar Acceso */}
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => setPlayerToRevoke(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-950/80 border border-red-900/50 text-red-300 hover:text-red-100 text-[11px] transition"
                            title="Revocar acceso y expulsar de la lista blanca"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                            Revocar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmación para Revocar Acceso */}
      {playerToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-dnd-card border border-red-900/60 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-dnd-border/80 pb-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-fantasy font-bold text-base text-slate-100">
                  ¿Revocar Acceso a la Mesa?
                </h4>
              </div>
              <button
                onClick={() => setPlayerToRevoke(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Estás a punto de retirar a <strong className="text-white">{playerToRevoke.display_name}</strong> (<code>{playerToRevoke.email}</code>) de la lista de aventureros autorizados. No podrá ingresar al portal a menos que lo vuelvas a invitar.
            </p>

            {revokeError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs">
                {revokeError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPlayerToRevoke(null)}
                disabled={isRevoking}
                className="px-4 py-2 rounded-xl bg-dnd-surface border border-dnd-border text-slate-300 text-xs font-semibold hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                disabled={isRevoking}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isRevoking ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Revocando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Sí, Revocar Acceso
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
