import React, { useState } from 'react';
import { GiftRequestSchema } from '../utils/validation';
import { z } from 'zod';

interface FormErrors {
    recipient?: string;
    occasion?: string;
    budget?: string;
    interests?: string;
    negativeKeywords?: string;
}

export default function GiftFinderForm() {
    const [formData, setFormData] = useState({
        recipient: '',
        occasion: '',
        budget: '',
        interests: '',
        negativeKeywords: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        try {
            GiftRequestSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors: FormErrors = {};
                error.errors.forEach((err) => {
                    const field = err.path[0] as keyof FormErrors;
                    formattedErrors[field] = err.message;
                });
                setErrors(formattedErrors);
            }
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate before submission
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/generate-gifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();

                if (errorData.validationErrors) {
                    setErrors(errorData.validationErrors);
                } else {
                    alert(errorData.error || 'Failed to generate gifts');
                }
                return;
            }

            const data = await response.json();
            // Handle successful response
            console.log('Gifts:', data.gifts);

        } catch (error) {
            console.error('Error:', error);
            alert('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient */}
            <div>
                <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
                    Who is this gift for? *
                </label>
                <input
                    type="text"
                    id="recipient"
                    name="recipient"
                    value={formData.recipient}
                    onChange={handleChange}
                    placeholder="e.g., Mom, Dad, Best Friend"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.recipient ? 'border-red-500' : 'border-gray-300'
                        }`}
                    maxLength={50}
                />
                {errors.recipient && (
                    <p className="text-red-600 text-sm mt-1">{errors.recipient}</p>
                )}
            </div>

            {/* Occasion */}
            <div>
                <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 mb-2">
                    What's the occasion? *
                </label>
                <select
                    id="occasion"
                    name="occasion"
                    value={formData.occasion}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.occasion ? 'border-red-500' : 'border-gray-300'
                        }`}
                >
                    <option value="">Select occasion</option>
                    <option value="birthday">Birthday</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="christmas">Christmas</option>
                    <option value="valentines">Valentine's Day</option>
                    <option value="graduation">Graduation</option>
                    <option value="wedding">Wedding</option>
                    <option value="just-because">Just Because</option>
                </select>
                {errors.occasion && (
                    <p className="text-red-600 text-sm mt-1">{errors.occasion}</p>
                )}
            </div>

            {/* Budget */}
            <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                    What's your budget? *
                </label>
                <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.budget ? 'border-red-500' : 'border-gray-300'
                        }`}
                >
                    <option value="">Select budget</option>
                    <option value="under-25">Under $25</option>
                    <option value="25-50">$25 - $50</option>
                    <option value="50-100">$50 - $100</option>
                    <option value="100-200">$100 - $200</option>
                    <option value="200-500">$200 - $500</option>
                    <option value="over-500">Over $500</option>
                </select>
                {errors.budget && (
                    <p className="text-red-600 text-sm mt-1">{errors.budget}</p>
                )}
            </div>

            {/* Interests (Optional) */}
            <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                    Their interests or hobbies (optional)
                </label>
                <textarea
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="e.g., cooking, gardening, photography"
                    rows={3}
                    maxLength={200}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.interests ? 'border-red-500' : 'border-gray-300'
                        }`}
                />
                <p className="text-sm text-gray-500 mt-1">
                    {formData.interests.length}/200 characters
                </p>
                {errors.interests && (
                    <p className="text-red-600 text-sm mt-1">{errors.interests}</p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                {isSubmitting ? 'Finding Perfect Gifts...' : 'Find Gift Ideas →'}
            </button>
        </form>
    );
}
