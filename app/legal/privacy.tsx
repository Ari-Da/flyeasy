/**
 * TEMPLATE — starter Privacy Policy copy of the kind commonly used by consumer
 * social/travel apps. It is NOT legal advice and has not been reviewed by a
 * lawyer. Confirm it accurately reflects your actual data practices and have
 * counsel review it (GDPR/CCPA specifics, data processors, retention, etc.)
 * before public launch.
 */
import { COMPANY_NAME, SUPPORT_EMAIL } from '@/brand/brand';
import { LegalP, LegalScreen, LegalSection } from '@/components/ui/LegalScreen';

export default function PrivacyScreen() {
  return (
    <LegalScreen title="Privacy Policy">
      <LegalP>
        This Privacy Policy explains how {COMPANY_NAME} collects, uses, and shares information when
        you use our mobile application and services (the &quot;Service&quot;). By using the Service,
        you agree to the practices described here.
      </LegalP>

      <LegalSection heading="1. Information We Collect">
        <LegalP>
          Account information you provide, such as your name, email address, and password. Profile
          information, such as your photo, bio, and availability status. Travel information, such as
          the flights you add and related itinerary details. Content you create, such as messages and
          connection requests. Basic technical and usage information needed to operate the app.
        </LegalP>
      </LegalSection>

      <LegalSection heading="2. How We Use Information">
        <LegalP>
          We use your information to provide and improve the Service — to create and secure your
          account, match you with other passengers on the same flight, enable connections and
          messaging, display your profile to relevant users, provide support, and keep the Service
          safe.
        </LegalP>
      </LegalSection>

      <LegalSection heading="3. How We Share Information">
        <LegalP>
          With other users: your name, photo, and profile details are visible to other verified
          passengers on your flights so you can connect. With service providers: we use trusted
          third parties to host data and provide functionality (for example, our backend and
          authentication provider, and a flight-data provider); they process information on our
          behalf. For legal reasons: we may disclose information if required by law or to protect
          the rights and safety of our users. We do not sell your personal information.
        </LegalP>
      </LegalSection>

      <LegalSection heading="4. Data Storage & Security">
        <LegalP>
          Your information is stored with our backend provider and transmitted over encrypted
          connections. We take reasonable measures to protect your data, but no method of
          transmission or storage is completely secure, and we cannot guarantee absolute security.
        </LegalP>
      </LegalSection>

      <LegalSection heading="5. Data Retention">
        <LegalP>
          We keep your information for as long as your account is active or as needed to provide the
          Service. When you delete your account, we delete or anonymize your personal information,
          except where we are required to retain it for legal or legitimate business purposes.
        </LegalP>
      </LegalSection>

      <LegalSection heading="6. Your Rights & Choices">
        <LegalP>
          You can access and update your profile information in the app at any time. You can delete
          your account and associated data from Settings, which permanently removes your profile,
          flights, and connections. Depending on where you live, you may have additional rights to
          access, correct, or export your data — contact us to exercise them.
        </LegalP>
      </LegalSection>

      <LegalSection heading="7. Children's Privacy">
        <LegalP>
          The Service is not intended for anyone under 18, and we do not knowingly collect personal
          information from children. If you believe a child has provided us information, contact us
          and we will delete it.
        </LegalP>
      </LegalSection>

      <LegalSection heading="8. International Users">
        <LegalP>
          Your information may be processed and stored in countries other than your own, which may
          have different data protection laws. By using the Service, you consent to this transfer.
        </LegalP>
      </LegalSection>

      <LegalSection heading="9. Changes to This Policy">
        <LegalP>
          We may update this Privacy Policy from time to time. If we make material changes, we will
          notify you within the app or by email. Your continued use of the Service after changes take
          effect constitutes acceptance of the updated policy.
        </LegalP>
      </LegalSection>

      <LegalSection heading="10. Contact">
        <LegalP>
          Questions about your privacy or this policy? Contact us at {SUPPORT_EMAIL}.
        </LegalP>
      </LegalSection>
    </LegalScreen>
  );
}
