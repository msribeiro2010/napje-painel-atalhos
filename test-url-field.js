// Teste para verificar se o campo URL está sendo enviado corretamente

const testEvent = {
  date: '2025-01-30',
  type: 'curso',
  title: 'Teste de URL',
  description: 'Teste para verificar se o campo URL funciona',
  start_time: '09:00',
  end_time: '10:00',
  url: 'https://exemplo.com/teste'
};

console.log('Dados do evento de teste:');
console.log(JSON.stringify(testEvent, null, 2));

// Simular a preparação dos dados como no hook useCustomEvents
const eventToInsert = {
  user_id: 'test-user-id',
  date: testEvent.date,
  type: testEvent.type,
  title: testEvent.title
};

// Adicionar campos opcionais apenas se existirem
if (testEvent.description) {
  eventToInsert.description = testEvent.description;
}
if (testEvent.start_time) {
  eventToInsert.start_time = testEvent.start_time;
}
if (testEvent.end_time) {
  eventToInsert.end_time = testEvent.end_time;
}
if (testEvent.url) {
  eventToInsert.url = testEvent.url;
}

console.log('\nDados preparados para inserção:');
console.log(JSON.stringify(eventToInsert, null, 2));

// Verificar se o campo URL está presente
if (eventToInsert.url) {
  console.log('\n✅ Campo URL está presente:', eventToInsert.url);
} else {
  console.log('\n❌ Campo URL está ausente!');
}