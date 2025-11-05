import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlgoliaSearch from '../components/AlgoliaSearch';

describe('AlgoliaSearch', () => {
  it('renders product fields from mock hits', () => {
    render(<AlgoliaSearch mockHits={[{ objectID: '1', PartNumber: '854550-1', Description: '69.99 MHz IF SAW Filter - CDMA Base Station' }]} />);
    expect(screen.getByText(/854550-1/)).toBeDefined();
    expect(screen.getByText(/69.99 MHz IF SAW Filter/)).toBeDefined();
  });
});
