import { getDataForPrompt } from "../../logic/journal";
import {
  AppState,
  GraphName,
  GraphRenderer,
  JournalEntry,
  Prompt,
  PROMPTS,
  RenderedWithEvents,
  Settings,
} from "../../types";
import { dayToDate } from "../../utils/dates";
import { renderer } from "../../utils/render";
import { renderTabNavigation } from "../ui/tabs";
import { renderDailyBar, renderTotaledDailyBar } from "./dailyBar";
import { renderGraphChoices } from "./graphSelector";
import { renderInteractiveQueries } from "./interactiveQueries";
import { renderLineOverview } from "./lineOverview";
import { renderBipolarPeriods } from "./periods";
import { renderSpiderweb } from "./spiderweb";

function renderActiveGraph(
  state: AppState,
  settings: Settings
): RenderedWithEvents {
  return GRAPHS[state.currentGraph](state, settings);
}

export function renderGraph(
  state: AppState,
  settings: Settings
): RenderedWithEvents {
  return renderer`
<div class="tab-content">
  ${renderGraphChoices(state)}
  ${renderActiveGraph(state, settings)}
</div>
${renderTabNavigation(state.currentTab)}
`;
}

export function getDataPerPrompt(entries: JournalEntry[]): PromptRenderData[] {
  const data: PromptRenderData[] = [];

  for (const prompt of PROMPTS) {
    const promptData = getDataForPrompt(prompt, entries).map((row) => {
      return {
        x: dayToDate(row.day),
        y: row.moodValue,
      };
    });

    data.push({
      label: prompt,
      data: promptData,
      borderColor: getColorForPrompt(prompt),
      borderWidth: 2,
      fill: false,
    });
  }

  return data;
}

export const GRAPHS: Record<GraphName, GraphRenderer> = {
  SPIDERWEB: renderSpiderweb,
  LINE_OVERVIEW: renderLineOverview,
  DAILY_BAR: renderDailyBar,
  BIPOLAR_PERIODS: renderBipolarPeriods,
  TOTALED_DAILY_BAR: renderTotaledDailyBar,
  "Interactive queries": renderInteractiveQueries,
};

const COLOR_INDEX: string[] = [
  "#396AB1",
  "#DA7C30",
  "#3E9651",
  "#CC2529",
  "#535154",
  "#6B4C9A",
  "#922428",
  "#948B3D",
];

function getColorForPrompt(prompt: Prompt): string {
  return COLOR_INDEX[PROMPTS.indexOf(prompt)];
}

type PromptRenderData = {
  label: Prompt;
  data: { x: Date; y: number }[];
  borderColor: string;
  borderWidth: number;
  fill: boolean;
};
