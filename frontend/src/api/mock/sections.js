let sectionsData = [
  {
    sectionId: 'SEC-001',
    sectionName: 'BSIT-1A',
    program: 'BSIT',
    yearLevel: 1,
    studentCount: 42,
  },
  {
    sectionId: 'SEC-002',
    sectionName: 'BSIT-2A',
    program: 'BSIT',
    yearLevel: 2,
    studentCount: 38,
  },
  {
    sectionId: 'SEC-003',
    sectionName: 'BSIT-3A',
    program: 'BSIT',
    yearLevel: 3,
    studentCount: 35,
  },
  {
    sectionId: 'SEC-004',
    sectionName: 'BSIT-3B',
    program: 'BSIT',
    yearLevel: 3,
    studentCount: 30,
  },
  {
    sectionId: 'SEC-005',
    sectionName: 'BSCS-2A',
    program: 'BSCS',
    yearLevel: 2,
    studentCount: 28,
  },
  {
    sectionId: 'SEC-006',
    sectionName: 'BSCS-3A',
    program: 'BSCS',
    yearLevel: 3,
    studentCount: 25,
  },
];

let nextSectionNum = 7;

export const mockSections = {
  async list() {
    return [...sectionsData];
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
      studentCount: Number(data.studentCount) || 0,
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
    sectionsData.splice(index, 1);
    return true;
  },
};
