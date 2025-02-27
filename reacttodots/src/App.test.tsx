import { render, screen } from '@testing-library/react';
import App from './App';

test('есть кнопка', () => {
  render(<App />);

  const buttonAdd = screen.getByText("Добавить дело");
  expect(buttonAdd).toBeDefined();

});

test('есть заголовок', () => {
  render(<App />);

  const title = screen.getByText("Список дел");
  expect(title).toBeDefined();
});

test('есть инпут', () => {
  render(<App />);

  const input = screen.getByPlaceholderText("Введите название дела");
  expect(input).toBeDefined();
});