import { useParams, Link } from 'react-router-dom';
import SEO from '@/components/seo';

const legalContent: Record<string, { title: string; body: string }> = {
  terms: {
    title: 'Terms & Conditions',
    body: 'Effective Date: 01/04/2024\n\nWelcome to ETaxwala! These Terms & Conditions govern your access and use of our website and services. By using ETaxwala, you agree to comply with these Terms.\n\n1. About ETaxwala\nETaxwala is an online platform providing business registration, taxation, audit, and compliance services. We act as a facilitator between users and government systems.\n\n2. User Eligibility\nYou must be 18+ to use our services.\n\n3. Services & Payment\nFees are displayed at the time of service selection. Payment must be made before service initiation.\n\n4. User Responsibilities\nYou must provide accurate and complete information. ETaxwala is not responsible for delays caused by incorrect information.\n\n5. Service Delivery & Timelines\nService timelines are indicative and depend on government processing times.\n\n6. Refund Policy\nSee our Refund Policy page for details.\n\n7. Limitation of Liability\nETaxwala is not liable for government delays or rejections.\n\n8. Intellectual Property\nAll content is owned by ETaxwala. Unauthorized use is prohibited.\n\n9. Governing Law\nThese Terms are governed by Indian Laws. Disputes subject to Aurangabad, Maharashtra jurisdiction.',
  },
  privacy: {
    title: 'Privacy Policy',
    body: 'Effective Date: 01/04/2024\n\nYour privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.\n\n1. Information We Collect\nPersonal: Name, email, phone, address, business details.\nNon-Personal: Browser type, IP address, usage data.\n\n2. How We Use Your Information\nTo provide services, process payments, send updates, and improve our platform.\n\n3. Sharing of Information\nWe do not sell your data. We may share with government authorities as required for compliance services.\n\n4. Data Security\nWe implement industry-standard security measures including encryption and secure servers.\n\n5. Your Rights\nYou can access, correct, or delete your data. Email support@etaxwala.com to exercise these rights.\n\n6. Cookies\nWe use cookies to improve browsing experience.\n\n7. Contact\nEmail: support@etaxwala.com',
  },
  refund: {
    title: 'Refund Policy',
    body: 'Effective Date: 01/04/2024\n\n1. General Policy\nOnce a service has been initiated or completed, no refund will be provided except in specific cases.\n\n2. Eligible Refunds\n- Service not started and requested within 7 working days\n- Double payment\n- Service unavailable\n\n3. Non-Refundable\n- Government fees already paid\n- Services in progress\n- Completed services\n\n4. Refund Process\nEmail support@etaxwala.com with subject "Refund Request - [Service Name]". Include your name, email, and service details. Processing time: 7-10 working days.\n\n5. Cancellation\nOnce payment is made and service started, cancellation is not possible unless agreed in writing.\n\n6. Contact\nEmail: support@etaxwala.com',
  },
};

export default function LegalPage() {
  const { type } = useParams();
  const content = legalContent[type || 'terms'] || legalContent.terms;

  return (
    <>
      <SEO title={content.title} description={`${content.title} - ETaxwala Business Solutions`} url={`/legal/${type}`} />
      <section className="bg-primary-700 py-16 text-white">
        <div className="container-etaxwala">
          <h1 className="text-3xl font-bold lg:text-4xl">{content.title}</h1>
        </div>
      </section>
      <section className="section">
        <div className="container-etaxwala max-w-3xl">
          <div className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {content.body}
          </div>
          <div className="mt-8 flex gap-4 text-sm">
            <Link to="/legal/terms" className="text-primary hover:underline">Terms</Link>
            <Link to="/legal/privacy" className="text-primary hover:underline">Privacy</Link>
            <Link to="/legal/refund" className="text-primary hover:underline">Refund</Link>
          </div>
        </div>
      </section>
    </>
  );
}