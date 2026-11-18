let programsData = [
  {
    programCode: 'BSIT',
    programName: 'Bachelor of Science in Information Technology',
    department: 'Information Technology',
    status: 'ACTIVE',
  },
  {
    programCode: 'BSCS',
    programName: 'Bachelor of Science in Computer Science',
    department: 'Computer Science',
    status: 'ACTIVE',
  },
  {
    programCode: 'BLIS',
    programName: 'Bachelor of Library and Information Science',
    department: 'Information Studies',
    status: 'ACTIVE',
  },
  {
    programCode: 'ACT',
    programName: 'Associate in Computer Technology',
    department: 'Information Technology',
    status: 'ACTIVE',
  },
];

export const mockPrograms = {
  async list() {
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
