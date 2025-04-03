type ParserSuccessOutput = {
  completed: true;
  files: string[];
}

type ParserErrorOutput = {
  completed: false;
  error: string;
}

export type ParserOutput = ParserSuccessOutput | ParserErrorOutput;

export type CommitFile = {
  additions: number;
  blob_url: string;
  changes: number;
  contents_url: string;
  deletions: number;
  filename: string;
  patch?: string;
  previous_filename?: string;
  raw_url: string;
  sha: string;
  status: string;
};
