import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockSections } from '../../../api/mock/sections';
import { mockPrograms } from '../../../api/mock/programs';
import { Modal } from '../../../components/common/Modal';
import { SearchInput } from '../../../components/common/SearchInput';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';
import { useToast } from '../../../components/common/useToast';
import styles from './SectionRosterModal.module.css';
import {
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  GraduationCap,
  Calendar,
  AlertCircle,
  Filter,
} from 'lucide-react';

const YEAR_LEVEL_OPTIONS = [
  { value: 'ALL', label: 'All Year Levels' },
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
];

export function SectionRosterModal({ isOpen, onClose, section, deanDepartment, isAvp = false }) {
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'add'

  // Filters for adding students
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(
    () => section?.program || 'ALL'
  );
  const [selectedYearLevel, setSelectedYearLevel] = useState(
    () => (section?.yearLevel ? String(section.yearLevel) : 'ALL')
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // 1. Fetch current section roster
  const { data: roster = [], isLoading: isLoadingRoster } = useQuery({
    queryKey: ['sectionRoster', section?.sectionName],
    queryFn: () => mockSections.getRoster(section.sectionName),
    enabled: Boolean(section?.sectionName),
  });

  // 2. Fetch all programs for the filter (scoped to Dean department or all for AVP)
  const { data: programs = [] } = useQuery({
    queryKey: ['mockPrograms', deanDepartment, isAvp],
    queryFn: () => mockPrograms.list(isAvp ? undefined : deanDepartment),
  });

  const programOptions = useMemo(() => {
    return [
      { value: 'ALL', label: 'All Programs' },
      ...programs.map((p) => ({ value: p.programCode, label: p.programCode })),
    ];
  }, [programs]);

  // 3. Fetch candidates to add
  const { data: candidates = [], isLoading: isLoadingCandidates } = useQuery({
    queryKey: [
      'candidates',
      selectedProgram,
      selectedYearLevel,
      searchTerm,
      deanDepartment,
    ],
    queryFn: () =>
      mockSections.getAvailableStudents({
        program: selectedProgram,
        yearLevel: selectedYearLevel,
        search: searchTerm,
        department: isAvp ? undefined : deanDepartment,
      }),
    enabled: activeTab === 'add',
  });

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: (studentIds) =>
      mockSections.assignStudents(section.sectionName, studentIds),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['sectionRoster'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['mockSections'] });
      toastSuccess(
        'Students Assigned',
        `${count} student(s) successfully added to section ${section.sectionName}.`
      );
      setSelectedStudentIds([]);
      setActiveTab('roster');
    },
    onError: (err) => {
      toastError('Failed to assign students', err.message);
    },
  });

  // Unassign mutation
  const unassignMutation = useMutation({
    mutationFn: (studentId) =>
      mockSections.unassignStudent(section.sectionName, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectionRoster'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['mockSections'] });
      toastSuccess('Student Removed', 'Student unassigned from this section.');
    },
    onError: (err) => {
      toastError('Failed to remove student', err.message);
    },
  });

  const handleToggleSelect = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllCandidates = () => {
    const unassignedInView = candidates
      .filter((s) => s.section !== section.sectionName)
      .map((s) => s.studentId);
    if (selectedStudentIds.length === unassignedInView.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(unassignedInView);
    }
  };

  const handleConfirmAssignment = () => {
    if (selectedStudentIds.length === 0) return;
    assignMutation.mutate(selectedStudentIds);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Section Roster: ${section?.sectionName}`}
      subtitle={`${section?.program} • Year Level ${section?.yearLevel} • Capacity & Enrolled Cohort`}
      size="large"
    >
      <div className={styles.modalContent}>
        {/* Tab Headers */}
        <div className={styles.tabsRow}>
          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === 'roster' ? styles.tabBtnActive : ''
            }`}
            onClick={() => setActiveTab('roster')}
          >
            <Users size={16} />
            <span>Enrolled Students ({roster.length})</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === 'add' ? styles.tabBtnActive : ''
            }`}
            onClick={() => setActiveTab('add')}
          >
            <UserPlus size={16} />
            <span>+ Add Students to Section</span>
          </button>
        </div>

        {/* Tab 1: Current Enrolled Roster */}
        {activeTab === 'roster' && (
          <div className={styles.rosterSection}>
            <div className={styles.rosterHeader}>
              <div className={styles.rosterInfo}>
                <span className={styles.rosterCount}>
                  <strong>{roster.length}</strong> Students Assigned
                </span>
                <span className={styles.rosterNote}>
                  Official students participating in {section?.sectionName} classes
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={UserPlus}
                onClick={() => setActiveTab('add')}
              >
                Enroll More Students
              </Button>
            </div>

            {isLoadingRoster ? (
              <div className={styles.loadingBox}>Loading roster...</div>
            ) : roster.length === 0 ? (
              <div className={styles.emptyRoster}>
                <Users size={36} className={styles.emptyIcon} />
                <h4 className={styles.emptyTitle}>No students assigned yet</h4>
                <p className={styles.emptySubtitle}>
                  This section has no enrolled students. Switch to the "Add Students" tab to pick candidates.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  icon={UserPlus}
                  onClick={() => setActiveTab('add')}
                >
                  Pick Students Now
                </Button>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Full Name</th>
                      <th>Program</th>
                      <th>Year Level</th>
                      <th>Email</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((st) => (
                      <tr key={st.studentId}>
                        <td>
                          <span className={styles.studentIdBadge}>
                            {st.studentId}
                          </span>
                        </td>
                        <td>
                          <span className={styles.studentName}>{st.name}</span>
                        </td>
                        <td>
                          <span className={styles.programChip}>
                            {st.program}
                          </span>
                        </td>
                        <td>
                          <span className={styles.yearText}>
                            {st.yearLevel} Year
                          </span>
                        </td>
                        <td className={styles.emailText}>
                          {st.email || '—'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => unassignMutation.mutate(st.studentId)}
                            title="Remove from Section"
                            aria-label={`Remove ${st.name} from section`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Add Students with Filters */}
        {activeTab === 'add' && (
          <div className={styles.addSection}>
            {/* Filter Bar with Year Level & Course/Program */}
            <div className={styles.filterCard}>
              <div className={styles.filterTitleRow}>
                <Filter size={15} className={styles.filterIcon} />
                <span className={styles.filterTitle}>
                  Student Directory Filters
                </span>
              </div>

              <div className={styles.filtersGrid}>
                <div className={styles.searchBox}>
                  <SearchInput
                    placeholder="Search by student name or student ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className={styles.selectBox}>
                  <Select
                    value={selectedProgram}
                    onChange={setSelectedProgram}
                    options={programOptions}
                  />
                </div>

                <div className={styles.selectBox}>
                  <Select
                    value={selectedYearLevel}
                    onChange={setSelectedYearLevel}
                    options={YEAR_LEVEL_OPTIONS}
                  />
                </div>
              </div>
            </div>

            {/* Candidates List with Multi-Select Checkboxes */}
            <div className={styles.candidatesHeader}>
              <div className={styles.candidatesMeta}>
                <span className={styles.candidatesCount}>
                  Found <strong>{candidates.length}</strong> matching students
                </span>
                {selectedStudentIds.length > 0 && (
                  <span className={styles.selectedCounterBadge}>
                    {selectedStudentIds.length} Selected
                  </span>
                )}
              </div>

              <div className={styles.candidatesActions}>
                <button
                  type="button"
                  className={styles.selectAllBtn}
                  onClick={handleSelectAllCandidates}
                >
                  {selectedStudentIds.length > 0
                    ? 'Deselect All'
                    : 'Select All in View'}
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  disabled={selectedStudentIds.length === 0}
                  loading={assignMutation.isPending}
                  onClick={handleConfirmAssignment}
                >
                  Assign to {section?.sectionName} ({selectedStudentIds.length})
                </Button>
              </div>
            </div>

            {isLoadingCandidates ? (
              <div className={styles.loadingBox}>Filtering student directory...</div>
            ) : candidates.length === 0 ? (
              <div className={styles.emptyRoster}>
                <AlertCircle size={32} className={styles.emptyIcon} />
                <p>No students match your filter criteria.</p>
                <span>Try adjusting the Year Level or Program filter above.</span>
              </div>
            ) : (
              <div className={styles.candidatesList}>
                {candidates.map((st) => {
                  const isCurrentSection = st.section === section.sectionName;
                  const isOtherSection = st.section && st.section !== section.sectionName;
                  const isSelected = selectedStudentIds.includes(st.studentId);

                  return (
                    <div
                      key={st.studentId}
                      className={`${styles.candidateItem} ${
                        isSelected ? styles.candidateItemSelected : ''
                      } ${isCurrentSection ? styles.candidateItemDisabled : ''}`}
                      onClick={() => {
                        if (!isCurrentSection) handleToggleSelect(st.studentId);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected || isCurrentSection}
                        disabled={isCurrentSection}
                        onChange={() => {
                          if (!isCurrentSection) handleToggleSelect(st.studentId);
                        }}
                        className={styles.checkbox}
                      />

                      <div className={styles.candidateDetails}>
                        <div className={styles.candidateTopRow}>
                          <span className={styles.candidateName}>{st.name}</span>
                          <span className={styles.candidateId}>{st.studentId}</span>
                        </div>
                        <div className={styles.candidateMetaRow}>
                          <span className={styles.metaBadge}>
                            <GraduationCap size={12} /> {st.program}
                          </span>
                          <span className={styles.metaBadge}>
                            <Calendar size={12} /> {st.yearLevel} Year Level
                          </span>
                          {st.email && (
                            <span className={styles.metaEmail}>{st.email}</span>
                          )}
                        </div>
                      </div>

                      <div className={styles.candidateStatus}>
                        {isCurrentSection ? (
                          <span className={styles.alreadyEnrolledBadge}>
                            Already in {section.sectionName}
                          </span>
                        ) : isOtherSection ? (
                          <span className={styles.inOtherSectionBadge}>
                            In {st.section} (will transfer)
                          </span>
                        ) : (
                          <span className={styles.unassignedBadge}>
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className={styles.modalFooter}>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
