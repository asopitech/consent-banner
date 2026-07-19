import {cleanupGaCookies} from '../src/cookie-cleanup';
test('does not throw',()=>{expect(()=>cleanupGaCookies()).not.toThrow()});
