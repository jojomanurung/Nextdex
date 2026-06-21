import { ReactNode } from "react";

export type CardProps = {
  children: ReactNode;
};

export function Card({ children }: CardProps) {
  return (
    <div className="relative rounded-xl h-full px-4 py-4 lg:px-16 lg:py-8 shadow-md bg-slate-50/5 backdrop-blur-sm border border-white/5">
      {children}
    </div>
  );
}
