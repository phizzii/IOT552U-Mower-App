import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard shell heading', () => {
  render(<App />);
  const shellMarker = screen.getByText(/Repair Control/i);
  expect(shellMarker).toBeInTheDocument();
});
