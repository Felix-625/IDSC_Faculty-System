import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFacultyById,
  getFacultySubjects,
  assignSubject,
  removeSubject,
} from '../../../api/faculty';
import { getCourses } from '../../../api/courses';
import { getSchedules, createSchedule } from '../../../api/schedules';
import { mockSections } from '../../../api/mock/sections';
import { CURRENT_TERM } from '../../../config/academicTerm';
import { useToast } from '../../../components/common/useToast';
import { Button } from '../../../components/common/Button';
import { SearchInput } from '../../../components/common/SearchInput';
import { Select } from '../../../components/common/Select';
import { formatTimeRange } from '../../../utils/format';
import styles from './AssignSubjectPage.module.css';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Clock,
  MapPin,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function AssignSubjectPage() {
  const { facultyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const [currentStep, setCurrentStep] = useState(1); // 1 | 2 | 3

  // 1. Fetch Faculty Profile
  const { data: faculty } = useQuery({
    queryKey: ['faculty', facultyId],
    queryFn: () => getFacultyById(facultyId),
    enabled: Boolean(facultyId),
  });

  // 2. Fetch Faculty's existing assignments
  const {
    data: existingAssignments = [],
    refetch: refetchExisting,
  } = useQuery({
    queryKey: ['assignments', facultyId],
    queryFn: () => getFacultySubjects(facultyId),
    enabled: Boolean(facultyId),
  });

  // 3. Fetch all active curriculum courses
  const { data: allCourses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  // 4. Fetch schedules to derive room suggestions
  const { data: allSchedules = [] } = useQuery({
    queryKey: ['schedules', {}],
    queryFn: () => getSchedules(),
  });

  // 5. Fetch section suggestions
  const { data: mockSectionList = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: () => mockSections.list(),
  });

  // Derived suggestions
  const sectionSuggestions = useMemo(() => {
    const fromMocks = mockSectionList.map((s) => s.sectionName);
    const fromSchedules = allSchedules.map((s) => s.section);
    return Array.from(new Set([...fromMocks, ...fromSchedules, 'BSIT-3A', 'BSIT-3B', 'BSCS-3A'])).filter(
      Boolean
    );
  }, [mockSectionList, allSchedules]);

  const roomSuggestions = useMemo(() => {
    const rooms = allSchedules.map((s) => s.room).filter(Boolean);
    return Array.from(new Set([...rooms, 'ICT-204', 'ICT-205', 'LAB-101', 'LAB-102', 'RM-301']));
  }, [allSchedules]);

  // Step 1: Selected Subjects state
  const [selectedCourses, setSelectedCourses] = useState([]); // [courseCode]
  const [courseSearch, setCourseSearch] = useState('');
  const [courseDeptFilter, setCourseDeptFilter] = useState('ALL');

  // Step 2: Schedule Configurations state
  // key: courseCode -> { section, day, startTime, endTime, room }
  const [scheduleConfigs, setScheduleConfigs] = useState({});
  const [detailsTab, setDetailsTab] = useState('EDIT'); // 'EDIT' | 'VIEW'

  // Step 3: Execution and Results state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResults, setExecutionResults] = useState(null); // { successes: [], failures: [] }
  const [generalConflictError, setGeneralConflictError] = useState(null);

  // Active courses for Step 1
  const activeCourses = useMemo(() => {
    return allCourses.filter((c) => (c.status || 'ACTIVE') === 'ACTIVE');
  }, [allCourses]);

  const filteredCourses = useMemo(() => {
    return activeCourses.filter((c) => {
      const matchSearch =
        courseSearch === '' ||
        c.courseCode.toLowerCase().includes(courseSearch.toLowerCase()) ||
        c.courseName.toLowerCase().includes(courseSearch.toLowerCase());

      const matchDept =
        courseDeptFilter === 'ALL' || c.department === courseDeptFilter;

      return matchSearch && matchDept;
    });
  }, [activeCourses, courseSearch, courseDeptFilter]);

  const departmentOptions = useMemo(() => {
    const depts = Array.from(new Set(activeCourses.map((c) => c.department).filter(Boolean)));
    return [
      { value: 'ALL', label: 'All Departments' },
      ...depts.map((d) => ({ value: d, label: d })),
    ];
  }, [activeCourses]);

  // Step 1: Toggle subject selection
  const handleToggleCourse = (course) => {
    setSelectedCourses((prev) => {
      const exists = prev.includes(course.courseCode);
      if (exists) {
        // Remove config
        const nextConfigs = { ...scheduleConfigs };
        delete nextConfigs[course.courseCode];
        setScheduleConfigs(nextConfigs);
        return prev.filter((code) => code !== course.courseCode);
      } else {
        // Add default config
        setScheduleConfigs((c) => ({
          ...c,
          [course.courseCode]: {
            section: sectionSuggestions[0] || 'BSIT-3A',
            day: 'Monday',
            startTime: '07:00',
            endTime: '10:00',
            room: roomSuggestions[0] || 'ICT-204',
          },
        }));
        return [...prev, course.courseCode];
      }
    });
  };

  // Step 2: Update configuration field
  const handleUpdateConfig = (courseCode, field, value) => {
    setScheduleConfigs((prev) => ({
      ...prev,
      [courseCode]: {
        ...(prev[courseCode] || {
          section: 'BSIT-3A',
          day: 'Monday',
          startTime: '07:00',
          endTime: '10:00',
          room: 'ICT-204',
        }),
        [field]: value,
      },
    }));
  };

  // Remove existing assignment in View mode
  const removeAssignmentMutation = useMutation({
    mutationFn: (assignmentId) => removeSubject(facultyId, assignmentId),
    onSuccess: () => {
      toastSuccess('Assignment removed', 'The subject offering has been unassigned.');
      refetchExisting();
      queryClient.invalidateQueries({ queryKey: ['assignments', facultyId] });
    },
    onError: (err) => {
      toastError('Failed to remove assignment', err.detail);
    },
  });

  // Step 3: Confirm Assignment Submission
  const handleConfirmAssignments = async () => {
    setIsSubmitting(true);
    setGeneralConflictError(null);

    const successes = [];
    const failures = [];

    for (const courseCode of selectedCourses) {
      const config = scheduleConfigs[courseCode];
      const course = allCourses.find((c) => c.courseCode === courseCode);

      try {
        // 1. Assign subject
        const assignResult = await assignSubject(facultyId, {
          courseCode,
          section: config.section.trim(),
          semester: CURRENT_TERM.semester,
          academicYear: CURRENT_TERM.academicYear,
        });

        const createdAssignmentId = assignResult.assignmentId;

        // 2. Create schedule entry
        try {
          const scheduleResult = await createSchedule({
            facultyId,
            courseCode,
            section: config.section.trim(),
            day: config.day,
            startTime: config.startTime,
            endTime: config.endTime,
            room: config.room.trim() || undefined,
          });

          successes.push({
            courseCode,
            courseName: course?.courseName,
            assignmentId: createdAssignmentId,
            scheduleId: scheduleResult.scheduleId,
            config,
          });
        } catch (scheduleErr) {
          // Schedule failed (e.g. 409 conflict)!
          failures.push({
            courseCode,
            courseName: course?.courseName,
            assignmentId: createdAssignmentId,
            config,
            error: scheduleErr,
          });
        }
      } catch (assignErr) {
        // Assignment itself failed (e.g. 409 already assigned)
        failures.push({
          courseCode,
          courseName: course?.courseName,
          assignmentId: null,
          config,
          error: assignErr,
        });
      }
    }

    setIsSubmitting(false);
    queryClient.invalidateQueries({ queryKey: ['assignments', facultyId] });
    queryClient.invalidateQueries({ queryKey: ['schedules'] });

    if (failures.length > 0) {
      // Find the first 409 error message to display in the conflict alert banner
      const conflict = failures.find((f) => f.error?.status === 409);
      if (conflict) {
        setGeneralConflictError(`409 · ${conflict.error.detail}`);
      } else {
        setGeneralConflictError('Some subjects or schedules could not be created.');
      }
    } else {
      toastSuccess(
        'Subjects assigned successfully',
        `Assigned ${successes.length} subjects to ${faculty?.name}.`
      );
    }

    setExecutionResults({ successes, failures });
  };

  // Retry failed schedule
  const handleRetrySchedule = async (item) => {
    try {
      const res = await createSchedule({
        facultyId,
        courseCode: item.courseCode,
        section: item.config.section.trim(),
        day: item.config.day,
        startTime: item.config.startTime,
        endTime: item.config.endTime,
        room: item.config.room.trim() || undefined,
      });

      toastSuccess('Schedule created', `Schedule for ${item.courseCode} created successfully.`);
      queryClient.invalidateQueries({ queryKey: ['schedules'] });

      // Move item from failures to successes
      setExecutionResults((prev) => {
        const nextFailures = prev.failures.filter((f) => f.courseCode !== item.courseCode);
        const nextSuccesses = [
          ...prev.successes,
          { ...item, scheduleId: res.scheduleId },
        ];
        return { successes: nextSuccesses, failures: nextFailures };
      });
    } catch (err) {
      toastError('Schedule retry failed', err.detail);
      setGeneralConflictError(`409 · ${err.detail}`);
    }
  };

  // Undo assignment for failed schedule
  const handleUndoAssignment = async (item) => {
    if (!item.assignmentId) return;
    try {
      await removeSubject(facultyId, item.assignmentId);
      toastSuccess('Assignment undone', `Unassigned ${item.courseCode}.`);
      queryClient.invalidateQueries({ queryKey: ['assignments', facultyId] });

      // Remove from failures
      setExecutionResults((prev) => ({
        ...prev,
        failures: prev.failures.filter((f) => f.courseCode !== item.courseCode),
      }));
    } catch (err) {
      toastError('Failed to undo assignment', err.detail);
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Header & Back Button */}
      <div className={styles.topBar}>
        <Link to="/dean/faculty" className={styles.backButton}>
          <ArrowLeft size={16} />
          <span>Back to Manage Faculty</span>
        </Link>
      </div>

      <div className={styles.pageHeader}>
        <h1 className={styles.mainTitle}>Assign Subject to Faculty</h1>
        <p className={styles.subTitle}>
          {faculty?.name || 'Faculty Member'} · <code>{facultyId}</code> · {CURRENT_TERM.semester},{' '}
          AY {CURRENT_TERM.academicYear}
        </p>
      </div>

      {/* 3-Step Progress Bar */}
      <div className={styles.stepper} role="tablist">
        <div
          className={`${styles.step} ${currentStep === 1 ? styles.stepActive : ''} ${
            currentStep > 1 ? styles.stepDone : ''
          }`}
        >
          <div className={styles.stepNumber}>1</div>
          <span className={styles.stepLabel}>Select subjects</span>
        </div>

        <div className={styles.stepLine} />

        <div
          className={`${styles.step} ${currentStep === 2 ? styles.stepActive : ''} ${
            currentStep > 2 ? styles.stepDone : ''
          }`}
        >
          <div className={styles.stepNumber}>2</div>
          <span className={styles.stepLabel}>Set section & schedule</span>
        </div>

        <div className={styles.stepLine} />

        <div
          className={`${styles.step} ${currentStep === 3 ? styles.stepActive : ''}`}
        >
          <div className={styles.stepNumber}>3</div>
          <span className={styles.stepLabel}>Review assignment</span>
        </div>
      </div>

      {/* STEP 1: Select Subjects */}
      {currentStep === 1 && (
        <div className={styles.stepContent}>
          <div className={styles.stepHeaderRow}>
            <div>
              <h2 className={styles.stepHeading}>Step 1: Choose Curriculum Subjects</h2>
              <p className={styles.stepDesc}>
                Select the course offerings to assign to {faculty?.name}.
              </p>
            </div>
            <div className={styles.selectedCountBadge}>
              {selectedCourses.length} Selected
            </div>
          </div>

          <div className={styles.filtersBar}>
            <SearchInput
              value={courseSearch}
              onChange={setCourseSearch}
              placeholder="Search by course code or subject title..."
              className={styles.searchInput}
            />
            <Select
              value={courseDeptFilter}
              onChange={setCourseDeptFilter}
              options={departmentOptions}
              className={styles.deptSelect}
            />
          </div>

          <div className={styles.coursesGrid}>
            {filteredCourses.map((course) => {
              const isSelected = selectedCourses.includes(course.courseCode);
              return (
                <div
                  key={course.courseCode}
                  className={`${styles.courseCard} ${isSelected ? styles.courseCardSelected : ''}`}
                >
                  <div className={styles.courseCardLeft}>
                    <div className={styles.codeRow}>
                      <span className={styles.codeText}>{course.courseCode}</span>
                      <span className={styles.unitsBadge}>{course.units} Units</span>
                    </div>
                    <h3 className={styles.courseTitle}>{course.courseName}</h3>
                    <p className={styles.courseMeta}>
                      {course.department} · {course.semester || CURRENT_TERM.semester}
                    </p>
                  </div>

                  <button
                    type="button"
                    className={`${styles.selectButton} ${
                      isSelected ? styles.buttonSelected : ''
                    }`}
                    onClick={() => handleToggleCourse(course)}
                  >
                    {isSelected ? (
                      <>
                        <Check size={16} />
                        <span>Selected</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className={styles.footerNav}>
            <div />
            <Button
              variant="primary"
              size="lg"
              disabled={selectedCourses.length === 0}
              iconRight={ArrowRight}
              onClick={() => setCurrentStep(2)}
            >
              Next: Set section & schedule ({selectedCourses.length})
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Set Section & Schedule Details */}
      {currentStep === 2 && (
        <div className={styles.stepContent}>
          <div className={styles.stepHeaderRow}>
            <div>
              <h2 className={styles.stepHeading}>Step 2: Section & Schedule Details</h2>
              <p className={styles.stepDesc}>
                Specify teaching time, room, and section for each selected subject.
              </p>
            </div>

            {/* Edit / View Switcher */}
            <div className={styles.switchTabs}>
              <button
                type="button"
                className={`${styles.switchTab} ${detailsTab === 'EDIT' ? styles.switchTabActive : ''}`}
                onClick={() => setDetailsTab('EDIT')}
              >
                Edit Details ({selectedCourses.length})
              </button>
              <button
                type="button"
                className={`${styles.switchTab} ${detailsTab === 'VIEW' ? styles.switchTabActive : ''}`}
                onClick={() => setDetailsTab('VIEW')}
              >
                View Existing ({existingAssignments.length})
              </button>
            </div>
          </div>

          {detailsTab === 'EDIT' ? (
            <div className={styles.configsList}>
              {selectedCourses.map((courseCode) => {
                const course = allCourses.find((c) => c.courseCode === courseCode);
                const config = scheduleConfigs[courseCode] || {
                  section: 'BSIT-3A',
                  day: 'Monday',
                  startTime: '07:00',
                  endTime: '10:00',
                  room: 'ICT-204',
                };

                return (
                  <div key={courseCode} className={styles.configItemCard}>
                    <div className={styles.configHeader}>
                      <div>
                        <span className={styles.codeText}>{courseCode}</span>
                        <h3 className={styles.configCourseName}>
                          {course?.courseName || courseCode}
                        </h3>
                      </div>
                      <span className={styles.unitsBadge}>{course?.units || 3} Units</span>
                    </div>

                    <div className={styles.fieldsGrid}>
                      {/* Section */}
                      <div className={styles.fieldItem}>
                        <label className={styles.fieldLabel}>Section</label>
                        <input
                          type="text"
                          list="sections-list"
                          value={config.section}
                          onChange={(e) =>
                            handleUpdateConfig(courseCode, 'section', e.target.value)
                          }
                          placeholder="e.g. BSIT-3A"
                          className={styles.input}
                        />
                        <datalist id="sections-list">
                          {sectionSuggestions.map((s) => (
                            <option key={s} value={s} />
                          ))}
                        </datalist>
                      </div>

                      {/* Day */}
                      <div className={styles.fieldItem}>
                        <label className={styles.fieldLabel}>Day</label>
                        <select
                          value={config.day}
                          onChange={(e) =>
                            handleUpdateConfig(courseCode, 'day', e.target.value)
                          }
                          className={styles.selectInput}
                        >
                          {DAYS_OF_WEEK.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Time */}
                      <div className={styles.fieldItem}>
                        <label className={styles.fieldLabel}>Teaching Period (Start – End)</label>
                        <div className={styles.timeInputsRow}>
                          <input
                            type="time"
                            value={config.startTime}
                            onChange={(e) =>
                              handleUpdateConfig(courseCode, 'startTime', e.target.value)
                            }
                            className={styles.inputTime}
                          />
                          <span className={styles.dash}>–</span>
                          <input
                            type="time"
                            value={config.endTime}
                            onChange={(e) =>
                              handleUpdateConfig(courseCode, 'endTime', e.target.value)
                            }
                            className={styles.inputTime}
                          />
                        </div>
                      </div>

                      {/* Room */}
                      <div className={styles.fieldItem}>
                        <label className={styles.fieldLabel}>Classroom / Lab</label>
                        <input
                          type="text"
                          list="rooms-list"
                          value={config.room}
                          onChange={(e) =>
                            handleUpdateConfig(courseCode, 'room', e.target.value)
                          }
                          placeholder="e.g. ICT-204"
                          className={styles.input}
                        />
                        <datalist id="rooms-list">
                          {roomSuggestions.map((r) => (
                            <option key={r} value={r} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW MODE: List of faculty's existing assignments */
            <div className={styles.existingList}>
              {existingAssignments.length === 0 ? (
                <div className={styles.emptyNotice}>
                  This faculty member currently has no active assignments.
                </div>
              ) : (
                existingAssignments.map((asg) => (
                  <div key={asg.assignmentId} className={styles.existingItem}>
                    <div>
                      <div className={styles.existingCodeRow}>
                        <span className={styles.codeText}>{asg.courseCode}</span>
                        <span className={styles.unitsBadge}>{asg.units} Units</span>
                      </div>
                      <h4 className={styles.existingName}>{asg.courseName}</h4>
                      <p className={styles.existingMeta}>
                        Section: {asg.section} · {asg.semester}, AY {asg.academicYear}
                      </p>
                    </div>

                    <Button
                      variant="danger-soft"
                      size="sm"
                      icon={Trash2}
                      onClick={() => removeAssignmentMutation.mutate(asg.assignmentId)}
                      isLoading={removeAssignmentMutation.isPending}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}

          <div className={styles.footerNav}>
            <Button variant="outline" size="lg" onClick={() => setCurrentStep(1)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              iconRight={ArrowRight}
              onClick={() => setCurrentStep(3)}
            >
              Review assignment →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Review Assignment & Confirm */}
      {currentStep === 3 && (
        <div className={styles.stepContent}>
          <div className={styles.stepHeaderRow}>
            <div>
              <h2 className={styles.stepHeading}>Step 3: Review & Confirm Assignment</h2>
              <p className={styles.stepDesc}>
                Review assignment schedule before saving to faculty record.
              </p>
            </div>
          </div>

          {/* Conflict Banner (Red Alert as in design) */}
          {generalConflictError && (
            <div className={styles.conflictBanner} role="alert">
              <AlertTriangle size={20} className={styles.conflictBannerIcon} />
              <div className={styles.conflictBannerText}>
                <strong>Assignment / Schedule Conflict Detected:</strong>
                <p>{generalConflictError}</p>
              </div>
            </div>
          )}

          {/* Results Summary if already submitted */}
          {executionResults && (
            <div className={styles.resultsSummary}>
              {executionResults.successes.length > 0 && (
                <div className={styles.successBlock}>
                  <CheckCircle2 size={18} className={styles.successIcon} />
                  <span>
                    Successfully assigned {executionResults.successes.length} subjects to{' '}
                    {faculty?.name}.
                  </span>
                </div>
              )}

              {executionResults.failures.map((item) => (
                <div key={item.courseCode} className={styles.failureItem}>
                  <div className={styles.failureLeft}>
                    <strong>{item.courseCode}</strong> — {item.courseName} (Section {item.config.section})
                    <div className={styles.failureErrorMsg}>
                      {item.error?.detail || 'Schedule conflict'}
                    </div>
                  </div>
                  <div className={styles.failureActions}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={RotateCcw}
                      onClick={() => handleRetrySchedule(item)}
                    >
                      Retry Schedule
                    </Button>
                    {item.assignmentId && (
                      <Button
                        variant="danger-soft"
                        size="sm"
                        onClick={() => handleUndoAssignment(item)}
                      >
                        Undo Assignment
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Review Summary Table */}
          <div className={styles.reviewTableCard}>
            <table className={styles.reviewTable}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Section</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Room</th>
                  <th>Units</th>
                </tr>
              </thead>
              <tbody>
                {selectedCourses.map((code) => {
                  const course = allCourses.find((c) => c.courseCode === code);
                  const config = scheduleConfigs[code] || {};
                  return (
                    <tr key={code}>
                      <td>
                        <div className={styles.reviewSubjectCell}>
                          <span className={styles.codeText}>{code}</span>
                          <span className={styles.reviewCourseName}>
                            {course?.courseName || code}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.sectionBadge}>{config.section}</span>
                      </td>
                      <td>{config.day}</td>
                      <td>
                        <div className={styles.timeRow}>
                          <Clock size={14} />
                          <span>{formatTimeRange(config.startTime, config.endTime)}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.roomRow}>
                          <MapPin size={14} />
                          <span>{config.room || 'TBA'}</span>
                        </div>
                      </td>
                      <td>
                        <strong>{course?.units || 3}</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.footerNav}>
            <Button
              variant="outline"
              size="lg"
              disabled={isSubmitting}
              onClick={() => setCurrentStep(2)}
            >
              Back
            </Button>

            {executionResults && executionResults.failures.length === 0 ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/dean/faculty')}
              >
                Finished (Return to Faculty)
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                onClick={handleConfirmAssignments}
              >
                Confirm assignment
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
