/**
 * Rename these as you want - the `MoodState` is a text representation of `MoodValue`
 */
export type MoodState = "None" | "Slight" | "Some" | "Intense";
export const MOOD_VALUES = [1, 2, 3, 4] as const;
export type MoodValue = (typeof MOOD_VALUES)[number];

export function moodStateFromValue(value: MoodValue): MoodState {
  switch (value) {
    case 1:
      return "None";
    case 2:
      return "Slight";
    case 3:
      return "Some";
    case 4:
      return "Intense";
  }
}

/**
 * These are the prompts you'll want to answer each day.
 *
 * Add, change, or remove them as you desire.
 * The type system should warn you in all the places you need to change it.
 */
export const PROMPTS = [
  "Today's feelings of depression",
  "Today's feelings of anxiety",
  "Today's feelings of elevatation",
  "Today's feelings of irritableness",
  "Today's psychotic symptoms",
] as const;

export type Prompt = (typeof PROMPTS)[number];

export type PromptResponses = {
  [prompt in Prompt]: MoodValue;
};

export function PromptResponses(
  depression: MoodValue,
  anxiety: MoodValue,
  elevation: MoodValue,
  irritableness: MoodValue,
  psychotic: MoodValue
): PromptResponses {
  return {
    "Today's feelings of depression": depression,
    "Today's feelings of anxiety": anxiety,
    "Today's feelings of elevatation": elevation,
    "Today's feelings of irritableness": irritableness,
    "Today's psychotic symptoms": psychotic,
  };
}

export const SHORT_PROMPTS: Record<Prompt, string> = {
  "Today's feelings of depression": "Depression",
  "Today's feelings of anxiety": "Anxiety",
  "Today's feelings of elevatation": "Elevation",
  "Today's feelings of irritableness": "Irrability",
  "Today's psychotic symptoms": "Psychotic",
};

export function depression(entry: JournalEntry): MoodValue {
  return entry.promptResponses["Today's feelings of depression"];
}

export function anxiety(entry: JournalEntry): MoodValue {
  return entry.promptResponses["Today's feelings of anxiety"];
}

export function elevation(entry: JournalEntry): MoodValue {
  return entry.promptResponses["Today's feelings of elevatation"];
}

export function irritableness(entry: JournalEntry): MoodValue {
  return entry.promptResponses["Today's feelings of irritableness"];
}

export function psychosis(entry: JournalEntry): MoodValue {
  return entry.promptResponses["Today's psychotic symptoms"];
}

export const TAB_OPTIONS = ["JOURNAL", "IMPORT", "GRAPH", "SETTINGS"] as const;
export type TabName = (typeof TAB_OPTIONS)[number];

export type Day = {
  year: number;
  month: number;
  day: number;
};

export type DayState = {
  day: Day;
  moodValue: MoodValue;
};

/**
 * An indiviudal log entry - each day may have multiple of these.
 */
export type LogEntry = {
  time: Date;
  text: string;
};

/**
 * AppState includes UI state and data (journal entries)
 */
export type AppState = {
  kind: "AppState";
  day: Day;
  currentTab: TabName;
  currentGraph: GraphName;
  journalEntries: JournalEntry[];
};

export function isAppState(object: unknown): object is AppState {
  if (typeof object === "undefined" || typeof object !== "object") {
    return false;
  }
  if ((object as any).kind) {
    if ((object as any).kind === "AppState") {
      return true;
    }
  }
  return false;
}

export type Settings = {
  kind: "Settings";
  currentPills: string[];
};

export function isSettings(object: unknown): object is Settings {
  if (typeof object === "undefined" || typeof object !== "object") {
    return false;
  }
  if ((object as any).kind) {
    if ((object as any).kind === "Settings") {
      return true;
    }
  }
  return false;
}

export type JournalEntry = {
  day: Day;
  pills: Record<string, number>;
  promptResponses: PromptResponses;
  hoursSlept: number;
  logs: LogEntry[];
};

export function JournalEntry(
  day: Day,
  pills: Record<string, number>,
  promptResponses: PromptResponses,
  hoursSlept: number,
  logs: LogEntry[]
): JournalEntry {
  return {
    day,
    pills,
    promptResponses,
    hoursSlept,
    logs,
  };
}

export const GRAPH_NAMES = [
  "SPIDERWEB",
  "LINE_OVERVIEW",
  "DAILY_BAR",
  "BIPOLAR_PERIODS",
  "TOTALED_DAILY_BAR",
] as const;

