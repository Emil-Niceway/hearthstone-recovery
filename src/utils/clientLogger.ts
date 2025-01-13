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

export class ClientLogger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.isDevelopment) return;

    const prefix = PREFIX[level];
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];

    const styles = {
      debug: "color: gray",
      info: "color: cyan",
      warn: "color: orange",
      error: "color: red",
      matchmaking: "color: magenta",
      game: "color: lime",
      network: "color: blue",
    };

    console.log(`%c${prefix} [${timestamp}] ${message}`, styles[level]);
    if (data) console.log(data);
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
