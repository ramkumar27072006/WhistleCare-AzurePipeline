/* ============================================================
   HEALTHPULSE SHAP ENGINE
   Approximate Shapley value computation for model interpretability
   Uses marginal contribution analysis on the disease models
   ============================================================ */

import { predictAllDiseases, calcBMI } from './disease-engine.js';
import { DEFAULT_PATIENT, DISEASES } from '../utils/constants.js';

// Feature definitions with display names and baseline references
const FEATURE_DEFS = [
  { key: 'glucose', label: 'Fasting Glucose', unit: 'mg/dL', baseline: 90 },
  { key: 'hba1c', label: 'HbA1c', unit: '%', baseline: 5.0 },
  { key: 'systolicBP', label: 'Systolic Blood Pressure', unit: 'mmHg', baseline: 115 },
  { key: 'diastolicBP', label: 'Diastolic Blood Pressure', unit: 'mmHg', baseline: 75 },
  { key: 'totalCholesterol', label: 'Total Cholesterol', unit: 'mg/dL', baseline: 180 },
  { key: 'hdl', label: 'HDL Cholesterol', unit: 'mg/dL', baseline: 55 },
  { key: 'ldl', label: 'LDL Cholesterol', unit: 'mg/dL', baseline: 100 },
  { key: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', baseline: 100 },
  { key: '_bmi', label: 'Body Mass Index', unit: 'kg/m2', baseline: 22.5 },
  { key: 'age', label: 'Age', unit: 'years', baseline: 35 },
  { key: 'smokingStatus', label: 'Smoking Status', unit: '', baseline: 'never', isCategorical: true },
  { key: 'activityLevel', label: 'Physical Activity', unit: '', baseline: 'moderate', isCategorical: true },
  { key: 'sleepHours', label: 'Sleep Duration', unit: 'hours', baseline: 7.5 },
  { key: 'stressLevel', label: 'Stress Level', unit: '', baseline: 'low', isCategorical: true },
  { key: 'alcoholIntake', label: 'Alcohol Intake', unit: '', baseline: 'none', isCategorical: true },
  { key: 'sodiumIntake', label: 'Sodium Intake', unit: 'g/day', baseline: 2.3 },
  { key: 'creatinine', label: 'Serum Creatinine', unit: 'mg/dL', baseline: 0.9 },
  { key: 'familyHistoryDiabetes', label: 'Family Hx: Diabetes', unit: '', baseline: false, isBool: true },
  { key: 'familyHistoryHeart', label: 'Family Hx: Heart Disease', unit: '', baseline: false, isBool: true },
  { key: 'familyHistoryStroke', label: 'Family Hx: Stroke', unit: '', baseline: false, isBool: true },
  { key: 'familyHistoryHypertension', label: 'Family Hx: Hypertension', unit: '', baseline: false, isBool: true },
  { key: 'atrialFibrillation', label: 'Atrial Fibrillation', unit: '', baseline: false, isBool: true }
];

// Build a baseline patient with optimal values
function buildBaselinePatient() {
  return {
    age: 35, gender: 'male', height: 170, weight: 65,
    systolicBP: 115, diastolicBP: 75, heartRate: 70,
    glucose: 90, hba1c: 5.0, totalCholesterol: 180,
    hdl: 55, ldl: 100, triglycerides: 100, creatinine: 0.9,
    activityLevel: 'moderate', sleepHours: 7.5, smokingStatus: 'never',
    alcoholIntake: 'none', stressLevel: 'low', sodiumIntake: 2.3,
    familyHistoryDiabetes: false, familyHistoryHeart: false,
    familyHistoryStroke: false, familyHistoryHypertension: false,
    atrialFibrillation: false
  };
}

/**
 * Compute SHAP-like values for a specific disease prediction.
 * Uses the leave-one-out marginal contribution method:
 * For each feature, we compare the prediction with the patient's value
 * versus the prediction with the baseline (optimal) value, holding all else constant.
 *
 * @param {Object} patient - Patient data object
 * @param {string} diseaseId - Disease key (e.g., 'diabetes', 'cvd')
 * @returns {Array} Sorted array of feature attributions
 */
export function computeSHAP(patient, diseaseId) {
  const baseline = buildBaselinePatient();
  baseline.gender = patient.gender;
  baseline.height = patient.height;

  // Full prediction with patient values
  const fullPrediction = predictAllDiseases(patient)[diseaseId];

  // Baseline prediction (all optimal)
  const baselinePrediction = predictAllDiseases(baseline)[diseaseId];

  const attributions = [];

  for (const feat of FEATURE_DEFS) {
    if (feat.key === '_bmi') {
      // BMI is derived, test by swapping weight
      const baselineWeight = baseline.weight;
      const testPatient = { ...patient, weight: baselineWeight };
      const withBaseline = predictAllDiseases(testPatient)[diseaseId];
      const shapValue = fullPrediction - withBaseline;

      if (Math.abs(shapValue) > 0.05) {
        const currentBMI = calcBMI(patient.height, patient.weight);
        attributions.push({
          feature: feat.label,
          key: feat.key,
          value: Math.round(currentBMI * 10) / 10,
          baseline: feat.baseline,
          unit: feat.unit,
          shapValue: Math.round(shapValue * 100) / 100,
          direction: shapValue > 0 ? 'risk' : 'protective',
          percentage: 0
        });
      }
      continue;
    }

    const patientVal = patient[feat.key];
    const baselineVal = feat.baseline;

    // Skip if same as baseline
    if (patientVal === baselineVal) continue;

    // Create test patient with this feature set to baseline
    const testPatient = { ...patient, [feat.key]: baselineVal };
    const withBaseline = predictAllDiseases(testPatient)[diseaseId];
    const shapValue = fullPrediction - withBaseline;

    if (Math.abs(shapValue) > 0.05) {
      attributions.push({
        feature: feat.label,
        key: feat.key,
        value: feat.isBool ? (patientVal ? 'Yes' : 'No') : patientVal,
        baseline: feat.isBool ? 'No' : baselineVal,
        unit: feat.unit,
        shapValue: Math.round(shapValue * 100) / 100,
        direction: shapValue > 0 ? 'risk' : 'protective',
        percentage: 0
      });
    }
  }

  // Calculate percentage contributions
  const totalAbsolute = attributions.reduce((sum, a) => sum + Math.abs(a.shapValue), 0);
  if (totalAbsolute > 0) {
    for (const attr of attributions) {
      attr.percentage = Math.round((Math.abs(attr.shapValue) / totalAbsolute) * 1000) / 10;
    }
  }

  // Sort by absolute SHAP value descending
  attributions.sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));

  return attributions;
}

