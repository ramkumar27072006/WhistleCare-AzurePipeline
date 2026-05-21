/* ============================================================
   HEALTHPULSE INTERVENTION ENGINE
   What-If simulation and intervention ranking
   ============================================================ */

import { predictAllDiseases, calcHealthScore, calcBMI } from './disease-engine.js';
import { estimateBiologicalAge } from './biological-age.js';
import { INTERVENTIONS } from '../utils/constants.js';

/**
 * Simulate a what-if scenario by applying modifications to patient data.
 * @param {Object} patient - Original patient data
 * @param {Object} modifications - Key-value pairs of modified fields
 * @returns {Object} { original, simulated, deltas, originalBioAge, simulatedBioAge }
 */
export function simulateWhatIf(patient, modifications) {
  const simulatedPatient = { ...patient };

  for (const [key, value] of Object.entries(modifications)) {
    if (key === 'bmi') {
      // Convert BMI change to weight change
      const h = patient.height / 100;
      simulatedPatient.weight = Math.round(value * h * h * 10) / 10;
    } else if (typeof value === 'number' && typeof simulatedPatient[key] === 'number') {
      simulatedPatient[key] = value;
    } else {
      simulatedPatient[key] = value;
    }
  }

  const originalRisks = predictAllDiseases(patient);
  const simulatedRisks = predictAllDiseases(simulatedPatient);
  const originalBioAge = estimateBiologicalAge(patient);
  const simulatedBioAge = estimateBiologicalAge(simulatedPatient);

  const deltas = {};
  for (const key of Object.keys(originalRisks)) {
    deltas[key] = Math.round((simulatedRisks[key] - originalRisks[key]) * 10) / 10;
  }

  return {
    original: { risks: originalRisks, healthScore: calcHealthScore(originalRisks), bioAge: originalBioAge },
    simulated: { risks: simulatedRisks, healthScore: calcHealthScore(simulatedRisks), bioAge: simulatedBioAge },
    deltas,
    totalReduction: Math.round(Object.values(deltas).reduce((s, d) => s + d, 0) * 10) / 10,
    simulatedPatient
  };
}

/**
 * Apply an intervention's effects to patient data.
 * @param {Object} patient - Original patient data
 * @param {Object} intervention - Intervention definition from constants
 * @returns {Object} Modified patient data
 */
function applyIntervention(patient, intervention) {
  const modified = { ...patient };
  const bmi = calcBMI(patient.height, patient.weight);

  for (const [key, value] of Object.entries(intervention.effects)) {
    if (key === 'bmi') {
      const newBMI = Math.max(18.5, bmi + value);
      const h = patient.height / 100;
      modified.weight = Math.round(newBMI * h * h * 10) / 10;
    } else if (key === 'activityLevel' || key === 'smokingStatus' || key === 'alcohol' || key === 'stress') {
      // Categorical reassignment
      const mappedKey = key === 'alcohol' ? 'alcoholIntake' : key === 'stress' ? 'stressLevel' : key;
      modified[mappedKey] = value;
    } else if (key === 'sleepHours') {
      modified.sleepHours = value;
    } else if (key === 'sodium') {
      modified.sodiumIntake = Math.max(1.0, patient.sodiumIntake + value);
    } else if (typeof modified[key] === 'number') {
      // Additive effect (value is delta)
      modified[key] = Math.max(0, modified[key] + value);
    }
  }

  return modified;
}

/**
 * Rank all interventions by their aggregate risk reduction.
 * @param {Object} patient - Original patient data
 * @returns {Array} Sorted array of intervention results
 */
export function rankInterventions(patient) {
  const originalRisks = predictAllDiseases(patient);
  const results = [];

  for (const intervention of INTERVENTIONS) {
    // Check if intervention is applicable
    if (intervention.id === 'smoking_cessation' && patient.smokingStatus === 'never') continue;
    if (intervention.id === 'metformin' && patient.glucose < 126 && patient.hba1c < 6.5) continue;
    if (intervention.id === 'reduce_alcohol' && patient.alcoholIntake === 'none') continue;
    if (intervention.id === 'bp_medication' && patient.systolicBP < 130) continue;

    const modifiedPatient = applyIntervention(patient, intervention);
    const newRisks = predictAllDiseases(modifiedPatient);

    const diseaseDeltas = {};
    let totalReduction = 0;
    for (const key of Object.keys(originalRisks)) {
      const delta = Math.round((newRisks[key] - originalRisks[key]) * 10) / 10;
      diseaseDeltas[key] = delta;
      totalReduction += delta;
    }

    totalReduction = Math.round(totalReduction * 10) / 10;

    results.push({
      ...intervention,
      diseaseDeltas,
      totalReduction,
      avgReduction: Math.round((totalReduction / Object.keys(originalRisks).length) * 10) / 10,
      newRisks,
      originalRisks
    });
  }

  // Sort by total reduction (most negative = best)
  results.sort((a, b) => a.totalReduction - b.totalReduction);

  // Add rank
  results.forEach((r, i) => { r.rank = i + 1; });

  return results;
}

