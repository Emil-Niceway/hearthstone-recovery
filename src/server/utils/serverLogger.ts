type LogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "matchmaking"
  | "game"
  | "network";

const PREFIX = {
  debug: "🔍",
  info: "ℹ️",
  warn: "⚠️",
  error: "❌",
  matchmaking: "🎮",
  game: "⚔️",
  network: "🌐",
} as const;

const COLORS = {
  debug: "\x1b[90m", // Gray
  info: "\x1b[36m", // Cyan
  warn: "\x1b[33m", // Yellow
  error: "\x1b[31m", // Red
  matchmaking: "\x1b[35m", // Magenta
  game: "\x1b[32m", // Green
  network: "\x1b[34m", // Blue
  reset: "\x1b[0m", // Reset
} as const;

export class ServerLogger {
  private isDevelopment = process.env.NODE_ENV !== "production";

  private colorize(color: string, text: string): string {
    return `${color}${text}${COLORS.reset}`;
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.isDevelopment) return;

    const prefix = PREFIX[level];
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    const color = COLORS[level];

    const logMessage = `${prefix} [${timestamp}] ${message}`;

    console.log(this.colorize(color, logMessage));
    if (data)
      console.log(this.colorize(COLORS.debug, JSON.stringify(data, null, 2)));
  }

  debug(message: string, data?: any) {
    this.log("debug", message, data);
  }

  info(message: string, data?: any) {
    this.log("info", message, data);
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data);
  }

  error(message: string, data?: any) {
    this.log("error", message, data);
  }

  matchmaking(message: string, data?: any) {
    this.log("matchmaking", message, data);
  }

  game(message: string, data?: any) {
    this.log("game", message, data);
  }

  network(message: string, data?: any) {
    this.log("network", message, data);
  }
}
