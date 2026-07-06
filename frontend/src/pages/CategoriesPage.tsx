import { useEffect, useMemo, useState } from 'react';
import CategoryForm from '../components/categories/CategoryForm';
import CategoryTypeBadge from '../components/ui/CategoryTypeBadge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorAlert from '../components/ui/ErrorAlert';
import LoadingCard from '../components/ui/LoadingCard';
import PageHeader from '../components/ui/PageHeader';
import { apiClient } from '../lib/apiClient';
import type { Category, CategoryType } from '../types/category';

type CategoriesResponse = {
  data: Category[];
};

type CategoryMutationResponse = {
  message: string;
  data: Category;
};

type CategoryPayload = {
  name: string;
  type: CategoryType;
};

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [deletingCategoryId, setDeletingCategoryId] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await apiClient<CategoriesResponse>('/categories');

        setCategories(response.data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to load categories',
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  async function handleSubmitCategory(values: CategoryPayload) {
    try {
      setIsSubmitting(true);
      setFormErrorMessage('');

      if (editingCategory) {
        const response = await apiClient<CategoryMutationResponse>(
          `/categories/${editingCategory.id}`,
          {
            method: 'PUT',
            body: values,
          },
        );

        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === response.data.id ? response.data : category,
          ),
        );
      } else {
        const response = await apiClient<CategoryMutationResponse>(
          '/categories',
          {
            method: 'POST',
            body: values,
          },
        );

        setCategories((currentCategories) => [
          ...currentCategories,
          response.data,
        ]);
      }

      setIsFormOpen(false);
      setEditingCategory(null);
    } catch (error) {
      setFormErrorMessage(
        error instanceof Error ? error.message : 'Failed to save category',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    try {
      setDeletingCategoryId(categoryId);
      setDeleteErrorMessage('');

      await apiClient(`/categories/${categoryId}`, {
        method: 'DELETE',
      });

      setCategories((currentCategories) =>
        currentCategories.filter((category) => category.id !== categoryId),
      );

      setPendingDeleteId('');
    } catch (error) {
      setDeleteErrorMessage(
        error instanceof Error ? error.message : 'Failed to delete category',
      );
    } finally {
      setDeletingCategoryId('');
    }
  }

  function handleOpenCreateForm() {
    setFormErrorMessage('');
    setEditingCategory(null);
    setIsFormOpen(true);
  }

  function handleOpenEditForm(category: Category) {
    setFormErrorMessage('');
    setDeleteErrorMessage('');
    setPendingDeleteId('');
    setEditingCategory(category);
    setIsFormOpen(true);
  }

  function handleCancelForm() {
    setFormErrorMessage('');
    setEditingCategory(null);
    setIsFormOpen(false);
  }

  const incomeCategories = useMemo(() => {
    return categories.filter((category) => category.type === 'income');
  }, [categories]);

  const expenseCategories = useMemo(() => {
    return categories.filter((category) => category.type === 'expense');
  }, [categories]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Categories"
          description="Manage income and expense categories for cleaner transaction tracking."
        />

        <Button
          type="button"
          onClick={handleOpenCreateForm}
          disabled={isFormOpen && !editingCategory}
        >
          Add Category
        </Button>
      </div>

      {isFormOpen && (
        <CategoryForm
          title={editingCategory ? 'Edit Category' : 'Add New Category'}
          description={
            editingCategory
              ? 'Update the name or type of this category.'
              : 'Create a category to organize your income or expense transactions.'
          }
          submitLabel={editingCategory ? 'Update Category' : 'Save Category'}
          initialValues={
            editingCategory
              ? {
                  name: editingCategory.name,
                  type: editingCategory.type,
                }
              : undefined
          }
          onCancel={handleCancelForm}
          onSubmit={handleSubmitCategory}
          isSubmitting={isSubmitting}
          errorMessage={formErrorMessage}
        />
      )}

      {deleteErrorMessage && <ErrorAlert message={deleteErrorMessage} />}

      {isLoading && <LoadingCard message="Loading categories..." />}

      {errorMessage && <ErrorAlert message={errorMessage} />}

      {!isLoading && !errorMessage && categories.length === 0 && (
        <EmptyState
          title="No categories yet"
          description="Create your first income or expense category to start organizing transactions."
        />
      )}

      {!isLoading && !errorMessage && categories.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryGroup
            title="Income Categories"
            description="Sources of money coming in."
            categories={incomeCategories}
            pendingDeleteId={pendingDeleteId}
            deletingCategoryId={deletingCategoryId}
            onEdit={handleOpenEditForm}
            onRequestDelete={setPendingDeleteId}
            onCancelDelete={() => setPendingDeleteId('')}
            onConfirmDelete={handleDeleteCategory}
          />

          <CategoryGroup
            title="Expense Categories"
            description="Spending groups for outgoing money."
            categories={expenseCategories}
            pendingDeleteId={pendingDeleteId}
            deletingCategoryId={deletingCategoryId}
            onEdit={handleOpenEditForm}
            onRequestDelete={setPendingDeleteId}
            onCancelDelete={() => setPendingDeleteId('')}
            onConfirmDelete={handleDeleteCategory}
          />
        </div>
      )}
    </section>
  );
}

type CategoryGroupProps = {
  title: string;
  description: string;
  categories: Category[];
  pendingDeleteId: string;
  deletingCategoryId: string;
  onEdit: (category: Category) => void;
  onRequestDelete: (categoryId: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (categoryId: string) => void;
};

function CategoryGroup({
  title,
  description,
  categories,
  pendingDeleteId,
  deletingCategoryId,
  onEdit,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: CategoryGroupProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      <div className="space-y-3">
        {categories.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            No categories in this group.
          </p>
        ) : (
          categories.map((category) => {
            const isPendingDelete = pendingDeleteId === category.id;
            const isDeleting = deletingCategoryId === category.id;

            return (
              <div
                key={category.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Category ID: {category.id.slice(0, 8)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <CategoryTypeBadge type={category.type} />

                    <Button
                      type="button"
                      variant="secondary"
                      className="px-3 py-2"
                      onClick={() => onEdit(category)}
                    >
                      Edit
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      className="px-3 py-2"
                      onClick={() => onRequestDelete(category.id)}
                      disabled={isDeleting}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {isPendingDelete && (
                  <div className="mt-4 rounded-xl border border-rose-100 bg-white p-4 dark:border-rose-500/20 dark:bg-slate-900">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Delete this category?
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      This action cannot be undone. Categories used by
                      transactions cannot be deleted.
                    </p>

                    <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancelDelete}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => onConfirmDelete(category.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CategoriesPage;