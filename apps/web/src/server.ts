import { paraglideMiddleware } from "@repo/i18n";
import handler from "@tanstack/react-start/server-entry";
export default {
  fetch(req: Request): Promise<Response> {
    return paraglideMiddleware(req, () => handler.fetch(req));
  },
};
