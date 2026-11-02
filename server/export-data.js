'use strict';

const headers = ['Nama','Round','Soalan','Jawapan Dipilih','Betul','Grade Stacking','Mata Stacking','Mata Quiz','Skor Selepas Round'];
const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;

function exportCsv(rows) {
  return `${[headers.map(csvCell).join(','), ...rows.map(row => headers.map(header => csvCell(row[header])).join(','))].join('\r\n')}\r\n`;
}

module.exports = {headers,exportCsv};
