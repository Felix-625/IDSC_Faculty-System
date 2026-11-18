export const ACADEMIC_SEMESTER =
  import.meta.env.VITE_ACADEMIC_SEMESTER || '1st Semester';

export const ACADEMIC_YEAR =
  import.meta.env.VITE_ACADEMIC_YEAR || '2026-2027';

export const CURRENT_TERM = {
  semester: ACADEMIC_SEMESTER,
  academicYear: ACADEMIC_YEAR,
};
