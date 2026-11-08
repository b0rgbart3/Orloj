import { useEffect } from "react";
import "./LearnPage.css";
import { DEEP_DIVE_TOPICS } from "./learn/topics";

type LearnPageProps = {
  slug: string;
};

export function LearnPage({ slug }: LearnPageProps) {
  const topic = DEEP_DIVE_TOPICS[slug];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (!topic) {
    return (
      <article className="learn-page">
        <a className="learn-page-back" href="#home">
          ← Back to the clock
        </a>
        <h2 className="learn-page-title">Topic not found</h2>
        <p>There's no deep-dive page at this link yet.</p>
      </article>
    );
  }

  return (
    <article className="learn-page">
      <a className="learn-page-back" href="#home">
        ← Back to the clock
      </a>
      <h2 className="learn-page-title">{topic.title}</h2>
      <p className="learn-page-dek">{topic.dek}</p>
      <div className="learn-page-body">
        <topic.Content />
      </div>
    </article>
  );
}
