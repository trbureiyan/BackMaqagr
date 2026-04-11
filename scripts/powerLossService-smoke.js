import {
  calculateAltitudeLoss,
  calculateRollingCoefficient,
  calculateRollingResistanceHP,
  calculateSlippageLossHP,
  calculateSlopeLossHP,
  calculateTemperatureLoss,
  calculateTotalLoss,
  calculateTransmissionLoss,
  degreesToRadians,
  degreesToSlopePercent,
  getConstants,
  radiansToDegrees,
  slopePercentToDegrees,
} from "../src/services/powerLossService.js";

const assert = (condition, testName) => {
  if (condition) {
    console.log(`  [OK] ${testName}`);
    return true;
  }

  console.log(`  [FALLO] ${testName}`);
  return false;
};

const approxEqual = (a, b, tolerance = 0.01) => Math.abs(a - b) < tolerance;

const run = () => {
  console.log("[PRUEBAS] Ejecutando smoke tests para powerLossService...\n");

  let passed = 0;
  let failed = 0;

  const check = (condition, testName) => {
    if (assert(condition, testName)) {
      passed += 1;
    } else {
      failed += 1;
    }
  };

  console.log("\n[ALTITUD]");
  check(approxEqual(calculateAltitudeLoss(100, 1500), 5), "1500m -> 5% de perdida");
  check(calculateAltitudeLoss(100, 0) === 0, "nivel del mar -> 0");

  console.log("\n[TEMPERATURA]");
  check(approxEqual(calculateTemperatureLoss(100, 35), 4), "35C -> 4% de perdida");
  check(calculateTemperatureLoss(100, 15) === 0, "15C -> 0");

  console.log("\n[TRANSMISION]");
  check(approxEqual(calculateTransmissionLoss(100), 13), "factor default 0.13");

  console.log("\n[RODADURA]");
  check(approxEqual(calculateRollingCoefficient(50), 0.064), "Cn=50 -> 0.064");
  check(
    approxEqual(calculateRollingResistanceHP(5000, 50, 0, 8), 2.59, 0.1),
    "resistencia en terreno plano",
  );

  console.log("\n[PENDIENTE]");
  check(approxEqual(calculateSlopeLossHP(5000, 10, 6), 3.02, 0.1), "pendiente 10%");
  check(calculateSlopeLossHP(5000, 0, 6) === 0, "pendiente 0%");

  console.log("\n[PATINAJE]");
  check(approxEqual(calculateSlippageLossHP(80, 15), 12), "15% de 80HP");

  console.log("\n[RESUMEN]");
  const result = calculateTotalLoss({
    enginePower: 120,
    altitudeMeters: 1500,
    temperatureC: 30,
    totalWeightKg: 5000,
    soilCn: 50,
    slopePercent: 10,
    speedKmh: 6,
    slippagePercent: 10,
  });
  check(result.grossPower === 120, "potencia bruta");
  check(result.netPower > 0 && result.netPower < 120, "potencia neta en rango");
  check(result.efficiency > 0 && result.efficiency < 100, "eficiencia valida");

  console.log("\n[ANGULOS]");
  check(approxEqual(degreesToRadians(180), Math.PI), "180 grados -> PI");
  check(approxEqual(radiansToDegrees(Math.PI), 180), "PI -> 180 grados");
  check(approxEqual(slopePercentToDegrees(100), 45), "100% pendiente -> 45 grados");
  check(approxEqual(degreesToSlopePercent(45), 100), "45 grados -> 100% pendiente");

  console.log("\n[CONSTANTES]");
  const constants = getConstants();
  check(constants.HP_CONVERSION_FACTOR === 274.4, "factor HP");
  check(constants.BASE_TEMPERATURE_C === 15, "temperatura base");

  console.log(`\n[RESUMEN] ${passed} passed, ${failed} failed`);
  process.exitCode = failed === 0 ? 0 : 1;
};

run();
