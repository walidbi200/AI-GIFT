import React from 'react';
import EmailSignupForm from './EmailSignupForm';

interface InlineEmailCaptureProps {
    placement: 'top' | 'middle' | 'bottom';
    pageType: 'landing' | 'blog';
}

export default function InlineEmailCapture({ placement, pageType }: InlineEmailCaptureProps) {
    const headlines = {
        top: "Don't Miss Our Best Gift Ideas!",
        middle: "Want More Gift Inspiration?",
        bottom: "Ready to Become a Better Gift Giver?"
    };

    const descriptions = {
        top: "Get weekly gift ideas, seasonal guides, and exclusive tips delivered to your inbox.",
        middle: "Join thousands of happy gift givers getting our best ideas weekly.",
        bottom: "Get our complete gift giving guide plus weekly inspiration."
    };

    return (
        <div className="my-12">
            <EmailSignupForm
                variant="inline"
                source={`${pageType}-${placement}`}
                headline={headlines[placement]}
                description={descriptions[placement]}
                buttonText="Get Free Gift Ideas"
                incentive="✨ Bonus: Instant access to Ultimate Gift Guide PDF"
            />
        </div>
    );
}
