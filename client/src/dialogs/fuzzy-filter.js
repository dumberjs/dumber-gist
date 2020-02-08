import _ from 'lodash';

export function fuzzyFilter(filter, list) {
  filter = _.trim(filter);
  const ii = filter.length;

  const filtered = [];
  _.each(list, fn => {
    let idx = 0;

    const matches = [];
    for (let i = 0; i < ii; i++) {
      const c = filter[i];
      const nextIdx = fn.indexOf(c, idx);
      if (nextIdx === -1) return;
      if (_.get(_.last(matches), 'end')=== nextIdx) {
        _.last(matches).end += 1;
      } else {
        matches.push({start: nextIdx, end: nextIdx + 1});
      }
      idx = nextIdx + 1;
    }

    // even (0,2,4...) is unmatched, odd is matched.
    const segments = [];
    let start = 0;
    for (let j = 0, jj = matches.length; j < jj; j++) {
      const m = matches[j];
      // unmatched
      segments.push(fn.slice(start, m.start));
      // matched
      segments.push(fn.slice(m.start, m.end));
      start = m.end;
    }
    if (start < fn.length) {
      segments.push(fn.slice(start));
    }

    filtered.push(segments);
  });

  return _.sortBy(filtered, 'length');
}
