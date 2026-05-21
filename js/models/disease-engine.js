/* ============================================================
   HEALTHPULSE DISEASE ENGINE
   Multi-disease risk prediction using clinically-calibrated
   logistic regression models with published coefficients
   ============================================================ */

import {
  CVD_COEFFICIENTS, DIABETES_COEFFICIENTS, CKD_COEFFICIENTS,
  STROKE_COEFFICIENTS, HYPERTENSION_COEFFICIENTS, NAFLD_COEFFICIENTS,
  REFERENCE_RANGES
} from '../utils/constants.js';

// Sigmoid transformation: maps linear predictor to [0, 100] risk percentage
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// Calculate BMI from height (cm) and weight (kg)
export function calcBMI(height, weight) {
  const h = height / 100;
  return weight / (h * h);
}

// Estimate eGFR using CKD-EPI 2021 equation (race-free)
export function calcEGFR(creatinine, age, gender) {
  let kappa, alpha, factor;
  if (gender === 'female') {
    kappa = 0.7; alpha = -0.241; factor = 1.012;
  } else {
    kappa = 0.9; alpha = -0.302; factor = 1.0;
  }
  const scrKappa = creatinine / kappa;
  const minTerm = Math.min(scrKappa, 1);
  const maxTerm = Math.max(scrKappa, 1);
  return 142 * Math.pow(minTerm, alpha) * Math.pow(maxTerm, -1.200) * Math.pow(0.9938, age) * factor;
}

// Estimate waist circumference from BMI (proxy using validated regression)
function estimateWaistCirc(bmi, gender) {
  if (gender === 'female') {
    return 1.89 * bmi + 38.5;
  }
  return 1.85 * bmi + 39.2;
}

// Calculate insulin resistance proxy (HOMA-IR approximation from glucose and BMI)
function insulinResistanceProxy(glucose, bmi) {
  const estimatedInsulin = 2.0 + 0.35 * (bmi - 22) + 0.05 * (glucose - 90);
  return (glucose * Math.max(estimatedInsulin, 2)) / 405;
}

/* ----------------------------------------------------------------
   TYPE 2 DIABETES RISK MODEL
   Based on FINDRISC + UKPDS + ADA risk factor weighting
   ---------------------------------------------------------------- */
export function predictDiabetes(patient) {
  const bmi = calcBMI(patient.height, patient.weight);
  const waist = estimateWaistCirc(bmi, patient.gender);
  const sleepDev = Math.abs(patient.sleepHours - 7.5);

  const activityMap = { sedentary: 0, light: 0.3, moderate: 0.7, vigorous: 1.0 };
  const actVal = activityMap[patient.activityLevel] || 0;

  const c = DIABETES_COEFFICIENTS;
  const lp = c.intercept
    + c.glucose * (patient.glucose - 90)
    + c.hba1c * (patient.hba1c - 5.0)
    + c.bmi * (bmi - 22)
    + c.age * (patient.age - 30)
    + c.familyHistory * (patient.familyHistoryDiabetes ? 1 : 0)
    + c.activityLevel * actVal
    + c.waistProxy * (waist - 85)
    + c.systolicBP * (patient.systolicBP - 120)
    + c.triglycerides * (patient.triglycerides - 150)
    + c.hdl * (patient.hdl - 50)
    + c.smoking * (patient.smokingStatus === 'active' ? 1 : 0)
    + c.sleepDeviation * sleepDev;

  return Math.round(sigmoid(lp) * 1000) / 10;
}

/* ----------------------------------------------------------------
   CARDIOVASCULAR DISEASE RISK MODEL
   Based on Framingham Heart Study general CVD risk equations
   ---------------------------------------------------------------- */
export function predictCVD(patient) {
  const bmi = calcBMI(patient.height, patient.weight);
  const c = CVD_COEFFICIENTS[patient.gender] || CVD_COEFFICIENTS.male;
  const isDiabetic = patient.glucose >= 126 || patient.hba1c >= 6.5;

  const lp = c.intercept
    + c.age * (patient.age - 40)
    + c.systolicBP_untreated * (patient.systolicBP - 120)
    + c.totalCholesterol * (patient.totalCholesterol - 180)
    + c.hdl * (patient.hdl - 50)
    + c.smoking * (patient.smokingStatus === 'active' ? 1 : 0)
    + c.diabetes * (isDiabetic ? 1 : 0)
    + 0.025 * (bmi - 25)
    + 0.005 * (patient.ldl - 100)
    + 0.003 * (patient.triglycerides - 150);

  return Math.round(sigmoid(lp) * 1000) / 10;
}

/* ----------------------------------------------------------------
   CHRONIC KIDNEY DISEASE RISK MODEL
   Based on KDIGO risk stratification and CKD-EPI
   ---------------------------------------------------------------- */
export function predictCKD(patient) {
  const egfr = calcEGFR(patient.creatinine, patient.age, patient.gender);
  const bmi = calcBMI(patient.height, patient.weight);
  const isDiabetic = patient.glucose >= 126 || patient.hba1c >= 6.5;

  // Proteinuria proxy: estimated from BP, glucose, and BMI
  const proteinuriaRisk = (patient.systolicBP > 140 ? 0.5 : 0) + (patient.glucose > 140 ? 0.5 : 0) + (bmi > 30 ? 0.3 : 0);

  const c = CKD_COEFFICIENTS;
  const lp = c.intercept
    + c.egfr * (egfr - 90)
    + c.age * (patient.age - 40)
    + c.systolicBP * (patient.systolicBP - 120)
    + c.diabetes * (isDiabetic ? 1 : 0)
    + c.smoking * (patient.smokingStatus === 'active' ? 1 : 0)
    + c.bmi * (bmi - 25)
    + c.familyHistory * (patient.familyHistoryHeart ? 0.5 : 0)
    + c.proteinuria * proteinuriaRisk;

  return Math.round(sigmoid(lp) * 1000) / 10;
}

