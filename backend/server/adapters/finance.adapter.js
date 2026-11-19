// =============================================================================
// FINANCE ADAPTER
// The only place that knows where faculty salary/payroll data comes from.
// Today it uses fallback mock computation. When the Finance group's API is ready,
// set FINANCE_API_URL in .env and this adapter will fetch live salary data.
// =============================================================================

const SALARY_BY_TYPE = {
  FULL_TIME: 45000,
  PART_TIME: 25000,
  OTHER: 25000,
};

async function getFacultySalary(facultyId, employmentType = "FULL_TIME") {
  const financeApiUrl = process.env.FINANCE_API_URL;
  const apiKey = process.env.FINANCE_API_KEY;

  // 1. If Finance Group's API URL is provided, call their live endpoint:
  if (financeApiUrl) {
    try {
      const response = await fetch(`${financeApiUrl}/salaries/${facultyId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(apiKey && { "x-api-key": apiKey }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          facultyId,
          employmentType,
          salary: data.salary || data.basePay || data.netSalary,
          currency: data.currency || "PHP",
          effectiveDate: data.effectiveDate || new Date().toISOString().split("T")[0],
          isLiveFromFinance: true,
        };
      }
      console.warn(`Finance API responded with status ${response.status}. Falling back to default calculation.`);
    } catch (err) {
      console.warn(`Could not reach Finance API (${err.message}). Using local fallback.`);
    }
  }

  // 2. Fallback computation if Finance system is offline or in development:
  return {
    facultyId,
    employmentType,
    salary: SALARY_BY_TYPE[employmentType] || 25000,
    currency: "PHP",
    effectiveDate: "2026-09-01",
    isLiveFromFinance: false,
  };
}

module.exports = { getFacultySalary };
