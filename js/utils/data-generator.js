/* ============================================================
   HEALTHPULSE DATA GENERATOR
   Generates synthetic population dataset with realistic
   correlated distributions for population health analytics
   ============================================================ */

// Seeded PRNG (Mulberry32) for deterministic generation
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller transform for normal distribution
function normalRandom(rng, mean, sd) {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + sd * z;
}

// Clamp
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Generate a synthetic population dataset.
 * @param {number} count - Number of records to generate
 * @param {number} seed - Random seed
 * @returns {Array} Array of patient records
 */
export function generatePopulation(count = 2000, seed = 42) {
  const rng = mulberry32(seed);
  const records = [];

  for (let i = 0; i < count; i++) {
    const gender = rng() < 0.48 ? 'female' : 'male';
    const age = Math.round(clamp(normalRandom(rng, 47, 15), 18, 85));

    // BMI: correlated with age slightly
    const ageBMIFactor = (age - 30) * 0.04;
    let bmi = clamp(normalRandom(rng, 25.5 + ageBMIFactor, 5), 16, 48);
    const height = gender === 'female'
      ? Math.round(clamp(normalRandom(rng, 162, 6), 145, 185))
      : Math.round(clamp(normalRandom(rng, 175, 7), 155, 200));
    const weight = Math.round(bmi * Math.pow(height / 100, 2) * 10) / 10;
    bmi = Math.round(bmi * 10) / 10;

    // Blood pressure: correlated with age and BMI
    const bpAgeFactor = (age - 40) * 0.35;
    const bpBMIFactor = (bmi - 25) * 0.8;
    const systolicBP = Math.round(clamp(normalRandom(rng, 122 + bpAgeFactor + bpBMIFactor, 16), 85, 200));
    const diastolicBP = Math.round(clamp(normalRandom(rng, 78 + bpAgeFactor * 0.4 + bpBMIFactor * 0.5, 10), 55, 120));

    // Glucose: correlated with BMI and age
    const glucBMIFactor = (bmi - 25) * 1.8;
    const glucAgeFactor = (age - 40) * 0.25;
    const glucose = Math.round(clamp(normalRandom(rng, 98 + glucBMIFactor + glucAgeFactor, 25), 60, 320));

    // HbA1c: correlated with glucose
    const hba1c = Math.round(clamp(3.5 + (glucose - 60) * 0.018 + normalRandom(rng, 0, 0.3), 3.8, 12) * 10) / 10;

    // Cholesterol: correlated with age and BMI
    const cholAgeFactor = (age - 30) * 0.5;
    const cholBMIFactor = (bmi - 25) * 1.5;
    const totalCholesterol = Math.round(clamp(normalRandom(rng, 195 + cholAgeFactor + cholBMIFactor, 35), 120, 350));
    const hdl = Math.round(clamp(normalRandom(rng, gender === 'female' ? 58 : 48, 12) - (bmi - 25) * 0.5, 20, 95));
    const ldl = Math.round(clamp(totalCholesterol - hdl - normalRandom(rng, 35, 15), 40, 250));
    const triglycerides = Math.round(clamp(normalRandom(rng, 140 + cholBMIFactor, 60), 40, 500));

    // Creatinine: correlated with age
    const creatBase = gender === 'female' ? 0.85 : 1.0;
    const creatinine = Math.round(clamp(normalRandom(rng, creatBase + (age - 40) * 0.005, 0.2), 0.4, 3.0) * 10) / 10;

    const heartRate = Math.round(clamp(normalRandom(rng, 74, 10), 45, 120));

    // Lifestyle factors
    const activityLevels = ['sedentary', 'light', 'moderate', 'vigorous'];
    const actIdx = Math.min(3, Math.max(0, Math.round(normalRandom(rng, 1.2, 0.8))));
    const activityLevel = activityLevels[actIdx];

    const sleepHours = Math.round(clamp(normalRandom(rng, 7, 1.2), 3, 11) * 10) / 10;

    const smokingProb = rng();
    const smokingStatus = smokingProb < 0.2 ? 'active' : smokingProb < 0.35 ? 'former' : 'never';

    const alcoholLevels = ['none', 'light', 'moderate', 'heavy'];
    const alcIdx = Math.min(3, Math.max(0, Math.round(normalRandom(rng, 1.0, 0.8))));
    const alcoholIntake = alcoholLevels[alcIdx];

    const stressLevels = ['low', 'moderate', 'high', 'severe'];
    const stressIdx = Math.min(3, Math.max(0, Math.round(normalRandom(rng, 1.3, 0.7))));
    const stressLevel = stressLevels[stressIdx];

    const sodiumIntake = Math.round(clamp(normalRandom(rng, 3.4, 1.0), 1.0, 7.0) * 10) / 10;

    // Family history: correlated probabilities
    const famDiabetes = rng() < 0.25;
    const famHeart = rng() < 0.22;
    const famStroke = rng() < 0.12;
    const famHypertension = rng() < 0.30;
    const atrialFib = rng() < (age > 65 ? 0.08 : 0.02);

    records.push({
      id: i + 1, age, gender, height, weight, bmi,
      systolicBP, diastolicBP, heartRate,
      glucose, hba1c, totalCholesterol, hdl, ldl, triglycerides, creatinine,
      activityLevel, sleepHours, smokingStatus, alcoholIntake, stressLevel, sodiumIntake,
      familyHistoryDiabetes: famDiabetes, familyHistoryHeart: famHeart,
      familyHistoryStroke: famStroke, familyHistoryHypertension: famHypertension,
      atrialFibrillation: atrialFib
    });
  }

  return records;
}