/**
 * Compute SHAP for all diseases at once.
 * @param {Object} patient
 * @returns {Object} Map of diseaseId -> attributions array
 */
export function computeAllSHAP(patient) {
  const result = {};
  for (const diseaseId of Object.keys(DISEASES)) {
    result[diseaseId] = computeSHAP(patient, diseaseId);
  }
  return result;
}

/**
 * Generate natural language explanation for top contributors.
 * @param {Array} attributions - SHAP attributions array
 * @param {string} diseaseName - Display name of the disease
 * @param {number} riskScore - The risk score percentage
 * @returns {string} Human-readable explanation
 */
export function generateExplanation(attributions, diseaseName, riskScore) {
  if (attributions.length === 0) {
    return `The ${diseaseName} risk of ${riskScore}% is near baseline with no significant contributing factors identified.`;
  }

  const top3Risk = attributions.filter(a => a.direction === 'risk').slice(0, 3);
  const top2Protect = attributions.filter(a => a.direction === 'protective').slice(0, 2);

  let explanation = `The ${diseaseName} risk of ${riskScore}% is primarily driven by `;

  if (top3Risk.length > 0) {
    const parts = top3Risk.map(a => {
      const valStr = typeof a.value === 'boolean' || typeof a.value === 'string'
        ? String(a.value) : `${a.value} ${a.unit}`.trim();
      return `${a.feature} (${valStr}, contributing +${a.percentage}%)`;
    });
    explanation += parts.join(', ');
  } else {
    explanation += 'no major risk factors';
  }

  if (top2Protect.length > 0) {
    explanation += '. Protective factors include ';
    const parts = top2Protect.map(a => `${a.feature} (reducing risk by ${a.percentage}%)`);
    explanation += parts.join(' and ');
  }

  explanation += '.';
  return explanation;
}
