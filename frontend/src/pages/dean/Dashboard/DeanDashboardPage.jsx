import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFacultyList, createFaculty } from '../../../api/faculty';
import { getCourses, createCourse } from '../../../api/courses';
import { getAnnouncements, createAnnouncement } from '../../../api/announcements';
import { mockSections } from '../../../api/mock/sections';
import { useToast } from '../../../components/common/useToast';
import { MetricCard } from '../../../components/common/MetricCard';
import { FacultyFormModal } from '../ManageFaculty/FacultyFormModal';
import { SubjectFormModal } from '../ManageSubjects/SubjectFormModal';
import { AnnouncementFormModal } from '../ManageAnnouncements/AnnouncementFormModal';
import { formatDate } from '../../../utils/format';
import styles from './DeanDashboardPage.module.css';
import {
  Users,
  BookOpen,
  Layers,
  UserPlus,
  PlusCircle,
  Megaphone,
  ArrowRight,
  Calendar,
  Sparkles,
} from 'lucide-react';

export function DeanDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  // Queries
  const { data: facultyList = [], isLoading: isLoadingFaculty } = useQuery({
    queryKey: ['faculty'],
    queryFn: getFacultyList,
  });

  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  const { data: sections = [], isLoading: isLoadingSections } = useQuery({
    queryKey: ['sections'],
    queryFn: () => mockSections.list(),
  });

  const { data: announcements = [], isLoading: isLoadingAnnouncements } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
  });

  // Modal states for Quick Actions
  const [isAddFacultyOpen, setIsAddFacultyOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);

  // Mutations
  const createFacultyMutation = useMutation({
    mutationFn: (data) => createFaculty(data),
    onSuccess: (res) => {
      toastSuccess('Faculty member registered', `${res.name} (${res.facultyId}) added.`);
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
    },
    onError: (err) => {
      toastError('Failed to add faculty', err.detail);
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: (data) => createCourse(data),
    onSuccess: (res) => {
      toastSuccess('Subject created', `${res.courseCode} added to curriculum.`);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (err) => {
      toastError('Failed to add subject', err.detail);
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: (data) => createAnnouncement(data),
    onSuccess: () => {
      toastSuccess('Announcement published', 'Administrative memo broadcasted.');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (err) => {
      toastError('Failed to publish memo', err.detail);
    },
  });

  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <div className={styles.container}>
      {/* Hero Welcome Banner */}
      <section className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Welcome to IDSC Faculty Portal</h1>
          <p className={styles.heroSubtitle}>
            Dean Administration & Academic Department Management
          </p>
        </div>
      </section>

      {/* Overview Cards */}
      <div className={styles.overviewSection}>
        <h2 className={styles.sectionHeading}>Overview</h2>
        <div className={styles.metricsGrid}>
          <MetricCard
            title="Faculty"
            value={facultyList.length}
            icon={Users}
            caption="Active instructors & department staff"
            isLoading={isLoadingFaculty}
          />
          <MetricCard
            title="Subjects"
            value={courses.length}
            icon={BookOpen}
            caption="Curriculum offerings & courses"
            isLoading={isLoadingCourses}
          />
          <MetricCard
            title="Sections"
            value={sections.length}
            icon={Layers}
            caption="Active student classes this term"
            isLoading={isLoadingSections}
          />
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className={styles.quickActionsCard}>
        <div className={styles.quickHeader}>
          <Sparkles size={18} className={styles.sparkleIcon} />
          <h2 className={styles.sectionHeading}>Quick Actions</h2>
        </div>

        <div className={styles.actionsGrid}>
          <button
            type="button"
            className={styles.actionTile}
            onClick={() => setIsAddFacultyOpen(true)}
          >
            <div className={styles.actionIconCircle}>
              <UserPlus size={22} />
            </div>
            <div className={styles.actionTexts}>
              <span className={styles.actionTitle}>+ Add Faculty</span>
              <span className={styles.actionDesc}>Register a new teacher or staff</span>
            </div>
          </button>

          <button
            type="button"
            className={styles.actionTile}
            onClick={() => setIsAddSubjectOpen(true)}
          >
            <div className={styles.actionIconCircle}>
              <BookOpen size={22} />
            </div>
            <div className={styles.actionTexts}>
              <span className={styles.actionTitle}>+ Add Subject</span>
              <span className={styles.actionDesc}>Create a curriculum course offering</span>
            </div>
          </button>

          <button
            type="button"
            className={styles.actionTile}
            onClick={() => navigate('/dean/sections')}
          >
            <div className={styles.actionIconCircle}>
              <PlusCircle size={22} />
            </div>
            <div className={styles.actionTexts}>
              <span className={styles.actionTitle}>+ Add Section</span>
              <span className={styles.actionDesc}>Manage & configure student class groups</span>
            </div>
          </button>

          <button
            type="button"
            className={styles.actionTile}
            onClick={() => setIsAddAnnouncementOpen(true)}
          >
            <div className={styles.actionIconCircle}>
              <Megaphone size={22} />
            </div>
            <div className={styles.actionTexts}>
              <span className={styles.actionTitle}>+ New Announcement</span>
              <span className={styles.actionDesc}>Broadcast a memo to faculty</span>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Announcements Panel */}
      <div className={styles.announcementsCard}>
        <div className={styles.announcementsHeader}>
          <h2 className={styles.sectionHeading}>Recent Announcements</h2>
          <Link to="/dean/announcements" className={styles.viewAllLink}>
            Manage all announcements <ArrowRight size={14} />
          </Link>
        </div>

        {isLoadingAnnouncements ? (
          <div className={styles.loadingText}>Loading recent bulletins...</div>
        ) : recentAnnouncements.length === 0 ? (
          <div className={styles.emptyNotice}>No announcements published yet.</div>
        ) : (
          <div className={styles.recentList}>
            {recentAnnouncements.map((item) => (
              <div key={item.announcementId} className={styles.recentItem}>
                <div className={styles.itemLeft}>
                  <div className={styles.recentTitle}>{item.title}</div>
                  <div className={styles.recentMeta}>
                    <Calendar size={13} />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
                <Link
                  to={`/announcements/${item.announcementId}`}
                  className={styles.viewBtn}
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals triggered by Quick Actions */}
      <FacultyFormModal
        isOpen={isAddFacultyOpen}
        onClose={() => setIsAddFacultyOpen(false)}
        onSubmit={async (data) => {
          await createFacultyMutation.mutateAsync(data);
        }}
      />

      <SubjectFormModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onSubmit={async (data) => {
          await createCourseMutation.mutateAsync(data);
        }}
      />

      <AnnouncementFormModal
        isOpen={isAddAnnouncementOpen}
        onClose={() => setIsAddAnnouncementOpen(false)}
        onSubmit={async (data) => {
          await createAnnouncementMutation.mutateAsync(data);
        }}
      />
    </div>
  );
}
