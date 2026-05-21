/* ============================================================
   HEALTHPULSE MEDICAL CONSTANTS
   Clinical thresholds (WHO, AHA, ADA, KDIGO, ESC)
   Disease model coefficients, intervention definitions
   ============================================================ */

export const REFERENCE_RANGES = {
  glucose: { optimal: 90, normal: [70, 100], prediabetic: [100, 125], diabetic: 126, unit: 'mg/dL' },
  hba1c: { optimal: 5.0, normal: [4.0, 5.6], prediabetic: [5.7, 6.4], diabetic: 6.5, unit: '%' },
  systolicBP: { optimal: 115, normal: [90, 120], elevated: [120, 129], stage1: [130, 139], stage2: 140, crisis: 180, unit: 'mmHg' },
  diastolicBP: { optimal: 75, normal: [60, 80], stage1: [80, 89], stage2: 90, crisis: 120, unit: 'mmHg' },
  totalCholesterol: { optimal: 170, desirable: [0, 200], borderline: [200, 239], high: 240, unit: 'mg/dL' },
  hdl: { low_male: 40, low_female: 50, optimal: 60, unit: 'mg/dL' },
  ldl: { optimal: 100, near_optimal: [100, 129], borderline: [130, 159], high: [160, 189], very_high: 190, unit: 'mg/dL' },
  triglycerides: { normal: [0, 150], borderline: [150, 199], high: [200, 499], very_high: 500, unit: 'mg/dL' },
  bmi: { underweight: 18.5, normal: [18.5, 24.9], overweight: [25, 29.9], obese1: [30, 34.9], obese2: [35, 39.9], obese3: 40, unit: 'kg/m2' },
  creatinine: { normal_male: [0.7, 1.3], normal_female: [0.6, 1.1], unit: 'mg/dL' },
  heartRate: { bradycardia: 60, normal: [60, 100], tachycardia: 100, unit: 'bpm' },
  sleepHours: { min: 4, optimal: [7, 9], max: 12, unit: 'hours' },
  waistCirc: { risk_male: 102, risk_female: 88, unit: 'cm' }
};

// Framingham-derived coefficients for CVD risk
export const CVD_COEFFICIENTS = {
  male: {
    age: 0.04826, systolicBP_treated: 0.01935, systolicBP_untreated: 0.01764,
    totalCholesterol: 0.00163, hdl: -0.00541, smoking: 0.52120,
    diabetes: 0.48490, intercept: -3.58790
  },
  female: {
    age: 0.03380, systolicBP_treated: 0.02817, systolicBP_untreated: 0.02458,
    totalCholesterol: 0.00303, hdl: -0.00782, smoking: 0.39260,
    diabetes: 0.42530, intercept: -4.41210
  }
};

// UKPDS-inspired coefficients for Type 2 Diabetes risk
export const DIABETES_COEFFICIENTS = {
  glucose: 0.0350, hba1c: 0.4800, bmi: 0.0520, age: 0.0180,
  familyHistory: 0.5840, activityLevel: -0.2800, waistProxy: 0.0150,
  systolicBP: 0.0065, triglycerides: 0.0012, hdl: -0.0090,
  smoking: 0.1400, sleepDeviation: 0.0800, intercept: -6.3220
};

// CKD-EPI inspired coefficients for Chronic Kidney Disease
export const CKD_COEFFICIENTS = {
  egfr: -0.0380, age: 0.0250, systolicBP: 0.0140, diabetes: 0.6200,
  smoking: 0.2100, bmi: 0.0180, familyHistory: 0.3500,
  proteinuria: 0.8500, nsaidUse: 0.1800, intercept: -2.4500
};

// CHA2DS2-VASc inspired coefficients for Stroke
export const STROKE_COEFFICIENTS = {
  age65_74: 0.4200, age75plus: 0.8400, hypertension: 0.5800,
  diabetes: 0.4600, smoking: 0.5200, atrialFib: 0.9800,
  priorStroke: 1.2000, heartFailure: 0.3800, vascularDisease: 0.4400,
  gender_female: 0.2200, totalCholesterol: 0.0025, bmi: 0.0120,
  intercept: -4.2800
};

