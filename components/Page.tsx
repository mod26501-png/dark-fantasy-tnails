import React from "react";

interface PageProps {
  children: React.ReactNode;
  footerLeft: string;
  footerRight: string;
  className?: string;
}

export const Page: React.FC<PageProps> = (
  { children, footerLeft, footerRight, className = "" },
) => {
  return (
    <section
      className={`bg-white border border-black/10 shadow-lg p-10 md:py-16 md:px-20 mb-6 mx-auto max-w-[51rem] relative print:shadow-none print:border-gray-300 print:break-after-page ${className}`}
    >
      {children}
      <div className="footer absolute bottom-10 left-12 right-12 md:bottom-12 md:left-20 md:right-20 text-[#70757e] flex justify-between text-xs font-medium print:bottom-8">
        <span>{footerLeft}</span>
        <span>{footerRight}</span>
      </div>
    </section>
  );
};
