import { redirect } from "next/navigation";

export const metadata = {
  title: "Redirecting to StackBuilder AI",
  description: "This legacy route redirects to the StackBuilder AI tools directory.",
};

export default function SourcersVaultPage() {
  redirect("/tools");
}
