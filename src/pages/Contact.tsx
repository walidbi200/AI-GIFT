import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser";
import Button from "../components/Button";
import Toast from "../components/Toast";
import type { ToastType } from "../types";
import { useGoogleAnalytics } from "../hooks/useGoogleAnalytics";

const Contact: React.FC = () => {
  const { trackFormSubmission } = useGoogleAnalytics();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Update document title for SEO
    document.title = "Contact Us - Smart Gift Finder | Get in Touch";

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Get in touch with the Smart Gift Finder team. We'd love to hear from you - whether you have feedback, questions, or just want to say hello. Contact us today!",
      );
    }
  }, []);

  const showToastMessage = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      showToastMessage("Please enter your name", "error");
      return false;
    }
    if (!formData.email.trim()) {
      showToastMessage("Please enter your email", "error");
      return false;
    }
    if (!formData.email.includes("@")) {
      showToastMessage("Please enter a valid email address", "error");
      return false;
    }
    if (!formData.message.trim()) {
      showToastMessage("Please enter your message", "error");
      return false;
    }
    if (formData.message.trim().length < 10) {
      showToastMessage("Message must be at least 10 characters long", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Get credentials from environment variables
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      showToastMessage(
        "Contact form is not configured. Please contact us directly.",
        "error",
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        to_email: import.meta.env.VITE_EMAILJS_TO_EMAIL,
      };

      // Send email using EmailJS with environment variables
      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      showToastMessage(
        "Thank you for your message! We'll get back to you soon.",
        "success",
      );
      setIsSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      trackFormSubmission("contact");
    } catch (error) {
      showToastMessage(
        "Failed to send message. Please try again or email us directly at Bichriwalid1@gmail.com",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-8 font-sans">
        <section className="w-full max-w-2xl">
          <header className="text-center mb-12">
            <Link to="/" className="inline-block mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                🎁 Smart Gift Finder
              </h1>
            </Link>
          </header>
          <section className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Message Sent Successfully!
              </h2>
              <p className="text-slate-600 mb-6">
                Thank you for reaching out to us. We've received your message
                and will get back to you as soon as possible.
              </p>
            </div>
            <div className="space-y-4">
              <Link to="/">
                <Button variant="primary" fullWidth>
                  🏠 Back to Home
                </Button>
              </Link>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Send another message
              </button>
            </div>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-8 font-sans">
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <section className="w-full max-w-2xl">
        <header className="text-center mb-10">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 hover:text-indigo-600 transition-colors">
              🎁 Smart Gift Finder
            </h1>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            We'd love to hear from you! Whether you have feedback, questions, or
            just want to say hello, we're here to help.
          </p>
        </header>
        <section className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us what's on your mind..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-vertical"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Minimum 10 characters required
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
              fullWidth
              className="font-bold"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Sending Message...</span>
                </div>
              ) : (
                "📧 Send Message"
              )}
            </Button>
          </form>
        </section>

        {/* Additional Contact Information */}
        <section className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">
            Other Ways to Reach Us
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl mb-2">📧</div>
              <h4 className="font-semibold text-slate-900 mb-2">Email</h4>
              <p className="text-slate-600">
                <a
                  href="mailto:Bichriwalid1@gmail.com"
                  className="text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Bichriwalid1@gmail.com
                </a>
              </p>
            </div>

            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl mb-2">⏰</div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Response Time
              </h4>
              <p className="text-slate-600">
                We typically respond within 24-48 hours
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">
            Frequently Asked Questions
          </h3>

          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-4">
              <h4 className="font-semibold text-slate-900 mb-2">
                How does Smart Gift Finder work?
              </h4>
              <p className="text-slate-600 text-sm">
                Our AI analyzes the recipient's age, interests, occasion, and
                budget to generate personalized gift recommendations.
              </p>
            </div>

            <div className="border-b border-slate-200 pb-4">
              <h4 className="font-semibold text-slate-900 mb-2">
                Is Smart Gift Finder free to use?
              </h4>
              <p className="text-slate-600 text-sm">
                Yes! Our platform is completely free to use. No registration or
                payment required.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Can I suggest new features?
              </h4>
              <p className="text-slate-600 text-sm">
                Absolutely! We love hearing from our users. Use the contact form
                above to share your ideas and suggestions.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <p className="text-slate-600 mb-4">Ready to find the perfect gift?</p>
          <Link to="/">
            <Button variant="secondary" size="lg">
              🎁 Start Finding Gifts
            </Button>
          </Link>
        </section>
      </section>
    </main>
  );
};

export default Contact;
