import {isValidMeasurementId,validatePolicyUrl,resolveLanguage} from '../src/config';
test('measurement id validation',()=>{expect(isValidMeasurementId('G-ABC123')).toBe(true); expect(isValidMeasurementId('UA-1')).toBe(false)});
test('policy url validation rejects unsafe protocols',()=>{expect(validatePolicyUrl('javascript:alert(1)')).toBeNull(); expect(validatePolicyUrl('/privacy/')).toBe('/privacy/'); expect(validatePolicyUrl('https://example.com/p')).toBe('https://example.com/p')});
test('language resolution supports Japanese',()=>{document.documentElement.lang='ja-JP'; expect(resolveLanguage('auto')).toBe('ja')});
