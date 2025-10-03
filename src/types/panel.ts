/**
 * Panel Discussion Types
 */

export interface PanelTranscript {
  speaker: string;
  content: string;
  round_number: number | null;
  turn_order: number;
}

export interface PanelVote {
  expert_role: string;
  vote_mood: 'happy' | 'neutral' | 'sad';
  confidence: number | string;  // API returns as string
  reasoning: string;
}

export interface PanelExpertAnalysis {
  expert_role: string;
  analysis_text: string;
  round_number: number;
}

export interface PanelDiscussion {
  id: number;
  country_code: string;
  topic: string;
  final_mood: 'happy' | 'neutral' | 'sad';
  final_score: number | string;  // API returns as string
  introduction: string | null;
  conclusion: string | null;
  discussion_date: string;
  total_turns: number | null;
  debate_rounds: number | null;
  created_at: string;
  analyses: PanelExpertAnalysis[];
  votes: PanelVote[];
  transcripts: PanelTranscript[];
}

export interface PanelDiscussionListItem {
  id: number;
  country_code: string;
  topic: string;
  final_mood: 'happy' | 'neutral' | 'sad';
  final_score: number | string;  // API returns as string
  discussion_date: string;
  created_at: string;
}
