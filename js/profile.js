const svg = d3.select('#profile')
  .attr('width', '800')
  .attr('height', '300');

const profileListing = svg.append('g');

const buttons = d3.selectAll('input');

