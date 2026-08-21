import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ComponentProps } from 'react'

const markdownComponents: ComponentProps<typeof ReactMarkdown>['components'] = {
  h1: (props) => <h2 className="text-lg font-bold text-slate-900 mt-4 mb-2 first:mt-0" {...props} />,
  h2: (props) => <h3 className="text-base font-bold text-slate-900 mt-4 mb-2 first:mt-0" {...props} />,
  h3: (props) => <h4 className="text-sm font-bold text-slate-900 mt-3 mb-1 first:mt-0" {...props} />,
  p: (props) => <p className="text-sm text-slate-700 leading-relaxed mb-2" {...props} />,
  strong: (props) => <strong className="font-semibold text-slate-900" {...props} />,
  ul: (props) => <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 mb-3" {...props} />,
  ol: (props) => <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-700 mb-3" {...props} />,
  li: (props) => <li {...props} />,
  code: (props) => <code className="bg-slate-100 rounded px-1 py-0.5 text-xs font-mono text-slate-800" {...props} />,
  pre: (props) => <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto text-xs my-3" {...props} />,
  hr: () => <hr className="my-4 border-slate-200" />,
  table: (props) => (
    <div className="overflow-x-auto mb-3">
      <table className="min-w-full text-sm border border-slate-200" {...props} />
    </div>
  ),
  th: (props) => (
    <th className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold" {...props} />
  ),
  td: (props) => <td className="border border-slate-200 px-2 py-1" {...props} />,
}

export default function MarkdownAnswer({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  )
}
