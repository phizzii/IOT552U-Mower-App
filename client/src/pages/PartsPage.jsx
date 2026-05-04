import { startTransition, useEffect, useState } from 'react';
import PartsList from '../components/parts/PartsList';
import PartForm from '../components/parts/PartForm';
import PartDetailPage from '../components/parts/PartDetailPage';
import PageHeader from '../components/navigation/PageHeader';
import { fetchJson } from '../utils/api';

function PartsPage() {
  const [parts, setParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Form state
  const [formState, setFormState] = useState({
    isOpen: false,
    mode: 'create',
    part: null,
    isSubmitting: false,
  });

  // Detail view state
  const [detailState, setDetailState] = useState({
    isOpen: false,
    partId: null,
  });

  // Load parts data
  async function loadData() {
    setIsLoading(true);
    setError('');

    try {
      const partsData = await fetchJson('/parts');
      startTransition(() => {
        setParts(partsData);
      });
    } catch (loadError) {
      setError(loadError.message || 'Parts data could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Form handlers
  function handleAddPart() {
    setFormState({
      isOpen: true,
      mode: 'create',
      part: null,
      isSubmitting: false,
    });
    setActionError('');
    setActionMessage('');
  }

  async function handleEditPart(partId) {
    const part = parts.find((p) => p.part_id === partId);

    if (!part) {
      setActionError('Part not found.');
      return;
    }

    setFormState({
      isOpen: true,
      mode: 'edit',
      part,
      isSubmitting: false,
    });
    setActionError('');
    setActionMessage('');
  }

  async function handleFormSubmit(formData) {
    setFormState((current) => ({ ...current, isSubmitting: true }));
    setActionError('');
    setActionMessage('');

    try {
      if (formState.mode === 'create') {
        await fetchJson('/parts', {
          body: JSON.stringify(formData),
          method: 'POST',
        });

        setActionMessage('Part created successfully.');
        setFormState({ isOpen: false, mode: 'create', part: null, isSubmitting: false });
        await loadData();
      } else {
        await fetchJson(`/parts/${formState.part.part_id}`, {
          body: JSON.stringify(formData),
          method: 'PUT',
        });

        setActionMessage('Part updated successfully.');
        setFormState({ isOpen: false, mode: 'edit', part: null, isSubmitting: false });
        await loadData();
      }
    } catch (submitError) {
      setActionError(submitError.message || 'The request could not be completed.');
      setFormState((current) => ({ ...current, isSubmitting: false }));
    }
  }

  function handleFormClose() {
    setFormState({ isOpen: false, mode: 'create', part: null, isSubmitting: false });
    setActionError('');
  }

  // Delete handler
  async function handleDeletePart(partId) {
    setActionError('');
    setActionMessage('');

    try {
      await fetchJson(`/parts/${partId}`, {
        method: 'DELETE',
      });

      setActionMessage('Part deleted successfully.');
      await loadData();
    } catch (deleteError) {
      setActionError(deleteError.message || 'Could not delete part.');
    }
  }

  // Detail view handlers
  function handleViewPart(partId) {
    setDetailState({ isOpen: true, partId });
  }

  function handleDetailClose() {
    setDetailState({ isOpen: false, partId: null });
  }

  return (
    <div className="page-wrapper">
      <PageHeader
        eyebrow="Parts & Inventory"
        summary="Parts connect jobs to inventory, showing which components are used most frequently and tracking profitability across your service operations."
        title="Parts"
      />

      {error ? <div className="feedback-banner error">{error}</div> : null}
      {actionError ? <div className="feedback-banner error">{actionError}</div> : null}
      {actionMessage ? <div className="feedback-banner success">{actionMessage}</div> : null}

      <div className="page-grid">
        <div className="page-stack">
          <section className="surface-card hero-card" data-reveal="intro">
            <div>
              <div className="section-label">Inventory Management</div>
              <h3 className="section-title">Track parts and pricing</h3>
              <p className="section-copy">
                Monitor supplier costs, retail pricing, and usage patterns.
                Each part becomes a key component in your service workflow.
              </p>
            </div>

            <button className="primary-button" onClick={handleAddPart} type="button">
              + New Part
            </button>
          </section>

          {isLoading ? (
            <div className="surface-card">
              <div className="loading-state">Loading parts...</div>
            </div>
          ) : (
            <PartsList
              onDelete={handleDeletePart}
              onEdit={handleEditPart}
              onView={handleViewPart}
              parts={parts}
            />
          )}
        </div>
      </div>

      {/* Modal components */}
      <PartForm
        error={actionError}
        isOpen={formState.isOpen}
        isSubmitting={formState.isSubmitting}
        mode={formState.mode}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        part={formState.part}
      />

      {detailState.isOpen && (
        <PartDetailPage
          onClose={handleDetailClose}
          onEdit={handleEditPart}
          partId={detailState.partId}
        />
      )}
    </div>
  );
}

export default PartsPage;
