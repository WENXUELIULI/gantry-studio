import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { beforeEach, describe, expect, it } from 'vitest';
import { changeLocale, i18n, initI18n } from '../../i18n';
import { LocaleSwitcher } from './LocaleSwitcher';

describe('LocaleSwitcher', () => {
  beforeEach(async () => {
    localStorage.clear();
    await initI18n();
    await changeLocale('zh-CN');
  });

  it('lists every shipped locale and switches direction', async () => {
    const user = userEvent.setup();
    render(
      <I18nextProvider i18n={i18n}>
        <LocaleSwitcher />
      </I18nextProvider>,
    );
    const select = screen.getByLabelText('语言');
    expect(select.querySelectorAll('option')).toHaveLength(7);

    await user.selectOptions(select, 'ar');
    expect(document.documentElement.dir).toBe('rtl');
    await waitFor(() => expect(screen.getByLabelText('اللغة')).toBeInTheDocument());
  });
});
