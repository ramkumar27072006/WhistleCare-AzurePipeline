/* ============================================================
   HEALTHPULSE CHART UTILITIES
   Custom Canvas 2D rendering for all visualizations
   No external chart library dependencies
   ============================================================ */

const DPR = window.devicePixelRatio || 1;

/**
 * Setup a canvas element for high-DPI rendering.
 */
export function setupCanvas(canvas, width, height) {
  canvas.width = width * DPR;
  canvas.height = height * DPR;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);
  return ctx;
}

/**
 * Clear the canvas.
 */
export function clearCanvas(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width / DPR, canvas.height / DPR);
}

/**
 * Draw a donut/ring chart.
 */
export function drawDonut(ctx, cx, cy, radius, percentage, color, bgColor = 'rgba(255,255,255,0.06)', lineWidth = 10) {
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (2 * Math.PI * (percentage / 100));

  // Background ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = bgColor;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Progress ring
  if (percentage > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

/**
 * Draw a semicircular gauge with needle.
 */
export function drawGauge(ctx, cx, cy, radius, value, minVal, maxVal, colorStops) {
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;
  const range = maxVal - minVal;
  const normalized = Math.max(0, Math.min(1, (value - minVal) / range));

  // Gauge background arc with gradient
  const segmentCount = colorStops.length - 1;
  for (let i = 0; i < segmentCount; i++) {
    const s = startAngle + (endAngle - startAngle) * (i / segmentCount);
    const e = startAngle + (endAngle - startAngle) * ((i + 1) / segmentCount);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, s, e);
    ctx.strokeStyle = colorStops[i];
    ctx.lineWidth = 14;
    ctx.lineCap = 'butt';
    ctx.stroke();
  }

  // Tick marks
  for (let i = 0; i <= 10; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / 10);
    const innerR = radius - (i % 5 === 0 ? 20 : 12);
    const outerR = radius - 8;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
    ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = i % 5 === 0 ? 2 : 1;
    ctx.stroke();
  }

  // Needle
  const needleAngle = startAngle + (endAngle - startAngle) * normalized;
  const needleLen = radius - 24;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(needleAngle) * needleLen, cy + Math.sin(needleAngle) * needleLen);
  ctx.strokeStyle = '#f0f4f8';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
  ctx.fillStyle = '#f0f4f8';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
  ctx.fillStyle = '#0a0f1e';
  ctx.fill();
}

/**
 * Draw a horizontal waterfall chart (for SHAP values).
 */
export function drawWaterfall(ctx, w, h, attributions, baseValue) {
  const padding = { top: 30, right: 30, bottom: 20, left: 160 };
  const chartW = w - padding.left - padding.right;
  const barHeight = 24;
  const barGap = 6;
  const maxBars = Math.min(attributions.length, 12);

  const maxAbsVal = Math.max(...attributions.slice(0, maxBars).map(a => Math.abs(a.shapValue)), 1);
  const scale = (chartW * 0.4) / maxAbsVal;
  const centerX = padding.left + chartW * 0.5;

  // Title
  ctx.font = '600 12px Inter, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.fillText('Feature Impact on Risk Score', w / 2, 16);

  // Center line
  ctx.beginPath();
  ctx.moveTo(centerX, padding.top);
  ctx.lineTo(centerX, padding.top + maxBars * (barHeight + barGap));
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  for (let i = 0; i < maxBars; i++) {
    const attr = attributions[i];
    const y = padding.top + i * (barHeight + barGap);
    const barW = Math.abs(attr.shapValue) * scale;
    const isRisk = attr.shapValue > 0;
    const barX = isRisk ? centerX : centerX - barW;
    const color = isRisk ? '#ef4444' : '#10b981';

    // Bar
    const r = 4;
    ctx.beginPath();
    if (isRisk) {
      ctx.moveTo(barX, y);
      ctx.lineTo(barX + barW - r, y);
      ctx.quadraticCurveTo(barX + barW, y, barX + barW, y + r);
      ctx.lineTo(barX + barW, y + barHeight - r);
      ctx.quadraticCurveTo(barX + barW, y + barHeight, barX + barW - r, y + barHeight);
      ctx.lineTo(barX, y + barHeight);
    } else {
      ctx.moveTo(barX + r, y);
      ctx.lineTo(barX + barW, y);
      ctx.lineTo(barX + barW, y + barHeight);
      ctx.lineTo(barX + r, y + barHeight);
      ctx.quadraticCurveTo(barX, y + barHeight, barX, y + barHeight - r);
      ctx.lineTo(barX, y + r);
      ctx.quadraticCurveTo(barX, y, barX + r, y);
    }
    ctx.closePath();
    ctx.fillStyle = color + '40';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Feature label
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'right';
    ctx.fillText(attr.feature, padding.left - 8, y + barHeight / 2 + 4);

    // Value label
    ctx.font = '600 10px Inter, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = isRisk ? 'left' : 'right';
    const valX = isRisk ? barX + barW + 6 : barX - 6;
    ctx.fillText(`${isRisk ? '+' : ''}${attr.shapValue.toFixed(1)}%`, valX, y + barHeight / 2 + 4);
  }
}

