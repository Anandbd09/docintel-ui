import axios from "axios";

// export const API_BASE = "http://localhost:8080";
export const API_BASE = "";

export const api = axios.create({
  baseURL: API_BASE,
});

// Add token to all requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface DocumentItem {
  id: string;
  name: string;
  contentType: string;
  size: number;
  status: string;
  createdOn: string;
  updatedOn: string;
  tags?: string[];
  progress?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  email: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  question: string;
  answer: string;
  timestamp: string;
  documentsQueried: string;
}
export interface DocumentItem {
  id: string;
  name: string;
  contentType: string;
  size: number;
  status: string;
  createdOn: string;
  updatedOn: string;
   tags?: string[];
}
export interface CrossSearchResponse {
  answer: string;
  documentMatches: {
    docId: string;
    docName: string;
    relevantChunks: string[];
  }[];
}

export interface QueryResponse {
  answer: string;
  sources: string[];
}

export const uploadDocument = (file: File, userId: string, onProgress?: (p: number) => void) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("userId", userId);
  return api.post("/api/documents", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (e.total && onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
};

export const listDocuments = (userId: string) =>
  api.get<DocumentItem[]>(`/api/documents/${userId}`);

export const getDocumentStatus = (userId: string, documentId: string) =>
  api.get<DocumentItem>(`/api/documents/${userId}/${documentId}/status`);

export const queryDocument = (userId: string, docId: string, question: string) =>
  api.post<QueryResponse>(`/api/query`, { userId, docId, question });

export const summarizeDocument = (userId: string, docId: string) =>
  api.post<QueryResponse>(`/api/query/summarize`, { userId, docId });

export const crossSearchDocuments = (userId: string, question: string) =>
  api.post<CrossSearchResponse>(`/api/query/search`, { userId, question });

export const compareDocuments = (userId: string, docId1: string, docId2: string, question: string) =>
  api.post<QueryResponse>(`/api/query/compare`, { userId, docId1, docId2, question });

export const getAuditLogs = (userId: string) =>
  api.get<AuditLog[]>(`/api/audit/${userId}`);


export const register = (name: string, email: string, password: string) =>
  api.post<AuthResponse>("/api/auth/register", { name, email, password });

export const login = (email: string, password: string) =>
  api.post<AuthResponse>("/api/auth/login", { email, password });

export const getQueryHistory = (userId: string, docId: string) =>
  api.get<string[]>(`/api/query/history/${userId}/${docId}`);