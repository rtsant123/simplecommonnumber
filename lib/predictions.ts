import { prisma } from "./prisma";

interface NumberFrequency {
  number: number;
  count: number;
  percentage: number;
}

interface PredictionData {
  commonFirst: number[];
  commonSecond: number[];
  directFirst: number[];
  directSecond: number[];
  houseFirst: number[];
  houseSecond: number[];
  endingFirst: number[];
  endingSecond: number[];
  hotFirst: number[];
  hotSecond: number[];
  coldFirst: number[];
  coldSecond: number[];
}

/**
 * Analyze frequency of numbers in results
 */
function analyzeFrequency(numbers: (number | null)[]): NumberFrequency[] {
  const validNumbers = numbers.filter((n): n is number => n !== null);
  const total = validNumbers.length;

  if (total === 0) return [];

  const frequencyMap = new Map<number, number>();

  validNumbers.forEach((num) => {
    frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
  });

  const frequencies: NumberFrequency[] = Array.from(frequencyMap.entries())
    .map(([number, count]) => ({
      number,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  return frequencies;
}

/**
 * Get most common numbers (top 10)
 */
function getCommonNumbers(frequencies: NumberFrequency[], limit = 10): number[] {
  return frequencies.slice(0, limit).map((f) => f.number);
}

/**
 * Get direct numbers (exact matches that appeared in last 7 days)
 */
function getDirectNumbers(
  recentNumbers: (number | null)[],
  allFrequencies: NumberFrequency[],
  limit = 8
): number[] {
  const recentValid = recentNumbers.filter((n): n is number => n !== null);
  const recentSet = new Set(recentValid);

  // Get numbers that appeared recently and have high frequency
  return allFrequencies
    .filter((f) => recentSet.has(f.number))
    .slice(0, limit)
    .map((f) => f.number);
}

/**
 * Get house-specific patterns (numbers with consistent patterns)
 */
function getHouseNumbers(frequencies: NumberFrequency[], limit = 8): number[] {
  // Get numbers with moderate frequency (appearing 15-40% of the time)
  return frequencies
    .filter((f) => f.percentage >= 15 && f.percentage <= 40)
    .slice(0, limit)
    .map((f) => f.number);
}

/**
 * Get ending numbers (analyze last digit patterns)
 */
function getEndingNumbers(numbers: (number | null)[], limit = 5): number[] {
  const validNumbers = numbers.filter((n): n is number => n !== null);
  const endings = validNumbers.map((n) => n % 10);

  const frequencies = analyzeFrequency(endings);
  const topEndings = frequencies.slice(0, limit).map((f) => f.number);

  // Generate numbers with these endings
  const result: number[] = [];
  topEndings.forEach((ending) => {
    // Add 3 numbers with this ending
    for (let i = 0; i < 10 && result.length < limit * 2; i++) {
      const num = i * 10 + ending;
      if (num >= 0 && num <= 99 && !result.includes(num)) {
        result.push(num);
      }
    }
  });

  return result.slice(0, limit * 2);
}

/**
 * Get hot numbers (appearing frequently in recent results)
 */
function getHotNumbers(
  recentNumbers: (number | null)[],
  limit = 8
): number[] {
  const frequencies = analyzeFrequency(recentNumbers);
  return frequencies.slice(0, limit).map((f) => f.number);
}

/**
 * Get cold numbers (appearing rarely or not at all recently)
 */
function getColdNumbers(
  allNumbers: (number | null)[],
  recentNumbers: (number | null)[],
  limit = 8
): number[] {
  const allFreq = analyzeFrequency(allNumbers);
  const recentValid = recentNumbers.filter((n): n is number => n !== null);
  const recentSet = new Set(recentValid);

  // Get numbers that don't appear in recent results but have historical frequency
  const coldNums = allFreq
    .filter((f) => !recentSet.has(f.number))
    .slice(0, limit)
    .map((f) => f.number);

  // If not enough, add numbers that never appeared
  if (coldNums.length < limit) {
    const allSet = new Set(allNumbers.filter((n): n is number => n !== null));
    for (let i = 0; i <= 99 && coldNums.length < limit; i++) {
      if (!allSet.has(i)) {
        coldNums.push(i);
      }
    }
  }

  return coldNums.slice(0, limit);
}

/**
 * Generate predictions for a house
 */
export async function generatePredictions(
  houseId: string,
  targetDate: Date
): Promise<PredictionData> {
  try {
    // Get last 30 days of results
    const thirtyDaysAgo = new Date(targetDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const results = await prisma.result.findMany({
      where: {
        houseId,
        date: {
          gte: thirtyDaysAgo,
          lt: targetDate,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    if (results.length === 0) {
      throw new Error("Not enough historical data to generate predictions");
    }

    // Get last 7 days for hot/cold analysis
    const sevenDaysAgo = new Date(targetDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentResults = results.filter(
      (r) => new Date(r.date) >= sevenDaysAgo
    );

    // Extract numbers
    const allFirstRound = results.map((r) => r.firstRound);
    const allSecondRound = results.map((r) => r.secondRound);
    const recentFirstRound = recentResults.map((r) => r.firstRound);
    const recentSecondRound = recentResults.map((r) => r.secondRound);

    // Analyze frequencies
    const firstFreq = analyzeFrequency(allFirstRound);
    const secondFreq = analyzeFrequency(allSecondRound);

    // Generate predictions
    const predictions: PredictionData = {
      commonFirst: getCommonNumbers(firstFreq),
      commonSecond: getCommonNumbers(secondFreq),
      directFirst: getDirectNumbers(recentFirstRound, firstFreq),
      directSecond: getDirectNumbers(recentSecondRound, secondFreq),
      houseFirst: getHouseNumbers(firstFreq),
      houseSecond: getHouseNumbers(secondFreq),
      endingFirst: getEndingNumbers(allFirstRound),
      endingSecond: getEndingNumbers(allSecondRound),
      hotFirst: getHotNumbers(recentFirstRound),
      hotSecond: getHotNumbers(recentSecondRound),
      coldFirst: getColdNumbers(allFirstRound, recentFirstRound),
      coldSecond: getColdNumbers(allSecondRound, recentSecondRound),
    };

    return predictions;
  } catch (error) {
    console.error("Error generating predictions:", error);
    throw error;
  }
}

/**
 * Save predictions to database
 */
export async function savePredictions(
  houseId: string,
  date: Date,
  predictions: PredictionData
): Promise<void> {
  try {
    await prisma.prediction.upsert({
      where: {
        houseId_date: {
          houseId,
          date,
        },
      },
      update: {
        commonFirst: JSON.stringify(predictions.commonFirst),
        commonSecond: JSON.stringify(predictions.commonSecond),
        directFirst: JSON.stringify(predictions.directFirst),
        directSecond: JSON.stringify(predictions.directSecond),
        houseFirst: JSON.stringify(predictions.houseFirst),
        houseSecond: JSON.stringify(predictions.houseSecond),
        endingFirst: JSON.stringify(predictions.endingFirst),
        endingSecond: JSON.stringify(predictions.endingSecond),
        hotFirst: JSON.stringify(predictions.hotFirst),
        hotSecond: JSON.stringify(predictions.hotSecond),
        coldFirst: JSON.stringify(predictions.coldFirst),
        coldSecond: JSON.stringify(predictions.coldSecond),
        generatedAt: new Date(),
      },
      create: {
        houseId,
        date,
        commonFirst: JSON.stringify(predictions.commonFirst),
        commonSecond: JSON.stringify(predictions.commonSecond),
        directFirst: JSON.stringify(predictions.directFirst),
        directSecond: JSON.stringify(predictions.directSecond),
        houseFirst: JSON.stringify(predictions.houseFirst),
        houseSecond: JSON.stringify(predictions.houseSecond),
        endingFirst: JSON.stringify(predictions.endingFirst),
        endingSecond: JSON.stringify(predictions.endingSecond),
        hotFirst: JSON.stringify(predictions.hotFirst),
        hotSecond: JSON.stringify(predictions.hotSecond),
        coldFirst: JSON.stringify(predictions.coldFirst),
        coldSecond: JSON.stringify(predictions.coldSecond),
      },
    });
  } catch (error) {
    console.error("Error saving predictions:", error);
    throw error;
  }
}

/**
 * Generate predictions for all active houses
 */
export async function generateAllPredictions(date?: Date): Promise<void> {
  const targetDate = date || new Date();

  try {
    const houses = await prisma.house.findMany({
      where: { isActive: true },
    });

    for (const house of houses) {
      try {
        const predictions = await generatePredictions(house.id, targetDate);
        await savePredictions(house.id, targetDate, predictions);
      } catch (error) {
        console.error(`Error generating predictions for house ${house.name}:`, error);
        // Continue with next house
      }
    }
  } catch (error) {
    console.error("Error generating all predictions:", error);
    throw error;
  }
}
