import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFacultyList, createFaculty, updateFaculty } from '../../../api/faculty';
import { useToast } from '../../../components/common/useToast';
import { PageHeader } from '../../../components/common/PageHeader';
import { SearchInput } from '../../../components/common/SearchInput';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { MetricCard } from '../../../components/common/MetricCard';
import { Pagination } from '../../../components/common/Pagination';
import { AppointDeanModal } from './AppointDeanModal';
import { getInitials } from '../../../utils/format';
import styles from './ManageDeansPage.module.css';
import {
  UserCheck,
  UserPlus,
  Pencil,
  Building2,
  Mail,
  Award,
  BookOpen,
} from 'lucide-react';

const DEPARTMENT_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All College Departments' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Business Administration', label: 'Business Administration' },
  { value: 'Hospitality and Tourism Management', label: 'Hospitality & Tourism' },
  { value: 'Teacher Education', label: 'Teacher Education' },
  { value: 'Criminology', label: 'Criminology' },
  { value: 'General Education', label: 'General Education' },
];

export function ManageDeansPage() {
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDean, setEditingDean] = useState(null);

  // 1. Fetch Faculty list to extract Deans
  const { data: facultyList = [], isLoading } = useQuery({
    queryKey: ['faculty'],
    queryFn: getFacultyList,
  });

  const deans = useMemo(
    () => facultyList.filter((f) => f.position === 'DEAN'),
    [facultyList]
  );

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createFaculty(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      toastSuccess('Dean Appointed', `${res.name} appointed to ${res.department}.`);
      setIsModalOpen(false);
    },
    onError: (err) => {
      toastError('Failed to appoint dean', err.detail || err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateFaculty(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      toastSuccess('Dean Updated', `Appointment record for ${res.name} updated.`);
      setIsModalOpen(false);
      setEditingDean(null);
    },
    onError: (err) => {
      toastError('Failed to update dean', err.detail || err.message);
    },
  });

  // Filtered deans
  const filteredDeans = useMemo(() => {
    let result = [...deans];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.facultyId.toLowerCase().includes(q) ||
          d.department?.toLowerCase().includes(q) ||
          d.specialization?.toLowerCase().includes(q)
      );
    }
    if (departmentFilter !== 'ALL') {
      result = result.filter((d) => d.department === departmentFilter);
    }
    return result;
  }, [deans, searchTerm, departmentFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredDeans.length / pageSize));
  const paginatedDeans = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDeans.slice(start, start + pageSize);
  }, [filteredDeans, currentPage, pageSize]);

  const handleOpenAdd = () => {
    setEditingDean(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dean) => {
    setEditingDean(dean);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data) => {
    if (editingDean) {
      updateMutation.mutate({ id: editingDean.facultyId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const tableColumns = [
    {
      key: 'name',
      header: 'College Dean',
      render: (d) => (
        <div className={styles.deanCell}>
          <div className={styles.avatar}>{getInitials(d.name)}</div>
          <div className={styles.deanTexts}>
            <span className={styles.deanName}>{d.name}</span>
            <span className={styles.deanId}>{d.facultyId}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department / College Assignment',
      render: (d) => (
        <span className={styles.deptBadge}>
          <Building2 size={13} className={styles.deptIcon} />
          {d.department}
        </span>
      ),
    },
    {
      key: 'specialization',
      header: 'Academic Field',
      render: (d) => (
        <span className={styles.specializationText}>
          {d.specialization || 'Not specified'}
        </span>
      ),
    },
    {
      key: 'contact',
      header: 'Email',
      render: (d) =>
        d.email ? (
          <span className={styles.emailText}>
            <Mail size={13} className={styles.mailIcon} />
            {d.email}
          </span>
        ) : (
          <span className={styles.noEmail}>—</span>
        ),
    },
    {
      key: 'assignedSubjects',
      header: 'Teaching Load',
      render: (d) => (
        <span className={styles.subjectCount}>
          <BookOpen size={13} />
          {d.assignedSubjects?.length || 0} Subjects
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => (
        <StatusChip
          status={d.employmentStatus === 'ACTIVE' ? 'active' : 'warning'}
          label={d.employmentStatus}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (d) => (
        <div className={styles.actionsCell}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => handleOpenEdit(d)}
            title="Edit Dean Appointment"
            aria-label={`Edit ${d.name}`}
          >
            <Pencil size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title="College Deans & Leadership Directory"
        subtitle="Appoint, review, and oversee Deans across the 5 Colleges and General Education"
        icon={UserCheck}
        badge="Academic Council"
        actions={
          <Button variant="primary" icon={UserPlus} onClick={handleOpenAdd}>
            Appoint College Dean
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        <MetricCard
          title="Total Appointed Deans"
          value={deans.length}
          icon={UserCheck}
          caption="Active college academic heads"
        />
        <MetricCard
          title="Colleges Represented"
          value={new Set(deans.map((d) => d.department)).size}
          icon={Building2}
          caption="Out of 6 institutional units"
        />
        <MetricCard
          title="Teaching Deans"
          value={deans.filter((d) => d.assignedSubjects?.length > 0).length}
          icon={Award}
          caption="Deans with active subject loads"
        />
      </div>

      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrap}>
          <SearchInput
            placeholder="Search by Dean name, ID, or college department..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className={styles.filterWrap}>
          <Select
            value={departmentFilter}
            onChange={(val) => {
              setDepartmentFilter(val);
              setCurrentPage(1);
            }}
            options={DEPARTMENT_FILTER_OPTIONS}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        <DataTable
          columns={tableColumns}
          data={paginatedDeans}
          isLoading={isLoading}
          keyExtractor={(d) => d.facultyId}
          emptyMessage="No appointed deans match your filter criteria."
        />

        {filteredDeans.length > pageSize && (
          <div className={styles.paginationWrap}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Appoint / Edit Dean Modal */}
      {isModalOpen && (
        <AppointDeanModal
          key={editingDean?.facultyId || 'new'}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingDean(null);
          }}
          initialData={editingDean}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
