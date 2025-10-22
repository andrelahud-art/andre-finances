// Script de Migración de Datos - André Finances
// Copia y pega este script en la consola del navegador (F12) en https://andre-finances.lindy.site/dashboard

console.log('🚀 Iniciando migración de datos a Supabase...');

async function migrateToSupabase() {
  try {
    // 1. Exportar datos de localStorage
    console.log('📦 Exportando datos de localStorage...');
    
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const creditCards = JSON.parse(localStorage.getItem('creditCards') || '[]');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const debts = JSON.parse(localStorage.getItem('longTermDebts') || '[]');
    const assets = JSON.parse(localStorage.getItem('assets') || '[]');
    const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
    const recurringRules = JSON.parse(localStorage.getItem('calendarPayments') || '[]');

    console.log(`✅ Cuentas: ${accounts.length}`);
    console.log(`✅ Tarjetas de Crédito: ${creditCards.length}`);
    console.log(`✅ Categorías: ${categories.length}`);
    console.log(`✅ Transacciones: ${transactions.length}`);
    console.log(`✅ Deudas L.P.: ${debts.length}`);
    console.log(`✅ Activos: ${assets.length}`);
    console.log(`✅ Presupuestos: ${budgets.length}`);
    console.log(`✅ Pagos Recurrentes: ${recurringRules.length}`);

    const totalItems = accounts.length + creditCards.length + categories.length + 
                      transactions.length + debts.length + assets.length + 
                      budgets.length + recurringRules.length;
    
    console.log(`📊 Total de registros a migrar: ${totalItems}`);

    if (totalItems === 0) {
      console.log('⚠️ No hay datos para migrar');
      return;
    }

    // 2. Enviar datos a la API
    console.log('☁️ Enviando datos a Supabase...');
    
    const response = await fetch('/api/migrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accounts,
        creditCards,
        categories,
        transactions,
        debts,
        assets,
        budgets,
        recurringRules
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('🎉 ¡Migración completada exitosamente!');
      console.log(`✅ Usuario ID: ${result.userId}`);
      console.log('✅ Todos los datos han sido guardados en Supabase');
      console.log('🔍 Verifica en: https://supabase.com/dashboard/project/jdkrtnrhcyjtmbwtatsc/editor');
    } else {
      console.error('❌ Error en la migración:', result.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar migración
migrateToSupabase();
