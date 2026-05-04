import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { fetchJson } from '../utils/api';

function createInitialFormState() {
  return {
    isOpen: false,
    isSubmitting: false,
    item: null,
    mode: 'create',
  };
}

function createInitialDetailState() {
  return {
    isOpen: false,
    itemId: null,
  };
}

function useCrudPage({
  basePath,
  getItems,
  itemIdKey,
  itemLabel,
  loadData,
  loadErrorMessage,
}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [formState, setFormState] = useState(createInitialFormState);
  const [detailState, setDetailState] = useState(createInitialDetailState);

  const items = useMemo(() => {
    if (!data) {
      return [];
    }

    return getItems(data);
  }, [data, getItems]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const nextData = await loadData();
      startTransition(() => {
        setData(nextData);
      });
    } catch (loadError) {
      setError(loadError.message || loadErrorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [loadData, loadErrorMessage]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function clearFeedback() {
    setActionError('');
    setActionMessage('');
  }

  function openCreate() {
    setFormState({
      isOpen: true,
      isSubmitting: false,
      item: null,
      mode: 'create',
    });
    clearFeedback();
  }

  function openEdit(itemId) {
    const item = items.find(
      (candidate) => candidate[itemIdKey] === itemId
    );

    if (!item) {
      setActionError(`${itemLabel} not found.`);
      return;
    }

    setFormState({
      isOpen: true,
      isSubmitting: false,
      item,
      mode: 'edit',
    });
    clearFeedback();
  }

  function closeForm() {
    setFormState(createInitialFormState());
    setActionError('');
  }

  async function submitForm(formData) {
    setFormState((current) => ({ ...current, isSubmitting: true }));
    clearFeedback();

    try {
      if (formState.mode === 'create') {
        await fetchJson(basePath, {
          body: JSON.stringify(formData),
          method: 'POST',
        });
        setActionMessage(`${itemLabel} created successfully.`);
      } else {
        await fetchJson(`${basePath}/${formState.item[itemIdKey]}`, {
          body: JSON.stringify(formData),
          method: 'PUT',
        });
        setActionMessage(`${itemLabel} updated successfully.`);
      }

      setFormState(createInitialFormState());
      await refresh();
    } catch (submitError) {
      setActionError(submitError.message || 'The request could not be completed.');
      setFormState((current) => ({ ...current, isSubmitting: false }));
    }
  }

  async function deleteItem(itemId) {
    setActionError('');
    setActionMessage('');

    try {
      await fetchJson(`${basePath}/${itemId}`, {
        method: 'DELETE',
      });
      setActionMessage(`${itemLabel} deleted successfully.`);
      await refresh();
    } catch (deleteError) {
      setActionError(deleteError.message || `Could not delete ${itemLabel.toLowerCase()}.`);
    }
  }

  function openDetail(itemId) {
    setDetailState({
      isOpen: true,
      itemId,
    });
  }

  function closeDetail() {
    setDetailState(createInitialDetailState());
  }

  return {
    actionError,
    actionMessage,
    closeDetail,
    closeForm,
    data,
    deleteItem,
    detailState,
    error,
    formState,
    isLoading,
    items,
    openCreate,
    openDetail,
    openEdit,
    refresh,
    setActionError,
    submitForm,
  };
}

export default useCrudPage;
