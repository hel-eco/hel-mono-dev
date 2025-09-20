import { hello } from '@h1/utils';

test('hello', () => {
  expect(hello().includes('hello')).toBeTruthy();
});
