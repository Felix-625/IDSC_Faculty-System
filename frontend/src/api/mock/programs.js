let programsData = [
  {
    programCode: 'BSIT',
    programName: 'Bachelor of Science in Information Technology',
    department: 'Information Technology',
    status: 'ACTIVE',
  },
  {
    programCode: 'BSBA',
    programName: 'Bachelor of Science in Business Administration',
    department: 'Business Administration',
    status: 'ACTIVE',
  },
  {
    programCode: 'BSHM',
    programName: 'Bachelor of Science in Hospitality Management',
    department: 'Hospitality and Tourism Management',
    status: 'ACTIVE',
  },
  {
    programCode: 'BSTM',
    programName: 'Bachelor of Science in Tourism Management',
    department: 'Hospitality and Tourism Management',
    status: 'ACTIVE',
  },
  {
    programCode: 'BSED',
    programName: 'Bachelor of Secondary Education',
    department: 'Teacher Education',
    status: 'ACTIVE',
  },
  {
    programCode: 'BSCRIM',
    programName: 'Bachelor of Science in Criminology',
    department: 'Criminology',
    status: 'ACTIVE',
  },
  {
    programCode: 'GENED',
    programName: 'General Education Core & Minor Curricula',
    department: 'General Education',
    status: 'ACTIVE',
  },
];

export const mockPrograms = {
  async list(department) {
    if (department && department !== 'ALL' && department !== 'Academic Affairs') {
      return programsData.filter((p) => p.department === department);
    }
    return [...programsData];
  },

  async create(data) {
    if (!data.programCode || !data.programName) {
      throw new Error('Program code and program name are required');
    }
    const existing = programsData.find(
      p => p.programCode.toUpperCase() === data.programCode.toUpperCase()
    );
    if (existing) {
      throw new Error(`Program code ${data.programCode} already exists.`);
    }
    const item = {
      programCode: data.programCode.toUpperCase().trim(),
      programName: data.programName.trim(),
      department: data.department?.trim() || 'Information Technology',
      status: data.status || 'ACTIVE',
    };
    programsData.push(item);
    return item;
  },

  async update(programCode, data) {
    const index = programsData.findIndex(
      p => p.programCode.toUpperCase() === programCode.toUpperCase()
    );
    if (index === -1) {
      throw new Error(`Program ${programCode} not found.`);
    }
    programsData[index] = {
      ...programsData[index],
      ...data,
      programCode: programsData[index].programCode, // Immutable key
    };
    return programsData[index];
  },

  async remove(programCode) {
    const index = programsData.findIndex(
      p => p.programCode.toUpperCase() === programCode.toUpperCase()
    );
    if (index === -1) {
      throw new Error(`Program ${programCode} not found.`);
    }
    programsData.splice(index, 1);
    return true;
  },
};
