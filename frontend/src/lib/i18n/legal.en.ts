import type { LegalDocument } from "./types";

// ---------------------------------------------------------------------------
// Legal documents — structured for locale-aware rendering in modals
// ---------------------------------------------------------------------------

export const privacyEn: LegalDocument = {
  title: "Privacy Policy",
  lastUpdated: "Sentra — Last Updated: March 2026",
  sections: [
    {
      title: "1. Introduction",
      content: [
        "Welcome to Sentra (\"Company,\" \"we,\" \"us,\" or \"our\"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Sentra browser extension and associated web services (collectively, the \"Service\").",
        "This Privacy Policy is designed to comply with applicable data protection laws, including relevant United States federal and state privacy laws, and the Socialist Republic of Vietnam's Decree No. 13/2023/ND-CP on Personal Data Protection (Decree 13).",
      ],
    },
    {
      title: "2. Information We Collect",
      content: [
        "We collect information that identifies, relates to, or could reasonably be linked to you (\"Personal Data\") in the following ways:",
        { subheading: "A. Information You Provide to Us" },
        { bullets: [
          "Account Information: When you register for an account, we may collect your email address and a username.",
          "Feedback and Support: If you contact us for support or submit manual threat reports, we collect the contents of your communications.",
        ]},
        { subheading: "B. Information We Collect Automatically" },
        "When you use the Extension, we automatically collect certain information to provide and improve our threat detection:",
        { bullets: [
          "Browsing Data: To detect phishing, the Extension analyzes URLs of the web pages you visit. We hash or anonymize this data whenever possible before it reaches our servers. We do not collect form inputs, passwords, or the full content of the web pages you visit.",
          "Device and Usage Information: We collect technical data such as your browser type, operating system version, and extension interaction events (e.g., when a warning is triggered or dismissed).",
        ]},
      ],
    },
    {
      title: "3. How We Use Your Information",
      content: [
        "We use the collected information for the following purposes:",
        { bullets: [
          "Providing the Service: To operate the Extension, detect malicious links, and display real-time warnings.",
          "Improving the Service: If you provide explicit consent, we use anonymized URL scan results to train and improve our machine-learning models.",
          "Account Management: To maintain your account and communicate with you regarding security updates, technical notices, and administrative messages.",
          "Legal Compliance: To comply with applicable laws, regulations, and legal processes in the US and Vietnam.",
        ]},
      ],
    },
    {
      title: "4. Data Sharing and Disclosure",
      content: [
        "We do not sell your Personal Data. We may share your information only in the following circumstances:",
        { bullets: [
          "Service Providers: We may share data with trusted third-party vendors who assist us in operating our infrastructure (e.g., cloud hosting), subject to strict confidentiality agreements.",
          "Legal Obligations: We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency in the US or Vietnam).",
        ]},
      ],
    },
    {
      title: "5. User Rights and Choices",
      content: [
        "Depending on your location, you have specific rights regarding your Personal Data:",
        { subheading: "A. US State Privacy Rights" },
        "Residents of certain US states (e.g., California, Virginia, Colorado) may have the right to request access to, correction of, or deletion of their Personal Data, as well as the right to opt-out of certain data processing.",
        { subheading: "B. Vietnam Decree 13 Rights" },
        "Under Vietnam's Decree 13, users have the right to:",
        { bullets: [
          "Be informed about the processing of their Personal Data.",
          "Give, withdraw, or refuse consent for data processing.",
          "Access, edit, or request the deletion of their Personal Data.",
          "Restrict or object to the processing of their Personal Data.",
        ]},
        "To exercise any of these rights, or to withdraw your consent for us to use your anonymized data for machine learning training, please contact us at the email provided below or use the options available in your account settings.",
      ],
    },
    {
      title: "6. Data Security",
      content: [
        "We implement appropriate technical and organizational measures to protect your Personal Data against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is entirely secure, and we cannot guarantee absolute security.",
      ],
    },
    {
      title: "7. Data Retention",
      content: [
        "We retain your Personal Data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Account data is deleted upon account termination, subject to legal obligations.",
      ],
    },
    {
      title: "8. Children's Privacy (COPPA Compliance)",
      content: [
        "Our Service is not directed to children under the age of 13. We do not knowingly collect Personal Data from children under 13. If we become aware that we have collected Personal Data from a child under 13 without verification of parental consent, we will take steps to remove that information from our servers immediately.",
      ],
    },
    {
      title: "9. International Data Transfers",
      content: [
        "Sentra operates primarily in the United States and Vietnam. By using the Service, you acknowledge that your information may be transferred to, stored, and processed in countries outside of your country of residence, where data protection laws may differ. We ensure appropriate safeguards are in place to protect your data during such transfers.",
      ],
    },
    {
      title: "10. Changes to This Privacy Policy",
      content: [
        "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the \"Last Updated\" date. We may also notify you via email or through the Extension.",
      ],
    },
    {
      title: "11. Contact Us",
      content: [
        "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at: Sentra Support Team — cyberlab.dev@gmail.com",
      ],
    },
  ],
  footer: "Privacy Policy — Last Updated: March 2026",
};

