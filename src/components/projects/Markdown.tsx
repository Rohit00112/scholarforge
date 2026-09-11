import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="max-w-none text-[0.9375rem] leading-relaxed text-muted">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="font-display text-2xl font-medium tracking-tight text-paper" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="font-display text-xl font-medium tracking-tight text-paper" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="font-display text-lg font-medium tracking-tight text-paper" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="font-display text-base font-medium tracking-tight text-paper" {...props} />
          ),
          p: ({ node, ...props }) => <p className="my-4 text-[0.9375rem] leading-relaxed text-muted" {...props} />,
          a: ({ node, ...props }) => (
            <a className="text-brass underline-offset-4 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          ul: ({ node, ...props }) => <ul className="my-4 list-disc space-y-1.5 pl-6" {...props} />,
          ol: ({ node, ...props }) => <ol className="my-4 list-decimal space-y-1.5 pl-6" {...props} />,
          li: ({ node, ...props }) => <li className="text-[0.9375rem] leading-relaxed text-muted" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="my-4 border-l-2 border-brass/40 pl-4 italic text-muted" {...props} />
          ),
          hr: ({ node, ...props }) => <hr className="my-6 border-line" {...props} />,
          code: ({ node, ...props }) => (
            <code className="rounded border border-line bg-ink-800 px-1.5 py-0.5 font-mono text-[0.8125rem] text-brass" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="my-4 overflow-x-auto rounded-lg border border-line bg-ink-950 p-4 font-mono text-[0.8125rem] leading-relaxed text-paper" {...props} />
          ),
          img: ({ node, alt, ...props }) => <img className="my-4 rounded-lg border border-line" alt={alt ?? ""} {...props} />,
          table: ({ node, ...props }) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border border-line bg-ink-800 px-3 py-2 text-left font-medium text-paper" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-line px-3 py-2 text-muted" {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}