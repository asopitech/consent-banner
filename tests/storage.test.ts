import {ConsentStorage} from '../src/storage';
test('stores and restores consent',()=>{const s=new ConsentStorage('k','1'); expect(s.read().state).toBe('unknown'); s.save('granted'); expect(s.read().state).toBe('granted')});
test('version mismatch is unknown',()=>{new ConsentStorage('k','1').save('denied'); expect(new ConsentStorage('k','2').read().state).toBe('unknown')});
test('broken json is unknown',()=>{localStorage.setItem('k','{'); expect(new ConsentStorage('k','1').read().state).toBe('unknown')});
