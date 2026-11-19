let studentsDirectory = [
  // BSIT Students
  { studentId: '202610897', name: 'Juan Santos',     program: 'BSIT', yearLevel: 3, section: 'BSIT-3A', email: 'j.santos@student.idsc.edu' },
  { studentId: '202610898', name: 'Ana Reyes',       program: 'BSIT', yearLevel: 3, section: 'BSIT-3A', email: 'a.reyes@student.idsc.edu' },
  { studentId: '202610899', name: 'Mark Villanueva', program: 'BSIT', yearLevel: 3, section: 'BSIT-3A', email: 'm.villanueva@student.idsc.edu' },
  { studentId: '202610900', name: 'Liza Mendoza',    program: 'BSIT', yearLevel: 3, section: 'BSIT-3A', email: 'l.mendoza@student.idsc.edu' },
  { studentId: '202610911', name: 'Paolo Garcia',    program: 'BSIT', yearLevel: 3, section: null,      email: 'p.garcia@student.idsc.edu' },
  { studentId: '202610912', name: 'Bea Alonzo',      program: 'BSIT', yearLevel: 1, section: 'BSIT-1A', email: 'b.alonzo@student.idsc.edu' },
  { studentId: '202610913', name: 'Carlos Yulo',     program: 'BSIT', yearLevel: 1, section: 'BSIT-1A', email: 'c.yulo@student.idsc.edu' },
  { studentId: '202610914', name: 'Danica Sotto',    program: 'BSIT', yearLevel: 1, section: null,      email: 'd.sotto@student.idsc.edu' },
  { studentId: '202610915', name: 'Edward Barber',   program: 'BSIT', yearLevel: 1, section: null,      email: 'e.barber@student.idsc.edu' },
  { studentId: '202610916', name: 'Francine Diaz',   program: 'BSIT', yearLevel: 2, section: null,      email: 'f.diaz@student.idsc.edu' },

  // BSBA Students
  { studentId: '202620101', name: 'Gabriel Mercado', program: 'BSBA', yearLevel: 1, section: 'BSBA-1A', email: 'g.mercado@student.idsc.edu' },
  { studentId: '202620102', name: 'Hannah Montana',  program: 'BSBA', yearLevel: 1, section: 'BSBA-1A', email: 'h.montana@student.idsc.edu' },
  { studentId: '202620103', name: 'Ian Veneracion',  program: 'BSBA', yearLevel: 1, section: null,      email: 'i.veneracion@student.idsc.edu' },
  { studentId: '202620104', name: 'Julia Barretto',  program: 'BSBA', yearLevel: 2, section: null,      email: 'j.barretto@student.idsc.edu' },
  { studentId: '202620105', name: 'Kyle Echarri',    program: 'BSBA', yearLevel: 3, section: null,      email: 'k.echarri@student.idsc.edu' },

  // BSHM Students
  { studentId: '202630101', name: 'Lorraine Cutie',  program: 'BSHM', yearLevel: 1, section: 'BSHM-1A', email: 'l.cutie@student.idsc.edu' },
  { studentId: '202630102', name: 'Michael V.',      program: 'BSHM', yearLevel: 1, section: 'BSHM-1A', email: 'm.v@student.idsc.edu' },
  { studentId: '202630103', name: 'Nadine Lustre',   program: 'BSHM', yearLevel: 1, section: null,      email: 'n.lustre@student.idsc.edu' },
  { studentId: '202630104', name: 'Ogie Alcasid',    program: 'BSHM', yearLevel: 2, section: null,      email: 'o.alcasid@student.idsc.edu' },

  // BSED Students
  { studentId: '202640101', name: 'Patricia Tumulak',program: 'BSED', yearLevel: 1, section: 'BSED-1A', email: 'p.tumulak@student.idsc.edu' },
  { studentId: '202640102', name: 'Quentin Ramirez', program: 'BSED', yearLevel: 1, section: 'BSED-1A', email: 'q.ramirez@student.idsc.edu' },
  { studentId: '202640103', name: 'Regine Velasquez',program: 'BSED', yearLevel: 1, section: null,      email: 'r.velasquez@student.idsc.edu' },
  { studentId: '202640104', name: 'Seth Fedelin',    program: 'BSED', yearLevel: 3, section: null,      email: 's.fedelin@student.idsc.edu' },

  // BSCRIM Students
  { studentId: '202650101', name: 'Tito Sotto',      program: 'BSCRIM', yearLevel: 1, section: 'BSCRIM-1A', email: 't.sotto@student.idsc.edu' },
  { studentId: '202650102', name: 'Vic Sotto',       program: 'BSCRIM', yearLevel: 1, section: 'BSCRIM-1A', email: 'v.sotto@student.idsc.edu' },
  { studentId: '202650103', name: 'Joey De Leon',    program: 'BSCRIM', yearLevel: 1, section: null,        email: 'j.deleon@student.idsc.edu' },
  { studentId: '202650104', name: 'Wally Bayola',    program: 'BSCRIM', yearLevel: 2, section: null,        email: 'w.bayola@student.idsc.edu' },
  { studentId: '202650105', name: 'Jose Manalo',     program: 'BSCRIM', yearLevel: 3, section: null,        email: 'j.manalo@student.idsc.edu' },
];