// Hypertension risk coefficients
export const HYPERTENSION_COEFFICIENTS = {
  systolicBP: 0.0480, diastolicBP: 0.0350, age: 0.0220,
  bmi: 0.0450, sodium: 0.1200, smoking: 0.2800,
  stress: 0.1500, familyHistory: 0.4200, activityLevel: -0.2200,
  alcohol: 0.0800, sleepDeviation: 0.0650, intercept: -7.8500
};

// Fatty Liver Index inspired coefficients for NAFLD
export const NAFLD_COEFFICIENTS = {
  bmi: 0.0680, triglycerides: 0.0058, waistProxy: 0.0220,
  glucose: 0.0120, insulinResistanceProxy: 0.1500, alcohol: 0.2200,
  age: 0.0080, gender_male: 0.2400, alt_proxy: 0.0350,
  intercept: -5.8200
};

// Biological age deviation factors (years added/subtracted per unit deviation)
export const BIO_AGE_FACTORS = {
  bmi: { optimal: 22.5, perUnit: 0.15, max: 5 },
  systolicBP: { optimal: 115, perUnit: 0.06, max: 6 },
  glucose: { optimal: 88, perUnit: 0.04, max: 5 },
  totalCholesterol: { optimal: 180, perUnit: 0.02, max: 4 },
  hdl: { optimal: 60, perUnit: -0.08, max: 3, inverted: true },
  triglycerides: { optimal: 100, perUnit: 0.01, max: 3 },
  smoking: { active: 4.5, former: 1.5, never: 0 },
  activityLevel: { sedentary: 3.0, light: 1.0, moderate: -1.5, vigorous: -2.5 },
  sleepHours: { optimal: 7.5, perUnit: 0.6, max: 3 },
  stress: { low: -0.5, moderate: 0.5, high: 2.0, severe: 3.5 },
  alcohol: { none: 0, light: -0.3, moderate: 0.5, heavy: 3.0 },
  creatinine: { optimal_male: 1.0, optimal_female: 0.8, perUnit: 2.0, max: 4 }
};

// Standard intervention library
export const INTERVENTIONS = [
  { id: 'weight_loss_5', name: 'Lose 5 kg body weight', category: 'Lifestyle',
    difficulty: 'Moderate', timeframe: '3-6 months',
    effects: { bmi: -1.7, systolicBP: -5, diastolicBP: -3, glucose: -8, triglycerides: -15, hdl: 2 }},
  { id: 'weight_loss_10', name: 'Lose 10 kg body weight', category: 'Lifestyle',
    difficulty: 'Hard', timeframe: '6-12 months',
    effects: { bmi: -3.4, systolicBP: -10, diastolicBP: -6, glucose: -18, triglycerides: -30, hdl: 4, hba1c: -0.5 }},
  { id: 'exercise_moderate', name: 'Exercise 30 min/day (moderate)', category: 'Lifestyle',
    difficulty: 'Moderate', timeframe: 'Ongoing',
    effects: { activityLevel: 'moderate', systolicBP: -5, diastolicBP: -3, glucose: -10, hdl: 3, triglycerides: -12, bmi: -0.5 }},
  { id: 'exercise_vigorous', name: 'Exercise 45 min/day (vigorous)', category: 'Lifestyle',
    difficulty: 'Hard', timeframe: 'Ongoing',
    effects: { activityLevel: 'vigorous', systolicBP: -8, diastolicBP: -5, glucose: -15, hdl: 5, triglycerides: -20, bmi: -1.0 }},
  { id: 'smoking_cessation', name: 'Complete smoking cessation', category: 'Lifestyle',
    difficulty: 'Very Hard', timeframe: '3-6 months',
    effects: { smokingStatus: 'never', systolicBP: -4, hdl: 4 }},
  { id: 'diet_dash', name: 'Adopt DASH diet plan', category: 'Nutrition',
    difficulty: 'Moderate', timeframe: 'Ongoing',
    effects: { systolicBP: -11, diastolicBP: -6, totalCholesterol: -15, ldl: -10, sodium: -1.5, glucose: -5 }},
  { id: 'reduce_sodium', name: 'Reduce sodium to <2g/day', category: 'Nutrition',
    difficulty: 'Easy', timeframe: '1-2 months',
    effects: { sodium: -2.0, systolicBP: -6, diastolicBP: -3 }},
  { id: 'improve_sleep', name: 'Improve sleep to 7-8 hours', category: 'Lifestyle',
    difficulty: 'Easy', timeframe: '1-3 months',
    effects: { sleepHours: 7.5, glucose: -5, systolicBP: -3, stress: -0.5 }},
  { id: 'reduce_alcohol', name: 'Limit alcohol to light intake', category: 'Lifestyle',
    difficulty: 'Moderate', timeframe: '1-2 months',
    effects: { alcohol: 'light', triglycerides: -20, systolicBP: -4, glucose: -3 }},
  { id: 'statin_therapy', name: 'Initiate statin therapy', category: 'Medication',
    difficulty: 'Easy', timeframe: '2-4 weeks onset',
    effects: { ldl: -50, totalCholesterol: -35, triglycerides: -10 }},
  { id: 'bp_medication', name: 'Antihypertensive medication', category: 'Medication',
    difficulty: 'Easy', timeframe: '2-4 weeks onset',
    effects: { systolicBP: -20, diastolicBP: -12 }},
  { id: 'metformin', name: 'Metformin therapy (if diabetic)', category: 'Medication',
    difficulty: 'Easy', timeframe: '2-4 weeks onset',
    effects: { glucose: -30, hba1c: -1.0, bmi: -0.5 }},
  { id: 'stress_management', name: 'Stress reduction program', category: 'Lifestyle',
    difficulty: 'Moderate', timeframe: '2-3 months',
    effects: { stress: -1.0, systolicBP: -5, diastolicBP: -3, sleepHours: 0.5, glucose: -3 }},
  { id: 'mediterranean_diet', name: 'Adopt Mediterranean diet', category: 'Nutrition',
    difficulty: 'Moderate', timeframe: 'Ongoing',
    effects: { totalCholesterol: -10, ldl: -8, hdl: 3, triglycerides: -15, glucose: -7, bmi: -0.3 }}
];

