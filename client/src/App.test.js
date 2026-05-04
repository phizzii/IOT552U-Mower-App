import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./pages/DeliveriesPage', () => function MockDeliveriesPage() {
  return <div>Deliveries Page</div>;
});

test('renders dashboard shell heading', () => {
  render(<App />);
  const shellMarker = screen.getByText(/Workshop Live/i);
  expect(shellMarker).toBeInTheDocument();
});
