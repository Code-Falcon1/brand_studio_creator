import { render, screen } from '@testing-library/react';
import App from './App';
import { I18nProvider } from './i18n/I18nProvider';

test('renders app title', () => {
  render(
    <I18nProvider>
      <App />
    </I18nProvider>
  );
  expect(screen.getByText(/brand studio/i)).toBeInTheDocument();
});
