'use strict';

const digits = '0123456789'.split('');
const r = digits.length;

function genId(n) {
  let s = '';
  let crc = 0;
  let c, d;
  for (let k=0;k < n-1;k++) {
    c = d = Math.round( 10000 * Math.random() ) % r;
    if (k % 2 === 0) c = (c = c * 2) > 9 ? c - 9 : c;
    crc += c;
    s += d.toString();
  }
  d = (d = 10 - crc % 10) < 10 ? d : 0;
  s += d.toString();
  return s;
}

function check(num) {
  let crc = num.split('').reduce( ( crc, d, i ) => {
    let c = parseInt(d, 10);
    if (i % 2 === 0) c = ( c = c * 2 ) > 9 ? c - 9 : c;
    return crc + c;
  }, 0);
  return ( crc % 10 === 0 );
}

let N = 10;
let m = 12;

let all, matched;
for (let i=matched=all=0; i<N; i++) {
  let num = genId(m).split('');
  for (let j=0; j<m; j++) {
    let c = num[j];
    for (let d of digits) {
      if (d === c) continue;
      num[j] = d;
      all++;
      matched = check(num.join('')) ? 1 : 0;
    }
    num[j] = c;
  }
  console.log(`${i+1} (${num.join('')}): Checked: ${all}. Matched: ${matched}`);
}

for (let i=matched=all=0; i<N; i++) {

  let code, srcCode = genId(m);
  code = srcCode.split('');

  for (let j=0; j<code.length; j++) {
    for (let d of digits) {
      if (d === code[j]) continue;
      let c = code[j];
      code[j] = d;
      for(let l=j+1; l<code.length; l++) {
        for (let g of digits) {
          if (g === code[l]) continue;
          let h = code[l];
          code[l] = g;
          all += 1;
          matched += check(code.join('')) ? 1 : 0;
          code[l] = h;
        }
      }
      code[j] = c;
    }
  }
  console.log(`${i+1} code (${srcCode}) checked. Verified: ${all}. isIdOk: ${matched}. Prob: ${Math.round(10000000 * matched / all)/100000}%`);

}

//
// 1 2 3 4 5 6 7 8 9 A B C D E
// ---------------------------
// 2 0 7 3 2 7 0 3 8 4 8 3 6 0
// 4   5   4   0   7   7   3
// 4 0 5 3 4 7 0 3 7 4 7 3 3   = (4 + 0 + 5 + 3) = 12 + (4 + 7 + 0 + 3) = 17 + (7 + 4 + 7 + 3 + 3) = 24 = 24 + 29 = 53
