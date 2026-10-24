/* Small SVG charts in the portal's palette: grouped bars, lines, and a bars-plus-line combo
   (the cashflow tab's shape). Values are plain numbers; labels run along the x axis. */
window.JPMS = window.JPMS || {};

(function () {
  const palette = { accent: '#66E094', info: '#3CA1FF', warning: '#F2B544', negative: '#FF403C', brand: '#4CDBEE', faint: '#8C8C8C' };
  const width = 900;
  const height = 260;
  const pad = { top: 16, right: 16, bottom: 32, left: 64 };

  function scale(series) {
    const values = series.flatMap((entry) => entry.values);
    const max = Math.max(0, ...values);
    const min = Math.min(0, ...values);
    const span = max - min || 1;
    const plotHeight = height - pad.top - pad.bottom;
    return { min, max, y: (value) => pad.top + plotHeight - ((value - min) / span) * plotHeight };
  }

  function axis(labels, range, format) {
    const plotWidth = width - pad.left - pad.right;
    const step = plotWidth / labels.length;
    const ticks = [range.min, (range.min + range.max) / 2, range.max].map((value) => `<text x="${pad.left - 8}" y="${range.y(value) + 4}" text-anchor="end">${format(value)}</text><line x1="${pad.left}" x2="${width - pad.right}" y1="${range.y(value)}" y2="${range.y(value)}" stroke="#2E323A"/>`).join('');
    const names = labels.map((label, index) => `<text x="${pad.left + step * index + step / 2}" y="${height - 10}" text-anchor="middle">${label}</text>`).join('');
    return { step, markup: ticks + names };
  }

  function shortMoney(value) {
    const size = Math.abs(value);
    if (size >= 1e6) return `£${(value / 1e6).toFixed(1)}m`;
    if (size >= 1e3) return `£${Math.round(value / 1e3)}k`;
    return `£${Math.round(value)}`;
  }

  function legend(series) {
    return `<div class="legend" style="margin-top:12px">${series.map((entry) => `<span><i style="background:${palette[entry.tone] || entry.tone}"></i>${entry.name}</span>`).join('')}</div>`;
  }

  function bars(labels, series, range, step) {
    const groupWidth = step * 0.7;
    const barWidth = groupWidth / series.length;
    return series.map((entry, seriesIndex) => entry.values.map((value, index) => {
      const x = pad.left + step * index + (step - groupWidth) / 2 + barWidth * seriesIndex;
      const top = Math.min(range.y(value), range.y(0));
      const barHeight = Math.abs(range.y(value) - range.y(0));
      return `<rect x="${x}" y="${top}" width="${barWidth - 2}" height="${barHeight}" fill="${palette[entry.tone] || entry.tone}" rx="2"/>`;
    }).join('')).join('');
  }

  function line(entry, range, step) {
    const points = entry.values.map((value, index) => `${pad.left + step * index + step / 2},${range.y(value)}`).join(' ');
    const colour = palette[entry.tone] || entry.tone;
    return `<polyline points="${points}" fill="none" stroke="${colour}" stroke-width="2" ${entry.dashed ? 'stroke-dasharray="6 4"' : ''}/>`;
  }

  JPMS.charts = {
    bars({ labels, series, format = shortMoney }) {
      const range = scale(series);
      const frame = axis(labels, range, format);
      return `<svg class="chart" viewBox="0 0 ${width} ${height}">${frame.markup}${bars(labels, series, range, frame.step)}</svg>${legend(series)}`;
    },

    lines({ labels, series, format = shortMoney }) {
      const range = scale(series);
      const frame = axis(labels, range, format);
      return `<svg class="chart" viewBox="0 0 ${width} ${height}">${frame.markup}${series.map((entry) => line(entry, range, frame.step)).join('')}</svg>${legend(series)}`;
    },

    combo({ labels, bars: barSeries, lines: lineSeries, format = shortMoney }) {
      const range = scale([...barSeries, ...lineSeries]);
      const frame = axis(labels, range, format);
      return `<svg class="chart" viewBox="0 0 ${width} ${height}">${frame.markup}${bars(labels, barSeries, range, frame.step)}${lineSeries.map((entry) => line(entry, range, frame.step)).join('')}</svg>${legend([...barSeries, ...lineSeries])}`;
    }
  };
})();