export type GraphName = (typeof GRAPH_NAMES)[number];

/**
 * A graph renderer is something that takes a day, the entries, and returns a Renderer.
 */
export type GraphRenderer = (today: Day, entries: JournalEntry[]) => Renderer;

export function isGraphName(str: string): str is GraphName {
  return GRAPH_NAMES.includes(str as GraphName);
}

/**
 * Make it explicit which events we use, to help catch typos
 *
 * Feel free to add more events here as needed.
 */
export type EventName = "click" | "input" | "change";

export type EventHandler = {
  elementSelector: `#${string}` | `.${string}`;
  eventName: EventName;
  callback: (event: Event) => Sent;
};

/**
 * A renderer has a body, of the html to render, and listeners.
 *
 * To understand how to use this, ctrl-f and look in the rendering files.
 */
export type Renderer = {
  body: string;
  eventListeners: EventHandler[];
};

/**
 * These are the messages passed from the client to the service worker.
 *
 * As a principle: pass as little info to the backend as possible
 */
export type Update =
  | {
      kind: "AddJournalEntry";
      time: Date;
      text: string;
      day: Day;
    }
  | {
      kind: "UpdatePromptValue";
      entry: JournalEntry;
      newValue: MoodValue;
      prompt: Prompt;
    }
  | { kind: "RemoveSettings" }
  | { kind: "RemoveAppState" }
  | { kind: "UpdateSleepValue"; entry: JournalEntry; value: number }
  | { kind: "UpdateCurrentTab"; tab: TabName }
  | { kind: "UpdateCurrentGraph"; graphName: GraphName }
  | { kind: "AddPill"; pillName: string }
  | { kind: "ResetCurrentDay" }
  | { kind: "UpdateCurrentDay"; direction: Direction }
  | { kind: "GoToSpecificDay"; tab: TabName; entry: JournalEntry }
  | { kind: "UpdateImportAppState"; state: AppState }
  | { kind: "UpdateImportSettings"; settings: Settings }
  | {
      kind: "UpdatePillValue";
      entry: JournalEntry;
      pillName: string;
      direction: Direction;
    }
  | {
      kind: "UpdatePillOrder";
      pillName: string;
      direction: PillOrderDirection;
    }
  | { kind: "ReadyToRender" }
  | { kind: "InitializeDay" };

/**
 * These are used to make sure that events communicate over the broadcast channel
 */
type SentConstructors = "Sent" | "Noop";

export type Sent = SentConstructors | Promise<SentConstructors>;

export function dontSend(): Sent {
  return "Noop";
}

export function sendUpdate(update: Update): Sent {
  const renderChannel = TypedBroadcastChannel<Update>("render");
  renderChannel.postMessage(update);

  return "Sent";
}

export type Direction = "Next" | "Previous";

export type PillOrderDirection = "Up" | "Down" | "Top";

export type RenderBroadcast =
  | {
      kind: "rerender";
      state: AppState;
      settings: Settings;
    }
  | { kind: "ReadyToRender" };

export type TypedBroadcastChannel<type> = {
  channel: BroadcastChannel;
  postMessage: (message: type) => void;
};

export function TypedBroadcastChannel<type>(
  name: string
): TypedBroadcastChannel<type> {
  const channel = new BroadcastChannel(name);
  return {
    channel: channel,
    postMessage: (message: type) => channel.postMessage(message),
  };
}

export type RenderError = "NeedsToInitialize";

export const SETTINGS_OBJECT_STORE_NAME = "Settings";
export const APP_STATE_OBJECT_STORE_NAME = "AppState";

export type StoreName =
  | typeof SETTINGS_OBJECT_STORE_NAME
  | typeof APP_STATE_OBJECT_STORE_NAME;

export function isStoreName(str: string): str is StoreName {
  if (
    str === SETTINGS_OBJECT_STORE_NAME ||
    str === APP_STATE_OBJECT_STORE_NAME
  ) {
    return true;
  }

  return false;
}

export type ServerError = NoSuchStore | IncorrectPayload;

export type NoSuchStore = {
  kind: "NoSuchStore";
};

export function NoSuchStore(): NoSuchStore {
  return {
    kind: "NoSuchStore",
  };
}
export type IncorrectPayload = {
  kind: "IncorrectPayload";
};

export function IncorrectPayload(): IncorrectPayload {
  return {
    kind: "IncorrectPayload",
  };
}