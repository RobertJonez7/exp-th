import { useCallback, useEffect, useState } from 'react';
import CreateDocumentForm from './CreateDocumentForm';
import DocumentList from './DocumentList';
import { bulkDeleteDocuments, createDocument, fetchDocuments, updateDocument } from './api';
import type { Doc } from './types';
import { parseJSON } from './helpers/parse-json';

const GENERIC_ERROR: string = 'Something went wrong. Please try again.';

export default function App() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | React.ReactElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDocuments(await fetchDocuments());
    } catch (error) {
      setError(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (title: string) => {
    setError(null);
    try {
      await createDocument(title);
      await load();
    } catch {
      setError(GENERIC_ERROR);
    }
  };

  const handleToggleLock = async (doc: Doc) => {
    setError(null);
    try {
      const updated = await updateDocument(doc.id, { ...doc, lockedBy: doc.lockedBy ? null : 'Robert' });
      setDocuments((docs) => docs.map((d) => (d.id === updated.id ? updated : d)));
    } catch {
      setError(GENERIC_ERROR);
      await load();
    }
  };

  const formatErrorMessage = (errors: string[]) => {
    return (
      <>
        <p>The following errors occurred:</p>

        <ul>
          {errors.map(error => <li key={error}>{error}</li>)}
        </ul>
      </>
    )
  }

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} document(s)? This cannot be undone.`)) {
      return;
    }

    setError(null);
    try {
      const response = await bulkDeleteDocuments(selectedIds);

      if (!response.success) {
        throw new Error(JSON.stringify(response.errors))
      }
    } catch (error) {
      const err = error as Error
      const message = parseJSON(err.message)
      const errorMessage = message ? formatErrorMessage(message) : GENERIC_ERROR

      setError(errorMessage);
    } finally {
      setSelectedIds([]);
      await load();
    }
  };

  return (
    <main className="app">
      <header className="app-header">
        <h1>Documents</h1>
        <button
          type="button"
          className="danger"
          onClick={handleDeleteSelected}
          disabled={selectedIds.length === 0}
        >
          Delete selected{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
        </button>
      </header>

      <CreateDocumentForm onCreate={handleCreate} />

      {error && <p className="status error">{error}</p>}
      {loading ? (
        <p className="status">Loading documents…</p>
      ) : (
        <DocumentList
          documents={documents}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onToggleLock={handleToggleLock}
        />
      )}
    </main>
  );
}
