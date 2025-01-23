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

/**
 * Generates an aggregated curve by averaging multiple project curves.
 */
export function calculateAggregatedCurve(projects: Project[]): CurvePoint[] {
  const allPoints = projects.map((project) => generateCurvePoints(project));
  const maxX = Math.max(...projects.map((p) => p.xIntercept));
  const aggregatedPoints: CurvePoint[] = [];

  for (let i = 0; i <= 50; i++) {
    const x = (maxX * i) / 50;
    let totalY = 0;
    let count = 0;

    allPoints.forEach((projectPoints) => {
      // Find the nearest point in each project curve
      const nearestPoint = projectPoints.reduce((prev, curr) =>
        Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev,
      );

      totalY += nearestPoint.y;
      count++;
    });

    aggregatedPoints.push({ x, y: totalY / count });
  }

  return aggregatedPoints;
}
