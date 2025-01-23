import { CurvePoint, Project } from "@/app/types";

export function generateCurvePoints(
  project: Project,
  numPoints: number = 200,
): CurvePoint[] {
  const points: CurvePoint[] = [];
  const { xIntercept, yIntercept, middlePoint } = project;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;

    // Quadratic Bézier curve formula
    const x =
      (1 - t) ** 2 * 0 + 2 * (1 - t) * t * middlePoint.x + t ** 2 * xIntercept;
    const y =
      (1 - t) ** 2 * yIntercept + 2 * (1 - t) * t * middlePoint.y + t ** 2 * 0;

    points.push({ x, y });
  }

  // **Force the last point to be exactly at (xIntercept, 0)**
  points[points.length - 1] = { x: xIntercept, y: 0 };

  return points;
}

export function calculateAggregatedCurve(userSubmissions: Project[]): CurvePoint[] {
  if (userSubmissions.length === 0) return [];

  const maxValidX = Math.max(...userSubmissions.map((p) => p.xIntercept));
  const stepSize = Math.min(500, maxValidX / 400); // Higher resolution sampling

  const aggregatedPoints: CurvePoint[] = [];

  for (let x = 0; x <= maxValidX; x += stepSize) {
    const yValues: number[] = [];

    userSubmissions.forEach((submission) => {
      const curvePoints = generateCurvePoints(submission);

      const lowerPoint = curvePoints.reduce((prev, curr) =>
        curr.x <= x && curr.x > prev.x ? curr : prev
      );
      const upperPoint = curvePoints.reduce((prev, curr) =>
        curr.x > x && curr.x < prev.x ? curr : prev
      );

      let y = null;
      if (lowerPoint.x === upperPoint.x) {
        y = lowerPoint.y;
      } else if (upperPoint.x !== lowerPoint.x) {
        const ratio = (x - lowerPoint.x) / (upperPoint.x - lowerPoint.x);
        y = lowerPoint.y + ratio * (upperPoint.y - lowerPoint.y);
      }

      if (y !== null) yValues.push(y);
    });

    const validYValues = yValues.filter((v) => v !== null && isFinite(v));
    if (validYValues.length < userSubmissions.length / 3) continue; // Ignore low-data points

    let avgY = validYValues.reduce((a, b) => a + b, 0) / validYValues.length;

    // Apply Moving Average Smoothing
    if (aggregatedPoints.length > 2) {
      const prev1 = aggregatedPoints[aggregatedPoints.length - 1].y;
      const prev2 = aggregatedPoints[aggregatedPoints.length - 2].y;
      avgY = (prev2 + prev1 + avgY) / 3;
    }

    avgY = Math.max(0, Math.min(avgY, 100)); // Keep within bounds
    aggregatedPoints.push({ x, y: avgY });
  }

  console.log("=== Final Aggregated User Curve ===");
  console.table(aggregatedPoints);
  return aggregatedPoints;
}