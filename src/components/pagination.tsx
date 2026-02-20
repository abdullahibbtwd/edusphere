"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  // Ensure we have valid numbers
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  const validTotalPages = Math.max(1, totalPages);

  // Don't render if there's only one page or no pages
  if (validTotalPages <= 1) {
    return null;
  }

  // Show at most 5 page numbers at a time
  const getVisiblePages = () => {
    if (validTotalPages <= 5) {
      return Array.from({ length: validTotalPages }, (_, i) => i + 1);
    }
    
    const start = Math.max(1, validCurrentPage - 2);
    const end = Math.min(validTotalPages, start + 4);
    
    if (end - start < 4) {
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    
    return Array.from({ length: 5 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className='p-4 flex items-center justify-between text-gray-500'>
      <button 
        onClick={() => onPageChange(validCurrentPage - 1)}
        disabled={validCurrentPage === 1}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-45 disabled:cursor-not-allowed hover:bg-slate-300"
      >
        prev
      </button>
      <div className="flex items-center gap-2 text-sm">
        {visiblePages.map((page) => (
          <button
            key={`page-${page}`}
            onClick={() => onPageChange(page)}
            className={`px-2 rounded-sm ${
              validCurrentPage === page ? 'bg-[#C3EBFA]' : 'hover:bg-slate-100'
            }`}
          >
            {page}
          </button>
        ))}
        {validTotalPages > 5 && validCurrentPage < validTotalPages - 2 && (
          <>
            <span key="ellipsis">...</span>
            <button
              key={`page-${validTotalPages}`}
              onClick={() => onPageChange(validTotalPages)}
              className="px-2 rounded-sm hover:bg-slate-100"
            >
              {validTotalPages}
            </button>
          </>
        )}
      </div>
      <button 
        onClick={() => onPageChange(validCurrentPage + 1)}
        disabled={validCurrentPage === validTotalPages}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-45 disabled:cursor-not-allowed hover:bg-slate-300"
      >
        next
      </button>
    </div>
  );
};

export default Pagination;