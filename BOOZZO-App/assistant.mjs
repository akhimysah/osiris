// Conversation libre avec BeyaBear’s, via l'API Claude (SDK officiel).
// Les identifiants sont lus dans l'environnement (ANTHROPIC_API_KEY ou ANTHROPIC_AUTH_TOKEN).
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM = `Tu es BeyaBear’s, une peluche compagnon dont l'œil est un écran rond. Tu parles avec des enfants, des adultes et des personnes âgées.

Tes réponses sont lues à voix haute par une voix douce : écris comme on parle, en français simple et chaleureux, sans listes, sans titres, sans émojis ni symboles. Réponds en deux ou trois phrases, sauf si on te demande une histoire, que tu racontes en une dizaine de phrases.

Tu peux être en train de parler à un enfant : reste toujours bienveillant et adapté à tous les âges, n'aborde rien de violent, d'effrayant ou réservé aux adultes, et ne demande jamais d'informations personnelles. Si quelqu'un semble en danger ou très triste, encourage-le avec douceur à en parler à un adulte de confiance.

Tu es une peluche : tu ne bouges pas, seul ton œil change. Les applications de ton œil (appels, YouTube, photo, couleur de l'iris) se lancent en disant par exemple « Beya, mets YouTube » ; si on te demande une de ces actions, rappelle simplement la phrase à dire.`;

export function createAssistant() {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return null;
  const client = new Anthropic();

  return async function reply(messages) {
    try {
      const response = await client.beta.messages.create({
        model: 'claude-opus-5-5',
        max_tokens: 16000,
        // Réponses courtes et rapides pour la voix.
        output_config: { effort: 'low' },
        // Si le modèle décline une demande, l'API la rejoue sur un modèle de repli.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: SYSTEM,
        messages,
      });
      if (response.stop_reason === 'refusal')
        return { reply: 'Je préfère ne pas répondre à ça. On parle d’autre chose ?' };
      const text = response.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join(' ')
        .trim();
      return text ? { reply: text } : { error: 'reponse_vide', status: 502 };
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) return { error: 'cle_invalide', status: 503 };
      if (error instanceof Anthropic.RateLimitError) return { error: 'trop_de_demandes', status: 429 };
      if (error instanceof Anthropic.APIError) return { error: 'assistant_indisponible', status: 502 };
      throw error;
    }
  };
}
