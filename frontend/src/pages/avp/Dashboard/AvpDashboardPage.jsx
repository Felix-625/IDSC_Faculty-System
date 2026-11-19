import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFacultyList } from '../../../api/faculty';
import { getCourses } from '../../../api/courses';
import { mockPrograms } from '../../../api/mock/programs';
import { MetricCard } from '../../../components/common/MetricCard';
import { PageHeader } from '../../../components/common/PageHeader';
import { Button } from '../../../components/common/Button';
import styles from './AvpDashboardPage.module.css';
import {
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  Calendar,
  Megaphone,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

const COLLEGES = [
  {
    id: 'it',
    name: 'College of Information Technology',
    department: 'Information Technology',
    programs: ['BSIT'],
    color: '#0284c7',
  },
  {
    id: 'ba',
    name: 'College of Business Administration',
    department: 'Business Administration',
    programs: ['BSBA'],
    color: '#d97706',
  },
  {
    id: 'hm',
    name: 'College of Hospitality & Tourism Management',
    department: 'Hospitality and Tourism Management',
    programs: ['BSHM', 'BSTM'],
    color: '#059669',
  },
  {
    id: 'educ',
    name: 'College of Teacher Education',
    department: 'Teacher Education',
    programs: ['BSED'],
    color: '#7c3aed',
  },
  {
    id: 'crim',
    name: 'College of Criminology',
    department: 'Criminology',
    programs: ['BSCRIM'],
    color: '#dc2626',
  },
  {
    id: 'gened',
    name: 'Department of General Education',
    department: 'General Education',
    programs: ['GEC Minors', 'NSTP', 'PATHFit'],
    color: '#4b5563',
  },
];

export function AvpDashboardPage() {
  const navigate = useNavigate();

  const { data: facultyList = [], isLoading: isLoadingFaculty } = useQuery({
    queryKey: ['faculty'],
    queryFn: getFacultyList,
  });

  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['mockPrograms'],
    queryFn: () => mockPrograms.list(),
  });

  // Calculate dean appointments
  const deans = useMemo(
    () => facultyList.filter((f) => f.position === 'DEAN'),
    [facultyList]
  );

  const instructors = useMemo(
    () => facultyList.filter((f) => f.position === 'FACULTY'),
    [facultyList]
  );

  // Map deans to colleges
  const collegeStats = useMemo(() => {
    return COLLEGES.map((c) => {
      const appointedDean = deans.find((d) => d.department === c.department);
      const deptFacultyCount = facultyList.filter(
        (f) => f.department === c.department && f.position === 'FACULTY'
      ).length;
      return {
        ...c,
        dean: appointedDean,
        facultyCount: deptFacultyCount,
      };
    });
  }, [deans, facultyList]);

  return (
    <div className={styles.container}>
      {/* Header Banner */}
      <PageHeader
        title="Office of the Academic Vice President"
        subtitle="Institutional curriculum governance, college deans oversight, and academic council operations"
        icon={GraduationCap}
        badge="Executive Council"
        actions={
          <div className={styles.headerActions}>
            <Button
              variant="outline"
              icon={UserCheck}
              onClick={() => navigate('/avp/deans')}
            >
              Manage Deans
            </Button>
            <Button
              variant="primary"
              icon={Megaphone}
              onClick={() => navigate('/dean/announcements')}
            >
              Broadcast Council Memo
            </Button>
          </div>
        }
      />

      {/* Overview Metrics */}
      <div className={styles.metricsGrid}>
        <MetricCard
          title="Appointed Deans"
          value={`${deans.length} / 6`}
          icon={UserCheck}
          caption="5 College Deans + GenEd Head"
          isLoading={isLoadingFaculty}
        />
        <MetricCard
          title="Total Faculty Roster"
          value={instructors.length}
          icon={Users}
          caption="Active teaching staff across colleges"
          isLoading={isLoadingFaculty}
        />
        <MetricCard
          title="Academic Programs"
          value={programs.length}
          icon={Layers}
          caption="Degree curricula offerings"
        />
        <MetricCard
          title="Curriculum Subjects"
          value={courses.length}
          icon={BookOpen}
          caption="Approved catalog courses"
          isLoading={isLoadingCourses}
        />
      </div>

      {/* College Oversight Section */}
      <div className={styles.sectionHeadingRow}>
        <div className={styles.sectionHeadingGroup}>
          <Building2 size={20} className={styles.sectionIcon} />
          <div>
            <h2 className={styles.sectionTitle}>College Academic Departments</h2>
            <p className={styles.sectionSubtitle}>
              Governance structure for the 5 colleges and the General Education unit
            </p>
          </div>
        </div>
        <Link to="/avp/deans" className={styles.viewDeansLink}>
          Manage Dean Appointments <ArrowRight size={14} />
        </Link>
      </div>

      <div className={styles.collegesGrid}>
        {collegeStats.map((col) => (
          <div key={col.id} className={styles.collegeCard}>
            <div className={styles.collegeHeader}>
              <div
                className={styles.colorIndicator}
                style={{ backgroundColor: col.color }}
              />
              <h3 className={styles.collegeName}>{col.name}</h3>
            </div>

            <div className={styles.deanInfo}>
              <span className={styles.label}>Appointed Dean:</span>
              {col.dean ? (
                <div className={styles.deanPerson}>
                  <ShieldCheck size={16} className={styles.deanVerifiedIcon} />
                  <span className={styles.deanName}>{col.dean.name}</span>
                </div>
              ) : (
                <span className={styles.noDean}>Vacant (Appointment Pending)</span>
              )}
            </div>

            <div className={styles.cardDetails}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Department Faculty</span>
                <span className={styles.detailValue}>{col.facultyCount} Instructors</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Programs</span>
                <span className={styles.detailValue}>
                  {col.programs.join(', ')}
                </span>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <Link
                to={`/dean/faculty`}
                className={styles.cardActionBtn}
              >
                <span>View Faculty</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Council Quick Tools */}
      <div className={styles.quickToolsCard}>
        <div className={styles.quickHeader}>
          <Sparkles size={18} className={styles.sparkleIcon} />
          <h2 className={styles.quickTitle}>Executive Council Operations</h2>
        </div>

        <div className={styles.toolsGrid}>
          <button
            type="button"
            className={styles.toolTile}
            onClick={() => navigate('/avp/deans')}
          >
            <div className={styles.toolIconWrap}>
              <UserCheck size={22} />
            </div>
            <div className={styles.toolTexts}>
              <span className={styles.toolTitle}>Manage College Deans</span>
              <span className={styles.toolDesc}>
                Review credentials and department leadership appointments
              </span>
            </div>
          </button>

          <button
            type="button"
            className={styles.toolTile}
            onClick={() => navigate('/dean/subjects')}
          >
            <div className={styles.toolIconWrap}>
              <BookOpen size={22} />
            </div>
            <div className={styles.toolTexts}>
              <span className={styles.toolTitle}>Curriculum Offerings</span>
              <span className={styles.toolDesc}>
                Review university courses across all 5 colleges and GenEd
              </span>
            </div>
          </button>

          <button
            type="button"
            className={styles.toolTile}
            onClick={() => navigate('/dean/schedule')}
          >
            <div className={styles.toolIconWrap}>
              <Calendar size={22} />
            </div>
            <div className={styles.toolTexts}>
              <span className={styles.toolTitle}>Institution Timetable</span>
              <span className={styles.toolDesc}>
                Inspect rooms, class assignments, and scheduling conflicts
              </span>
            </div>
          </button>

          <button
            type="button"
            className={styles.toolTile}
            onClick={() => navigate('/dean/announcements')}
          >
            <div className={styles.toolIconWrap}>
              <Megaphone size={22} />
            </div>
            <div className={styles.toolTexts}>
              <span className={styles.toolTitle}>Academic Memoranda</span>
              <span className={styles.toolDesc}>
                Publish institutional policies and academic council directives
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
