import { useAuth } from '../../../auth/useAuth';
import { useFacultySalary, useFacultyProfile } from '../../../hooks/useFacultyData';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusChip } from '../../../components/common/StatusChip';
import { formatCurrencyPHP, formatDate } from '../../../utils/format';
import { SkeletonCard } from '../../../components/common/Skeleton';
import { ErrorState } from '../../../components/common/ErrorState';
import styles from './SalaryPage.module.css';
import { Wallet, User, Calendar, CheckCircle2 } from 'lucide-react';

export function SalaryPage() {
  const { user } = useAuth();
  const facultyId = user?.facultyId;

  const {
    data: salaryData,
    isLoading: isLoadingSalary,
    isError: isSalaryError,
    refetch: refetchSalary,
  } = useFacultySalary(facultyId);

  const {
    data: profileData,
    isLoading: isLoadingProfile,
  } = useFacultyProfile(facultyId);

  const faculty = profileData || user;

  return (
    <div className={styles.container}>
      <PageHeader
        title="My Salary"
        subtitle="View your employment compensation, monthly rate, and payout details."
        icon={Wallet}
      />

      {isSalaryError ? (
        <ErrorState
          title="Could not load salary details"
          message="Failed to fetch compensation record from the payroll service."
          onRetry={refetchSalary}
        />
      ) : isLoadingSalary || isLoadingProfile ? (
        <div className={styles.skeletonGrid}>
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
        </div>
      ) : (
        <div className={styles.salaryGrid}>
          {/* Employee Information Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerTitleRow}>
                <User size={18} className={styles.headerIcon} />
                <h2 className={styles.cardTitle}>Employee Information</h2>
              </div>
              <StatusChip status={faculty?.employmentStatus || 'ACTIVE'} />
            </div>

            <div className={styles.detailsList}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Faculty ID</span>
                <span className={styles.detailValueCode}>{faculty?.facultyId}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Full Name</span>
                <span className={styles.detailValue}>{faculty?.name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Position</span>
                <span className={styles.detailValue}>{faculty?.position}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Department</span>
                <span className={styles.detailValue}>{faculty?.department}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Employment Type</span>
                <span className={styles.detailValue}>
                  {faculty?.employmentType ? faculty.employmentType.replace(/_/g, ' ') : 'FULL TIME'}
                </span>
              </div>
              {faculty?.specialization && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Specialization</span>
                  <span className={styles.detailValue}>{faculty.specialization}</span>
                </div>
              )}
            </div>
          </div>

          {/* Current Salary Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerTitleRow}>
                <Wallet size={18} className={styles.headerIcon} />
                <h2 className={styles.cardTitle}>Current Salary</h2>
              </div>
              <span className={styles.currencyBadge}>{salaryData?.currency || 'PHP'}</span>
            </div>

            <div className={styles.salaryHighlight}>
              <span className={styles.salaryLabel}>Monthly Base Compensation</span>
              <div className={styles.salaryAmount}>
                {formatCurrencyPHP(salaryData?.salary || 0)}
                <span className={styles.salaryPeriod}>/ month</span>
              </div>
              <div className={styles.effectiveDate}>
                <Calendar size={14} />
                <span>Effective {formatDate(salaryData?.effectiveDate)}</span>
              </div>
            </div>

            <div className={styles.detailsList}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Payment Cycle</span>
                <span className={styles.detailValue}>Semi-Monthly (15th & 30th)</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Tax Status</span>
                <span className={styles.detailValue}>Withholding Tax Applied</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Disbursement</span>
                <span className={styles.detailValue}>Direct Bank Deposit</span>
              </div>
            </div>
          </div>

          {/* Salary History Card (Single record as mandated by Section 6, item 5) */}
          <div className={`${styles.card} ${styles.fullWidthCard}`}>
            <div className={styles.cardHeader}>
              <div className={styles.headerTitleRow}>
                <Calendar size={18} className={styles.headerIcon} />
                <h2 className={styles.cardTitle}>Salary History</h2>
              </div>
              <span className={styles.historyNote}>Current payroll schedule</span>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.historyTable}>
                <thead>
                  <tr>
                    <th>Record</th>
                    <th>Effective Date</th>
                    <th>Employment Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.recordCell}>
                      <CheckCircle2 size={16} className={styles.activeCheck} />
                      <span className={styles.recordText}>Current Base Salary</span>
                    </td>
                    <td>{formatDate(salaryData?.effectiveDate)}</td>
                    <td>
                      {salaryData?.employmentType
                        ? salaryData.employmentType.replace(/_/g, ' ')
                        : 'FULL TIME'}
                    </td>
                    <td className={styles.amountCell}>
                      {formatCurrencyPHP(salaryData?.salary || 0)}
                    </td>
                    <td>
                      <StatusChip status="ACTIVE" size="sm" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