/**
 * Find the best combination scenario: apply top N non-conflicting interventions.
 * @param {Object} patient - Original patient data
 * @param {number} maxInterventions - Maximum number of interventions to combine
 * @returns {Object} Combined what-if result
 */
export function findBestScenario(patient, maxInterventions = 5) {
  const ranked = rankInterventions(patient);
  const selected = [];
  const appliedCategories = new Set();
  let currentPatient = { ...patient };

  for (const intervention of ranked) {
    if (selected.length >= maxInterventions) break;

    // Avoid stacking similar interventions
    const catKey = `${intervention.category}_${intervention.id.split('_')[0]}`;
    if (appliedCategories.has(catKey)) continue;

    currentPatient = applyIntervention(currentPatient, intervention);
    selected.push(intervention);
    appliedCategories.add(catKey);
  }

  return simulateWhatIf(patient, currentPatient);
}

/**
 * Preset scenarios for quick simulation.
 */
export const PRESET_SCENARIOS = {
  conservative: {
    label: 'Conservative Lifestyle Changes',
    description: 'Moderate diet improvement, 30 min daily walking, improved sleep',
    getModifications: (patient) => {
      const bmi = calcBMI(patient.height, patient.weight);
      return {
        activityLevel: 'moderate',
        sleepHours: 7.5,
        sodiumIntake: Math.max(2.0, patient.sodiumIntake - 1.0),
        glucose: Math.max(70, patient.glucose - 8),
        systolicBP: Math.max(100, patient.systolicBP - 5),
        diastolicBP: Math.max(60, patient.diastolicBP - 3),
        weight: Math.max(50, patient.weight - 3),
        stressLevel: patient.stressLevel === 'severe' ? 'high' : patient.stressLevel === 'high' ? 'moderate' : patient.stressLevel
      };
    }
  },
  aggressive: {
    label: 'Aggressive Lifestyle Overhaul',
    description: 'Intensive exercise, strict diet, weight loss, smoking cessation',
    getModifications: (patient) => ({
      activityLevel: 'vigorous',
      sleepHours: 8,
      sodiumIntake: 2.0,
      smokingStatus: 'never',
      alcoholIntake: 'none',
      stressLevel: 'low',
      glucose: Math.max(70, patient.glucose - 25),
      systolicBP: Math.max(100, patient.systolicBP - 15),
      diastolicBP: Math.max(60, patient.diastolicBP - 8),
      totalCholesterol: Math.max(150, patient.totalCholesterol - 20),
      ldl: Math.max(70, patient.ldl - 15),
      hdl: Math.min(80, patient.hdl + 5),
      triglycerides: Math.max(60, patient.triglycerides - 30),
      weight: Math.max(50, patient.weight - 10)
    })
  },
  medication: {
    label: 'Medication-Assisted',
    description: 'Standard pharmacological interventions with mild lifestyle changes',
    getModifications: (patient) => ({
      activityLevel: patient.activityLevel === 'sedentary' ? 'light' : patient.activityLevel,
      systolicBP: Math.max(100, patient.systolicBP - 20),
      diastolicBP: Math.max(60, patient.diastolicBP - 12),
      totalCholesterol: Math.max(140, patient.totalCholesterol - 35),
      ldl: Math.max(60, patient.ldl - 50),
      triglycerides: Math.max(60, patient.triglycerides - 10),
      glucose: patient.glucose >= 126 ? Math.max(80, patient.glucose - 30) : patient.glucose,
      hba1c: patient.hba1c >= 6.5 ? Math.max(5.0, patient.hba1c - 1.0) : patient.hba1c
    })
  }
};