export const termsEn: LegalDocument = {
  title: "Terms & Agreements",
  lastUpdated: "Sentra — Last updated March 2026",
  sections: [
    {
      title: "1. Acceptance of Terms",
      content: [
        "By installing, accessing, or utilizing the Sentra browser extension (\"Extension\") or its accompanying web services (\"Service\"), you (\"User\") agree to be bound by these Terms & Agreements (\"Terms\"). If you do not consent to these Terms in their entirety, you must immediately cease using and uninstall the Extension and Service. This document forms a legally binding contract between you and Sentra (\"Company,\" \"we,\" \"us,\" or \"our\").",
      ],
    },
    {
      title: "2. Description of Service",
      content: [
        "Sentra provides a real-time security browser extension designed to identify and alert users to potential phishing websites, malicious links, and deceptive online content. The Service evaluates web page safety using machine-learning algorithms, URL analysis, domain reputation tracking, and community feedback.",
        "Operating as a client-side application, the Extension communicates with our servers to access threat intelligence and securely submit anonymized URL scan data. The Service is offered on an \"as-is\" basis and undergoes continuous updates to optimize threat detection capabilities.",
      ],
    },
    {
      title: "3. Eligibility",
      content: [
        "You must be at least 13 years old to use the Service. If you are between the ages of 13 and 18, you confirm that a parent or legal guardian has reviewed and consented to these Terms on your behalf. By using Sentra, you represent and warrant that you meet these eligibility requirements.",
      ],
    },
    {
      title: "4. User Account & Registration",
      content: [
        "Accessing certain features of the Service requires account registration. You agree to provide and maintain accurate, current, and complete information. You are solely responsible for protecting your account credentials and for all activities that occur under your account.",
        "If you suspect any unauthorized access to your account, you must notify us immediately at cyberlab.dev@gmail.com. Sentra assumes no liability for losses resulting from compromised account credentials.",
      ],
    },
    {
      title: "5. Data Collection & Privacy",
      content: [
        "Your privacy is important to us. Your use of the Service is subject to our Privacy Policy, which is incorporated into these Terms by reference. By using Sentra, you consent to our data practices:",
        "Data We Collect: Hashed or anonymized URLs of visited pages, extension interaction metrics, device details (such as operating system and browser type), and voluntarily provided account data.",
        "Data We Exclude: We explicitly do not collect passwords, form inputs, financial data, or the full content of any web page. We will never sell your personal data.",
        "Training Data: With your explicit opt-in consent, anonymized URL scans may be utilized to refine our machine-learning models. You retain the right to withdraw this consent at any time via your account settings.",
      ],
    },
    {
      title: "6. Permitted Use",
      content: [
        "You agree to use Sentra strictly for lawful, intended purposes. You are expressly prohibited from:",
        { bullets: [
          "Reverse-engineering, decompiling, or disassembling the Extension or backend infrastructure.",
          "Leveraging the Service to execute phishing, fraud, or any malicious activities.",
          "Disrupting, overburdening, or interfering with the Service's integrity or performance.",
          "Submitting fraudulent threat reports or manipulating the feedback system to penalize legitimate websites.",
          "Bypassing or disabling any security protocols within the Service.",
          "Scraping or harvesting data from the Service without prior written authorization.",
        ]},
      ],
    },
    {
      title: "7. Intellectual Property",
      content: [
        "Sentra retains all rights, title, and interest in the Extension, Service, underlying software, machine-learning models, trademarks, and documentation. These Terms grant you a limited, non-exclusive, revocable license to use the Service; they do not convey any ownership rights.",
        "While you retain ownership of any original manual threat reports you submit, you grant Sentra a perpetual, worldwide, royalty-free license to utilize, modify, and integrate that content into the Service.",
      ],
    },
    {
      title: "8. Disclaimers & Limitation of Liability",
      content: [
        "THE SERVICE IS PROVIDED STRICTLY ON AN \"AS IS\" AND \"AS AVAILABLE\" BASIS WITHOUT EXPRESS OR IMPLIED WARRANTIES OF ANY KIND. Sentra cannot guarantee the detection of every malicious site or phishing attempt, as no security mechanism is entirely infallible. You acknowledge that Sentra is not liable for any direct or indirect damages resulting from your reliance on the Extension.",
        "TO THE MAXIMUM EXTENT PERMITTED BY LAW, SENTRA'S TOTAL CUMULATIVE LIABILITY SHALL NOT EXCEED THE GREATER OF (A) THE TOTAL FEES PAID BY YOU IN THE PRECEDING 12 MONTHS, OR (B) $50 USD.",
      ],
    },
    {
      title: "9. Indemnification",
      content: [
        "You agree to indemnify, defend, and hold harmless Sentra, its directors, employees, and agents from any claims, damages, liabilities, and expenses (including legal fees) arising from your use of the Service, your breach of these Terms, or your violation of any third-party rights.",
      ],
    },
    {
      title: "10. Termination",
      content: [
        "We reserve the right to suspend or terminate your access to the Service at our sole discretion, at any time, and without prior notice or liability, particularly in cases of Terms violations.",
      ],
    },
    {
      title: "11. Changes to These Terms",
      content: [
        "Sentra may modify these Terms periodically. In the event of material changes, we will provide at least 14 days' notice via email or an in-extension alert before the updates take effect. Continued use of the Service following this period constitutes your acceptance of the new Terms.",
      ],
    },
    {
      title: "12. Governing Law & Dispute Resolution",
      content: [
        "These Terms shall be governed by the laws of the jurisdiction where Sentra is incorporated. Any disputes arising from these Terms will first be addressed through good-faith negotiations. If a resolution cannot be reached, the dispute will be settled through binding arbitration.",
      ],
    },
    {
      title: "13. Contact",
      content: [
        "For any questions or concerns regarding these Terms, please reach out to us: Sentra Support Team — cyberlab.dev@gmail.com",
      ],
    },
  ],
  footer: "End of Terms & Agreements — Version 1.0",
};
