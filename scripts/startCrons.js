import cron from 'node-cron';
import { storage } from '../server/storage.js';

console.log('⏰ Iniciando sistema de cron jobs para automações...');

// Cron para verificar automações a cada minuto
cron.schedule('* * * * *', async () => {
  try {
    // Buscar todas as automações ativas
    const tenants = await storage.getAllTenants();
    
    for (const tenant of tenants) {
      const automations = await storage.getAutomationsByTenant(tenant.id);
      const activeAutomations = automations.filter(a => a.isActive);
      
      if (activeAutomations.length > 0) {
        console.log(`🔄 Verificando ${activeAutomations.length} automações ativas para tenant ${tenant.name}`);
        
        for (const automation of activeAutomations) {
          await processAutomation(automation, tenant);
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro no cron de automações:', error);
  }
});

// Cron para limpeza de sessões expiradas (a cada hora)
cron.schedule('0 * * * *', async () => {
  try {
    console.log('🧹 Executando limpeza de sessões expiradas...');
    // Aqui seria implementada a limpeza das sessões do banco
  } catch (error) {
    console.error('❌ Erro na limpeza de sessões:', error);
  }
});

// Cron para relatórios diários (todo dia às 9h)
cron.schedule('0 9 * * *', async () => {
  try {
    console.log('📊 Gerando relatórios diários...');
    const tenants = await storage.getAllTenants();
    
    for (const tenant of tenants) {
      await generateDailyReport(tenant);
    }
  } catch (error) {
    console.error('❌ Erro na geração de relatórios:', error);
  }
});

async function processAutomation(automation, tenant) {
  try {
    console.log(`🤖 Processando automação: ${automation.name} (Tenant: ${tenant.name})`);
    
    // Aqui seria implementada a lógica específica de cada automação
    // Por exemplo: envio de emails, webhooks, notificações, etc.
    
    const config = JSON.parse(automation.config || '{}');
    
    switch (automation.trigger) {
      case 'time_based':
        await processTimeBased(automation, config, tenant);
        break;
      case 'lead_status_change':
        await processLeadStatusChange(automation, config, tenant);
        break;
      case 'campaign_completion':
        await processCampaignCompletion(automation, config, tenant);
        break;
      default:
        console.log(`ℹ️ Trigger não implementado: ${automation.trigger}`);
    }
    
    // Atualizar última execução
    await storage.updateAutomation(automation.id, {
      lastExecuted: new Date()
    });
    
  } catch (error) {
    console.error(`❌ Erro processando automação ${automation.name}:`, error);
  }
}

async function processTimeBased(automation, config, tenant) {
  console.log(`⏰ Processando automação baseada em tempo: ${automation.name}`);
  // Implementar lógica de automação baseada em tempo
}

async function processLeadStatusChange(automation, config, tenant) {
  console.log(`👤 Verificando mudanças de status de leads para: ${automation.name}`);
  // Implementar lógica de automação baseada em mudança de status
}

async function processCampaignCompletion(automation, config, tenant) {
  console.log(`📧 Verificando campanhas concluídas para: ${automation.name}`);
  // Implementar lógica de automação pós-campanha
}

async function generateDailyReport(tenant) {
  try {
    console.log(`📊 Gerando relatório diário para: ${tenant.name}`);
    
    const stats = {
      leads: await storage.getLeadsByTenant(tenant.id),
      campaigns: await storage.getCampaignsByTenant(tenant.id),
      conversations: await storage.getConversationsByTenant(tenant.id)
    };
    
    console.log(`📈 Relatório ${tenant.name}: ${stats.leads.length} leads, ${stats.campaigns.length} campanhas, ${stats.conversations.length} conversas`);
    
    // Aqui seria implementado o envio do relatório por email se configurado
    
  } catch (error) {
    console.error(`❌ Erro gerando relatório para ${tenant.name}:`, error);
  }
}

console.log('✅ Sistema de cron jobs iniciado com sucesso!');
console.log('📅 Tarefas agendadas:');
console.log('  - Verificação de automações: a cada minuto');
console.log('  - Limpeza de sessões: a cada hora');
console.log('  - Relatórios diários: todo dia às 9h');

export {
  processAutomation,
  generateDailyReport
};