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
import { TaperedRule, DndBadge } from '@segadores/ui';
import { CAMPAIGN_CHARACTERS } from '@/lib/campaign/characters';
import type { AdminPlayerItem } from '@/app/api/admin/invitations/route';

function getCanonicalInvitationUrl(): string {
  if (typeof window === 'undefined') return '/login?invited=true';
  const rawOrigin = window.location.origin;
  const canonicalOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (rawOrigin.includes('vercel.app') ? 'https://www.segadoresdnd.com' : rawOrigin);
  return `${canonicalOrigin}/login?invited=true`;
}

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
        invitationLink: data.invitationLink || getCanonicalInvitationUrl(),
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
    <section className="space-y-8 p-6 sm:p-8 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched shadow-xl relative overflow-hidden">
      {/* Encabezado de la Consola DM */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-dnd-border-antique/80 pb-6 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <DndBadge variant="crimson" size="sm" icon={<Lock className="w-3.5 h-3.5 text-dnd-parchment" />}>
              Consola Exclusiva del Dungeon Master
            </DndBadge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-dnd-crimson font-dnd-title tracking-wider uppercase">
            Bitácora de Aventureros &amp; Invitaciones
          </h2>
          <p className="text-xs sm:text-sm text-dnd-ink-muted font-dnd-body max-w-2xl leading-relaxed">
            Autoriza cuentas de Google para ingresar a la mesa de <strong className="text-dnd-crimson font-dnd-title">Segadores de Orcos</strong>, asigna sus héroes oficiales de campaña o gestiona sus permisos.
          </p>
        </div>

        {/* Métricas rápidas */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-center">
            <span className="text-[10px] uppercase tracking-wider text-dnd-ink-muted block font-dnd-title font-semibold">Mesa Total</span>
            <span className="text-base font-bold text-dnd-crimson font-dnd-title">{totalAdventurers}</span>
          </div>
          <div className="px-3.5 py-2 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-center">
            <span className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block font-dnd-title font-semibold">Activos</span>
            <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-dnd-title">{activeCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-center">
            <span className="text-[10px] uppercase tracking-wider text-dnd-terracotta block font-dnd-title font-semibold">Pendientes</span>
            <span className="text-base font-bold text-dnd-terracotta font-dnd-title">{pendingCount}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* Formulario de Invitación / Autorización (Columna Izquierda: 5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique space-y-5 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-dnd-border-antique/80 pb-3">
            <div className="w-8 h-8 rounded-sm bg-dnd-crimson border border-dnd-gold flex items-center justify-center text-dnd-gold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-dnd-title font-bold text-sm text-dnd-crimson uppercase tracking-wider">
                Invitar / Autorizar Aventurero
              </h3>
              <p className="text-[11px] text-dnd-ink-muted font-dnd-body">
                Concede acceso a la lista blanca vinculada a Google
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-dnd-body">
            {/* Nombre del Jugador */}
            <div className="space-y-1.5">
              <label htmlFor="display_name" className="font-bold text-dnd-crimson font-dnd-title uppercase tracking-wider block text-[11px]">
                Nombre del Jugador <span className="text-dnd-terracotta">*</span>
              </label>
              <input
                id="display_name"
                type="text"
                required
                placeholder="ej: Carlos Gómez o Skelly"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-sm bg-dnd-parchment border border-dnd-border-antique text-dnd-ink placeholder-dnd-ink-subtle focus:outline-none focus:border-dnd-gold transition"
              />
            </div>

            {/* Correo de Google */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="font-bold text-dnd-crimson font-dnd-title uppercase tracking-wider block text-[11px]">
                Correo de Google <span className="text-dnd-terracotta">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-dnd-ink-subtle absolute left-3 top-2.5 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="aventurero@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-sm bg-dnd-parchment border border-dnd-border-antique text-dnd-ink placeholder-dnd-ink-subtle focus:outline-none focus:border-dnd-gold transition"
                />
              </div>
              <p className="text-[10px] text-dnd-ink-muted">
                Debe ser la cuenta Google con la que el jugador iniciará sesión.
              </p>
            </div>

            {/* Personaje Asignado */}
            <div className="space-y-1.5">
              <label htmlFor="character" className="font-bold text-dnd-crimson font-dnd-title uppercase tracking-wider block text-[11px]">
                Personaje Asignado (Campaña)
              </label>
              <div className="relative">
                <Swords className="w-4 h-4 text-dnd-ink-subtle absolute left-3 top-2.5 pointer-events-none" />
                <select
                  id="character"
                  value={assignedCharacterSlug}
                  onChange={e => setAssignedCharacterSlug(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-sm bg-dnd-parchment border border-dnd-border-antique text-dnd-ink focus:outline-none focus:border-dnd-gold transition"
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
              <label className="font-bold text-dnd-crimson font-dnd-title uppercase tracking-wider block text-[11px]">
                Rol en la Mesa de Juego
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('player')}
                  className={`p-2 rounded-md border flex items-center justify-center gap-1.5 font-dnd-title uppercase tracking-wider text-xs font-bold transition ${
                    role === 'player'
                      ? 'bg-dnd-crimson border-dnd-gold text-white shadow-xs'
                      : 'bg-dnd-parchment border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Jugador
                </button>
                <button
                  type="button"
                  onClick={() => setRole('dm')}
                  className={`p-2 rounded-md border flex items-center justify-center gap-1.5 font-dnd-title uppercase tracking-wider text-xs font-bold transition ${
                    role === 'dm'
                      ? 'bg-dnd-crimson border-dnd-gold text-white shadow-xs'
                      : 'bg-dnd-parchment border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Co-DM / Máster
                </button>
              </div>
            </div>

            {/* Error en Formulario */}
            {formError && (
              <div className="p-3 rounded-sm bg-dnd-crimson-surface border border-dnd-crimson text-dnd-crimson text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-dnd-crimson shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Éxito y Retroalimentación con Botón de Copiar Enlace */}
            {formSuccess && (
              <div className="p-3.5 rounded-sm bg-dnd-parchment border border-emerald-600 text-emerald-700 dark:text-emerald-400 text-xs space-y-2.5 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold font-dnd-title uppercase tracking-wider text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>{formSuccess.message}</span>
                </div>
                <div className="pt-1 border-t border-dnd-border-antique flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={formSuccess.invitationLink}
                    className="flex-1 px-2.5 py-1.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-[11px] font-mono text-dnd-ink select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLink(formSuccess.invitationLink, 'form_success')}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white font-dnd-title font-bold text-[11px] uppercase tracking-wider transition shrink-0"
                  >
                    {copiedLinkIndex === 'form_success' ? (
                      <>
                        <Check className="w-3 h-3 text-white" />
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
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover text-white border border-dnd-gold font-dnd-title font-bold uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-xs"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-dnd-parchment border-t-transparent rounded-full animate-spin" />
                  Registrando en el tomo de la mesa...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-dnd-gold" />
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
              <h3 className="font-dnd-title font-bold text-sm uppercase tracking-wider text-dnd-crimson">
                Aventureros Registrados ({players.length})
              </h3>
            </div>
            <button
              onClick={refreshPlayers}
              disabled={isLoadingList}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink text-xs font-dnd-title uppercase tracking-wider transition"
              title="Refrescar lista desde la base de datos"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingList ? 'animate-spin' : ''}`} />
              Sincronizar
            </button>
          </div>

          {/* Tarjetas de Jugadores en Pergamino */}
          <div className="space-y-3">
            {players.length === 0 ? (
              <div className="p-8 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-center space-y-2">
                <Users className="w-8 h-8 text-dnd-ink-subtle mx-auto" />
                <p className="text-xs text-dnd-ink-muted font-dnd-body">No hay aventureros registrados en la lista blanca aún.</p>
              </div>
            ) : (
              players.map(p => {
                const isSelf = p.id === currentDmId;
                const char = CAMPAIGN_CHARACTERS.find(c => c.slug === p.assigned_character_slug);
                const invitationUrl = getCanonicalInvitationUrl();

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique hover:border-dnd-gold transition space-y-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {/* Avatar y Datos Principales */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-sm bg-dnd-crimson border border-dnd-gold flex items-center justify-center font-dnd-title font-bold text-dnd-gold text-xs shadow-sm">
                          {p.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-dnd-title font-bold text-dnd-crimson text-sm">
                              {p.display_name}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-dnd-parchment border border-dnd-border-antique text-dnd-ink-muted font-dnd-title uppercase">
                                Tú
                              </span>
                            )}
                            {p.role === 'dm' ? (
                              <DndBadge variant="crimson" size="sm">
                                DM
                              </DndBadge>
                            ) : (
                              <DndBadge variant="parchment" size="sm">
                                Jugador
                              </DndBadge>
                            )}
                          </div>
                          <span className="text-xs text-dnd-ink-muted font-mono block">
                            {p.email}
                          </span>
                        </div>
                      </div>

                      {/* Estado de Conexión */}
                      <div className="shrink-0">
                        {p.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-sm bg-dnd-parchment border border-emerald-600/40 text-emerald-700 dark:text-emerald-400 font-dnd-body font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Activo (Google)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-sm bg-dnd-parchment border border-dnd-gold/60 text-dnd-terracotta font-dnd-body font-semibold">
                            <Clock className="w-3 h-3 text-dnd-terracotta" />
                            Invitación pendiente
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fila de Personaje Asignado y Acciones */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2 border-t border-dnd-border-antique/80 text-xs">
                      <div className="flex items-center gap-2 text-dnd-ink-muted font-dnd-body">
                        <Swords className="w-3.5 h-3.5 text-dnd-gold shrink-0" />
                        <span>Héroe:</span>
                        {char ? (
                          <span className="font-bold text-dnd-crimson font-dnd-title text-[11px]">
                            {char.name} <span className="text-dnd-ink-muted font-normal font-dnd-body">({char.characterClass})</span>
                          </span>
                        ) : (
                          <span className="text-dnd-ink-subtle italic">
                            Sin asignar (Creación libre a futuro)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        {/* Copiar enlace individual */}
                        <button
                          type="button"
                          onClick={() => handleCopyLink(invitationUrl, p.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-dnd-parchment hover:bg-dnd-parchment-dark border border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink text-[11px] font-dnd-title uppercase tracking-wider transition"
                          title="Copiar enlace directo de invitación"
                        >
                          {copiedLinkIndex === p.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-dnd-ink-subtle" />
                              Enlace
                            </>
                          )}
                        </button>

                        {/* Editar asignación */}
                        <button
                          type="button"
                          onClick={() => handleEditPlayer(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-dnd-parchment hover:bg-dnd-parchment-dark border border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink text-[11px] font-dnd-title uppercase tracking-wider transition"
                          title="Modificar asignación o rol en el formulario"
                        >
                          <Edit3 className="w-3 h-3 text-dnd-ink-subtle" />
                          Editar
                        </button>

                        {/* Revocar Acceso */}
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => setPlayerToRevoke(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-dnd-crimson-surface hover:bg-dnd-crimson/20 border border-dnd-crimson/40 text-dnd-crimson text-[11px] font-dnd-title uppercase tracking-wider transition"
                            title="Revocar acceso y expulsar de la lista blanca"
                          >
                            <Trash2 className="w-3 h-3 text-dnd-crimson" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-crimson dnd-notched shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-dnd-border-antique pb-3">
              <div className="flex items-center gap-2 text-dnd-crimson">
                <AlertTriangle className="w-5 h-5 text-dnd-crimson" />
                <h4 className="font-dnd-title font-bold text-sm text-dnd-crimson uppercase tracking-wider">
                  ¿Revocar Acceso a la Mesa?
                </h4>
              </div>
              <button
                onClick={() => setPlayerToRevoke(null)}
                className="text-dnd-ink-muted hover:text-dnd-crimson"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-dnd-ink font-dnd-body leading-relaxed">
              Estás a punto de retirar a <strong className="text-dnd-crimson font-dnd-title">{playerToRevoke.display_name}</strong> (<code>{playerToRevoke.email}</code>) de la lista de aventureros autorizados. No podrá ingresar al portal a menos que lo vuelvas a invitar.
            </p>

            {revokeError && (
              <div className="p-3 rounded-sm bg-dnd-crimson-surface border border-dnd-crimson text-dnd-crimson text-xs">
                {revokeError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPlayerToRevoke(null)}
                disabled={isRevoking}
                className="px-4 py-2 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink-muted text-xs font-dnd-title uppercase tracking-wider font-semibold hover:text-dnd-ink transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                disabled={isRevoking}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover text-white text-xs font-dnd-title uppercase tracking-wider font-bold transition disabled:opacity-50"
              >
                {isRevoking ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-dnd-parchment border-t-transparent rounded-full animate-spin" />
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
