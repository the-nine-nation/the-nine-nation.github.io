import { getChatGPTUser } from "../chatgpt-auth";
import { JourneyClient } from "./JourneyClient";

export const dynamic = "force-dynamic";

export default async function JourneyPage() {
  const user = await getChatGPTUser();
  return <JourneyClient signedIn={Boolean(user)} />;
}