let sectionsData = [
  {
    sectionId: 'SEC-001',
    sectionName: 'BSIT-1A',
    program: 'BSIT',
    yearLevel: 1,
    studentCount: 2,
  },
  {
    sectionId: 'SEC-002',
    sectionName: 'BSIT-3A',
    program: 'BSIT',
    yearLevel: 3,
    studentCount: 4,
  },
  {
    sectionId: 'SEC-003',
    sectionName: 'BSBA-1A',
    program: 'BSBA',
    yearLevel: 1,
    studentCount: 2,
  },
  {
    sectionId: 'SEC-004',
    sectionName: 'BSHM-1A',
    program: 'BSHM',
    yearLevel: 1,
    studentCount: 2,
  },
  {
    sectionId: 'SEC-005',
    sectionName: 'BSED-1A',
    program: 'BSED',
    yearLevel: 1,
    studentCount: 2,
  },
  {
    sectionId: 'SEC-006',
    sectionName: 'BSCRIM-1A',
    program: 'BSCRIM',
    yearLevel: 1,
    studentCount: 2,
  },
];

let nextSectionNum = 7;

export const DEPARTMENT_PROGRAMS = {
  'Information Technology': ['BSIT'],
  'Business Administration': ['BSBA'],
  'Hospitality and Tourism Management': ['BSHM', 'BSTM'],
  'Teacher Education': ['BSED'],
  'Criminology': ['BSCRIM'],
  'General Education': ['GENED'],
};

export const mockSections = {
  async list(department) {
    let list = sectionsData;
    if (department && department !== 'ALL' && department !== 'Academic Affairs') {
      const allowedPrograms = DEPARTMENT_PROGRAMS[department] || [];
      list = sectionsData.filter((s) => allowedPrograms.includes(s.program));
    }
    return list.map((s) => {
      const assignedCount = studentsDirectory.filter(
        (st) => st.section === s.sectionName
      ).length;
      return {
        ...s,
        studentCount: assignedCount > 0 ? assignedCount : (s.studentCount || 0),
      };
    });
  },

  async create(data) {
    if (!data.sectionName || !data.program) {
      throw new Error('Section name and program are required');
    }
    const sectionId = data.sectionId || `SEC-${String(nextSectionNum++).padStart(3, '0')}`;
    const item = {
      sectionId,
      sectionName: data.sectionName.trim(),
      program: data.program.trim(),
      yearLevel: Number(data.yearLevel) || 1,
      studentCount: 0,
    };
    sectionsData.push(item);
    return item;
  },

  async update(sectionId, data) {
    const index = sectionsData.findIndex(s => s.sectionId === sectionId);
    if (index === -1) {
      throw new Error(`Section ${sectionId} not found.`);
    }
    sectionsData[index] = {
      ...sectionsData[index],
      ...data,
      sectionId: sectionsData[index].sectionId, // Immutable
    };
    return sectionsData[index];
  },

  async remove(sectionId) {
    const index = sectionsData.findIndex(s => s.sectionId === sectionId);
    if (index === -1) {
      throw new Error(`Section ${sectionId} not found.`);
    }
    const sectionName = sectionsData[index].sectionName;
    // Unassign students from this section
    studentsDirectory.forEach((st) => {
      if (st.section === sectionName) {
        st.section = null;
      }
    });
    sectionsData.splice(index, 1);
    return true;
  },

  // Student Section Assignment APIs
  async getRoster(sectionName) {
    return studentsDirectory.filter((st) => st.section === sectionName);
  },

  async getAvailableStudents({ program, yearLevel, search, department }) {
    return studentsDirectory.filter((st) => {
      if (department && department !== 'ALL' && department !== 'Academic Affairs') {
        const allowedPrograms = DEPARTMENT_PROGRAMS[department] || [];
        if (!allowedPrograms.includes(st.program)) return false;
      }
      if (program && program !== 'ALL' && st.program !== program) return false;
      if (yearLevel && yearLevel !== 'ALL' && String(st.yearLevel) !== String(yearLevel)) return false;
      if (search && search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          st.name.toLowerCase().includes(q) ||
          st.studentId.toLowerCase().includes(q) ||
          st.program.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  },

  async assignStudents(sectionName, studentIds) {
    let assignedCount = 0;
    studentsDirectory.forEach((st) => {
      if (studentIds.includes(st.studentId)) {
        st.section = sectionName;
        assignedCount++;
      }
    });
    return assignedCount;
  },

  async unassignStudent(sectionName, studentId) {
    const student = studentsDirectory.find(
      (st) => st.studentId === studentId && st.section === sectionName
    );
    if (student) {
      student.section = null;
      return true;
    }
    return false;
  },
};