// Risk level thresholds
export const RISK_LEVELS = {
  low: { min: 0, max: 20, label: 'Low', color: '#10b981', badgeClass: 'badge-low' },
  moderate: { min: 20, max: 45, label: 'Moderate', color: '#f59e0b', badgeClass: 'badge-moderate' },
  high: { min: 45, max: 70, label: 'High', color: '#f97316', badgeClass: 'badge-high' },
  critical: { min: 70, max: 100, label: 'Critical', color: '#ef4444', badgeClass: 'badge-critical' }
};

export function getRiskLevel(score) {
  if (score < RISK_LEVELS.low.max) return RISK_LEVELS.low;
  if (score < RISK_LEVELS.moderate.max) return RISK_LEVELS.moderate;
  if (score < RISK_LEVELS.high.max) return RISK_LEVELS.high;
  return RISK_LEVELS.critical;
}

// Disease metadata
export const DISEASES = {
  diabetes: { id: 'diabetes', name: 'Type 2 Diabetes', organ: 'pancreas', icon: 'pancreas', color: '#f59e0b' },
  cvd: { id: 'cvd', name: 'Cardiovascular Disease', organ: 'heart', icon: 'heart', color: '#ef4444' },
  ckd: { id: 'ckd', name: 'Chronic Kidney Disease', organ: 'kidneys', icon: 'kidney', color: '#8b5cf6' },
  stroke: { id: 'stroke', name: 'Stroke', organ: 'brain', icon: 'brain', color: '#3b82f6' },
  hypertension: { id: 'hypertension', name: 'Hypertension', organ: 'vessels', icon: 'vessel', color: '#f97316' },
  nafld: { id: 'nafld', name: 'Fatty Liver Disease', organ: 'liver', icon: 'liver', color: '#06b6d4' }
};

// Default patient data template
export const DEFAULT_PATIENT = {
  age: 45, gender: 'male', height: 170, weight: 78,
  systolicBP: 128, diastolicBP: 82, heartRate: 74,
  glucose: 105, hba1c: 5.8, totalCholesterol: 210,
  hdl: 48, ldl: 135, triglycerides: 160, creatinine: 1.0,
  activityLevel: 'light', sleepHours: 6.5, smokingStatus: 'never',
  alcoholIntake: 'light', stressLevel: 'moderate', sodiumIntake: 3.5,
  familyHistoryDiabetes: false, familyHistoryHeart: false,
  familyHistoryStroke: false, familyHistoryHypertension: false,
  atrialFibrillation: false
};

