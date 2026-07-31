/**
 * TEMPLATE — starter Terms of Service copy of the kind commonly used by consumer
 * social/travel apps. It is NOT legal advice and has not been reviewed by a
 * lawyer. Have counsel review and customize (governing law, company details,
 * dispute resolution, etc.) before public launch.
 */
import { COMPANY_NAME, SUPPORT_EMAIL } from '@/brand/brand';
import { LegalP, LegalScreen, LegalSection } from '@/components/ui/LegalScreen';

export default function TermsScreen() {
  return (
    <LegalScreen title="Terms of Service">
      <LegalP>
        Welcome to {COMPANY_NAME}. These Terms of Service (&quot;Terms&quot;) govern your access to
        and use of the {COMPANY_NAME} mobile application and related services (the &quot;Service&quot;).
        By creating an account or using the Service, you agree to be bound by these Terms. If you do
        not agree, do not use the Service.
      </LegalP>

      <LegalSection heading="1. Eligibility">
        <LegalP>
          You must be at least 18 years old, or the age of majority in your jurisdiction, to create
          an account and use the Service. By using {COMPANY_NAME} you represent that you meet this
          requirement and that the information you provide is accurate and complete.
        </LegalP>
      </LegalSection>

      <LegalSection heading="2. Your Account">
        <LegalP>
          You are responsible for maintaining the confidentiality of your login credentials and for
          all activity that occurs under your account. Notify us promptly of any unauthorized use.
          You may not share your account, impersonate others, or provide false information.
        </LegalP>
      </LegalSection>

      <LegalSection heading="3. Acceptable Use">
        <LegalP>
          {COMPANY_NAME} is a place to connect respectfully with fellow travellers. You agree not to
          harass, threaten, defraud, or harm other users; post unlawful, hateful, or sexually
          explicit content; solicit money; spam; or use the Service for any illegal purpose. We may
          remove content and suspend or terminate accounts that violate these Terms.
        </LegalP>
      </LegalSection>

      <LegalSection heading="4. Connecting with Other Travellers">
        <LegalP>
          {COMPANY_NAME} helps you discover and message other passengers, but we do not verify the
          identity, background, or intentions of any user beyond the features described in the app.
          You are solely responsible for your interactions with others. Use good judgment, meet in
          public where appropriate, and never share sensitive personal or financial information. Any
          meeting or arrangement is at your own risk.
        </LegalP>
      </LegalSection>

      <LegalSection heading="5. Your Content">
        <LegalP>
          You retain ownership of the content you submit (such as your profile details, photo, and
          messages). You grant {COMPANY_NAME} a non-exclusive, worldwide, royalty-free license to
          host, store, and display that content solely to operate and provide the Service. You are
          responsible for the content you share and must have the rights to share it.
        </LegalP>
      </LegalSection>

      <LegalSection heading="6. Flight Information">
        <LegalP>
          Flight schedules, statuses, and related data are provided by third-party sources and may be
          inaccurate, incomplete, or delayed. {COMPANY_NAME} does not guarantee the accuracy of this
          information and is not responsible for any decisions you make based on it. Always confirm
          details with your airline.
        </LegalP>
      </LegalSection>

      <LegalSection heading="7. Intellectual Property">
        <LegalP>
          The Service, including its software, design, logos, and content (excluding user content),
          is owned by {COMPANY_NAME} and protected by intellectual property laws. You may not copy,
          modify, distribute, or reverse engineer any part of the Service without our permission.
        </LegalP>
      </LegalSection>

      <LegalSection heading="8. Termination">
        <LegalP>
          You may stop using the Service and delete your account at any time from within the app. We
          may suspend or terminate your access if you violate these Terms or if we discontinue the
          Service. Upon termination, your right to use the Service ends.
        </LegalP>
      </LegalSection>

      <LegalSection heading="9. Disclaimers">
        <LegalP>
          The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties
          of any kind, whether express or implied, including fitness for a particular purpose and
          non-infringement. We do not warrant that the Service will be uninterrupted, secure, or
          error-free.
        </LegalP>
      </LegalSection>

      <LegalSection heading="10. Limitation of Liability">
        <LegalP>
          To the maximum extent permitted by law, {COMPANY_NAME} and its affiliates will not be
          liable for any indirect, incidental, special, consequential, or punitive damages, or for
          any loss arising from your use of the Service or your interactions with other users.
        </LegalP>
      </LegalSection>

      <LegalSection heading="11. Changes to These Terms">
        <LegalP>
          We may update these Terms from time to time. If we make material changes, we will notify
          you within the app or by email. Your continued use of the Service after changes take effect
          constitutes acceptance of the revised Terms.
        </LegalP>
      </LegalSection>

      <LegalSection heading="12. Contact">
        <LegalP>
          Questions about these Terms? Contact us at {SUPPORT_EMAIL}.
        </LegalP>
      </LegalSection>
    </LegalScreen>
  );
}
