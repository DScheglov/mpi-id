'use strict';

const assert = require('assert');

module.exports = exports = genIdFactory;

/**
 * genIdFactory - creates the Id-generating function
 *
 * @param  {Number} [options.maxSequence=1e10]                Expected maximal sequence of Id's
 * @param  {Number} [options.maxStep=1e3]                     Maximal step from previous Id
 * @param  {String} [options.digits='0123456789ABCEHKMPTX']   String with chars that should be used in Id's representation
 * @param  {Function} [options.hash=require('crypto-js/md5')] Hash-function
 * @param  {String} [options.hashControlValue='0000']         Hash Control Value
 * @param  {Number} [options.groupWidth]                      Width of digits group
 * @param  {String} [options.groupSeparator='-']              Digit group separator
 * @param  {Boolean} [restore=false]                          Flag that prevents randomization of digits
 * @return {Function}                                         Function to be used for id's generation
 */
function genIdFactory(options) {
  let g, s;

  options = options || {};

  const hash = options.hash || require('crypto-js/md5');
  assert(hash instanceof Function, 'hash should be a Function');

  const maxSequence = options.maxSequence || 1e10;
  const maxStep = options.maxStep || 1e5;

  let digits = options.digits || '0123456789ABCEHKMPTX';
  const allowedDigits = options.digits ? sortStr(digits) : digits;
  digits = options.restore === true ? digits : randomize(digits);

  const radix = digits.length;
  const hashControlValue = options.hashControlValue || '0000';
  const width = str(digits, radix, 0, maxSequence).length;
  const nonceWidth = hashControlValue.length + 1;

  g = options.groupWidth;
  const groupWidth = max(
    (typeof g !== 'number') ? Math.ceil( ( width + nonceWidth ) / 2 ) : g,
    4
  );
  const groupSeparator = (
    typeof(s = options.groupSeparator) !== 'string' ? '-' : s
  );

  const groupRe = new RegExp(
    `([^${ groupSeparator }]+)` +
    `([^${ groupSeparator }]{${ groupWidth }}(${ groupSeparator }|$))`
  );
  const neGroup = new RegExp(`[^${ groupSeparator }]{${ groupWidth + 1 }}`);
  const groupFunc = ( groupSeparator && groupWidth?
    group.bind(null, neGroup, groupRe, `$1${ groupSeparator }$2`) :
    s => s
  );

  const hashPattern = new RegExp(`^${ hashControlValue }.*$`);

  const genFunc = genId.bind(null,
    step.bind(null, maxStep),
    str.bind(null, digits, radix, width),
    str.bind(null, digits, radix, nonceWidth),
    groupFunc,
    hash,
    hashPattern.test.bind(hashPattern)
  );

  // const genFunc = genIdLuhn.bind(null,
  //   step.bind(null, maxStep),
  //   str.bind(null, digits, radix, width),
  //   str.bind(null, digits, radix, nonceWidth),
  //   groupFunc,
  //   luhn.bind(null, digits, radix)
  // );

  genFunc.digits = digits;
  genFunc.groupWidth = groupWidth;
  genFunc.hashControlValue = hashControlValue;
  genFunc.hashPattern = hashPattern;
  genFunc.maxStep = maxStep;
  genFunc.initialSequence = Math.floor( maxSequence * 0.1 * Math.random() );
  genFunc.hash = hash;
  genFunc.hashName = hash.name;
  genFunc.getSequenceById = getSequenceById.bind( null, digits, nonceWidth );
  genFunc.group = groupFunc;

  genFunc.idPattern = new RegExp(
    `^[${allowedDigits}]{1,${groupWidth}}` +
    `(?:${groupSeparator}[${allowedDigits}]{${groupWidth}})*$`
  );

  genFunc.isId = isId.bind(null,
    genFunc.idPattern.test.bind(genFunc.idPattern),
    hash,
    hashPattern.test.bind(hashPattern)
  );

  // genFunc.isId = isId.bind(null,
  //   genFunc.idPattern.test.bind(genFunc.idPattern),
  //   (x) => x,
  //   check.bind(null, digits, radix)
  // );

  return genFunc;
}

function genId(step, sStr, nStr, group, hash, testHash, sequence) {
  const base = sStr( sequence = parseInt(sequence, 10) + step() );
  let nonce = 0, id;
  do {
    id = group(`${nStr( nonce++ )}${base}`)
  } while (!testHash( hash(id) ));

  return [ sequence, id ];
}

function genIdLuhn(step, sStr, nStr, group, luhn, sequence) {
  const base = sStr( sequence = parseInt(sequence, 10) + step() );
  let id = nStr(sequence),
      nonce = luhn(id).toString();

  return [ sequence, group(nonce + id) ];
}

function randomize(s) {
  let ns = '', i, l, j = l = s.length;
  s = s.split('');
  while (ns.length < l) {
    i = Math.round( Math.random() * j ) % j;
    ns += s[i];
    s.splice(i, 1);
    j--;
  }
  return (ns + s);
}

function step(max) {
  return parseInt(max * Math.random()) || 1;
}

function str(digits, r, w, n) {
  let s, l;
  for (s = '', l=0; n>0; n = Math.floor(n / r), l++) {
    s = digits[Math.round(n % r)] + s;
  }

  w = w || 1;

  while (l < w) (s = digits[0] + s), (l++)

  return s;
}

function group(neGroup, groupRe, replacer, s) {
  while (neGroup.test(s)) s = s.replace(groupRe, replacer);
  return s;
}

function getSequenceById(digits, nonceWidth, id) {
  assert(typeof id === 'string', 'id should be a string');
  let radix = digits.length;
  return (id
    .replace(new RegExp(`[^${ digits }]`, 'g'), '')
    .substr(nonceWidth, id.length)
    .split('')
    .reduceRight((a, c) => (
      a.n += digits.indexOf(c) * a.p, a.p *= radix, a
     ), { p: 1, n: 0 }
   )).n;
}

function isId(test, hash, testHash, id) {
  return test(id) && testHash( hash(id) );
}

function sortStr(s) {
  return s.split('').sort().join('');
}

function max(a, b) {
  return a > b ? a : b;
}

function luhn(digits, r, num) {

  let crc = num.split('').reverse().reduce( ( crc, d, i ) => {
    let c = digits.indexOf(d);
    if (i % 2 === 1) c = ( c = c * 2 ) > (r - 1) ? c - r + 1 : c;
    return crc + c;
  }, 0);
  crc = crc % r;
  crc = crc === 0 ? crc : r - crc;

  return crc;

}

function check(digits, r, num) {
  let crc = num
    .replace(new RegExp(`[^${ digits }]`, 'g'), '')
    .split('')
    .reverse()
    .reduce( ( crc, d, i ) => {
      let c = digits.indexOf(d);
        if (i % 2 === 1) c = ( c = c * 2 ) > ( r - 1 ) ? c - r + 1 : c;
        return crc + c;
    }, 0);
  return !( crc % r);
}
