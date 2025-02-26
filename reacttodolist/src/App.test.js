import { render, screen } from '@testing-library/react';
import App from './App';

test('есть заголовок', () => {
  render(<App />);
  const linkElement = screen.getByText("Active");
  expect(linkElement).toBeInTheDocument();
});
