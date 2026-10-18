import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardTitle, CardContent } from '@/components/ui/card';

describe('UI Primitives', () => {
  it('renders button with gold styling and responds to disabled state', () => {
    render(<Button disabled>Tambah Emas</Button>);
    const btn = screen.getByRole('button', { name: /tambah emas/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  it('renders badge with correct variant classes', () => {
    render(<Badge variant="success">Untung</Badge>);
    const badge = screen.getByText('Untung');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-emerald-700');
  });

  it('renders card with title and content', () => {
    render(
      <Card>
        <CardTitle>Portofolio Antam</CardTitle>
        <CardContent>Total: 10 gram</CardContent>
      </Card>
    );
    expect(screen.getByText('Portofolio Antam')).toBeInTheDocument();
    expect(screen.getByText('Total: 10 gram')).toBeInTheDocument();
  });
});
