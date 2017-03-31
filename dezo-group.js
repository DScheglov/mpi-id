'use strict';

const n = 20;
const m = n / 2;

let group = [];

let g0 = group[0] = [];
let gn = group[n-1] = [];
for (let i=0;i<n;i++) {
  g0.push(i);
  gn.unshift(i);
}

let f = modRow.bind(null, n, m);
for(let i=1; i<m; i++) {
  group[i] = f( group[i - 1] );
  group[n - i - 1] = f( group[ n - i ] )
}

console.dir(group);

function modRow(n, m, row) {
  row = row.slice(0, n);
  let c = row[m];
  let d = row.shift();
  row.push(c);
  row[m - 1] = d;
  return row;
}
