
import React from 'react';
import './SubscriptionPage.css';

const SubscriptionPage: React.FC = () => {
  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <h1>Choose Your Plan</h1>
        <p>Unlock the full power of the Relic Series Generator</p>
      </div>
      <div className="subscription-plans">
        <div className="plan">
          <h2>Free</h2>
          <p className="price">$0/mo</p>
          <ul>
            <li>10 Relic Generations per month</li>
            <li>Limited access to pre-existing relics</li>
          </ul>
          <button className="cta-button">Current Plan</button>
        </div>
        <div className="plan recommended">
          <h2>Pro</h2>
          <p className="price">$10/mo</p>
          <ul>
            <li>100 Relic Generations per month</li>
            <li>Save and Remix Relics</li>
            <li>Access to Negative Prompts</li>
            <li>Receive Remix Suggestions</li>
          </ul>
          <button className="cta-button">Upgrade to Pro</button>
        </div>
        <div className="plan">
          <h2>Enterprise</h2>
          <p className="price">Contact Us</p>
          <ul>
            <li>Unlimited Relic Generations</li>
            <li>Priority Support</li>
            <li>Custom Integrations</li>
            <li>Dedicated Account Manager</li>
          </ul>
          <button className="cta-button">Contact Sales</button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
