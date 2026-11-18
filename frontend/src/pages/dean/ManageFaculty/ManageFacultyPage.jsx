import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFacultyList, createFaculty, updateFaculty } from '../../../api/faculty';
import { useToast } from '../../../components/common/useToast';
import { PageHeader } from '../../../components/common/PageHeader';
import { SearchInput } from '../../../components/common/SearchInput';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { FacultyFormModal } from './FacultyFormModal';
import styles from './ManageFacultyPage.module.css';
import { Users, UserPlus, Edit2, ArrowRight } from 'lucide-react';

export function ManageFacultyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const {
    data: facultyList = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['faculty'],
    queryFn: getFacultyList,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'RESIGNED', label: 'Resigned' },
    { value: 'ON_LEAVE', label: 'On Leave' },
  ];

  const filteredFaculty = useMemo(() => {
    return facultyList.filter((f) => {
      const matchesSearch =
        searchQuery === '' ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.facultyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.department && f.department.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' || f.employmentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [facultyList, searchQuery, statusFilter]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createFaculty(data),
    onSuccess: (res) => {
      toastSuccess('Faculty member added', `${res.name} (${res.facultyId}) registered.`);
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
    },
    onError: (err) => {
      toastError('Failed to register faculty', err.detail);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ facultyId, data }) => updateFaculty(facultyId, data),
    onSuccess: (res) => {
      toastSuccess('Faculty profile updated', `${res.name} details saved.`);
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
    },
    onError: (err) => {
      toastError('Failed to update faculty', err.detail);
    },
  });

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faculty) => {
    setEditingFaculty(faculty);
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: 'facultyId',
      header: 'Faculty ID',
      width: '140px',
      render: (row) => <code className={styles.idCode}>{row.facultyId}</code>,
    },
    {
      key: 'name',
      header: 'Faculty Name',
      render: (row) => (
        <div className={styles.nameCell}>
          <span className={styles.nameText}>{row.name}</span>
          {row.email && <span className={styles.emailText}>{row.email}</span>}
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Position',
      width: '140px',
      render: (row) => <span className={styles.positionText}>{row.position}</span>,
    },
    {
      key: 'department',
      header: 'Department',
      width: '180px',
      render: (row) => <span>{row.department}</span>,
    },
    {
      key: 'employmentType',
      header: 'Employment',
      width: '130px',
      render: (row) => (
        <span className={styles.employmentBadge}>
          {row.employmentType ? row.employmentType.replace(/_/g, ' ') : 'FULL TIME'}
        </span>
      ),
    },
    {
      key: 'employmentStatus',
      header: 'Status',
      width: '120px',
      render: (row) => <StatusChip status={row.employmentStatus || 'ACTIVE'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '210px',
      align: 'right',
      render: (row) => (
        <div className={styles.actionsRow}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => handleOpenEdit(row)}
            title="Edit Faculty"
          >
            <Edit2 size={15} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            className={styles.assignBtn}
            onClick={() => navigate(`/dean/faculty/${encodeURIComponent(row.facultyId)}/assign`)}
            title="Assign Subject to Faculty"
          >
            <span>Assign Subject</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title="Manage Faculty"
        subtitle="Instructor roster, academic departments, employment status, and subject assignments."
        icon={Users}
        actions={
          <Button variant="primary" icon={UserPlus} onClick={handleOpenAdd}>
            + Add Faculty
          </Button>
        }
      />

      {/* Toolbar: Search and Status Filter */}
      <div className={styles.toolbar}>
        <div className={styles.countBadge}>
          <strong>{filteredFaculty.length}</strong> Faculty Members Registered
        </div>

        <div className={styles.filters}>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search faculty name, ID, department..."
            className={styles.search}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            className={styles.select}
          />
        </div>
      </div>

      {/* Table */}
      {isError ? (
        <ErrorState
          title="Could not load faculty directory"
          message="Failed to retrieve faculty records from the server."
          onRetry={refetch}
        />
      ) : (
        <div className={styles.tableCard}>
          <DataTable
            columns={columns}
            data={filteredFaculty}
            keyField="facultyId"
            isLoading={isLoading}
            emptyComponent={
              <EmptyState
                title="No faculty members found"
                description={
                  searchQuery
                    ? 'No faculty matched your search or status filter.'
                    : 'No faculty records are registered yet.'
                }
                icon={Users}
              />
            }
          />
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <FacultyFormModal
        key={editingFaculty?.facultyId || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingFaculty}
        onSubmit={async (data) => {
          if (editingFaculty) {
            await updateMutation.mutateAsync({
              facultyId: editingFaculty.facultyId,
              data,
            });
          } else {
            await createMutation.mutateAsync(data);
          }
        }}
      />
    </div>
  );
}
