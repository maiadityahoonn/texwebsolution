import {
  getFirebaseAccessToken,
  getFirebaseAdminEnvironment,
  validateFirebaseAdminEnvironment,
  validateFirebaseMessagingAccess,
} from "@/lib/firebaseAdminMessaging";

export async function checkFirebaseAdminConfiguration() {
  const environment = getFirebaseAdminEnvironment();
  const environmentCheck = validateFirebaseAdminEnvironment(environment);
  if (!environmentCheck.ready) {
    return {
      ok: false,
      environment: environmentCheck,
      google_oauth: { ok: false, code: "not_attempted" },
      fcm_http_v1: { ok: false, code: "not_attempted" },
    };
  }

  const oauth = await getFirebaseAccessToken(environment);
  if (!oauth.ok) {
    return {
      ok: false,
      environment: environmentCheck,
      google_oauth: oauth,
      fcm_http_v1: { ok: false, code: "not_attempted" },
    };
  }

  const fcm = await validateFirebaseMessagingAccess(environment, oauth.accessToken);
  return {
    ok: fcm.ok,
    environment: environmentCheck,
    google_oauth: { ok: true, code: "authenticated" },
    fcm_http_v1: fcm,
  };
}
