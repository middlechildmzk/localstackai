import { EmailCapture } from "@/components/learn/ArticleBlocks";

export default function AlternativesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div className="bg-[#0a0a0f] px-4 pb-16">
        <EmailCapture variant="general" />
      </div>
    </>
  );
}
