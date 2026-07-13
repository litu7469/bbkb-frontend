export interface DocumentBase {
  id:               string;
  title_en:         string;
  title_bn:         string | null;
  circular_ref:     string | null;
  issuing_body:     string;
  department:       string | null;
  issue_date:       string;
  status:           string;
  primary_url:      string;
  category_primary: string | null;
  topic_tags:       string[] | null;
}

export interface SearchDocument extends DocumentBase {
  summary_en?: string | null;
  similarity?: number;
  _source?:    string;
}

export interface LibraryDocument extends DocumentBase {
  language: string | null;
}

export interface RecentDoc {
  id:           string;
  title_en:     string;
  circular_ref: string | null;
  issuing_body: string;
  department:   string | null;
  issue_date:   string;
  primary_url:  string;
  topic_tags:   string[] | null;
}

export interface Citation {
  document_id:  string;
  title_en:     string;
  title_bn:     string | null;
  circular_ref: string | null;
  issuing_body: string;
  issue_date:   string;
  primary_url:  string;
  status:       string;
  language:     string | null;
}

export interface SearchResult {
  items:          SearchDocument[];
  total:          number;
  semantic_count: number;
  keyword_count:  number;
  query:          string;
  mode:           string;
}

export interface QueryResult {
  answer:                  string;
  citations:               Citation[];
  model_used:              string;
  latency_ms:              number;
  query_language:          string;
  disclaimer:              string;
  has_superseded_citation: boolean;
}

export type SearchMode = 'hybrid' | 'semantic' | 'keyword';
export type Language = 'auto' | 'en' | 'bn';
