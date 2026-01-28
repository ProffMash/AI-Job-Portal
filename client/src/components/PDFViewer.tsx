import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  src: string;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ src, className }) => {
  const normalizePdfUrl = (url?: string) => {
    if (!url) return url;
    try {
      const lower = url.toLowerCase();
      if (lower.endsWith('.pdf')) {
        if (url.includes('/image/upload/')) return url.replace('/image/upload/', '/raw/upload/');
        return url;
      }

      const cloudinaryRegex = /https?:\/\/res\.cloudinary\.com\/[^\/]+\/(image|raw)\/upload\//i;
      if (cloudinaryRegex.test(url)) {
        const rawUrl = url.replace(/\/image\/upload\//i, '/raw/upload/');
        // If last path segment has no extension, append .pdf
        const lastSegment = rawUrl.split('/').pop() || '';
        if (!/\.[a-z0-9]+$/i.test(lastSegment)) {
          return `${rawUrl}.pdf`;
        }
        return rawUrl;
      }
    } catch (e) {
      // ignore and return original
    }
    return url;
  };

  const normalizedSrc = normalizePdfUrl(src);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-2">
        <button
          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
          onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
          disabled={pageNumber <= 1}
        >
          Prev
        </button>

        <span className="text-sm text-gray-700 dark:text-gray-300">
          {pageNumber} {numPages ? `of ${numPages}` : ''}
        </span>

        <button
          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
          onClick={() => setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p + 1))}
          disabled={numPages ? pageNumber >= numPages : true}
        >
          Next
        </button>

        <a className="ml-auto text-sm text-blue-600" href={normalizedSrc} target="_blank" rel="noreferrer" download>
          Open / Download
        </a>
      </div>

      <div className="border rounded overflow-hidden">
        <Document file={normalizedSrc} onLoadSuccess={onDocumentLoadSuccess} loading={<div className="p-6">Loading document…</div>}>
          <Page pageNumber={pageNumber} />
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