/**
 * Draw a line chart for trend data.
 */
export function drawLineChart(ctx, w, h, datasets, options = {}) {
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  // Find ranges
  let allValues = [];
  let maxPoints = 0;
  for (const ds of datasets) {
    allValues.push(...ds.data);
    maxPoints = Math.max(maxPoints, ds.data.length);
  }
  const minY = options.minY ?? Math.min(...allValues) * 0.9;
  const maxY = options.maxY ?? Math.max(...allValues) * 1.1;

  // Grid lines
  const gridLines = 5;
  ctx.font = '400 10px Inter, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'right';

  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + chartH - (chartH * i / gridLines);
    const val = minY + (maxY - minY) * (i / gridLines);

    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(w - padding.right, y);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillText(Math.round(val).toString(), padding.left - 8, y + 3);
  }

  // Draw each dataset
  for (const ds of datasets) {
    if (ds.data.length < 2) continue;

    const points = ds.data.map((val, i) => ({
      x: padding.left + (chartW * i / (maxPoints - 1)),
      y: padding.top + chartH - (chartH * (val - minY) / (maxY - minY))
    }));

    // Area fill
    if (ds.fill) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, padding.top + chartH);
      for (const p of points) ctx.lineTo(p.x, p.y);
      ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
      ctx.closePath();
      ctx.fillStyle = ds.color + '15';
      ctx.fill();
    }

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = ds.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Points
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = ds.color;
      ctx.fill();
    }
  }

  // X-axis labels
  if (options.labels) {
    ctx.font = '400 10px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    const step = Math.max(1, Math.floor(options.labels.length / 8));
    for (let i = 0; i < options.labels.length; i += step) {
      const x = padding.left + (chartW * i / (maxPoints - 1));
      ctx.fillText(options.labels[i], x, h - padding.bottom + 18);
    }
  }
}

/**
 * Draw a bar chart.
 */
export function drawBarChart(ctx, w, h, data, options = {}) {
  const padding = { top: 20, right: 20, bottom: 60, left: 50 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const maxVal = options.maxVal ?? Math.max(...data.map(d => d.value)) * 1.15;
  const barWidth = Math.min(40, (chartW / data.length) * 0.6);
  const barGap = (chartW - barWidth * data.length) / (data.length + 1);

  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + chartH - (chartH * i / 4);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(w - padding.right, y);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '400 10px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxVal * i / 4).toString(), padding.left - 8, y + 3);
  }

  // Bars
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const x = padding.left + barGap + i * (barWidth + barGap);
    const barH = (d.value / maxVal) * chartH;
    const y = padding.top + chartH - barH;
    const color = d.color || options.color || '#00d4aa';

    // Bar with rounded top
    const r = Math.min(4, barWidth / 4);
    ctx.beginPath();
    ctx.moveTo(x, y + barH);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.lineTo(x + barWidth - r, y);
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
    ctx.lineTo(x + barWidth, y + barH);
    ctx.closePath();
    ctx.fillStyle = color + '60';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label
    ctx.save();
    ctx.translate(x + barWidth / 2, padding.top + chartH + 8);
    ctx.rotate(-Math.PI / 4);
    ctx.font = '400 10px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    ctx.fillText(d.label || '', 0, 0);
    ctx.restore();

    // Value on top
    ctx.font = '600 10px Inter, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(d.value).toString(), x + barWidth / 2, y - 6);
  }
}

