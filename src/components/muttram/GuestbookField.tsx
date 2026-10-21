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
          <span className="text-xl sm:text-2xl font-serif font-normal text-[#2A2825] block">
            {label}
            {required && <span className="text-[#B85C38] ml-1.5">*</span>}
          </span>
          {sublabel && (
            <span className="text-sm font-sans text-[#57524C] block leading-relaxed">
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
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              className="w-full bg-transparent border-b-2 border-[#2A2825]/15 focus:border-[#B85C38] focus:bg-[#2A2825]/[0.02] py-3 px-2 -ml-2 text-lg sm:text-xl font-sans text-[#2A2825] placeholder:text-[#2A2825]/30 focus:outline-none transition-colors duration-200 resize-none leading-relaxed"
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
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              className="w-full bg-transparent border-b-2 border-[#2A2825]/15 focus:border-[#B85C38] focus:bg-[#2A2825]/[0.02] py-3 px-2 -ml-2 text-xl sm:text-2xl font-sans text-[#2A2825] placeholder:text-[#2A2825]/30 focus:outline-none transition-colors duration-200"
            />
          )}

          {error && (
            <p id={`${id}-error`} className="mt-2 text-sm font-sans text-[#B85C38] font-medium animate-fadeIn">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

GuestbookField.displayName = "GuestbookField";
