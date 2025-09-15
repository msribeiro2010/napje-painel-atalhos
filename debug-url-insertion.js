// Teste específico para verificar inserção do campo URL
const testEvent = {
  date: '2024-01-15',
  type: 'reuniao',
  title: 'Teste com URL',
  description: 'Evento de teste',
  time: '10:00',
  end_time: '11:00',
  url: 'https://example.com/meeting'
};

// Simular a preparação dos dados como no useCustomEvents
const eventData = {
  date: testEvent.date,
  type: testEvent.type,
  title: testEvent.title,
  description: testEvent.description || null,
  time: testEvent.time || null,
  end_time: testEvent.end_time || null,
  user_id: 'test-user-id'
};

// Adicionar URL se existir (como no código original)
if (testEvent.url && testEvent.url.trim()) {
  eventData.url = testEvent.url.trim();
}

console.log('Dados preparados para inserção:');
console.log(JSON.stringify(eventData, null, 2));

// Verificar se o campo URL está presente
if ('url' in eventData) {
  console.log('✅ Campo URL está presente nos dados');
  console.log('Valor do URL:', eventData.url);
} else {
  console.log('❌ Campo URL NÃO está presente nos dados');
}

// Simular a query do Supabase
const supabaseQuery = `
INSERT INTO user_custom_events (
  ${Object.keys(eventData).join(',\n  ')}
) VALUES (
  ${Object.values(eventData).map(v => typeof v === 'string' ? `'${v}'` : v).join(',\n  ')}
);
`;

console.log('\nQuery SQL simulada:');
console.log(supabaseQuery);