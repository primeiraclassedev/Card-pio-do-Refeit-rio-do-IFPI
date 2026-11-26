'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// import refeitorio_ifpi from '@public/refeitorio_ifpi.png';
// import refeitorio_ifpi from '../../public/refeitorio_ifpi.png';

function getTeresinaNow() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const map = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });

  return new Date(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );
}

function formatDateISO(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDayMonth(isoStr) {
  const [, m, d] = isoStr.split('-');
  return `${d}/${m}`;
}

export default function CardapioClient({ initialMeals, nonSchoolDays }) {
  const { weekDays, todayISO } = useMemo(() => {
    const now = getTeresinaNow();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);

    const shortNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    const fullNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];

    const days = [];
    for (let i = 0; i < 5; i++) {
      const current = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const iso = formatDateISO(current);
      days.push({
        iso,
        shortName: shortNames[i],
        fullName: fullNames[i],
        dayMonth: formatDayMonth(iso),
      });
    }

    return { weekDays: days, todayISO: formatDateISO(now) };
  }, []);

  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const foundToday = weekDays.find((d) => d.iso === todayISO);
    return foundToday ? foundToday.iso : weekDays[0].iso;
  });

  const [status, setStatus] = useState({
    isOpen: false,
    badgeText: 'Verificando...',
    messageText: 'Carregando informações de horário...',
    iconClass: 'bi-clock',
    clock: '',
  });

  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    function updateStatus() {
      const now = getTeresinaNow();
      const dayOfWeek = now.getDay();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      const currentISO = formatDateISO(now);

      const clock = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      const ALMOCO_INICIO = 11 * 60 + 30;
      const ALMOCO_FIM = 13 * 60 + 30;
      const JANTAR_INICIO = 17 * 60;
      const JANTAR_FIM = 19 * 60;

      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      const isNonSchoolToday = Boolean(nonSchoolDays[currentISO]);

      if (isWeekday && isNonSchoolToday) {
        setStatus({
          isOpen: false,
          badgeText: 'Fechado Hoje',
          messageText: `Dia não letivo (${nonSchoolDays[currentISO]}). Próxima refeição no próximo dia útil às 11h30.`,
          iconClass: 'bi-calendar-x',
          clock,
        });
      } else if (isWeekday) {
        if (totalMinutes >= ALMOCO_INICIO && totalMinutes < ALMOCO_FIM) {
          setStatus({
            isOpen: true,
            badgeText: 'Aberto Agora',
            messageText: 'Servindo: Almoço (encerra às 13h30)',
            iconClass: 'bi-brightness-high-fill',
            clock,
          });
        } else if (totalMinutes >= JANTAR_INICIO && totalMinutes < JANTAR_FIM) {
          setStatus({
            isOpen: true,
            badgeText: 'Aberto Agora',
            messageText: 'Servindo: Jantar (encerra às 19h00)',
            iconClass: 'bi-moon-stars-fill',
            clock,
          });
        } else if (totalMinutes < ALMOCO_INICIO) {
          setStatus({
            isOpen: false,
            badgeText: 'Fechado no Momento',
            messageText: 'Próxima refeição: Almoço hoje às 11h30',
            iconClass: 'bi-hourglass-split',
            clock,
          });
        } else if (totalMinutes >= ALMOCO_FIM && totalMinutes < JANTAR_INICIO) {
          setStatus({
            isOpen: false,
            badgeText: 'Fechado no Momento',
            messageText: 'Próxima refeição: Jantar hoje às 17h00',
            iconClass: 'bi-hourglass-split',
            clock,
          });
        } else {
          setStatus({
            isOpen: false,
            badgeText: 'Fechado no Momento',
            messageText:
              dayOfWeek === 5
                ? 'Próxima refeição: Almoço na segunda-feira às 11h30'
                : 'Próxima refeição: Almoço amanhã às 11h30',
            iconClass: 'bi-moon',
            clock,
          });
        }
      } else {
        setStatus({
          isOpen: false,
          badgeText: 'Fechado (Fim de Semana)',
          messageText: 'Próxima refeição: Almoço na segunda-feira às 11h30',
          iconClass: 'bi-calendar2-week',
          clock,
        });
      }
    }

    updateStatus();
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, [nonSchoolDays]);

  const almocoData = initialMeals.find((m) => m.data === selectedDateStr && m.tipo === 'almoco');
  const jantarData = initialMeals.find((m) => m.data === selectedDateStr && m.tipo === 'jantar');

  const almocoPortions = almocoData?.refeicao_porcoes?.map((rp) => rp.porcoes).filter(Boolean) || [];
  const jantarPortions = jantarData?.refeicao_porcoes?.map((rp) => rp.porcoes).filter(Boolean) || [];

  function buildShareText() {
    const dayObj = weekDays.find((d) => d.iso === selectedDateStr);
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const header = `🍽️ *Cardápio Refeitório IFPI – Campus Teresina Central*\n📅 *${dayObj.fullName} (${dayObj.dayMonth})*\n\n`;

    if (nonSchoolDays[selectedDateStr]) {
      return `${header}⚠️ *Dia Não Letivo:* ${nonSchoolDays[selectedDateStr]}\n\nConfira em: ${url}`;
    }

    const almocoItens =
      almocoPortions.length > 0
        ? almocoPortions.map((p) => `• ${p.nome}`).join('\n')
        : '_Não há refeição cadastrada_';

    const jantarItens =
      jantarPortions.length > 0
        ? jantarPortions.map((p) => `• ${p.nome}`).join('\n')
        : '_Não há refeição cadastrada_';

    return `${header}☀️ *Almoço (11h30 às 13h30):*\n${almocoItens}\n\n🌙 *Jantar (17h00 às 19h00):*\n${jantarItens}\n\n📲 Acesse o cardápio completo: ${url}`;
  }

  function handleWhatsappShare() {
    const text = encodeURIComponent(buildShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  }

  async function handleNativeShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cardápio Refeitório IFPI - Teresina Central',
          text: buildShareText(),
          url,
        });
      } catch {
        // Cancelado pelo usuário
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Cabeçalho Institucional */}
      <header className="ifpi-header text-white shadow-sm">
        <div className="container py-3 py-md-4">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="brand-badge bg-white rounded-3 p-1 d-flex align-items-center justify-content-center shadow-sm overflow-hidden">
                <img
                  src="/refeitorio_ifpi.png"
                  alt="Logo Refeitório IFPI"
                  className="img-fluid"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div>
                <span className="badge bg-white text-ifpi-dark fw-semibold mb-1">
                  IFPI • Campus Teresina Central
                </span>
                <h1 className="h4 mb-0 fw-bold">Refeitório Estudantil</h1>
              </div>
            </div>
            <Link
              href="/login"
              className="btn btn-sm btn-outline-light opacity-75 d-none d-sm-inline-flex align-items-center gap-1"
            >
              <i className="bi bi-shield-lock"></i> Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="container my-4 flex-grow-1">
        {/* Banner de Status em Tempo Real */}
        <section aria-label="Status do Refeitório" className="mb-4">
          <div className={`card border-0 shadow-sm status-card ${status.isOpen ? 'status-open' : 'status-closed'}`}>
            <div className="card-body p-3 p-md-4 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="status-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                  <i className={`bi ${status.iconClass} fs-4`}></i>
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span id="status-badge" className="badge rounded-pill text-uppercase fw-bold">
                      {status.badgeText}
                    </span>
                    <small className="text-muted fw-medium">{status.clock}</small>
                  </div>
                  <p className="mb-0 fw-semibold text-dark">{status.messageText}</p>
                </div>
              </div>
              <div className="text-md-end border-top border-md-0 pt-2 pt-md-0 w-100 w-md-auto">
                <small className="text-muted d-block">
                  <i className="bi bi-sun text-warning me-1"></i>Almoço: <strong>11h30 às 13h30</strong>
                </small>
                <small className="text-muted d-block">
                  <i className="bi bi-moon-stars text-primary me-1"></i>Jantar: <strong>17h00 às 19h00</strong>
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* Seletor de Dias da Semana Vigente */}
        <section aria-label="Seleção de Dia da Semana" className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h2 className="h6 text-uppercase text-muted fw-bold mb-0">
              <i className="bi bi-calendar-week me-1 text-ifpi-green"></i> Cardápio da Semana
            </h2>
            <span className="badge bg-light text-secondary border">
              {weekDays[0].dayMonth} a {weekDays[4].dayMonth}
            </span>
          </div>

          <div className="days-grid" role="tablist">
            {weekDays.map((day) => {
              const isActive = day.iso === selectedDateStr;
              const isToday = day.iso === todayISO;
              return (
                <button
                  key={day.iso}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedDateStr(day.iso)}
                  className={`day-btn ${isActive ? 'active' : ''} ${isToday ? 'is-today' : ''}`}
                >
                  <span className="day-name">{day.shortName}</span>
                  <span className="day-date">{day.dayMonth}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Alerta de Dia Não Letivo OU Cards de Refeições */}
        {nonSchoolDays[selectedDateStr] ? (
          <div className="alert alert-warning border-0 shadow-sm rounded-4 p-4 text-center" role="alert">
            <i className="bi bi-calendar-x fs-1 text-warning d-block mb-2"></i>
            <h3 className="h5 fw-bold text-dark mb-1">Dia Não Letivo</h3>
            <p className="mb-0 text-secondary">Motivo: {nonSchoolDays[selectedDateStr]}</p>
          </div>
        ) : (
          <section className="row g-4" aria-label="Refeições do Dia">
            {/* Card Almoço */}
            <div className="col-12 col-lg-6">
              <article className="card meal-card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
                <div className="card-header meal-header-almoco text-white py-3 px-4 border-0 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-brightness-high-fill fs-5"></i>
                    <h3 className="h5 mb-0 fw-bold">Almoço</h3>
                  </div>
                  <span className="badge bg-white text-ifpi-dark fw-semibold">11h30 – 13h30</span>
                </div>
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  {almocoPortions.length > 0 ? (
                    <ul className="list-unstyled portion-list mb-0">
                      {almocoPortions.map((portion) => (
                        <li key={portion.id}>
                          <div className="portion-icon-wrapper">
                            <i className={`bi ${portion.icone || 'bi-check2-circle'}`}></i>
                          </div>
                          <span>{portion.nome}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="empty-meal text-center py-4">
                      <i className="bi bi-info-circle fs-3 text-muted d-block mb-2"></i>
                      <p className="text-muted mb-0 fw-medium">Não há refeição cadastrada</p>
                    </div>
                  )}
                </div>
              </article>
            </div>

            {/* Card Jantar */}
            <div className="col-12 col-lg-6">
              <article className="card meal-card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
                <div className="card-header meal-header-jantar text-white py-3 px-4 border-0 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-moon-stars-fill fs-5"></i>
                    <h3 className="h5 mb-0 fw-bold">Jantar</h3>
                  </div>
                  <span className="badge bg-white text-ifpi-dark fw-semibold">17h00 – 19h00</span>
                </div>
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  {jantarPortions.length > 0 ? (
                    <ul className="list-unstyled portion-list mb-0">
                      {jantarPortions.map((portion) => (
                        <li key={portion.id}>
                          <div className="portion-icon-wrapper">
                            <i className={`bi ${portion.icone || 'bi-check2-circle'}`}></i>
                          </div>
                          <span>{portion.nome}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="empty-meal text-center py-4">
                      <i className="bi bi-info-circle fs-3 text-muted d-block mb-2"></i>
                      <p className="text-muted mb-0 fw-medium">Não há refeição cadastrada</p>
                    </div>
                  )}
                </div>
              </article>
            </div>
          </section>
        )}

        {/* Compartilhamento Social */}
        <section className="mt-4 pt-2 text-center">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <p className="small text-muted fw-medium mb-2">
              Compartilhe o cardápio deste dia com seus colegas:
            </p>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleWhatsappShare}
                className="btn btn-whatsapp px-4 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-2"
              >
                <i className="bi bi-whatsapp fs-5"></i> Enviar no WhatsApp
              </button>
              <button
                type="button"
                onClick={handleNativeShare}
                className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-2"
              >
                {copiedLink ? (
                  <>
                    <i className="bi bi-check2 text-success"></i> Link Copiado!
                  </>
                ) : (
                  <>
                    <i className="bi bi-share"></i> Compartilhar Link
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé Institucional */}
      <footer className="ifpi-footer text-white mt-5 pt-4 pb-4">
        <div className="container text-center">
          <div className="mb-3">
            <p className="mb-1 fw-semibold">
              <i className="bi bi-clock-history me-1"></i> Horário de Funcionamento do Refeitório
            </p>
            <p className="small opacity-75 mb-0">
              De segunda a sexta-feira: <strong>11h30 às 13h30</strong> (Almoço) |{' '}
              <strong>17h00 às 19h00</strong> (Jantar)
            </p>
          </div>

          <div className="alert alert-light bg-opacity-10 border-0 text-dark py-2 px-3 d-inline-block rounded-3 mb-3">
            <small>
              <i className="bi bi-exclamation-triangle-fill text-warning me-1"></i> O cardápio está sujeito a alteração sem aviso prévio.
            </small>
          </div>

          <hr className="border-light opacity-25 my-3" />

          <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 small opacity-75">
            <span>© 2026 IFPI – Campus Teresina Central</span>
            <span>
              Desenvolvido por{' '}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white fw-bold text-decoration-underline"
              >
                Primeira Classe - Desenvolvimento de Sistemas
              </a>
            </span>
          </div>
          <div className="mt-3 d-sm-none">
            <Link href="/login" className="text-white-50 small text-decoration-none">
              <i className="bi bi-shield-lock"></i> Área Administrativa
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}