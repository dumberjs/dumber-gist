import {test} from 'zora';
import {HistoryTracker} from '../src/history-tracker';
import {EventAggregator} from 'aurelia-event-aggregator';


test('HistoryTracker initialises', t => {
  const ea = new EventAggregator();
  const h = new HistoryTracker(ea);
  t.equal(h.currentUrl, '/');
  t.equal(h.currentIndex, 0);
  t.deepEqual(h.stack, [
    {title: '', url: '/'}
  ]);
  t.notOk(h.canGoBack);
  t.notOk(h.canGoForward);
});

test('HistoryTracker pushes state', t => {
  const ea = new EventAggregator();
  const h = new HistoryTracker(ea);
  h.pushState('new', '/new');
  t.equal(h.currentUrl, '/new');
  t.equal(h.currentIndex, 1);
  t.deepEqual(h.stack, [
    {title: '', url: '/'},
    {title: 'new', url: '/new'}
  ]);
  t.ok(h.canGoBack);
  t.notOk(h.canGoForward);
});

test('HistoryTracker replaces state', t => {
  const ea = new EventAggregator();
  const h = new HistoryTracker(ea);
  h.replaceState('new', '/new');
  t.equal(h.currentUrl, '/new');
  t.equal(h.currentIndex, 0);
  t.deepEqual(h.stack, [
    {title: 'new', url: '/new'}
  ]);
  t.notOk(h.canGoBack);
  t.notOk(h.canGoForward);
});

test('HistoryTracker pushes / replaces state', t => {
  const ea = new EventAggregator();
  const h = new HistoryTracker(ea);
  h.replaceState('new', '/new');
  h.pushState('one', '/one');
  h.pushState('two', '/two/2');
  h.pushState('three', '/three');
  h.replaceState('three bar', '/three/bar');
  t.equal(h.currentUrl, '/three/bar');
  t.equal(h.currentIndex, 3);
  t.deepEqual(h.stack, [
    {title: 'new', url: '/new'},
    {title: 'one', url: '/one'},
    {title: 'two', url: '/two/2'},
    {title: 'three bar', url: '/three/bar'}
  ]);

  t.ok(h.canGoBack);
  t.notOk(h.canGoForward);
});

test('HistoryTracker goes back and forward', t => {
  const ea = new EventAggregator();
  const h = new HistoryTracker(ea);
  h.replaceState('new', '/new');
  h.pushState('one', '/one');
  h.pushState('two', '/two/2');
  h.pushState('three', '/three');
  h.replaceState('three bar', '/three/bar');

  t.ok(h.canGoBack);
  t.notOk(h.canGoForward);

  h.go(1); // go forward is noop
  t.equal(h.currentUrl, '/three/bar');
  t.equal(h.currentIndex, 3);
  t.deepEqual(h.stack, [
    {title: 'new', url: '/new'},
    {title: 'one', url: '/one'},
    {title: 'two', url: '/two/2'},
    {title: 'three bar', url: '/three/bar'}
  ]);

  h.go(-1); // go back
  t.equal(h.currentUrl, '/two/2');
  t.equal(h.currentIndex, 2);
  t.deepEqual(h.stack, [
    {title: 'new', url: '/new'},
    {title: 'one', url: '/one'},
    {title: 'two', url: '/two/2'},
    {title: 'three bar', url: '/three/bar'}
  ]);

  t.ok(h.canGoBack);
  t.ok(h.canGoForward);

  h.go(-3); // go back 3 (capped to 2)
  t.equal(h.currentUrl, '/new');
  t.equal(h.currentIndex, 0);
  t.deepEqual(h.stack, [
    {title: 'new', url: '/new'},
    {title: 'one', url: '/one'},
    {title: 'two', url: '/two/2'},
    {title: 'three bar', url: '/three/bar'}
  ]);

  t.notOk(h.canGoBack);
  t.ok(h.canGoForward);

  // push to reset stack
  h.pushState('another', '/another');
  t.equal(h.currentUrl, '/another');
  t.equal(h.currentIndex, 1);
  t.deepEqual(h.stack, [
    {title: 'new', url: '/new'},
    {title: 'another', url: '/another'}
  ]);

  t.ok(h.canGoBack);
  t.notOk(h.canGoForward);

});

