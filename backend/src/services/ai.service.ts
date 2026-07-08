import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import prisma from '../lib/prisma';
import { getAIProviders } from './ai/ai.providers';
import { tools } from './ai/ai.schemas';
import { executeTool, getAccountsWithBalances, getUserUniqueTags, getUserAIMemoryAndHabits } from './ai/ai.executor';
import { generateSystemPrompt } from './ai/ai.prompt';

export async function processAIChat(
  userId: string,
  message: string,
  history: ChatCompletionMessageParam[] = [],
  image?: string
) {
  const [accounts, categories, tags, habitsReport] = await Promise.all([
    getAccountsWithBalances(userId),
    prisma.category.findMany({ where: { userId }, select: { id: true, name: true, type: true } }),
    getUserUniqueTags(userId),
    getUserAIMemoryAndHabits(userId),
  ]);

  const accountMapping = accounts.map((a: any) => `[ID: "${a.id}" | ${a.name} (${a.type}) - Saldo Nyata Saat Ini: ${a.formattedBalance}]`).join('\n');
  const categoryMapping = categories.map((c) => `[ID: "${c.id}" | ${c.name} (${c.type})]`).join('\n');
  const tagMapping = tags.length > 0 ? tags.map((t) => `#${t}`).join(', ') : 'Belum ada tag yang disimpan.';
  
  const nowWIB = new Date();
  const dateStrWIB = nowWIB.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStrWIB = nowWIB.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
  });
  const isoDateWIB = new Date(nowWIB.getTime() + 7 * 3600 * 1000).toISOString().split('T')[0];
  const currentTimeWIB = `${dateStrWIB}, pukul ${timeStrWIB} WIB (ISO Date: ${isoDateWIB})`;

  const systemInstruction = generateSystemPrompt(categoryMapping, accountMapping, currentTimeWIB, isoDateWIB, tagMapping, habitsReport);

  const userContent: any = image
    ? [
        { type: 'text', text: message || 'Tolong baca dan catat struk ini' },
        { type: 'image_url', image_url: { url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}` } },
      ]
    : message;

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemInstruction },
    ...history.slice(-6),
    { role: 'user', content: userContent },
  ];

  const providers = getAIProviders(!!image);

  const executedTools: string[] = [];
  let currentMessages = [...messages];
  let finalResponseText = '';

  for (let iteration = 0; iteration < 4; iteration++) {
    let response: any = null;
    let lastError: any = null;

    for (const provider of providers) {
      try {
        response = await provider.client.chat.completions.create({
          model: provider.model,
          messages: currentMessages,
          tools,
          tool_choice: 'auto',
          temperature: 0.3,
        });
        if (response && response.choices && response.choices.length > 0) {
          console.log(`[AI Load Balancer] Sukses dijawab oleh: "${provider.name}" (Model: ${provider.model})`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Load Balancer] Gagal pada "${provider.name}": ${err.message || err}. Bergeser ke provider berikutnya...`);
      }
    }

    if (!response || !response.choices || response.choices.length === 0) {
      throw lastError || new Error('Semua AI Provider & API Keys (Gemini, Cerebras, OpenRouter, Groq) gagal memberikan balasan.');
    }

    const choice = response.choices[0];
    const messageObj = choice.message;

    if (messageObj.tool_calls && messageObj.tool_calls.length > 0) {
      currentMessages.push(messageObj);

      for (const toolCall of messageObj.tool_calls) {
        const fnName = (toolCall as any).function.name;
        let fnArgs: any = {};
        try {
          let rawArgs = (toolCall as any).function.arguments || '{}';
          rawArgs = rawArgs.replace(/,\s*([\]}])/g, '$1');
          fnArgs = JSON.parse(rawArgs);
        } catch (parseErr: any) {
          console.warn(`[AI] Malformed JSON arguments for ${fnName}:`, (toolCall as any).function.arguments);
          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: `Format JSON argumen tidak valid (${parseErr.message}). Tolong panggil ulang tool dengan JSON argumen yang benar tanpa trailing comma.` }),
          });
          continue;
        }

        executedTools.push(fnName);

        try {
          const toolResult = await executeTool(userId, fnName, fnArgs);
          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });

          if (fnName === 'record_transaction' && (toolResult as any).transaction) {
            const trx = (toolResult as any).transaction;
            const b = (toolResult as any).budgetStatus;
            const amtStr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(trx.amount);
            const trxType = trx.type === 'income' ? 'Pemasukan 💰' : trx.type === 'expense' ? 'Pengeluaran 💸' : 'Transfer 🔄';
            let reply = `✅ *${trxType} Berhasil Dicatat!*\n\n`;
            reply += `📝 *Keterangan:* ${trx.description}\n`;
            reply += `💵 *Nominal:* ${amtStr}\n`;
            if (trx.category?.name) reply += `🏷️ *Kategori:* ${trx.category.name}\n`;
            if (trx.account?.name) reply += `💳 *Akun:* ${trx.account.name}\n`;
            if (trx.toAccount?.name) reply += `🎯 *Ke Akun:* ${trx.toAccount.name}\n`;
            reply += `📅 *Tanggal:* ${new Date(trx.transactionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;

            if (b && b.percentage >= 70) {
              reply += `\n⚠️ *Peringatan Anggaran (${b.categoryName}):*\n`;
              reply += `Penggunaan bulan ini sudah mencapai *${b.percentage}%* (${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(b.spent)} / ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(b.limit)}). Yuk hemat-hemat! 🛑`;
            }

            finalResponseText = reply;
            break;
          } else if (fnName === 'delete_transaction') {
            finalResponseText = '🗑️ *Transaksi Berhasil Dihapus!* Data keuangan kamu sudah diperbarui ya. ✅';
            break;
          }
        } catch (error: any) {
          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: error.message || 'Gagal mengeksekusi tool' }),
          });
        }
      }
    } else {
      finalResponseText = messageObj.content || '';
      break;
    }
  }

  if (!finalResponseText && currentMessages.length > 0) {
    const lastMsg = currentMessages[currentMessages.length - 1];
    if ('content' in lastMsg && typeof lastMsg.content === 'string') {
      finalResponseText = lastMsg.content;
    } else {
      finalResponseText = 'Permintaan berhasil diproses.';
    }
  }

  return {
    response: finalResponseText,
    executedTools,
  };
}
