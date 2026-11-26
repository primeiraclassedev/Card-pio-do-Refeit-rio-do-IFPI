import { createClient } from '@/lib/supabase/server';
import CardapioClient from '@/components/CardapioClient';

export const dynamic = 'force-dynamic';

function getTeresinaWeekRange() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [y, m, d] = formatter.format(new Date()).split('-').map(Number);
  const now = new Date(y, m - 1, d);
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
  const friday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 4);

  const toISO = (dateObj) =>
    `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(
      dateObj.getDate()
    ).padStart(2, '0')}`;

  return { start: toISO(monday), end: toISO(friday) };
}

export default async function HomePage() {
  const supabase = await createClient();
  const { start, end } = getTeresinaWeekRange();

  const [mealsRes, nonSchoolRes] = await Promise.all([
    supabase
      .from('refeicoes')
      .select(`
        id,
        data,
        tipo,
        refeicao_porcoes (
          porcoes ( id, nome, icone )
        )
      `)
      .gte('data', start)
      .lte('data', end),

    supabase
      .from('dias_nao_letivos')
      .select('data, justificativa')
      .gte('data', start)
      .lte('data', end),
  ]);

  const nonSchoolMap = {};
  (nonSchoolRes.data || []).forEach((item) => {
    nonSchoolMap[item.data] = item.justificativa;
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: 'Refeitório IFPI - Campus Teresina Central',
    description:
      'Refeitório estudantil do Instituto Federal do Piauí - Campus Teresina Central. Servindo almoço e jantar de segunda a sexta-feira.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Praça da Liberdade, 1597 - Centro',
      addressLocality: 'Teresina',
      addressRegion: 'PI',
      addressCountry: 'BR',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '11:30',
        closes: '13:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '17:00',
        closes: '19:00',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CardapioClient
        initialMeals={mealsRes.data || []}
        nonSchoolDays={nonSchoolMap}
      />
    </>
  );
}