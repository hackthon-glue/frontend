/**
 * Panel Discussion API Service
 */

import type { PanelDiscussion, PanelDiscussionListItem } from '@/types/panel';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchPanelDiscussions(): Promise<PanelDiscussionListItem[]> {
  const response = await fetch(`${API_BASE_URL}/panels/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch panel discussions: ${response.statusText}`);
  }
  const data = await response.json();
  return data.results || data;
}

export async function fetchPanelByCountry(countryCode: string): Promise<PanelDiscussion> {
  const response = await fetch(`${API_BASE_URL}/panels/country/${countryCode}/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch panel for ${countryCode}: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchPanelById(id: number): Promise<PanelDiscussion> {
  const response = await fetch(`${API_BASE_URL}/panels/${id}/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch panel ${id}: ${response.statusText}`);
  }
  return response.json();
}
