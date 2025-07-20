import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-md">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Last updated: July 9, 2025
        </p>
      </header>
      <section className="space-y-4 text-slate-700">
        <p>
          This Privacy Policy describes Our policies and procedures on the
          collection, use and disclosure of Your information when You use the
          Service and tells You about Your privacy rights and how the law
          protects You.
        </p>
        <p>
          <strong>Disclaimer:</strong> This is a template and not legal advice.
          You should consult with a legal professional to ensure compliance with
          all applicable laws and regulations.
        </p>
        <h2 className="text-2xl font-semibold text-slate-800 pt-4 mt-4 border-t">
          Information We Collect
        </h2>
        <p>
          When you use our Service, we collect the information you provide in
          the gift recommendation form, including age, relationship, occasion,
          interests, and budget. We do not require personal information like
          your name or email address. We also use analytics tools that may
          collect anonymous data about your device and Browse activity.
        </p>
        <h2 className="text-2xl font-semibold text-slate-800 pt-4 mt-4 border-t">
          How We Use Your Information
        </h2>
        <p>
          The information you provide is sent to a third-party AI service
          (OpenAI) to generate gift suggestions. We do not store your form
          inputs on our servers. Anonymous data collected through analytics is
          used to improve our Service.
        </p>
        <h2 className="text-2xl font-semibold text-slate-800 pt-4 mt-4 border-t">
          Third-Party Services
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>OpenAI:</strong> Your anonymized gift preferences are sent
            to the OpenAI API to generate suggestions.
          </li>
          <li>
            <strong>Vercel & Google Analytics:</strong> We use these services to
            analyze website traffic and user behavior to improve our
            application.
          </li>
          <li>
            <strong>Amazon Associates:</strong> Our website contains affiliate
            links. If you click on a "View Details" link and make a purchase, we
            may earn a commission at no extra cost to you.
          </li>
        </ul>
        <h2 className="text-2xl font-semibold text-slate-800 pt-4 mt-4 border-t">
          Cookies
        </h2>
        <p>
          We do not use cookies for tracking purposes. Third-party services like
          Vercel and Google Analytics may use cookies to function.
        </p>
        <h2 className="text-2xl font-semibold text-slate-800 pt-4 mt-4 border-t">
          Contact Us
        </h2>
        <p>
          If you have any questions about this Privacy Policy, you can contact
          us through the Contact page on our website.
        </p>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
