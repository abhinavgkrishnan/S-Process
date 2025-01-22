import { CurvePoint, Project } from "@/app/types";

export function generateCurvePoints(project: Project, numPoints: number = 50): CurvePoint[] {
  const points: CurvePoint[] = [];
  const { xIntercept, yIntercept, middlePoint } = project;

  // Generate points using quadratic Bézier curve
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const x = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * middlePoint.x + t * t * xIntercept;
    const y = (1 - t) * (1 - t) * yIntercept + 2 * (1 - t) * t * middlePoint.y + t * t * 0;
    points.push({ x, y });
  }

  return points;
}

export function calculateAggregatedCurve(projects: Project[]): CurvePoint[] {
  const allPoints = projects.map(project => generateCurvePoints(project));
  const maxX = Math.max(...projects.map(p => p.xIntercept));
  const aggregatedPoints: CurvePoint[] = [];

  for (let i = 0; i <= 50; i++) {
    const x = (maxX * i) / 50;
    let totalY = 0;

    allPoints.forEach(projectPoints => {
      const nearestPoint = projectPoints.reduce((prev, curr) => 
        Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev
      );
      totalY += nearestPoint.y;
    });

    aggregatedPoints.push({ x, y: totalY / projects.length });
  }

  return aggregatedPoints;
}