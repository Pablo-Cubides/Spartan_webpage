
/* eslint-disable react/no-unescaped-entities */

export default function PrivacidadPage() {
  return (
    <main className="px-6 py-12 mx-auto max-w-4xl text-white">
      <h1 className="text-3xl font-bold mb-6 text-[#C62828]">Privacy Policy — Spartan Club</h1>
      <div className="space-y-6 text-[#a2aab3]">
        <p className="text-sm">Last update: 18/Nov/2025</p>
        <p><strong className="text-white">Responsible:</strong> Andrés Guerrero — <strong className="text-white">Contact:</strong> spartanmarket@gmail.com</p>

        <div className="bg-[#181a1d] p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Quick summary (short layer)</h2>
            <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-white">What we collect:</strong> email, alias, name, age (if registered); basic technical data (e.g., IP/UA) for security; preferences (newsletter).</li>
                <li><strong className="text-white">For what:</strong> create/manage your account, send requested communications, improve content, protect the site.</li>
                <li><strong className="text-white">With whom:</strong> technology providers (e.g., Vercel, Firebase, Brevo and analytics/marketing tools we may integrate).</li>
                <li><strong className="text-white">Payments:</strong> if you buy in third-party apps, processing is done by that third party (we do not store your card data).</li>
                <li><strong className="text-white">Your rights:</strong> access, update, delete and object to certain processing.</li>
                <li><strong className="text-white">Retention:</strong> if you request to delete your account, we will delete it within ≤30 days (backups may take longer to rotate).</li>
                <li><strong className="text-white">Minors:</strong> 18+ site. If we detect a minor's account, we close it and delete associated data.</li>
            </ul>
        </div>

        <h2 className="text-2xl font-bold text-white pt-4">1. Data we process</h2>
        <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-white">Account/registration (if applicable):</strong> email, alias, name, age.</li>
            <li><strong className="text-white">Google login:</strong> we receive minimal necessary data (identifier, verified email, name/alias) through Firebase.</li>
            <li><strong className="text-white">Communications:</strong> your email for newsletter (if you subscribe) and operational messages.</li>
            <li><strong className="text-white">Technical data:</strong> IP and user-agent for security/anti-abuse, analytics and diagnostics.</li>
            <li><strong className="text-white">Payments in apps:</strong> if you pay in a third-party app or store, the third party processes your payment; Spartan Club does not store card numbers.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white pt-4">2. Purposes and legal bases</h2>
        <p>Legal bases: performance of the service; consent (newsletter, certain tracers); legitimate interest (security, minimal metrics), and compliance with legal obligations where applicable.</p>

        <h2 className="text-2xl font-bold text-white pt-4">3. Analytics, trackers and third parties</h2>
        <p>We may use analytics/marketing tools (e.g., Google Analytics, PostHog or equivalents) and email sending services (e.g., Brevo). These tools may use identifiers or cookies. We will maintain an updated list of providers and cookies on an information page. If your country requires prior consent, we will display a cookie notice to accept or reject them.</p>

        <h2 className="text-2xl font-bold text-white pt-4">4. Providers and transfers</h2>
        <p>Hosting and delivery: Vercel. Authentication: Firebase (Google). Email marketing/transactional: Brevo or other similar provider. These providers may be outside your country; we apply reasonable contractual and technical measures to protect your data.</p>

        <h2 className="text-2xl font-bold text-white pt-4">5. Retention</h2>
        <p>Account and profile: while active or until you delete it; once you request cancellation, we delete it within ≤30 days. Newsletter: while you maintain the subscription. Technical/security logs: for a reasonable time (e.g., up to 12 months).</p>

        <h2 className="text-2xl font-bold text-white pt-4">6. Your rights</h2>
        <p>You can exercise: access, update, rectification, deletion and opposition. Request it by writing to spartanmarket@gmail.com from the email associated with your account.</p>

        <h2 className="text-2xl font-bold text-white pt-4">7. Minors</h2>
        <p>Spartan Club is for ages 18 and over only. If we detect data from minors, we will delete the account.</p>

        <h2 className="text-2xl font-bold text-white pt-4">8. Security</h2>
        <p>We apply reasonable measures: encryption in transit (HTTPS), good password practices and access controls. No system is infallible.</p>

        <h2 className="text-2xl font-bold text-white pt-4">9. Changes to this policy</h2>
        <p>We may update it. We will publish the current version and, if the change is relevant, we will notify you on the site or by email.</p>

        <h2 className="text-2xl font-bold text-white pt-4">10. Contact</h2>
        <p>Questions or privacy requests: spartanmarket@gmail.com</p>
      </div>
    </main>
  );
}
