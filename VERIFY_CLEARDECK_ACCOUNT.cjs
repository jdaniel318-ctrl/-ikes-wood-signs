#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(process.argv[2]||__dirname),source=fs.readFileSync(path.join(root,'owner.html'),'utf8');
let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS',name);}catch(e){failed++;console.error('FAIL',name,e.message);}}
const start=source.indexOf('// Cleardeck account messages begin'),end=source.indexOf('// Cleardeck account messages end');
const c={};if(start>=0&&end>start)vm.runInNewContext(source.slice(start,end),c);
check('pure account-message helpers available',()=>assert.equal(typeof c.accountSecurityFailure,'function'));
if(typeof c.accountSecurityFailure==='function'){
 const message=(code,extras={})=>c.accountSecurityFailure({code,...extras});
 for(const [name,rows,expected] of [
  ['empty',[],'Signed in — no active vessel assignments'],
  ['pending',[{status:'pending'}],'Pending Captain appointment — no operating access yet'],
  ['accepted',[{status:'accepted'}],'Appointed Captain — assigned vessels only'],
  ['suspended',[{status:'suspended'}],'Signed in — no active vessel assignments'],
  ['revoked',[{status:'revoked'}],'Signed in — no active vessel assignments'],
  ['accepted but revocation marker',[{status:'accepted',revoked_at:'2026-10-26'}],'Signed in — no active vessel assignments'],
  ['mixed',[{status:'pending'},{status:'accepted'}],'Appointed Captain — assigned vessels only'],
  ['null',null,'Signed in — no active vessel assignments']
 ])check('role '+name,()=>assert.equal(c.captainAccountLabel(rows),expected));
 check('same password remedy',()=>assert.match(message('same_password'),/matches your current password/));
 check('same password has no generic email/code instruction',()=>assert.doesNotMatch(message('same_password'),/email|security code/i));
 check('legacy same-password message recognized',()=>assert.match(c.accountSecurityFailure({message:'New password should be different from the old password.'}),/matches your current password/));
 check('weak password guidance',()=>assert.match(message('weak_password'),/stronger/));
 check('reauthentication needed guidance',()=>assert.match(message('reauthentication_needed'),/EMAIL SECURITY CODE/));
 check('missing nonce guidance',()=>assert.match(message('reauth_nonce_missing'),/EMAIL SECURITY CODE/));
 check('invalid reauth code guidance',()=>assert.match(message('reauthentication_not_valid'),/newest/));
 check('expired code guidance',()=>assert.match(message('otp_expired'),/newest/));
 for(const code of ['bad_jwt','session_expired','session_not_found','no_authorization'])check('session '+code,()=>assert.match(message(code),/Sign in again/));
 check('HTTP 401 session',()=>assert.match(message('',{status:401}),/Sign in again/));
 check('rate limit',()=>assert.match(message('over_request_rate_limit'),/wait/i));
 check('HTTP rate limit',()=>assert.match(message('',{status:429}),/wait/i));
 check('weak password not generic login loop',()=>assert.doesNotMatch(message('weak_password'),/email link|security code/i));
 check('current password requirement',()=>assert.match(message('current_password_required'),/current password/i));
 check('identity mismatch no success',()=>assert.match(message('account_identity_mismatch'),/not match/));
 check('network uncertainty',()=>assert.match(message('',{name:'TypeError',message:'Failed to fetch'}),/could not be confirmed/));
 check('timeout no blind retry',()=>assert.match(message('',{message:'request timed out'}),/Do not submit repeatedly/));
 check('unknown payload not echoed',()=>assert(!message('unexpected_error',{message:'SECRET_PASSWORD_AND_JWT'}).includes('SECRET_PASSWORD_AND_JWT')));
 check('unknown no misleading reauth',()=>assert.doesNotMatch(message('unexpected_error'),/EMAIL SECURITY CODE|fresh email link/));
 check('unexpected response not success',()=>assert.match(message('unexpected_error'),/not confirmed/i));
}
check('no blanket reauthentication suffix',()=>assert(!source.includes('. If recent sign-in is required, request a fresh email link or a security code.')));
check('error handler delegates specific message',()=>assert(source.includes('say(accountSecurityFailure(error))')));
check('code preserved for diagnosis',()=>assert(source.includes('result?.error_code')));
check('same-account success check retained',()=>assert(source.includes("result?.id!==person?.id")));
check('password policy retained',()=>assert(source.includes('password.length<12||password.length>128')));
check('Captain session key retained',()=>assert(source.includes('darkSkySupabaseVesselCaptainSessionV1')));
check('separate owner session key retained',()=>assert(source.includes('darkSkySupabaseOwnerSessionV1')));
check('password form autofill permitted',()=>assert(/id="captainPasswordForm"[^>]*autocomplete="on"/.test(source)));
check('change-password username linked',()=>assert(/id="captainSecurityEmail"[^>]*name="username"[^>]*autocomplete="username"/.test(source)));
check('login username metadata',()=>assert(/id="captainLoginEmail"[^>]*name="username"/.test(source)));
check('login password metadata',()=>assert(/id="captainLoginPassword"[^>]*name="password"[^>]*autocomplete="current-password"/.test(source)));
check('new password metadata',()=>assert(/id="captainNewPassword"[^>]*name="new_password"[^>]*autocomplete="new-password"/.test(source)));
check('confirmation metadata',()=>assert(/id="captainConfirmPassword"[^>]*name="confirm_new_password"/.test(source)));
check('shared-device warning',()=>assert(source.includes('Do not save credentials on a shared shop device.')));
console.log(`CLEARDECK ACCOUNT: ${passed} passed; ${failed} failed`);process.exitCode=failed?1:0;