// Quick-fill presets
export const PATIENT_PRESETS = {
  healthy30: {
    label: 'Healthy 30-year-old', age: 30, gender: 'female', height: 165, weight: 58,
    systolicBP: 112, diastolicBP: 72, heartRate: 68, glucose: 85, hba1c: 4.9,
    totalCholesterol: 175, hdl: 62, ldl: 95, triglycerides: 90, creatinine: 0.8,
    activityLevel: 'moderate', sleepHours: 7.5, smokingStatus: 'never',
    alcoholIntake: 'none', stressLevel: 'low', sodiumIntake: 2.2,
    familyHistoryDiabetes: false, familyHistoryHeart: false,
    familyHistoryStroke: false, familyHistoryHypertension: false, atrialFibrillation: false
  },
  atRisk50: {
    label: 'At-risk 50-year-old', age: 50, gender: 'male', height: 175, weight: 92,
    systolicBP: 142, diastolicBP: 90, heartRate: 78, glucose: 118, hba1c: 6.1,
    totalCholesterol: 235, hdl: 38, ldl: 155, triglycerides: 210, creatinine: 1.2,
    activityLevel: 'sedentary', sleepHours: 5.5, smokingStatus: 'active',
    alcoholIntake: 'moderate', stressLevel: 'high', sodiumIntake: 4.5,
    familyHistoryDiabetes: true, familyHistoryHeart: true,
    familyHistoryStroke: false, familyHistoryHypertension: true, atrialFibrillation: false
  },
  critical65: {
    label: 'Critical case 65-year-old', age: 65, gender: 'male', height: 172, weight: 105,
    systolicBP: 168, diastolicBP: 98, heartRate: 88, glucose: 185, hba1c: 7.8,
    totalCholesterol: 275, hdl: 32, ldl: 185, triglycerides: 290, creatinine: 1.6,
    activityLevel: 'sedentary', sleepHours: 5, smokingStatus: 'active',
    alcoholIntake: 'heavy', stressLevel: 'severe', sodiumIntake: 5.5,
    familyHistoryDiabetes: true, familyHistoryHeart: true,
    familyHistoryStroke: true, familyHistoryHypertension: true, atrialFibrillation: true
  }
};

