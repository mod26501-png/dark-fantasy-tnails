
import React from 'react';
import { render, screen } from '@testing-library/react';
import SubscriptionPage from './SubscriptionPage';
import '@testing-library/jest-dom';

describe('SubscriptionPage', () => {
  it('renders the main heading', () => {
    render(<SubscriptionPage />);
    expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
  });

  it('renders the Free plan', () => {
    render(<SubscriptionPage />);
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('$0/mo')).toBeInTheDocument();
    expect(screen.getByText('Current Plan')).toBeInTheDocument();
  });

  it('renders the Pro plan', () => {
    render(<SubscriptionPage />);
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('$10/mo')).toBeInTheDocument();
    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
  });

  it('renders the Enterprise plan', () => {
    render(<SubscriptionPage />);
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Contact Sales')).toBeInTheDocument();
  });
});
