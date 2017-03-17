'use strict';

const hash = require('crypto-js/md5');
const init = require('./');

const digits = '0123456789ABCEHKMPTX'; // 0123456789ABCFEHJKLMPRTWYXZ


const maxStep = digits.length * digits.length + 19;

const MPI = init({
  maxSequence: 150e6 * maxStep / 2,
  maxStep: maxStep,
  hashControlValue: '00'
})

console.dir(MPI);

const n = process.argv.length > 2 && process.argv[2] || 100;

const start = Date.now();

let sequence;
[0, 0.1, 1, 10, 20, 50, 100, 150, 200, 1e3, 1e4].forEach(m => {
  console.log(`after ${m} mlns: `)
  sequence = [ Math.round(
    MPI.initialSequence + m * 1e6 * maxStep * (0.35 + Math.random())
  )];
  for (let i=n; i; i--) console.log( sequence = MPI( sequence[0] ));
})

const end = Date.now();

console.error(`${ (end - start) / 1000} sec`)
