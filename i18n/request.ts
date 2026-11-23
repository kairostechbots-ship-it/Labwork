
import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get('labwork-locale')?.value;

  const locale = savedLocale === 'en' ? 'en' : 'es';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
