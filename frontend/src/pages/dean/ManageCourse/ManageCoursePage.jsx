import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockPrograms } from '../../../api/mock/programs';
import { useToast } from '../../../components/common/useToast';
import { PageHeader } from '../../../components/common/PageHeader';
import { SearchInput } from '../../../components/common/SearchInput';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { MetricCard } from '../../../components/common/MetricCard';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Pagination } from '../../../components/common/Pagination';
import { CourseFormModal } from './CourseFormModal';
import styles from './ManageCoursePage.module.css';
import { GraduationCap, Plus, Pencil, Trash2, Award, Building2, CheckCircle2 } from 'lucide-react';

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export function ManageCoursePage() {
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [deletingProgram, setDeletingProgram] = useState(null);

  // 1. Fetch programs from mock
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['mockPrograms'],
    queryFn: () => mockPrograms.list(),
  });

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: (data) => mockPrograms.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockPrograms'] });
      toastSuccess('Academic program created successfully');
      setIsModalOpen(false);
    },
    onError: (err) => {
      toastError(err.message || 'Failed to create academic program');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ code, data }) => mockPrograms.update(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockPrograms'] });
      toastSuccess('Academic program updated successfully');
      setIsModalOpen(false);
      setEditingProgram(null);
    },
    onError: (err) => {
      toastError(err.message || 'Failed to update academic program');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (code) => mockPrograms.remove(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockPrograms'] });
      toastSuccess('Academic program removed successfully');
      setDeletingProgram(null);
    },
    onError: (err) => {
      toastError(err.message || 'Failed to delete academic program');
    },
  });

  // Metrics
  const activeCount = useMemo(
    () => programs.filter((p) => p.status === 'ACTIVE').length,
    [programs]
  );
  const departmentCount = useMemo(
    () => new Set(programs.map((p) => p.department)).size,
    [programs]
  );

  // Filtered programs
  const filteredPrograms = useMemo(() => {
    let result = [...programs];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.programCode.toLowerCase().includes(q) ||
          p.programName.toLowerCase().includes(q) ||
          p.department?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [programs, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / pageSize));
  const paginatedPrograms = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPrograms.slice(start, start + pageSize);
  }, [filteredPrograms, currentPage, pageSize]);

  const handleOpenAdd = () => {
    setEditingProgram(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (program) => {
    setEditingProgram(program);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data) => {
    if (editingProgram) {
      updateMutation.mutate({ code: editingProgram.programCode, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const tableColumns = [
    {
      key: 'programCode',
      header: 'Program Code',
      render: (p) => <span className={styles.codeBadge}>{p.programCode}</span>,
    },
    {
      key: 'programName',
      header: 'Program / Degree Name',
      render: (p) => <span className={styles.programName}>{p.programName}</span>,
    },
    {
      key: 'department',
      header: 'Department',
      render: (p) => <span className={styles.deptText}>{p.department}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <StatusChip
          status={p.status === 'ACTIVE' ? 'active' : 'inactive'}
          label={p.status}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className={styles.actionsCell}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => handleOpenEdit(p)}
            title="Edit Program"
            aria-label={`Edit ${p.programCode}`}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => setDeletingProgram(p)}
            title="Delete Program"
            aria-label={`Delete ${p.programCode}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title="Academic Programs Management"
        subtitle="Manage college degree offerings, academic tracks, and department alignments"
        icon={GraduationCap}
        actions={
          <div className={styles.headerActions}>
            <span className={styles.demoDataBadge} title="Using mock data layer">
              Demo data
            </span>
            <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
              Add Program
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        <MetricCard
          title="Total Programs"
          value={programs.length}
          icon={Award}
        />
        <MetricCard
          title="Active Curricula"
          value={activeCount}
          icon={CheckCircle2}
        />
        <MetricCard
          title="Departments"
          value={departmentCount}
          icon={Building2}
        />
      </div>

      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrap}>
          <SearchInput
            placeholder="Search by program code, name, or department..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className={styles.filterWrap}>
          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        <DataTable
          columns={tableColumns}
          data={paginatedPrograms}
          isLoading={isLoading}
          keyExtractor={(p) => p.programCode}
          emptyMessage="No academic programs match your criteria."
        />

        {filteredPrograms.length > pageSize && (
          <div className={styles.paginationWrap}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <CourseFormModal
          key={editingProgram?.programCode || 'new'}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProgram(null);
          }}
          initialData={editingProgram}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingProgram)}
        title="Delete Academic Program"
        message={`Are you sure you want to remove ${deletingProgram?.programCode} (${deletingProgram?.programName})? This action will remove it from the mock store.`}
        confirmLabel="Delete Program"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deletingProgram) {
            deleteMutation.mutate(deletingProgram.programCode);
          }
        }}
        onCancel={() => setDeletingProgram(null)}
      />
    </div>
  );
}
