'use strict';

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

module.exports = exports = {
  digits: '0123456789',
  check: check
}
