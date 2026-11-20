"use client";

import React, { forwardRef } from "react";

export interface GuestbookFieldProps {
  id: string;
  label: string;
  sublabel?: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  isTextarea?: boolean;
  rows?: number;
  className?: string;
  error?: string;
}

export const GuestbookField = forwardRef<HTMLInputElement & HTMLTextAreaElement, GuestbookFieldProps>(
  (
    {
      id,
      label,
      sublabel,
      type = "text",
      value,
      placeholder,
      onChange,
      onKeyDown,
      required = false,
      isTextarea = false,
      rows = 3,
      className = "",
      error,
    },
    ref
  ) => {
    return (
      <div className={`space-y-3 ${className}`}>
        <label htmlFor={id} className="block space-y-1">
          <span className="text-xl sm:text-2xl font-serif font-normal text-[#FAF5ED] block">
            {label}
            {required && <span className="text-[#C79347] ml-1.5">*</span>}
          </span>
          {sublabel && (
            <span className="text-sm font-sans text-[#CBBBA8] block leading-relaxed">
              {sublabel}
            </span>
          )}
        </label>

        <div className="relative">
          {isTextarea ? (
            <textarea
              id={id}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              rows={rows}
              value={value}
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              className="w-full bg-transparent border-b-2 border-[rgba(212,163,106,0.25)] focus:border-[#C79347] py-3 text-lg sm:text-xl font-sans text-[#FAF5ED] placeholder:text-[#FAF5ED]/30 focus:outline-none transition-colors duration-200 resize-none leading-relaxed"
            />
          ) : (
            <input
              id={id}
              ref={ref as React.Ref<HTMLInputElement>}
              type={type}
              value={value}
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              className="w-full bg-transparent border-b-2 border-[rgba(212,163,106,0.25)] focus:border-[#C79347] py-3 text-xl sm:text-2xl font-sans text-[#FAF5ED] placeholder:text-[#FAF5ED]/30 focus:outline-none transition-colors duration-200"
            />
          )}

          {error && (
            <p className="mt-2 text-sm font-sans text-[#E06D58] font-medium animate-fadeIn">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

GuestbookField.displayName = "GuestbookField";