/**
 * Draw a scatter plot.
 */
export function drawScatter(ctx, w, h, points, options = {}) {
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const xRange = options.xRange || [Math.min(...points.map(p => p.x)), Math.max(...points.map(p => p.x))];
  const yRange = options.yRange || [Math.min(...points.map(p => p.y)), Math.max(...points.map(p => p.y))];

  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + chartH - (chartH * i / 4);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(w - padding.right, y);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '400 10px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    const val = yRange[0] + (yRange[1] - yRange[0]) * (i / 4);
    ctx.fillText(Math.round(val).toString(), padding.left - 8, y + 3);
  }

  // Points
  for (const p of points) {
    const px = padding.left + ((p.x - xRange[0]) / (xRange[1] - xRange[0])) * chartW;
    const py = padding.top + chartH - ((p.y - yRange[0]) / (yRange[1] - yRange[0])) * chartH;
    const color = p.color || '#00d4aa';

    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
    ctx.fillStyle = color + '80';
    ctx.fill();
  }

  // Axis labels
  if (options.xLabel) {
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText(options.xLabel, padding.left + chartW / 2, h - 5);
  }
  if (options.yLabel) {
    ctx.save();
    ctx.translate(12, padding.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText(options.yLabel, 0, 0);
    ctx.restore();
  }
}

/**
 * Draw a correlation heatmap.
 */
export function drawHeatmap(ctx, w, h, matrix, labels) {
  const padding = { top: 60, right: 20, bottom: 20, left: 100 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const cellW = chartW / labels.length;
  const cellH = chartH / labels.length;

  for (let i = 0; i < labels.length; i++) {
    for (let j = 0; j < labels.length; j++) {
      const val = matrix[i][j];
      const x = padding.left + j * cellW;
      const y = padding.top + i * cellH;

      // Color interpolation: blue (negative) -> dark (zero) -> red (positive)
      let r, g, b;
      if (val >= 0) {
        r = Math.round(239 * val); g = Math.round(68 * val); b = Math.round(68 * val);
      } else {
        r = Math.round(59 * Math.abs(val)); g = Math.round(130 * Math.abs(val)); b = Math.round(246 * Math.abs(val));
      }

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.abs(val) * 0.7 + 0.1})`;
      ctx.fillRect(x, y, cellW - 1, cellH - 1);

      // Value text
      if (cellW > 30) {
        ctx.font = '500 9px Inter, sans-serif';
        ctx.fillStyle = Math.abs(val) > 0.4 ? '#fff' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(val.toFixed(2), x + cellW / 2, y + cellH / 2 + 3);
      }
    }
  }

  // Row labels
  ctx.font = '400 10px Inter, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'right';
  for (let i = 0; i < labels.length; i++) {
    ctx.fillText(labels[i], padding.left - 6, padding.top + i * cellH + cellH / 2 + 3);
  }

  // Column labels
  ctx.textAlign = 'left';
  for (let j = 0; j < labels.length; j++) {
    ctx.save();
    ctx.translate(padding.left + j * cellW + cellW / 2, padding.top - 6);
    ctx.rotate(-Math.PI / 4);
    ctx.fillText(labels[j], 0, 0);
    ctx.restore();
  }
}

/**
 * Draw a pie chart.
 */
export function drawPieChart(ctx, cx, cy, radius, slices) {
  let startAngle = -Math.PI / 2;

  for (const slice of slices) {
    const sliceAngle = (slice.value / 100) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    ctx.strokeStyle = '#0a0f1e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    if (slice.value > 5) {
      const midAngle = startAngle + sliceAngle / 2;
      const labelR = radius * 0.65;
      ctx.font = '600 11px Inter, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${Math.round(slice.value)}%`,
        cx + Math.cos(midAngle) * labelR,
        cy + Math.sin(midAngle) * labelR + 4
      );
    }

    startAngle += sliceAngle;
  }
}

/**
 * Animate a numeric value counting up.
 */
export function animateValue(element, start, end, duration = 800, suffix = '') {
  const range = end - start;
  const startTime = performance.now();
  const isDecimal = String(end).includes('.') || Math.abs(end) < 10;

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + range * eased;

    element.textContent = (isDecimal ? current.toFixed(1) : Math.round(current)) + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);
}
