import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockSections } from '../../../api/mock/sections';
import { mockPrograms } from '../../../api/mock/programs';
import { useToast } from '../../../components/common/useToast';
import { PageHeader } from '../../../components/common/PageHeader';
import { SearchInput } from '../../../components/common/SearchInput';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';
import { DataTable } from '../../../components/common/DataTable';
import { MetricCard } from '../../../components/common/MetricCard';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Pagination } from '../../../components/common/Pagination';
import { SectionFormModal } from './SectionFormModal';
import styles from './ManageSectionsPage.module.css';
import { Layers, Plus, Pencil, Trash2, Users, GraduationCap } from 'lucide-react';

const YEAR_LEVEL_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Year Levels' },
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
];

export function ManageSectionsPage() {
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('ALL');
  const [yearLevelFilter, setYearLevelFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [deletingSection, setDeletingSection] = useState(null);

  // 1. Fetch sections from mock
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['mockSections'],
    queryFn: () => mockSections.list(),
  });

  // 2. Fetch programs for filter dropdown
  const { data: programs = [] } = useQuery({
    queryKey: ['mockPrograms'],
    queryFn: () => mockPrograms.list(),
  });

  const programFilterOptions = useMemo(() => {
    const list = [{ value: 'ALL', label: 'All Programs' }];
    programs.forEach((p) => {
      list.push({ value: p.programCode, label: p.programCode });
    });
    return list;
  }, [programs]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => mockSections.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockSections'] });
      toastSuccess('Section created successfully');
      setIsModalOpen(false);
    },
    onError: (err) => {
      toastError(err.message || 'Failed to create section');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => mockSections.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockSections'] });
      toastSuccess('Section updated successfully');
      setIsModalOpen(false);
      setEditingSection(null);
    },
    onError: (err) => {
      toastError(err.message || 'Failed to update section');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => mockSections.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockSections'] });
      toastSuccess('Section removed successfully');
      setDeletingSection(null);
    },
    onError: (err) => {
      toastError(err.message || 'Failed to delete section');
    },
  });

  // Metrics
  const totalStudents = useMemo(
    () => sections.reduce((acc, s) => acc + (Number(s.studentCount) || 0), 0),
    [sections]
  );
  const programCount = useMemo(
    () => new Set(sections.map((s) => s.program)).size,
    [sections]
  );

  // Filtered sections
  const filteredSections = useMemo(() => {
    let result = [...sections];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.sectionName.toLowerCase().includes(q) ||
          s.program.toLowerCase().includes(q)
      );
    }
    if (programFilter !== 'ALL') {
      result = result.filter((s) => s.program === programFilter);
    }
    if (yearLevelFilter !== 'ALL') {
      result = result.filter((s) => String(s.yearLevel) === yearLevelFilter);
    }
    return result;
  }, [sections, searchTerm, programFilter, yearLevelFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSections.length / pageSize));
  const paginatedSections = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSections.slice(start, start + pageSize);
  }, [filteredSections, currentPage, pageSize]);

  const handleOpenAdd = () => {
    setEditingSection(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (section) => {
    setEditingSection(section);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data) => {
    if (editingSection) {
      updateMutation.mutate({ id: editingSection.sectionId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getYearOrdinal = (lvl) => {
    const num = Number(lvl);
    if (num === 1) return '1st Year';
    if (num === 2) return '2nd Year';
    if (num === 3) return '3rd Year';
    if (num === 4) return '4th Year';
    return `${lvl}th Year`;
  };

  const tableColumns = [
    {
      key: 'sectionName',
      header: 'Section Name',
      render: (s) => <span className={styles.sectionBadge}>{s.sectionName}</span>,
    },
    {
      key: 'program',
      header: 'Program',
      render: (s) => <span className={styles.programCode}>{s.program}</span>,
    },
    {
      key: 'yearLevel',
      header: 'Year Level',
      render: (s) => <span className={styles.yearText}>{getYearOrdinal(s.yearLevel)}</span>,
    },
    {
      key: 'studentCount',
      header: 'Enrolled Students',
      render: (s) => (
        <span className={styles.studentCount}>
          <Users size={14} className={styles.studentIcon} />
          {s.studentCount ?? 0} students
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <div className={styles.actionsCell}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => handleOpenEdit(s)}
            title="Edit Section"
            aria-label={`Edit ${s.sectionName}`}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => setDeletingSection(s)}
            title="Delete Section"
            aria-label={`Delete ${s.sectionName}`}
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
        title="Manage Class Sections"
        subtitle="Organize student sections, monitor student caps, and align academic programs"
        icon={Layers}
        actions={
          <div className={styles.headerActions}>
            <span className={styles.demoDataBadge} title="Using mock data layer">
              Demo data
            </span>
            <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
              Add Section
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        <MetricCard
          title="Total Sections"
          value={sections.length}
          icon={Layers}
        />
        <MetricCard
          title="Enrolled Students"
          value={totalStudents}
          icon={Users}
        />
        <MetricCard
          title="Programs Represented"
          value={programCount}
          icon={GraduationCap}
        />
      </div>

      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrap}>
          <SearchInput
            placeholder="Search by section name or program..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.filterWrap}>
            <Select
              value={programFilter}
              onChange={(val) => {
                setProgramFilter(val);
                setCurrentPage(1);
              }}
              options={programFilterOptions}
            />
          </div>

          <div className={styles.filterWrap}>
            <Select
              value={yearLevelFilter}
              onChange={(val) => {
                setYearLevelFilter(val);
                setCurrentPage(1);
              }}
              options={YEAR_LEVEL_FILTER_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        <DataTable
          columns={tableColumns}
          data={paginatedSections}
          isLoading={isLoading}
          keyExtractor={(s) => s.sectionId}
          emptyMessage="No class sections match your filters."
        />

        {filteredSections.length > pageSize && (
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
        <SectionFormModal
          key={editingSection?.sectionId || 'new'}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSection(null);
          }}
          initialData={editingSection}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingSection)}
        title="Delete Class Section"
        message={`Are you sure you want to remove section "${deletingSection?.sectionName}"? This will delete it from session mock storage.`}
        confirmLabel="Delete Section"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deletingSection) {
            deleteMutation.mutate(deletingSection.sectionId);
          }
        }}
        onCancel={() => setDeletingSection(null)}
      />
    </div>
  );
}