/* ----------------------------------------------------------------
   STROKE RISK MODEL
   Based on CHA2DS2-VASc + Framingham Stroke Risk Profile
   ---------------------------------------------------------------- */
export function predictStroke(patient) {
  const bmi = calcBMI(patient.height, patient.weight);
  const isDiabetic = patient.glucose >= 126 || patient.hba1c >= 6.5;
  const isHypertensive = patient.systolicBP >= 140 || patient.diastolicBP >= 90;

  const c = STROKE_COEFFICIENTS;
  const lp = c.intercept
    + c.age65_74 * (patient.age >= 65 && patient.age < 75 ? 1 : 0)
    + c.age75plus * (patient.age >= 75 ? 1 : 0)
    + c.hypertension * (isHypertensive ? 1 : 0)
    + c.diabetes * (isDiabetic ? 1 : 0)
    + c.smoking * (patient.smokingStatus === 'active' ? 1 : 0)
    + c.atrialFib * (patient.atrialFibrillation ? 1 : 0)
    + c.gender_female * (patient.gender === 'female' ? 1 : 0)
    + c.totalCholesterol * (patient.totalCholesterol - 200)
    + c.bmi * (bmi - 25)
    + 0.012 * (patient.systolicBP - 120)
    + 0.004 * (patient.age - 45);

  return Math.round(sigmoid(lp) * 1000) / 10;
}

/* ----------------------------------------------------------------
   HYPERTENSION RISK MODEL
   Based on AHA/ACC blood pressure guidelines
   ---------------------------------------------------------------- */
export function predictHypertension(patient) {
  const bmi = calcBMI(patient.height, patient.weight);
  const sleepDev = Math.abs(patient.sleepHours - 7.5);
  const activityMap = { sedentary: 0, light: 0.3, moderate: 0.7, vigorous: 1.0 };
  const stressMap = { low: 0, moderate: 0.4, high: 0.7, severe: 1.0 };
  const alcoholMap = { none: 0, light: 0.2, moderate: 0.5, heavy: 1.0 };

  const c = HYPERTENSION_COEFFICIENTS;
  const lp = c.intercept
    + c.systolicBP * (patient.systolicBP - 110)
    + c.diastolicBP * (patient.diastolicBP - 70)
    + c.age * (patient.age - 30)
    + c.bmi * (bmi - 22)
    + c.sodium * (patient.sodiumIntake - 2.3)
    + c.smoking * (patient.smokingStatus === 'active' ? 1 : 0)
    + c.stress * (stressMap[patient.stressLevel] || 0)
    + c.familyHistory * (patient.familyHistoryHypertension ? 1 : 0)
    + c.activityLevel * (activityMap[patient.activityLevel] || 0)
    + c.alcohol * (alcoholMap[patient.alcoholIntake] || 0)
    + c.sleepDeviation * sleepDev;

  return Math.round(sigmoid(lp) * 1000) / 10;
}

/* ----------------------------------------------------------------
   NAFLD (Fatty Liver Disease) RISK MODEL
   Based on Fatty Liver Index (FLI) + NAFLD ridge score
   ---------------------------------------------------------------- */
export function predictNAFLD(patient) {
  const bmi = calcBMI(patient.height, patient.weight);
  const waist = estimateWaistCirc(bmi, patient.gender);
  const irProxy = insulinResistanceProxy(patient.glucose, bmi);
  const alcoholMap = { none: 0, light: 0.2, moderate: 0.5, heavy: 1.0 };

  const c = NAFLD_COEFFICIENTS;
  const lp = c.intercept
    + c.bmi * (bmi - 22)
    + c.triglycerides * (patient.triglycerides - 100)
    + c.waistProxy * (waist - 80)
    + c.glucose * (patient.glucose - 90)
    + c.insulinResistanceProxy * irProxy
    + c.alcohol * (alcoholMap[patient.alcoholIntake] || 0)
    + c.age * (patient.age - 35)
    + c.gender_male * (patient.gender === 'male' ? 1 : 0);

  return Math.round(sigmoid(lp) * 1000) / 10;
}

/* ----------------------------------------------------------------
   AGGREGATE: Run all 6 disease models
   Returns object with all risk scores
   ---------------------------------------------------------------- */
export function predictAllDiseases(patient) {
  const p = { ...patient, bmi: calcBMI(patient.height, patient.weight) };
  return {
    diabetes: predictDiabetes(p),
    cvd: predictCVD(p),
    ckd: predictCKD(p),
    stroke: predictStroke(p),
    hypertension: predictHypertension(p),
    nafld: predictNAFLD(p)
  };
}

// Composite health score (inverse of weighted average risk)
export function calcHealthScore(risks) {
  const weights = { diabetes: 0.20, cvd: 0.25, ckd: 0.12, stroke: 0.15, hypertension: 0.18, nafld: 0.10 };
  let totalRisk = 0;
  for (const [key, weight] of Object.entries(weights)) {
    totalRisk += (risks[key] || 0) * weight;
  }
  return Math.round((100 - totalRisk) * 10) / 10;
}
