/**
 * Shared Utility Types
 * Common utility types used across the application
 */

// Generic callback function type
export type Callback<T = void> = (value: T) => void;

// Async callback function type
export type AsyncCallback<T = void> = (value: T) => Promise<void>;

// Optional properties utility type
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Required properties utility type
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Deep partial utility type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Deep readonly utility type
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Nullable type
export type Nullable<T> = T | null;

// Maybe type (nullable or undefined)
export type Maybe<T> = T | null | undefined;

// Non-empty array type
export type NonEmptyArray<T> = [T, ...T[]];

// String literal union helper
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;

// Extract function parameters
export type Parameters<T extends (...args: any[]) => any> = T extends (...args: infer P) => any
  ? P
  : never;

// Extract function return type
export type ReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R
  ? R
  : any;

// Branded types for type safety
export type Brand<T, B> = T & { __brand: B };

// ID types
export type UserId = Brand<string, "UserId">;
export type QRId = Brand<string, "QRId">;
export type SessionId = Brand<string, "SessionId">;

// Timestamp types
export type Timestamp = Brand<number, "Timestamp">;
export type ISODateString = Brand<string, "ISODateString">;

// URL types
export type URL = Brand<string, "URL">;
export type DataURL = Brand<string, "DataURL">;

// File size in bytes
export type FileSize = Brand<number, "FileSize">;

// Color hex string
export type HexColor = Brand<string, "HexColor">;

// Phone number string
export type PhoneNumber = Brand<string, "PhoneNumber">;

// Email address string
export type EmailAddress = Brand<string, "EmailAddress">;
