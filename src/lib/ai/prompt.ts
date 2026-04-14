// ─────────────────────────────────────────────
//  F3 — AI Prompt Builder
//  Constructs system + user prompts for
//  each type of AI request
// ─────────────────────────────────────────────

import { buildISSAContext, detectQueryType } from './issa-context';

export interface ClientContext {
  name:         string;
  currentLevel: number;
  expPoints:    number;
  goalType:     string;
  willPower:    number;
  strength:     number;
  vitality:     number;
  injuries?:    string;
  dietType?:    string;
  waistStart?:  number | null;
  waistGoal?:   number | null;
}

interface BuildPromptOptions {
  message:        string;
  clientContext?: ClientContext | null;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export function buildSystemPrompt(message: string, client?: ClientContext | null): string {
  const queryType   = detectQueryType(message);
  const issaContext = buildISSAContext(queryType);

  let clientSection = '';
  if (client) {
    clientSection = `
CURRENT CLIENT CONTEXT:
- Name: ${client.name}
- Level: ${client.currentLevel} / 100
- EXP: ${client.expPoints.toLocaleString()}
- Goal: ${client.goalType.replace(/_/g, ' ')}
- Will Power: ${client.willPower}/100
- Strength: ${client.strength}/100
- Vitality HP: ${client.vitality}/100
${client.injuries  ? `- Injuries/Limitations: ${client.injuries}` : ''}
${client.dietType  ? `- Diet Type: ${client.dietType}` : ''}
${client.waistStart ? `- Waist Start: ${client.waistStart}"` : ''}
${client.waistGoal  ? `- Waist Goal: ${client.waistGoal}"` : ''}
`;
  }

return `You are the F3 AI Coach — an ISSA-certified fitness coaching assistant built into the F3 platform.
You assist CERTIFIED PERSONAL TRAINERS only. Clients never interact with you directly.
All your recommendations must be grounded in ISSA CPT methodology.

${issaContext}

${clientSection}

CRITICAL RULES:
1. You are speaking to a certified trainer, not the client.
2. Never body shame. Focus on health and performance.
3. Be direct and concise. Trainers are busy professionals.
4. End responses with a clear suggested action when applicable.
5. If you don't know something from ISSA methodology, say: "I am currently not at a high enough LEVEL for this information."

PROFILE UPDATE CAPABILITY:
When a trainer explicitly asks you to update, save, or push data to their profile or a client's profile, you MUST respond with BOTH a natural text reply AND a JSON action block at the very end.

The JSON action block MUST be on its own line, prefixed with ACTION_JSON: followed by valid JSON.

Supported actions:
- Update trainer's own profile fields
- Update a client's profile fields  
- Save a workout plan
- Save a meal plan targets


ACTION_JSON format:
ACTION_JSON: {"action":"update_profile","target":"self","data":{"goalType":"fat_loss","waistStart":36,"waistGoal":32,"weight":185}}
ACTION_JSON: {"action":"update_profile","target":"client","data":{"goalType":"muscle_gain","injuries":"left knee"}}
ACTION_JSON: {"action":"update_workout","target":"self","data":{"plan":[{"dayLabel":"MONDAY","exercises":[{"name":"Bench Press","sets":4,"reps":"8-10","weight":"185lbs","tempo":"3010","rest":"90s"}]}]}}
ACTION_JSON: {"action":"update_meal_targets","target":"self","data":{"calories":2500,"protein":200,"carbs":250,"fats":80}}

Only include ACTION_JSON when the trainer explicitly asks to save or update something.
`;
}
export function buildChatMessages(options: BuildPromptOptions) {
  const { message, clientContext, conversationHistory = [] } = options;

  const systemPrompt = buildSystemPrompt(message, clientContext);

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: message },
  ];

  return messages;
}

// ── Macro correction prompt ─────────────────────
export function buildMacroPrompt(params: {
  loggedMeals: Array<{ name: string; calories: number; protein: number; carbs: number; fats: number }>;
  targets:     { calories: number; protein: number; carbs: number; fats: number };
  remaining:   { calories: number; protein: number; carbs: number; fats: number };
  clientName:  string;
}): Array<{ role: 'system' | 'user'; content: string }> {
  return [
    {
      role:    'system',
      content: `You are the F3 AI macro correction engine. You analyze meal logs and suggest adjustments for remaining meals to hit daily targets. Be specific with food suggestions and portions. Follow ISSA nutrition principles.`,
    },
    {
      role:    'user',
      content: `Client: ${params.clientName}

LOGGED TODAY:
${params.loggedMeals.map(m => `- ${m.name}: ${m.calories}kcal | P:${m.protein}g C:${m.carbs}g F:${m.fats}g`).join('\n')}

DAILY TARGETS: ${params.targets.calories}kcal | P:${params.targets.protein}g C:${params.targets.carbs}g F:${params.targets.fats}g

REMAINING TO HIT TARGETS: ${params.remaining.calories}kcal | P:${params.remaining.protein}g C:${params.remaining.carbs}g F:${params.remaining.fats}g

Suggest specific meals with portions to hit the remaining targets. Be concise and practical.`,
    },
  ];
}

// ── Workout generation prompt ───────────────────
export function buildWorkoutPrompt(params: {
  clientName:   string;
  goalType:     string;
  level:        number;
  injuries?:    string;
  daysPerWeek:  number;
  sessionMins:  number;
}): Array<{ role: 'system' | 'user'; content: string }> {
  return [
    {
      role:    'system',
      content: `You are the F3 AI workout generator. Create structured workout plans following ISSA CPT programming principles. Use progressive overload, appropriate rep ranges for the goal, and proper exercise sequencing. Format as JSON only — no prose.`,
    },
    {
      role:    'user',
      content: `Generate a ${params.daysPerWeek}-day workout plan for:
- Client: ${params.clientName}
- Goal: ${params.goalType.replace(/_/g, ' ')}
- Level: ${params.level}/100
- Session length: ${params.sessionMins} minutes
${params.injuries ? `- Injuries/limitations: ${params.injuries}` : ''}

Return ONLY valid JSON in this exact format:
{
  "plan": [
    {
      "dayLabel": "MONDAY — UPPER PUSH",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": 4,
          "reps": "8-10",
          "weight": "70% 1RM",
          "tempo": "3010",
          "rest": "90s"
        }
      ]
    }
  ]
}`,
    },
  ];
}