// Alert rule definitions
export const ALERT_RULES = [
  { condition: (p, r) => r.diabetes > 80, severity: 'critical', title: 'Critical Diabetes Risk',
    message: 'Type 2 Diabetes risk exceeds 80%. Immediate glucose management and endocrinology consultation recommended.',
    action: 'Order HbA1c, fasting insulin, and oral glucose tolerance test.' },
  { condition: (p, r) => r.cvd > 80, severity: 'critical', title: 'Critical Cardiovascular Risk',
    message: 'Cardiovascular disease risk exceeds 80%. Urgent cardiology evaluation required.',
    action: 'Order lipid panel, ECG, echocardiogram, and cardiac stress test.' },
  { condition: (p, r) => r.ckd > 70, severity: 'critical', title: 'Significant Kidney Disease Risk',
    message: 'Chronic kidney disease risk is critically elevated. Nephrology referral recommended.',
    action: 'Order comprehensive metabolic panel, urinalysis with microalbumin, and renal ultrasound.' },
  { condition: (p, r) => r.stroke > 75, severity: 'critical', title: 'High Stroke Risk',
    message: 'Stroke risk is critically elevated. Neurological assessment and vascular imaging recommended.',
    action: 'Order carotid duplex ultrasound and consider anticoagulation assessment.' },
  { condition: (p) => p.systolicBP >= 180 || p.diastolicBP >= 120, severity: 'critical',
    title: 'Hypertensive Crisis', message: 'Blood pressure readings indicate hypertensive crisis. Immediate medical attention required.',
    action: 'Immediate referral to emergency department for blood pressure management.' },
  { condition: (p) => p.glucose >= 250, severity: 'critical', title: 'Severely Elevated Glucose',
    message: 'Fasting glucose exceeds 250 mg/dL. Risk of diabetic ketoacidosis or hyperosmolar state.',
    action: 'Immediate endocrinology consultation. Check ketones and electrolytes.' },
  { condition: (p, r) => r.diabetes >= 45 && r.diabetes < 80, severity: 'warning', title: 'Elevated Diabetes Risk',
    message: 'Moderate to high Type 2 Diabetes risk detected. Lifestyle modification and monitoring recommended.',
    action: 'Schedule HbA1c test. Begin dietary counseling and exercise program.' },
  { condition: (p, r) => r.cvd >= 45 && r.cvd < 80, severity: 'warning', title: 'Elevated Cardiovascular Risk',
    message: 'Moderate to high cardiovascular risk. Risk factor modification and monitoring recommended.',
    action: 'Optimize lipid management. Consider statin therapy if LDL > 130 mg/dL.' },
  { condition: (p, r) => r.hypertension >= 50 && r.hypertension < 80, severity: 'warning', title: 'Elevated Hypertension Risk',
    message: 'Significant hypertension risk. Blood pressure management and dietary changes recommended.',
    action: 'Initiate DASH diet. Reduce sodium intake. Monitor BP twice daily for 2 weeks.' },
  { condition: (p, r) => r.nafld >= 50, severity: 'warning', title: 'Elevated Fatty Liver Risk',
    message: 'Significant risk of non-alcoholic fatty liver disease. Hepatic evaluation recommended.',
    action: 'Order liver function tests (ALT, AST, GGT). Consider hepatic ultrasound.' },
  { condition: (p) => p.smokingStatus === 'active', severity: 'warning', title: 'Active Smoking Status',
    message: 'Active smoking significantly increases risk across all cardiovascular and metabolic conditions.',
    action: 'Recommend smoking cessation program. Consider nicotine replacement therapy.' },
  { condition: (p, r) => r.ckd >= 30 && r.ckd < 70, severity: 'monitor', title: 'Kidney Function Monitoring',
    message: 'Moderate kidney disease risk detected. Periodic monitoring recommended.',
    action: 'Monitor serum creatinine and eGFR every 3-6 months.' },
  { condition: (p, r) => r.stroke >= 30 && r.stroke < 75, severity: 'monitor', title: 'Stroke Risk Monitoring',
    message: 'Moderate stroke risk. Risk factor management and periodic assessment recommended.',
    action: 'Control hypertension and diabetes. Annual carotid screening if over 55.' },
  { condition: (p) => p.sleepHours < 6, severity: 'monitor', title: 'Insufficient Sleep',
    message: 'Sleep duration below 6 hours is associated with increased metabolic and cardiovascular risk.',
    action: 'Sleep hygiene counseling. Consider sleep study if insomnia persists.' },
  { condition: (p) => p.bmi >= 30, severity: 'warning', title: 'Obesity Classification',
    message: 'BMI indicates obesity. Weight management is a priority intervention across all risk domains.',
    action: 'Refer to nutritionist. Set target of 5-10% weight loss over 6 months.' }
];

// Suggested follow-up tests based on risk
export const FOLLOW_UP_TESTS = {
  diabetes: ['HbA1c (glycated hemoglobin)', 'Fasting plasma glucose', 'Oral glucose tolerance test (OGTT)',
    'Fasting insulin level', 'C-peptide assay', 'Lipid panel'],
  cvd: ['Complete lipid panel', 'High-sensitivity C-reactive protein (hs-CRP)', 'Electrocardiogram (ECG/EKG)',
    'Echocardiogram', 'Cardiac stress test', 'Coronary calcium score (CT)'],
  ckd: ['Serum creatinine with eGFR', 'Urinalysis with microalbumin', 'Urine albumin-to-creatinine ratio (UACR)',
    'Comprehensive metabolic panel', 'Renal ultrasound', 'Cystatin C'],
  stroke: ['Carotid duplex ultrasound', 'Transcranial Doppler', 'Brain MRI/MRA',
    'ECG for atrial fibrillation', 'Coagulation profile', 'Homocysteine level'],
  hypertension: ['24-hour ambulatory blood pressure monitoring', 'Basic metabolic panel',
    'Urinalysis', 'Echocardiogram', 'Renal artery duplex scan', 'Aldosterone/renin ratio'],
  nafld: ['Liver function tests (ALT, AST, GGT)', 'Hepatic ultrasound', 'FibroScan (transient elastography)',
    'Fasting insulin', 'Hemoglobin A1c', 'Lipid panel with triglycerides']
};
