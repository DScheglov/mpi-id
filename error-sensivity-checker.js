'use strict';

const hash = require('crypto-js/md5');
const hash2 = require('crypto-js/sha1')
const init = require('./');

const digits = '0123456789ABCEHKMPTX'.split(''); // 0123456789ABCFEHJKLMPRTWYXZ
//const digits = '0123456789'.split('');

const maxStep = 1; //23; digits.length * digits.length + 19;

const mpi_00 = init({
  digits: digits.join(''),
  maxSequence: 1e11 * maxStep / 2,
  maxStep: maxStep,
  hashControlValue: '000', //'0000',
  hash: hash // (id) => hash ( id )
})

let ranges = [0, 0.1, 1, 10, 50, 100, 150, 200, 1e3, 1e4];
let N = 10000;
let R = parseInt (N / ranges.length);

let sequence;

let all, matched;

for (let i=matched=all=0; i<N; i++) {

  if (i % R === 0) {
    let k = ranges[parseInt(i/R, 10)];
    let mlnRange =  k * 1e6;
    sequence = [ mpi_00.initialSequence + mlnRange * maxStep / 2 ];
    console.log(`Starting range [${k} nln ...]:`)
  }

  let code, srcCode = (sequence = mpi_00(sequence[0]))[1]
  code = srcCode.replace(/\-/g, '').split('');

  for(let l=0; l<code.length; l++) {
    let h = code[l];
    for (let g of digits) {
      if (g === h) continue;
      code[l] = g;
      all ++;
      let vCode = mpi_00.group(code.join('') );
      if ( mpi_00.isId( vCode ) ) {
        //console.dir(vCode);
        matched++;
      }
    }
    code[l] = h;
  }

  console.log(`${i+1} code (${sequence}) checked. Verified: ${all}. isIdOk: ${matched}. Prob: ${Math.round(10000000 * matched / all)/100000}%`);

}
console.log('---------------------------------------------------------------');

for (let i=matched=all=0; i<N; i++) {

  if (i % R === 0) {
    let k = ranges[parseInt(i/R, 10)];
    let mlnRange =  k * 1e6;
    sequence = [ mpi_00.initialSequence + mlnRange * maxStep / 2 ];
    console.log(`Starting range [${k} nln ...]:`)
  }

  let code, srcCode = (sequence = mpi_00(sequence[0]))[1]
  code = srcCode.replace(/\-/g, '').split('');

  for(let l=0; l<code.length - 1; l++) {
    let h = code[l];
    let k = code[l] = code[l+1];
    if (h !== k) {
      code[l + 1] = h;

      let vCode = mpi_00.group(code.join('') );
      if ( mpi_00.isId( vCode ) ) {
        //console.dir(vCode);
        matched++;
      }
      all++;
    }
    code[l] = h;
    code[l + 1] = k;
  }
  console.log(`${i+1} code (${sequence}) checked. Verified: ${all}. isIdOk: ${matched}. Prob: ${Math.round(10000000 * matched / (all | 1))/100000}%`);

}
// console.log('---------------------------------------------------------------');
//
// for (let i=matched=all=0; i<N; i++) {
//
//   if (i % R === 0) {
//     let k = ranges[parseInt(i/R, 10)];
//     let mlnRange =  k * 1e6;
//     sequence = [ mpi_00.initialSequence + mlnRange * maxStep / 2 ];
//     console.log(`Starting range [${k} nln ...]:`)
//   }
//
//   let code, srcCode = (sequence = mpi_00(sequence[0]))[1]
//   code = srcCode.replace(/\-/g, '').split('');
//
//   for (let j=0; j<code.length; j++) {
//     for (let d of digits) {
//       if (d === code[j]) continue;
//       let c = code[j];
//       code[j] = d;
//       for(let l=j+1; l<code.length; l++) {
//         for (let g of digits) {
//           if (g === code[l]) continue;
//           let h = code[l];
//           code[l] = g;
//           all += 1;
//           let vCode = mpi_00.group(code.join('') );
//           if ( mpi_00.isId( vCode ) ) {
//             //console.dir(vCode);
//             matched++;
//           }
//           code[l] = h;
//         }
//       }
//       code[j] = c;
//     }
//   }
//   console.log(`${i+1} code (${srcCode}) checked. Verified: ${all}. isIdOk: ${matched}. Prob: ${Math.round(10000000 * matched / all)/100000}%`);
//
// }
