import { render, screen } from '@testing-library/react';
import { Toast, EmptyState } from './UI';
import { describe, it, expect } from 'vitest';
import { Smartphone } from 'lucide-react';

describe('UI Components', () => {
  it('renders Toast with message', () => {
    render(<Toast message="Success Message" type="success" onClose={() => {}} />);
    expect(screen.getByText('Success Message')).toBeInTheDocument();
  });

  it('renders EmptyState correctly', () => {
    render(
      <EmptyState 
        icon={Smartphone} 
        title="Empty Title" 
        desc="Empty Description" 
      />
    );
    expect(screen.getByText('Empty Title')).toBeInTheDocument();
    expect(screen.getByText('Empty Description')).toBeInTheDocument();
  });
});
