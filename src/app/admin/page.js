'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const AVAILABLE_ICONS = [
  'bi-egg-fried', 'bi-cup-hot', 'bi-cup-straw', 'bi-apple',
  'bi-fire', 'bi-flower1', 'bi-stars', 'bi-circle-half',
  'bi-bezier2', 'bi-droplet-fill', 'bi-heart-fill', 'bi-award',
  'bi-basket2-fill', 'bi-brightness-high', 'bi-check2-circle', 'bi-bookmark-star',
];

function getTeresinaNow() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [y, m, d] = formatter.format(new Date()).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toISO(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateBR(isoDate) {
  const [y, m, d] = isoDate.split('-');
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return `${dias[dateObj.getDay()]} (${d}/${m}/${y})`;
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const weekRange = useMemo(() => {
    const now = getTeresinaNow();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    const friday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 4);
    const toBR = (iso) => {
      const [y, m, d] = iso.split('-');
      return `${d}/${m}/${y}`;
    };
    return { start: toISO(monday), end: toISO(friday), today: toISO(now), toBR };
  }, []);

  // Abas e Feedback
  const [activeTab, setActiveTab] = useState('refeicoes');
  const [feedback, setFeedback] = useState(null);

  // Dados carregados do Supabase
  const [portions, setPortions] = useState([]);
  const [meals, setMeals] = useState([]);
  const [nonSchoolDays, setNonSchoolDays] = useState([]);

  // Estados do formulário de Refeição
  const [editingMealId, setEditingMealId] = useState('');
  const [mealDate, setMealDate] = useState(weekRange.today);
  const [mealType, setMealType] = useState('almoco');
  const [selectedPortions, setSelectedPortions] = useState([]);
  const [savingMeal, setSavingMeal] = useState(false);

  // Estados do formulário de Porção
  const [editingPortionId, setEditingPortionId] = useState('');
  const [portionName, setPortionName] = useState('');
  const [portionIcon, setPortionIcon] = useState('bi-egg-fried');

  // Estados do formulário de Dia Não Letivo
  const [nonSchoolDate, setNonSchoolDate] = useState('');
  const [nonSchoolReason, setNonSchoolReason] = useState('');

  function notify(message, type = 'success') {
    setFeedback({ message, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setFeedback(null), 4500);
  }

  const fetchAllData = useCallback(async () => {
    const [portionsRes, mealsRes, nonSchoolRes] = await Promise.all([
      supabase.from('porcoes').select('*').order('nome', { ascending: true }),
      supabase
        .from('refeicoes')
        .select(`
          id,
          data,
          tipo,
          refeicao_porcoes (
            porcao_id,
            porcoes ( id, nome, icone )
          )
        `)
        .gte('data', weekRange.start)
        .lte('data', weekRange.end)
        .order('data', { ascending: true })
        .order('tipo', { ascending: true }),
      supabase.from('dias_nao_letivos').select('*').order('data', { ascending: false }),
    ]);

    if (portionsRes.data) setPortions(portionsRes.data);
    if (mealsRes.data) setMeals(mealsRes.data);
    if (nonSchoolRes.data) setNonSchoolDays(nonSchoolRes.data);
  }, [supabase, weekRange.start, weekRange.end]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  // --- AÇÕES DE REFEIÇÕES ---
  function togglePortionSelection(id) {
    setSelectedPortions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleStartEditMeal(meal) {
    setEditingMealId(meal.id);
    setMealDate(meal.data);
    setMealType(meal.tipo);
    setSelectedPortions(meal.refeicao_porcoes.map((rp) => rp.porcao_id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetMealForm() {
    setEditingMealId('');
    setMealDate(weekRange.today);
    setMealType('almoco');
    setSelectedPortions([]);
  }

  async function handleSaveMeal(e) {
    e.preventDefault();
    if (selectedPortions.length === 0) {
      notify('Selecione pelo menos uma porção para esta refeição.', 'warning');
      return;
    }

    setSavingMeal(true);
    try {
      let targetMealId = editingMealId;

      if (editingMealId) {
        const { error: updErr } = await supabase
          .from('refeicoes')
          .update({ data: mealDate, tipo: mealType })
          .eq('id', editingMealId);
        if (updErr) throw updErr;

        const { error: delErr } = await supabase
          .from('refeicao_porcoes')
          .delete()
          .eq('refeicao_id', editingMealId);
        if (delErr) throw delErr;
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from('refeicoes')
          .insert([{ data: mealDate, tipo: mealType }])
          .select('id')
          .single();

        if (insErr) {
          if (insErr.code === '23505') {
            throw new Error('Já existe uma refeição deste tipo cadastrada para esta data. Use o botão "Editar" ao lado.');
          }
          throw insErr;
        }
        targetMealId = inserted.id;
      }

      const relations = selectedPortions.map((porcao_id) => ({
        refeicao_id: targetMealId,
        porcao_id,
      }));

      const { error: relErr } = await supabase.from('refeicao_porcoes').insert(relations);
      if (relErr) throw relErr;

      notify(editingMealId ? 'Refeição atualizada com sucesso!' : 'Refeição cadastrada no cardápio!');
      resetMealForm();
      await fetchAllData();
    } catch (err) {
      notify(err.message || 'Erro ao salvar refeição.', 'danger');
    } finally {
      setSavingMeal(false);
    }
  }

  async function handleDeleteMeal(meal) {
    const label = `${meal.tipo === 'almoco' ? 'Almoço' : 'Jantar'} de ${formatDateBR(meal.data)}`;
    if (!confirm(`Tem certeza que deseja excluir o ${label}?`)) return;

    const { error } = await supabase.from('refeicoes').delete().eq('id', meal.id);
    if (error) {
      notify('Erro ao excluir refeição.', 'danger');
    } else {
      notify('Refeição removida do cardápio.');
      await fetchAllData();
    }
  }

  // --- AÇÕES DE PORÇÕES ---
  function handleStartEditPortion(portion) {
    setEditingPortionId(portion.id);
    setPortionName(portion.nome);
    setPortionIcon(portion.icone);
  }

  function resetPortionForm() {
    setEditingPortionId('');
    setPortionName('');
    setPortionIcon('bi-egg-fried');
  }

  async function handleSavePortion(e) {
    e.preventDefault();
    const cleanName = portionName.trim();
    if (!cleanName) return;

    const { error } = editingPortionId
      ? await supabase.from('porcoes').update({ nome: cleanName, icone: portionIcon }).eq('id', editingPortionId)
      : await supabase.from('porcoes').insert([{ nome: cleanName, icone: portionIcon }]);

    if (error) {
      notify('Erro ao salvar porção. Verifique se o nome já existe.', 'danger');
    } else {
      notify(editingPortionId ? 'Porção atualizada!' : 'Nova porção cadastrada!');
      resetPortionForm();
      await fetchAllData();
    }
  }

  async function handleDeletePortion(portion) {
    if (!confirm(`Deseja excluir a porção "${portion.nome}"?`)) return;

    const { error } = await supabase.from('porcoes').delete().eq('id', portion.id);
    if (error) {
      notify('Erro ao excluir porção.', 'danger');
    } else {
      notify('Porção excluída.');
      await fetchAllData();
    }
  }

  // --- AÇÕES DE DIAS NÃO LETIVOS ---
  async function handleSaveNonSchoolDay(e) {
    e.preventDefault();
    const { error } = await supabase
      .from('dias_nao_letivos')
      .upsert([{ data: nonSchoolDate, justificativa: nonSchoolReason.trim() }], { onConflict: 'data' });

    if (error) {
      notify('Erro ao registrar dia não letivo.', 'danger');
    } else {
      notify('Dia não letivo registrado com sucesso!');
      setNonSchoolDate('');
      setNonSchoolReason('');
      await fetchAllData();
    }
  }

  async function handleDeleteNonSchoolDay(data) {
    if (!confirm('Remover esta justificativa de dia não letivo?')) return;
    await supabase.from('dias_nao_letivos').delete().eq('data', data);
    notify('Registro removido.');
    await fetchAllData();
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Cabeçalho Administrativo */}
      <header className="ifpi-header text-white shadow-sm">
        <div className="container py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-sliders2 fs-4"></i>
            <div>
              <h1 className="h5 mb-0 fw-bold">Gestão do Cardápio</h1>
              <small className="opacity-75">IFPI • Campus Teresina Central</small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Link href="/" target="_blank" className="btn btn-sm btn-outline-light">
              <i className="bi bi-box-arrow-up-right me-1"></i> Ver Site
            </Link>
            <button type="button" onClick={handleLogout} className="btn btn-sm btn-danger fw-semibold">
              <i className="bi bi-box-arrow-right me-1"></i> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container my-4 flex-grow-1">
        {feedback && (
          <div className={`alert alert-${feedback.type} shadow-sm rounded-3`} role="alert">
            <i
              className={`bi ${
                feedback.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'
              } me-2`}
            ></i>
            {feedback.message}
          </div>
        )}

        {/* Abas de Navegação */}
        <ul className="nav nav-pills bg-white p-2 rounded-4 shadow-sm mb-4 gap-1">
          <li className="nav-item flex-fill text-center">
            <button
              type="button"
              onClick={() => setActiveTab('refeicoes')}
              className={`nav-link w-100 rounded-3 ${activeTab === 'refeicoes' ? 'active' : ''}`}
            >
              <i className="bi bi-calendar-check me-1"></i> Refeições da Semana
            </button>
          </li>
          <li className="nav-item flex-fill text-center">
            <button
              type="button"
              onClick={() => setActiveTab('porcoes')}
              className={`nav-link w-100 rounded-3 ${activeTab === 'porcoes' ? 'active' : ''}`}
            >
              <i className="bi bi-egg-fried me-1"></i> Catálogo de Porções
            </button>
          </li>
          <li className="nav-item flex-fill text-center">
            <button
              type="button"
              onClick={() => setActiveTab('nao-letivos')}
              className={`nav-link w-100 rounded-3 ${activeTab === 'nao-letivos' ? 'active' : ''}`}
            >
              <i className="bi bi-calendar-x me-1"></i> Dias Não Letivos
            </button>
          </li>
        </ul>

        {/* ABA 1: REFEIÇÕES */}
        {activeTab === 'refeicoes' && (
          <div className="row g-4">
            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                  <h2 className="h6 fw-bold mb-0 text-ifpi-dark">
                    <i
                      className={`bi ${
                        editingMealId ? 'bi-pencil-square text-primary' : 'bi-plus-circle-fill text-ifpi-green'
                      } me-1`}
                    ></i>
                    {editingMealId ? 'Editando Refeição' : 'Cadastrar / Editar Refeição'}
                  </h2>
                  {editingMealId && (
                    <button
                      type="button"
                      onClick={resetMealForm}
                      className="btn btn-sm btn-link text-danger text-decoration-none"
                    >
                      Cancelar edição
                    </button>
                  )}
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleSaveMeal}>
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-sm-6">
                        <label htmlFor="meal-date" className="form-label small fw-semibold">
                          Data da Refeição
                        </label>
                        <input
                          type="date"
                          id="meal-date"
                          className="form-control"
                          value={mealDate}
                          onChange={(e) => setMealDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <label htmlFor="meal-type" className="form-label small fw-semibold">
                          Tipo de Refeição
                        </label>
                        <select
                          id="meal-type"
                          className="form-select"
                          value={mealType}
                          onChange={(e) => setMealType(e.target.value)}
                          required
                        >
                          <option value="almoco">Almoço (11h–13h30)</option>
                          <option value="jantar">Jantar (17h00–18h30)</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label small fw-semibold mb-0">Selecione as Porções Servidas:</label>
                        <span className="badge bg-secondary">
                          {selectedPortions.length} selecionada{selectedPortions.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="row g-2" style={{ maxHeight: '310px', overflowY: 'auto' }}>
                        {portions.map((p) => {
                          const checked = selectedPortions.includes(p.id);
                          return (
                            <div key={p.id} className="col-12 col-sm-6">
                              <div
                                onClick={() => togglePortionSelection(p.id)}
                                className={`portion-check-card d-flex align-items-center gap-2 ${
                                  checked ? 'selected-card' : ''
                                }`}
                              >
                                <i className={`bi ${p.icone} text-ifpi-green`}></i>
                                <span className="small text-truncate">{p.nome}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingMeal}
                      className="btn bg-ifpi-green text-white w-100 py-2 fw-semibold rounded-3"
                    >
                      <i className="bi bi-check2-circle me-1"></i>
                      {savingMeal ? 'Salvando...' : 'Salvar Refeição'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                  <h2 className="h6 fw-bold mb-0 text-ifpi-dark">
                    <i className="bi bi-list-ul text-ifpi-green me-1"></i> Refeições Cadastradas (Semana Vigente)
                  </h2>
                  <span className="badge bg-light text-dark border">
                    {weekRange.toBR(weekRange.start)} a {weekRange.toBR(weekRange.end)}
                  </span>
                </div>
                <div className="card-body p-4">
                  {meals.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <i className="bi bi-calendar2-plus fs-2 d-block mb-2"></i>
                      Nenhuma refeição cadastrada para a semana vigente.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {meals.map((meal) => {
                        const isAlmoco = meal.tipo === 'almoco';
                        const mealPortions = meal.refeicao_porcoes.map((rp) => rp.porcoes).filter(Boolean);
                        return (
                          <div key={meal.id} className="border rounded-4 p-3 bg-light">
                            <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                              <div>
                                <span className={`badge ${isAlmoco ? 'bg-ifpi-green' : 'bg-ifpi-dark'} mb-1`}>
                                  <i
                                    className={`bi ${
                                      isAlmoco ? 'bi-brightness-high-fill' : 'bi-moon-stars-fill'
                                    } me-1`}
                                  ></i>
                                  {isAlmoco ? 'Almoço' : 'Jantar'}
                                </span>
                                <h3 className="h6 fw-bold mb-0">{formatDateBR(meal.data)}</h3>
                              </div>
                              <div className="d-flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditMeal(meal)}
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  <i className="bi bi-pencil-square"></i> Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMeal(meal)}
                                  className="btn btn-sm btn-outline-danger"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                            <div className="d-flex flex-wrap gap-1 mt-2">
                              {mealPortions.map((p) => (
                                <span key={p.id} className="badge bg-white text-dark border fw-normal py-1 px-2">
                                  <i className={`bi ${p.icone} text-ifpi-green me-1`}></i>
                                  {p.nome}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: CATÁLOGO DE PORÇÕES */}
        {activeTab === 'porcoes' && (
          <div className="row g-4">
            <div className="col-12 col-md-5">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                  <h2 className="h6 fw-bold mb-0 text-ifpi-dark">
                    {editingPortionId ? 'Editar Porção' : 'Nova Porção'}
                  </h2>
                  {editingPortionId && (
                    <button
                      type="button"
                      onClick={resetPortionForm}
                      className="btn btn-sm btn-link text-danger text-decoration-none"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleSavePortion}>
                    <div className="mb-3">
                      <label htmlFor="portion-name" className="form-label small fw-semibold">
                        Nome da Porção
                      </label>
                      <input
                        type="text"
                        id="portion-name"
                        className="form-control"
                        placeholder="Ex: Arroz à Grega, Bife Acebolado..."
                        value={portionName}
                        onChange={(e) => setPortionName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-semibold d-block">Escolha um Ícone:</label>
                      <div className="d-flex flex-wrap gap-2">
                        {AVAILABLE_ICONS.map((iconClass) => (
                          <button
                            key={iconClass}
                            type="button"
                            onClick={() => setPortionIcon(iconClass)}
                            className={`icon-option-btn ${iconClass === portionIcon ? 'selected' : ''}`}
                          >
                            <i className={`bi ${iconClass}`}></i>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="btn bg-ifpi-green text-white w-100 py-2 fw-semibold rounded-3">
                      <i className="bi bi-save me-1"></i> Salvar Porção
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-7">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-bottom py-3 px-4">
                  <h2 className="h6 fw-bold mb-0 text-ifpi-dark">Porções Disponíveis no Sistema</h2>
                </div>
                <div className="card-body p-4">
                  <div className="row g-2">
                    {portions.map((p) => (
                      <div key={p.id} className="col-12 col-sm-6">
                        <div className="d-flex align-items-center justify-content-between p-2 px-3 border rounded-3 bg-light">
                          <div className="d-flex align-items-center gap-2 text-truncate">
                            <i className={`bi ${p.icone} text-ifpi-green fs-5`}></i>
                            <span className="fw-medium text-truncate">{p.nome}</span>
                          </div>
                          <div className="d-flex gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditPortion(p)}
                              className="btn btn-sm btn-outline-secondary"
                              title="Editar"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePortion(p)}
                              className="btn btn-sm btn-outline-danger"
                              title="Excluir"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: DIAS NÃO LETIVOS */}
        {activeTab === 'nao-letivos' && (
          <div className="row g-4">
            <div className="col-12 col-md-5">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-bottom py-3 px-4">
                  <h2 className="h6 fw-bold mb-0 text-ifpi-dark">Registrar Dia Não Letivo</h2>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleSaveNonSchoolDay}>
                    <div className="mb-3">
                      <label htmlFor="non-school-date" className="form-label small fw-semibold">
                        Data
                      </label>
                      <input
                        type="date"
                        id="non-school-date"
                        className="form-control"
                        value={nonSchoolDate}
                        onChange={(e) => setNonSchoolDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="non-school-reason" className="form-label small fw-semibold">
                        Justificativa
                      </label>
                      <input
                        type="text"
                        id="non-school-reason"
                        className="form-control"
                        placeholder="Ex: Feriado Nacional, Recesso Escolar..."
                        value={nonSchoolReason}
                        onChange={(e) => setNonSchoolReason(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-warning fw-semibold w-100 py-2 rounded-3">
                      <i className="bi bi-calendar-x me-1"></i> Registrar Justificativa
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-7">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-bottom py-3 px-4">
                  <h2 className="h6 fw-bold mb-0 text-ifpi-dark">Dias Não Letivos Cadastrados</h2>
                </div>
                <div className="card-body p-4">
                  {nonSchoolDays.length === 0 ? (
                    <p className="text-muted small mb-0">Nenhum dia não letivo registrado.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {nonSchoolDays.map((item) => (
                        <div
                          key={item.data}
                          className="d-flex align-items-center justify-content-between p-3 border rounded-3 bg-light"
                        >
                          <div>
                            <strong className="d-block text-dark">{formatDateBR(item.data)}</strong>
                            <span className="small text-secondary">{item.justificativa}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteNonSchoolDay(item.data)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}