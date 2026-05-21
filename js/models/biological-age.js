/* ============================================================
   HEALTHPULSE BIOLOGICAL AGE ESTIMATOR
   Estimates biological age from chronological age plus
   biomarker deviations using published aging factor weights
   ============================================================ */

import { BIO_AGE_FACTORS } from '../utils/constants.js';
import { calcBMI } from './disease-engine.js';

/**
 * Calculate biological age from patient data.
 * Each biomarker deviation from optimal adds or subtracts years.
 * Based on validated aging biomarker panels (Levine 2018 phenotypic age model concept).
 *
 * @param {Object} patient - Full patient data object
 * @returns {Object} { biologicalAge, chronologicalAge, delta, factors }
 */
export function estimateBiologicalAge(patient) {
  const chronAge = patient.age;
  const bmi = calcBMI(patient.height, patient.weight);
  let ageModifier = 0;
  const factors = [];

  // BMI deviation
  const bmiDev = Math.abs(bmi - BIO_AGE_FACTORS.bmi.optimal);
  const bmiEffect = Math.min(bmiDev * BIO_AGE_FACTORS.bmi.perUnit, BIO_AGE_FACTORS.bmi.max);
  if (bmiEffect > 0.2) {
    const sign = bmi > BIO_AGE_FACTORS.bmi.optimal ? 1 : (bmi < 18 ? 0.7 : -0.3);
    const val = bmiEffect * sign;
    ageModifier += val;
    factors.push({ name: 'BMI', value: Math.round(bmi * 10) / 10, optimal: BIO_AGE_FACTORS.bmi.optimal, effect: Math.round(val * 10) / 10 });
  }

  // Systolic BP
  const bpDev = patient.systolicBP - BIO_AGE_FACTORS.systolicBP.optimal;
  if (bpDev > 0) {
    const val = Math.min(bpDev * BIO_AGE_FACTORS.systolicBP.perUnit, BIO_AGE_FACTORS.systolicBP.max);
    ageModifier += val;
    factors.push({ name: 'Blood Pressure', value: patient.systolicBP, optimal: BIO_AGE_FACTORS.systolicBP.optimal, effect: Math.round(val * 10) / 10 });
  } else if (bpDev < -10) {
    const val = Math.max(bpDev * 0.03, -1.5);
    ageModifier += val;
    factors.push({ name: 'Blood Pressure', value: patient.systolicBP, optimal: BIO_AGE_FACTORS.systolicBP.optimal, effect: Math.round(val * 10) / 10 });
  }

  // Glucose
  const glucDev = patient.glucose - BIO_AGE_FACTORS.glucose.optimal;
  if (glucDev > 0) {
    const val = Math.min(glucDev * BIO_AGE_FACTORS.glucose.perUnit, BIO_AGE_FACTORS.glucose.max);
    ageModifier += val;
    factors.push({ name: 'Fasting Glucose', value: patient.glucose, optimal: BIO_AGE_FACTORS.glucose.optimal, effect: Math.round(val * 10) / 10 });
  } else if (glucDev < -10) {
    const val = Math.max(glucDev * 0.02, -1);
    ageModifier += val;
    factors.push({ name: 'Fasting Glucose', value: patient.glucose, optimal: BIO_AGE_FACTORS.glucose.optimal, effect: Math.round(val * 10) / 10 });
  }

  // Total Cholesterol
  const cholDev = patient.totalCholesterol - BIO_AGE_FACTORS.totalCholesterol.optimal;
  if (Math.abs(cholDev) > 10) {
    const val = Math.sign(cholDev) * Math.min(Math.abs(cholDev) * BIO_AGE_FACTORS.totalCholesterol.perUnit, BIO_AGE_FACTORS.totalCholesterol.max);
    ageModifier += val;
    factors.push({ name: 'Total Cholesterol', value: patient.totalCholesterol, optimal: BIO_AGE_FACTORS.totalCholesterol.optimal, effect: Math.round(val * 10) / 10 });
  }

  // HDL (inverted: higher is better)
  const hdlDev = BIO_AGE_FACTORS.hdl.optimal - patient.hdl;
  if (hdlDev > 0) {
    const val = Math.min(hdlDev * Math.abs(BIO_AGE_FACTORS.hdl.perUnit), BIO_AGE_FACTORS.hdl.max);
    ageModifier += val;
    factors.push({ name: 'HDL Cholesterol', value: patient.hdl, optimal: BIO_AGE_FACTORS.hdl.optimal, effect: Math.round(val * 10) / 10 });
  } else {
    const val = Math.max(hdlDev * 0.04, -1.5);
    ageModifier += val;
    if (Math.abs(val) > 0.2) {
      factors.push({ name: 'HDL Cholesterol', value: patient.hdl, optimal: BIO_AGE_FACTORS.hdl.optimal, effect: Math.round(val * 10) / 10 });
    }
  }

  // Triglycerides
  const trigDev = patient.triglycerides - BIO_AGE_FACTORS.triglycerides.optimal;
  if (trigDev > 0) {
    const val = Math.min(trigDev * BIO_AGE_FACTORS.triglycerides.perUnit, BIO_AGE_FACTORS.triglycerides.max);
    ageModifier += val;
    factors.push({ name: 'Triglycerides', value: patient.triglycerides, optimal: BIO_AGE_FACTORS.triglycerides.optimal, effect: Math.round(val * 10) / 10 });
  }

  // Smoking
  const smokingEffect = BIO_AGE_FACTORS.smoking[patient.smokingStatus] || 0;
  if (smokingEffect !== 0) {
    ageModifier += smokingEffect;
    factors.push({ name: 'Smoking', value: patient.smokingStatus, optimal: 'never', effect: smokingEffect });
  }

  // Activity Level
  const actEffect = BIO_AGE_FACTORS.activityLevel[patient.activityLevel] || 0;
  ageModifier += actEffect;
  if (Math.abs(actEffect) > 0.3) {
    factors.push({ name: 'Physical Activity', value: patient.activityLevel, optimal: 'vigorous', effect: actEffect });
  }

  // Sleep
  const sleepDev = Math.abs(patient.sleepHours - BIO_AGE_FACTORS.sleepHours.optimal);
  if (sleepDev > 0.5) {
    const val = Math.min(sleepDev * BIO_AGE_FACTORS.sleepHours.perUnit, BIO_AGE_FACTORS.sleepHours.max);
    ageModifier += val;
    factors.push({ name: 'Sleep Duration', value: patient.sleepHours, optimal: BIO_AGE_FACTORS.sleepHours.optimal, effect: Math.round(val * 10) / 10 });
  }

  // Stress
  const stressEffect = BIO_AGE_FACTORS.stress[patient.stressLevel] || 0;
  if (stressEffect !== 0) {
    ageModifier += stressEffect;
    factors.push({ name: 'Stress Level', value: patient.stressLevel, optimal: 'low', effect: stressEffect });
  }

  // Alcohol
  const alcoholEffect = BIO_AGE_FACTORS.alcohol[patient.alcoholIntake] || 0;
  if (alcoholEffect !== 0) {
    ageModifier += alcoholEffect;
    factors.push({ name: 'Alcohol Intake', value: patient.alcoholIntake, optimal: 'none', effect: alcoholEffect });
  }

  // Creatinine
  const creatOptimal = patient.gender === 'female' ? BIO_AGE_FACTORS.creatinine.optimal_female : BIO_AGE_FACTORS.creatinine.optimal_male;
  const creatDev = patient.creatinine - creatOptimal;
  if (creatDev > 0.1) {
    const val = Math.min(creatDev * BIO_AGE_FACTORS.creatinine.perUnit, BIO_AGE_FACTORS.creatinine.max);
    ageModifier += val;
    factors.push({ name: 'Serum Creatinine', value: patient.creatinine, optimal: creatOptimal, effect: Math.round(val * 10) / 10 });
  }

  // Sort factors by absolute effect
  factors.sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect));

  const biologicalAge = Math.round(chronAge + ageModifier);
  const delta = biologicalAge - chronAge;

  return {
    biologicalAge: Math.max(18, Math.min(biologicalAge, 120)),
    chronologicalAge: chronAge,
    delta,
    ageModifier: Math.round(ageModifier * 10) / 10,
    factors,
    percentile: calculateHealthPercentile(delta)
  };
}

/**
 * Health percentile based on biological age delta.
 * Negative delta = better than average.
 */
function calculateHealthPercentile(delta) {
  // Using a normal distribution approximation
  // Mean delta = 0, SD = 5 years
  const z = -delta / 5;
  const percentile = 50 * (1 + erf(z / Math.sqrt(2)));
  return Math.round(Math.max(1, Math.min(99, percentile)));
}

// Error function approximation (Horner form)
function erf(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}