/**
 * Compute population statistics for analytics.
 */
export function computePopulationStats(records) {
  const ageGroups = { '18-29': [], '30-39': [], '40-49': [], '50-59': [], '60-69': [], '70+': [] };
  const genderCounts = { male: 0, female: 0 };

  for (const r of records) {
    if (r.age < 30) ageGroups['18-29'].push(r);
    else if (r.age < 40) ageGroups['30-39'].push(r);
    else if (r.age < 50) ageGroups['40-49'].push(r);
    else if (r.age < 60) ageGroups['50-59'].push(r);
    else if (r.age < 70) ageGroups['60-69'].push(r);
    else ageGroups['70+'].push(r);
    genderCounts[r.gender]++;
  }

  // Compute correlation matrix for key biomarkers
  const biomarkers = ['bmi', 'glucose', 'systolicBP', 'totalCholesterol', 'hdl', 'triglycerides', 'creatinine'];
  const matrix = computeCorrelationMatrix(records, biomarkers);

  return { ageGroups, genderCounts, correlationMatrix: matrix, correlationLabels: biomarkers.map(b => {
    return { bmi: 'BMI', glucose: 'Glucose', systolicBP: 'SBP', totalCholesterol: 'TC', hdl: 'HDL', triglycerides: 'TG', creatinine: 'Creat' }[b];
  })};
}

function computeCorrelationMatrix(records, fields) {
  const n = records.length;
  const means = {};
  const sds = {};

  for (const f of fields) {
    const vals = records.map(r => r[f]);
    const mean = vals.reduce((s, v) => s + v, 0) / n;
    const sd = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / n);
    means[f] = mean;
    sds[f] = sd;
  }

  const matrix = [];
  for (let i = 0; i < fields.length; i++) {
    const row = [];
    for (let j = 0; j < fields.length; j++) {
      if (i === j) { row.push(1.0); continue; }
      let sum = 0;
      for (const r of records) {
        sum += ((r[fields[i]] - means[fields[i]]) / sds[fields[i]]) * ((r[fields[j]] - means[fields[j]]) / sds[fields[j]]);
      }
      row.push(Math.round((sum / n) * 100) / 100);
    }
    matrix.push(row);
  }
  return matrix;
}
