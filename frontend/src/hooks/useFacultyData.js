import { useQuery } from '@tanstack/react-query';
import {
  getFacultySubjects,
  getFacultySalary,
  getFacultyById,
} from '../api/faculty';
import { getFacultySchedule } from '../api/schedules';
import { getCourse } from '../api/courses';

export function useFacultySubjects(facultyId) {
  return useQuery({
    queryKey: ['assignments', facultyId],
    queryFn: () => getFacultySubjects(facultyId),
    enabled: Boolean(facultyId),
  });
}

export function useFacultySchedule(facultyId) {
  return useQuery({
    queryKey: ['schedule', facultyId],
    queryFn: () => getFacultySchedule(facultyId),
    enabled: Boolean(facultyId),
  });
}

export function useFacultySalary(facultyId) {
  return useQuery({
    queryKey: ['salary', facultyId],
    queryFn: () => getFacultySalary(facultyId),
    enabled: Boolean(facultyId),
  });
}

export function useFacultyProfile(facultyId) {
  return useQuery({
    queryKey: ['faculty', facultyId],
    queryFn: () => getFacultyById(facultyId),
    enabled: Boolean(facultyId),
  });
}

export function useCourseDetails(courseCode) {
  return useQuery({
    queryKey: ['course', courseCode],
    queryFn: () => getCourse(courseCode),
    enabled: Boolean(courseCode),
  });
}
